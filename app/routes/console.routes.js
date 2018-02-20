const express = require('express');
const router = express.Router();

const Recipient = require.main.require('./app/models/recipient');
const UnsubscribeDate = require.main.require('./app/models/unsubscribe-date');
const User = require.main.require('./app/models/user');
const Fact = require.main.require('./app/models/fact');

const Promise = require('bluebird');
const strings = require.main.require('./app/config/strings.js');

router.get('/data', async (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	if (!req.user.isAdmin) return res.status(403).json({message: strings.unauthorized});
    
    const {recipients, totalRecipients, unsubscribeDates, users, overrideFacts} = await Promise.props({
        recipients:         Recipient.find().sort('-createdAt').limit(15).populate({path: 'addedBy', select: 'name'}),
        totalRecipients:    Recipient.count(),
        unsubscribeDates:   UnsubscribeDate.find().sort('-createdAt').limit(15),
        users:              User.find().sort('-createdAt').limit(15),
        overrideFacts:      Fact.find({sendDate: {$exists: true}}).limit(15)
    });
    
    const response = {
        recipients: {
            all: recipients,
            total: totalRecipients
        },
        unsubscribeDates,
        users,
        overrideFacts
    };
    
    return res.status(200).json(response);
});

module.exports = router;