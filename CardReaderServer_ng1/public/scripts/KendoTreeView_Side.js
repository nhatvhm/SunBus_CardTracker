var app = angular.module('homeScript');

app.factory('KendoTreeView_Side', ['$http', '$log', '$window', '$q', '$timeout', 'global',
    function ($http, $log, $window, $q, $timeout, global) {
        var o = {
            kName: "#KendoTreeView_Side",
            ItemTemplate: "#ItemTemplate_KendoTreeView_Side",
            dataSource: function () {
                //Offline dataSource
                return [
                    { text: "User" },
                    { text: "BusStat" },
                    //{ text: "About" },
                    { text: "Logout" }
                ]
            },
            dataSource_mini: function () {
                //Offline dataSource
                return [
                    { text: "User" },
                    { text: "BusStat" },
                    //{ text: "About" },
                    { text: "Logout" }
                ]
            }
        };


        /**
        o.sidebar_treeData_online = function () {
            return new kendo.data.HierarchicalDataSource({
                transport: {
                    read: function (e) {
                        o.server_access(o.kName, "r", e, { mini: o.sUserType == "system_admin" ? false : true }, e.success, e.error);
                    }
                },
                schema: {
                    model: {
                        hasChildren: "items",
                        children: "items"
                    }
                }
            });
        };
        **/

        /**
        o.sidebar_treeData_mini_online = function () {
            return new kendo.data.HierarchicalDataSource({
                transport: {
                    read: function (e) {
                        o.server_access("sideTree", "r", e, { mini: true });
                    }
                },
                schema: {
                    model: {
                        hasChildren: "items",
                        children: "items"
                    }
                }
            });
        };
        **/


        //Special note: Select is replaced by k-on-change.
        o.Options = {
            //autoBind: false,
            autoScroll: true,
            dataSource: o.dataSource(), //o.sidebar_treeData_online(),
            dataTextField: "text",
            template: kendo.template($(o.ItemTemplate).html()), //o.ItemTemplate,
            error: function (e) {
                global.customKendoDataSourceErrorHandler(e);
                //this.cancelChanges();
            },
        }

        /**
        o.sideTreeOptions_mini = {
            //autoBind: false,
            autoScroll: true,
            dataSource: o.sidebar_treeData_mini_online(),
            dataTextField: "text",
            template: o.sidebar_treeItemTemplate,
            select: function (e) {
                o.sideTree_selectedText = this.text(e.node);
                //Show selected item (node -> text)
                console.log("o.sideTreeOptions: Selecting ", o.sideTree_selectedText);
                //May place some logic to do show/ hide control
                if (o.sideTree_selectedText == "Logout") {
                    o.fGotoLink_sameWin('/login');
                }
            },
            error: function (e) {
                o.customKendoDataSourceErrorHandler(e);
                //this.cancelChanges();
            },
        }
        **/

        o.reload_online = function () {
            if ($(o.kName) && $(o.kName).data(global._kTV) && $(o.kName).data(global._kTV).dataSource) {
                $(o.kName).data(global._kTV).dataSource.read();
            }
        }

        o.onUserType = function (sUserType) {
            //sUserType = { "system_admin", "admin", "user", null };
            //$log.log(sUserType);
            if (sUserType == "user") {
                if ($(o.kName) && $(o.kName).data(global._kTV) && $(o.kName).data(global._kTV).dataSource) {
                    $(o.kName).data(global._kTV).setDataSource(o.dataSource_mini());
                }
            }
            o.reload_online();
        }

        o.expand_item = function (newValue) {
            /**
            toggle = function (e) {
                var target = $(e.target);
                var toggleIcon = target.closest(".k-icon");
                if (!toggleIcon.length) {
                    this.tree.toggle(target.closest(".k-item"));
                }
            };
            **/

            var sideTree = $(o.kName).data(global._kTV);
            //console.log(newValue);
            if (sideTree) {
                //alert("OK")
                //console.log(sideTree.findByText(newValue));
                sideTree.expand(sideTree.findByText(newValue));
                //sideTree.expand(".k-item");
            } else {
                alert("OOPS");
                console.log(newValue);
            }
            return;
        }

        //Return service object
        return o;
    }]);