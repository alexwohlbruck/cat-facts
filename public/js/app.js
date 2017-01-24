/* global angular */
var app = angular.module('catfacts', [
	'ngMaterial',
	'ui.router',
	'md.data.table',
	'countdownTimer',
	'angular-carousel',
	'btford.socket-io',
	'luegg.directives'
]);

app.config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/partials/home.html',
			controller: 'HomeCtrl'
		})

		.state('recipients', {
			url: '/recipients',
			templateUrl: '/partials/recipients.html',
			controller: 'RecipientsCtrl',
			restricted: true
		})

		.state('facts', {
			url: '/facts',
			templateUrl: '/partials/facts.html',
			controller: 'FactsCtrl'
		})
	;

	$urlRouterProvider.otherwise('/');
}]);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
		
	$mdThemingProvider.theme('default')
		.primaryPalette('blue', {
			'default': '500',
			'hue-1': '100',
			'hue-2': '600',
			'hue-3': 'A100'
		})
		.accentPalette('teal', {
			'default': 'A400'
		});
}]);

app.run(['$rootScope', '$state', '$mdToast', 'AuthService', '$mdMedia',
	function($rootScope, $state, $mdToast, AuthService, $mdMedia) {
	
	$rootScope.authenticatedUser = null;
	$rootScope.$mdMedia = $mdMedia;
	
	AuthService.getAuthenticatedUser().then(function(response) {
		$rootScope.authenticatedUser = response.data;
		
		$rootScope.$on('$routeChangeStart', function(event, next) {
			if (!$rootScope.authenticatedUser && !next.restricted) {
				$rootScope.toast({message: "Sign in first"});
				$state.go('home');
			}
		});
	});
	
	$rootScope.toast = function(options) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(options.message)
				.position('bottom right')
				.hideDelay(5000)
		);
	};
}]);