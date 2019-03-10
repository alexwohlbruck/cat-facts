/* global angular */
var app = angular.module('catfacts');

app.controller('HomeCtrl', ['$scope', '$rootScope', '$http', '$state', '$window', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, $http, $state, $window, $mdDialog, $mdMedia) {
    
    $scope.carousel = {
        catImages: []
    };
    
    $scope.carousel.index++;
    $http.defaults.useXDomain = true;
    
    $scope.openApp = function() {
        if ($rootScope.authenticatedUser) {
            $state.go('facts');
        } else {
            $window.location.href = '/auth/google';
        }
    };
    
    $scope.openUnsubscribe = function() {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                
                $scope.cancel = $mdDialog.hide;
                $scope.$state = $state;
                
                $scope.unsubscribe = function() {
                    // $scope.number
                    
                    // TODO: Validate number and send verification code
            
                    // TODO: Prompt user to enter verification code
                    
                    // TODO: Verify code
                    
                    $mdDialog.close();
                };
            }],
            templateUrl: 'views/partials/unsubscribe.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
            
        }).then(number => {
            
            $rootScope.toast("Succsesfully removed (***) ***-****");
            
        }, err => {
            $rootScope.toast(err);
        });
    };
    
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
    
}]);