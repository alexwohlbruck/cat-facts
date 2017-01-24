var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UpvoteSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    fact: {type: Schema.Types.ObjectId, ref: 'Fact', required: true}
});

UpvoteSchema.index({user: 1, fact: 1}, {unique: true});

var Upvote = mongoose.model('Upvote', UpvoteSchema);

module.exports = Upvote;