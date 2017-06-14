var Fact = require.main.require('./app/models/fact');
var FactService = require.main.require('./app/services/fact.service');

module.exports = {
    scrape: function(amount) {
        // Grab facts from Cat Facts api and save them into local db
        return new Promise((resolve, reject) => {
            FactService.getFactFromApi((amount && !isNaN(amount) && amount <= 100) ? amount : 100).then(facts => {
                facts = facts.map(fact => {
                    return {
                        text: fact,
                        used: false,
                        source: 'api'
                    };
                });
                
                Fact.insertMany(facts, {ordered: false}).then(data => {
                    resolve(data);
                }, err => {
                    if (err.code == 11000) {
                        var duplicateCount = err.writeErrors ? err.writeErrors.length : 0;
                        resolve(duplicateCount);
                    }
                    reject(err);
                });
            }, err => {
                reject(err);
            });
        });
    }
};