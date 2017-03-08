/**
 *  Login session, logic, mechanism etc. goes here.
 *  Author: Lau Tsz Hei Darren
 **/

// Server config
var server_config = require('./server_config'); //Custom settings

// Login
var LocalStrategy = require('passport-local');
var session = require('express-session');

// Set up 1st stage of configurations
var exports = module.exports = {
    
    // Core logic of Login function
    FINDUSER_LOCAL: function (username, cb) {
        if (username == "user") {
            return cb(null, { username: "user", password: "1234", usertype: "user" });
        }
        //else if (username == "edmond_kwok") {
        //    return cb(null, { username: "edmond_kwok", password: "1234", usertype: "user" });
        //}
		else if (username == "kmb_user") {
            return cb(null, { username: "kmb_user", password: "1234", usertype: "user" });
        }
        else if (username == "admin") {
            return cb(null, { username: "admin", password: "1933", usertype: "admin" });
        }
        else {
            return cb(null, null);
        }
    },
    
    LOGIN_SESSION: {
        secret: server_config._sCOOKIE_SECRET, //This is not the same salt for the user schema
        cookie: { maxAge: server_config._iCOOKIE_AGE },
        resave: true,
        saveUninitialized: true
    }, 
    
    LOGIN_SERIALIZE: function (user, done) {
        //logger.log("debug", "serializing " + user.username);
        done(null, user);
    },
    
    LOGIN_DESERIALIZE: function (obj, done) {
        //logger.log("debug", "deserializing " + obj.username);
        done(null, obj);
    },

};

// Set up 2nd stage of configurations. Some of them are based from above.

exports.LOGIN_STRATEGY_LOCAL = function () {
    return new LocalStrategy(
        function (username, password, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                exports.FINDUSER_LOCAL(username, function (err, user) {
                    //logger.log("debug", user);
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
                    if (user.password != password) { return done(null, false, { message: 'Incorrect password.' }); }
                    return done(null, user);
                });
            });
        }
    );
}

exports.LOGIN_SESSION_LOCAL = function (FileStore) {
    return {
        secret: exports.LOGIN_SESSION.secret,
        cookie: exports.LOGIN_SESSION.cookie, //1 hour
        resave: exports.LOGIN_SESSION.resave,
        saveUninitialized: exports.LOGIN_SESSION.saveUninitialized,
        store: new FileStore({
            path:   server_config.LOCAL_COOKIE_PATH,
            logFn:  server_config.LOG_PATH + '/login_sessions.log',
            ttl:    server_config._iCOOKIE_AGE,
            secret: exports.LOGIN_SESSION.secret
        })
    }
};