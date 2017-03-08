/**
 * External library
 */
var winston = require('winston');
var moment = require('moment');
/**
 * Internal library
 */
var server_config = require('./server_config');

var log_obj = {};

// Set up 1st stage of configurations
var exports = module.exports = {
    //Used in multiple scripts
    SERVER_LOGGING: function (path, option) {
        if (!option) { option = {}; }
        if (!option.level) { option.level = 'info'; }
        //Unified logging module.
        log_obj = new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: option.level,
                    filename: path,
                    handleExceptions: true,
                    timestamp: function () {
                        //Use moment module instead of winston
                        return moment().utc().local().format('MMMM Do YYYY, h:mm:ss a');
                    },
                    pid: process.pid,
                    json: true,
                    prettyPrint: true,
                    maxsize: server_config._iLOG_FILE_MAXSIZE, //4MB
                    maxFiles: server_config._iLOG_FILE_COUNT,
                    colorize: false
                }),
                new winston.transports.Console({
                    timestamp: function () {
                        //Use moment module instead of winston
                        return moment().utc().local().format('YYYY-MM-DD HH:mm:ss');
                    },
                    level: option.level,
                    handleExceptions: true,
                    json: false,
                    colorize: true
                })
            ],
            exitOnError: false
        });
        if (option.mute_console) { log_obj.remove(winston.transports.Console); }
        return log_obj;
    },
    log_obj: log_obj
};

//Set up 2nd stage of configurations. Most of them are based from above.