var Fact = require.main.require('./app/models/fact');
var FactService = require.main.require('./app/services/fact.service');

module.exports = {
    scrape: function(amount) {
        return new Promise(function(resolve, reject) {
            FactService.getFact((amount && !isNaN(amount) && amount <= 100) ? amount : 100).then(function(facts) {
                facts = facts.map(fact => {
                    return {
                        text: fact,
                        used: false,
                        source: 'api'
                    };
                });
                
                Fact.insertMany(facts, {ordered: false}).then(function(data) {
                    resolve(data);
                }, function(err) {
                    if (err.code == 11000) {
                        var duplicateCount = err.writeErrors ? err.writeErrors.length : 0;
                        resolve(duplicateCount);
                    }
                    reject(err);
                });
            }, function(err) {
                reject(err);
            });
        });
    }
};