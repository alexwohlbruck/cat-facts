angular.module('catfacts').filter('timeIntervalFormat', function () {
    return function(milliseconds) {
        var dur = {};
        var units = [
            {label:"milliseconds",    mod:1000},
            {label:"seconds",   mod:60},
            {label:"minutes",   mod:60},
            {label:"hours",     mod:24},
            {label:"days",      mod:31}
        ];
        // calculate the individual unit values...
        units.forEach(function(u){
            milliseconds = (milliseconds - (dur[u.label] = (milliseconds % u.mod))) / u.mod;
        });
        // convert object to a string representation...
        var nonZero = function(u){ return dur[u.label]; };
        dur.toString = function(){
            return units
                .reverse()
                .filter(nonZero)
                .map(function(u){
                    return dur[u.label] + " " + (dur[u.label]==1?u.label.slice(0,-1):u.label);
                })
                .join(', ');
        };
        return dur.toString();
    };
});