/* global angular */
var app = angular.module('catfacts');

app.controller('ConversationCtrl', ['$scope', 'ApiService', 'data', 'socket', '$mdDialog',
    function($scope, ApiService, ConversationData, socket, $mdDialog) {
        
    $scope.data = ConversationData;
    $scope.loading = true;
    
    socket.on('message', function(data) {
        console.log(data, ConversationData);
        if (data.recipient.number == ConversationData.recipient.number) {
            $scope.messages.push(data.message);
        }
    });
        
    ApiService.getConversation(ConversationData.recipient.number).then(function(response) {
        $scope.messages = response.data;
        $scope.loading = false;
    });
    
    $scope.closeConversation = function() {
        $mdDialog.hide();
    };
    
    // Determine if the message was sent within a relatively short period before the previous one
    $scope.isStale = function(currentMessage, prevMessage) {
        
        if (!prevMessage) return true;
        
        const currentDate = new Date(currentMessage.createdAt);
        const prevDate = new Date(prevMessage.createdAt);
        
        const deltaMillis = new Date() - currentDate;
        let scale,
            scaleMinutes = (1000 * 60),
            scaleHours = scaleMinutes * 60,
            scaleDays = scaleHours * 24,
            scaleYears = scaleDays * 365;
        
        if (deltaMillis < scaleHours)
            // less than an hour ago
            scale = scaleMinutes;
        else if (deltaMillis < scaleDays)
            // less than a day ago
            scale = scaleHours;
        else if (deltaMillis < scaleYears)
            // less than a year ago
            scale = scaleDays;
        
        return ((currentDate - prevDate) / scale) >= 1;
    };
}]);