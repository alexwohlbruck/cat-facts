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
		const animalTypeFilter = req.query.animal_type ? { $in: req.query.animal_type.split(',') } : { $exists: true };
		
		const recipients = await Recipient.find({
			subscriptions: animalTypeFilter
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
	
	const animalType = req.query.animalType ? req.query.animalType.split(',') : 'cat';
	
	try {
		const recipients = await Recipient.findWithDeleted({
			addedBy: req.user._id,
			subscriptions: animalType ? { $in: animalType.split(',') } : { $exists: true }
		}).sort('name');
		
		return res.status(200).json(recipients);
	} catch (err) {
		return res.status(400).json(err);
	}
});

// Add new recipient(s)
router.post('/', isAuthenticated, async (req, res) => {
	
	/*Recipient.addRecipients({
	    authenticatedUser: req.user,
	    requestedRecipients: [{
	        name: 'Alex Wohlbruck',
	        number: '7045599636'
	    }],
	    requestedSubscriptions: ['cat', 'snail']
	});*/
	
	//////////////////////////////////////////////////
	
	/*const io = req.app.get('socketio');
	const animalTypes = req.query.animalType ? req.query.animalType.split(',') : ['cat'];
	
	// TODO: If recipient is already in DB then append new subscriptions in existing doc
	// TODO: This has already been implemented??? Create addRecipients method on data model for resuability
	
	const requestedRecipients = (req.body.recipients || [req.body.recipient]).map(recipient => {
		return {
			name: recipient.name,
			number: recipient.number.replace(/\D/g,'').replace(/^1+/, ''),
			addedBy: req.user._id
		};
	});
	
	try {
		const recipients = await Recipient.create(requestedRecipients);
		
		recipients.forEach(recipient => {
			const message = strings.welcomeMessage(animalTypes);
			
			io.emit('message', {message, recipient});
			
			IFTTTService.sendSingleMessage({
				number: recipient.number,
				message
			});
		});
		
		return res.status(200).json({
			addedRecipients: recipients
		});
	}
	catch (err) {
		return res.status(err.statusCode || 400);
	}*/
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