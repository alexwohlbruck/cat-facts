var http = require('http');

module.exports = {
	getFact: function(cb) {
		return new Promise(function(resolve, reject) {
			var options = {
				host: 'catfacts-api.appspot.com',
				path: '/api/facts?number=1'
			};
				
			http.get(options, function(res){
				res.setEncoding('utf8');
				res.on('data', function(data){
					var fact = JSON.parse(data).facts[0];
					if (cb) cb(fact);
					resolve(fact);
				});
			}).on("error", function(err) {
				if (cb) cb(err.message);
				reject(err);
			});
		});
	}
};