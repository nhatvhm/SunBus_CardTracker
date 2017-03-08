var fs = require('fs');
var mkdirp = require('mkdirp');
var formidable = require('formidable');

var server_logger = require('./server_logger');
var server_config = require('./server_config');

var logger = server_logger.SERVER_LOGGING(server_config.LOG_PATH + '/file_upload.log', { level: 'debug' }); //Set logger

var new_filepath = function (tmp_filepath) {
    var a = tmp_filepath.split('.');
    var b = a.length > 1 ? a[a.length - 1] : "dat";
    return server_config.DOC_UPLOAD_OPTIONS.uploadDir + '/' + server_config.DOC_UPLOAD_OPTIONS.fixed_filename + "." + b;
};

var handle_upload = function (req, callback) {
    //Make upload path if user forgot to make it.
    mkdirp(server_config.DOC_UPLOAD_OPTIONS.uploadDir, function (err) {
        if (err) { return callback(err); }
        else {
            //data: java.io.File
            logger.log('debug', 'start uploading');

            var tmp_filepath = "";
            var tmp_filename = "";

            var form = new formidable.IncomingForm();

            form.uploadDir = server_config.DOC_UPLOAD_OPTIONS.uploadDir;
            form.keepExtensions = server_config.DOC_UPLOAD_OPTIONS.keepExtensions;
            form.type = server_config.DOC_UPLOAD_OPTIONS.type;
            form.maxFieldsSize = server_config.DOC_UPLOAD_OPTIONS.maxFieldsSize;
            form.hash = server_config.DOC_UPLOAD_OPTIONS.hash;

            form.on('progress', function (bytesReceived, bytesExpected) {
                //logger.log('debug', [bytesReceived, bytesExpected]);
            });

            form.on('fileBegin', function (name, file) {
                //logger.log('debug', { name: name, file: file, event: 'fileBegin' });
                //file = { path, name, size, type }
            });

            form.on('file', function (name, file) {
                tmp_filepath = file.path;
                tmp_filename = file.name;
                //logger.log('debug', { name: name, file: file, event: 'file' });
                //file = { path, name, size, type, hash, lastModifiedDate }
            });

            form.on('error', function (err) {
                logger.log('error', err);
                request.resume();
            });

            form.parse(req, function (error, fields, files) {
                if (error) { return callback(eror); }
                else {
                    logger.log('debug', 'renaming to ' + new_filepath(tmp_filepath));
                    return fs.rename(tmp_filepath, new_filepath(tmp_filepath), callback);
                }
            });
        }
    });
};

var handle_remove = function (req, callback) {
    var FileName = "";

    logger.log('debug', JSON.stringify(req.body));
    try {
        FileName = req.body.fileNames;
        if (FileName.length == 0) { throw "NothingToDeleteException"; } //Or it will becomes EISDIR 
    } catch (e) {
        //UI will send a empty POST. Event handler is created explictly to send another POST again with info
        //Therefore instead of 400 to annoy people, use 200 to trigger proper visual effect
        //logger.log('debug', '{"Message":"POST body not valid or empty"}');
        return callback(null, { "Message": "POST body not valid or empty" });
    }

    logger.log('debug', 'deleting: ' + new_filepath(FileName));

    fs.exists(new_filepath(FileName), function (exists) {
        if (exists) {
            fs.unlink(new_filepath(FileName), function (err) {
                if (err) { return callback(err, null); }
                else { return callback(null, { "Message": "File deleted" }); }
            });
        } else { return callback(null, { "Message": "file not exist, nothing to delete" }); }
    });
}

var exports = module.exports = {
    handle_upload: handle_upload,
    handle_remove: handle_remove
}

