var http = require('http');

module.exports = {
    getFact: function(cb) {
    	var options = {
    		host: 'catfacts-api.appspot.com',
    		path: '/api/facts?number=1'
    	};
    		
    	http.get(options, function(res){
    		res.setEncoding('utf8');
    		res.on('data', function(data){
    			cb(JSON.parse(data).facts[0]);
    		});
    	}).on("error", function(e){
    		cb(e.message);
    	});
    }
};