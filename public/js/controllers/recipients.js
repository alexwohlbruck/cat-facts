/* global angular */
var app = angular.module('catfacts');

app.controller('RecipientsCtrl', ['$scope', '$rootScope', 'RecipientService', 'AuthService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, RecipientService, AuthService, $mdDialog, $mdMedia) {
    
    $scope.selected = [], $scope.recipients = [];
    $scope.AuthService = AuthService;
    
    getRecipients();
    
    $scope.addRecipient = function() {
        var name = $scope.form.name, number = $scope.form.number;
        
        if (name && number && number.replace(/[^0-9]/gi, '').trim().length == 10) {
            
            RecipientService.addRecipient({
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
    
    $scope.openConversation = function(event, recipient) {
        $mdDialog.show({
            controller: 'ConversationCtrl',
            templateUrl: '/views/partials/conversation.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            locals: {data: {recipient: recipient}}
        });
    };
    
    $scope.checkScopesAndOpenImportContacts = function() {
        RecipientService.getGoogleContacts().then(function(response) {
            console.log('open contacts');
            $scope.openImportContacts(response.data);
        }, function(err) {
            if (err.status == 403 || err.status == 401) AuthService.openOAuth();
        });
    };
    
    $rootScope.$on('contacts:import', function() {
            console.log('open contacts 2');
        $scope.checkScopesAndOpenImportContacts();
    });
    
    $scope.openImportContacts = function(contacts) {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                $scope.contacts = contacts;
                $scope.table = {orderBy: 'name'};
                $scope.selectedContacts = [];
                $scope.finish = function() {
                    $mdDialog.hide();
                };
            }],
            templateUrl: '/views/partials/contacts.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        });
    };
    
    function getRecipients() {
        $scope.promise = RecipientService.getRecipients().then(function(response) {
            $scope.recipients = response.data;
        }, function(err) {
            $rootScope.toast({message: err.data.message});
        });
    }

}]);