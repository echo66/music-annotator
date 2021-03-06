var AnnotationsBoard = Backbone.Model.extend({
	urlRoot: 'http://localhost:90/api/boards',
	defaults: {
		id: undefined,
		musicId: undefined,
		creator: undefined,
		title: undefined,
		description: undefined,
		feedback: undefined,
		tracks: undefined,
		allowedAnnotationsTrackTypes: undefined,
	},
	get: function (attr) {
		switch (attr) {
			case 'allowedAnnotationsTrackTypes':
				// TODO: vai ao servidor buscar os tipos de track de anotação permitidos para esta board.
				break;
			default:
				return Backbone.Model.prototype.get.call(this, attr);
		}
	},
	parse: function(response) {
		response.id = response._id;
		delete response._id;

		return response;
	},
	initialize: function(attrs, options) {
		this.set('annotations-tracks', new AnnotationsTracks);
		this.set('feedback', new Feedbacks);
	},
	add_feedback: function(comment, rate) {
		this.get('feedback').create({
			target: this.get('id'),
			creator: this.get('creator'), 
			comment: comment,
			rate: rate
		});
	},
	add_track: function(title, description) {
		this.get('tracks').create({
			boardId: this.get('id'),
			title: title, 
			description: description
		});
	},
	add_annotation: function(annTrackId, annObj) {
		this.get('tracks').get(annTrackId).create({
			trackId: annTrackId, 
			title: annObj.title, 
			description: annObj.description,
			time: annObj.time,
			duration: annObj.duration
		});
	}
});

var AnnotationsBoards = Backbone.Collection.extend({
	model: AnnotationsBoard, 
	urlRoot: 'http://localhost:90/api/boards'
});