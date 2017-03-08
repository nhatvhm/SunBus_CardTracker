var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.redirect('/login');
});

router.get('/index', function (req, res) {
    res.render('index', { title: 'Express' });
});

/**
 * Login/ Logout 
**/
router.get('/login', function (req, res) {
    res.render('login.html', { user: req.user, failed: false });
});

router.get('/login_failed', function (req, res) {
    res.render('login.html', { user: req.user, failed: true });
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login_failed' }),
    function (req, res) {
        res.render('console.html', { user: req.user });
    });

router.post('/login_failed',
    passport.authenticate('local', { failureRedirect: '/login_failed' }),
    function (req, res) {
        res.render('console.html', { user: req.user });
    });

router.get('/isloggedin', function (req, res) {
    if (!req.user) { res.send("false"); }
    else { res.send("true"); }
});

router.get('/usertype', function (req, res) {
    if (!req.user) { res.send("null"); }
    else { res.send(req.user.usertype); }
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

/**
 * Don't know why I need this
**/
router.get("/%7B%7BdataItem.photo%7D%7D", function (req, res) {
    res.status(200).send('{}');
});


module.exports = router;