const express = require('express');
const router = express.Router();
const Promise = require('bluebird');

const UnsubscribeDate = require('../models/unsubscribe-date');
const Recipient = require('../models/recipient');
const Fact = require('../models/fact');
const strings = require('../config/strings');
const IFTTTService = require('../services/ifttt.service.js');
const semanticJoin = require('../config/functions/semantic-join');

const keys = require('../config/keys');
const apiai = require('apiai-promise');
const catbot = apiai(keys.apiai.accessToken);
const crypto = require('crypto');

const processWebhook = req => {
    return new Promise(async (resolve, reject) => {
    
        if (!req.body || !req.body.result) {
        	reject(new Error('No request body provided'));
        }
        
    	switch (req.body.result.action) {
    	    case 'fact.get':
    	        
                const fact = await Fact.getFact();
                resolve({message: fact.text});
            
            break;
            
            case 'recipient.add':
                if (!req.body.result.parameters) reject();
                
                // Extract params from Dialogflow
                const parameters = req.body.result.parameters,
                      name = parameters['given-name'] + (parameters['last-name'] ? ' ' + parameters['last-name'] : ''),
                      number = parameters['phone-number'].replace(/\D/g,'').replace(/^1+/, ''),
                      requestedSubscriptions = parameters['animals'];
                    
                // Validate phone
                if (number.length != 10 && number.length != 11) {
                    return resolve({message: strings.invalidNumber});
                }
                    
                let responseMessage = '',
                    smsMessage = '',
                    abortSms = false;
                    
                const recipient = await Recipient.findOne({number});
                
                if (recipient) {
                    // Figure out which new animals to subscribe user to
                    
                    const existingSubscriptions = recipient.subscriptions;
                    
                    const subscriptionsToAdd = requestedSubscriptions.filter(a => !existingSubscriptions.includes(a));
                    const subscriptionsToIgnore = requestedSubscriptions.filter(a => existingSubscriptions.includes(a));
                    
                    
                    // Build response message
                    const alreadySubscribedMessage = `${name} is already subscribed to ${semanticJoin(subscriptionsToIgnore)} facts`;
                    
                    const alreadySubscribed = !!subscriptionsToIgnore.length,
                          moreToAdd = !!subscriptionsToAdd.length;
                    
                    if (alreadySubscribed) {
                        responseMessage += alreadySubscribedMessage;
                    }
                    if (alreadySubscribed && moreToAdd) {
                        responseMessage += `, but `;
                    }
                    if (moreToAdd) {
                        responseMessage += `I've added ${alreadySubscribed ? 'them' : name} to ${semanticJoin(subscriptionsToAdd)} facts`;
                    } else {
                        abortSms = true;
                    }
                    responseMessage += '.';
                    
                    // Build recipient's text message
                    smsMessage += `Surprise! You've also been added to ${semanticJoin(subscriptionsToAdd)} facts. Have a nice day!`;
                    
                    
                    await Recipient.findByIdAndUpdate(recipient._id, {
                        $addToSet: {
                            subscriptions: {
                                $each: subscriptionsToAdd
                            }
                        }
                    }, {
                        'new': true
                    });
                    
                    resolve({message: responseMessage});
                
                } else {
                    // This is a new recipient
                    
                    const recipient = new Recipient({
                        name: name,
                        number: number,
                        subscriptions: requestedSubscriptions
                    });
                    
                    responseMessage += `Okay, I've added ${name} to ${semanticJoin(requestedSubscriptions)} facts!`;
                    // TODO: pass animals to welcome message for custom response
                    smsMessage += strings.welcomeMessage(requestedSubscriptions);
                    
                    try {
                        await recipient.save();
                        resolve({message: responseMessage});
                    }
                    
                    catch (err) {
                        reject(err);
                    }
                }
                
                // Send SMS to recipient
                if (!abortSms) {
                    IFTTTService.sendSingleMessage({
                        number: number,
                        message: smsMessage
                    });
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