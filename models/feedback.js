var Feedback = Backbone.Model.extend({
	urlRoot: '/feedback',
	defaults: {
		id: undefined,
		creator: undefined,
		date: undefined,
		comment: undefined, 
		target: undefined, 
		rate: undefined,
		range: undefined,
		type: undefined
	},
	set: function(attr, value, option) {

	}
});

var Feedbacks = Backbone.Collection.extend({
	model: Feedback, 
});