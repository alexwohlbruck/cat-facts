const express = require('express');
const router = express.Router();

const Recipient = require.main.require('./app/models/recipient');
const UnsubscribeDate = require.main.require('./app/models/unsubscribe-date');

const Promise = require('bluebird');
const strings = require.main.require('./app/config/strings.js');

router.get('/data', (req, res) => {
	if (!req.user) return res.status(401).json({message: strings.unauthenticated});
	if (!req.user.isAdmin) return res.status(403).json({message: strings.unauthorized});
    
    Promise.props({
        recipients: Recipient.find().sort('-createdAt').limit(15),
        totalRecipients: Recipient.count(),
        unsubscribeDates: UnsubscribeDate.find().sort('-createdAt').limit(15)
    }).then(results => {
        const response = {
            recipients: {
                all: results.recipients,
                total: results.totalRecipients
            },
            unsubscribeDates: results.unsubscribeDates
        };
        return res.status(200).json(response);
    });
});

module.exports = router;