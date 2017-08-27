const express = require('express');
const router = express.Router();
const Promise = require('bluebird');

const apiai = require('apiai-promise');
const keys = require.main.require('./app/config/keys');
const catbot = apiai(keys.apiai.accessToken);
const strings = require.main.require('./app/config/strings.js');
const FactService = require.main.require('./app/services/fact.service');

const Fact = require.main.require('./app/models/fact');
const Message = require.main.require('./app/models/message');
const Recipient = require.main.require('./app/models/recipient');
const Upvote = require.main.require('./app/models/upvote');

// Get all recipients and a fact to be sent out each day
router.get('/daily', function(req, res) {
	if (req.query && req.query.code == keys.generalAccessToken) {
		var io = req.app.get('socketio'), snowball = {};
		
		const todayStart = new Date(); todayStart.setHours(0,0,0,0);
		const todayEnd	 = new Date(); todayEnd.setHours(23,59,59,999);
		
		Promise.all([
			Fact.findOne({sendDate: {$gte: todayStart, $lte: todayEnd}}),
			FactService.getFact({setUsed: true}),
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
		.spread(function(overrideFact, fact, recipients, highestUpvotedFact) {
			
			highestUpvotedFact = highestUpvotedFact[0];
			
			snowball.fact = (highestUpvotedFact && highestUpvotedFact.upvotes > 0) ? highestUpvotedFact.fact.text : fact;
			snowball.recipients = recipients;
			
			if (overrideFact) {
				snowball.fact = overrideFact.text;
				overrideFact.used = true;
				overrideFact.save().then((overrideFact) => overrideFact.delete());
			}
				
			var messages = recipients.map(function(o, i) {
				io.emit('message', {message: snowball.fact, recipient: o});
				return new Message({text: snowball.fact, number: o.number, type: 'outgoing'});
			});
			
			var usedFactId = overrideFact ? overrideFact.id : (highestUpvotedFact ? highestUpvotedFact.id : null);
			
			return Promise.all([
				Message.create(messages),
				Fact.update({_id: usedFactId}, {used: true})
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

// Text was recieved from recipient, process it and respond
router.post('/message', function(req, res) {
	
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
		console.log({
			response: message,
			delay: computeTypingDelay(message.text),
			number: req.query.number
		})
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

module.exports = router;