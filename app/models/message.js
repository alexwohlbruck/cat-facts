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

Message.remove({text: "The ancestor of all domestic cats is the African Wild Cat which still exists today."}, function(err, data) {
    console.log(err,data);
})