/* global angular */
var app = angular.module('catfacts');

app.controller('FactsCtrl', ['$scope', '$rootScope', '$state', '$location', 'ApiService', 'socket',
    function($scope, $rootScope, $state, $location, ApiService, socket) {

        getFacts();

        $scope.buildGrid = function() {
            console.log('init grid');

            var colc = new Colcade('.grid', {
                columns: '.grid-col',
                items: '.grid-item'
            });
        }

        $scope.submitFact = function() {
            const factText = $scope.form.newFact;

            if (factText && factText.trim().length != 0) {
                ApiService.submitFact({ factText, animalType: $state.params.animal });
                $scope.form.newFact = '';
            } else {
                $scope.showToast("Type in a fact");
            }
        };

        $scope.openFact = function(factId) {
            $location.path('/' + $state.params.animal + '/facts/' + factId);
        };

        function getFacts() {
            $scope.promise = ApiService.getSubmittedFacts({
                    animalType: $state.params.animal
                })
                .then(function(response) {
                    console.log(response.data);

                    $scope.facts = response.data;
                    /* setTimeout(() => {
                        $scope.buildGrid();
                    }, 0); */
                });
        }

        function getIndexOfFact(factID) {
            return $scope.facts.all.map(function(o) { return o._id }).indexOf(factID);
        }

        socket.on('fact', function(data) {
            $scope.facts.all.push(data);
        });
    }
]);