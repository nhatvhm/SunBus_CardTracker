var app = angular.module('homeScript');

app.factory('file_upload', [
    '$http', '$log', '$window', '$q', '$timeout',
    'global', 'server_access',
    function ($http, $log, $window, $q, $timeout, global, server_access) {

        var o = {
            read_file: function (path, callback) {
                $log.log("[file_upload] Start");
                var r = new FileReader();
                $log.log(path);
                r.readAsArrayBuffer(path);
                $log.log("[file_upload] readAsArrayBuffer");
                r.onload = function (file) {
                    $log.log("[file_upload] onload");
                    $log.log(file);
                    $log.log(r.result); //ArrayBuffer
                    var str = btoa([].reduce.call(
                        new Uint8Array(r.result), function (p, c) {
                            return p + String.fromCharCode(c);
                        }, '')
                    );
                    $log.log("[file_upload] Size: " + str.length);
                    $log.log("[file_upload] First 100 BinaryString of file: " + str.substring(0, 100));
                    //$("#TESTTEST").val(str);
                    return callback(null, str);
                }
                r.error = function (err) {
                    return callback(err, null);
                }
            },

            handleFileSelect: function (evt) {
                var files = evt.target.files; // FileList object

                // Loop through the FileList and render image files as thumbnails.
                for (var i = 0, f; f = files[i]; i++) {

                    // Only process image files.
                    if (!f.type.match('image.*')) {
                        continue;
                    }

                    var reader = new FileReader();

                    // Closure to capture the file information.
                    reader.onload = (function (theFile) {
                        return function (e) {
                            // Render thumbnail.
                            var span = document.createElement('span');
                            span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                '" title="', escape(theFile.name), '"/>'].join('');
                            document.getElementById('list').insertBefore(span, null);
                        };
                    })(f);

                    // Read in the image file as a data URL.
                    reader.readAsDataURL(f);
                }
            }
        }

        o.check_api = function () {
            // Check for the various File API support.
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                // Great success! All the File APIs are supported.
                $log.log("[file_upload] APIs are present.");
                //o.read_file("C:/node_workspace/KMB_console/KMB_console/tasks/asd.js");
            } else {
                alert('[file_upload] The File APIs are not fully supported in this browser.');
            }
        };

        //Return service object
        return o;
    }]);