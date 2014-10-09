var mongoose = require('mongoose');


var MovieSchema = mongoose.Schema({

	userId: { type: String, required: false },
	title: { type: String, required: true },
	description: { type: String, required: false },
	filename: { type: String, required: false },
	thumbnail: { type: String, required: false },
	subtitle: { type: String, required: false }

});

MovieSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Movie', MovieSchema);
