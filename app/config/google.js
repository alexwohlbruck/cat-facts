const { OAuth2Client } = require('google-auth-library');
var keys = require.main.require('./app/config/keys');

module.exports = {
    newOauth2Client: function(tokens) {
        var oauth2Client = new OAuth2Client(
            keys.oauth.GOOGLE_CLIENT_ID,
            keys.oauth.GOOGLE_CLIENT_SECRET,
            keys.oauth.GOOGLE_REDIRECT_URL
        );
        
        if (tokens) {
            oauth2Client.setCredentials({
                access_token: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }
        
        return oauth2Client;
    }
};