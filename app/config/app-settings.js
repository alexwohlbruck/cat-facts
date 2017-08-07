/*
 * This file contains global settings for the app configuration
 * Use environment variables for secrets and keys!!
 * This file is publicly visible (hello if you're reading this :D )
 */
 
const unsubscribableDates = [
    {
        start: new Date("August 8, 2017 16:20:00 EDT"),
        end: new Date("August 9, 2017 16:20:00 EDT")
    },
    {
        start: new Date("August 6, 2017 01:00:00 EDT"),
        end: new Date("August 10, 2017 01:08:30 EDT")
    }
],

isBetweenDates = function(target, min, max) {
    return (min < target) && (target < max);
};
 
module.exports = {
    allowUsersToUnsubscribe: function() {
        const now = new Date();
        
        return unsubscribableDates
            .map(range => {
                return isBetweenDates(now, range.start, range.end);
            })
            .reduce((sum, value) => sum || value);
    }
};