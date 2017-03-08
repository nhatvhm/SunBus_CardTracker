var app = angular.module('homeScript');

app.factory('KendoGrid_BusStat', [
    '$http', '$log', '$window', '$q', '$timeout',
    'global', 'server_access', 'CustomFilter_BusStat',
    function ($http, $log, $window, $q, $timeout,
        global, server_access, CustomFilter_BusStat
    ) {

        var o = {
            kName: "#KendoGrid_BusStat",
            editTemplate: "#editor_KendoGrid_BusStat",
            toolbarTemplate: "#toolbar_KendoGrid_BusStat",
            //latlonTemplate: "#latlon_KendoGrid_BusStat",
            APIRoute: "/BusStat",
            APIRoute_OLD: "/BusStat_KMB",
            //DEFAULT_MAC: "FE8C0B9D2924",
            DEFAULT_MAC: "",

            /**
             * Observed from MYSQL
             * BusStat = {
             * stat_Index: { type: Sequelize.INTEGER(11).ZEROFILL.UNSIGNED, primaryKey: true, autoIncrement: true },
             * mac_Address: { type: Sequelize.STRING(24) },
             * site_ID: { type: Sequelize.STRING },
             * latitude: { type: Sequelize.FLOAT, allowNull: true },
             * longitude: { type: Sequelize.FLOAT, allowNull: true },
             * state: { type: Sequelize.INTEGER(4), allowNull: true },
             * gps_available: { type: Sequelize.INTEGER(11), allowNull: true },
             * last_in_number: { type: Sequelize.INTEGER(4), allowNull: true },
             * last_out_number: { type: Sequelize.INTEGER(4), allowNull: true },
             * timestamp: { type: Sequelize.BIGINT(20), allowNull: true },
             * current_total: { type: Sequelize.INTEGER(4) },
             * send_flag: { type: Sequelize.BOOLEAN },
             * record_id: { type: Sequelize.INTEGER(11) },
             * busId: { type: Sequelize.INTEGER(11), allowNull: true },
             * stopID: { type: Sequelize.INTEGER(11), allowNull: true }
            **/

            //This Schema is used by both Grid Column options and dataSource.
            //Key violation is undetected yet.
            Schema_DEV: {
                data: "items", //See server API
                total: "itemCount", //See server API
                error: "error",
                model: {
                    id: "stat_Index",
                    fields: {
                        stat_Index: {
                            from: 'stat_Index', nullable: true, type: 'number', editable: false,
                            title: "Status Index"
                        },
                        mac_Address: {
                            from: 'mac_Address', defaultValue: "", validation: { required: true }, hidden: true,
                            title: "MAC Address",
                        },
                        site_ID: {
                            from: 'site_ID', defaultValue: "", validation: { required: true },
                            title: "Site ID"
                        },
                        latitude: {
                            from: 'latitude', nullable: true, defaultValue: 0,
                            title: "Latitude",
                        },
                        longitude: {
                            from: 'longitude', nullable: true, defaultValue: 0,
                            title: "Longitude",
                        },
                        course: {
                            from: 'course', nullable: true, type: "number",
                            title: "Course",
                        },
                        last_in_number: {
                            from: 'last_in_number', nullable: true, defaultValue: 0,
                            title: "Last Detected (IN)",
                        },
                        last_out_number: {
                            from: 'last_out_number', nullable: true, defaultValue: 0,
                            title: "Last Detected (OUT)",
                        },
                        tot_in_num: {
                            from: 'tot_in_num', nullable: true, defaultValue: 0,
                            title: "Total Count (IN)",
                        },
                        tot_out_num: {
                            from: 'tot_out_num', nullable: true, defaultValue: 0,
                            title: "Total Count (OUT)",
                        },
                        timestamp: {
                            from: 'timestamp', nullable: true, defaultValue: 0,
                            title: "Timestamp",
                        },
                        current_total: {
                            from: 'current_total', defaultValue: 0, validation: { required: true },
                            title: "Current Total",
                        },
                        send_flag: {
                            from: 'send_flag', defaultValue: false, validation: { required: true }, type: "boolean",
                            title: "Send Flag",
                        },
                        rec_id: {
                            from: 'rec_id', defaultValue: false, validation: { required: true },
                            title: "Record ID",
                        },
                        stopID: {
                            from: 'stopID', nullable: true, defaultValue: 0,
                            title: "Stop ID",
                        }
                    }
                }
            },

            Schema: {
                data: "items", //See server API
                total: "itemCount", //See server API
                error: "error",
                model: {
                    id: "stat_Index",
                    fields: {
                        createTime: {
                            from: 'createTime', nullable: true, defaultValue: 0, width: "200px",
                            title: "Create Time", format: "{0: yyyy-MM-dd HH:mm:ss}"
                        },
                        mac_Address: {
                            from: 'mac_Address', defaultValue: "", validation: { required: true }, hidden: true,
                            title: "MAC Address", //groupable: true,
                        },
                        site_ID: {
                            from: 'site_ID', defaultValue: "", validation: { required: true }, hidden: true,
                            title: "Site ID"
                        },
                        course: {
                            from: 'course', nullable: true, type: 'number', hidden: true,
                            title: "Course",
                        },
                        last_in_number: {
                            from: 'last_in_number', nullable: true, defaultValue: 0, type: 'number', 
                            title: "Last IN",
                        },
                        last_out_number: {
                            from: 'last_out_number', nullable: true, defaultValue: 0, type: 'number', 
                            title: "Last OUT",
                        },
                        tot_in_num: {
                            from: 'tot_in_num', nullable: true, defaultValue: 0, type: 'number', 
                            title: "Total IN",
                        },
                        tot_out_num: {
                            from: 'tot_out_num', nullable: true, defaultValue: 0, type: 'number',
                            title: "Total OUT",
                        },
                        tot_up_in: {
                            from: 'tot_up_in', nullable: true, defaultValue: 0, type: 'number', 
                            title: "Total IN (Upper)",
                        },
                        tot_up_out: {
                            from: 'tot_up_out', nullable: true, defaultValue: 0, type: 'number', 
                            title: "Total OUT (Upper)",
                        },
                        timestamp: {
                            from: 'timestamp', nullable: true, defaultValue: 0, type: 'number', hidden: true,
                            title: "Timestamp",
                        },
                        current_total: {
                            from: 'current_total', defaultValue: 0, validation: { required: true }, type: 'number', hidden: true,
                            title: "Onboard",
                        },
                        locaton: {
                            from: 'location', nullable: true, defaultValue: 0, type: 'number', format: "{0:n6}", template: kendo.template($("#latlon_KendoGrid_BusStat").html()),
                            title: "Location",
                        },
                        latitude: {
                            from: 'latitude', nullable: true, defaultValue: 0, type: 'number', format: "{0:n6}", hidden: true,
                            title: "Latitude",
                        },
                        longitude: {
                            from: 'longitude', nullable: true, defaultValue: 0, type: 'number', format: "{0:n6}", hidden: true,
                            title: "Longitude",
                        },
                        send_flag: {
                            from: 'send_flag', defaultValue: false, validation: { required: true }, type: "boolean", hidden: true,
                            title: "Send Flag",
                        },
                        rec_id: {
                            from: 'rec_id', defaultValue: false, validation: { required: true }, type: 'number', hidden: true,
                            title: "Record ID",
                        },
                        stopID: {
                            from: 'stopID', nullable: true, defaultValue: 0, type: 'number', hidden: true,
                            title: "Stop ID",
                        },
                        stat_Index: {
                            from: 'stat_Index', nullable: true, type: 'number', editable: false, hidden: true,
                            title: "Status Index"
                        },
                    }
                }
            }
        };

        o.appendzero = function (n) {
            return (n < 1) ? "00" : (n < 10 ? "0" + n : "" + n);
        }

        o.toUIString = function (t) {
            var a = "" + t.getFullYear();
            var b = o.appendzero(t.getMonth() + 1);
            var c = o.appendzero(t.getDate());
            var d = o.appendzero(t.getHours());
            var e = o.appendzero(t.getMinutes());
            var f = o.appendzero(t.getSeconds());
            return a + '/' + b + '/' + c + ' ' + d + ':' + e + ':' + f;
        }

        o.initTimeStart = function () {
            var t = new Date();
            t.setHours(0, 0, 0, 0);
            var a = o.toUIString(t).replace('/\//g', '-');
            //$log.log(a);
            return a;
        }

        o.initTimeEnd = function () {
            var t = new Date();
            t.setHours(23, 59, 59, 999);
            return o.toUIString(t).replace('/\//g', '-');
        }

        o.call_server = function (op, e, dI) {
            var API_setting_map = {
                route1: o.APIRoute, //o.APIRoute_OLD
                "c": { route2: "/create", method: "POST", obj: e.data },
                "r": { route2: "/read", method: "GET", obj: null },
                "r_post": { route2: "/read", method: "POST", obj: e.data },
                "u": { route2: "/update", method: "POST", obj: e.data },
                "d": { route2: "/destroy", method: "POST", obj: e.data }
            };

            var http_link = API_setting_map.route1 + API_setting_map[op].route2;
            var http_method = API_setting_map[op].method;
            var post_obj = API_setting_map[op].obj;

            server_access.init(o.kName, op, http_link, http_method, post_obj,
                function (data) {
                    //$log.log(data);
                    data.items = data.items.map(function (obj) {
                        //$log.log(obj);
                        var t = new Date(obj.createTime);
                        //t.setHours(t.getHours() - 8);
                        //obj.createTime = moment(t).format('YYYY/MM/DD H:mm:ss');//t.toLocaleString();
                        obj.createTime = o.toUIString(t);
                        obj.current_total = obj.tot_in_num - obj.tot_out_num;
                        obj.current_total = (obj.current_total >= 0) ? obj.current_total : 0;

                        //Degree to decimal stuff
                        var t_lat = obj.latitude;
                        var t_lon = obj.longitude;
                        var t_ola = 0;
                        var t_olo = 0;
                        //Decimal Degrees = Degrees + minutes/60 + seconds/3600
                        t_ola = Math.floor(t_lat / 100);
                        t_olo = Math.floor(t_lon / 100);
                        obj.latitude = t_ola + (t_lat - t_ola * 100) / 60;
                        obj.longitude = t_olo + (t_lon - t_olo * 100) / 60;

                        return obj;
                    });
                    e.success(data);
                    return;
                },
                e.error);
        }

        o.call_server_OLD = function (op, e, dI) {
            var API_setting_map = {
                route1: o.APIRoute,
                "r_post": { route2: "/read", method: "POST", obj: e.data },
            };

            var http_link = API_setting_map.route1 + API_setting_map[op].route2;
            var http_method = API_setting_map[op].method;
            var post_obj = API_setting_map[op].obj;

            server_access.init(o.kName, op, http_link, http_method, post_obj, e.success, e.error);
        }

        o.SchemaToTableCol_DEV = function (Schema) {
            var fields = Schema.model.fields;
            var arr = [];
            arr.push({ field: "admin_actions", command: ["edit", "destroy"], title: "Admin actions", width: "240px" });
            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    arr.push({
                        field: key,
                        title: fields[key].title,
                        hidden: fields[key].hidden,
                        width: fields[key].width ? fields[key].width : '120px',
                        filterable: fields[key].type == "date" ? { cell: { operator: "lte" } } : { cell: { oprtator: "contains" } },
                        format: fields[key].format ? fields[key].format : (fields[key].type == "date" ? "{0: yyyy-MM-dd HH:mm:ss}" : null),
                        attributes: { "class": "k-grid-td" },
                        template: fields[key].template ? fields[key].template : null,
                        groupable: fields[key].groupable ? fields[key].groupable : false,
                    });
                }
            }
            return arr;
        }

        o.SchemaToTableCol = function (Schema) {
            var fields = Schema.model.fields;
            var arr = [];
            //arr.push({ field: "admin_actions", command: ["edit", "destroy"], title: "Admin actions", width: "240px" });
            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    arr.push({
                        field: key,
                        title: fields[key].title,
                        hidden: fields[key].hidden,
                        width: fields[key].width ? fields[key].width : '', //'120px',
                        filterable: fields[key].type == "date" ? { cell: { operator: "lte" } } : { cell: { oprtator: "contains" } },
                        format: fields[key].format ? fields[key].format : (fields[key].type == "date" ? "{0: yyyy-MM-dd HH:mm:ss}" : null),
                        attributes: { "class": "k-grid-td" },
                        template: fields[key].template ? fields[key].template : null,
                        groupable: fields[key].groupable ? fields[key].groupable : false,
                    });
                }
            }
            return arr;
        }

        o.dataSource = function (dataItem) {
            return new kendo.data.DataSource({
                transport: {
                    // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    create: function (e) { o.call_server("c", e, dataItem); },
                    read: function (e) { o.call_server("r_post", e, dataItem); },
                    update: function (e) { o.call_server("u", e, dataItem); },
                    destroy: function (e) { o.call_server("d", e, dataItem); },
                    parameterMap: function (options, operation) {
                        if (operation !== "read") { return angular.toJson(options); }
                    }
                },

                filter: [{
                    //Filter out system admin
                //    field: "mac_Address",
                //    operator: "eq",
                //    value: o.DEFAULT_MAC
                //}, {
						field: "createTime",
                        operator: "gte",
                        value: o.initTimeStart()
                    }, {
                        field: "createTime",
                        operator: "lte",
                        value: o.initTimeEnd()
                    }],

                sort: [{ field: "createTime", dir: "desc" }],
                error: function (e) {
                    global.customKendoDataSourceErrorHandler(e);
                    this.cancelChanges();
                },
                pageSize: 15,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                schema: o.Schema
            });
        };

        o.dataSource_OLD = function (dataItem) {
            return new kendo.data.DataSource({
                transport: {
                    //Dodge then. Motivation lost.
                    read: function (e) { o.call_server("r_post", e, dataItem); },
                },
                sort: [{ field: "createTime", dir: "desc" }],
                error: function (e) {
                    global.customKendoDataSourceErrorHandler(e);
                    this.cancelChanges();
                },
                pageSize: 15,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                schema: o.Schema
            });
        };

        o.Options_DEV = function (dataItem) {
            return {
                dataSource: o.dataSource(dataItem),
                sortable: {
                    mode: "multiple",
                    allowUnsort: true
                },
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                height: "99%", //Better not dynamically - may oversize
                resizable: true,
                columnMenu: true,
                filterable: true,
                mobile: true,
                toolbar: ['create'],
                columns: o.SchemaToTableCol(o.Schema),
                editable: {
                    mode: "popup",
                    confirmation: true,
                    //Simple data structure but complex expected UI - use template instead
                    //template: kendo.template($(o.editTemplate).html()),
                    window: { title: "Accessing Bus Status..." }
                },

                cancel: function (e) {
                    //alert("cancel");
                    //Fired when you click "Cancel" in edit window
                    //Override to emliate bug "row disappear when cancel"
                    e.preventDefault();
                    e.container.data(global._kW).close();
                    e.sender.dataSource.read();
                    e.sender.refresh();
                    //console.log("o.cateMainGridOptions: On cancel");
                }
            };
        };

        o.Options = function (dataItem) {
            return {
                dataSource: new kendo.data.DataSource({ data: [] }),

                //dataSource: o.dataSource(dataItem),
                sortable: {
                    mode: "multiple",
                    allowUnsort: true
                },
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                toolbar: [{ template: kendo.template($(o.toolbarTemplate).html()) }],
                height: "99%", //Better not dynamically - may oversize
                resizable: true,
                //columnMenu: true,
                //filterable: true,
                mobile: true,
                //groupable: true,
                excel: {
                    allPages: true,
                    fileName: o.kName.replace('#', '') + ".xlsx",
                    filterable: false //true
                },
                columns: o.SchemaToTableCol(o.Schema),

                //Since the excelExport orgininally show displayed columns only,
                //There must be some modification befor export
                excelExport: function (e) {
                    //$log.log("CHECK");
                    if (!global.AssetGridExportFlag) {
                        //e.sender.hideColumn(0); //Admin Actions
                        e.preventDefault();
                        global.AssetGridExportFlag = true;
                        setTimeout(function () {
                            e.sender.saveAsExcel();
                        });
                    } else {
                        //e.sender.showColumn(0); //Admin Actions
                        global.AssetGridExportFlag = false;
                    }
                }
            };
        };

        o.reload_online_DEV = function () {
            if ($(o.kName) && $(o.kName).data(global._kG) && $(o.kName).data(global._kG).dataSource) {
                $(o.kName).data(global._kG).dataSource.read();
                $(o.kName).data(global._kG).refresh();
            }
        };

        o.reload_online = function () {
            if ($(o.kName) && $(o.kName).data(global._kG) && $(o.kName).data(global._kG).dataSource) {
                $(o.kName).data(global._kG).dataSource.read();
                $(o.kName).data(global._kG).refresh();
            }
        };

        o.convertDate = function (d) {
            var t = new Date(d.getTime() + 1000 * 60 * 60 * 0);
            return t.toISOString();
        }

        o.ExportToExcel = function () {
            if ($(o.kName) && $(o.kName).data(global._kG) && $(o.kName).data(global._kG).dataSource) {
                $(o.kName).data(global._kG).saveAsExcel();
            }
        }

        o.filterMAC = function (MAC_arr) {
            var arr = [];
            var start_end = [];
            var old_filter = {};
            var value = [];
            try {
                MAC_arr = MAC_arr ? MAC_arr : o.DEFAULT_MAC;
                if (MAC_arr.length === 0) {
                    arr = [];
                } else {
                    MAC_arr = MAC_arr.replace(new RegExp('-', 'g'), '').replace(new RegExp(':', 'g'), '').replace(new RegExp(' ', 'g'), '');
                    $log.log(MAC_arr);
                    arr = MAC_arr.split(',').map(function (obj) {
                        return obj.trim();
                    });
                }
                start_end = CustomFilter_BusStat.get_Start_End();
                //$log.log(arr);
                //$log.log(start_end);
                //old_filter = $(o.kName).data(global._kG).dataSource.filter();
                //$log.log(old_filter);
                value = [
                    o.convertDate(start_end[0]),
                    o.convertDate(start_end[1])
                ];
                old_filter = {
                    logic: "and",
                    filters: [
                        { field: "createTime", operator: 'gte', value: value[0] },
                        { field: "createTime", operator: 'lte', value: value[1] },
                    ]
                };
                if (arr.length > 0) {
                    old_filter.filters.push({
                        logic: "or",
                        filters: []
                    });
                    for (var i = 0; i < arr.length; i++) {
                        old_filter.filters[2].filters.push({
                            field: "mac_Address", operator: 'eq', value: arr[i]
                        });
                    };
                }
                $(o.kName).data(global._kG).dataSource.filter(old_filter);
                o.reload_online();
            } catch (e) {
                alert(e);
            };
        }

        o.onUserType = function (sUserType) {
            //$log.log(sUserType);
            //$log.log($(o.kName));
            //$log.log($(o.kName).data(global._kG));
            if (sUserType == "admin") {
                o.DEFAULT_MAC = "";
                var grid = $(o.kName).data(global._kG);
                
                grid.showColumn("mac_Address");
                grid.showColumn("last_in_number");
                grid.showColumn("last_out_number");
                grid.showColumn("tot_in_num");
                grid.showColumn("tot_out_num");
                grid.showColumn("tot_up_in");
                grid.showColumn("tot_up_out");
                

                grid.dataSource.filter({
                    filters: [
                        {
                            field: "createTime",
                            operator: "gte",
                            value: o.initTimeStart()
                        }, {
                            field: "createTime",
                            operator: "lte",
                            value: o.initTimeEnd()
                        }
                    ],
                    logic: "and"
                });

                console.log(grid.getOptions());
            }
        }

        //Return service object
        return o;
    }]);