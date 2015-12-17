var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = "http://localhost:9999/bigdata/namespace/kb/sparql?format=json";

var query = 
 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'
 'INSERT { ' +
 ' <http://www.mixcollective.com/b100> a <http://www.mixcollective.com/ontologies/sys/annotations/AnnotationsBoard> . ' +
 '} ' +
 'WHERE { }' ;
var client = new SparqlClient(endpoint);
var queryobj = client.query(query);
queryobj.bind('title', '"primeira board"');
queryobj.bind('description', '"descrição da primeira board"');
queryobj.bind('user', 'mcents:user1');

console.log("Query to " + endpoint);
console.log("Query: " + query);
var result = {}
queryobj.execute(function(error, results) { result = results; process.stdout.write(util.inspect(arguments, null, 20, true)+"\n"); });