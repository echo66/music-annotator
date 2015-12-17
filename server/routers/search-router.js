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


router.get('/', function(req, res) {
	
});