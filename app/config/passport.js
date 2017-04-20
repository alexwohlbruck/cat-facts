var keys = require.main.require('./app/config/keys');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require.main.require('./app/models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });
    
    passport.use(new GoogleStrategy({
    	clientID: keys.oauth.GOOGLE_CLIENT_ID,
    	clientSecret: keys.oauth.GOOGLE_CLIENT_SECRET,
    	callbackURL: "/auth/google/callback",
    	proxy: true
    },
    function(accessToken, refreshToken, profile, done) {
      console.log('access: ' + accessToken + ' refresh: ' + refreshToken);
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
    		            refreshToken: refreshToken
    		        }
    		    });
    		    user.save(function(err) {
    		        if (err) console.log(err);
    		        return done(err, user);
    		    });
    		} else {
    		    return done(err, user);
    		}
    	});
    }));
};