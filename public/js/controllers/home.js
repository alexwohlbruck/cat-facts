/* global angular */
var app = angular.module('catfacts');

app.controller('HomeCtrl', function($scope, $http) {
    $scope.carousel = {
        catImages: []
    };
    
    $scope.carousel.index++;
    $http.defaults.useXDomain = true;
    
    // Get some cat facts for tagline
    $http({
        method: 'GET',
        url: 'https://cat-fact-alexwohlbruck.c9users.io/fact'
    }).then(function(response) {
        $scope.fact = response.data.text;
    })
        
    // Get background images from Imgur
    $http({
        method: 'GET',
        url: 'https://api.imgur.com/3/gallery/r/cats',
        headers: {
            'Authorization': 'Client-ID 9350ca7bffa3250'
        }
    }).then(function(response) {
        var images = response.data.data;
        for (var i = 0; i < images.length; i++) {
            $scope.carousel.catImages.push(images[i]);
        }
    }, function(error) {
        console.log(error);
    });
    
});