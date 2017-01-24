// School routes - /api/school/...
var express = require('express');
var router = express.Router();
var keys = require.main.require('./app/config/keys');
var Recipient = require.main.require('./app/models/recipient');
var FactService = require.main.require('./app/services/fact.service');

router.get('/', function(req, res) {
	if (req.query && req.query.code == keys.dbPassword) {
		Recipient.find().then(function(recipients) {
			FactService.getFact(function(fact) {
				return res.status(200).json({
					fact: fact,
					recipients: recipients
				});
			});
		}, function(err) {
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
		return res.status(401).json({message: "Sign in first"});
	}
});

router.post('/', function(req, res) {
	console.log(req.body);
	if (req.user) {
		var newRecipient = new Recipient({
			name: req.body.name,
			number: req.body.number.replace(/\D/g,'').replace(/^1+/, ''),
			addedBy: req.user._id
		});
		
		newRecipient.save().then(function(recipient) {
			return res.status(200).json(recipient);
		}, function(err) {
			return res.status(400).json(err);
		});
	} else {
		return res.status(401).json({message: "Sign in first"});
	}
});

module.exports = router;