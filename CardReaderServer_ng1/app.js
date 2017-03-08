//User Auth
var passport        = require('passport');
var session         = require('express-session');
var FileStore       = require('session-file-store')(session);
//Express and middlewares
var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var ejs             = require('ejs');

//Minimum security (HTTPS headers)
var helmet          = require('helmet');

//Setting up routes
var routes          = require('./routes/index');
var users           = require('./routes/users');
var doc_upload      = require('./routes/doc_upload');

//Self defined libraties
var server_config   = require('./server_modules/server_config');    //Custom settings
var server_logger   = require('./server_modules/server_logger');
var user_auth       = require('./server_modules/user_auth');        //User Authentication

var app = express();

//Setting up logger
var logger = server_logger.SERVER_LOGGING(server_config.LOG_PATH + '/express_host.log', { level: 'debug' }); //using Winston instead of Morgan
logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

//Setting up view engine
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(morgan("combined", { "stream": logger.stream }));
app.use(bodyParser.json(server_config.UPLOAD_LIMIT.JSON));
app.use(bodyParser.raw(server_config.UPLOAD_LIMIT.RAW));
app.use(bodyParser.text(server_config.UPLOAD_LIMIT.TEXT));
app.use(bodyParser.urlencoded(server_config.UPLOAD_LIMIT.URLENCODED));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(helmet());

//Setting up login mechanics
app.use(session(user_auth.LOGIN_SESSION_LOCAL(FileStore)));
app.use(passport.initialize());
app.use(passport.session());

//Setting up routes
app.use('/', routes);
app.use('/users', users);
app.use('/doc_upload', new doc_upload.init(logger));

// Setting up Login Sessions
passport.serializeUser(user_auth.LOGIN_SERIALIZE);
passport.deserializeUser(user_auth.LOGIN_DESERIALIZE);
passport.use(user_auth.LOGIN_STRATEGY_LOCAL());
//passport.use(user_auth.LOGIN_STRATEGY_DB(db_connection.User));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//Redirect the log into the custom logging mechanism
app.log_init = function (msg) {
    logger.log('info', msg);
}

module.exports = app;