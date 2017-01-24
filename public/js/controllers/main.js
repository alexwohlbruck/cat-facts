/* global angular */
var app = angular.module('catfacts');

app.controller('MainCtrl', [
	'$scope',
	'$mdSidenav',
	'$mdToast',
	'$mdDialog',
	'$location',
	'$timeout',
	function($scope, $mdSidenav, $mdToast, $mdDialog, $location, $timeout) {

	// var ref = firebase.database().ref();
	
	/*$scope.$on('$locationChangeStart', function(e) {
		if (!$scope.user && $location.path() !== '/') {
			$scope.login();
		}
	});*/

	$scope.login = function() {
		/*console.log(
		auth.$signInWithPopup("google").then(function(data) {
			console.log("Logged in as:", data);
		}, function(error) {
			console.log("Authentication failed:", error);
		})
		);*/
		/*$timeout(function() {
			$scope.showPrompt("What's your name?", "This prompt will be temporarily used until a real auth method is implemented", "Sign in", "Cancel").then(function(response) {
				if (response && response.trim().length != 0) {
					$scope.user = {
						name: response.trim()
					};
				} else {
					$scope.showToast("Enter a name").then($scope.login());
				}
			}, function() {
				$scope.showToast("Ummm why would you press that").then($scope.login());
			});
		}, 1);*/
	};
	
	$scope.login();

	// Download the data into a local object
	// var syncObject = $firebaseObject(ref);
	// syncObject.$bindTo($scope, 'data');

	$scope.sideNav = {
		left: {
			toggle: function() {
				$mdSidenav('left').toggle();
			}
		}
	};
    
    $scope.showToast = function(message) {
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

}]);