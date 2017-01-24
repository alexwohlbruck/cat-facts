var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        first:  {type: String, required: true},
        last:   {type: String, required: true}
    },
    email:      {type: String, required: true, unique: true},
    google: {
        id:     {type: String},
        refreshToken: {type: String}
    }
}, {
    timestamps: true
});

var User = mongoose.model('User', UserSchema);

module.exports = User; 