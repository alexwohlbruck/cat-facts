var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    text: {type: String, required: true},
    number: {type: String, required: true},
    type: {type: String, enum: ['incoming', 'outgoing']}
}, {
    timestamps: true
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;