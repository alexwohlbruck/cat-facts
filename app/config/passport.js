var keys = require.main.require('./app/config/keys');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require.main.require('./app/models/user');
var google = require('googleapis');
var googleConfig = require.main.require('./app/config/google');
var OAuth2 = google.auth.OAuth2;

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	
	passport.deserializeUser(function(user, done) {
		User.findById(user._id).then(function(user) {
			done(null, user);
		});
	});
	
	passport.use(new GoogleStrategy({
		clientID: keys.oauth.GOOGLE_CLIENT_ID,
		clientSecret: keys.oauth.GOOGLE_CLIENT_SECRET,
		callbackURL: "/auth/google/callback",
		accessType: 'offline',
		proxy: true,
		includeGrantedScopes: true
	},
	function(accessToken, refreshToken, profile, done) {
		
		User.findOne({'google.id': profile.id}, function(err, user) {
			if (err) return done(err);
			if (!user) {
				user = new User({
					name: {
						first: profile.name.givenName,
						last: profile.name.familyName
					},
					email: profile.emails[0].value,
					google: {
						id: profile.id,
						accessToken: User.encryptAccessToken(accessToken),
						refreshToken: refreshToken
					}
				});
				user.save(function(err) {
					if (err) console.log(err);
					return done(err, user);
				});
			} else {
				User.findByIdAndUpdate(user._id, {
					'google.accessToken': User.encryptAccessToken(accessToken),
					'google.refreshToken': refreshToken
				}).then(function(user) {
					user.google.accessToken = User.decryptAccessToken(user.google.accessToken);
					return done(err, user);
				});
			}
		});
	}));
};