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

var google = require('googleapis');
var googleConfig = require.main.require('./app/config/google');
var googleContacts = google.people('v1');

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

// Add a new recipient
router.post('/', function(req, res) {
	if (req.user) {
		var io = req.app.get('socketio');
		
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
	} else {
		return res.status(401).json({message: strings.unauthenticated});
	}
});

router.get('/contacts', function(req, res) {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	
	console.log('TOKEN 1: '+ req.user.google.accessToken);
	
	var oauth2Client = googleConfig.newOauth2Client({
		accessToken: req.user.google.accessToken,
		refreshToken: req.user.google.refreshToken
	});
	
    googleContacts.people.connections.list({
        auth: oauth2Client,
        resourceName: 'people/me',
        pageSize: 500,
        'requestMask.includeField': ['person.phoneNumbers', 'person.names'],
        sortOrder: 'LAST_MODIFIED_ASCENDING'
    }, function(err, data) {
        if (err) return res.status(err.code || 400).json(err);
        
        /*
         * Reduce Google Contacts result to simple array of {name: '', number: ''}'s
         * First filter out objects without any phone numbers,
         * then rip phone numbers out of their contact's object and make new objects for each one
         */
        if (data.connections) {
        var contacts = data.connections
        	.filter(o => o.phoneNumbers && o.phoneNumbers.length > 0)
        	.map((o, i) => {
	        	if (!o.phoneNumbers) return o;
	        	var contacts = [];
	        	for (var i = 0; i < o.phoneNumbers.length; i++) {
		            contacts.push({
		                name: o.names ? (o.names[0].givenName + ' ' + o.names[0].familyName) : undefined,
		                number: o.phoneNumbers[i].value.replace(/\D/g,'').replace(/^1+/, '')
	            	});
	        	}
	        	return contacts;
	        });
        
        // Flatten array and reverse sort order
        contacts = [].concat.apply([], contacts).reverse();
        
        return res.status(200).json(contacts);
        }
    });
});

module.exports = router;