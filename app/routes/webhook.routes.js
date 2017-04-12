var express = require('express');
var router = express.Router();
var bluebird = require('bluebird');
var Recipient = require.main.require('./app/models/recipient');
var strings = require.main.require('./app/config/strings');
var IFTTTService = require.main.require('./app/services/ifttt.service.js');
var FactService = require.main.require('./app/services/fact.service');

var processWebhook = function(req) {
    var deferred = bluebird.defer();
    
    if (req.body && req.body.result) {
    	
    	switch (req.body.result.action) {
    	    case 'fact.get':
    	        
                FactService.getFact().then(function(fact) {
                    deferred.resolve(fact);
                });
            
            break;
            
            case 'recipient.add':
                if (req.body.result.parameters) {
                    var parameters = req.body.result.parameters,
                        name = parameters['given-name'] + (parameters['last-name'] ? ' ' + parameters['last-name'] : ''),
                        number = parameters['phone-number'].replace(/\D/g,'');
                        
                    if (number.length != 10 || number.length != 11)
                        return deferred.reject({message: strings.invalidNumber});
                        
                    var recipient = new Recipient({
                            name: name,
                            number: number
                        });
                        
                    recipient.save().then(function() {
                        IFTTTService.sendSingleMessage({
                            number: parameters['phone-number'],
                            message: strings.welcomeMessage
                        });
                        
                        deferred.resolve(req.body.result.fulfullment.messages[0].speech);
                        
                    }, function(err) {
                        deferred.reject(err);
                    });
                } else {
                    deferred.reject();
                }
            break;
                
            default:
                deferred.reject();
            break;
    	}
    } else {
        deferred.reject();
    }
	
	return deferred.promise;
};


// Route for api.ai webhook
router.post('/', function(req, res) {
    
    processWebhook(req).then(function(message) {
        
        return res.json({
        	speech: message,
        	displayText: message,
        	data: {},
        	contextOut: [],
        	source: "Cat Facts"
        });
        
    }, function(err) {
        var message = err.message || err.errors[Object.keys(err.errors)[0]].message || strings.error;
        return res.json({displayText: message, speech: message, data: err});
    });
	
});

module.exports = router;