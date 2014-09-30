var Movie = require('../models/movie');

module.exports.putMovie = function(req, res) {
	/** User can update his OWN movies */
};

module.exports.getMovie = function(req, res) {

};

module.exports.deleteMovie = function(req, res) {
	/** User can delete his own movies */
};

module.exports.getMovies = function(req, res) {

	Movie.find(function(err, movies) {
		if(err) {
			return res.send(err);
		}

		return res.json(movies);
	});

};

module.exports.postMovies = function(req, res) {
	var movie = new Movie();
	console.log("postMovies called");
	movie.title = req.body.title;
	movie.description = req.body.description;

//	movie.userId = req.user.userId;

	movie.save(function(err) {
		if(err) {
			return res.send(err);
		}

		return res.json(movie);
	});

};



