var express = require('express');
var router = express.Router();
var Fact = require.main.require('./app/models/fact');
var User = require.main.require('./app/models/user');
var Upvote = require.main.require('./app/models/upvote');
var Message = require.main.require('./app/models/message');
var Recipient = require.main.require('./app/models/recipient');
var FactService = require.main.require('./app/services/fact.service');
var apiai = require('apiai-promise');
var catbot = apiai('64bea369650e4de59e7aee3dbb03efdd');
var strings = require.main.require('./app/config/strings.js');
var bluebird = require('bluebird');

// Request made from tasker when text message is recieved
router.get('/text', function(req, res) {
	
	var response, typingTimeout;
	
	if (!req.query.query) return error({}, "No text query provided");
	if (!req.query.number) return error({}, "No phone number provided");
	
	var io = req.app.get('socketio');
	
	Recipient.findOne({number: req.query.number})
	
	.then(function(recipient) {
		
		var promises = {};
		
		if (recipient) {
			
			var incoming = new Message({
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
		
		return bluebird.props(promises);
	})
	
	.then(function(result) {
	
		if (result.message) {
			if (result.catbotResponse.result && result.catbotResponse.result.fulfillment.speech) {
				response = result.catbotResponse.result.fulfillment.speech;
			} else {
				response = result.catFact;
			}
		} else {
			response = strings.welcomeMessage;
		}
		
		var outgoing = new Message({text: response, number: req.query.number, type: 'outgoing'});
							
		outgoing.save().then(function(message) {
			io.emit('message', {message: message, recipient: result.recipient});
			
			return success(message);
		});
	})
	
	.catch(function(error) {
		return error(error.message || null);
	});
	
	function success(message) {
		res.status(200).json({
			response: message
		});
	}
	
	function error(error, message) {
		error.message = message;
		res.status(400).json(error);
	}
});

// Get simple fact fact
router.get('/', function(req, res) {
	FactService.getFact(function(message) {
		return res.json({
			displayText: message
		});
	});
});

// Get submitted facts
router.get('/submitted', function(req, res) {
	Fact.aggregate([
		{$match: {used: false}},
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
        
        var io = req.app.get('socketio');
        
        var fact = new Fact({
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
        
        	var io = req.app.get('socketio');
        
			var upvote = new Upvote({
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
        
        var io = req.app.get('socketio');
        
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