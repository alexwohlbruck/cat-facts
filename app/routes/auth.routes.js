var express = require('express');
var router = express.Router();
var passport = require.main.require('passport');

router.get('/me', function(req, res) {
	if (req.user) return res.status(200).json(req.user);
	return res.status(401).json(false);
});

router.get('/google', passport.authenticate('google', {
	scope: [
	    'https://www.googleapis.com/auth/userinfo.email',
	    'https://www.googleapis.com/auth/plus.login'
	],
	accessType: 'offline'
}));

router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/#/facts');
});

module.exports = router;