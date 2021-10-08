const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');
const random = require('mongoose-simple-random');
const { animalTypes } = require('../config/strings.js');

const FactSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true, unique: true },
    sendDate: { type: Date },
    type: { type: String, enum: animalTypes, default: 'cat' },
    status: {
        verified: { type: Boolean, default: null },
        feedback: { type: String },
        sentCount: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

/**
 * Soft delete implementation
 * https://github.com/dsanel/mongoose-delete
 */
FactSchema.plugin(mongooseDelete, { overrideMethods: true });
FactSchema.plugin(random);

FactSchema.statics.getFact = function({ amount = 1, filter = {}, animalType = 'cat' }) {

    if (typeof animalType === 'string') {
        animalType = [animalType];
    }

    const query = {
        ...filter,
        type: { $in: animalType }
    };

    return new Promise((resolve, reject) => {
        this.findRandom(query, {}, { limit: amount }, (err, facts) => {
            if (err) return reject(err);
            facts = facts || [];

            resolve(amount == 1 ? facts[0] : facts);
        });
    });
};

const Fact = mongoose.model('Fact', FactSchema);

module.exports = Fact;