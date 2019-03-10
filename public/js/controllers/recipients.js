/* global angular */
var app = angular.module('catfacts');

app.controller('RecipientsCtrl', ['$scope', '$rootScope', '$state', 'ApiService', 'AuthService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, $state, ApiService, AuthService, $mdDialog, $mdMedia) {
    
    $scope.recipients = [];
    $scope.AuthService = AuthService;
    
    $scope.orderBy = 'name';
    
    getMyRecipients();
    
    // TODO: Refactor phone validation into it's own directive for reuse
    $scope.validatePhone = (number, returnNumber = false) => {
        const trim = number.replace(/[^0-9]/gi, '').trim();
        return returnNumber ? trim : trim.length == 10;
    };
    
    $scope.validatePhoneNgPattern = (function() {
        return {
            test: $scope.validatePhone
        };
    })();
    
    $scope.addRecipient = () => {
        const name = $scope.form.name,
              number = $scope.form.number;
        
        if (!name || !number || !$scope.validatePhone(number)) {
            return $rootScope.toast({message: "Invalid name or number"});
        }
        
        ApiService.addRecipient({
            recipient: {
                name,
                number: $scope.validatePhone(number, true)
            },
            animalTypes: [$state.params.animal]
        })
        
        .then(response => {
            
            // Remove this number from the list (if archived)
            $scope.recipients = $scope.recipients.filter(r => r.number != number);
            
            $scope.recipients = [
                ...$scope.recipients,
                ...response.data.newRecipients,
                ...response.data.updatedRecipients
            ].sort((a, b) => {
                // Alphabetic sort
                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
            });
            
            $rootScope.toast({message: response.data.message});
            $scope.form = null;
        }, err => {
            $rootScope.toast({message: err.data.errors[Object.keys(err.data.errors)[0]].message || err.data.message});
        });
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
                    $scope.promise = ApiService.getGoogleContacts({animalType: $state.params.animal}).then(response => {
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
            
            ApiService.addRecipients({recipients, animalTypes: [$state.params.animal]}).then(response => {
                
                $scope.recipients = [
                    ...$scope.recipients,
                    ...response.data.newRecipients,
                    ...response.data.updatedRecipients
                ].sort((a, b) => {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                });
                
                $rootScope.toast({message: response.data.message});
            }, err => {
                $rootScope.toast({message: err.data.message || "Error adding recipients"});
            });
        });
    };
    
    function getMyRecipients() {
        $scope.promise = ApiService.getMyRecipients({animalType: $state.params.animal}).then(response => {
            $scope.recipients = response.data;
        }, err => {
            $rootScope.toast({message: err.data.message});
        });
    }

}]);