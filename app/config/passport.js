const keys = require.main.require('./app/config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require.main.require('./app/models/user');
const strings = require.main.require('./app/config/strings');

module.exports = passport => {
	passport.serializeUser((user, done) => {
		done(null, user);
	});
	
	passport.deserializeUser((user, done) => {
		User.findById(user._id).then(user => {
			done(null, user);
		});
	});
	
	passport.use(new GoogleStrategy({
		clientID: keys.oauth.GOOGLE_CLIENT_ID,
		clientSecret: keys.oauth.GOOGLE_CLIENT_SECRET,
		callbackURL: "/auth/google/callback",
		accessType: 'offline',
		proxy: true,
		includeGrantedScopes: true,
		passReqToCallback: true
	},
	(req, accessToken, refreshToken, profile, done) => {
		
		User.findOne({'google.id': profile.id}, (err, user) => {
			
			const name = {
				first: profile.name.givenName,
				last: profile.name.familyName
			},
			email = profile.emails[0].value,
			photo = profile.photos[0] && !profile._json.image.isDefault
					? profile.photos[0].value.replace("?sz=50", "?sz=200")
					: strings.userPhotoUrl,
					
			google = {
				id: profile.id,
				accessToken: User.encryptAccessToken(accessToken),
				refreshToken
			},
			ip = req.clientIp;
			
			if (err) return done(err);
			
			if (!user) {
				
				user = new User({name, photo, email, google, ip});
				user.save(err => {
					if (err) console.log(err);
					return done(err, user);
				});
				
			} else {
				
				User.findByIdAndUpdate(user._id, {
					'google.accessToken': User.encryptAccessToken(accessToken),
					'google.refreshToken': refreshToken,
					ip,
					photo
				})
				
				.then(user => {
					user.google.accessToken = User.decryptAccessToken(user.google.accessToken);
					
					return done(err, user);
				});
			}
		});
	}));
};