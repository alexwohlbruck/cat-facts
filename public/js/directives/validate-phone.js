/* global angular */
var app = angular.module('catfacts');

app.directive('validatePhone', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
            ngModel.$asyncValidators.validatePhone = function(modelValue, viewValue) {
                const number = viewValue;
                const trim = number.replace(/[^0-9]/gi, '').trim();
                
                return trim.length == 10;
            };
        }
    };
});