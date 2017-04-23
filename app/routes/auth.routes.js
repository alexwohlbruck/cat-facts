var express = require('express');
var router = express.Router();
var passport = require.main.require('passport');

var google = require('googleapis');
var googleConfig = require.main.require('./app/config/google');

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

router.get('/google/contacts', function(req, res) {
	var url = googleConfig.oauth2Client.generateAuthUrl({
		accessType: 'offline',
		scope: 'https://www.googleapis.com/auth/contacts.readonly',
		state: encodeURIComponent(JSON.stringify({
			action: 'contacts:import'
		}))
	});
	
	res.redirect(url);
});

router.get('/google/contacts/callback', function(req, res) {
	googleConfig.oauth2Client.getToken(req.query.code, function(err, tokens) {
		if (err) return res.status(400).json(err);
		
		googleConfig.oauth2Client.setCredentials(tokens);
		
		console.log(JSON.parse(decodeURIComponent(req.query.state)));
		
		return res.status(req.user ? 200 : 204).render('../public/views/other/after-auth', {
			state: JSON.parse(decodeURIComponent(req.query.state))
		});
	});
});

module.exports = router;