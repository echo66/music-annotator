var rdfstore = require('rdfstore');

var store = undefined;
var graph = undefined;
var triples = undefined;
var rdf = undefined;
var jsonld = {
 "@context": {
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "name": "http://xmlns.com/foaf/0.1/name",
  "age": {"@id": "http://xmlns.com/foaf/0.1/age", "@type": "xsd:integer" },
  "homepage": {"@id": "http://xmlns.com/foaf/0.1/homepage", "@type": "xsd:anyURI" },
  "ex": "http://example.org/people/"
 },
 "@id": "ex:john_smith",
 "name": "John Smith",
 "age": "41",
 "homepage": "http://example.org/home/"
};

rdfstore.create({ 
 persistent:true, 
 engine:'mongodb', 
 name:'myappstore', 
 mongoDomain:'localhost', 
 mongoPort:27017, 
 overwrite:true },
 function(err, _store) {
  store = _store
  graph = store.rdf.createGraph();
  rdf = store.rdf;
  graph.addAction(rdf.createAction(store.rdf.filters.p(store.rdf.resolve("foaf:name")),
                                                        function(triple){ 
                                                          var name = triple.object.valueOf();
                                                          var name = name.slice(0,1).toUpperCase() + name.slice(1, name.length);
                                                          triple.object = store.rdf.createNamedNode(name);
                                                          return triple;
                                                        }));
  store.rdf.setPrefix("ex", "http://example.org/people/");
  graph.add(store.rdf.createTriple(store.rdf.createNamedNode(store.rdf.resolve("ex:Alice")),
                                    store.rdf.createNamedNode(store.rdf.resolve("foaf:name")),
                                    store.rdf.createLiteral("alice")));
  triples = graph.match(null, store.rdf.createNamedNode(store.rdf.resolve("foaf:name")), null).toArray();
  console.log("worked? "+(triples[0].object.valueOf() === 'Alice'));

  store.load("application/ld+json", jsonld, "ex:test", function(err,results) {
    store.node("ex:john_smith", "ex:test", function(err, graph) {
      // process graph here
    });
  });
});