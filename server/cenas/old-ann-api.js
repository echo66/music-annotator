var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var cors = require('cors');
var app = express();
var boardsDB = {};
var idCounter = 0;

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

var server = app.listen(90, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});


app.post('/api/register', function(req, res) {
	// TODO: cria um user na triple store.
	// TODO: cria um user numa BD local para poder autenticar.
});

app.post('/api/login', function(req, res) {
	// TODO: verifica as credenciais.
	// TODO: cria sessão.
});

app.get('/api/users', function(req, res) {
	// TODO: listar os users da plataforma.
});

app.get('/api/users/:id', function(req, res) {
	// TODO: mostra a informação básica sobre o user, assim como que músicas anotou e que conceitos criou.
});

app.post('/api/boards', function(req, res) {
	var query = 
	'PREFIX mcannsont: <http://www.mixcollective.com/ontologies/sys/annotations/> ' +
	'PREFIX mcents: <http://www.mixcollective.com/entities/> ' +
	'INSERT { ' +
	' ?board a mcannsont:AnnotationsBoard ; ' +
	'   dc:title "primeira board" ; ' +
	'   dc:description "descrição primeira board" ; ' +
	'   dc:creator mcents:user1 ; ' +
	'   mcannont:creation_date now() . ' +
	'} ' +
	'WHERE { ' +
	' BIND(IRI(concat("mcents:", STRUUID())) as ?board) ' +
	'}';

	
	


	var options = {
	  url: endpoint + "&query=" + query, 
	  headers: {
	    'Content-Type': 'application/x-www-form-urlencoded',
    	// 'Accept': 'application/sparql-results+json'
	  },
	  method: 'POST'
	};

	function callback(error, response, body) {
	  console.log(body);
	}
 
	request(options, callback);



	
	// var queryObj = client.query(query);
	// queryObj.bind('title', "'" + req.body.title + "'")
	// 		.bind('description', "'" + req.body.description + "'")
	// 		.bind('user', 'mcents:u1');

	// console.log("Query to " + endpoint);
	// console.log("Query: " + query);

	// queryObj.execute(function(error, results) { 
	// 	result = results; 
	// 	process.stdout.write(util.inspect(arguments, null, 20, true)+"\n"); 
	// });
});



app.post('/server/annotations/boards', function(req, res) {

	var newBoard = {
		"title" : req.body.title || "",
		"description" : req.body.description || "",
		"tracks-types-allowed" : req.body.allowed_annotations_tracks_types || [],
		"feedback" : [], 
		"creator-id" : "", // TODO: usar a sessão do connect.
		"creation-data" : new Date() + "",
		"music-id" : req.body.musicId, 
	};
	
	db.collection('boards').insert(newBoard, {}, function(err, result) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		if (err) {
			console.log(err);
			res.json({ code : 500 });
		} else {
			console.log(result.ops[0]);
			res.json(result.ops[0]);
		}
	});
});


app.put('/server/annotations/boards', function(req, res) {
	var boardId = req.params.id;
	console.log(req.body);
});

app.get('/server/annotations/boards', function(req, res) {
	db.collection('boards').find({},{}).toArray(function(err, result) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.json(result);
	});
});

app.get('/server/annotations/boards/:id', function(req, res) {
	db.collection('boards'). findById(req.params.id, {}, function(err, result) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.json(result);
	})
});

app.get('/server/annotations/clear', function(req, res) {
	db.collection('boards').remove();
	db.collection('tracks').remove();
	db.collection('annotations').remove();
	db.collection('types').remove();
	res.send("");
});



// var newTrack = {
// 		"title" : req.body.title || "",
// 		"description" : req.body.description || "",
// 		"annotation-types-allowed" : req.body.allowed_annotations_tracks_types || [],
// 		"feedback" : [], 
// 		"creator-id" : "", // TODO: usar a sessão do connect.
// 		"creation-data" : new Date() + "",
// 		"music-id" : req.body.musicId, 
// 		"board-id" : req.body.boardId,
// 	};




// app.post('/server/tasks/request', function(req, res) {
// 	var type = req.body.type;
// 	// Quizz
// 	// Annotate (required: allowed-tracks, )
// 	// Classify a song
// 	// Feedback to board, annotation, track
// 	// Mix some tracks, according to some rules
// 	// Create a rule

// 	// Quizz
// 	{
// 		type,
// 		description,
// 		creation-date,
// 		possible-answers
// 		answers: [{}]
// 	}

// 	// Classification
// 	{
// 		type : 'classify-song' | 'classify-segment',
// 		description : 
// 		creation-date :
// 		options : [{...}]
// 		answers : 
// 	}
// })

// app.post('/server/tasks/:id', function(req, res) {

// });

// app.get('/server/tasks', function(req, res) {
// 	// List tasks by: type and requester
// });

// app.get('/server/tasks/:id', function(req, res) {

// });




























var boardSchema = Schema({
	_id : String, 
	title : String, 
	description : String,
	creator : String, 
	tracksClassesAllowed : [{ type: Schema.Types.ObjectId, ref: 'Type' }], 
	tracks : [{ type: Schema.Types.ObjectId, ref: 'AnnotationTrack' }]
});

var trackSchema = Schema({
	_id : String, 
	title : String, 
	description : String,
	creator : String, 
	types : [{ type: Schema.Types.ObjectId, ref: 'Type' }], 
	annotationsClassesAllowed : [{ type: Schema.Types.ObjectId, ref: 'Type' }], 
	annotations : [{ type: Schema.Types.ObjectId, ref: 'Annotation' }]
});

var annotSchema = Schema({
	_id : String, 
	title : String, 
	description : String,
	creator : String, 
	types : [{ type: Schema.Types.ObjectId, ref: 'Type' }], 
	annotationsClassesAllowed : [{ type: Schema.Types.ObjectId, ref: 'Type' }], 
	annotations : [{ type: Schema.Types.ObjectId, ref: 'Annotation' }], 
	time : Number,
	duration : Number, 
	custom : Schema.Types.Mixed
});


var AnnotationBoard = mongoose.model('AnnotationBoard', storySchema);
var AnnotationTrack = mongoose.model('AnnotationTrack', personSchema);
var Annotation = mongoose.model('Annotation', personSchema);
var Type = mongoose.model('Type', personSchema);








































var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var cors = require('cors');
var log4js = require('log4js');
var logger = log4js.getLogger();
log4js.replaceConsole()
var app = express();
var boardsDB = {};
var idCounter = 0;

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
		'   dc:title ?title ; \n' +
		'   dc:description ?description ; \n' +
		'   dc:creator mcents:user1 ; \n' +
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

	logger.info(queryObj.currentQuery);
	


	var options = {
		url: endpoint ,
		form: { update: queryObj.currentQuery }, 
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/sparql-results+json'
		},
		method: 'POST'
	};

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
 
	request(options, callback);
});

app.get('/api/boards', function(req, res) {

	var bins = req.params.bins;

	var userURI = req.params['user'];
	var musicURI = req.params['music-id'];
	var offset = req.params['offset'];
	var limit = 5

	var query = 
		'PREFIX anno: <http://www.mixcollective.com/ontologies/sys/annotations/> ' +
		'SELECT ?board ' +
		'WHERE { ' +
		' ?board a anno:AnnotationsBoard . ' +
		( (userURI!=undefined)?  '  ?board anno:for_musical_item ?music. ' : '' ) +
		( (musicURI!=undefined)? '  ?board dc:creator ?user . ' : '' ) +
		'} ' ;

	var queryObj = client.query(query);
	queryObj.bind('music', musicURI);
	queryObj.bind('user', userURI);
	

});


var query1 = 
	'PREFIX mcannsont: <http://www.mixcollective.com/ontologies/sys/annotations/> ' +
	'PREFIX mcents: <http://www.mixcollective.com/entities/> ' +
	'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
	'PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#> ' +
	'CONSTRUCT {' +
	'  ?s ?p ?o .' +
	'}' +
	'WHERE {' +
	'  ?s ?p ?o . ' +
	'  BIND(mcents:8a33cd90-daf8-4c58-a90a-e8d696ef484a AS ?s) ' +
	'}';

app.get('/api/boards/:id', function(req, res) {
	// TODO: Obter a board
});



// app.get('/api/boards/:id', function(req, res) {
// 	var query1 = 
// 		'PREFIX mcannsont: <http://www.mixcollective.com/ontologies/sys/annotations/> ' +
// 		'SELECT ?board ' +
// 		'WHERE { ' +
// 		' ?board a mcannsont:AnnotationsBoard . '
// 		'} ';

// 	var queryObj = client.query(query1);
// 	queryObj.bind('board', req.params.id);
// 	var options = {
// 		url: endpoint ,
// 		headers: {
// 			'Content-Type': 'application/x-www-form-urlencoded',
// 			'Accept': 'application/sparql-results+json'
// 		},
// 		method: 'GET'
// 	};


// 	var options = {
// 		uri: endpoint, 
// 		qs: {
// 			query: 
// 		},
// 		headers: {
// 		'User-Agent': 'Request-Promise'
// 		},
// 		json: true // Automatically parses the JSON string in the response 
// 	};

// 	rp(options)
// 		.then(function (repos) {
// 			console.log('User has %d repos', repos.length);
// 		})
// 		.catch(function (err) {
// 			// API call failed... 
// 		});
// });

app.get('/api/feedback', function(req, res) {
	var targetURI = req.params.target;
	var feedbackType = req.params.type;



});

app.get('/api/:targettype/:target/feedback', function(req, res) {

	var target = req.params['target'];
	var targetType;
	switch (req.params['target-type']) {
		case 'annotations' :
			targetType = 'mcanns:Annotation';
			break;
		case 'tracks' :
			targetType = 'mcanns:AnnotationsTrack';
			break;
		case 'boards' :
			targetType = 'mcanns:AnnotationsBoard';
			break;
	}


	var query = 
		'CONSTRUCT {' +
		'  ?s ?p ?o .' +
		'}' +
		'WHERE {' +
		'  ?s a fdb:Feedback . ' +
		'  ?s fdb:feedback_for ?target . ' +
		'  ?target a ?type . ' +
		'}';

	var queryObj = client.query(query);
	queryObj.bind('target', target);
	queryObj.bind('type', targetType);

	// TODO
});

app.post('/api/:targettype/:target/feedback', function(req, res) {

	var target = req.params['target'];
	var rate = req.params['rate'];
	var comment = req.params['comment'];
	var feedbackType;
	var targetType;
	

	switch (req.params['type']) {
		case 'comment' :
			feedbackType = 'fdb:Comment';
			break;
		case 'rating' :
			feedbackType = 'fdb:Rate'; 
			break;
		default: 
			// TODO: ERROR
			break;
	}

	switch (req.params['target-type']) {
		case 'annotations' :
			targetType = 'mcanns:Annotation';
			break;
		case 'tracks' :
			targetType = 'mcanns:AnnotationsTrack';
			break;
		case 'boards' :
			targetType = 'mcanns:AnnotationsBoard';
			break;
		default: 
			// TODO: ERROR
			break;
	}



	var query = 
		'INSERT { ' +
		'  ?feedback a ?feedbackType . ' +
		'  ?feedback fdb:feedback_for ?target . ' +
		'  ?feedback dc:creator ?user . ' +
		'  ?feedback dc:date ?creationDate . ' + 
		'  ?feedback dc:rating ?rate . ' +
		'  ?feedback dc:description ?comment . ' +
		'} ' +
		'WHERE { ' +
		'  ?target a ?targetType . ' + 
		'  BIND(IRI(concat(STR(mcents:), STRUUID())) AS ?feedback) '
		'  BIND(NOW() AS ?creationDate) '
		'} ';

	var queryObj = client.query(query);
	queryObj.bind('target', target);
	queryObj.bind('type', targetType);
	queryObj.bind('feedbackType', feedbackType);
	queryObj.bind('user', 'TODO'); 
	queryObj.bind('comment', comment); 
	queryObj.bind('rating', rate); 
});

'/api/annotations/:id/feedback'
'/api/tracks/:id/feedback'
'/api/boards/:id/feedback'

'/api/RESOURCETYPE/ID/SUBRESOURCETYPE'