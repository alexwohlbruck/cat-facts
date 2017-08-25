const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Promise = require('bluebird');

const UnsubscribeDateSchema = new Schema({
    start: {type: Date, required: true},
    end: {type: Date, required: true}
}, {
    timestamps: true
});

const isBetweenDates = function(target, min, max) {
    return (min < target) && (target < max);
};

UnsubscribeDateSchema.statics.allowUnsubscribe = function() {
    return new Promise((resolve, reject) => {
        this.model('UnsubscribeDate').find().then(unsubscribableDates => {
            const now = new Date();
            
            const canUnsubscribe = unsubscribableDates
                .map(range => {
                    return isBetweenDates(now, range.start, range.end);
                })
                .reduce((sum, value) => sum || value);
                
            resolve(canUnsubscribe);
        }, err => {
            reject(err);
        });
    });
};

const UnsubscribeDate = mongoose.model('UnsubscribeDate', UnsubscribeDateSchema);

module.exports = UnsubscribeDate;