/* global angular */
var app = angular.module('catfacts');

app.service('FactService', function($http) {
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
});