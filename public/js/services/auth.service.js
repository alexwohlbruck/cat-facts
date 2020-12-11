/* global angular */
var app = angular.module('catfacts');

app.service('AuthService', ['$rootScope', '$http', '$window', '$state', function($rootScope, $http, $window, $state) {
    var that = this;
    var oauthPopup;

    this.openOAuth = function() {
        var url = $window.location.origin + '/auth/google/contacts',
            width = 500,
            height = 600,
            top = (window.outerHeight - height) / 2,
            left = (window.outerWidth - width) / 2;

        oauthPopup = $window.open(url, 'google-oauth', 'width=' + width + ',height=' + height + ',scrollbars = 0, top=' + top + ',left=' + left);

        // Recieve message from popup window with action to perfom
        window.addEventListener('message', function(event) {
            var origin = event.origin || event.originalEvent.origin;

            if (origin == document.origin) {
                that.finishOAuth(event.data);
            } else {
                return;
            }
        });
    };

    this.finishOAuth = function(state) {
        oauthPopup.close();
        $rootScope.$broadcast(state.action);
    };
}]);