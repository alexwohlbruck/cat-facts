/* global angular */
var app = angular.module('catfacts');


app.controller('FactsCtrl', ['$scope', '$rootScope', '$state', 'ApiService', 'socket',
	function($scope, $rootScope, $state, ApiService, socket) {
	
	getFacts();
	setTimer();
	
	// TODO: Repurpose this
	const endTime = {
		// Define time for next cat fact to be sent
		hours: 13,
		minutes: 55
	};
	
	$scope.submitFact = function() {
		const factText = $scope.form.newFact;
		
		if (factText && factText.trim().length != 0) {
			ApiService.submitFact({factText, animalType: $state.params.animal});
			$scope.form.newFact = '';
		} else {
			$scope.showToast("Type in a fact");
		}
	};
	
	$scope.countdownFinished = function() {
		setTimer();
	};
	
	$scope.upvoteFact = function(fact) {
		if (fact.userUpvoted) {
			ApiService.unvoteFact(fact._id).catch(function(err) {
				$rootScope.toast({message: err.data.message});
			});
		} else {
			ApiService.upvoteFact(fact._id).catch(function(err) {
				$rootScope.toast({message: err.data.message});
			});
		}
	};
	
	function getFacts() {
		$scope.promise = ApiService.getSubmittedFacts({
			animalType: $state.params.animal
		})
		.then(function(response) {
			console.log(response.data);
			
			$scope.facts = response.data;
		});
	}
	
	function getIndexOfFact(factID) {
		return $scope.facts.all.map(function(o) { return o._id }).indexOf(factID);
	}
	
	function setTimer() {
		const now = new Date(),
			endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 20, 0, 0);
			
		if (endTime.getTime() - now.getTime() < 0) {
			endTime.setDate(endTime.getDate() + 1);
		}
		
		const seconds = (endTime.getTime() - now.getTime()) / 1000;
		$scope.seconds = seconds;
		$scope.$broadcast('timer-set-countdown-seconds', seconds);
		$scope.$broadcast('timer-start');
	}
	
	socket.on('fact', function(data) {
		data.upvotes = [];
		$scope.facts.all.push(data);
	});
	
	socket.on('fact:upvote', function(data) {
		const factIndex = getIndexOfFact(data.fact._id);
		$scope.facts.all[factIndex].upvotes++;
		
		if (data.user._id == $rootScope.authenticatedUser._id) {
			$scope.facts.all[factIndex].userUpvoted = true;
		}
	});
	
	socket.on('fact:unvote', function(data) {
		const factIndex = getIndexOfFact(data.fact._id);
		$scope.facts.all[factIndex].upvotes--;
		
		if (data.user._id == $rootScope.authenticatedUser._id) {
			$scope.facts.all[factIndex].userUpvoted = false;
		}
	});
	
}]);