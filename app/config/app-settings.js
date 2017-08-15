/*
 * This file contains global settings for the app configuration
 * Use environment variables for secrets and keys!!
 * This file is publicly visible (hello if you're reading this :D )
 */

const Promise = require('bluebird');
const UnsubscribeDate = require.main.require('./app/models/unsubscribe-date');

const isBetweenDates = function(target, min, max) {
    return (min < target) && (target < max);
};
 
module.exports = {
    allowUsersToUnsubscribe: function() {
        return new Promise((resolve, reject) => {
            UnsubscribeDate.find().then(unsubscribableDates => {
                const now = new Date();
                
                const canUnsubscribe = unsubscribableDates
                    .map(range => {
                        return isBetweenDates(now, range.start, range.end);
                    })
                    .reduce((sum, value) => sum || value);
                    
                resolve(canUnsubscribe);
            }, err => {
                reject(err);
            });
        });
    }
};