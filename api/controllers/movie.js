/*
* This file is part of simple personal video service called MyTube
* Authored by Jani Nieminen, 2013-2014
*/

var path = require('path');
var fs = require('fs-extra');
var Movie = require('../models/movie');
var User = require('../models/user');

module.exports.putMovie = function(req, res) {
	Movie.update({ _id: req.params.movie_id }, { $set: { title: req.body.title, description: req.body.description } }, {upsert: true}, function(err) {
		if(err) {
			return res.send(err);
		}
		res.json(200, '{ message: "Movie updated" }');
	});
};

module.exports.getMovie = function(req, res) {
	Movie.findOne({ _id: req.params.movie_id }, function(err, movie) {
		if(err) {
			return res.json(404, '{ message: "Movie not found!" }');
		}
		if(!movie) {
			return res.json(404, '{ message: "Movie not found!" }');
		}
		else {
			return res.json(movie);
		}
	});
};

module.exports.playMovie = function(req, res) {

};

module.exports.getSubtitle = function(req, res) {

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

module.exports.uploadSubtitle = function(req, res) {
	Movie.findOne({ _id: req.params.movie_id }, function(err, movie) {
		if(err) {
			return res.send(err);
		}
		if(!movie) {
			return res.json('{ message: "Cannot attach subtitle file to non-existing data" }');
		}

		if(movie.userId != req.user.id) {
			return res.json('{ message: "You are not owning this movie" }');
		}

		if(movie.hasOwnProperty("subtitle") && movie.subtitle !== undefined) {
			fs.exists('./media/' + movie.subtitle, function(exists) {
				if(exists) {
					fs.unlink('./media/' + movie.subtitle, function(err) {
						if(err)
							throw err;
					});
				}
			});
		}

		if(!req.files)
			 return	res.json('{ message: "Encountered an error on file upload" }');

		fs.rename(req.files.file.path, './media/' + req.files.file.name, function(err) {
			if(err)
				throw err;
		});

			movie.subtitle = req.files.file.name;
			movie.save(function(err) {
				if(err) {
					return res.json('{ message: "Error while saving data to database" }');
				}
			});
			res.end();
		});
}

module.exports.uploadMovie = function(req, res) {
	Movie.findOne({ _id: req.params.movie_id }, function(err, movie) {
		if(err) {
			return res.send(err);
		}

		if(!movie) {
			return res.json('{ message: "Cannot attach movie file to non-existing data" }');
		}

		if(movie.userId != req.user.id) {
			return res.json('{ message: "You are not owning this movie" }');
		}

		if(movie.hasOwnProperty("filename") && movie.filename !== undefined) {
			fs.exists('./media/' + movie.filename, function(exists) {
				if(exists) {
					fs.unlink('./media/' + movie.filename, function(err) {
						if(err)
							throw err;
					});
				}
			});
		}

		if(req.files == null)
			 return	res.json('{ message: "Encountered an error on file upload" }');

		fs.rename(req.files.file.path, './media/' + req.files.file.name, function(err) {
			if(err)
				throw err;
		});

/*
			var proc = new ffmpeg('./media/'+files.file.name)
				.takeScreenshots({
					count: 1,
					timemarks: ['10']
			}, './media', function(err) {
				if(err)
					throw err;
			});
*/
			movie.filename = req.files.file.name;
			movie.save(function(err) {
				if(err) {
					return res.json('{ message: "Error while saving data to database" }');
				}
			});
			res.end();
		});
}

module.exports.postMovies = function(req, res) {
	var movie = new Movie();
	movie.title = req.body.title;
	movie.description = req.body.description;

	movie.userId = req.user.id;

	movie.save(function(err) {
		if(err) {
			return res.send(err);
		}

		return res.json(movie);
	});

};



