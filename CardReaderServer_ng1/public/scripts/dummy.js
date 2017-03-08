var app = angular.module('homeScript');

app.factory('dummy', ['$http', '$log', '$window', '$q', '$timeout',
    function ($http, $log, $window, $q, $timeout) {
        var o = {
            helloworld: function() {
                $log.log("Hello World");
            } 
        };
        return o;
    }
]);