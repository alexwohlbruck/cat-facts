const express = require('express');
const router = express.Router();

const { isAuthenticated, isAdmin } = require('../middleware');
const strings = require.main.require('./app/config/strings.js');
const IFTTTService = require.main.require('./app/services/ifttt.service.js');

const Recipient = require.main.require('./app/models/recipient');
const Message = require.main.require('./app/models/message');


// Get all recipients
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
	
	try {
		const animalType = req.query.animal_type ? { $in: req.query.animal_type.split(',') } : { $exists: true };
		
		const recipients = await Recipient.find({
			subscriptions: animalType
		})
		.sort('-createdAt')
		.populate({
			path: 'addedBy',
			select: 'name'
		});
		
		return res.status(200).json(recipients);
	} catch (err) {
		return res.status(400).json(err);
	}
});

// Get user's recipients
router.get('/me', isAuthenticated, async (req, res) => {
	
	const animalType = req.query.animal_type ? req.query.animal_type.split(',') : undefined;
	
	console.log(req.user._id, animalType);
	
	try {
		const recipients = await Recipient.findWithDeleted({
			addedBy: req.user._id,
			subscriptions: {
				$in: animalType
			}
		}).sort('name');
		
		console.log(recipients);
		
		return res.status(200).json(recipients);
	} catch (err) {
		console.error(err);
		return res.status(400).json(err);
	}
});

// Add new recipient(s)
router.post('/', isAuthenticated, async (req, res) => {
	
	const requestedRecipients = req.body.recipients || [req.body.recipient];
	const animalTypes = req.body.animalTypes;
	
	if (!requestedRecipients.length) {
		return res.status(400).json({message: `No recipients provided`});
	}
	
	try {
		const results = await Recipient.addRecipients({
		    authenticatedUser: req.user,
		    requestedRecipients,
		    requestedSubscriptions: animalTypes
		});
		
		return res.status(200).json(results);
	}
	catch (err) {
		return res.status(err.status || 400).json(err);
	}
});

// Restore recipient with new subscriptions
router.patch('/:recipientId/restore', isAuthenticated, async (req, res) => {
	
	const resubscriptions = req.body.resubscriptions;
	
	try {
		await Recipient.restore({_id: req.params.recipientId});
		
		const recipient = await Recipient.findOneAndUpdate({_id: req.params.recipientId}, {
			$set: {
				subscriptions: resubscriptions
			}
		}, {
			new: true
		});
		console.log(recipient);
		
		return res.status(200).json(recipient);
	}
	catch (err) {
		return res.status(err.status || 400).json(err);
	}
});

router.patch('/:recipientId', isAuthenticated, async (req, res) => {

	// TODO: only allow to edit recipient if user isAdmin or is addedBy them
	
	try {
		const recipient = await Recipient.update({_id: req.params.recipientId}, {
			$set: {
				name: req.body.name,
				number: req.body.number
			}
		});
		
		return res.status(200).json(recipient);
	}
	
	catch (err) {
		return res.status(err.statusCode || 400).json(err);
	}
});

router.delete('/', isAuthenticated, async (req, res) => {
	
	const query = {_id: {$in: req.query.recipients}};
	
	const action = req.query.soft == 'false' ? 'remove' : 'delete';
	
	if (!req.user.isAdmin && action == 'remove') {
		return res.status(403).json({message: strings.unauthorized});
	}

	// TODO: only allow to delete recipient if user is addedBy them
	
	try {
		const data = await Recipient[action](query);
		return res.status(200).json(data);
	}
	catch (err) {
		return res.status(400).json(err);
	}
});

// Get a recipient's catversation
router.get('/:number/conversation', isAuthenticated, async (req, res) => {
	
	try {
		const results = await Promise.all([
			Recipient.findOne({addedBy: req.user._id, number: req.params.number}),
			Message.find({number: req.params.number})
		]);
		
		if (results[0]) {
			return res.status(200).json(results[1]);
		} else {
			return res.status(403).json({message: "You aren't facting this person"});
		}
	}
	
	catch (err) {
		return res.status(400).json(err);
	}
});

module.exports = router;