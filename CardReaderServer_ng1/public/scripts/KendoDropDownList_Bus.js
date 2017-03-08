var app = angular.module('homeScript');

app.factory('KendoDropDownList_Bus', ['$http', '$log', '$window', '$q', '$timeout', 'global',
    function ($http, $log, $window, $q, $timeout, global) {
        var o = {
            kName: "KendoDropDownList_Bus",
            
            sSchema_list: [
                //{ text: "KMB 1A", value: "2A894EEE8216" },
                //{ text: "SunBus", value: "340A6A242202" },
                { text: "SunBus", value: "FE8C0B9D2924" }
            ],

            default_text: "SunBus",
            default_choice: "FE8C0B9D2924",
        };

        //User Grid's dataSource, k-options
        o.DataSource_local = new kendo.data.DataSource({ data: o.sSchema_list });

        /**
        o.Options = {
            dataSource: KendoGrid_BusInfo.dataSource({}),
            value: o.default_choice,
            optionLabel: "--All--",
            dataTextField: "bus_Name",
            dataValueField: "mac_Address",
        };
        **/
        o.Options = {
            dataSource: o.DataSource_local,
            index: 1,
            //text: o.default_text,
            //value: o.default_choice,
            optionLabel: "--None--",
            dataTextField: "text",
            dataValueField: "value",
        };

        //Return service object
        return o;
    }]);