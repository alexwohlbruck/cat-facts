const Twitter = require('twitter');

const twitterKeysExist =
    process.env.TWITTER_CONSUMER_KEY &&
    process.env.TWITTER_CONSUMER_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET;

const client = twitterKeysExist
    ? new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })
    : null;

/** 
 * splits a text into parts that don't exceed the specified max length(280),
 * attempting to break at spaces to avoid cutting words in half
 * 
 * @param {string} text -> the text to be split
 * @param {number} maxLength -> the maximum allowed length for each part
 * @returns {string[]} -> array of split text part
 */
function splitMessage(text, maxLength) {
    const parts = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            parts.push(remaining);
            break;
        }

        let splitPos = remaining.lastIndexOf(' ', maxLength);
        if (splitPos === -1) splitPos = maxLength;

        parts.push(remaining.slice(0, splitPos));
        remaining = remaining.slice(splitPos).trim();
    }

    return parts;
}

/**
 * Posts a twitter thread by splitting the message into multiple tweets, 
 * where each tweet replies to the previous one (form a thread)
 * @param {string} message -> the full message to be posted as a thread
 * @returns {Promise<void>}
 */
async function tweetThread(message) {
    if (!client) {
        console.error('Twitter client not initialized.');
        return;
    }

    const maxTweetLength = 280;
    const parts = splitMessage(message, maxTweetLength);

    let lastTweetID = null;

    for (const part of parts) {
        const params = { status: part };

        if (lastTweetID) {
            params.in_reply_to_status_id = lastTweetID;
            params.auto_populate_reply_metadata = true;
        }

        try {
            const tweet = await client.post('statuses/update', params);
            lastTweetID = tweet.id_str;
        } catch (err) {
            console.error('Error when posting thread part: ', err);
            break;
        }
    }
}

module.exports = {
    async tweet(message) {
        const maxTweetLength = 280;

        if (!twitterKeysExist || !client) return;

        // If message exceeds 280 characters, it calls tweetThread to post in parts
        // else, posts directly.
        if (message.length > maxTweetLength) {
            await tweetThread(message);
        } else {
            try {
                await client.post('statuses/update', { status: message });
            } catch (err) {
                console.log('Error when posting the tweet', err);
            }
        }
    }
};
