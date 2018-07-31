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
		if (userUpvoted(fact)) {
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
			
			$scope.facts = response.data;
			$scope.facts.all = $scope.facts.all.map(function(fact) {
				fact.upvoted = userUpvoted(fact);
				return fact;
			});
		});
	}
	
	function userUpvoted(fact) {
		return !!fact.upvotes.find(function(o) { return o.user == $rootScope.authenticatedUser._id});
	}
	
	function getIndexOfFact(factID) {
		return $scope.facts.all.map(function(o) { return o._id }).indexOf(factID);
	}
	
	function setTimer() {
		var now = new Date(),
			endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 20, 0, 0);
			
		if (endTime.getTime() - now.getTime() < 0) {
			endTime.setDate(endTime.getDate() + 1);
		}
		
		var seconds = (endTime.getTime() - now.getTime()) / 1000;
		$scope.seconds = seconds;
		$scope.$broadcast('timer-set-countdown-seconds', seconds);
		$scope.$broadcast('timer-start');
	}
	
	socket.on('fact', function(data) {
		data.upvotes = [];
		$scope.facts.all.push(data);
	});
	
	socket.on('fact:upvote', function(data) {
		
		var factIndex = getIndexOfFact(data.fact._id);
		$scope.facts.all[factIndex].upvotes.push({user: data.user._id});
		$scope.facts.all[factIndex].upvoted = true;
		
		console.log($scope.facts.all, data);
	});
	
	socket.on('fact:unvote', function(data) {
		var factIndex = getIndexOfFact(data.fact._id);
		$scope.facts.all[factIndex].upvotes.splice($scope.facts.all[factIndex].upvotes.map(o => o.upvotes).indexOf(data.user._id), 1);
		$scope.facts.all[factIndex].upvoted = false;
	});
	
}]);