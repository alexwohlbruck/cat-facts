var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var strings = require.main.require('./app/config/strings');

var RecipientSchema = new Schema({
    name: String,
    number: {type: String, required: true, validate: validateNumber, unique: true},
    addedBy: {type: Schema.Types.ObjectId, ref: 'User'}
}, {
    timestamps: true
});

function validateNumber(string) {
    return string.length == 10;
}

RecipientSchema.path('number').validate(function(number, done) {
    this.model('Recipient').count({number: number}, function(err, count) {
        if (err) return done(err);
        done(!count);
    });
}, strings.recipient.exists);

var Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = Recipient; 