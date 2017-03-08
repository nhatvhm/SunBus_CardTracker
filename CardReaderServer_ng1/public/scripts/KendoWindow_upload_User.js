//var app = angular.module('homeScript', ["kendo.directives"]);
var app = angular.module('homeScript');

app.factory('KendoWindow_upload_User', ['$http', '$log', '$window', '$q', '$timeout',
    function ($http, $log, $window, $q, $timeout) {
        var o = {
            kName: "KendoWindow_about",

            //Sidebar - About Window
            Options: {
                //Content will be in HTML file
                title: "About",
                visible: false,
                width: 680, //minWidth: 240, maxHeight: 800,
                height: 450, //minHeight: 180, maxHeight: 600,
                actions: ["Minimize", "Close"],
                autoFocus: true,
                pinned: true,
                //position: {top: "50%", left: "50%"},
                resizable: false
            }
        };
        return o;
    }]);
