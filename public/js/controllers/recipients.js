/* global angular */
var app = angular.module('catfacts');

app.controller('RecipientsCtrl', ['$scope', '$rootScope', 'ApiService', 'AuthService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, ApiService, AuthService, $mdDialog, $mdMedia) {
    
    $scope.recipients = [];
    $scope.AuthService = AuthService;
    
    $scope.orderBy = 'name';
    
    getMyRecipients();
    
    // TODO: Refactor phone validation into it's own directive for reuse
    /*$scope.validatePhone = (number, returnNumber = false) => {
        const trim = number.replace(/[^0-9]/gi, '').trim();
        return returnNumber ? trim : trim.length == 10;
    };*/
    
    $scope.validatePhoneNgPattern = (function() {
        return {
            test: $scope.validatePhone
        };
    })();
    
    $scope.addRecipient = () => {
        var name = $scope.form.name, number = $scope.form.number;
        
        if (name && number && $scope.validatePhone(number)) {
            
            ApiService.addRecipient({
                name: name,
                number: $scope.validatePhone(number, true)
            }).then(response => {
                $scope.recipients.push(response.data);
                $rootScope.toast({message: "Recipient added!"});
                $scope.form = null;
            }, err => {
                console.log(err);
                $rootScope.toast({message: err.data.errors[Object.keys(err.data.errors)[0]].message || err.data.message});
            });
            
        } else {
            $rootScope.toast({message: "Invalid name or number"});
        }
    };
    
    $scope.openImportContacts = contacts => {
        $mdDialog.show({
            controller: ['$scope', '$rootScope', '$mdDialog', 'ApiService', function($scope, $rootScope, $mdDialog, ApiService) {
                $scope.contacts = contacts;
                $scope.table = {orderBy: 'name'};
                $scope.selectedContacts = [];
                
                $scope.finish = () => {
                    if ($scope.selectedContacts.length > 0) {
                        $mdDialog.hide($scope.selectedContacts);
                    } else {
                        $mdDialog.cancel();
                    }
                };
                
                $scope.checkScopesAndGetContacts = () => {
                    $scope.promise = ApiService.getGoogleContacts().then(response => {
                        $scope.contacts = response.data;
                    }, err => {
                        if (err.status == 403 || err.status == 401) AuthService.openOAuth();
                    });
                };
                
                $rootScope.$on('contacts:import', () => {
                    $scope.checkScopesAndGetContacts();
                });
                
                (() => {
                    $scope.checkScopesAndGetContacts();
                })();
            }],
            templateUrl: '/views/partials/contacts.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        })
        .then(recipients => {
            
            ApiService.addRecipients(recipients).then(response => {
                $scope.recipients = response.data.addedRecipients.concat($scope.recipients).sort((a, b) => {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                });
                
                $rootScope.toast({message: "Added " + response.data.addedRecipients.length + " recipients"});
            }, err => {
                $rootScope.toast({message: err.data.message || "Error adding recipients"});
            });
        });
    };
    
    function getMyRecipients() {
        $scope.promise = ApiService.getMyRecipients().then(response => {
            $scope.recipients = response.data;
        }, err => {
            $rootScope.toast({message: err.data.message});
        });
    }

}]);