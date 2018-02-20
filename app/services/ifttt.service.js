var keys = require.main.require('./app/config/keys');
var IFTTT = require('node-ifttt-maker');
var ifttt = new IFTTT(keys.ifttt.apiKey);
var Message = require.main.require('./app/models/message');

// Maybe use pushbullet instead? It supports native SMS sending
// https://github.com/alexwhitman/node-pushbullet-api

module.exports = {
    sendSingleMessage: data => {
        return new Promise(async (resolve, reject) => {
            
            try {
                await ifttt.request({
                    event: 'message:send:single',
                    method: 'GET',
                    params: {
                        'value1': data.number,
                        'value2': data.message
                    }
                });
                
                const message = new Message({
                    text: data.message,
                    number: data.number,
                    type: 'outgoing'
                });
                
                try {
                    await message.save(message);
                    resolve(message);
                }
                
                catch (err) {
                    reject(err);
                }
            }
            
            catch (err) {
                return reject(err);
            }
        });
    }
};