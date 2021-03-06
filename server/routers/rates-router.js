var rp = require('request-promise');
var router = require('express').Router();
var log4js = require('log4js');
var logger = log4js.getLogger();
log4js.replaceConsole();
var misc = require('./triple-store-fns/misc.js')();
var ctx = misc.clone_context();
	// ctx['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
	ctx['dc:creation_date'] = { "@type" : "xsd:dateTime" };
var E = 'http://localhost:9999/bigdata/namespace/kb/sparql';

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

router.use(jsonParser);




router.post('/', function(req, res) {

	// TODO: ONLY ONE RATING PER TUPPLE: TYPE-USER-TARGET

	console.log(req.body);

	if (req.body.target == undefined || req.body.creator == undefined || req.body.rating == undefined) {
		res.status(500).json({ error: 'Invalid parameters.'});
		return;
	}

	var target = req.body.target;
	var creator = req.body.creator; // TODO: obter da sessão
	var type = 'omisc:Rate';
	var rating = new Number(req.body.rating);
	

	misc.create_resource(E, misc.context, 'irate', [type], [
		{ prop: 'omisc:rate_for', uri: target }, 
		{ prop: 'dc:creator', uri: creator }, 
		{ prop: 'omisc:rating_value', literal: rating, type: 'xsd:float' }
	]).then((pair) => {
		var uuid = pair.uuid;
		var triples = pair.triples;
		misc.good_form(triples, ctx)
			.then((objld) => {
				console.log(objld);
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

/* Return the rates for a resource */
router.get('/', function(req, res) {
	var target = req.query.target;

	if (target == undefined) {
		res.status(500).json({ error: 'Invalid parameters.'});
		return;
	}

	misc.get_resources_from_association(E, misc.context, target, 'omisc:rate_for', true)
			.then((triples) => {
				misc.good_form(triples, ctx)
					.then((objld) => {
						res.status(200).json(objld);
					})
					.catch((error) => {
						console.error(error);
						res.status(500).json({});
						// TODO
					});
			})
			.catch((error) => {
				console.error(error);
				res.status(500).json({});
				// TODO
			});
});


module.exports = router;