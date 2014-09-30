// Require deps
var auth = require('./controllers/auth');
var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

var Movie = require('./models/movie');

var movieController = require('./controllers/movie');

var db = mongoose.connect("mongodb://localhost/movies");

var app = express();

app.use(bodyParser());

/** setup JWT with some secret key */
var jwtSuperSecretCode = 'super-secret-key';
var validateJwt = expressJwt({secret: jwtSuperSecretCode});
app.set('jwtSuperSecretCode', jwtSuperSecretCode);

app.use('/', function (req, res, next) {
  if (req.originalUrl === '/login') {
    next();
  } else {
    if(req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    validateJwt(req, res, next);
  }
});


// setup cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

auth.set(app);

// serve app from server
app.use(express.static(__dirname + '/client'));

var checkUser = function(req, res, next) {
	if(req.user) {
		console.log("checkUser user found..");
		return next();
	}
	else {
		console.log("checkUser user not found..");
		res.json(403, { message: 'Not authorized' });
	}
};

/* Route for getting authenticated user information */
app.get('/users/me', function(req, res) {
  if (req.user) {
    res.json(user);
  } else {
    res.json(403, { message: 'Not authorized' });
  }
});

app.get('/movies', checkUser, movieController.getMovies);
app.post('/movies', checkUser, movieController.postMovies);
 
// listen on port
var server = app.listen(3000, function() {
  var addy = server.address();
  console.log('Server listening at: ', addy.address + ':' + addy.port);
});
