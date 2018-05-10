/* global angular */
var app = angular.module('catfacts');

app.controller('ProfileCtrl', ['$scope', '$rootScope', 'ApiService', '$state', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, ApiService, $state, $mdDialog, $mdMedia) {
    
    $scope.newPhone = $rootScope.authenticatedUser ? $rootScope.authenticatedUser.phone : undefined;
    $scope.$mdDialog = $mdDialog;
    $scope.editField = $scope.editStep = null;
    
    $scope.updatePhone = editStep => {
        switch (editStep) {
            case null:
                $scope.editField = 'phone';
                $scope.editStep = 'edit';
                break;
            
            case 'edit':
                ApiService.verifyPhone($scope.newPhone).then(() => {
                    $scope.editStep = 'verify';
                    $rootScope.toast({message: "A verification code has been sent to your phone"});
                }, err => {
                    $rootScope.toast({message: err.message || "Couldn't create verification code, try again later"});
                });
                break;
                
            case 'verify':
                ApiService.updatePhone($scope.verificationCode).then(updatedUser => {
                    $rootScope.authenticatedUser = updatedUser.data;
                    $scope.newPhone = updatedUser.data.phone;
                    $scope.editField = $scope.editStep = null;
                    $scope.newPhone = $scope.verificationCode = '';
                    $rootScope.toast({message: "New phone number saved"});
                }, err => {
                    $rootScope.toast({message: err.data.message || "Couldn't update phone number, try again later"});
                });
                
                break;
        }
    };
    
    $scope.openDeleteAccountDialog = ev => {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                
                $scope.deleteAccount = () => {
                    ApiService.deleteAccount({verificationEmail: $scope.email}).then(data => {
                        $rootScope.authenticatedUser = undefined;
                        $mdDialog.hide(data);
                    }, err => {
                        $rootScope.toast({message: err.data.message || "Failed to delete account"});
                    });
                };
                
                $scope.cancel = $mdDialog.cancel;
            }],
            templateUrl: 'views/partials/delete-account.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            scope: $scope,
            preserveScope: true,
            
        }).then(data => {
            $rootScope.toast({message: "Your account has been deleted"});
            $state.go('facts');
        });
    };

}]);