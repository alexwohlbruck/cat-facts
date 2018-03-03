/* global angular */
var app = angular.module('catfacts', [
	'ngMaterial',
	'ui.router',
	'md.data.table',
	'timer',
	'angular-carousel',
	'btford.socket-io',
	'luegg.directives',
	'ngclipboard',
	'cfp.hotkeys'
]);

app.config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/views/home.html',
			controller: 'HomeCtrl',
			data: {
				showInNavigation: false
			}
		})

		.state('recipients', {
			url: '/recipients',
			templateUrl: '/views/recipients.html',
			controller: 'RecipientsCtrl',
			data: {
				restricted: true,
				showInNavigation: true
			}
		})

		.state('facts', {
			url: '/facts',
			templateUrl: '/views/facts.html',
			controller: 'FactsCtrl',
			data: {
				showInNavigation: true
			}
		})
		
		.state('console', {
			url: '/console',
			templateUrl: '/views/console.html',
			controller: 'ConsoleCtrl',
			data: {
				restricted: true,
				showInNavigation: true,
				adminRequired: true
			}
		});

	$urlRouterProvider.otherwise('/');
}]);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
		
	$mdThemingProvider.theme('light')
		.primaryPalette('blue', {
			'default': '500',
			'hue-1': '100',
			'hue-2': '600',
			'hue-3': 'A100'
		})
		.accentPalette('teal', {
			'default': 'A400'
		});
		
	$mdThemingProvider.theme('dark')
		.primaryPalette('blue', {
			'default': '500',
			'hue-1': '100',
			'hue-2': '600',
			'hue-3': 'A100'
		})
		.accentPalette('teal', {
			'default': 'A400'
		})
		.dark();
	
	$mdThemingProvider.setDefaultTheme('light');
	$mdThemingProvider.alwaysWatchTheme(true);
}]);

app.run(['$rootScope', '$state', '$window', '$location', '$mdToast', 'ApiService', 'AuthService', '$mdMedia',
	function($rootScope, $state, $window, $location, $mdToast, ApiService, AuthService, $mdMedia) {
	
	$rootScope.authenticatedUser = null;
	$rootScope.$mdMedia = $mdMedia;
	$rootScope.$state = $state;
	$window.name = 'cat-facts-base-window';
	$window.ga('create', 'UA-88600627-2', 'auto'); // Start Google Analytics
	
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		
		if ($rootScope.authenticatedUser === null) {
			
			ApiService.getAuthenticatedUser()
				.then(function(response) {
					$rootScope.authenticatedUser = response.data;
				}).catch(function(response) {
					$rootScope.authenticatedUser = false;
				
					if (toState.data.restricted) {
						window.location.href = '/auth/google';
					}
				});
		} else if (!$rootScope.authenticatedUser && toState.data.restricted) {
			setTimeout(function() {
				window.location.href = '/auth/google';
			}, 100);
		}
	});
	
	$rootScope.$on('$stateChangeSuccess', function(event) {
		// Google Analytics page view
		$window.ga('send', 'pageview', $location.path());
	});
	
	$rootScope.$watch('$state.current.name', function(newValue, oldValue) {
		$rootScope.startingState = newValue;
    });
    
    $window.finishOAuth = function(data) {
		$rootScope.$apply(function() {
			AuthService.finishOAuth(data);
		});
	};
	
	$rootScope.toast = function(options) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(options.message)
				.position('bottom right')
				.hideDelay(5000)
		);
	};
}]);