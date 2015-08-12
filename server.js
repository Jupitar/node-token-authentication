// =================================================================
// get the packages we need ============================================
// =================================================================
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');
app.set('view engine', 'ejs'); // set up ejs for templating
var morgan = require('morgan');
var mongoose = require('mongoose');
var socketio_jwt = require('socketio-jwt');
var jwt = require('jsonwebtoken');

var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =================================================================
// configuration =======================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database

app.use(express.static(__dirname + '/public'));

app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// pull in the routes
require('./app/routes.js')(express, app, io, socketio_jwt, config, jwt);

// =================================================================
// start the server =====================================================
// =================================================================
server.listen(port);
console.log('Magic happens at http://localhost:' + port);
