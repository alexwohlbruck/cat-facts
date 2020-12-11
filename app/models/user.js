const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const mongooseDelete = require('mongoose-delete');

const keys = require.main.require('./app/config/keys');
const strings = require.main.require('./app/config/strings');

// Make email and phone docs unique except for those that are flagged as deleted
const uniquePartialIndex = {
    unique: true,
    partialFilterExpression: {
        deleted: false
    }
};

const UserSchema = new Schema({
    name: {
        first:  {type: String, required: true},
        last:   {type: String, required: true}
    },
    email:      {type: String},
    phone:      {type: String},
    photo:      {type: String, default: strings.userPhotoUrl},
    google: {
        id:           {type: String},
        accessToken:  {type: String},
        refreshToken: {type: String}
    },
    isAdmin: {type: Boolean, default: false},
    ip: String
}, {
    timestamps: true
});

UserSchema.statics.encryptAccessToken = function(plainText) {
    return crypto
        .createCipher(keys.encryption.algorithm, keys.encryption.key)
        .update(plainText, 'utf-8', 'hex');
};

UserSchema.statics.decryptAccessToken = function(cipher) {
    return crypto
        .createDecipher(keys.encryption.algorithm, keys.encryption.key)
        .update(cipher, 'hex', 'utf-8');
};

UserSchema.plugin(mongooseDelete, {overrideMethods: true});

UserSchema.index({email: 1, phone: 1}, uniquePartialIndex);

var User = mongoose.model('User', UserSchema);

module.exports = User;