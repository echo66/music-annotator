/*
 TODO: implement pagination for annotations counting and listings (1º perform a count. 2º perform a select for the annotations IRI. 3º perform a describe in all returned IRIs. )
 TODO: allow full text search on annotations.
 */

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
	var time = new Number(rp['time']);
	var duration = new Number(rp['duration'] || 0);
	var track = rp['track'];


	var properties = [
		{ prop: 'dc:creator', uri: creator }, 
		{ prop: 'dc:title', literal: title, type: 'xsd:string' }, 
		{ prop: 'dc:description', literal: description, type: 'xsd:string' }, 
		{ prop: 'oann:in_track', uri: track }, 
		{ prop: 'oann:time', literal: time, type: 'xsd:float' }, 
		{ prop: 'oann:duration', literal: time, type: 'xsd:float' }
	];

	misc.create_resource(E, misc.context, 'ianna', ['oann:Annotation'], properties)
		.then((pair) => {
			var uuid = pair.uuid;
			var triples = pair.triples;
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({}); });
		}).catch((error) => { res.status(500).json({}); });
});

router.get('/:id', function(req, res) {

	var rp = req.params;

	if (rp.id == undefined) {
		res.status(500).json({ error: 'Invalid parameters.'});
		return;
	}

	console.log(rp.id);

	misc.get_resource(E, rp.id)
		.then((triples) => {
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({ error: 'database issue'}); });
		})
		.catch((error) => { res.status(500).json({ error: 'database issue'}); });
});

router.put('/:id', function(req, res) {

	var rp = req.body;

	var title = rp['title'];
	var description = rp['description'];
	var time = new Number(rp['time']);
	var duration = new Number(rp['duration']);

	misc.update_resource(E, misc.context, req.params.id, [
			{ prop: 'dc:title', delete: true }, 
			{ prop: 'dc:title', literal: title }, 
			{ prop: 'dc:description', delete: true }, 
			{ prop: 'dc:description', literal: description }, 
			{ prop: 'oann:time', delete: true }, 
			{ prop: 'oann:time', literal: time, type: 'xsd:float' }, 
			{ prop: 'oann:duration', delete: true }, 
			{ prop: 'oann:duration', literal: duration, type: 'xsd:float' } 
		])
		.then((triples) => {
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({}); });
		}).catch((error) => { res.status(500).json({}); });
});


router.delete('/:id', function(req, res) {

	misc.delete_resource(E, req.params.id)
		.then((IRI) => { res.status(200).json({}); }) //TODO: substituir o JSON vazio por algo.
		.catch((error) => { res.status(500).json({ error: 'database issue'}); });
});











// TODO

router.get('/:id/relations', function(req, res) {
	// TODO
});

router.post('/:id/relations', function(req, res) {

	var from = req.body['from'];
	var to = req.body['to'];
	var type = req.body['type'];
	var creator = req.body['creator']; // TODO: usar o ID da sessão.


	misc.create_resource(E, misc.context, 'ianna', ['oann:AnnotationsRelation'], [
		{ prop: 'oann:from' , uri: from }, 
		{ prop: 'oann:to' , uri: to }, 
		{ prop: 'rdf:type' , uri: type }
	])
	.then((pair) => {
			var uuid = pair.uuid;
			var triples = pair.triples;
			misc.good_form(triples, ctx)
				.then((objld) => { res.status(200).json(objld); })
				.catch((error) => { res.status(500).json({ error: 'database issue'}); });
		})
		.catch((error) => { res.status(500).json({ error: 'database issue'}); });
});

router.delete('/annotations/:aid/relations/:rid', function(req, res) {
	// TODO
});


module.exports = router;