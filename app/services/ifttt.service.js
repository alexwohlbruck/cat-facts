var keys = require.main.require('./app/config/keys');
var IFTTT = require('node-ifttt-maker');
var ifttt = new IFTTT(keys.ifttt.apiKey);
var Message = require.main.require('./app/models/message');

module.exports = {
    sendSingleMessage: function(data) {
        return new Promise(function(resolve, reject) {
            ifttt.request({
                event: 'message:send:single',
                method: 'GET',
                params: {
                    'value1': data.number,
                    'value2': data.message
                }
            }, function(err) {
                if (err) return reject(err);
                
                var message = new Message({
                    text: data.message,
                    number: data.number,
                    type: 'outgoing'
                });
                
                message.save(message).then(function() {
                    resolve(message);
                }, function(err) {
                    reject(err);
                });
            });
        });
    }
};