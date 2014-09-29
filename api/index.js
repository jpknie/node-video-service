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

var Video = require('./models/video');

var videoController = require('./controllers/video');

var db = mongoose.connect("mongodb://localhost/videos");

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
app.use(express.static(__dirname + '/frontend'));

app.get('/users/me', function(req, res) {
  if (req.user) {
    res.json(user);
  } else {
    res.json(403, { message: 'Not authorized' });
  }
});

var funnyPicIndex = Math.floor(Math.random()*12);
function getNextFunnyPic() {
  funnyPicIndex++;
  if (funnyPicIndex > 12) {
    funnyPicIndex = 0;
  }
  return __dirname + '/funny-pics/' + funnyPicIndex + '.jpg';
}

app.get('/funny-pic', function(req, res) {
  if (req.user) {
    res.sendfile(getNextFunnyPic());
  } else {
    res.json(403, { message: 'Not authorized' });
  }
});

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

app.get('/videos', checkUser, videoController.getVideos);
app.post('/videos', checkUser, videoController.postVideos);
 
// listen on port
var server = app.listen(3000, function() {
  var addy = server.address();
  console.log('Server listening at: ', addy.address + ':' + addy.port);
});
