var keys = require.main.require('./app/config/keys');
var IFTTT = require('node-ifttt-maker');
var ifttt = new IFTTT(keys.ifttt.apiKey);
var Message = require.main.require('./app/models/message');

module.exports = {
    sendSingleMessage: function(data) {
        ifttt.request({
            event: 'message:send:single',
            method: 'GET',
            params: {
                'value1': data.number,
                'value2': data.message
            }
        }, function(err) {
            if (err) console.log(err);
            
            var message = new Message({
                text: data.message,
                number: data.number,
                type: 'outgoing'
            });
            
            message.save();
        });
    }
};