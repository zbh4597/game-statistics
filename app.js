var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');
var DB_CONN_STR = config.url;

var charge = require('./routes/charge');
var users = require('./routes/users');
var users = require('./routes/common');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static('public'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//db中间件
app.use(function(req, res, next) {
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        if (err) next(err);
        console.log('连接成功！');
        req.db = db;
        next();
    });
});

app.use('/charge', charge);
app.use('/users', users);
app.use('/common', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.error(err);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;