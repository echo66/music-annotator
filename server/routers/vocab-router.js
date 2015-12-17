var rp = require('request-promise');
var router = require('express').Router();
var log4js = require('log4js');
var logger = log4js.getLogger();
log4js.replaceConsole();
var misc = require('./triple-store-fns/misc.js')();
var ctx = misc.clone_context();
	// ctx['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
	ctx['dc:creation_date'] = { "@type" : "xsd:dateTime" };
	// ctx['dc:creator'] = { "@type" : "uri" };
var E = 'http://localhost:9999/bigdata/namespace/kb/sparql';


function create_concept(req, res, masterType) {
	var title = req.body.body['title'];
	var description = req.body['description'];
	var creator = req.body['creator']; // TODO
	var parent = req.body['parent'] || masterType;

	var properties = [
		{ prop: 'dc:creator', uri: creator }, 
		{ prop: 'dc:title', literal: title, type: 'xsd:string' }, 
		{ prop: 'dc:description', literal: description, type: 'xsd:string' }, 
		{ prop: 'rdfs:subClassOf', uri: parent }
	];

	misc.create_resource(E, misc.context, 'oann', ['owl:Class'], properties)
		.then((pair) => {
			var uuid = pair.uuid;
			var triples = pair.triples;
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({}); });
		}).catch((error) => { res.status(500).json({}); });
}


router.post('/vocab/annotations/concepts', function(req, res) {
	create_concept(req, res, masterType(req, res, 'oann:Annotation');
});


router.post('/vocab/annotations-tracks/concepts', function(req, res) {
	create_concept(req, res, masterType(req, res, 'oann:AnnotationsTrack');
});


router.post('/vocab/annotations-boards/concepts', function(req, res) {
	create_concept(req, res, masterType(req, res, 'oann:AnnotationsBoard');
});





/* Performs a full text search for the properties dc:title and dc:description. */
router.get('/vocab/annotations/concepts', function(req, res) {
	// TODO
});

router.get('/vocab/annotations-tracks/concepts', function(req, res) {
	// TODO
});

router.get('/vocab/annotations-boards/concepts', function(req, res) {
	// TODO
});







// Return the JSON-LD for one ...what? property? concept?
router.get('/vocab/:id', function(req, res) {

});


module.exports = router;