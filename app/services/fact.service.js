var Fact = require.main.require('./app/models/fact');
var request = require('request-promise');

module.exports = {
	getFact: function(options) {
		if (!options) options = {};
		if (!options.amount) options.amount = 1;
		
		return new Promise(function(resolve, reject) {
			Fact.findRandom({}, {}, {limit: options.amount}, function(err, facts) {
				if (err) return reject(err);
				if (options.amount == 1 && options.setUsed) {
					Fact.findOneAndUpdate({_id: facts[0]._id}, {used: true});
				}
				facts = facts.map(o => o.text);
				resolve(options.amount == 1 ? facts[0] : facts);
			});
		});
	},
	getFactFromApi: function(amount) {
		if (!amount) amount = 1;
		
		return new Promise(function(resolve, reject) {
			request({
				method: 'GET',
				uri: 'https://catfacts-api.appspot.com/api/facts?number='+amount,
			}).then(function(response) {
				var facts = JSON.parse(response).facts;
				if (amount == 1) facts = facts[0];
				resolve(facts);
			}, function(err) {
				reject(err);
			});
		});
	}
};