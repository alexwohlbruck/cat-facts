var express = require('express');
var router = express.Router();
var passport = require.main.require('passport');
var strings = require.main.require('./app/config/strings.js');

var User = require.main.require('./app/models/user');

var google = require('googleapis');
var googleConfig = require.main.require('./app/config/google');

router.get('/me', function(req, res) {
	if (req.user) return res.status(200).json(req.user);
	return res.status(401).json(false);
});

var baseScopes = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/plus.login'
],
contactsScopes = [
	'https://www.googleapis.com/auth/contacts.readonly'
];

router.get('/google', passport.authenticate('google', {
	scope: baseScopes,
	accessType: 'offline',
	includeGrantedScopes: true
}));

router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/#/facts');
});

router.get('/google/contacts', function(req, res) {
	if (!req.user) return res.status(400).json({message: strings.unauthenticated});
	
	var oauth2Client = googleConfig.newOauth2Client({
		accessToken: req.user.google.accessToken,
		refreshToken: req.user.google.refreshToken
	});
	
	var url = oauth2Client.generateAuthUrl({
		accessType: 'offline',
		scope: contactsScopes,
		state: encodeURIComponent(JSON.stringify({
			action: 'contacts:import'
		})),
		includeGrantedScopes: true
	});
	
	return res.redirect(url);
});

router.get('/google/contacts/callback', function(req, res, next) {
	var oauth2Client = googleConfig.newOauth2Client();
	
	oauth2Client.getToken(req.query.code, function(err, tokens) {
		if (err) return res.status(400).json(err);
		
		User.findByIdAndUpdate(req.user._id, {
			'google.accessToken': tokens.access_token,
			'google.refreshToken': tokens.refresh_token
		}).then(function(user) {
			// Re-serialize user after updating data - Doesn't work automatically for some reason
			req.login(user, function(err) {
				if (err) return next(err);
				
				return res.status(req.user ? 200 : 204).render('../public/views/other/after-auth', {
					state: JSON.parse(decodeURIComponent(req.query.state))
				});
			});
		}, function(err) {
			console.log(err);
		});
	});
});

module.exports = router;