var IFTTT = require('node-ifttt-maker');
var ifttt = new IFTTT('nUqHZO09Tu4HJviLOAsXS8z5Hc2E6fErBRjHtK6tNOQ');

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
        });
    }
};