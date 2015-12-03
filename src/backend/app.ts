
import express = require('express');
import fs = require('fs');
import http = require('http');
import path = require('path');
import mongoose = require('mongoose');
import passport = require("passport");
import flash = require("connect-flash");
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');
import ConnectMongo = require('connect-mongo');
import swig = require("swig");
import expressCompression = require('compression');
import cons = require('consolidate');
import config = require('./config/config');
import routes = require('./modules/routes');
import passportSetup = require('./modules/passport');


var env     = process.env.NODE_ENV || 'development';
var port    = process.env.PORT || 8089;
mongoose.connect(config.db);
var app = express();

var server = http.createServer(app);
var MongoStore = ConnectMongo(session);
passportSetup.init(passport,config);

var io = require('socket.io').listen(server);
//io.set('log level', 1);//reduce logging

app.set('views', __dirname + '/views');
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.use(expressCompression());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


// required for passport
app.use(session({
    secret: 'ilovewebdevelopmentandiamcrazyabouttechnology',
    resave: false,
    saveUninitialized: false,
    store : new MongoStore({mongooseConnection:mongoose.connection})
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));

routes.init(app,passport,config);

app.use(<ErrorRequestHandler>(err, req, res, next) => {
    res.status(err.status || 500);
    console.error(err, err.stack);
    res.render('500', {error: err});
});

app.use( (req, res, next) => {
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', {url: req.url});
        return;
    }
    if (req.accepts('json')) {
        res.send({error: 'Not found'});
        return;
    }
    res.type('txt').send('Not found');
});

process.on('uncaughtException', (err) => {
    // handle the error safely
    console.log(err);
    process.exit(1);
});

server.listen(port, () => {
    console.log("Express server listening on port " + port);
});

