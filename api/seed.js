/**
 * Seed.js - seeds the database. I.e. it creates a dummy user.
 */

var colors = require('colors')
var mongoose = require('mongoose');

/**
 * Import the model(s)
 */
var UserModel = require('./models/user')

/**
 * Connect to the database
 */
mongoose.connect('mongodb://localhost/videos');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Failed to connect to database!'.red))

db.once('open', function callback () {
	
	var user = new UserModel()
	user.username = 'jani'
	user.password = 'test1234'
	
	user.save(function(err){
		if (err) {
			console.log('Could not save user.'.red)
		} else {
			console.log('Database seeded'.green)
		}

		process.exit()
	})	

});


