var app = angular.module('homeScript');

app.factory('CustomFilter_BusStat', ['$http', '$log', '$window', '$q', '$timeout', 'global',
    function ($http, $log, $window, $q, $timeout, global) {
        var o = {
            _kDDL_BusStat: "#KendoDropDownList_BusStat",
            _kDP_Start: "#KendoDatePicker_BusStat_Start",
            _kDP_End: "#KendoDatePicker_BusStat_End",
            _kTP_Start: "#KendoTimePicker_BusStat_Start",
            _kTP_End: "#KendoTimePicker_BusStat_End",
            sDevice_list: [
                { text: "00000001" },
                { text: "00000002" },
                { text: "00000003" },
                { text: "88" },
            ],
        };

        //If it needs a dynamic list, link it to KendoGrid_Device_Status's dataSource. Don't access server.
        o.DataSource_KendoDropDownList_Device_Local = new kendo.data.DataSource({ data: o.sDevice_list });

        o.Options_KendoDropDownList_Device = {
            dataSource: o.DataSource_KendoDropDownList_Device_Local,
            //value: o.default_choice,
            optionLabel: "--Select All--",
            dataTextField: "text",
            dataValueField: "text"
        };

        o.Options_KendoDatePicker = function (op) {
            //0 === Start, 1 === End
            //var t = new Date();
            //var now = new Date(t.toDateString() + " 23:59:59.999");
            //var lastyear = new Date(t.toDateString() + " 00:00:00.000");
			var now = new Date(); now.setHours(23, 59, 59, 999);
            var lastyear = new Date(); lastyear.setHours(0,0,0,0);
            //var lastyear = new Date(); lastyear.setFullYear(now.getFullYear() - 1);
            return {
                format: "yyyy/MM/dd",
                value: (op === 0) ? lastyear : now,
            }
        };

        o.Options_KendoTimePicker = function (op) {
            //0 === Start, 1 === End
            //var t = new Date();
            //var now = new Date(t.toDateString() + " 23:59:59.999");
            //var lastyear = new Date(t.toDateString() + " 00:00:00.000");
			var now = new Date(); now.setHours(23, 59, 59, 999);
            var lastyear = new Date(); lastyear.setHours(0,0,0,0);
            //var lastyear = new Date(); lastyear.setFullYear(now.getFullYear() - 1);
            return {
                format: "HH:mm",
                interval: 15,
                value: (op === 0) ? lastyear : now,
            }
        };

        o.Clear_Device_Status_Filter = function () {
            $(o._kDDL_BusStat).text("");
            /**
            $(o._kDP_Start).data(global._kDP).value(null);
            $(o._kTP_Start).data(global._kTP).value(null);
            $(o._kDP_End).data(global._kDP).value(null);
            $(o._kTP_End).data(global._kTP).value(null);
            **/
            /**
            if ($(KendoGrid_Device_Status.kName) && $(KendoGrid_Device_Status.kName).data(global._kG)) {
                $(KendoGrid_Device_Status.kName).data(global._kG).dataSource.filter({});
            }
            **/
        }

        o.Set_Device_Status_Filter = function () {
            var f_param = { logic: "and", filters: [] };
            var kDP_S = $(o._kDP_Start).data(global._kDP).value();
            var kTP_S = $(o._kTP_Start).data(global._kTP).value();
            var kDP_E = $(o._kDP_End).data(global._kDP).value();
            var kTP_E = $(o._kTP_End).data(global._kTP).value();
            var device_id = $(o._kDDL_BusStat).data(global._kDDL).value();
            if (kDP_S && kTP_S && kDP_E && kTP_E) {
                var start = new Date();
                var end = new Date();
                start.setFullYear(kDP_S.getFullYear(), kDP_S.getMonth(), kDP_S.getDate());
                start.setHours(kTP_S.getHours(), kTP_S.getMinutes(), kTP_S.getSeconds());
                end.setFullYear(kDP_E.getFullYear(), kDP_E.getMonth(), kDP_E.getDate());
                end.setHours(kTP_E.getHours(), kTP_E.getMinutes(), kTP_E.getSeconds());
                f_param.filters.push({ field: "timestamp", operator: "gte", value: start });
                f_param.filters.push({ field: "timestamp", operator: "lt", value: end });
                //$log.log(start);
                //$log.log(end);
            }
            if (device_id) {
                f_param.filters.push({ field: "device_id", operator: "eq", value: device_id });
            }
            $log.log(f_param);
            /**
            if ($(KendoGrid_Device_Status.kName) && $(KendoGrid_Device_Status.kName).data(global._kG)) {
                $(KendoGrid_Device_Status.kName).data(global._kG).dataSource.filter(f_param);
            }
            **/
        }

        /**
        o.Export_Excel = function () {
            if ($(KendoGrid_Device_Status.kName) && $(KendoGrid_Device_Status.kName).data(global._kG)) {
                $(KendoGrid_Device_Status.kName).data(global._kG).saveAsExcel();
            }
        }
        **/

        o.get_Start_End = function () {
            var kDP_S = $(o._kDP_Start).data(global._kDP).value();
            var kTP_S = $(o._kTP_Start).data(global._kTP).value();
            var kDP_E = $(o._kDP_End).data(global._kDP).value();
            var kTP_E = $(o._kTP_End).data(global._kTP).value();
            if (kDP_S && kTP_S && kDP_E && kTP_E) {
                var start = new Date();
                var end = new Date();
                start.setFullYear(kDP_S.getFullYear(), kDP_S.getMonth(), kDP_S.getDate());
                start.setHours(kTP_S.getHours(), kTP_S.getMinutes(), kTP_S.getSeconds());
                end.setFullYear(kDP_E.getFullYear(), kDP_E.getMonth(), kDP_E.getDate());
                end.setHours(kTP_E.getHours(), kTP_E.getMinutes(), kTP_E.getSeconds());
                //f_param.filters.push({ field: "timestamp", operator: "gte", value: start });
                //f_param.filters.push({ field: "timestamp", operator: "lt", value: end });
                //$log.log(start);
                //$log.log(end);
                return [start, end];
            }
            return [];
        }


        //Return service object
        return o;
    }]);