var Annotation = Backbone.Model.extend({
	urlRoot: '/annotations/annotation',
	defaults: {
		id: undefined,
		musicId: undefined,
		creator: undefined,
		title: undefined,
		description: undefined, 
		types: undefined,
		custom: undefined,
		time: undefined,
		duration: undefined,
	},
	initialize: function(attrs, options) {
		this.set('feedback', new Feedbacks);
	},
	parse: function(response, options) {
		console.log('Annotation parse');
	},
	add_feedback: function(creator, comment, rate) {
		this.get('feedback').create({
			target: this.get('id'),
			creator: creator, 
			comment: comment,
			rate: rate
		});
	}
});

var Annotations = Backbone.Collection.extend({
	model: Annotation
});