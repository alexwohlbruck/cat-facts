var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FactSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    used: {type: Boolean, default: false}
});

var Fact = mongoose.model('Fact', FactSchema);

module.exports = Fact; 