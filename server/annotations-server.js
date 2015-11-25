var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express();
var boardsDB = {};
var idCounter = 0;

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

app.post('/server/annotations/board', function(req, res) {
	req.body.id = 'b' + idCounter++;
	boardsDB[req.body.id] = req.body;
	res.json(req.body);
});

app.put('/server/annotations/board', function(req, res) {
	var boardId = req.params.id;
	console.log(req.body);
});

/*
app.get('/annotations/annotation', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify([{a:1}], null, 3));
});

app.post('/annotations/annotation', function(req, res) {
	
});

app.delete('/annotations/annotation/:id', function(req, res) {
	
});

app.get('/annotations/annotation/:id', function(req, res) {
	
});
*/