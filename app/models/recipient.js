const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const strings = require.main.require('./app/config/strings');
const mongooseDelete = require('mongoose-delete');

const RecipientSchema = new Schema({
    name: { type: String, default: undefined },
    notes: { type: String, default: undefined },
    number: {
        type: String,
        required: true,
        unique: true,
        validate: [
            function phoneNumber(string) {
                return string.length == 10;
            }
        ]
    },
    addedBy: {type: Schema.Types.ObjectId, ref: 'User'},
}, {
    timestamps: true
});

RecipientSchema.path('number').validate(function(number, done) {
    this.model('Recipient').count({number: number}, function(err, count) {
        if (err) return done(err);
        done(!count);
    });
}, strings.recipient.exists);

/**
 * Soft delete implementation
 * https://github.com/dsanel/mongoose-delete
 */
RecipientSchema.plugin(mongooseDelete, {overrideMethods: true});

const Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = Recipient;