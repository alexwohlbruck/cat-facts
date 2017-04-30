var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var keys = require.main.require('./app/config/keys');

var UserSchema = new Schema({
    name: {
        first:  {type: String, required: true},
        last:   {type: String, required: true}
    },
    email:      {type: String, required: true, unique: true},
    google: {
        id:     {type: String},
        accessToken: {type: String},
        refreshToken: {type: String}
    }
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