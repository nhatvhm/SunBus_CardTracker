var app = angular.module('homeScript');

app.factory('KendoUpload_User', [
    '$http', '$log', '$window', '$q', '$timeout',
    'global', 'server_access', 'file_upload',
    function ($http, $log, $window, $q, $timeout, global, server_access, file_upload) {
        
        var o ={
            blob_temp: "",
            kName: "#KendoUpload_User",

            CheckExtension: function (name, extension) {
                var type;
                try {
                    var arr = name.toLowerCase().split('.');
                    type = arr[arr.length - 1];
                } catch (e) {
                    return false;
                }
                for (var i = 0; i < extension.length; i++) {
                    if (extension[i] == type) {
                        return true;
                    }
                }
                return false;
            },
            
            //e: kendo event
            //op: operation code (see HTML)
            importUploadModifyURL: function (e, dataItem, op) {
                var param;
                var base_upload;
                var base_remove;
                //$log.log(dataItem);
                switch (op) {
                    case 0:
                        param = '?md5=DEFAULT_QUERY_STRING' + '&deviceId=' + dataItem.deviceId;
                        base_upload = 'imageInfo/uploadImage';
                        base_remove = 'imageInfo/removeImage';
                        break;
                    case 100:
                        param = '';
                        base_upload = 'musicInfo/search_jason';
                        base_remove = 'imageInfo/removeImage';
                        break;
                    case 101:
                        param = $("#algo_emotion")[0].value ? '?id=' + $("#algo_id")[0].value + '&emotion=' + $("#algo_emotion")[0].value : '?id=' + $("#algo_id")[0].value;
                        base_upload = 'musicInfo/add_jason';
                        base_remove = 'imageInfo/removeImage';
                        break;
                    case 102:
                        param = "";
                        base_upload = 'doc_upload/saveDoc';
                        base_remove = 'doc_upload/removeDoc';
                        break;
                    default:
                        alert("AssetUploadDocs: Operation code undefined");
                        $log.log("AssetUploadDocs: Operation code undefined");
                }
                e.sender.options.async.saveUrl = base_upload + param;
                e.sender.options.async.removeUrl = base_remove;
                //$log.log(base_upload + param);
            }
        };
        
        o.Options = function (dataItem, op) {
            return {
                //This async link cannot be declared as a function - if the parameter goes dynamic, 
                //Modify
                async: {
                    saveUrl: 'api/', //Will be defined later
                    removeUrl: 'api/', //Will be defined later
                    autoUpload: false
                },
                select: function (e) {
                    //This is triggered when user selected the files to upload
                    //Useful for limiting files number/ extension and cancel changes
                    //$log.log(dataItem);
                    //$log.log(e.files);
                    if ((op == 100) || (op == 0)) {
                        for (var i = 0; i < e.files.length; i++) {
                            if (!o.CheckExtension(e.files[i].name, ['jpg', 'jpeg', 'png', 'bmp'])) {
                                alert("File extension is not supported");
                                e.preventDefault();
                            }
                        }
                    } else if (op == 101) {
                        for (var i = 0; i < e.files.length; i++) {
                            if (!o.CheckExtension(e.files[i].name, ['wav', 'mp3', 'aac'])) {
                                alert("File extension is not supported");
                                e.preventDefault();
                            }
                        }
                    } else if (op == 102) {
                        for (var i = 0; i < e.files.length; i++) {
                            if (!o.CheckExtension(e.files[i].name, ['csv', 'xls', 'xlsx'])) {
                                alert("File extension is not supported");
                                e.preventDefault();
                            }
                        }
                    }
                    if (e.files.length > 1) {
                        alert("Please select 1 file only.");
                        e.preventDefault();
                    }
                    
                    $log.log('[KendoUpload_ModelType] File size: ' + e.files[0].size);
                    
                    //Base 64 is 1.37x of oridinary binary
                    if (e.files[0].size > 5 * 1000 * 1000) { 
                        alert("File size is limited to 5MB.");
                        e.preventDefault();
                    }
                    
                    /**
                    //dataItem.photo = file_upload.read_file(e.files[0].rawFile);
                    file_upload.read_file(e.files[0].rawFile, function (err, str) {
                        $(".k-upload-selected").hide();
                        if (err) {
                            $log.log(err);
                        } else {
                            $log.log("[KendoUpload_ModelType] dataItem.photo");
                            //o.blob_temp = str;
                            dataItem.set('photo', str); //Not sure why "=" is not effective
                            //dataItem.set(dirty, true);
                            //$("#field_photo").val(str);
                        }
                        
                    });
                    **/
                    //$("#TESTTEST").val("Loaded. First 10 characters: " + dataItem.photo.substring(0,10));
                },
                
                upload: function (e) {
                    //This is triggered before calling the add url and the success event
                    //$log.log("o.AssetUploadDocsOptions: onUpload()");
                    //$log.log(op);
                    //Since dataItem.folder_name is set after initialization, urls are needed to be changed
                    //$log.log(e);
                    //alert("You should not reach this");
                    //e.preventDefault();
                    o.importUploadModifyURL(e, dataItem, op);
                },
                
                error: function (e) {
                    //$log.log("o.AssetUploadDocsOptions: onError()");
                    alert(e.XMLHttpRequest.responseText);
                    //$log.log(e);
                },
                
                remove: function (e) {
                    //This is trigerred when user press the x button to cancel adding uploaded files.
                    //Note that this is called before calling the remove url and the success event.
                    //$log.log("o.AssetUploadDocsOptions: onRemove()");
                    o.importUploadModifyURL(e, dataItem, op);
                },
                
                success: function (e) {
                    //$log.log("upload success");
                    //$log.log(e.sender.$angular_scope.dataItem);
                    //e.sender.$angular_scope.dataItem.photo_url == e.files[0].name;
                    o.post_upload(o.kName, e, dataItem, this, op);
                }
            }
        };
        
        //post-upload process such as auto-complete
        //kName: caller of this function (who call this?)
        //e: kendo event from the edit form. Uploaded files are usually in e.files 
        //dI: dataItem from the edit form.
        //inst: instance of the edit form. For potential use
        //op: operation or function name
        o.post_upload = function (kName, e, dI, inst, op) {
            //$log.log(inst);
            //Only visual stuffs (with data binding) is effective
            //Need to override Grid.save() event to make sure it calls $http
            
            //For visual elements, if http elements (e.g. input) is changed manually,
            //Grid.save() should be overrided to manually add the server access.
            //For data flow, change dI to make changes effective. dI is usually binded well in Kendo Grid.
            //Also, changing dI will not reflect changes visually. It could be tackled by Kendo's MVVM,
            //But unfourtunately, it's too difficult. 
            if (kName == o.kName) {
                switch (op) {
                    case 0:
                        alert(e.XMLHttpRequest.responseText); break;
                        //alert("Upload complete. Now the Database is updated. See the grids to see effect."); break;
                    case 100:
                        //alert(e.XMLHttpRequest.responseText);
                        o.algo_photo_result = e.XMLHttpRequest.responseText;
                        $log.log(o.algo_photo_result);
                        $rootScope.$digest();
                        break;
                    case 101:
                        //alert(e.XMLHttpRequest.responseText);
                        o.algo_music_result = e.XMLHttpRequest.responseText;
                        $log.log(o.algo_music_result);
                        $rootScope.$digest();
                        break;
                    case 102:
                        alert(e.XMLHttpRequest.responseText); break;
                        //alert("Upload complete. Now the Database is updated. See the grids to see effect."); break;
                    default:
                }
            } else {
                $log.log('o.post_upload: kName not supported: ' + kName);
                return; //Do nothing if not supported
            }
        };
        
        o.setActive = function (v) {
            if ($(o.kName) && $(o.kName).data(global._kU)) { 
                $(o.kName).data(global._kU).enable(v);
            }
        }

        //Return service object
        return o;
    }]);