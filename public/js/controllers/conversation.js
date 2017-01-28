/* global angular */
var app = angular.module('catfacts');

app.controller('ConversationCtrl', ['$scope', 'ConversationService', 'data', 'socket', '$mdDialog',
    function($scope, ConversationService, data, socket, $mdDialog) {
        
    $scope.data = data;
    
    socket.on('message', function(data) {
        $scope.messages.push(data);
    });
        
    ConversationService.getConversation(data.recipient.number).then(function(response) {
        $scope.messages = response.data;
    });
    
    $scope.closeConversation = function() {
        $mdDialog.hide();
    };
}]);