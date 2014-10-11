/*
* This file is part of simple personal video service called MyTube
* Authored by Jani Nieminen, 2013-2014
*/

var ffmpeg = require('fluent-ffmpeg');
var mime = require('mime');
var path = require('path');
var fs = require('fs-extra');
var Movie = require('../models/movie');
var User = require('../models/user');
var path = require('path');
var appDir = path.dirname(require.main.filename);

var acceptedMovieTypes = [
    "video/avi",
    "video/mpeg",				//: MPEG-1 video with multiplexed audio; Defined in RFC 2045 and RFC 2046
    "video/mp4",				//: MP4 video; Defined in RFC 4337
    "video/ogg",				//: Ogg Theora or other video (with audio); Defined in RFC 5334
    "video/quicktime",	//: QuickTime video; Registered[17]
    "video/webm",				//: WebM Matroska-based open media format
    "video/x-matroska",	//: Matroska open media format
    "video/x-ms-wmv",		//: Windows Media Video; Documented in Microsoft KB 288102
    "video/x-flv",			//: Flash video (FLV files)
		"video/x-msvideo"
];

var acceptedSubTypes = [
	"text/plain",
	"text/vnd.dvb.subtitle",
	"application/x-subrip"
];

function createDirectoryIfNotExists(directory) {
		fs.exists(directory, function(exists) {
			if(!exists)
				fs.mkdirSync(directory, 0777);
		});
}

function removeIfExists(filepath) {
	fs.exists(filepath, function(exists) {
		if(exists) {
			fs.unlink(filepath, function(err) {
				if(err)
					throw err;
			});
		}
	});
}

function getMediaDirectoryForId(id) {
	return path.join(appDir, 'media/' + id);
//	return appDir + '/media/' + id;
}

/** Exports */
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

module.exports.thumbnail = function(req, res) {
	Movie.findOne({ _id: req.params.movie_id }, function(err, movie) {
		if(err) {
			return res.status(404).json('{ message: "Movie not found!" }');
		}
		if(movie.thumbnail != null) {
			return res.status(200).sendFile(path.join(getMediaDirectoryForId(movie.id), movie.thumbnail));
		}
		else {
			return res.status(404).json('{ message: "No thumbnail" }');
		}
	});
};

module.exports.uploadFile = function(req, res) {
	if(!req.files)
		 return	res.json('{ message: "Encountered an error on file upload" }');

	Movie.findOne({ _id: req.params.movie_id }, function(err, movie) {
		if(err) {
			return res.send(err);
		}
		if(!movie) {
			return res.json('{ message: "Cannot attach file to non-existing data" }');
		}

		if(movie.userId != req.user.id) {
			return res.json('{ message: "You are not owning this movie" }');
		}

		var movieDir = getMediaDirectoryForId(movie._id) + '/';
		var fileExtension = req.files.file.name.split(".")[1];
		var actualMovieFilepath = path.join(movieDir, req.files.file.name);

		console.log("File mime type is " + mime.lookup(req.files.file.path));

		/* Check if sending movie */
		if(acceptedMovieTypes.indexOf(mime.lookup(req.files.file.path)) > -1) {
			if(movie.hasOwnProperty("filename") && movie.filename !== undefined) {
				removeIfExists(path.join(movieDir, movie.filename));
				if(movie.hasOwnProperty("thumbnail") && movie.thumbnail !== undefined) {
					removeIfExists(path.join(movieDir, movie.thumbnail));
				}
			}
			/* Create thumbnail */
			var proc = new ffmpeg(actualMovieFilepath)
			.takeScreenshots({count: 1, timemarks: ['10']}, movieDir, function(err) {
				if(err)
					throw err;
			});
			movie.thumbnail = 'tn_1.png';
			movie.filename = req.files.file.name;
		}

		/** Check if sending subtitle */
		else if(acceptedSubTypes.indexOf(mime.lookup(req.files.file.path)) > -1) {
			if(movie.hasOwnProperty("subtitle") && movie.subtitle !== undefined) {
				removeIfExists(path.join(movieDir, movie.subtitle));
			}
			movie.subtitle = req.files.file.name;
		}

		else {
			/** Remove file from temp */
			fs.unlink(req.files.file.path);
			return res.json(400, '{ message: "Unknown file type" }');
		}

		fs.rename(req.files.file.path, actualMovieFilepath, function(err) {
			if(err) {
				console.log(err);
				throw err;
			}
		});

		movie.save(function(err) {
			if(err) {
				return res.json('{ message: "Error while saving data to database" }');
			}
		});
		res.json(200, movie);
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

		var movieDir = getMediaDirectoryForId(movie._id)
		createDirectoryIfNotExists(movieDir);
		return res.json(movie);
	});

};



