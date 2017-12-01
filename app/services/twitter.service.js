const Twitter = require('twitter');

const twitterKeysExist =
    process.env.TWITTER_CONSUMER_KEY &&
    process.env.TWITTER_CONSUMER_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET;
    
const client = twitterKeysExist ?
    new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })
: null;

module.exports = {
    tweet(message) {
        if (!twitterKeysExist) return;
        
        client.post('statuses/update', {
            status: message
        });
    }
};