const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleConfig = require('../config/google');
const { isAuthenticated } = require('../middleware');

const User = require.main.require('./app/models/user');

const baseScopes = [
	'email',
	'profile'
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
	res.redirect('/#/cat/facts');
});

router.get('/google/contacts', isAuthenticated, (req, res) => {
	
	var oauth2Client = googleConfig.newOauth2Client({
		accessToken: User.decryptAccessToken(req.user.google.accessToken),
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

router.get('/google/contacts/callback', (req, res, next) => {
	var oauth2Client = googleConfig.newOauth2Client();
	
	oauth2Client.getToken(req.query.code, (err, tokens) => {
		if (err) return res.status(400).json(err);
		
		User.findByIdAndUpdate(req.user._id, {
			'google.accessToken': User.encryptAccessToken(tokens.access_token),
			'google.refreshToken': tokens.refresh_token
		}).then(user => {
			// Re-serialize user after updating data
			req.login(user, err => {
				if (err) return next(err);
				
				user.google.accessToken = User.decryptAccessToken(user.google.accessToken);
				
				return res.status(req.user ? 200 : 204).render('../public/views/other/after-auth', {
					state: JSON.parse(decodeURIComponent(req.query.state))
				});
			});
		}, err => {
			console.log(err);
		});
	});
});

router.get('/signout', (req, res) => {
	req.logout();
	res.status(200).send();
});

module.exports = router;