/* global angular */
var app = angular.module('catfacts');

app.service('ConversationService', ['$http', function($http) {
    this.getConversation = function(number) {
        return $http.get('/conversations/' + number);
    };
}]);