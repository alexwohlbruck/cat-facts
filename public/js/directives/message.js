/* global angular */
var app = angular.module('catfacts');

app.directive('message', function() {
    return {
        restrict: 'E',
        scope: {
            message: "=",
            stale: "="
        },
        templateUrl: '/views/directives/message.html'
    };
});