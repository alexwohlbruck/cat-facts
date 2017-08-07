const express = require('express');
const router = express.Router();
const Promise = require('bluebird');

const appConfig = require.main.require('./app/config/app-settings');
const Recipient = require.main.require('./app/models/recipient');
const strings = require.main.require('./app/config/strings');
const IFTTTService = require.main.require('./app/services/ifttt.service.js');
const FactService = require.main.require('./app/services/fact.service');

const keys = require.main.require('./app/config/keys');
const apiai = require('apiai-promise');
const catbot = apiai(keys.apiai.accessToken);
const crypto = require('crypto');

var processWebhook = function(req) {
    return new Promise((resolve, reject) => {
    
        if (req.body && req.body.result) {
        	
        	switch (req.body.result.action) {
        	    case 'fact.get':
        	        
                    FactService.getFact().then(function(fact) {
                        resolve({message: fact});
                    });
                
                break;
                
                case 'recipient.add':
                    if (req.body.result.parameters) {
                        var parameters = req.body.result.parameters,
                            name = parameters['given-name'] + (parameters['last-name'] ? ' ' + parameters['last-name'] : ''),
                            number = parameters['phone-number'].replace(/\D/g,'').replace(/^1+/, '');
                            console.log(number);
                        if (number.length != 10 && number.length != 11)
                            return resolve({message: strings.invalidNumber});
                            
                        var recipient = new Recipient({
                                name: name,
                                number: number
                            });
                            
                        recipient.save().then(function() {
                            IFTTTService.sendSingleMessage({
                                number: number,
                                msg: strings.welcomeMessage
                            });
                            
                            resolve({message: req.body.result.fulfillment.messages[0].speech});
                            
                        }, function(err) {
                            reject(err);
                        });
                    } else {
                        reject();
                    }
                break;
                
                case 'recipient.unsubscribe':
                    if (appConfig.allowUsersToUnsubscribe()) {
                        const recipientNumber = req.body.sessionId;
                        
                        Recipient.delete({number: recipientNumber}).then(result => {
                            resolve({message: req.body.result.fulfillment.messages[0].speech});
                        }, err => {
                            reject(err);
                        });
                    } else {
                        const randomSessionId = crypto.createHash('md5').update((new Date()).getTime().toString()).digest('hex');
                        
                        catbot.textRequest('unsubscribe', {sessionId: randomSessionId}).then(response => {
                            resolve({message: response.result.fulfillment.speech});
                        });
                    }
                break;
                    
                default:
                    reject(new Error('No action specified'));
                break;
        	}
        } else {
            reject(new Error('No request body provided'));
        }
    });
};


// Route for api.ai webhook
router.post('/', function(req, res) {
    
    processWebhook(req).then(function(response) {
        
        return res.json({
        	speech: response.message,
        	displayText: response.message,
        	data: {},
        	contextOut: [],
        	source: "Cat Facts"
        });
        
    }, function(err) {
        var message = err.message || err.errors[Object.keys(err.errors)[0]].message || strings.error;
        return res.json({displayText: message, speech: message, data: err});
    });
	
});

module.exports = router;