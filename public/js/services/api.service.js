/* global angular */
var app = angular.module('catfacts');

app.service('ApiService', ['$rootScope', '$http', function($rootScope, $http) {
        
    // Fact
    
    this.getSubmittedFacts = function() {
        return $http.get('/facts/submitted');
    };
    
    this.submitFact = function(fact) {
        return $http.post('/facts/submitted', fact);
    };
    
    this.upvoteFact = function(factID) {
        return $http.post('/facts/submitted/' + factID + '/upvote');
    };
    
    this.unvoteFact = function(factID) {
        return $http.delete('/facts/submitted/' + factID + '/upvote');
    };
    
    this.getFact = function() {
        return $http.get('/facts');
    };
    
    // Recipient
    
    this.getRecipients = function() {
        return $http.get('/recipients');
    };
    
    this.getMyRecipients = function() {
        return $http.get('/recipients/me');
    };
    
    this.addRecipient = function(recipient) {
        if (recipient.name && recipient.number) {
            return $http.post('/recipients', recipient);
        } else {
            $rootScope.toast({message: "Provide a name and phone number"});
        }
    };
    
    this.deleteRecipients = function(options) {
        // options: { recipients[], permanent (bool) }
        return $http({
            url: '/recipients',
            method: 'DELETE',
            params: options
        });
    };
    
    this.addRecipients = function(recipients) {
        return $http.post('/recipients', recipients);
    };
    
    this.getGoogleContacts = function() {
        return $http.get('/contacts'); 
    };
    
    // Conversation
    
    this.getConversation = function(number) {
        return $http.get('/recipients/' + number + '/conversation');
    };
    
    // Console
    
    this.getConsoleData = function() {
        return $http.get('/console/data');
    };
    
}]);