/* global angular */
var app = angular.module('catfacts');

app.service('RecipientService', ['$http', '$rootScope',
    function($http, $rootScope) {
    
    this.getRecipients = function() {
        return $http.get('/recipients/me');
    };
    
    this.addRecipient = function(recipient) {
        if (recipient.name && recipient.number) {
            return $http.post('/recipients', recipient);
        } else {
            $rootScope.toast({message: "Provide a name and phone number"});
        }
    };
    
    this.addRecipients = function(recipients) {
        // TODO: Create api endpoint to create multiple recipients (Possibly combine into the current one)
    };
    
    this.getGoogleContacts = function() {
        return $http.get('/contacts'); 
    };
}]);