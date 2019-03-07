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
            
            $scope.editRecipient = function(event, recipient) {
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
                    targetEvent: event,
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
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                        $scope.recipient = recipient;
                        $scope.resubscriptions = [];
                        $scope.cancel = $mdDialog.hide;
                        
                        $scope.restore = function() {
                            ApiService.restoreRecipient($scope.recipient, $scope.resubscriptions).then(function({data}) {
                                $mdDialog.hide(data);
                            }, function(err) {
                                $mdDialog.cancel(err);
                            });
                        };
                    }],
                    templateUrl: 'views/partials/restore-recipient.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('xs')
                }).then(function(recipient) {
                    const index = $scope.recipients.findIndex(r => r._id == recipient._id);
                    $scope.recipients.splice(index, 1);
                    $scope.recipients.push(recipient);
                }, function(err) {
                    $rootScope.toast(err);
                });
            };
            
            $scope.deleteRecipients = function(event, recipients) {
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
                    targetEvent: event,
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('xs')
                })
                .then(data => {
                    
                    ApiService.deleteRecipients(data).then(response => {
                        
                        // FIXME: When trying to re-add a deleted recipient, DB throws dup index error
                        
                        // TODO: If permanent delete is selected, remove recipient from list
                        
                        $scope.recipients = $scope.recipients.map(recipient => {
                            if (data.recipients.includes(recipient._id)) {
                                recipient.deleted = true;
                            }
                            return recipient;
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