var router = require('express').Router();

// Import all route groups
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/catbot', require('./catbot.routes'));
router.use('/recipients', require('./recipient.routes'));
router.use('/facts', require('./fact.routes'));
router.use('/console', require('./console.routes'));
router.use('/contacts', require('./contact.routes'));
router.use('/webhook', require('./webhook.routes'));

module.exports = router;