/* global angular */
var app = angular.module('catfacts');
var date, time = {
    // Define time for next cat fact
    hours: 16, // Military time (add 12 hours for pm)
    minutes: 20
};

app.controller('FactsCtrl', ['$scope', '$rootScope', 'FactService', 'socket',
	function($scope, $rootScope, FactService, socket) {
    
    getFacts();
    setTimer();
	
	$scope.submitFact = function() {
	    var fact = $scope.form.newFact;
	    
	    if (fact && fact.trim().length != 0) {
	        FactService.submitFact({text: fact}).then(function(response) {
	        	response.data.upvotes = [];
	            $scope.facts.unshift(response.data);
	        });
    	    $scope.form.newFact = '';
	    } else {
	        $scope.showToast("Type in a fact");
	    }
	};
	
	// http://stackoverflow.com/questions/30861304/angular-ng-repeat-filter-passing-wrong-index
	$scope.upvoteFact = function(fact) {
		var index = getIndexOfFact(fact);
		if (userUpvoted(fact)) {
			FactService.unvoteFact(fact._id).then(function() {
				$scope.facts[index].upvotes.splice(
					$scope.facts[index].upvotes.indexOf($rootScope.authenticatedUser._id), 1
				);
				$scope.facts[index].upvoted = false;
			}, function(err) {
				$rootScope.toast({message: err.data.message});
			});
		} else {
			FactService.upvoteFact(fact._id).then(function() {
				$scope.facts[index].upvotes.push({user: $rootScope.authenticatedUser._id});
				$scope.facts[index].upvoted = true;
			}, function(err) {
				$rootScope.toast({message: err.data.message});
			});
		}
	};
	
	function getFacts() {
	    FactService.getSubmittedFacts().then(function(response) {
	        $scope.facts = response.data;
	        $scope.facts.forEach(function(fact, index) {
	        	$scope.facts[index].upvoted = userUpvoted(fact);
	        });
	    });
	}
	
	function userUpvoted(fact) {
		return !!fact.upvotes.find(o => o.user == $rootScope.authenticatedUser._id);
	}
	
	function getIndexOfFact(fact) {
		return $scope.facts.indexOf(fact);
	}
	
	function setTimer() {
        // Generate timestamp
        date = new Date();
    
        if ((date.getHours() == time.hours && date.getMinutes() > time.minutes) || date.getHours() > time.hours) {
            // After given time is passed, fact is sent the next day
            date.setDate(date.getDate() + 1);
        }
        
        date.setHours(time.hours);
        date.setMinutes(time.minutes);
        $scope.sendDate = date.toString();
    }
    
    function getIndexOfUpvote(upvotes, user) {
    	upvotes.map(function(o) { return o.user; }).indexOf(user);
    }
    
    socket.on('fact', function(data) {
    	$scope.facts.push(data);
    });
    
    socket.on('fact:upvote', function(data) {
    	alert($scope.facts[getIndexOfFact(data.fact)]);
    	$scope.facts[getIndexOfFact(data.fact._id)].upvotes.push({user: data.user._id});
    });
    
    socket.on('fact:unvote', function(data) {
    	var fact = $scope.facts[getIndexOfFact(data.fact._id)];
    	fact.upvotes.splice(fact.upvotes.indexOf({user: data.user._id}), 1);
    });
    
}]);