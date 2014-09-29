var passport = require('passport');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports.set = function(app) {
	app.use(passport.initialize());

	app.post('/login', function(req, res, next) {
  	passport.authenticate('local', function(err, user, info) {
    	if (err) {
      	return next(err);
    	}
	    if (!user) {
  	    return res.json(404, 'No user found...');
    	}
	    req.logIn(user, function(err) {
  	    if (err) {
    	    return next(err);
      	}
				var jwtSuperSecretCode = app.get('jwtSuperSecretCode');
	      var token = jwt.sign({
  	      username: user.username,
					password: user.password
					//expires: use momentjs to calculate from this moment + 1 hour or something
	      }, jwtSuperSecretCode);
  	    return res.json(200, { token: token, user: user });
	    });
	  })(req, res, next);
	});

	app.get('/logout', function(req, res) {
  	req.logout();
	  res.json(200, { success: true });
	});

	// setup passport
	passport.use(new LocalStrategy(function(username, password, done) {
		console.log("Trying to find username: "+username+ " password: " + password);
		User.findOne({ username: username, password: password }, function(err, user) {
			if(err) {
				return done(null, false, { message: 'Incorrect username or password' });
			}
			return done(null, user);
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.username);
	});

	passport.deserializeUser(function(username, done) {
		User.findOne({ username: username }, function(err, user) {
				if(err) {
					return done('No user with username ' + username);
				}
				return done(null, user);
			});
	});
}

