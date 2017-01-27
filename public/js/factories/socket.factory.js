/* global angular, io */
var app = angular.module('catfacts');

app.factory('socket', ['socketFactory', '$location', function(socketFactory, $location) {
    return socketFactory({
        ioSocket: io.connect($location.$$absUrl + '/')
    });
}]);