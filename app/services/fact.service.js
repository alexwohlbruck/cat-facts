var http = require('http');
var bluebird = require('bluebird');

module.exports = {
	getFact: function(cb) {
		var deferred = bluebird.defer(),
				options = {
				host: 'catfacts-api.appspot.com',
				path: '/api/facts?number=1'
			};
			
		http.get(options, function(res){
			res.setEncoding('utf8');
			res.on('data', function(data){
				var fact = JSON.parse(data).facts[0];
				if (cb) cb(fact);
				deferred.resolve(fact);
			});
		}).on("error", function(err) {
			if (cb) cb(err.message);
			deferred.reject(err);
		});
		
		return deferred.promise;
	}
};