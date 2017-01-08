var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recipientSchema = new Schema({
    name: String,
    number: {type: String, required: true, validate: validateNumber, unique: true}
});

function validateNumber(string) {
    return string.length == 10;
}

var Recipient = mongoose.model('Recipient', recipientSchema);

module.exports = Recipient; 