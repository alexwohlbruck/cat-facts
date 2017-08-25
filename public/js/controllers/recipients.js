/* global angular */
var app = angular.module('catfacts');

app.controller('RecipientsCtrl', ['$scope', '$rootScope', 'ApiService', 'AuthService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, ApiService, AuthService, $mdDialog, $mdMedia) {
    
    $scope.recipients = [];
    $scope.AuthService = AuthService;
    
    $scope.orderBy = 'name';
    
    getMyRecipients();
    
    $scope.addRecipient = function() {
        var name = $scope.form.name, number = $scope.form.number;
        
        if (name && number && number.replace(/[^0-9]/gi, '').trim().length == 10) {
            
            ApiService.addRecipient({
                name: name,
                number: number.replace(/[^0-9]/gi, '').trim()
            }).then(function(response) {
                $scope.recipients.push(response.data);
                $rootScope.toast({message: "Recipient added!"});
                $scope.form = null;
            }, function(err) {
                console.log(err);
                $rootScope.toast({message: err.data.errors[Object.keys(err.data.errors)[0]].message || err.data.message});
            });
            
        } else {
            $rootScope.toast({message: "Invalid name or number"});
        }
    };
    
    $scope.openImportContacts = function(contacts) {
        $mdDialog.show({
            controller: ['$scope', '$rootScope', '$mdDialog', 'ApiService', function($scope, $rootScope, $mdDialog, ApiService) {
                $scope.contacts = contacts;
                $scope.table = {orderBy: 'name'};
                $scope.selectedContacts = [];
                
                $scope.finish = function() {
                    if ($scope.selectedContacts.length > 0) {
                        $mdDialog.hide($scope.selectedContacts);
                    } else {
                        $mdDialog.cancel();
                    }
                };
                
                $scope.checkScopesAndGetContacts = function() {
                    $scope.promise = ApiService.getGoogleContacts().then(function(response) {
                        $scope.contacts = response.data;
                    }, function(err) {
                        if (err.status == 403 || err.status == 401) AuthService.openOAuth();
                    });
                };
                
                $rootScope.$on('contacts:import', function() {
                    $scope.checkScopesAndGetContacts();
                });
                
                (function() {
                    $scope.checkScopesAndGetContacts();
                })();
            }],
            templateUrl: '/views/partials/contacts.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        })
        .then(function(recipients) {
            
            ApiService.addRecipients(recipients).then(function(response) {
                $scope.recipients = response.data.addedRecipients.concat($scope.recipients).sort(function(a, b) {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                });
                
                $rootScope.toast({message: "Added " + response.data.addedRecipients.length + " recipients"});
            }, function(err) {
                $rootScope.toast({message: err.data.message || "Error adding recipients"});
            });
        });
    };
    
    function getMyRecipients() {
        $scope.promise = ApiService.getMyRecipients().then(function(response) {
            $scope.recipients = response.data;
        }, function(err) {
            $rootScope.toast({message: err.data.message});
        });
    }

}]);