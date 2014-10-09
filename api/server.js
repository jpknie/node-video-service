// Require deps
var auth = require('./controllers/auth');
var multipart = require('connect-multiparty');
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

app.use(bodyParser({ defer: true }));
app.use(multipart({ uploadDir: '/tmp' }));
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
		return next();
	}
	else {
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

app.get('/api/movies', checkUser, movieController.getMovies);
app.get('/api/movies/:movie_id', checkUser, movieController.getMovie);
app.get('/api/movies/:movie_id/play', checkUser, movieController.playMovie);
app.get('/api/movies/:movie_id/subtitle', checkUser, movieController.getSubtitle);
app.post('/api/movies/:movie_id/file', checkUser, movieController.uploadMovie);
app.post('/api/movies/:movie_id/subtitle', checkUser, movieController.uploadSubtitle);
app.post('/api/movies', checkUser, movieController.postMovies);
app.put('/api/movies/:movie_id', checkUser, movieController.putMovie);
 
// listen on port
var server = app.listen(3000, function() {
  var addy = server.address();
  console.log('Server listening at: ', addy.address + ':' + addy.port);
});
