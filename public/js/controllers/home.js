/* global angular */
var app = angular.module('catfacts');

app.controller('HomeCtrl', ['$scope', '$rootScope', '$http', '$state', '$window', '$mdDialog', '$mdMedia', 'ApiService',
    function($scope, $rootScope, $http, $state, $window, $mdDialog, $mdMedia, ApiService) {
    
    $scope.carousel = {
        catImages: []
    };
    
    $scope.carousel.index++;
    $http.defaults.useXDomain = true;
    
    $scope.openApp = function() {
        $state.go('facts');
    };
    
    $scope.signIn = function() {
        if ($rootScope.authenticatedUser) {
            $scope.openApp();
        } else {
            $window.location.href = '/auth/google';
        }
    };
    
    $scope.openUnsubscribe = function() {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                
                $scope.cancel = $mdDialog.hide;
                $scope.$state = $state;
                $scope.showCodeEntry = false;
                
                $scope.verifyPhone = function() {
                    
                    ApiService.verifyPhone($scope.number).then(() => {
                        $scope.showCodeEntry = true;
                    }, err => {
                        $rootScope.toast({
                            message: err.data.message ||
                                "Error sending verification code"
                        });
                    });
                };
                
                $scope.unsubscribe = function() {
                    
                    ApiService.unsubscribe($scope.code).then(res => {
                        $rootScope.toast({message: res.data.message});
                        $mdDialog.hide();
                    }, err => {
                        $rootScope.toast({
                            message: err.data.message || "Error unsubscribing"
                        });
                    });
                };
            }],
            templateUrl: 'views/partials/unsubscribe.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        });
    };
    
    // Get some cat facts for tagline
    $http({
        method: 'GET',
        url: 'https://cat-fact-alexwohlbruck.c9users.io/fact'
    }).then(function(response) {
        $scope.fact = response.data.text;
    });
        
    // Get background images from Imgur
    $http({
        method: 'GET',
        url: 'https://api.imgur.com/3/gallery/r/cats',
        headers: {
            'Authorization': 'Client-ID 160806899cb2d43'
        }
    }).then(function(response) {
        var images = response.data.data;
        for (var i = 0; i < images.length; i++) {
            $scope.carousel.catImages.push(images[i]);
        }
    }, function(error) {
        console.log(error);
    });
    
}]);