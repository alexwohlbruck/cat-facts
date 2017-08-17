/* global angular */
var app = angular.module('catfacts');

app.controller('ConsoleCtrl', ['$scope', 'ApiService', '$mdDialog', '$mdMedia',
    function($scope, ApiService, $mdDialog, $mdMedia) {
    
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
        $scope.unsubscribeDates.all = response.data.unsubscribeDates
            .map(function(date) {
                var now = new Date();
                var start =  new Date(date.start);
                var end =  new Date(date.end);
                
                date.status = (end < now ? 'Passed' : (start < now ? 'Ongoing' : 'Upcoming'));
                date.intervalMs = end.getTime() - start.getTime();
                
                return date;
            });
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
    
    $scope.editDate = function(index, ev) {
        $mdDialog.show({
            controller: ['$scope', function($scope) {
                
            }],
            templateUrl: 'views/partials/edit-date.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        });
    };
}]);