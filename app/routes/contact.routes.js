const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const googleConfig = require.main.require('./app/config/google');
const googleContacts = google.people('v1');

const { isAuthenticated } = require('../middleware');

const User = require.main.require('./app/models/user');
const Recipient = require.main.require('./app/models/recipient');

router.get('/', isAuthenticated, (req, res) => {
	
	const oauth2Client = googleConfig.newOauth2Client({
		accessToken: User.decryptAccessToken(req.user.google.accessToken),
		refreshToken: req.user.google.refreshToken
	});
    const animalType = req.query.animal_type;
	
    googleContacts.people.connections.list({
        auth: oauth2Client,
        resourceName: 'people/me',
        pageSize: 500,
        'requestMask.includeField': ['person.phoneNumbers', 'person.names'],
        sortOrder: 'LAST_MODIFIED_ASCENDING'
    }, (err, data) => {
        if (err) return res.status(err.code || 400).json(err);
        
        /*
         * Reduce Google Contacts result to simple array of {name: '', number: ''}'s
         * First filter out objects without any phone numbers,
         * then rip phone numbers out of their contact's object and make new objects for each one
         */
        if (data.connections) {
            let contacts = data.connections
            	.filter(o => o.phoneNumbers && o.phoneNumbers.length > 0)
            	.map((o, i) => {
    	        	if (!o.phoneNumbers) return o;
    	        	var contacts = [];
    	        	for (var i = 0; i < o.phoneNumbers.length; i++) {
    		            contacts.push({
    		                name: o.names ? (o.names[0].givenName + (o.names[0].familyName ? (' ' + o.names[0].familyName) : '')) : undefined,
    		                number: o.phoneNumbers[i].value.replace(/\D/g,'').replace(/^1+/, '')
    	            	});
    	        	}
    	        	return contacts;
    	        });
            
            // Flatten array and reverse sort order
            contacts = [].concat.apply([], contacts).reverse();
            
            Recipient.find({number: {$in: contacts.map(o => o.number)}}).then(function(recipients) {
                contacts = contacts.map(contact => {
                    contact.added = !!recipients.find(recipient => {
                        return recipient.number == contact.number && recipient.subscriptions.includes(animalType);
                    });
                    return contact;
                });
                
                return res.status(200).json(contacts); 
            });
        } else {
            return res.status(204).json([]);
        }
    });
});

module.exports = router;