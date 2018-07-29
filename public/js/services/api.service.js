/* global angular */
var app = angular.module('catfacts');

app.service('ApiService', ['$rootScope', '$http', '$location', function($rootScope, $http, $location) {
    
    // User
    
    this.getAuthenticatedUser = function() {
        return $http.get('/users/me');
    };
    
    this.deleteAccount = function({ verificationEmail }) {
        return $http.delete('/users/me', {params: { verificationEmail }});
    };
    
    this.verifyPhone = function(phone) {
        return $http.post('/users/me/profile/phone/verification-code', {phone});
    };
    
    this.updatePhone = function(verificationCode) {
        return $http.put('/users/me/profile/phone', { verificationCode });
    };
    
    this.signOut = function() {
        return $http.get('/auth/signout').then(() => {
            $rootScope.authenticatedUser = null;
            $location.path('/');
        });
    };
        
    // Fact
    
    this.getSubmittedFacts = function({ animalType }) {
        return $http.get('/facts', {params: {
            animal_type: animalType
        }});
    };
    
    this.submitFact = function({factText, animalType}) {
        return $http.post('/facts', {factText, animalType});
    };
    
    this.upvoteFact = function(factID) {
        return $http.post('/facts/' + factID + '/upvote');
    };
    
    this.unvoteFact = function(factID) {
        return $http.delete('/facts/' + factID + '/upvote');
    };
    
    this.getFact = function({ animalType, amount }) {
        return $http.get('/facts/random', {
            params: { animal_type: animalType, amount }
        });
    };
    
    // Recipient
    
    this.getRecipients = function() {
        return $http.get('/recipients');
    };
    
    this.getMyRecipients = function({ animalType }) {
        return $http.get('/recipients/me', {params: {
            animal_type: animalType
        }});
    };
    
    this.addRecipient = function({ recipient, animalTypes }) {
        if (!recipient.name || !recipient.number) {
            $rootScope.toast({message: "Provide a name and phone number"});
        }
        if (!animalTypes) {
            
        }
        
        return $http.post('/recipients', {
            recipient,
            animalTypes
        });
    };
    
    this.addRecipients = function({ recipients, animalTypes }) {
        return $http.post('/recipients', {
            recipients,
            animalTypes
        });
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