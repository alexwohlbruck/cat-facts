/* global angular */
var app = angular.module('catfacts');

app.controller('FactCtrl', ['$scope', '$state', 'ApiService',
    function($scope, $state, ApiService) {

        $scope.fact = '';

        getFact();



        /*
	
        $scope.submitFact = function() {
        	const factText = $scope.form.newFact;
        	
        	if (factText && factText.trim().length != 0) {
        		ApiService.submitFact({factText, animalType: $state.params.animal});
        		$scope.form.newFact = '';
        	} else {
        		$scope.showToast("Type in a fact");
        	}
        };

         */

        function getFact() {
            $scope.promise = ApiService.getFact($state.params.factId)
                .then(function(response) {
                    console.log(response.data);

                    $scope.fact = response.data;
                });
        }

    }
]);