var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-simple-random');

var FactSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    text: {type: String, required: true, unique: true},
    used: {type: Boolean, default: false},
    source: {type: String, enum: ['user', 'api'], default: 'user'}
});

FactSchema.plugin(random);

var Fact = mongoose.model('Fact', FactSchema);

module.exports = Fact;