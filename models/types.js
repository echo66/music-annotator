var AnnotationType = Backbone.Model.extend({
	urlRoot: '/annotations/annotation-type',
	defaults: {
		id: undefined,
		creator: undefined,
		title: undefined,
		description: undefined, 
		superTypes: undefined, 
		allowElements: undefined,
	}
});

var AnnotationsTracksType = Backbone.Model.extend({
	urlRoot: '/annotations/annotations-tracks-type',
	defaults: {
		id: undefined,
		creator: undefined,
		title: undefined,
		description: undefined, 
		superTypes: undefined,
		allowAnnotationTypes: undefined,
	}
});

