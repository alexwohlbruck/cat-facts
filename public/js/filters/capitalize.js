// https://stackoverflow.com/questions/30207272/capitalize-the-first-letter-of-string-in-angularjs
angular.module('catfacts').filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
});