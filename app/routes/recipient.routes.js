const express = require('express');
const router = express.Router();

const Recipient = require.main.require('./app/models/recipient');
const Message = require.main.require('./app/models/message');

const strings = require.main.require('./app/config/strings.js');
const IFTTTService = require.main.require('./app/services/ifttt.service.js');

// Get all recipients
router.get('/', (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	if (!req.user.isAdmin) return res.status(403).json({message: strings.unauthorized});
	
	Recipient.find().sort('-createdAt').then(recipients => {
		return res.status(200).json(recipients);
	}, err => {
		return res.status(400).json(err);
	});
});

// Get user's recipients
router.get('/me', (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	
	Recipient.find({addedBy: req.user._id}).sort('name').then(recipients => {
		return res.status(200).json(recipients);
	}, err => {
		return res.status(400).json(err);
	});
});

// Add new recipient(s)
router.post('/', (req, res) => {
	
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	
	var io = req.app.get('socketio');
	
	if (Array.isArray(req.body)) {
		
		// Submit multiple recipients
		
		var contacts = req.body.map(o => {
			o.addedBy = req.user._id;
			return o;
		});
		
		Recipient.create(contacts, (err, recipients) => {
			
			if (err) {
				if (err.writeErrors) err.message = err.writeErrors.length + ' ' + (err.writeErrors.length == 1 ? 'contact' : 'contacts') + ' failed to submit';
				return res.status(400).json(err);
			}
			
			for (var i = 0; i < recipients.length; i++) {
				io.emit('message', {message: strings.welcomeMessage, recipient: recipients[i]});
				IFTTTService.sendSingleMessage({number: recipients[i].number, message: strings.welcomeMessage});
			}
			
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
		
		newRecipient.save().then(recipient => {
			io.emit('message', {message: strings.welcomeMessage, recipient: recipient});
			IFTTTService.sendSingleMessage({number: recipient.number, message: strings.welcomeMessage});
			
			return res.status(200).json(recipient);
		}, err => {
			return res.status(400).json(err);
		});
	}
});

router.delete('/', (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	if (!req.user.isAdmin) return res.status(403).json({message: strings.unauthorized});
	
	const query = {_id: {$in: req.query.recipients}};
	
	const action = req.query.permanent == 'true' ? 'remove' : 'delete';
	
	Recipient[action](query).then(data => {
		return res.status(200).json(data);
	}, err => {
		return res.status(400).json(err);
	});
});

// Get a recipient's catversation
router.get('/:number/conversation', (req, res) => {
    if (!req.user) return res.status(401).json({message: strings.unauthenticated});
    
    Promise.all([
        Recipient.findOne({addedBy: req.user._id, number: req.params.number}),
        Message.find({number: req.params.number})
    ])
    .then(results => {
        if (results[0]) {
            return res.status(200).json(results[1]);
        } else {
            return res.status(401).json({message: "You aren't facting this person"});
        }
    });
});

module.exports = router;