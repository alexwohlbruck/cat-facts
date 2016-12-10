//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var express = require('express');

var router = express();
var server = http.createServer(router);

router.post('/fact', function(req, res) {
    var options = {
      host: 'catfacts-api.appspot.com',
      path: '/api/facts?number=1'
    };
    
    var finish = function(message) {
        return res.json({
          "speech": message,
          "displayText": message,
          "data": {},
          "contextOut": [],
          "source": "Cat Facts"
      });
    };
    
    http.get(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function(data){
        finish(JSON.parse(data).facts[0]);
      });
    }).on("error", function(e){
      finish(e.message);
    });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
