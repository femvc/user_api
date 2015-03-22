'use strict';
var account = require('./routes/account');
var Captchapng = require('captchapng');

/*
 * CORS Support in Node.js web app written with Express
 */

// http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});
// handle OPTIONS requests from the browser
app.options('*', function (req, res, next) {
    res.send(200);
});

//Test
app.get('/hello', function (req, res) {
    res.send('hello world');
});
app.get('/captcha.png', function (req, res) {
    var num = parseInt(Math.random() * 9000 + 1000);
    req.sessionStore.captcha = req.sessionStore.captcha || {};
    req.sessionStore.captcha[req.sessionID] = String(num);

    var p = new Captchapng(80, 30, num); // width,height,numeric captcha 
    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha) 
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha) 

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
});

// Account
app.all('/user_api/foo', account.foo);
app.all('/user_api/signup', account.signup);
app.all('/user_api/login', account.login);
app.all('/user_api/logout', account.logout);
app.all('/user_api/profile', account.auth, account.getDetail);