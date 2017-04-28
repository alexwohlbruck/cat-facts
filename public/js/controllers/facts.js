/* global angular */
var app = angular.module('catfacts');


app.controller('FactsCtrl', ['$scope', '$rootScope', 'FactService', 'socket',
	function($scope, $rootScope, FactService, socket) {
    
    getFacts();
    setTimer();
    
    var endTime = {
	    // Define time for next cat fact to be sent
	    hours: 13,
	    minutes: 55
	};
	
	$scope.submitFact = function() {
	    var fact = $scope.form.newFact;
	    
	    if (fact && fact.trim().length != 0) {
	        FactService.submitFact({text: fact});
    	    $scope.form.newFact = '';
	    } else {
	        $scope.showToast("Type in a fact");
	    }
	};
	
	$scope.countdownFinished = function() {
		setTimer();
	};
	
	// http://stackoverflow.com/questions/30861304/angular-ng-repeat-filter-passing-wrong-index
	$scope.upvoteFact = function(fact) {
		var index = getIndexOfFact(fact);
		if (userUpvoted(fact)) {
			FactService.unvoteFact(fact._id).catch(function(err) {
				$rootScope.toast({message: err.data.message});
			});
		} else {
			FactService.upvoteFact(fact._id).catch(function(err) {
				$rootScope.toast({message: err.data.message});
			});
		}
	};
	
	function getFacts() {
	    $scope.promise = FactService.getSubmittedFacts().then(function(response) {
	        $scope.facts = response.data;
	        $scope.facts.forEach(function(fact, index) {
	        	$scope.facts[index].upvoted = userUpvoted(fact);
	        });
	    });
	}
	
	function userUpvoted(fact) {
		return !!fact.upvotes.find(o => o.user == $rootScope.authenticatedUser._id);
	}
	
	function getIndexOfFact(factID) {
		return $scope.facts.map(o => o._id).indexOf(factID);
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
    
    function getIndexOfUpvote(upvotes, user) {
    	upvotes.map(function(o) { return o.user; }).indexOf(user);
    }
    
    socket.on('fact', function(data) {
	    data.upvotes = [];
    	$scope.facts.push(data);
    });
    
    socket.on('fact:upvote', function(data) {
    	var factIndex = getIndexOfFact(data.fact._id);
    	$scope.facts[factIndex].upvotes.push({user: data.user._id});
		$scope.facts[factIndex].upvoted = true;
    });
    
    socket.on('fact:unvote', function(data) {
    	var factIndex = getIndexOfFact(data.fact._id);
    	$scope.facts[factIndex].upvotes.splice($scope.facts[factIndex].upvotes.map(o => o.upvotes).indexOf(data.user._id), 1);
    	$scope.facts[factIndex].upvoted = false;
    });
    
}]);