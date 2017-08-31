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
			Recipient.find(),
			Fact.findOne({sendDate: {$gte: todayStart, $lte: todayEnd}}),
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
			]),
			FactService.getFact()
		])
		.spread((recipients, overrideFact, highestUpvotedFact, fact) => {
			
			highestUpvotedFact = highestUpvotedFact[0] ? highestUpvotedFact[0].fact : null;
		
			return new Promise((resolve, reject) => {
		
				const factToSend = overrideFact || highestUpvotedFact || fact;
				
				const messages = recipients.map(r => {
		
					io.emit('message', {
						message: factToSend.text, 
						recipient: r
					});
		
					return new Message({
						text: factToSend.text,
						number: r.number,
						type: 'outgoing'
					});
				});
				
				Message.create(messages);
		
				if (overrideFact) {
					overrideFact.delete();
				}
				
				// .then() must be called for save to work
				Fact.findByIdAndUpdate(factToSend._id, {$set: {used: true}}).then();
		
				resolve({
					fact: factToSend.text,
					recipients: recipients.map(r => r.number)
				});
			});
		})
		.then(function(response) {
			return res.status(200).json(response);
		})
		.catch(function(err) {
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
				response = result.catFact.text;
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

module.exports = router;