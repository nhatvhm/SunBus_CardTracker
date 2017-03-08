//Please put all constants/ options here

// Set up 1st stage of configurations
var test_external;

try {
    test_external = require("/mnt/kmb_counter/server_config.js");
} catch (e) {
    test_external = false;
}

var exports = module.exports = test_external ? test_external : {
    //Try to use full path
    LOG_PATH: "D:/node_workspace/SunBus_CardTracker/CardReaderServer_ng1/data/logs",
    DB_PATH: "D:/node_workspace/SunBus_CardTracker/CardReaderServer_ng1/data/db",
    LOCAL_COOKIE_PATH: "D:/node_workspace/SunBus_CardTracker/CardReaderServer_ng1/data/login_sessions",
    //DB_PATH: "/root/kmb_counter/db",
    //LOG_PATH: "/root/kmb_counter/logs",

    //Target module: formidable
    DOC_UPLOAD_OPTIONS: {
        uploadDir: "D:/node_workspace/SunBus_CardTracker/CardReaderServer_ng1/data/uploads",
        keepExtensions: true,
        type: 'urlencoded',
        maxFieldsSize: 50 * 1024 * 1024, //50MB
        hash: 'sha1',
        fixed_filename: 'upload' //Note: without extension
    },

    UPLOAD_LIMIT: {
        //Setting for middleware bodyparser
        JSON: { limit: '2mb' },
        RAW: { limit: '2mb' },
        TEXT: { limit: '2mb' },
        URLENCODED: { limit: '2mb', extended: true }
    },

    _sCOOKIE_SECRET: 'powered by etag', //Encryption salt for cookies used in host server
    _iCOOKIE_AGE: parseInt('3600000'), //Valid time period for Cookie
    _iHOST_PORT: parseInt('3000'), //Port number for Express host server

    //Used in server_logger
    _iLOG_FILE_MAXSIZE: parseInt('8000000'), //Logfile maximum size
    _iLOG_FILE_COUNT: parseInt('2'), //Logfile maximum count

    WS_PORT: 9012, //Web socket port
    WS_PROTOCOL: 'etag-apc-protocol',
    APC_HOST: '192.168.1.254',    // The remote host
    APC_PORT: 9011,              // The same port as used by the server

    TCP_HOST: "192.168.1.151",   // Used by error report module for getting saved APC MAC
    TCP_PORT: 8011,              // The port receving messages from APC

    EXT_HOST: "http://dev.etag-hk.com/kmb",
    //EXT_HOST: "http://localhost:1934",
    msg_ext_mqtt_link: "mqtt://etaghk.asuscomm.com:1883",
    msg_ext_mqtt_options: {
        keepalive: 10, // In seconds, set to 0 to disable
        connectTimeout: 30 * 1000, // Time to wait before a CONNACK is received 
    },
    msg_ext_HTTP_REQUEST_TIMEOUT: 60000, //Timeout of waiting response body while HTTP request 
    msg_ext_CHKDELAY: 10000,     // Time interval to check msgQueue for external server

    mic_serial_port: 'COM5', //'/dev/ttyO4', // Serial port of the mic

    TCP_KEEPALIVE_INTERVAL: 10000, //nodeJS.net
    TCP_KEEPALIVE_TIMEOUT: 60000, //nodeJS.net

    DEAD_CONN_TIMEOUT: 12000, //self made
    APC_POLL_COUNTER: 2000, //self made
    APC_INIT_DELAY: 100, 

    WS_POLL_PERIOD: 2000,

    siteId: "KMB", //MQTT + DB_CONTROL
    projectId: "kmb_counter", //MQTT only

    //weather_lib
    GET_INTERVAL_AMOUNT: 1000 * 60 * 15, // 15 minutes
    GET_HTTP_LINK: "http://api.apixu.com/v1/current.json?key=9e11d65b295c4398831102811160812&q=HK",

    //TEST_FS_FILE: "D:/node_workspace/KMB_MiniCounter/KMB_MiniCounter/test_fs.txt",
    TEST_FS_FILE: "/root/kmb_counter/test_fs.txt",
    TEST_FS_INTERVAL: 60 * 1000, //1 minute
    ERROR_QUEUE_SIZE: 5,

    //Options for rendering webpages
    webpage_render_options: {
        SD_CARD_DOWN: false,
        //WS_CLIENT_LINK: 'http://192.168.1.50:9012',
        WS_CLIENT_LINK: 'http://localhost:9012',
        UPPER_LIMIT: 59,
        RELOAD_TIME_AMOUNT: 60 * 60 * 1000,
        WEATHER_TIME_AMOUNT: 15 * 60 * 1000,
        SHOW_WEATHER_TAB: false,
        title: 'Express'
    },

    //Options when webpages connected to web socket. Use when unable to refresh the webpage.
    DEMO_LOCK: true,
    UI_PAGE_URL: "/",
};