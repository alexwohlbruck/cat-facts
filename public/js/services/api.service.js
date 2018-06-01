/* global angular */
var app = angular.module('catfacts');

app.service('ApiService', ['$rootScope', '$http', '$location', function($rootScope, $http, $location) {
    
    // User
    
    this.getAuthenticatedUser = function() {
        return $http.get('/users/me');
    };
    
    this.deleteAccount = function({verificationEmail}) {
        return $http.delete('/users/me', {params: {verificationEmail}});
    };
    
    this.verifyPhone = function(phone) {
        return $http.post('/users/me/profile/phone/verification-code', {phone});
    };
    
    this.updatePhone = function(verificationCode) {
        return $http.put('/users/me/profile/phone', {verificationCode});
    };
    
    this.signOut = function() {
        return $http.get('/auth/signout').then(() => {
            $rootScope.authenticatedUser = null;
            $location.path('/');
        });
    };
        
    // Fact
    
    this.getSubmittedFacts = function({animalType}) {
        console.log(animalType);
        
        return $http.get('/facts', {params: {
            animal_types: animalType
        }});
    };
    
    this.submitFact = function(fact) {
        return $http.post('/facts', fact);
    };
    
    this.upvoteFact = function(factID) {
        return $http.post('/facts/' + factID + '/upvote');
    };
    
    this.unvoteFact = function(factID) {
        return $http.delete('/facts/' + factID + '/upvote');
    };
    
    this.getFact = function(amount) {
        return $http.get('/facts/random', {
            params: { amount }
        });
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
    
    this.addRecipients = function(recipients) {
        return $http.post('/recipients', recipients);
    };
    
    this.editRecipient = function(recipient) {
        console.log(recipient);
        return $http.patch('/recipients/' + recipient._id, recipient);
    };
    
    this.deleteRecipients = function(options) {
        // options: { recipients[], permanent (bool) }
        return $http({
            url: '/recipients',
            method: 'DELETE',
            params: options
        });
    };
    
    this.restoreRecipient = function(recipient) {
        return $http.patch('/recipients/' + recipient._id);
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