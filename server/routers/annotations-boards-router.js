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


var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()


router.use(jsonParser);



router.post('/', function(req, res) {

	var rp = req.body;

	if (rp.creator == undefined || rp.time == undefined || rp.track == undefined) {
		res.status(500).json({ error: 'Invalid parameters.'});
		return;
	}

	var creator = rp['creator']; // TODO: obter da sessão
	var title = rp['title'];
	var description = rp['description'];


	var properties = [
		{ prop: 'dc:creator', uri: creator }, 
		{ prop: 'dc:title', literal: title, type: 'xsd:string' }, 
		{ prop: 'dc:description', literal: description, type: 'xsd:string' }
	];

	misc.create_resource(E, misc.context, 'ianna', ['oann:AnnotationsBoard'], properties)
		.then((pair) => {
			var uuid = pair.uuid;
			var triples = pair.triples;
			misc.good_form(triples, ctx)
				.then((objld) => {
					// console.log(objld);
					res.status(200).json(objld);
				})
				.catch((error) => {
					console.error(error);
					res.status(500).json({});
					// TODO
				});
		}).catch((error) => {
			console.error(error);
			res.status(500).json({});
			// TODO
		});

});


router.get('/', function(req, res) {

});

router.get('/:id', function(req, res) {

	misc.get_resource(E, rp.id)
		.then((triples) => {
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({ error: 'database issue'}); });
		})
		.catch((error) => { res.status(500).json({ error: 'database issue'});});
});

router.delete('/:id', function(req, res) {
	misc.delete_resource(E, rp.id)
		.then((IRI) => { res.status(200); })
		.catch((error) => { res.status(500).json({ error: 'database issue'});});
});

router.put('/:id', function(req, res) {

})