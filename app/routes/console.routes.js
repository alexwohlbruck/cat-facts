const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const Recipient = require.main.require('./app/models/recipient');
const UnsubscribeDate = require.main.require('./app/models/unsubscribe-date');

router.get('/data', (req, res) => {
    Promise.props({
        recipients: Recipient.find().sort('-createdAt').limit(15),
        unsubscribeDates: UnsubscribeDate.find().sort('-createdAt').limit(15)
    }).then(results => {
        return res.status(200).json(results);
    });
});

module.exports = router;