var app = angular.module('homeScript', ["kendo.directives"]);

app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }]);

app.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.useLegacyPromiseExtensions(false);
    }]);

//Factory part has been skipped.
//The following functions will be mega main() functions of control scripts.

app.controller('ConsoleCtrl', [
    '$scope', '$http', '$interval', '$log',
    'global', 'dummy', 'check_login', 'file_upload', 
    'KendoGrid_User', 'KendoGrid_BusStat', 
    'KendoDropDownList_Bus',
    'KendoUpload_User',
    'KendoTreeView_Side',
    'KendoWindow_about', 'KendoWindow_upload_User',
    'CustomFilter_BusStat',
    function (
        $scope, $http, $interval, $log,
        global, dummy, check_login, file_upload,
        KendoGrid_User, KendoGrid_BusStat,
        KendoDropDownList_Bus,
        KendoUpload_User,
        KendoTreeView_Side,
        KendoWindow_about,KendoWindow_upload_User,
        CustomFilter_BusStat
    ) {
        //Check upload API
        file_upload.check_api();
        //Login related
        $scope.show_system_admin = false;

        //Kendo Grid
        $scope.Options_KendoGrid_User = KendoGrid_User.Options;
        $scope.Options_KendoGrid_BusStat = KendoGrid_BusStat.Options;
        //Kendo Window
        $scope.Options_KendoWindow_about = KendoWindow_about.Options;
        $scope.Options_KendoWindow_upload_User = KendoWindow_upload_User.Options;
        //Kendo TreeView
        $scope.Options_KendoTreeView_Side = KendoTreeView_Side.Options;
        //Kendo Upload
        $scope.Options_KendoUpload_User = KendoUpload_User.Options;

        //Initialization of some "dirty" variables 
        $scope.dataItem = {};

        //To make log in service/ factory visiable
        //In controller, just type console.log is OK
        $scope.$log = global.$log;

        //Check login for every 60 seconds
        if (angular.isDefined($scope.login_interval)) {
            $interval.cancel($scope.login_interval);
        }
        $scope.login_interval = $interval(function () {
            check_login.isloggedin(function () {
                //Kept for potential use
                KendoGrid_BusStat.reload_online();
            });
        }, global._iCheckLoginPeriod);
        //Check user type
        check_login.sUserType(function (sUserType) {
            global.sUserType = sUserType;
            KendoTreeView_Side.onUserType(sUserType);
            KendoGrid_BusStat.onUserType(sUserType);
            if (sUserType == "user") {
                $scope.Selected_KendoTreeView_Side = "BusStat";
                $scope.KendoTreeView_Side_show = false;
                $(".container").css('padding', "0");
                //$scope.$apply();
            } else if (sUserType == "admin") {
                //Keep for potential use ($scope only)
            }
            $scope.show_system_admin = (sUserType == "system_admin");
        });

        $scope.KendoTreeView_Side_show = true;
        $scope.Logout = function () {
            global.fGotoLink_sameWin(global._logout_url);
        }

        //Side Menu Related
        //Instead of $apply, since the value is changed by Kendo and then service objects, it's not in Angular $scope.
        //Therefore, if you want to watch it, use $scope.$watch(fReturn($scope),fChange(new))
        $scope.Selected_KendoTreeView_Side = "";
        $scope.OnChange_KendoTreeView_Side = function (dataItem) {
            $log.log("[KendoTreeView_Side] Selecting " + angular.toJson(dataItem));
            $scope.Selected_KendoTreeView_Side = dataItem.text;
            var selected_text = dataItem.text;
            if (selected_text != null) {
                if (selected_text == "About") { $scope.KendoWindow_about.open().center(); }
                else if (selected_text == "Logout") {
                    global.fGotoLink_sameWin(global._logout_url);
                } else {
                    //Do not annoy user!
                    //alert("OOPS");
                }
            }
        }

        //However, when you need to call kendo grids by jquery, you still need to "watch" the value.
        //If you put it in k-on-change, it won't work.
        $scope.$watch('Selected_KendoTreeView_Side', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                //Window Resize
                try {
                    $("#KendoGrid_" + newValue).data("kendoGrid").resize();
                } catch (e) {
                    console.log("Failed: " + "#KendoGrid_" + newValue);
                    //console.log(e);
                }
            }
        });


        $scope.fGotoLinkbyLatLon = function (dI) {
            //console.log(dI);
            global.fGotoLink("https://www.google.com.hk/maps/place//@" + dI.latitude.toFixed(7) + "," + dI.longitude.toFixed(7) + ",15z");
        }

        $scope.KendoGrid_BusStat_MAC = "";
        $scope.Enable_Export_Excel_BusStat = true;
        $scope.ExportToExcel_BusStat = KendoGrid_BusStat.ExportToExcel;
        //Kendo Date PicKer
        $scope.Options_KendoDatePicker_BusStat_Start = CustomFilter_BusStat.Options_KendoDatePicker(0);
        $scope.Options_KendoDatePicker_BusStat_End = CustomFilter_BusStat.Options_KendoDatePicker(1);
        //Kendo Time Picker
        $scope.Options_KendoTimePicker_BusStat_Start = CustomFilter_BusStat.Options_KendoTimePicker(0);
        $scope.Options_KendoTimePicker_BusStat_End = CustomFilter_BusStat.Options_KendoTimePicker(1);
        $scope.KendoGrid_BusStat_filterMAC = KendoGrid_BusStat.filterMAC;
        $scope.KendoGrid_BusStat_filterClear = function () {
            $scope.KendoGrid_BusStat_MAC = "";
            CustomFilter_BusStat.Clear_Device_Status_Filter();
        }

        $scope.KendoGrid_User_Upload = function () { $scope.KendoWindow_upload_User.open().center(); }
        $scope.Enable_Export_Excel_User = true;
        $scope.ExportToExcel_User = KendoGrid_User.ExportToExcel;

        //Setting auto resize
        $(window).resize(function () {
            //Kendo Grid
            if (($scope.Selected_KendoTreeView_Side) && ($scope.Selected_KendoTreeView_Side.length > 0)) {
                $("#KendoGrid_" + $scope.Selected_KendoTreeView_Side).data("kendoGrid").resize();
            }
        });
    }]);

app.controller('LoginCtrl', [
    '$scope',
    '$window',
    function ($scope, $window) {
        $scope.username = "";
        $scope.password = "";
        $scope.message = "";
        $scope.onKeyPressed = function (event) {
            console.log(event);
        }
        $scope.login = function (username, password) {
            /**
            var url = "http://" + $window.location.host + "/web_console/asset4_asdDB.html";
            console.log(angular.toJson([username, password]));
            if (username == "admin") { $scope.gotoConsole(url); }
            **/
        }
        $scope.gotoConsole = function (url) {
            //$log.log(url);
            //$window.location.href = url;
        }
    }]);