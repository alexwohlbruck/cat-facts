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
};