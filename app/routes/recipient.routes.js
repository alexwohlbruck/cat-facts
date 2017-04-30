var express = require('express');
var router = express.Router();
var bluebird = require('bluebird');
var keys = require.main.require('./app/config/keys');
var strings = require.main.require('./app/config/strings.js');

var Recipient = require.main.require('./app/models/recipient');
var Message = require.main.require('./app/models/message');
var Fact = require.main.require('./app/models/fact');
var Upvote = require.main.require('./app/models/upvote');

var FactService = require.main.require('./app/services/fact.service');
var IFTTTService = require.main.require('./app/services/ifttt.service.js');

// (Tasker route) Get all recipients and a fact to be sent out each day
router.get('/', function(req, res) {
	if (req.query && req.query.code == keys.dbPassword) {
		var io = req.app.get('socketio'), snowball = {};
		
		bluebird.all([
			FactService.getFact(),
			Recipient.find(),
			Upvote.aggregate([
				{$group: {_id: '$fact', upvotes: {$sum: 1}}},
				{$sort: {upvotes: -1}},
				{$lookup: {
			        from: 'facts',
			        localField: '_id',
			        foreignField: '_id',
			        as: 'fact'
			    }},
				{$unwind: '$fact'},
				{$match: {'fact.used': false}},
				{$limit: 1}
			])
		])
		.spread(function(fact, recipients, highestUpvotedFact) {
			highestUpvotedFact = highestUpvotedFact[0];
			snowball.fact = (highestUpvotedFact && highestUpvotedFact.upvotes > 0) ? highestUpvotedFact.fact.text : fact;
			snowball.recipients = recipients;
				
			var messages = recipients.map(function(o, i) {
				io.emit('message', {message: fact, recipient: o});
				return new Message({text: fact, number: o.number, type: 'outgoing'});
			});
			
			return Promise.all([
				Message.create(messages),
				Fact.update({_id: highestUpvotedFact ? highestUpvotedFact.fact._id : null}, {used: true})
			]);	
		})
		.then(function() {
			return res.status(200).json({
				fact: snowball.fact,
				recipients: snowball.recipients.map(o => o.number)
			});
		})
		.catch(function(err) {
			console.log(err);
			return res.status(400).json(err);
		});
	} else {
		return res.status(400).json({message: "Provide the code to recieve recipients"});
	}
});

// Get user's recipients
router.get('/me', function(req, res) {
	if (req.user) {
		Recipient.find({addedBy: req.user._id}).sort('name').then(function(recipients) {
			return res.status(200).json(recipients);
		}, function(err) {
			return res.status(400).json(err);
		});
	} else {
		return res.status(401).json({message: strings.unauthenticated});
	}
});

// Add new recipient(s)
router.post('/', function(req, res) {
	if (req.user) {
		var io = req.app.get('socketio');
		
		if (Array.isArray(req.body)) {
			
			// Submit multiple recipients
			
			var contacts = req.body.map(o => {
				o.addedBy = req.user._id;
				return o;
			});
			
			Recipient.create(contacts, function(err, recipients) {
				
				if (err) {
					console.log(err);
					if (err.writeErrors) err.message = err.writeErrors.length + ' ' + (err.writeErrors.length == 1 ? 'contact' : 'contacts') + ' failed to submit';
					return res.status(400).json(err);
				}
				
				for (var i = 0; i < recipients.length; i++) {
					io.emit('message', {message: strings.welcomeMessage, recipient: recipients[i]});
					IFTTTService.sendSingleMessage({number: recipients[i].number, message: strings.welcomeMessage});
				}
				
				console.log(recipients);
				
				return res.status(200).json({
					addedRecipients: recipients
				});
			});
			
		} else {
			
			// Submit one recipient
			
			var newRecipient = new Recipient({
				name: req.body.name,
				number: req.body.number.replace(/\D/g,'').replace(/^1+/, ''),
				addedBy: req.user._id
			});
			
			newRecipient.save().then(function(recipient) {
				io.emit('message', {message: strings.welcomeMessage, recipient: recipient});
				IFTTTService.sendSingleMessage({number: recipient.number, message: strings.welcomeMessage});
				
				return res.status(200).json(recipient);
			}, function(err) {
				return res.status(400).json(err);
			});
		}
	} else {
		return res.status(401).json({message: strings.unauthenticated});
	}
});

module.exports = router;