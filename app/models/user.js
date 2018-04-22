var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var keys = require.main.require('./app/config/keys');
var strings = require.main.require('./app/config/strings');

var UserSchema = new Schema({
    name: {
        first:  {type: String, required: true},
        last:   {type: String, required: true}
    },
    email:      {type: String, unique: true, sparse: true},
    phone:      {type: String, unique: true, sparse: true},
    photo:      {type: String, default: strings.userPhotoUrl},
    google: {
        id:           {type: String},
        accessToken:  {type: String},
        refreshToken: {type: String}
    },
    isAdmin: {type: Boolean, default: false},
    settings: {
        theme: {
            type: String,
            required: true,
            enum: ['light', 'dark'],
            default: 'light'
        }
    },
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

var User = mongoose.model('User', UserSchema);

module.exports = User;