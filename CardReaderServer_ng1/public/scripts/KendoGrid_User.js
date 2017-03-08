var app = angular.module('homeScript');

app.factory('KendoGrid_User', [
    '$http', '$log', '$window', '$q', '$timeout',
    'global', 'server_access',
    function ($http, $log, $window, $q, $timeout, global, server_access) {
        var o = {
            kName: "#KendoGrid_User",
            editTemplate: "#editor_KendoGrid_User",
            APIRoute: "/User",
            toolbarTemplate: "#toolbar_KendoGrid_User",

            //This Schema is used by both Grid Column options and dataSource.
            //Key violation is undetected yet.
            Schema: {
                //data: "items", //See server API
                //total: "itemCount", //See server API
                model: {
                    id: "u_ID",
                    fields: {
                        u_ID: {
                            from: 'u_ID', nullable: true, editable: false,
                            title: "User ID"
                        },
                        site_ID: {
                            from: 'site_ID', defaultValue: global._ssite_ID, validation: { required: true },
                            title: "Site ID", hidden: true
                        },
                        userName: {
                            from: 'userName', defaultValue: "", validation: { required: true },
                            title: "User Name (Login)"
                        },
                        name: {
                            from: 'name', defaultValue: "", validation: { required: true },
                            title: "User Name (Info)"
                        },
                        email: {
                            from: 'email', defaultValue: "", validation: { required: true },
                            title: "Email",
                        },
                        password: {
                            from: 'password', nullable: true,
                            title: "Password", hidden: true
                        }
                    }
                }
            }
        };

        o.call_server = function (op, e, dI) {
            var API_setting_map = {
                route1: o.APIRoute,
                "c": { route2: "/create", method: "POST", obj: e.data },
                "r": { route2: "/read", method: "GET", obj: null },
                "r_post": { route2: "/read", method: "POST", obj: e.data },
                "u": { route2: "/update", method: "POST", obj: e.data },
                "d": { route2: "/destroy", method: "POST", obj: e.data }
            };

            var http_link = API_setting_map.route1 + API_setting_map[op].route2;
            var http_method = API_setting_map[op].method;
            var post_obj = API_setting_map[op].obj;

            server_access.init(o.kName, op, http_link, http_method, post_obj, e.success, e.error);
        }

        o.SchemaToTableCol = function (Schema) {
            var fields = Schema.model.fields;
            var arr = [];
            arr.push({ field: "admin_actions", command: ["edit", "destroy"], title: "Admin actions", width: "240px" });
            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    arr.push({
                        field: key,
                        title: fields[key].title,
                        hidden: fields[key].hidden,
                        width: fields[key].width ? fields[key].width : '180px', 
                        filterable: fields[key].type == "date" ? { cell: { operator: "lte" } } : { cell: { oprtator: "contains" } },
                        format: fields[key].type == "date" ? "{0: yyyy-MM-dd}" : null,
                        attributes: { "class": "k-grid-td" }
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
                    read: function (e) { o.call_server("r", e, dataItem); },
                    update: function (e) { o.call_server("u", e, dataItem); },
                    destroy: function (e) { o.call_server("d", e, dataItem); },
                    parameterMap: function (options, operation) {
                        if (operation !== "read") { return angular.toJson(options); }
                    }
                },
                error: function (e) {
                    global.customKendoDataSourceErrorHandler(e);
                    this.cancelChanges();
                },
                /**
                filter: [{
                    //Filter out system admin
                    field: "usertype",
                    operator: "neq",
                    value: "system_admin"
                }],
                sort: [{ field: "usertype", dir: "asc" }, { field: "username", dir: "asc" }],
                **/
                pageSize: 15,
                schema: o.Schema
            });
        };

        o.Options = function (dataItem) {
            return {
                dataSource: new kendo.data.DataSource({data:[]}),

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
                height: "99%", //Better not dynamically - may oversize
                resizable: true,
                columnMenu: true,
                filterable: true,
                mobile: true,
                toolbar: [{ template: kendo.template($(o.toolbarTemplate).html()) }],
                columns: o.SchemaToTableCol(o.Schema),
                editable: {
                    mode: "popup",
                    confirmation: true,
                    //Simple data structure but complex expected UI - use template instead
                    //template: kendo.template($(o.editTemplate).html()),
                    window: { title: "Accessing user information..." }
                },

                edit: function (e) {
                    /**
                    var window = e.container.data(global._kW);
                    $(".k-edit-form-container").width("640px");
                    $(".k-edit-form-container").height("auto");
                    if (global.sUserType != "admin") {
                        //User shouold not even see this grid
                        e.container.find("input[name=userName]").prop("disabled", true).addClass("k-state-disabled");
                        e.container.find("input[name=name]").prop("disabled", true).addClass("k-state-disabled");
                        e.container.find("input[name=email]").prop("disabled", true).addClass("k-state-disabled");
                        e.container.find("input[name=password]").prop("disabled", true).addClass("k-state-disabled");
                        e.container.find(".k-grid-update").hide();
                    };
                    **/
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

        o.ExportToExcel = function () {
            if ($(o.kName) && $(o.kName).data(global._kG) && $(o.kName).data(global._kG).dataSource) {
                $(o.kName).data(global._kG).saveAsExcel();
            }
        }


        o.reload_online = function () {
            if ($(o.kName) && $(o.kName).data(global._kG) && $(o.kName).data(global._kG).dataSource) {
                $(o.kName).data(global._kG).dataSource.read();
                $(o.kName).data(global._kG).refresh();
            }
        };

        //Return service object
        return o;
    }]);