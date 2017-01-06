var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var apiai = require('apiai');
var catbot = apiai('64bea369650e4de59e7aee3dbb03efdd');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

var getFact = function(cb) {
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
};

app.get('/', function(req, res) {
  return res.json({message: "Use POST /fact to get a cat fact"});
});

// Request made from tasker when text message is recieved
app.post('/text', function(req, res) {
  if (!req.body.query) return res.status(400).json({"message": "No text query provided"});
  
  var request = catbot.textRequest(req.body.query, {
    sessionId: 'UH2fKhXFIvPAx7Us3i2sGdApIIBCiIkgb7IS'
  });
  
  request.on('response', function(response) {
    if (!response.result.fulfillment.speech) {
      getFact(function(message) {
        return res.status(200).json({
          response: message
        });
      });
    } else {
      return res.status(200).json({
        response: response.result.fulfillment.speech
      });
    }
  });
  
  request.on('error', function(err) {
    return res.status(400).json(err);
  });
  
  request.end();
});

app.post('/fact', function(req, res) {
  getFact(function(message) {
      return res.json({
        speech: message,
        displayText: message,
        data: {},
        contextOut: [],
        source: "Cat Facts"
    });
  });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
