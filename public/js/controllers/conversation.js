/* global angular */
var app = angular.module('catfacts');

app.controller('ConversationCtrl', ['$scope', 'ConversationService', 'data', 'socket', '$mdDialog',
    function($scope, ConversationService, ConversationData, socket, $mdDialog) {
        
    $scope.data = ConversationData;
    
    socket.on('message', function(data) {
        console.log(data, ConversationData);
        if (data.recipient.number == ConversationData.recipient.number) {
            $scope.messages.push(data.message);
        }
    });
        
    ConversationService.getConversation(ConversationData.recipient.number).then(function(response) {
        $scope.messages = response.data;
    });
    
    $scope.closeConversation = function() {
        $mdDialog.hide();
    };
}]);