const express = require('express');
const router = express.Router();

const { isAuthenticated, isAdmin } = require('../middleware');
const strings = require.main.require('./app/config/strings.js');
const IFTTTService = require.main.require('./app/services/ifttt.service.js');

const Recipient = require.main.require('./app/models/recipient');
const Message = require.main.require('./app/models/message');
const VerificationCode = require.main.require('./app/models/verification-code');


// Get all recipients
router.get('/', isAuthenticated, isAdmin, async(req, res) => {

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
router.get('/me', isAuthenticated, async(req, res) => {

    const animalType = req.query.animal_type ? req.query.animal_type.split(',') : undefined;

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
router.post('/', isAuthenticated, async(req, res) => {

    // TODO: Sanitize phone number input on server side

    const requestedRecipients = req.body.recipients || [req.body.recipient];
    const animalTypes = req.body.animalTypes;

    /* 
     * requestedRecipients: [{
     *     name: String,
     *     number: String
     * }],
     * animalTypes: [String<Animal>]
     */

    if (!requestedRecipients.length) {
        return res.status(400).json({ message: `No recipients provided` });
    }

    // If recipient already exists but is 'deleted', restore recipient to
    // the new user account
    const existingRecipients = await Recipient.findDeleted({
        number: {
            $in: requestedRecipients.map(r => r.number)
        }
    });

    if (existingRecipients.length) {
        existingRecipients.forEach(r => r.remove());
    }

    try {
        const results = await Recipient.addRecipients({
            authenticatedUser: req.user,
            requestedRecipients,
            requestedSubscriptions: animalTypes
        });

        return res.status(200).json(results);
    } catch (err) {
        return res.status(err.status || 400).json(err);
    }
});

// Restore recipient with new subscriptions
router.patch('/:recipientId/restore', isAuthenticated, async(req, res) => {

    const recipientId = req.params.recipientId;
    const resubscriptions = req.body.resubscriptions;

    console.log(recipientId, resubscriptions);

    try {
        await Recipient.restore({ _id: recipientId });

        const recipient = await Recipient.findOneAndUpdate({ _id: recipientId }, {
            $set: {
                subscriptions: resubscriptions
            }
        }, {
            new: true
        });
        console.log(recipient);

        return res.status(200).json(recipient);
    } catch (err) {
        return res.status(err.status || 400).json(err);
    }
});

router.patch('/:recipientId', isAuthenticated, async(req, res) => {

    // TODO: only allow to edit recipient if user isAdmin or is addedBy them

    try {
        const recipient = await Recipient.update({ _id: req.params.recipientId }, {
            $set: {
                name: req.body.name,
                number: req.body.number
            }
        });

        return res.status(200).json(recipient);
    } catch (err) {
        return res.status(err.statusCode || 400).json(err);
    }
});

// Unsubscribe
router.delete('/me', isAuthenticated, async(req, res) => {

    if (!req.query.verificationCode) {
        return res.status(403).json({
            message: strings.noVerificationCode
        });
    }

    const submittedCode = req.query.verificationCode.trim();
    const verificationCode = await VerificationCode.findOne({ code: submittedCode });
    const number = verificationCode ? verificationCode.data : undefined;

    if (!verificationCode || !verificationCode.user.equals(req.user._id)) {
        return res.status(403).json({
            message: strings.invalidVerificationCode
        });
    }

    await Recipient.delete({ number });
    await VerificationCode.findByIdAndRemove(verificationCode._id);

    const formattedPhone = `(${number.substr(0,3)}) ${number.substr(3,3)}-${number.substr(6,4)}`;

    return res.status(200).json({
        message: `Successfully unsubscribed ${formattedPhone}`
    });
});

// Remove one or more recipients
router.delete('/', isAuthenticated, async(req, res) => {

    const query = { _id: { $in: req.query.recipients } };

    const action = req.query.soft == 'false' ? 'remove' : 'delete';

    if (!req.user.isAdmin && action == 'remove') {
        return res.status(403).json({ message: strings.unauthorized });
    }

    // TODO: only allow to delete recipient if user is addedBy them

    try {
        const data = await Recipient[action](query);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json(err);
    }
});

// Get a recipient's catversation
router.get('/:number/conversation', isAuthenticated, async(req, res) => {

    try {
        const results = await Promise.all([
            Recipient.findOne({ addedBy: req.user._id, number: req.params.number }),
            Message.find({ number: req.params.number })
        ]);

        if (results[0]) {
            return res.status(200).json(results[1]);
        } else {
            return res.status(403).json({ message: "You aren't facting this person" });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
});

module.exports = router;