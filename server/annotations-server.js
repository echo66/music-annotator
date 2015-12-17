var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var cors = require('cors');
var jsonld = require('jsonld');
var N3 = require('n3');
var parser = N3.Parser();
var log4js = require('log4js');
var logger = log4js.getLogger();
log4js.replaceConsole()
var app = express();
var boardsDB = {};
var idCounter = 0;

// TODO: criar middleware que indica o sparql endpoint a usar e o namespace do blazegraph a usar.


var db = mongoskin.db('mongodb://localhost/mixcollective-annotations'); 

var SPARQL_PREFIXES = {
	'mcuseront': '<http://www.mixcollective.com/ontologies/sys/users/>', 
	'mcannsont': '<http://www.mixcollective.com/ontologies/sys/annotations/>', 
	'mcents': '<http://www.mixcollective.com/entities/',
	'dc': '<http://purl.org/dc/elements/1.1/>'
};
var SparqlClient = require('sparql-client');
var util = require('util');
var client = new SparqlClient(endpoint);
var endpoint = "http://localhost:9999/bigdata/namespace/kb/sparql?format=json";


app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
	res.send('Hello World!');
});



function req_opts(query, isQuery) {
	var options = {
		url: endpoint ,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/sparql-results+json'
		},
		method: 'POST'
	};
	if (isQuery) {
		options.form = { query: query };
	} else {
		options.form = { update: query };
	}

	console.info(options);
	return options;
}



var server = app.listen(90, function () {
	var host = server.address().address;
	var port = server.address().port;

	logger.info('Example app listening at http://%s:%s', host, port);
});

app.post('/api/boards', function(req, res) {

	var title = req.body.title;
	var description = req.body.description;
	var musicId = req.body['music-id'];

	if (title == undefined || description == undefined || musicId == undefined) {
		res.status(500).json({ error: 'Invalid parameters. Required parameters in querystring: title, description, music-id.' })
		return;
	}

	var query = 
		'PREFIX mcannsont: <http://www.mixcollective.com/ontologies/sys/annotations/> \n' +
		'PREFIX mcents: <http://www.mixcollective.com/entities/> \n' +
		'PREFIX dc: <http://purl.org/dc/elements/1.1/> \n' + 
		'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n' +
		'INSERT { \n' +
		' ?board a mcannsont:AnnotationsBoard ; \n' +
		'   mcannsont:for_musical_item ?music ; \n' +
		'   dc:title ?title ; \n' +
		'   dc:description ?description ; \n' +
		'   dc:creator ?user ; \n' +
		'   mcannsont:creation_date ?creationDate . \n' +
		'} \n' +
		'WHERE { \n' +
		' BIND(IRI(concat(STR(mcents:), STRUUID())) AS ?board) \n' +
		' BIND(NOW() AS ?creationDate) \n' +
		'}';


	var queryObj = client.query(query);
	queryObj.bind('title', "\"" + title + "\"^^xsd:string");
	queryObj.bind('description', "\"" + description + "\"^^xsd:string");
	queryObj.bind('user', 'mcents:u1');
	queryObj.bind('music', musicId);

	// logger.info('\n' + queryObj.currentQuery + '\n');

	function callback(error, response, body) {
		if (error && error.code == 'ECONNREFUSED') {
			console.error(error);
			res.status(500).json({ error: 'There was a problem with the database. The detailed error message was logged.'});
			logger.error(error);
			return;
		}
		if (response.statusCode == 200) {
			res.json({code: 200});
			logger.info("New annotations board inserted.");
			return;
		}
	}
 
	request(req_opts(queryObj.currentQuery), callback);
});

app.get('/api/boards', function(req, res) {
	var users = req.params['users'];
	var musicId = req.params['music-id'];
	var limit = 10;
	var offset = 0;

	var query = 
		'SELECT ?board, ?type, ?user, ?musicId \n' +
		'WHERE { \n' +
		'    \n' +
		'} ';
});

app.get('/api/boards/:id', function(req, res) {
	var board = req.params['id'];

	var query = 
		'PREFIX mcents: <http://www.mixcollective.com/entities/> \n' +
		'DESCRIBE ?board \n' +
		'{ \n' +
   		'   hint:Query hint:describeMode "SCBD" \n' +
		'}';

	var queryObj = client.query(query);
	queryObj.bind('board', board);

	// logger.info('\n' + queryObj.currentQuery + '\n');

	function callback(error, response, body) {
		
		if (error && error.code == 'ECONNREFUSED') {
			console.error(error);
			res.status(500).json({ error: 'There was a problem with the database. The detailed error message was logged.'});
			logger.error(error);
			return;
		}
		if (response.statusCode == 200) {
			console.info(body);
			res.json(body);
			// console.info(body);
		}
	}
 
	request(req_opts(queryObj.currentQuery, true), callback);

});

app.post('/api/tracks', function(req, res) {
	var user;
	var title;
	var description;
	var boardId;
	var musicId;

	var query = 
		'PREFIX mcannsont: <http://www.mixcollective.com/ontologies/sys/annotations/> \n' +
		'PREFIX mcents: <http://www.mixcollective.com/entities/> \n' +
		'PREFIX dc: <http://purl.org/dc/elements/1.1/> \n' + 
		'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n' +
		'INSERT { \n' +
		' ?board a mcannsont:AnnotationsTrack ; \n' +
		'   mcannsont:for_musical_item ?music ; \n' +
		'   mcannsont:in_annotations_board ?board ; \n' +
		'   dc:title ?title ; \n' +
		'   dc:description ?description ; \n' +
		'   dc:creator ?user ; \n' +
		'   mcannsont:creation_date ?creationDate . \n' +
		'} \n' +
		'WHERE { \n' +
		' BIND(IRI(concat(STR(mcents:), STRUUID())) AS ?board) \n' +
		' BIND(NOW() AS ?creationDate) \n' +
		'}';

	var queryObj = client.query(query);
	queryObj.bind('title', "\"" + title + "\"^^xsd:string");
	queryObj.bind('description', "\"" + description + "\"^^xsd:string");
	queryObj.bind('user', 'mcents:u1');
	queryObj.bind('music', musicId);
	queryObj.bind('board', boardId);

	function callback(error, response, body) {
		
		if (error && error.code == 'ECONNREFUSED') {
			console.error(error);
			res.status(500).json({ error: 'There was a problem with the database. The detailed error message was logged.'});
			logger.error(error);
			return;
		}
		if (response.statusCode == 200) {
			console.info(body);
			res.json(body);
			return;
		}
	}
 
	request(req_opts(queryObj.currentQuery, true), callback);
});