/*global angular */
(function (angular) {
    'use strict';
    angular.module('countdownTimer', [])
        .directive('countdown', function ($interval, dateFilter) {
            return {
                restrict: 'A',
                transclude: true,
                link: function (scope, element, attrs) {
                    var countDownInterval;

                    function displayString() {
                        
                        attrs.units = angular.isArray(attrs.units) ?  attrs.units : attrs.units.split('|');
                        var lastUnit = attrs.units[attrs.units.length - 1],
                            unitConstantForMillisecs = {
                                weeks: (1000 * 60 * 60 * 24 * 7),
                                days: (1000 * 60 * 60 * 24),
                                hours: (1000 * 60 * 60),
                                minutes: (1000 * 60),
                                seconds: 1000,
                                milliseconds: 1
                            },
                            unitsLeft = {},
                            returnString = '',
                            totalMillisecsLeft = new Date(attrs.endDate) - new Date(),
                            i,
                            unit;
                        for (i in attrs.units) {
                            if (attrs.units.hasOwnProperty(i)) {
                                //validation
                                unit = attrs.units[i].trim();
                                if (unitConstantForMillisecs[unit.toLowerCase()] === false) {
                                    $interval.cancel(countDownInterval);
                                    throw new Error('Cannot repeat unit: ' + unit);

                                }
                                if (unitConstantForMillisecs.hasOwnProperty(unit.toLowerCase()) === false) {
                                    $interval.cancel(countDownInterval);
                                    throw new Error('Unit: ' + unit + ' is not supported. Please use following units: weeks, days, hours, minutes, seconds, milliseconds');
                                }

                                //saving unit left into object
                                unitsLeft[unit] = totalMillisecsLeft / unitConstantForMillisecs[unit.toLowerCase()];

                                //precise rounding
                                if (lastUnit === unit) {
                                    unitsLeft[unit] = Math.ceil(unitsLeft[unit]);
                                } else {
                                    unitsLeft[unit] = Math.floor(unitsLeft[unit]);
                                }
                                //updating total time left
                                totalMillisecsLeft -= unitsLeft[unit] * unitConstantForMillisecs[unit.toLowerCase()];
                                //setting this value to false for validation of repeated units
                                unitConstantForMillisecs[unit.toLowerCase()] = false;
                                //adding verbage

                                returnString += ' ' + unitsLeft[unit] + ' ' + unit;
                            }
                        }
                        return returnString;
                    }
                    function updateCountDown() {
                        element.text(displayString());
                    }

                    element.on('$destroy', function () {
                        $interval.cancel(countDownInterval);
                    });

                    countDownInterval = $interval(function () {
                        updateCountDown();
                    }, 1);
                }
            };
        });
}(angular));