var Fact = require.main.require('./app/models/fact');
var request = require('request-promise');

module.exports = {
	getFact ({amount = 1, filter = {}}) {
		return new Promise((resolve, reject) => {
			Fact.findRandom(filter, {}, {limit: amount}, (err, facts) => {
				if (err) return reject(err);
				facts = facts || [];
				
				resolve(amount == 1 ? facts[0] : facts);
			});
		});
	},
	
	getFactFromApi (amount = 1) {
		return new Promise((resolve, reject) => {
			request({
				method: 'GET',
				uri: 'https://catfacts-api.appspot.com/api/facts?number='+amount,
			})
			.then(response => {
				
				var facts = JSON.parse(response).facts;
				if (amount == 1) facts = facts[0];
				resolve(facts);

			}, reject);
		});
	}
};