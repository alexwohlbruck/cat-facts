/* global angular */
var app = angular.module('catfacts');

app.controller('ConsoleCtrl', ['$scope', '$rootScope', 'ApiService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, ApiService, $mdDialog, $mdMedia) {
    
    $scope.recipients = {
        loadedAll: false,
        expanded: false
    };
    $scope.unsubscribeDates = {
        loadedAll: false,
        expanded: false
    };
    
    ApiService.getConsoleData().then(function(response) {
        $scope.recipients.all = response.data.recipients.all;
        $scope.recipients.total = response.data.recipients.total;
        $scope.users = response.data.users;
        $scope.today = new Date();
        
        $scope.overrideFacts = response.data.overrideFacts.map(function(overrideFact) {
            overrideFact.sendDate = new Date(overrideFact.sendDate);
            return overrideFact;
        });
        
        $scope.unsubscribeDates.all = response.data.unsubscribeDates
            .map(function(date) {
                var now = new Date();
                var start =  new Date(date.start);
                var end =  new Date(date.end);
                
                date.start = start;
                date.end = end; 
                
                date.status = (end < now ? 'passed' : (start < now ? 'ongoing' : 'upcoming'));
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
            $scope.recipients.loading = true;
            ApiService.getRecipients().then(function(reponse) {
                $scope.recipients.loading = false;
                $scope.recipients.all = reponse.data;
            }, function(err) {
                $rootScope.toast(err);
                $scope.recipients.loading = false;
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
            controller: ['$scope', 'date', '$mdDialog', function($scope, date, $mdDialog) {
                $scope.date = date;
                $scope.$mdDialog = $mdDialog;
            }],
            templateUrl: 'views/partials/edit-date.html',
            locals: {date: $scope.unsubscribeDates.all[index]},
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
        }).then(function(date) {
            
        });
    };
}]);