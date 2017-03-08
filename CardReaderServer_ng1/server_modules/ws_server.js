var server = {}; // HTTP server
var wsServer = {}; // WebSocket

var http = require('http');
var io = require('socket.io');

var server_logger = require('./server_logger');
var server_config = require('./server_config');
var db_control = require('./db_control');

var logger = server_logger.SERVER_LOGGING(server_config.LOG_PATH + '/ws_server.log', { level: 'info' }); //Set logger

var POLL_PERIOD = server_config.WS_POLL_PERIOD;

var err_report_buf = [];

var init = function () {
    server = http.createServer(function (request, response) {
        logger.log('info', "WEB Socket: Received request for " + request.url);
        response.writeHead(404);
        response.end();
    });

    server.listen(server_config.WS_PORT, function () {
        logger.log('info', "WEB Socket: Server is listening on port " + server_config.WS_PORT);
    });

    wsServer = io.listen(server);

    wsServer.on('connection', function (client) {
        logger.log('info', "WEB Socket: Connection accepted. (" + client.id + " - " + client.request.connection.remoteAddress + ":" + client.request.connection.remotePort + ")");

        send_data(client);

        // Success! Now listen to messages to be received
        client.on('event', function (event) {
            logger.log('info', JSON.stringify(event));
            try {
                if (event.err_report) {
                    err_report_buf = err_report_buf.concat(event.err_report);

                    //This is an error report. See error_handle.js
                    wsServer.emit('event', JSON.stringify(event));
                } else if (event.mic_serial_in) {
                    //logger.log('info', "yo");
                    wsServer.emit('event', JSON.stringify(event));
                } else if (event.mic_serial_out) {
                    wsServer.emit('event', JSON.stringify(event));
                }
            } catch (e) {
                //Ignored.
            }
        });

        client.on('disconnect', function () {
            logger.log('info', "WEB Socket: Connection disconnected. (" + client.id + " - " + client.address + ")");
        });
    });

    process.on("SIGUSR2", function () {
        logger.log('info', "WEB Socket: Received SIGUSR2 from TCP_SOCKET. Reading DB...");
        send_data(wsServer);
    });

    var send_data = function (c) {
        var out_obj = {};
        out_obj.DEMO_LOCK = server_config.DEMO_LOCK;
        out_obj.UI_PAGE_URL = server_config.UI_PAGE_URL;

        if (err_report_buf && err_report_buf.length > 0) {
            out_obj.err_report = err_report_buf;
            logger.log('info', "Error in buffer: " + err_report_buf);
        }

        if (!server_config.DEMO_LOCK) {
            logger.log('info', "WEB Socket: Reading DB for new client...");
            db_control.get_counter_arr(function (err, obj) {
                if (err) { logger.log('error', err); }
                else {
                    logger.log('debug', JSON.stringify(obj));
                    logger.log('debug', "WEB Socket: Boardcasting to WEB socket clients...");

                    out_obj.counter_arr = obj;
                    c.emit('event', JSON.stringify(out_obj));
                }
            });
        } else {
            c.emit('event', JSON.stringify(out_obj));
        }
    }
}

module.exports = {
    init: init
};

init();