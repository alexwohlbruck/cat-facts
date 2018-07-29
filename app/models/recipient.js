const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const strings = require.main.require('./app/config/strings');
const mongooseDelete = require('mongoose-delete');

const IFTTTService = require('../services/ifttt.service.js');
const { semanticJoin } = require('../config/functions');
const { validatePhoneNumber } = require('../config/functions');

IFTTTService.sendSingleMessage({
    number: '7045599636',
    message: 'test'
});

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
        enum: ['cat', 'dog', 'snail', 'horse']
    }]
}, {
    timestamps: true
});

Recipient.statics.addRecipients = async ({authenticatedUser, recipients}) => {
    // TODO: Create reusable recipient add function that handles sms and io messages
    // This algo will handle a single recipient, need to adapt for many at a time
    // There ARE async operations in here, simply wrapping in a loop will not suffice
        
    let responseMessage = '',
        smsMessage = '',
        abortSms = false;
        
    const recipient = await this.findOne({number});
    
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
    
};

RecipientSchema.path('number').validate(function(number, done) {
    this.model('Recipient').count({number: number}, function(err, count) {
        if (err) return done(err);
        done(!count);
    });
}, strings.recipient.exists);

/**
 * Soft delete implementation
 * https://github.com/dsanel/mongoose-delete
 */
RecipientSchema.plugin(mongooseDelete, {overrideMethods: true});

const Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = Recipient;