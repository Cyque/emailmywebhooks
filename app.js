var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/');
// var session = require('express-session')

var app = express();



// SET PROCESS ENVIRONMENT VARS: (TO BE REMOVED AT LAUNCH)
process.env['api_key'] = '4bf79cc58eecd7f509f94ce7cd61c6b0';
process.env['shared_secret'] = '1604e972c082a4a3bb6384c1460f3458';
process.env['host'] = 'https://emailmywebhooks.herokuapp.com/';



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

//ROUTES:
//app.get('/auth/permission', routes.auth.permission);
//app.get('/auth/confirm', routes.auth.confirm);

app.get('/home', routes.pages.home);

app.get('/action/createhook', routes.actions.createWebhook);
app.post('/action/setdefaultemail', routes.actions.setDefaultEmail);
app.post('/handlewebhook', routes.hookhandle.handleWebhook);



//**Removed**configure the session manager
// app.use(session({
//   secret: process.env['shared_secret'],
//   resave: false,
//   saveUninitialized: true
// }));



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: err
    });
});


module.exports = app;