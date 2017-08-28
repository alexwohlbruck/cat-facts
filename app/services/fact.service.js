var Fact = require.main.require('./app/models/fact');
var request = require('request-promise');

module.exports = {
	getFact: function(options) {
		if (!options) options = {};
		if (!options.amount) options.amount = 1;
		
		return new Promise((resolve, reject) => {
			Fact.findRandom({}, {}, {limit: options.amount}, (err, facts) => {
				if (err) return reject(err);
				if (options.amount == 1 && options.setUsed && !facts[0].sendDate) {
					Fact.findOneAndUpdate({_id: facts[0]._id}, {used: true});
				}
				resolve(options.amount == 1 ? facts[0] : facts);
			});
		});
	},
	getFactFromApi: function(amount) {
		if (!amount) amount = 1;
		
		return new Promise((resolve, reject) => {
			request({
				method: 'GET',
				uri: 'https://catfacts-api.appspot.com/api/facts?number='+amount,
			}).then(response => {
				var facts = JSON.parse(response).facts;
				if (amount == 1) facts = facts[0];
				resolve(facts);
			}, err => {
				reject(err);
			});
		});
	}
};