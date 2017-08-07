const express = require('express');
const router = express.Router();
const Fact = require.main.require('./app/models/fact');
const User = require.main.require('./app/models/user');
const Upvote = require.main.require('./app/models/upvote');
const Message = require.main.require('./app/models/message');
const Recipient = require.main.require('./app/models/recipient');
const FactService = require.main.require('./app/services/fact.service');
const apiai = require('apiai-promise');
const keys = require.main.require('./app/config/keys');
const catbot = apiai(keys.apiai.accessToken);
const strings = require.main.require('./app/config/strings.js');
const Promise = require('bluebird');

// (Tasker route) Text was recieved from recipient, process it and respond
router.get('/text', function(req, res) {
	
	if (!req.query.query) return error({}, "No text query provided");
	if (!req.query.number) return error({}, "No phone number provided");
	
	const io = req.app.get('socketio');
	
	var overrideMessage;
	
	Recipient.findOneWithDeleted({number: req.query.number})
	
	.then(function(recipient) {
		
		var promises = {};
		
		if (recipient) {
			
			if (recipient.deleted) {
				recipient.restore();
				overrideMessage = "Welcome back!";
			}
			
			const incoming = new Message({
				text: req.query.query,
				number: req.query.number,
				type: 'incoming'
			});
			
			promises.recipient = recipient;
			promises.message = incoming.save();
			promises.catFact = FactService.getFact();
			promises.catbotResponse = catbot.textRequest(req.query.query, {
				sessionId: req.query.number
			});
		} else {
			
			var newRecipient = new Recipient({
				name: req.query.name,
				number: req.query.number.replace(/\D/g,'').replace(/^1+/, '')
			});
			
			promises.recipient = newRecipient.save();
	
		}
		
		return Promise.props(promises);
	})
	
	.then(function(result) {
		
		var response;
	
		if (result.message) {
			if (result.catbotResponse.result && result.catbotResponse.result.fulfillment.speech) {
				response = result.catbotResponse.result.fulfillment.speech;
			} else {
				response = result.catFact;
			}
		} else {
			response = strings.welcomeMessage;
		}
		
		const outgoing = new Message({text: overrideMessage || response, number: req.query.number, type: 'outgoing'});
							
		outgoing.save().then(function(message) {
			io.emit('message', {message: message, recipient: result.recipient});
			
			return success(message);
		});
	})
	
	.catch(function(err) {
		return error(err.message || null);
	});
	
	function success(message) {
		res.status(200).json({
			response: message,
			delay: computeTypingDelay(message.text),
			number: req.query.number
		});
	}
	
	function error(error, message) {
		error.message = message;
		res.status(400).json(error);
	}
	
	function computeTypingDelay(string) {
		var delay = 0;
		delay += (string.length / 2);
		delay += Math.round(Math.random() * 10) * (Math.random() < 0.05 ? -1 : 1);
		return Math.abs(delay) + 2;
	}
});

// Get simple fact fact
router.get('/', function(req, res) {
	FactService.getFact().then(function(message) {
		return res.json({
			displayText: message
		});
	});
});

// Get submitted facts
router.get('/submitted', function(req, res) {
	Fact.aggregate([
		{$match: {used: false, source: 'user'}},
		{$lookup: {
			from: 'users',
			localField: 'user',
			foreignField: '_id',
			as: 'user'
		}},
		{$project: {
			text: 1,
			user: { $arrayElemAt: ['$user', 0], }
		}},
		{$lookup: {
			from: 'upvotes',
			localField: '_id',
			foreignField: 'fact',
			as: 'upvotes'
		}},
		{$project: {
			text: 1,
			user: { _id: 1, name: 1 },
			upvotes: { user: 1 },
		}}
	]).then(function(data) {
		return res.status(200).json(data);
	}, function(err) {
        return res.status(400).json(err);
	});
});

// Submit a fact
router.post('/submitted', function(req, res) {
    if (req.user) {
        if (!req.body.text) return res.status(400).json({message: "Provide a cat fact"});
        
        const io = req.app.get('socketio');
        
        const fact = new Fact({
            user: req.user._id,
            text: req.body.text
        });
        
        fact.save()
        .then(function(fact) {
        	return User.populate(fact, {path: 'user', select: 'name'});
        })
        .then(function(fact) {
        	io.emit('fact', fact);
            return res.status(200).json(fact);
        })
        .catch(function(err) {
            return res.status(400).json(err);
        });
    } else {
        return res.status(401).json({message: strings.unauthenticated});
    }
});

// Upvote a fact
router.post('/submitted/:factID/upvote', function(req, res) {
    if (req.user) {
        if (!req.params.factID) return res.status(400).json({message: "Provide a fact ID"});
        
        Fact.findById(req.params.factID)
		.then(function(fact) {
        	if (!fact) return res.status(404).json({message: "That fact doesn't exist"});
        	if (fact.user.equals(req.user._id)) return  res.status(400).json({message: "You can't upvote your own fact"});
        
        	const io = req.app.get('socketio');
        
			const upvote = new Upvote({
				user: req.user._id,
				fact: req.params.factID
			});
			
			return upvote.save().then(function() {
				io.emit('fact:upvote', {fact: fact, user: req.user});
			});
        })
        
        .then(function(upvote) {
            return res.status(201).send();
        }, function(err) {
            return res.status(400).json(err);
        });
    } else {
    	return res.status(401).json({message: strings.unauthenticated});
    }
});

// Unvote (un-upvote) a fact
router.delete('/submitted/:factID/upvote', function(req, res) {
	if (req.user) {
        if (!req.params.factID) return res.status(400).json({message: "Provide a fact ID"});
        
        const io = req.app.get('socketio');
        
        Upvote.findOneAndRemove({fact: req.params.factID, user: req.user._id}).then(function() {
        	io.emit('fact:unvote', {fact: {_id: req.params.factID}, user: req.user});
        	
        	return res.status(204).send();
        }, function(err) {
        	return res.stauts(400).json(err);
        });
	} else {
    	return res.status(401).json({message: strings.unauthenticated});
    }
});

module.exports = router;