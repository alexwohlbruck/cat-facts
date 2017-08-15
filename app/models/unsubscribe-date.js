var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UnsubscribeDateSchema = new Schema({
    start: {type: Date, required: true},
    end: {type: Date, required: true}
}, {
    timestamps: true
});

var UnsubscribeDate = mongoose.model('UnsubscribeDate', UnsubscribeDateSchema);

module.exports = UnsubscribeDate;