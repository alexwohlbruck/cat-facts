/* global angular */
var app = angular.module('catfacts');

app.directive('message', messageDirective);

messageDirective.$inject(['$state']);

function messageDirective($state) {
    return {
        restrict: 'E',
        scope: {
            message: "=",
            stale: "="
        },
        templateUrl: '/views/directives/message.html',
        controller: function($scope, $state) {
            $scope.currentAnimal = $state.params.animal;
        }
    };
}