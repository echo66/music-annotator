module.exports = function(endpoint) {

	var _endpoint = endpoint;
	var rp = require('request-promise');
	var jsonld = require('jsonld');
	var misc = require('./misc.js')();
	var uuidGen = require('./uuid.js')(_endpoint);
	var SparqlClient = require('sparql-client');
	var client = new SparqlClient(_endpoint);
	var that = this;

	var _customContext = function() {
		var customContext = JSON.parse(JSON.stringify(misc.context));
		customContext['title'] = {'@id':misc.context['dc'] + 'title', '@type':'xsd:string'};
		customContext['description'] = {'@id':misc.context['dc'] + 'description', '@type':'xsd:string'};
		customContext['creation_date'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
		customContext['creator'] = {'@id':misc.context['omisc'] + 'creator', '@type':'uri'};
		customContext['annotation'] = {'@id':misc.context['omisc'] + 'creator', '@type':'uri'};
	}

	var _create = function(params) {
		// params: {title, description, creator, board, types}
		var p = new Promise((resolve, reject) => {

			var types = params.types || [];
			types.push('oann:AnnotationsTrack');

			misc.create_resource(_endpoint, types, 'iannb')
					.then((IRI) => {
						var p1 = misc.add_triple(_endpoint, IRI, 'dc:creator', params.creator);
						var p2 = misc.add_triple(_endpoint, IRI, 'oann:in_board', params.board);
						var p3 = misc.add_triple(_endpoint, IRI, 'dc:title', '"' + params.title + '"^^xsd:string');
						var p4 = misc.add_triple(_endpoint, IRI, 'dc:description', '"' + params.description + '"^^xsd:string');
						p1.then(p2).then(p3).then(p4).then(() => {
							resolve(_get(IRI));
						}).catch(reject);

					})
					.catch(reject);
		});

		return p;
	}

	var _delete = function(IRI) {
		return misc.delete_resource(_endpoint, IRI, 'oann:AnnotationsTrack');
	}

	var _update = function(params) {

		misc.exists_triple(_endpoint, params.IRI, 'a', 'oann:AnnotationsTrack')
			.then(function() {
				var p1 = misc.replace_triple_value(_endpoint, params.IRI, 'dc:title', params.title);
				var p2 = misc.replace_triple_value(_endpoint, params.IRI, 'dc:description', params.description)
				p1.then(p2).then(() => { resolve(_get(params.IRI)); }).catch(reject);
			})
			.catch(reject);
	}

	var _get = function(IRI, expand) {
		// TODO expand: {annotations, comments, rates}
		var p = new Promise((resolve, reject) => {
			var DESCRIBE = ' DESCRIBE ?t ';
			
			var WHERE = 'WHERE { ?t a oann:AnnotationsTrack . } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE;

			var queryObj = client.query(query);
				queryObj.bind('t', IRI);

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

		return p;
	}

	var _search = function(params) {
		// params: // params: { creator, board, startDate, endDate }
		var DESCRIBE = '\nDESCRIBE ?t ';
			
			var WHERE =	['',
				 	 	 (params.board != undefined)? ' ?c omisc:for ?resource . ', 
				 	 	 (params.creator != undefined)? ' ?creator a omisc:User . ' : '', 
				 	 	 (params.creator != undefined)? ' ?c dc:creator ?creator . ' : '', 
				 	 	 (params.startDate != undefined || params.endDate != undefined)? ' ?c dc:creation_date ?creationDate . ' : '', 
				 	 	 (params.startDate != undefined)? ' FILTER( ?startDate <= ?creationDate ) ' : '',
				 	 	 (params.endDate != undefined)? ' FILTER( ?endDate >= ?creationDate ) ' : '' 
				 	 	].join('\n');

			WHERE = '\nWHERE { ' + WHERE ' } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE ;

			var queryObj = client.query(query);
				queryObj.bind('board', params.board);
				queryObj.bind('creator', params.creator);
				queryObj.bind('startDate', params.startDate);
				queryObj.bind('endDate', params.endDate);

			rp(misc.req_opts(_endpoint, query.currentQuery))
				.then(function(response) {
					if (response.statusCode == 200) {
						// resolve(response.body.results.bindings);
						misc._compact_triples(response.body.results.bindings, _customContext()).then(resolve).catch(reject);
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _count = function(params) {

	}

	var _annotations = function(trackIRI) {
		// TODO 
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