/* global angular, navigator */
var app = angular.module('catfacts', [
    'ngMaterial',
    'ui.router',
    'md.data.table',
    'timer',
    'angular-carousel',
    'btford.socket-io',
    'luegg.directives',
    'ngclipboard',
    'cfp.hotkeys',
    'angularMoment'
]);

app.provider('animal', function() {
    this.animals = [{
            name: 'cat',
            iconUrl: '/img/logo/animals/cat.png'
        },
        {
            name: 'dog',
            iconUrl: 'https://mi2.rightinthebox.com/images/50x50/201707/crrztg1500634869721.jpg'
        },
        {
            name: 'snail',
            iconUrl: 'https://emojipedia-us.s3.amazonaws.com/thumbs/160/lg/34/snail_1f40c.png'
        },
        {
            name: 'horse',
            iconUrl: ''
        }
    ];

    this.animalsStruct = this.animals.reduce((obj, animal) => {
        obj[animal.name] = animal;
        return obj;
    }, {});

    this.$get = function() {
        return this.animals;
    };
});

app.config(['$stateProvider', '$urlRouterProvider', 'animalProvider',
    function($stateProvider, $urlRouterProvider, animalProvider) {

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
            url: '/:animal/recipients',
            templateUrl: '/views/recipients.html',
            controller: 'RecipientsCtrl',
            data: {
                restricted: true,
                showInNavigation: true
            }
        })

        .state('facts', {
            url: '/:animal/facts',
            templateUrl: '/views/facts.html',
            controller: 'FactsCtrl',
            data: {
                showInNavigation: true
            }
        })

        .state('fact', {
            url: '/:animal/facts/:factId',
            templateUrl: '/views/fact.html',
            controller: 'FactCtrl',
            data: {
                showNavigation: true
            }
        })

        .state('console', {
            url: '/:animal/console',
            templateUrl: '/views/console.html',
            controller: 'ConsoleCtrl',
            data: {
                restricted: true,
                showInNavigation: true,
                adminRequired: true
            }
        });

        $urlRouterProvider.otherwise('/');
    }
]);

app.config(['$mdThemingProvider', function($mdThemingProvider) {

    // TODO: DRY with animalProvider list loop

    $mdThemingProvider.theme('cat').primaryPalette('blue').accentPalette('amber', { 'default': '400' });
    $mdThemingProvider.theme('dog').primaryPalette('deep-purple').accentPalette('blue-grey', { 'default': '700' });
    $mdThemingProvider.theme('snail').primaryPalette('pink', { 'default': '300' }).accentPalette('blue');
    $mdThemingProvider.theme('horse').primaryPalette('light-green', { 'default': '500' }).accentPalette('amber', { 'default': '400' });

    $mdThemingProvider.setDefaultTheme('cat');

    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.enableBrowserColor();
}]);

app.run(['$rootScope', '$state', '$window', '$location', '$mdToast', 'ApiService', '$mdMedia', 'amMoment',
    function($rootScope, $state, $window, $location, $mdToast, ApiService, $mdMedia, amMoment) {

        $rootScope.authenticatedUser = null;
        $rootScope.$mdMedia = $mdMedia;
        $rootScope.$state = $state;
        $window.name = 'cat-facts-base-window';
        $window.ga('create', 'UA-88600627-2', 'auto'); // Start Google Analytics

        amMoment.changeLocale(navigator.languages ? navigator.languages[0] : navigator.language);

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

            // Keep animal url params during state change, default cat
            toParams.animal = toParams.animal || fromParams.animal || 'cat';

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

        $window.finishOAuth = function(data) {};

        $rootScope.toast = function(options) {
            if (options.action && options.actionText) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(options.message)
                    .action(options.actionText)
                    .highlightAction(true)
                    .position('bottom right')
                    .hideDelay(10000)
                ).then(response => {
                    if (response === 'ok') {
                        options.action();
                    }
                });
            } else {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(options.message)
                    .position('bottom right')
                    .hideDelay(5000)
                );
            }
        };
    }
]);