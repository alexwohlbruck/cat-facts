const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');
const random = require('mongoose-simple-random');

const FactSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    text: {type: String, required: true, unique: true},
    sendDate: {type: Date},
    used: {type: Boolean, default: false},
    source: {type: String, enum: ['user', 'api'], default: 'user'}
}, {
    timestamps: true
});

/**
 * Soft delete implementation
 * https://github.com/dsanel/mongoose-delete
 */
FactSchema.plugin(mongooseDelete, {overrideMethods: true});
FactSchema.plugin(random);

const Fact = mongoose.model('Fact', FactSchema);

module.exports = Fact;