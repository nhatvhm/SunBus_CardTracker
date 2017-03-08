var app = angular.module('homeScript');

app.factory('server_access', ['$http', '$log', '$window', '$q', '$timeout', 'global',
    function ($http, $log, $window, $q, $timeout, global) {
        var o = {
            //Keep for potential use. Seems there is no constant.

            //From e.error() instead from server 
            oRequest_fail_obj: function (kName, op) {
                return {
                    status: 607,
                    statusText: "Angular Mediator: Bad Request",
                    responseText: angular.toJson({ kName: kName, op: op })
                };
            },

            oMediator_fail_obj: function (kName, op) {
                return {
                    status: 601,
                    statusText: "Angular Mediator: Fail Binding",
                    responseText: angular.toJson({ kName: kName, op: op })
                };
            },

            oNot_supported_obj: function (kName, op) {
                return {
                    status: 641,
                    statusText: "Angular Mediator: Binding success but operation is not supported",
                    responseText: angular.toJson({ kName: kName, op: op })
                };
            },

            oNot_json_obj: function (kName, op) {
                return {
                    status: 643,
                    statusText: "Angular Mediator: Server not returning JSON object",
                    responseText: angular.toJson({ kName: kName, op: op })
                };
            },

            oErr_from_server: function (kName, op, data, status) {
                //Error message retrieved from server response.
                //Useful if the server response is not restricted.
                return {
                    status: status,
                    statusText: status == 500 ? "Server internal error. See log file of server for details." : data,
                    responseText: angular.toJson({ kName: kName, op: op })
                };
            },

            xhr_response_obj: function (a, b, c) {
                return {
                    status: a,
                    statusText: b,
                    responseText: c
                };
            },

            //Timeout Error object
            oXhr_timeout_obj: {
                status: 408,
                statusText: "Request Timeout",
                responseText: "Timeout amount(ms): " + global._iTimeout_val
            }
        };

        //It acts like a $q but in Kendo style
        //Super mega angular wrapper for CRUD event!
        //kName: name of involved component in HTML (convension)
        //op: operation (c/r/u/d) (or mqtt)
        //e: Kendo event object (leave it null if not proided)
        //dataItem: dataItem provided by Kendo (or built by user manually)
        o.init = function (kName, op, http_link, http_method, post_obj, success, fail) {
            //return $q(function (resolve, reject) {

            //Make Timeout object if not exist; ignore if it's counting down
            //$log.log(o.oRequest_timeout_obj);
            //if (!angular.isDefined(o.oRequest_timeout_obj)) {
            $timeout.cancel(global.oRequest_timeout_obj);
            $log.log("[server_access] init(" + kName + "," + op + ")");

            global.oRequest_timeout_obj = $timeout(function () {
                $log.log("[server_access] Timeout");
                return fail(o.oXhr_timeout_obj, o.oXhr_timeout_obj.status, o.oXhr_timeout_obj.statusText);
            }, global._iTimeout_val);
            //}

            //Make settings
            //s = { http_link, method, post_obj }
            //var s = o.make_settings(kName, op, e, dI);
            //$log.log(s);

            //Mega mediator
            //Call e.error(XHR response, status, errorthrown) for failure
            //Call e.success(data) for success
            if (!http_link) {
                return fail(o.oMediator_fail_obj(kName, op), 0, "");
            } else if (http_method == "GET") {
                $http.get(global._host_root + http_link).then(function (response) {
                    $timeout.cancel(global.oRequest_timeout_obj);
                    return success(response.data);
                },function (response) {
                    return fail(o.xhr_response_obj(response.status, kName + ", " + op, angular.toJson(response.data)), response.status, response.statusText);
                });
            } else if (http_method == "POST") {
                $http.post(global._host_root + http_link, post_obj).then(function (response) {
                    $timeout.cancel(global.oRequest_timeout_obj);
                    return success(response.data);
                },function (response) {
                    return fail(o.xhr_response_obj(response.status, kName + ", " + op, angular.toJson(response.data)), response.status, response.statusText);
                });
            } else {
                return fail(o.oMediator_fail_obj(kName, op), 0, "");
            }
        };


        //Called from HTML code, and then in angular $scope
        //Act like the dataSource process's crud in Kendo Grid
        //But caller is Angular event instead of Kendo event
        //not_grid: name of the "grid" - HTML elememts
        //op: crud or self-defined operation code
        //obj_inf: information of the modified object (usually from $scope)
        //obj_ref: reference of the modified object (a.k.a the copy of original object)
        o.not_dataSource_crud = function (not_grid, op, http_link, http_method, post_obj, success) {
            //Goal: call o.server_access with proper parameters
            //o.server_access = function (kName, op, e, dI) {...};

            $log.log("[server_access] not_dataSource_crud(" + not_grid + "," + op + ")");
            //Simple confirmation window 
            if (op == "d") {
                //Note: Although it's return type is boolean, it cannot be assigned to any variable
                if (!confirm("Are you sure you're going to delete the item?")) { return; }
            }

            var kendopromiseEvent = {
                success: function (data) {
                    $log.log("[server_access] not_dataSource_crud: Operation success.");
                    return success(data);
                },
                error: global.customKendoDataSourceErrorHandler
            };

            o.init(not_grid, op, http_link, http_method, post_obj, kendopromiseEvent.success, kendopromiseEvent.error);
        }

        //Return service object
        return o;
    }]);