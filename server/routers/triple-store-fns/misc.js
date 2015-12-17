module.exports = function() {

	var jsonld = require('jsonld');
	var SparqlClient = require('sparql-client');
	var rp = require('request-promise');

	var context = {
		"ianna":  "http://www.mxc.com/inst/annotations/annotations#",
		"iannt":  "http://www.mxc.com/inst/annotations/tracks#",
		"iannb":  "http://www.mxc.com/inst/annotations/boards#",
		"imus":  "http://www.mxc.com/inst/music#",
		"iuser":  "http://www.mxc.com/inst/users#",
		"icomm":  "http://www.mxc.com/inst/comments#",
		"irate":  "http://www.mxc.com/inst/rates#",
		"imisc":  "http://www.mxc.com/inst/misc#",
		"oann":   "http://www.mxc.com/ont/sys/annotations#",
		"omisc":  "http://www.mxc.com/ont/sys/misc#",
		"rdf":  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"dc":   "http://purl.org/dc/elements/1.1/",
		"xsd":  "http://www.w3.org/2001/XMLSchema#",
		"foaf": "http://xmlns.com/foaf/spec/",
		"hint": "http://www.bigdata.com/queryHints#",
		"ex": "http://www.example.com#"
	};

	var clone_context = function() {
		var ctx = {};
		for (var i in context) {
			ctx[i] = context[i];
		}
		return ctx;
	}

	var DB_ERR_MESSAGE = 'There was a problem with the database. The detailed error message was logged.';
	var ARGS_ERR_MESSAGE = 'Invalid parameters.';

	var prefixes_str = function(prefixes, ns) {
		var str = '';
		if (ns) {
			for (var i in ns) {
				str += '\nPREFIX ' + prefix + ': <' + prefixes[ns[i]] + '>  ';
			}
		} else {
			for (var prefix in prefixes) {
				str += '\nPREFIX ' + prefix + ': <' + prefixes[prefix] + '>  ';
			}
		}
		
		return str;
	}
	prefixes_str.bind(this);

	var req_opts = function(endpoint, query, reqType, accept) {
		var form = (reqType=='update')? { update : query } : { query : query };
		var options = {
			url: endpoint , form: form , method: 'POST' , 
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Accept': accept || 'application/sparql-results+json, application/json'
			},
			resolveWithFullResponse: true, 
			json: true
		};

		return options;
	}

	var compact_triples = function(triples, customContext) {
		var p = new Promise((resolve, reject) => {
			jsonld.fromRDF(	
				{ "@default" : triples }, 
				{ 
					format: true, 
					useNativeTypes: true, 
					rdfParser: function (x) { return x; }
				},
				function (e1, result) { 
					if (e1) {
						reject(e1);
					} else {
						// customContext['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
						jsonld.compact(result, {'@context' : customContext}, function(e2, compacted) {
							var ctx = compacted['@context'];
							delete compacted['@context'];
							compacted = JSON.parse(JSON.stringify(compacted).replace("\"rdf:type\":", "\"@type\":"));
							compacted['@context'] = ctx;
							resolve(compacted);
						});
					}
				}
			);
		});

		return p;
	}

	/* 
	 * constraints: [
	 *   { type: String (an URI) }
	 *   { prop: String (an URI), text: String }
	 * ]
	 */
	var search_resources = function(endpoint, ctx, where, limit, offset) {


		var WHERE = where.join('\n');

		var query += prefixes_str(ctx) + 
					[
						['']
						['DESCRIBE ?resource'], 
						['WITH {'], 
						['	SELECT DISTINCT ?resource '], 
						['	WHERE { '], 
						[WHERE], 
						['	}'], 
						['	LIMIT ' + limit], 
						['	OFFSET ' + offset], 
						// ['	ORDER BY ?orderProp'], 
						['} AS %namedSet1'], 
						['WHERE {'], 
						['	INCLUDE %namedSet1 .'], 
						['}']
					].join('\n');

		rp(req_opts(endpoint, query, undefined))
				.then((response) => { resolve(response.body.results.bindings); })
				.catch(reject);

	}


	var count_resources = function(endpoint, ctx, where) {
		// TODO
		['	SELECT DISTINCT ?resource '], 
		['	WHERE { '], 
		['		?s ?p ?o .'], 
		['		?resource rdf:type ?someClass .'], 
		['		?resource '], 
		....
		['	}'],
	}



	var get_resources_from_association = function(endpoint, ctx, IRI, prop, inverse) {

		var p = new Promise((resolve, reject) => {

			// For some reason, Blazegraph does not allow this.
			//var query = prefixes_str(ctx) + '\nDESCRIBE ?resource \nWHERE {\n { ?resource ?prop ?iri } UNION { ?iri ?prop ?resource } \n}';
			
			var query = prefixes_str(ctx) + '\nDESCRIBE ?resource' 
			if (inverse)
				query += '\nWHERE {\n { ?resource ?prop ?iri } \n}';
			else 
				query += '\nWHERE {\n { ?iri ?prop ?resource } \n}';

			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('iri', IRI);
				queryObj.bind('prop', prop);

			// console.log(queryObj.currentQuery);
			
			
			rp(req_opts(endpoint, queryObj.currentQuery, undefined))
				.then((response) => {
					resolve(response.body.results.bindings);
				})
				.catch(reject);

		});

		return p;
		
	}


	var get_resource = function(endpoint, IRI) {
		var p = new Promise((resolve, reject) => {

			var DESCRIBE = '\nDESCRIBE ?resource ';
			
			var WHERE = '\nWHERE { hint:Query hint:describeMode "SCBD" } ';

			var query = prefixes_str(context) + DESCRIBE + WHERE;

			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('resource', IRI);

			// console.log(queryObj.currentQuery);

			rp(req_opts(endpoint, queryObj.currentQuery))
				.then(function(response) {
					resolve(response.body.results.bindings);
				})
				.catch(reject);
		});

		return p;
	}


	/*
	 * properties: [
	 *   { prop: String (an URI), type: String (opt), literal: String | Number | Boolean }, 
	 *   { prop: String (an URI), type: String (an URI), uri: String (an URI) },
	 *   { prop: String (an URI), bind: String, var: String }
	 * ]
	 */
	/*
	 * In the next versions, use this:
	 * schema: {
	 *   'prop1' : { type: 'xsd:string' | 'xsd:float' | 'xsd:dateTime' | ... }, 
	 *	 'prop2' : { bind: '...' },
	 *   'prop3' : { types: [ IRIString ], res: IRIString, exist: true }
	 * }
	 *  
	 */
	var create_resource_v2 = function(endpoint, ctx, ns, types, properties) {
		var p = new Promise((resolve, reject) => {
			var uuidGen = require('./uuid.js')(endpoint);
			uuidGen.create()
				.then(function(uuid) {
					var INSERT = [];
					var WHERE = [];
					var varCounter = 0;

					var IRI = (ns != undefined)? ns + ':' + uuid : '<urn:' + uuid + '>';
					
					/* 
					 *  Always add the creation date to a new resource! 
					 *  That date will be the current one of the triple store. 
					 */
					INSERT.push([IRI, 'dc:creation_date', '?creationDate']);
					WHERE.push(['BIND( NOW() AS ?creationDate )']);

					/*
					 *  Add the list of types for this resource in INSERT.
					 *  Add existence restrictions, in WHERE, for all types (useful for 
					 *  the cases where we are dealing with a triple store with no 
					 *  deductive inference).
					 */
					for (var i in types) {
						INSERT.push([IRI, 'a', types[i]]);
						// WHERE.push([types[i], 'a', 'owl:Class']);
					}

					// console.log(properties);

					for (var i in properties) {
						var pr = properties[i];

						if (pr.bind != undefined) { // BINDINGS

							var newVar = pr.var || '?v_v_' + (varCounter++);
							INSERT.push([IRI, pr.prop, newVar]);
							WHERE.push(['BIND(' + pr.bind + ' AS ' + newVar + ')']);

						} else if (pr.literal != undefined && pr.type != undefined) { // LITERALS

							var type = (pr.type != undefined)? pr.type : 'xsd:string';
							var lit = '"'+ pr.literal +'"^^' + type;
							INSERT.push([IRI, pr.prop, lit]);

						} else if (pr.uri != undefined) { // URIs

							INSERT.push([IRI, pr.prop, pr.uri]);
							if (pr.type != undefined) 
								WHERE.push([pr.uri, 'a', pr.type]);

						}

					}

					var query = prefixes_str(ctx);

					query += '\nINSERT { ';
					for (var i in INSERT) {
						query += '\n ' + INSERT[i].join(' ') + ' . ';
					}
					query += '\n}';

					query += '\nWHERE { ';
					for (var i in WHERE) {
						var where = WHERE[i].join(' ');
						where = (where.match("BIND") == undefined)? where + ' . ' : where + ' '
						query += '\n ' + where;
					}
					query += '\n}';

					// console.log(query);

					rp(req_opts(endpoint, query, 'update'))
						.then((response) => { 
							get_resource(endpoint, IRI).then((triples) => { 
								if (triples.length > 0) { 
									resolve({ uuid:uuid, triples:triples }); 
								} else { 
									reject(undefined); 
								} 
							}).catch(reject)})
						.catch(reject);
				})
				.catch(reject);
		});
		return p;
	}

	/*
	 * properties: [
	 *   { prop: String (an URI), delete: Boolean, literal: String, type: String (an URI) }, 
	 *   { prop: String (an URI), delete: Boolean, uri: String (an URI) }, 
	 *   { prop: String (an URI), delete: Boolean }, 
	 *   { prop: String (an URI), replace: Boolean, uri: String (an URI)}, // TODO
	 *   { prop: String (an URI), replace: Boolean, literal: String (an URI), type: String (an URI) } // TODO
	 * ]
	 */
	var update_resource = function(endpoint, ctx, IRI, properties) {
		var p = new Promise((resolve, reject) => {
			var DELETE = [];
			var INSERT = [];
			var WHERE  = [];
			var varCounter = 0;


			for (var i in properties) {
				var pr = properties[i];

				if (pr.delete) {

					if (pr.uri != undefined) {

						DELETE.push([IRI, pr.prop, pr.uri]);

					} else if (pr.literal != undefined) {

						var val = '"' + pr.literal + '"^^' + ((pr.type != undefined)? pr.type : 'xsd:string');
						DELETE.push([IRI, pr.prop, val]);

					} else {

						var newVar = '?v_v_' + (varCounter++);
						DELETE.push([IRI, pr.prop, newVar]);
						WHERE.push([IRI, pr.prop, newVar]);

					}
					
				} else if (pr.replace) {

					// TODO

				} else {

					if (pr.uri != undefined) {

						INSERT.push([IRI, pr.prop, pr.uri]);

					} else if (pr.literal != undefined) {

						var val = '"' + pr.literal + '"^^' + ((pr.type != undefined)? pr.type : 'xsd:string');
						INSERT.push([IRI, pr.prop, val]);

					} else {

						reject(undefined);

					}
					
				}
				
			}

			var query = prefixes_str(ctx);

			query += '\nDELETE { ';
			for (var i in DELETE) {
				query += '\n ' + DELETE[i].join(' ') + ' . ';
			}
			query += '\n}';

			query += '\nINSERT { ';
			for (var i in INSERT) {
				query += '\n ' + INSERT[i].join(' ') + ' . ';
			}
			query += '\n}';

			query += '\nWHERE { ';
			for (var i in WHERE) {
				query += '\n ' + WHERE[i].join(' ') + ' . ';
			}
			query += '\n}';

			// console.log(query);

			rp(req_opts(endpoint, query, 'update'))
				.then((response) => { get_resource(endpoint, IRI).then(resolve).catch(reject) })
				.catch(reject);

		});

		return p;
	}

	var create_resource = function(endpoint, types, ns) {
		var p = new Promise((resolve, reject) => {
			var uuidGen = require('./uuid.js')(endpoint);
			uuidGen.create()
				.then(function(uuid) {
					var IRI = (ns != undefined)? ns + ':' + uuid : '<urn:' + uuid + '>';
					var INSERT = ['', ' ?resource dc:creation_date ?creationDate . '];
					for (var i in types) {
						INSERT[INSERT.length] = ' ?resource a ' + types[i] + ' . ';
					}
					INSERT = '\nINSERT { ' + INSERT.join('\n') + ' } ';
					var WHERE = '\nWHERE { \nBIND(NOW() AS ?creationDate ) } ';
					var query = prefixes_str(context) + INSERT + WHERE;
					var client = new SparqlClient(endpoint);
					var queryObj = client.query(query);
						queryObj.bind('resource', IRI);

					rp(req_opts(endpoint, queryObj.currentQuery, 'update'))
						.then((response) => { get_resource(IRI).then(resolve).catch(reject) })
						.catch(reject);
				})
				.catch((error) => { reject(error) });
		});
		return p;
	}

	var delete_resource = function(endpoint, IRI) {
		var p = new Promise((resolve, reject) => {

			var DELETE = '\nDELETE { ?r ?p1 ?y .  ?x ?p2 ?r . } ';
			var WHERE  = '\nWHERE { { ?r ?p1 ?y . } UNION { ?x ?p2 ?r . } } ';
			
			var query = prefixes_str(context) + DELETE + WHERE ;

			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('r', IRI);

			// console.log(queryObj.currentQuery);

			rp(req_opts(endpoint, queryObj.currentQuery, 'update'))
				.then((response) => { resolve(IRI); })
				.catch(reject);

		});
		return p;
	}

	var delete_resource_v2 = function(endpoint, IRI) {

		var p = new Promise((resolve, reject) => {

			get_resource(endpoint, IRI)
				.then(function(triples) {
					if (triples.length) {
						delete_resource(endpoint, IRI)
							.then(function(IRI) {
								resolve(IRI);
							})
						.catch(reject);
					} else {
						reject(undefined);
					}
				})
				.catch(reject);

		});

		return p;
	}

	var add_triple = function(endpoint, s, p, o) {
		var p = new Promise((resolve, reject) => {
			var query = prefixes_str(context) + '\nINSERT DATA { ?s ?p ?o . } ';
			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('s', s);
				queryObj.bind('p', p);
				queryObj.bind('o', o);

			rp(req_opts(endpoint, queryObj.currentQuery, 'update'))
				.then((response) => { resolve(); })
				.catch(reject);
		});

		return p;
	}

	var remove_triple = function(endpoint, s, p, o) {
		var p = new Promise((resolve, reject) => {
			var query = prefixes_str(context) + '\nDELETE { ?s ?p ?o . } \nWHERE { ?s ?p ?o . } ';
			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('s', s);
				queryObj.bind('p', p);
				queryObj.bind('o', o);

			rp(req_opts(endpoint, queryObj.currentQuery, 'update'))
				.then((response) => { resolve(); })
				.catch(reject);
		});

		return p;
	}

	var replace_triple_value = function(endpoint, s, p, o) {
		var p = new Promise((resolve, reject) => {
			var query = prefixes_str(context) + '\nDELETE { ?s ?p ?oo . } \nINSERT { ?s ?p ?no . } \nWHERE { ?s ?p ?oo . } ';
			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('s', s);
				queryObj.bind('p', p);
				queryObj.bind('no', o);

			rp(req_opts(endpoint, queryObj.currentQuery, 'update'))
				.then((response) => { resolve(); })
				.catch(reject);
		});

		return p;
	}

	var exists_triple = function(endpoint, s, p, o) {
		var p = new Promise(function(resolve, reject) {

			var ASK = '\nASK { ?s ?p ?o . }';

			var query = prefixes_str(context) + ASK;

			var client = new SparqlClient(endpoint);
			var queryObj = client.query(query);
				queryObj.bind('s', s);
				queryObj.bind('p', p);
				queryObj.bind('o', o);

			// console.log(queryObj.currentQuery);

			rp(req_opts(endpoint, queryObj.currentQuery))
				.then((response) => { 
					// console.log(response.body.boolean);
					if (response.body.boolean) 
						resolve(); 
					else
						reject();
				})
				.catch(reject);

		});

		return p;
	}


	var good_form = function(triples, ctx) {
		var p = new Promise(function(resolve, reject) {
			compact_triples(triples, ctx)
				.then((doc) => {
					jsonld.toRDF(doc, {format: 'application/nquads'}, function(err, nquads) {
						jsonld.fromRDF(nquads, {format: 'application/nquads'}, function(err, doc) {
							jsonld.compact(doc, ctx, function(err, compacted) {
								// console.log(JSON.stringify(compacted, null, 2));
								resolve(compacted);
							});
						});
					});
				})
				.catch(reject);
		});

		return p;
	}


	/*
	 *  meta: {
	 *    'label': { 'pt' : String, 'en': String, ... }
	 *    'description': { 'pt' : String, 'en': String, ... }
	 *	  'creator': { 'pt' : String, 'en': String, ... }
	 *  }
	 *	schema: [
	 *    { label: String (opt), description: String (opt), prop: String, type: 'O' | 'L', minC: Number, maxC: Number }
	 *  ]
	 */
	var create_class = function(endpoint, schema, meta) {
		var p = new Promise(function(resolve, reject) {

			var INSERT = [];
			var WHERE = [];
			var blankIdCouter = 0
			var blankPrefix = '_:b';

			if (meta.label != undefined)
				INSERT.push([uuid, 'rdfs:label', meta.label]);
			if (meta.creator != undefined)
				INSERT.push([uuid, 'rdfs:comment', meta.description]);
			if (meta.creator != undefined)
				INSERT.push([uuid, 'dc:creator', meta.creator]);

			for (var i in schema) {
				// TODO	
				var p = schema[i];
				if (p.type == 'O') {
					INSERT.push([p.prop, 'a', 'owl:DatatypeProperty']);
				} else if p.type == 'L' {
					INSERT.push([p.prop, 'a', 'owl:ObjectProperty']);
				} else {
					reject("type must be 'O' or 'L'");
				}

				// TODO
			}

		});

		return p; 
	}


	

	return {
		req_opts : req_opts, 
		context : context,
		compact_triples : compact_triples, 
		prefixes_str : prefixes_str, 
		delete_resource : delete_resource_v2, 
		create_resource : create_resource_v2,
		add_triple : add_triple, 
		remove_triple : remove_triple,
		exists_triple : exists_triple, 
		replace_triple_value : replace_triple_value, 
		update_resource : update_resource,
		get_resources_from_association : get_resources_from_association,
		get_resource : get_resource, 
		clone_context : clone_context,
		jsonld : jsonld,
		good_form : good_form
	}; 
	
};