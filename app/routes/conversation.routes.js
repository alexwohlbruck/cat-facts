// School routes - /api/school/...
var express = require('express');
var router = express.Router();
var Message = require.main.require('./app/models/message');
var Recipient = require.main.require('./app/models/recipient');

router.get('/:number', function(req, res) {
    if (req.user) {
        Promise.all([
            Recipient.findOne({addedBy: req.user._id, number: req.params.number}),
            Message.find({number: req.params.number})
        ])
        .then(function(results) {
            if (results[0]) {
                return res.status(200).json(results[1]);
            } else {
                return res.status(401).json({message: "You aren't facting this person"});
            }
        });
    } else {
        return res.status(401).json({message: strings.unauthenticated});
    }
});

module.exports = router;