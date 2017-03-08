//var app = angular.module('homeScript', ["kendo.directives"]);
var app = angular.module('homeScript');

app.factory('global', ['$http', '$log', '$window', '$q', '$timeout',
    function ($http, $log, $window, $q, $timeout) {
        var o = {
            //Constant section
            _iCheckLoginPeriod: parseInt("60000"),

            //Kendo Glossary
            _kG: "kendoGrid", 
            _kTV: "kendoTreeView",
            _kW: "kendoWindow",
            _kU: "kendoUpload",
            _kDP: "kendoDatePicker",
            _kTP: "kendoTimePicker",
            _kDDL: "kendoDropDownList",

            _ssite_ID: "etag",
			
            _host_root: "",
            _logout_url: "/login",

            sUserType: "",

            //Global object.
            _iTimeout_val: parseInt('10000'), //Timeout value for server access (10 seconds)
            oRequest_timeout_obj: setTimeout(function () { $log.log("TIMEOUT") }, 1000 * 3600), //Timeout object (not $timeout)

            //Constant section (function, big objects)
            fGotoLink_sameWin: function (url) {
                //Redirect to url within same window
                $window.location.href = url;
            },

            fGotoLink: function (url) {
                //Open url with new window
                $window.open(url, '_blank');
            },

            AssetGridExportFlag: false,

            //Kendo genereal event handlers
            customKendoDataSourceErrorHandler: function (e) {
                // e: Kendo event
                $timeout.cancel(o.oRequest_timeout_obj);
                //if (angular.isDefined(o.oRequest_timeout_obj.cancel)) { o.oRequest_timeout_obj.cancel(); }
                if (!e.xhr) { e = { xhr: e }; }
                $log.log('[customKendoDataSourceErrorHandler] Printing error: ');
                $log.log(e);
                alert("Error code: " + e.xhr.status + " - " + e.xhr.statusText + "\n" +
                    "Error message: " + e.xhr.responseText);
                if (parseInt(e.xhr.status) == 401) { o.fGotoLink_sameWin('/login'); }
            },

            //Dummy last item for copying convinence
            dummy: "dummy"
        };

        //Return service object
        return o;
    }]);