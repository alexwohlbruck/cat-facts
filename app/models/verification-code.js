const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const VerificationCodeSchema = new Schema({
    code: {type: String, required: true, unique: true, default: shortid.generate},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: String, enum: ['phone'], default: 'phone'},
    data: {type: String, required: true}
}, {
    timestamps: true
});

VerificationCodeSchema.index({ "createdAt": 1 }, { expireAfterSeconds: (60 * 60 * 1) });

const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);

module.exports = VerificationCode;