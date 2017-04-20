var router = require('express').Router();
var google = require('googleapis');
var keys = require.main.require('./app/config/keys');

var oauth2Client = new google.auth.OAuth2(
    keys.oauth.GOOGLE_CLIENT_ID,
    keys.oauth.GOOGLE_CLIENT_SECRET,
    'https://cat-facts-alexwohlbruck.c9users.io/auth/google/contacts/callback'
);

const ACTION_IMPORT_CONTACT = 'importContact';



/*oauth2Client.setCredentials({
    access_token: '',
    refresh_token: ''
});*/

var contacts = google.people('v1');

router.get('/auth/google/contacts', function(req, res) {
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/contacts.readonly',
        state: { action: ACTION_IMPORT_CONTACT, test: 'test' }
    });
    return res.redirect(url);
});

router.get('/auth/google/contacts/callback', function(req, res) {
    return res.status(200).json({
        body: req.body,
        query: req.query
    });
});

router.get('/test', function(req, res) {
    contacts.people.connections.list({
        auth: oauth2Client,
        resourceName: 'people/me',
        pageSize: 500,
        'requestMask.includeField': ['person.phoneNumbers', 'person.names'],
        sortOrder: 'FIRST_NAME_ASCENDING'
    }, function(err, data) {
        res.status(err ? (err.status || 400) : 200).json(err || data.connections.map((o, i) => {
            return o.phoneNumbers ? {
                name: o.names ? {
                    first: o.names[0].givenName,
                    last: o.names[0].familyName
                } : undefined,
                numbers: o.phoneNumbers.map(o => o.value)
            } : undefined;
        }));
    });
});

// Import all route groups
router.use('/auth', require('./auth.routes'));
router.use('/recipients', require('./recipient.routes'));
router.use('/facts', require('./fact.routes'));
router.use('/conversations', require('./conversation.routes'));
router.use('/webhook', require('./webhook.routes'));

module.exports = router;