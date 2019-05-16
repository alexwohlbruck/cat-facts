const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const strings = require.main.require('./app/config/strings');
const mongooseDelete = require('mongoose-delete');

const IFTTTService = require('../services/ifttt.service.js');
const { semanticJoin } = require('../config/functions');
const { validatePhoneNumber, cleanPhoneNumber } = require('../config/functions');

const RecipientSchema = new Schema({
    name: { type: String, default: undefined },
    notes: { type: String, default: undefined, select: false },
    number: {
        type: String,
        required: true,
        unique: true,
        validate: [validatePhoneNumber]
    },
    addedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    subscriptions: [{
        type: String,
        enum: strings.animalTypes // TODO: Move to constant definition
    }]
}, {
    timestamps: true
});
        

RecipientSchema.statics.addRecipients = async function ({authenticatedUser, requestedRecipients, requestedSubscriptions}) {
    
    // TODO: Create user account for people who add recipients over SMS, attach phone number to user account and
    // attach user ID to recipient document as 'addedBy'
        
    let existingRecipients = await this.find({number: {$in: requestedRecipients.map(r => r.number)}}),
        newRequestedRecipients = requestedRecipients.filter(requestedRecipient => {
            return !existingRecipients.find(existingRecipient => {
                return requestedRecipient.number == existingRecipient.number;
            });
        });
    
    const addNewRecipients = async recipients => {
        // This is a new recipient
        
        recipients = recipients.map(recipient => {
            return {
                name: recipient.name,
                number: cleanPhoneNumber(recipient.number),
                addedBy: authenticatedUser ? authenticatedUser._id : undefined,
                subscriptions: requestedSubscriptions
            };
        });
        
        return await Recipient.create(recipients);
    },
    addSubscriptionsToExistingRecipients = async recipients => {
    
        const existingRecipientPromises = recipients.map(recipient => {
            return Recipient.findByIdAndUpdate(recipient._id, {
                $addToSet: {
                    subscriptions: {
                        $each: requestedSubscriptions
                    }
                }
            }, {
                'new': true
            });
        });
    
        return await Promise.all(existingRecipientPromises);
    },
    
    buildMessagesForNewRecipients = ({recipients}) => {
        return {
            responseMessage: `Okay, I've added ${semanticJoin(recipients.map(r => r.name))} to ${semanticJoin(requestedSubscriptions)} facts!`,
            smsMessage: strings.welcomeMessage(requestedSubscriptions)
        };
    },
    buildMessagesForExistingRecipients = ({recipients}) => {
          
        let responseMessage = '',
            smsMessage = '',
            abortSms = false;
    
        if (recipients.length > 1) {
            responseMessage += `Okay, I've added ${semanticJoin(recipients.map(r => r.name))} to ${semanticJoin(requestedSubscriptions)} facts!`;
              smsMessage += strings.welcomeMessage(requestedSubscriptions);
        } else {
         
            const recipient = recipients[0];
              
            // Figure out which new animals to subscribe user to
            const existingSubscriptions = recipient.subscriptions;
            const subscriptionsToAdd = requestedSubscriptions.filter(a => !existingSubscriptions.includes(a));
            const subscriptionsToIgnore = requestedSubscriptions.filter(a => existingSubscriptions.includes(a));
              
            // Build response message
            const alreadySubscribedMessage = `${recipient.name} is already subscribed to ${semanticJoin(subscriptionsToIgnore)} facts`;
              
            const alreadySubscribed = !!subscriptionsToIgnore.length,
                  moreToAdd = !!subscriptionsToAdd.length;
              
            if (alreadySubscribed) {
                responseMessage += alreadySubscribedMessage;
            }
            if (alreadySubscribed && moreToAdd) {
                responseMessage += `, but `;
            }
            if (moreToAdd) {
                responseMessage += `I've added ${alreadySubscribed ? 'them' : recipient.name} to ${semanticJoin(subscriptionsToAdd)} facts`;
            } else {
                abortSms = true;
            }
            responseMessage += '.';
              
            // Build SMS message
            smsMessage += `Surprise! You've also been added to ${semanticJoin(subscriptionsToAdd)} facts. Have a nice day!`;
        }
          
        return {
            responseMessage,
            smsMessage: abortSms ? undefined : smsMessage,
            abortSms
        };
    },
    
    sendMessages = ({recipients, message}) => {
        // TODO: also send message app using websocket
        // io.emit('message', {message, recipient});
          
        // Send SMS to recipient
        IFTTTService.sendBatchMessages(recipients.map(recipient => {
            return {
                number: recipient.number,
                message
            };
        }));
    };

    try {
        var newRecipients = await addNewRecipients(newRequestedRecipients);
        var updatedRecipients = await addSubscriptionsToExistingRecipients(existingRecipients);
    }
    catch (err) {
        throw err;
    }
    
    // TODO: DRY these
    if (newRecipients && newRecipients.length) {
        var { smsMessage: newSmsMessage, responseMessage: newResponseMessage, abortSms } = buildMessagesForNewRecipients({recipients: newRequestedRecipients});
        if (!abortSms) sendMessages({recipients: newRecipients, message: newSmsMessage});
    }
    
    if (updatedRecipients && updatedRecipients.length) {
        var { smsMessage: updatedSmsMessage, responseMessage: updatedResponseMessage, abortSms } = buildMessagesForExistingRecipients({recipients: existingRecipients});
        if (!abortSms) sendMessages({ recipients: updatedRecipients, message: updatedSmsMessage });
    }
    
    return {
        newRecipients: newRecipients || [],
        updatedRecipients: updatedRecipients || [],
        // TODO: Merge these messages into one
        message: newResponseMessage || updatedResponseMessage
    };
};

RecipientSchema.path('number').validate(function(number, done) {
    this.model('Recipient').count({number: number}, function(err, count) {
        if (err) return err;
        return !count;
    });
}, strings.recipient.exists);

/**
 * Soft delete implementation
 * https://github.com/dsanel/mongoose-delete
 */
RecipientSchema.plugin(mongooseDelete, {overrideMethods: true});

const Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = Recipient;