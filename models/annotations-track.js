var AnnotationsTrack = Backbone.Model.extend({
	urlRoot: '/annotations/annotations-track',
	defaults: {
		id: undefined,
		creator: undefined,
		boardId: undefined,
		title: undefined,
		description: undefined, 
		types: undefined
	},
	get: function (attr) {
		switch (attr) {
			case 'allowedAnnotationTypes':
				// TODO: vai ao servidor buscar os tipos de anotação permitidos para esta track.
				break;
			default:
      			return Backbone.Model.prototype.get.call(this, attr);
		}
	},
	initialize: function(attrs, options) {
		this.set('annotations', new Annotations);
		this.set('feedback', new Feedbacks);
	},
	parse: function(response, options) {

	},
	add_feedback: function(comment, rate) {
		this.get('feedback').create({
			target: this.get('id'),
			creator: this.get('creator'), 
			comment: comment,
			rate: rate
		});
	},
});

var AnnotationsTracks = Backbone.Collection.extend({
	model: AnnotationsTrack, 
});