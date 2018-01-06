const Twitter = require('twitter');

const twitterKeysExist =
    process.env.TWITTER_CONSUMER_KEY &&
    process.env.TWITTER_CONSUMER_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET;
    
const client = twitterKeysExist ?
    new Twitter({
        consumer_key: 'eJf8Xjf7xCOrQAxcFMdcryYP8',
        consumer_secret: 'qrQBCQgMbiLdsuZa6Z6tzuObXj9rYx9wNUisIrthiPgSaoQaqK',
        access_token_key: '936384362563678213-ZZ9UeFnFOMUS2tIcVGNhUtmqEiL4UtW',
        access_token_secret: 'uNitJ2PZLZfonGl5aM5hv5uh5C3IqbfxCB4SYsNtork92',
    })
: null;

module.exports = {
    async tweet(message) {
        
        const maxTweetLength = 280;
        
        if (!twitterKeysExist) return;
        
        if (message.length > maxTweetLength) {
            message = message.substr(0, maxTweetLength-2) + '…';
        }
        
        try {
            await client.post('statuses/update', {
                status: message
            });
        }
        
        catch (err) {
            console.log(message, err);
        }
    }
};