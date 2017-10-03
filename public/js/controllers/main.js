/* global angular, rekt */
var app = angular.module('catfacts');

app.controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$mdToast', '$mdDialog', '$mdBottomSheet', 'ApiService', 'hotkeys',
	function($scope, $rootScope, $mdSidenav, $mdToast, $mdDialog, $mdBottomSheet, ApiService, hotkeys) {
	    
	function bushDid911() {
	    var audio = new Audio('audio/illuminati.mp3');
            audio.play();
	}
	
	var catGifs = ['1iJvWqn','OoaHq88','bkvWQKe','3b2NwUb','xXz0reC','y2iF3r3','nz928M8','dbMqyX2','gLqCiBh','HvGHFly','zURa0Th','IWo0WFN','yT7TsnH'];
	    
	hotkeys.add({
	    combo: 'up up down down left right left right b a',
	    description: 'Konami code',
	    callback: function(event, hotkey) {
	        event.preventDefault();
	        bushDid911();
	
	        window.onblur = bushDid911;
	        window.onfocus = bushDid911;
	        
	        var els = document.getElementsByTagName('md-content');
	        
	        for (var i = 0; i < els.length; i++) {
	            els[i].style.backgroundImage = 'url(https://imgur.com/' + catGifs[Math.floor(Math.random() * catGifs.length)] + '.gif)';
	            els[i].style.backgroundSize = 'cover';
	        }
	    }
	});

	$scope.sideNav = {
		left: {
			toggle: function() {
				$mdSidenav('left').toggle();
			}
		}
	};
    
    $rootScope.showToast = function(message) {
        return $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('bottom right')
                .hideDelay(5000)
        );
    };
    
    $scope.showConfirm = function(title, subtitle, ok, cancel) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title(title)
            .textContent(subtitle)
            .ok(ok)
            .cancel(cancel);
        return $mdDialog.show(confirm);
    };
    
    $scope.showPrompt = function(title, subtitle, ok, cancel) {
		var prompt = $mdDialog.prompt()
			.title(title)
			.textContent(subtitle)
			.ariaLabel(title)
			.ok(ok)
			.cancel(cancel);
		return $mdDialog.show(prompt);
    };
    
    
    /* global SpeechSynthesisUtterance */
    var synth = window.speechSynthesis;
    var defaultVoice = null;
    
    synth.onvoiceschanged = function() {
        var voices = synth.getVoices();
        defaultVoice = voices.find(function(voice) {
            return voice.name == 'Google UK English Male';
        });
    };
    		    
    $scope.showCatFact = function() {
        
    	ApiService.getFact().then(function(response) {
    	    
    	    var fact = response.data.text;
    	    
    		$mdBottomSheet.show({
    		    templateUrl: '/views/partials/bottom-sheet-fact.html',
    		    controller: ['$scope', '$rootScope', function($scope, $rootScope) {
    		        $scope.fact = fact;
    		        
    		        $scope.alertCopied = function() {
    		            $rootScope.showToast("Text copied to clipboard");
    		        };
    		    }]
    		});
    		
    		var speech = new SpeechSynthesisUtterance(fact);
    		
    		if (defaultVoice) {
    		    speech.voice = defaultVoice;
    		}
    		
    		speech.pitch = 1.8;
    		
    		synth.speak(speech);
    	});
    };
    
    $scope.openAbout = function(event) {
        $mdDialog.show({
            templateUrl: '/views/partials/about.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false
        });
    };
    
    $scope.toggleDarkTheme = function(newTheme) {
        ApiService.updateUserSettings({
            theme: newTheme
        });
    };

}]);