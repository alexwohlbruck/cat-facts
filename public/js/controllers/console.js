/* global angular */
var app = angular.module('catfacts');

app.controller('ConsoleCtrl', ['$scope', 'ApiService', function($scope, ApiService) {
    $scope.recipients = {
        loadedAll: false,
        expanded: false
    };
    $scope.unsubscribeDates = {
        loadedAll: false,
        expanded: false
    };
    
    ApiService.getConsoleData().then(function(response) {
        $scope.recipients.all = response.data.recipients;
        $scope.unsubscribeDates.all = response.data.unsubscribeDates;
    }, function(err) {
        console.log(err);
    });
    
    $scope.toggleExpandedRecipients = function() {
        $scope.recipients.expanded = !$scope.recipients.expanded;
        
        if (!$scope.recipients.loadedAll) {
            $scope.recipients.loadedAll = true;
            ApiService.getRecipients().then(function(reponse) {
                $scope.recipients.all = reponse.data;
            });
        }
    };
    
    $scope.toggleExpandedDates = function() {
        $scope.unsubscribeDates.expanded = !$scope.unsubscribeDates.expanded;
        
        if (!$scope.unsubscribeDates.loadedAll) {
            $scope.unsubscribeDates.loadedAll = true;
            ApiService.getUnsubscribeDates().then(function(reponse) {
                $scope.unsubscribeDates.all = reponse.data;
            });
        }
    };
}]);