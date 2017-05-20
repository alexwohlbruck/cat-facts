var request = require('request-promise');

module.exports = {
	getFact: function(amount) {
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