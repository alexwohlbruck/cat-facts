/* global angular */
var app = angular.module('catfacts');

app.controller('ProfileCtrl', ['$scope', '$rootScope', 'ApiService', function($scope, $rootScope, ApiService) {
    
    $scope.newPhone = $rootScope.authenticatedUser ? $rootScope.authenticatedUser.phone : undefined;
    
    $scope.editField = $scope.editStep = null;
    
    $scope.updatePhone = function(editStep) {
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
                    $rootScope.toast({message: err.message || "Couldn't create verification code, try again later."});
                });
                break;
                
            case 'verify':
                ApiService.updatePhone($scope.verificationCode).then(updatedUser => {
                    $rootScope.authenticatedUser = updatedUser;
                    $scope.newPhone = updatedUser.phone;
                    $scope.editField = null;
                    $scope.editStep = null;
                    $rootScope.toast({message: "New phone number saved"});
                }, err => {
                    $rootScope.toast({message: err.message || "Couldn't update phone number, try again later."});
                });
                
                break;
        }
    };

}]);