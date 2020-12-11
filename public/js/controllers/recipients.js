/* global angular */
var app = angular.module('catfacts');

app.controller('RecipientsCtrl', ['$scope', '$rootScope', '$state', 'ApiService', 'AuthService', '$mdDialog', '$mdMedia',
    function($scope, $rootScope, $state, ApiService, AuthService, $mdDialog, $mdMedia) {
    
    $scope.recipients = [];
    $scope.AuthService = AuthService;
    
    $scope.orderBy = 'name';
    
    getMyRecipients();
    setTimer();
    
	// TODO: Repurpose this
	const endTime = {
		// Define time for next cat fact to be sent
		hours: 13,
		minutes: 55
	};
	
	$scope.countdownFinished = function() {
		setTimer();
	};
    
    $scope.validatePhoneNgPattern = (function() {
        return {
            test: $scope.validatePhone
        };
    })();

    $scope.openAddRecipient = function(event) {
		$mdDialog.show({
			templateUrl: '/views/partials/add-recipient.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
            fullscreen: false,
            controller: ['$scope', '$mdDialog', function($localScope, $mdDialog) {
                $localScope.addRecipient = () => {
                    const name = $localScope.form.name,
                          number = $localScope.form.number;
                    
                    if (!name || !number || !$localScope.validatePhone(number)) {
                        return $rootScope.toast({message: "Invalid name or number"});
                    }
                    
                    ApiService.addRecipient({
                        recipient: {
                            name,
                            number: $localScope.validatePhone(number, true)
                        },
                        animalTypes: [$state.params.animal]
                    })
                    
                    .then(response => {
                        
                        // Remove this number from the list (if archived)
                        $scope.recipients = $scope.recipients.filter(r => r.number != number);
                        
                        $scope.recipients = [
                            ...$scope.recipients,
                            ...response.data.newRecipients,
                            ...response.data.updatedRecipients
                        ].sort((a, b) => {
                            // Alphabetic sort
                            return (a.name && b.name) ? (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1) : 1;
                        });
                        
                        $mdDialog.hide();
                        $rootScope.toast({message: response.data.message});
                    }, err => {
                        $rootScope.toast({message: err.data.errors[Object.keys(err.data.errors)[0]].message || err.data.message});
                    });
                };

                $localScope.openImportContacts = contacts => {
                    $mdDialog.show({
                        controller: ['$scope', '$rootScope', '$mdDialog', 'ApiService', function($moreLocalScope, $rootScope, $mdDialog, ApiService) {
                            $moreLocalScope.contacts = contacts;
                            $moreLocalScope.table = {orderBy: 'name'};
                            $moreLocalScope.selectedContacts = [];
                            
                            $moreLocalScope.finish = () => {
                                if ($moreLocalScope.selectedContacts.length > 0) {
                                    $mdDialog.hide($moreLocalScope.selectedContacts);
                                } else {
                                    $mdDialog.cancel();
                                }
                            };
                            
                            $moreLocalScope.checkScopesAndGetContacts = () => {
                                $moreLocalScope.promise = ApiService.getGoogleContacts({animalType: $state.params.animal}).then(response => {
                                    $moreLocalScope.contacts = response.data;
                                }, err => {
                                    if (err.status == 403 || err.status == 401) AuthService.openOAuth();
                                });
                            };
                            
                            $rootScope.$on('contacts:import', () => {
                                $moreLocalScope.checkScopesAndGetContacts();
                            });
                            
                            (() => {
                                $moreLocalScope.checkScopesAndGetContacts();
                            })();
                        }],
                        templateUrl: '/views/partials/contacts.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: $mdMedia('xs')
                    })
                    .then(recipients => {
                        
                        ApiService.addRecipients({recipients, animalTypes: [$state.params.animal]}).then(response => {
                            
                            $scope.recipients = [
                                ...$scope.recipients,
                                ...response.data.newRecipients,
                                ...response.data.updatedRecipients
                            ].sort((a, b) => {
                                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                            });
                            
                            $rootScope.toast({message: response.data.message});
                        }, err => {
                            $rootScope.toast({message: err.data.message || "Error adding recipients"});
                        });
                    });
                };
                            
                // TODO: Refactor phone validation into it's own directive for reuse
                $localScope.validatePhone = (number, returnNumber = false) => {
                    const trim = number.replace(/[^0-9]/gi, '').trim();
                    return returnNumber ? trim : trim.length == 10;
                };
            }]
		});
	};
    
    function getMyRecipients() {        
        $scope.promise = ApiService.getMyRecipients({
            animalType: $state.params.animal
        }).then(response => {
            $scope.recipients = response.data;
        }, err => {
            $rootScope.toast({message: err.data.message});
        });
    }

    function setTimer() {
		const now = new Date(),
			endTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 21, 20, 0, 0));
			
		if (endTime.getTime() - now.getTime() < 0) {
			endTime.setDate(endTime.getDate() + 1);
		}
		
		const seconds = (endTime.getTime() - now.getTime()) / 1000;
		$scope.seconds = seconds;
		$scope.$broadcast('timer-set-countdown-seconds', seconds);
		$scope.$broadcast('timer-start');
    }
    
}]);