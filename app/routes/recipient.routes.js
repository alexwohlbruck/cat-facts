var express = require('express');
var router = express.Router();
var keys = require.main.require('./app/config/keys');
var Recipient = require.main.require('./app/models/recipient');
var Message = require.main.require('./app/models/message');
var Fact = require.main.require('./app/models/fact');
var Upvote = require.main.require('./app/models/upvote');
var FactService = require.main.require('./app/services/fact.service');
var IFTTTService = require.main.require('./app/services/ifttt.service.js');
var strings = require.main.require('./app/config/strings.js');
var Q = require('q');

router.get('/', function(req, res) {
	if (req.query && req.query.code == keys.dbPassword) {
		var io = req.app.get('socketio'), snowball = {};
		
		Q.all([
			FactService.getFact(),
			Recipient.find(),
			Upvote.aggregate([
				{$group: {_id: '$_id', fact: {$first: '$fact'}, upvotes: {$sum: 1}}},
				{$sort: {upvotes: -1}},
				{$lookup: {
	                from: 'facts',
	                localField: 'fact',
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
				Fact.update({_id: highestUpvotedFact.fact._id}, {used: true})
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

router.post('/', function(req, res) {
	if (req.user) {
		var io = req.app.get('socketio');
		
		var newRecipient = new Recipient({
			name: req.body.name,
			number: req.body.number.replace(/\D/g,'').replace(/^1+/, ''),
			addedBy: req.user._id
		});
		
		var welcomeMessage = new Message({
			text: strings.welcomeMessage,
			number: req.body.number,
			type: 'outgoing'
		});
		
		Promise.all([
			newRecipient.save(),
			welcomeMessage.save()
		])
		.then(function(results) {
			io.emit('message', {message: results[1].text, recipient: results[0]});
			IFTTTService.sendSingleMessage({number: results[0].number, message: strings.welcomeMessage});
			
			return res.status(200).json(results[0]);
		}, function(err) {
			return res.status(400).json(err);
		});
	} else {
		return res.status(401).json({message: strings.unauthenticated});
	}
});

module.exports = router;