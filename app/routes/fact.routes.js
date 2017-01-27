// School routes - /api/school/...
var express = require('express');
var router = express.Router();
var Recipient = require.main.require('./app/models/recipient');
var Fact = require.main.require('./app/models/fact');
var User = require.main.require('./app/models/user');
var Upvote = require.main.require('./app/models/upvote');
var Message = require.main.require('./app/models/message');
var FactService = require.main.require('./app/services/fact.service');
var apiai = require('apiai');
var catbot = apiai('64bea369650e4de59e7aee3dbb03efdd');

// Request made from tasker when text message is recieved
router.get('/text', function(req, res) {
	if (!req.query.query) return res.status(400).json({"message": "No text query provided"});
	if (!req.query.number) return res.status(400).json({"message": "No phone number provided"});
	
	var io = req.app.get('socketio');
	
	Recipient.findOne({number: req.query.number}).then(function(recipient) {
		if (recipient) {
			var incoming = new Message({text: req.query.query, number: req.query.number, type: 'incoming'});
			incoming.save().then(function(message) {
    			io.emit('message', message);
			
				var request = catbot.textRequest(req.query.query, {
					sessionId: 'UH2fKhXFIvPAx7Us3i2sGdApIIBCiIkgb7IS'
				});
				
				request.on('response', function(response) {
					if (!response.result.fulfillment.speech) {
						FactService.getFact(function(message) {
							var outgoing = new Message({text: message, number: req.query.number, type: 'outgoing'});
							
							outgoing.save().then(function(message) {
    							io.emit('message', message);
    							
								return res.status(200).json({
									response: message
								});
							});
						});
					} else {
						var message = response.result.fulfillment.speech,
							outgoing = new Message({text: message, number: req.query.number, type: 'outgoing'});
						
						outgoing.save().then(function(message) {
    						io.emit('message', message);
							
							return res.status(200).json({
								response: message
							});
						});
					}
				});
				
				request.on('error', function(err) {
					return res.status(400).json(err);
				});
				
				request.end();
			}, function(err) {
				console.log(err);
			});
			
		} else {
			var newRecipient = new Recipient({
				name: req.query.name,
				number: req.query.number.replace(/\D/g,'').replace(/^1+/, '')
			});
			
			newRecipient.save().then(function() {
				return res.status(200).json({
					response: "Thanks for signing up for Cat Facts! You will now receive fun facts about CATS every day! =^.^="
				});
			}, function(err) {
				return res.status(400).json(err);
			});
		}
	}, function(err) {
		return res.status(400).json(err);
	});
});

// Get simple fact fact
router.get('/', function(req, res) {
	FactService.getFact(function(message) {
		return res.json({
			displayText: message
		});
	});
});

// Route for api.ai webhook
router.post('/', function(req, res) {
	FactService.getFact(function(message) {
		return res.json({
			speech: message,
			displayText: message,
			data: {},
			contextOut: [],
			source: "Cat Facts"
		});
	});
});

// Get submitted facts
router.get('/submitted', function(req, res) {
	Fact.aggregate([
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
			upvotes: { user: 1 }
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
        return res.status(401).json({message: "Sign in first"});
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
    	return res.status(401).json({message: "Sign in first"});
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
    	return res.status(401).json({message: "Sign in first"});
    }
});

module.exports = router;