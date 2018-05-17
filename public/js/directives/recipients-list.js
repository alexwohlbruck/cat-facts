/* global angular */
var app = angular.module('catfacts');

app.directive('recipients', function() {
    return {
        restrict: 'E',
        scope: {
            recipients: '=',
            promise: '=',
            orderBy: '@',
            limitTo: '@',
            options: '=',
            selected: '='
        },
        templateUrl: '/views/directives/recipients-list.html',
        controller: ['$scope', '$rootScope', '$mdDialog', '$mdMedia', 'ApiService',
            function($scope, $rootScope, $mdDialog, $mdMedia, ApiService) {
            
            $scope.$mdMedia = $mdMedia;
            $scope.selected = [];
            
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
            
            $scope.editRecipient = function({recipient}, ev) {
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                        $scope.recipient = recipient;
                        $scope.cancel = $mdDialog.hide;
                        
                        $scope.save = function() {
                            ApiService.editRecipient($scope.recipient).then(function(recipient) {
                                $mdDialog.hide(recipient);
                            }, function(err) {
                                $mdDialog.cancel(err);
                            });
                        };
                    }],
                    templateUrl: 'views/partials/edit-recipient.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('xs')
                }).then(function(editedRecipient) {
                    if (editedRecipient) {
                        $rootScope.toast({message: 'Recipient updated'});
                        $scope.selected = [];
                    }
                }, function(err) {
                    $rootScope.toast(err);
                });
            };
            
            $scope.restoreRecipient = function(event, recipient) {
                $mdDialog.confirm()
                    .title(`Restore ${recipient.name}?`)
                    .textContent('This person will start recieving cat facts again.')
                    .ariaLabel(`Restoring ${recipient.name}`)
                    .targetEvent(event)
                    .ok(`Get 'em`)
                    .cancel(`Nevermind`)
                    .clickOutsideToClose(true);
                    
                $mdDialog.show(confirm).then(function() {
                    $scope.status = 'You decided to get rid of your debt.';
                }, function() {
                    $scope.status = 'You decided to keep your debt.';
                });
            };
            
            $scope.deleteRecipients = function({recipients, showPermanentDeleteOption}, ev) {
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                        $scope.recipients = recipients;
                        $scope.permanent = false;
                        $scope.showPermanentDeleteOption = $rootScope.authenticatedUser.isAdmin;
                        
                        $scope.delete = function() {
                            $mdDialog.hide({
                                recipients: recipients.map(o => o._id),
                                soft: !$scope.permanent
                            });
                        };
                        
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                    }],
                    templateUrl: 'views/partials/delete-recipients.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('xs')
                })
                .then(data => {
                    ApiService.deleteRecipients(data).then(response => {
                        
                        $scope.recipients = $scope.recipients.filter(recipient => {
                            return !data.recipients.includes(recipient._id);
                        });
                        
                        $scope.selected = [];
                        $rootScope.toast({message: "Recipients deleted"});
                        
                    }, err => {
                        $rootScope.toast({message: err.message});
                    });
                });
            };
        }]
    };
});