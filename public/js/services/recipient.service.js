/* global angular */
var app = angular.module('catfacts');

app.service('RecipientService', ['$http', '$rootScope',
    function($http, $rootScope) {
    
    this.getRecipients = function() {
        return $http.get('/recipients/me');
    };
    
    this.addRecipient = function(data) {
        if (data.name && data.number) {
            return $http.post('/recipients', data);
        } else {
            $rootScope.toast({message: "Provide a name and phone number"});
        }
    };
}]);