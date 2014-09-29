var Video = require('../models/video');

module.exports.putVideo = function(req, res) {
	/** User can update his OWN videos */
};

module.exports.getVideo = function(req, res) {

};

module.exports.deleteVideo = function(req, res) {
	/** User can delete his own videos */
};

module.exports.getVideos = function(req, res) {

	Video.find(function(err, videos) {
		if(err) {
			return res.send(err);
		}

		return res.json(videos);
	});

};

module.exports.postVideos = function(req, res) {
	var video = new Video();
	console.log("postVideos called");
	video.title = req.body.title;
	video.description = req.body.description;

//	video.userId = req.user.userId;

	video.save(function(err) {
		if(err) {
			return res.send(err);
		}

		return res.json(video);
	});

};



