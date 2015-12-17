module.exports = function(endpoint) {

	var _endpoint = endpoint;
	var rp = require('request-promise');
	var jsonld = require('jsonld');
	var misc = require('./misc.js')();
	var uuidGen = require('./uuid.js')(_endpoint);
	var SparqlClient = require('sparql-client');
	var client = new SparqlClient(_endpoint);
	var that = this;

	var customContext = function() {
		var customContext = JSON.parse(JSON.stringify(misc.context));
		customContext['creator'] = {'@id':misc.context['dc'] + 'creator', '@type':'uri'};
		customContext['creation_date'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['title'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['description'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['time'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['duration'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['track'] = {'@id':misc.context['dc'] + 'in_track', '@type':'uri'};
		customContext['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
		return customContext;
	}

	var _create = function(params) {
		// params: {title, description, creator, track, time, duration, types}
		var p = new Promise((resolve, reject) => {

			if (params.time == undefined || params.creator == undefined) {

			}

			misc.create_resource(_endpoint, ['oann:Annotation'], 'iannt', [
				{ name: 'dc:title', value: 'track de anotações 1', type: 'xsd:string' }, 
				{ name: 'dc:description', value: 'descrição da track 1', type: 'xsd:string' }, 
				{ name: 'oann:in_track', value: params.track, type: 'oann:AnnotationsTrack', mustExist: true },
				{ name: 'oann:time', value: params.time, type: 'xsd:float' },
				{ name: 'oann:duration', value: params.duration, type: 'xsd:float' },
				{ name: 'dc:creator', value: params.creator, type: 'omisc:User', mustExist: true },
			]).then().catch();

			uuidGen.create()
				.then(function(uuid) {

					var INSERT = ['',
				 	 	 		  ' ?id a oann:Annotation . ', 
				 	 	 		  ' ?id dc:creator ?creator . ', 
				 	 	 		  ' ?id dc:creation_date ?creationDate . ', 
				 	 	 		  (params.title != undefined)? ' ?id dc:title ?title . ' : '', 
				 	 	 		  (params.description != undefined)? ' ?id dc:description ?description . ' : '', 
				 	 	 		  ' ?id oann:time ?time . ', 
				 	 	 		  (params.duration != undefined)? ' ?id oann:duration ?duration . ' : '', 
				 	 	 		  ' ?id oann:in_track ?track . '
				 	];
				 	if (params.types) 
				 		for (var i in params.types) 
				 			INSERT[INSERT.length] = ' ?id a ' + params.types + ' . ';
				 	
				 	INSERT = '\nINSERT { ' + INSERT.join('\n') + ' } ';

				 	var WHERE = ['', 
				 				 ' ?creator a omisc:User . ', 
				 				 ' ?track a oann:AnnotationsTrack . ', 
				 				 ' BIND(IRI(concat(STR(iann:), ?uuid )) AS ?id) ', 
				 				 ' BIND(NOW() AS ?creationDate) '
					];
					WHERE = '\WHERE { ' + WHERE.join('\n') + ' } ';



					var query = misc.prefixes_str() + INSERT + WHERE;
					var queryObj = client.query(query);
						queryObj.bind('uuid', uuid);
						queryObj.bind('title', '\"' + params.title + '\"^^xsd:string');
						queryObj.bind('description', '\"' + params.description + '\"^^xsd:string');
						queryObj.bind('creator', params.creator);
						queryObj.bind('track', params.track);
						queryObj.bind('time', '\"' + params.time + '\"^^xsd:float');
						queryObj.bind('duration', '\"' + params.duration + '\"^^xsd:float');

					// console.log(queryObj.currentQuery);

					rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
						.then(function(response) {
							_get('iann:' + uuid).then(resolve).catch(reject);
						})
						.catch(function(error) {
							reject(error);
						});
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _delete = function(IRI) {
		return delete_resource(_endpoint, IRI, 'oann:Annotation');
	}

	var _update = function(params) {

		var p = new Promise((resolve, reject) => {
			var DELETE = ['',
			 		  (params.title != undefined)? ' ?annotation dc:title ?o1 . ' : '', 
			 		  (params.description != undefined)? ' ?annotation dc:description ?o2 . ' : '', 
			 		  (params.time != undefined) ' ?annotation oann:time ?o3 . ', 
			 		  (params.duration != undefined)? ' ?annotation oann:duration ?o4 . ' : ''];
			DELETE = '\nDELETE { ' + DELETE.join('\n') + ' } ';

			var INSERT = ['',
				 		  (params.title != undefined)? ' ?annotation dc:title ?title . ' : '', 
				 		  (params.description != undefined)? ' ?annotation dc:description ?description . ' : '', 
				 		  (params.time != undefined) ' ?annotation oann:time ?time . ', 
				 		  (params.duration != undefined)? ' ?annotation oann:duration ?duration . ' : ''];
			INSERT = '\nINSERT { ' + INSERT.join('\n') + ' } ';

			var WHERE = ['', 
		 				 ' ?annotation a oann:Annotation . ' ];
		 	WHERE = '\nWHERE { ' + WHERE.join('\n') + ' } ';

		 	var query = misc.prefixes_str() + DELETE + INSERT + WHERE;

		 	var queryObj = client.query(query);
		 		queryObj.bind('annotation', params.IRI);
				queryObj.bind('title', '\"' + params.title + '\"^^xsd:string');
				queryObj.bind('description', '\"' + params.description + '\"^^xsd:string');
				queryObj.bind('time', '\"' + params.time + '\"^^xsd:float');
				queryObj.bind('duration', '\"' + params.duration + '\"^^xsd:float');

			rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
				.then(function(response) {
					_get(params.IRI)
						.then(resolve)
						.catch(reject);
				})
				.catch(reject);
		});

		return p;
	}

	var _get = function(IRI, expand) {
		// TODO expand: { comments, rates, creator, track }
		var p = new Promise((resolve, reject) => {
			var DESCRIBE = '\nDESCRIBE ?a ';
			
			var WHERE = '\nWHERE { ?a a oann:Annotation . } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE;

			var queryObj = client.query(query);
				queryObj.bind('a', IRI);

			// console.log(queryObj.currentQuery);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery))
				.then(function(response) {
					misc._compact_triples(response.body.results.bindings, customContext())
							.then(resolve)
							.catch(reject);
				})
				.catch(function(error) {
					reject(error);
				});
		});
	}

	var _search = function(params) {
		// TODO
	}

	var _count = function(params) {
		// params: { creator, track, types}
		var p = new Promise(function(resolve, reject) {

			var SELECT = '\nSELECT (COUNT(DISTINCT ?c) AS ?count) ';

			var WHERE = ['',
						 ' ?annotation a oann:Annotation . ', 
						 (params.track != undefined)? ' ?annotation oann:in_track ?track . ' : ''
						 (params.creator != undefined)? ' ?annotation dc:creator ?creator . ' : '' ];
			if (params.types) 
				for (var i in params.types) 
					WHERE[WHERE.length] = ' ?annotation a ' + params.types + ' . ';

			WHERE = '\nWHERE { ' + WHERE.join('\n') + ' } ';

			var query = misc.prefixes_str() + SELECT + WHERE ;

			var queryObj = client.query(query);
				queryObj.bind('track', params.track);
				queryObj.bind('creator', params.creator);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery))
				.then((response) => { resolve(parseInt(response.body.results.bindings[0].count.value)); })
				.catch(reject);

		});

		return p;
	}

	return {
		create 	: _create ,
		delete 	: _delete ,
		update 	: _update ,
		get 	: _get, 
		search 	: _search, 
		count 	: _count
	}

}