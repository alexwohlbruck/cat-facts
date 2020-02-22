var keys = require.main.require('./app/config/keys');
var IFTTT = require('node-ifttt-maker');
var ifttt = new IFTTT(keys.ifttt.apiKey);
var Message = require.main.require('./app/models/message');

// Maybe use pushbullet instead? It supports native SMS sending
// https://github.com/alexwhitman/node-pushbullet-api

module.exports = {
    async sendSingleMessage(data) {
        try {
            await ifttt.request({
                event: 'message:send:single',
                method: 'GET',
                params: {
                    'value1': data.number,
                    'value2': data.message
                }
            });
        } catch (err) {
            console.error(err);
        }

        const message = new Message({
            text: data.message,
            number: data.number,
            type: 'outgoing'
        });

        await message.save(message);
        console.log(`Message sent to ${data.number}: ${data.message}`);
    },
    async sendBatchMessages(data) {
        const promises = data.map(message => {
            this.sendSingleMessage(message);
        });
        return await Promise.all(promises);
    }
};