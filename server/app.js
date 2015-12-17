var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var log4js = require('log4js');
var logger = log4js.getLogger();
log4js.replaceConsole()
var app = express();
var rComments = require('./routers/comments-router.js');
var rRates = require('./routers/rates-router.js');
var rAnnotations = require('./routers/annotations-router.js');

app.use('/rates', rRates);
app.use('/comments', rComments);
app.use('/annotations', rAnnotations);

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
	res.send('Hello World!');
});

app.post('/', function (req, res) {
	// console.log(req.body);
	// console.log(req.params);
	// console.log(req.query);
});

var server = app.listen(90, function () {
	var host = server.address().address;
	var port = server.address().port;

	logger.info('Example app listening at http://%s:%s', host, port);
});