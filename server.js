var http = require('http');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
var server = http.createServer(app);
var apiai = require('apiai');
var morgan = require('morgan');
var catbot = apiai('64bea369650e4de59e7aee3dbb03efdd');
var Recipient = require.main.require('./app/models/recipient');

var code = 'bDsL3w9CxAweA2sX';

mongoose.connect('mongodb://alexwohlbruck:' + code + '@ds157298.mlab.com:57298/cat-facts');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.configure(function() {
  app.use(morgan('dev'));
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
app.get('/text', function(req, res) {
  console.log(req.query);
  if (!req.query.query) return res.status(400).json({"message": "No text query provided"});
  if (!req.query.number) return res.status(400).json({"message": "No phone number provided"});
  
  Recipient.findOne({number: req.query.number}).then(function(recipient) {
    if (recipient) {
      
      var request = catbot.textRequest(req.query.query, {
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
      
    } else {
      var newRecipient = new Recipient({
        name: req.query.name,
        number: req.query.number.replace(/\D/g,'').replace(/^1+/, '')
      });
      
      newRecipient.save().then(function() {
        console.log('saved');
        return res.status(200).json({
          response: "Thanks for signing up for Cat Facts! You will now recieve fun facts about CATS every day! =^.^="
        });
      }, function(err) {
        console.log(err);
        return res.status(400).json(err);
      });
    }
  }, function(err) {
    return res.status(400).json(err);
  });
});

app.get('/fact', function(req, res) {
  getFact(function(message) {
      return res.json({
        displayText: message,
    });
  });
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

app.get('/recipients', function(req, res) {
  if (req.query && req.query.code == code) {
    Recipient.find().then(function(recipients) {
      getFact(function(fact) {
        return res.status(200).json({
          fact: fact,
          recipients: recipients
        });
      });
    }, function(err) {
      return res.status(400).json(err);
    });
  } else {
    return res.status(400).json({message: "Provide the code to recieve recipients"});
  }
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
