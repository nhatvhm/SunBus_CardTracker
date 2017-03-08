var app = angular.module('homeScript');

app.factory('check_login', ['$http', '$log', '$window', '$q', '$timeout', 'global', 'server_access',
    function ($http, $log, $window, $q, $timeout, global, server_access) {
        var o = {
            failauth: function () {
                alert("Error when authenticating. Redirecting to login page.");
                global.fGotoLink_sameWin('/login');
                return null;
            },

            call_server: function (op, e, dI) {
                var API_setting_map = {
                    route1: "",
                    "isloggedin": { route2: "/isloggedin", method: "GET", obj: null },
                    "usertype": { route2: "/usertype", method: "GET", obj: null },
                };

                var http_link = API_setting_map.route1 + API_setting_map[op].route2;
                var http_method = API_setting_map[op].method;
                var post_obj = API_setting_map[op].obj;

                server_access.init("check_login", op, http_link, http_method, post_obj, e.success, e.error);
            }
        };

        //Check if the user is logged in (since HTML is stateless)
        o.isloggedin = function (onSuccess) {
            var e = {
                success: function (data) {
                    if (data != 'true') {
                        alert("You're not authenticated. Redirecting to login page.");
                        global.fGotoLink_sameWin(global._logout_url);
                        return;
                    } else {
                        onSuccess();
                    }
                },
                error: global.customKendoDataSourceErrorHandler //o.failauth()
            }
            o.call_server("isloggedin", e, null);
        };

        //Check User Type of current user (done initially)
        o.sUserType = function (onSuccess) {
            var e = {
                success: function (data) {
                    $log.log("[check_login] User type: " + data);
                    return onSuccess(data);
                },
                error: global.customKendoDataSourceErrorHandler
            }
            o.call_server("usertype", e, null);
        }

        //Return service object
        return o;
    }]);