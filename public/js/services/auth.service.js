/* global angular */
var app = angular.module('catfacts');

app.service('AuthService', ['$http', function($http) {
    this.getAuthenticatedUser = function() {
        return $http.get('/auth/me');
    };
}]);