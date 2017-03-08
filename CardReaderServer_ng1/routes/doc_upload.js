var express = require('express');

var file_upload = require('../server_modules/file_upload');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { res.cookie('username', req.user.username); return next(); }
    res.redirect('login');
}

module.exports = {
    init: function (l) {
        var logger = l;
        var router = express.Router();

        router.get('/saveDoc', function (req, res) {
            res.status(200).send("Please use POST request");
        });

        router.post('/saveDoc', function (req, res) {
            file_upload.handle_upload(req, function (err) {
                res.status(err ? 500 : 200).send(err ? err : { "Message": "File uploaded." });
            });
        });

        router.get('/removeDoc', function (req, res) {
            res.status(200).send("Please use POST request");
        });

        router.post('/removeDoc', function (req, res) {
            file_upload.handle_remove(req, function (err, msg) {
                res.status(err ? 500 : 200).send(err ? err : msg);
            });
        });

        return router;
    }
};