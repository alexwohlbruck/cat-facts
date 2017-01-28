/* global angular */
var app = angular.module('catfacts');

app.directive('message', function() {
    return {
        restrict: 'E',
        scope: {
            message: "="
        },
        templateUrl: '/views/directives/message.directive.html'
    };
});