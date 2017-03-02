var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    text: {type: String, required: true},
    number: {type: String, required: true},
    type: {type: String, enum: ['incoming', 'outgoing']}
}, {
    timestamps: true
});

MessageSchema.createIndex({ "createdAt": 1 }, { expireAfterSeconds: (60 * 60 * 24 * 7 * 2) });

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;