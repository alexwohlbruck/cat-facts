const express = require('express');
const router = express.Router();
const Promise = require('bluebird');

const UnsubscribeDate = require.main.require('./app/models/unsubscribe-date');
const Recipient = require.main.require('./app/models/recipient');
const Fact = require.main.require('./app/models/fact');
const strings = require.main.require('./app/config/strings');
const IFTTTService = require.main.require('./app/services/ifttt.service.js');

const keys = require.main.require('./app/config/keys');
const apiai = require('apiai-promise');
const catbot = apiai(keys.apiai.accessToken);
const crypto = require('crypto');

const processWebhook = req => {
    return new Promise(async (resolve, reject) => {
    
        if (req.body && req.body.result) {
        	
        	switch (req.body.result.action) {
        	    case 'fact.get':
        	        
                    const fact = await Fact.getFact();
                    resolve({message: fact.text});
                
                break;
                
                case 'recipient.add':
                    if (req.body.result.parameters) {
                        var parameters = req.body.result.parameters,
                            name = parameters['given-name'] + (parameters['last-name'] ? ' ' + parameters['last-name'] : ''),
                            number = parameters['phone-number'].replace(/\D/g,'').replace(/^1+/, '');
                            
                        if (number.length != 10 && number.length != 11)
                            return resolve({message: strings.invalidNumber});
                            
                        var recipient = new Recipient({
                            name: name,
                            number: number
                        });
                        
                        try {
                            await recipient.save();
                        }
                        
                        catch (err) {
                            reject(err);
                        }
                        
                        IFTTTService.sendSingleMessage({
                            number: number,
                            msg: strings.welcomeMessage
                        });
                            
                        resolve({message: req.body.result.fulfillment.messages[0].speech});
                    } else {
                        reject();
                    }
                break;
                
                case 'recipient.unsubscribe':
                    const canUnsubscribe = await UnsubscribeDate.allowUnsubscribe();
                    
                    if (canUnsubscribe) {
                        const recipientNumber = req.body.sessionId;
                        
                        try {
                            await Recipient.delete({number: recipientNumber});
                            resolve({message: req.body.result.fulfillment.messages[0].speech});
                        }
                        
                        catch (err) {
                            reject(err);
                        }
                    } else {
                        // Get unsubscribe message from CatBot
                        const randomSessionId = crypto.createHash('md5').update((new Date()).getTime().toString()).digest('hex');
                        
                        const response = await catbot.textRequest('unsubscribe', {sessionId: randomSessionId});
                        
                        resolve({message: response.result.fulfillment.speech});
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
router.post('/', async (req, res) => {
    
    try {
        const response = await processWebhook(req);
        
        return res.json({
        	speech: response.message,
        	displayText: response.message,
        	data: {},
        	contextOut: [],
        	source: "Cat Facts"
        });
    }
    
    catch (err) {
        var message = err.message || err.errors[Object.keys(err.errors)[0]].message || strings.error;
        return res.json({displayText: message, speech: message, data: err});
    }
	
});

module.exports = router;