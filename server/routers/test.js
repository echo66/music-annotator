var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var expressSession 	= require('express-session');
var urouter = require('./auth')(passport);

var expressSession = expressSession({secret: 'minhaChaveSecreta', resave: false, saveUninitialized: true });
var passportI = passport.initialize();
var passportSession = passport.session({resave: false, saveUninitialized: true})

app.use(expressSession);
app.use(passportI);
app.use(passportSession);
app.use(bodyParser.json());
app.use(cors());
app.use('/auth', urouter);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/test', function(req, res) {
	res.status(200).json(req.session);
})