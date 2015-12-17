module.exports = function(endpoint) {

	var _endpoint = endpoint;
	var rp = require('request-promise');
	var jsonld = require('jsonld');
	var misc = require('./misc.js')();
	var uuidGen = require('./uuid.js')(_endpoint);
	var SparqlClient = require('sparql-client');
	var client = new SparqlClient(_endpoint);
	var that = this;

	// params: {title, description, allowedClasses (para restringir as anotações ou tracks permitidas)}
	var _create_annotation_class = function(superClass, params) {
		'oann:Annotation'
		'oann:AnnotationsTrack'
		'oann:AnnotationsBoard' //TODO
	}


}