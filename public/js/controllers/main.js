/* global angular */
var app = angular.module('catfacts');

app.controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$mdToast', '$mdDialog', '$mdBottomSheet', 'ApiService',
	function($scope, $rootScope, $mdSidenav, $mdToast, $mdDialog, $mdBottomSheet, ApiService) {

	$scope.sideNav = {
		left: {
			toggle: function() {
				$mdSidenav('left').toggle();
			}
		}
	};
    
    $rootScope.showToast = function(message) {
        return $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('bottom right')
                .hideDelay(5000)
        );
    };
    
    $scope.showConfirm = function(title, subtitle, ok, cancel) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title(title)
            .textContent(subtitle)
            .ok(ok)
            .cancel(cancel);
        return $mdDialog.show(confirm);
    };
    
    $scope.showPrompt = function(title, subtitle, ok, cancel) {
		var prompt = $mdDialog.prompt()
			.title(title)
			.textContent(subtitle)
			.ariaLabel(title)
			.ok(ok)
			.cancel(cancel);
		return $mdDialog.show(prompt);
    };
    
    $scope.showCatFact = function() {
    	ApiService.getFact().then(function(response) {
    		$mdBottomSheet.show({
    		    templateUrl: '/views/partials/bottom-sheet-fact.html',
    		    controller: ['$scope', '$rootScope', function($scope, $rootScope) {
    		        $scope.fact = response.data.displayText;
    		        
    		        $scope.alertCopied = function() {
    		            $rootScope.showToast("Text copied to clipboard");
    		        };
    		    }]
    		});
    	});
    };
    
    $scope.openAbout = function(event) {
        $mdDialog.show({
            templateUrl: '/views/partials/about.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false
        });
    };
    
    $scope.toggleDarkTheme = function(newTheme) {
        ApiService.updateUserSettings({
            theme: newTheme
        });
    };

}]);