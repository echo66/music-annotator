module.exports = function(endpoint) {

	var _endpoint = endpoint;
	var rp = require('request-promise');
	var jsonld = require('jsonld');
	var misc = require('./misc.js')();
	var uuidGen = require('./uuid.js')(_endpoint);
	var SparqlClient = require('sparql-client');
	var client = new SparqlClient(_endpoint);
	var that = this;

	var _get = function(uri, expand) {
		var p = new Promise((resolve, reject) => {
			var DESCRIBE = ' DESCRIBE ?c ';
			
			var WHERE = 'WHERE { ?c a omisc:Comment . } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE;

			var queryObj = client.query(query);
				queryObj.bind('c', uri);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery))
				.then(function(response) {
					if (response.statusCode == 200) {
						resolve(response.body.results.bindings);
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _search = function(params) {
		// params: { creator, resource, comment (TODO), startDate, endDate }
		var p = new Promise((resolve, reject) => {

			var DESCRIBE = '\nDESCRIBE ?c ';
			
			var WHERE =	['',
				 	 	 (params.resource != undefined)? ' ?c omisc:for ?resource . ', 
				 	 	 (params.creator != undefined)? ' ?creator a omisc:User . ' : '', 
				 	 	 (params.creator != undefined)? ' ?c dc:creator ?creator . ' : '', 
				 	 	 (params.startDate != undefined || params.endDate != undefined)? ' ?c dc:creation_date ?creationDate . ' : '', 
				 	 	 (params.startDate != undefined)? ' FILTER( ?startDate <= ?creationDate ) ' : '',
				 	 	 (params.endDate != undefined)? ' FILTER( ?endDate >= ?creationDate ) ' : '' 
				 	 	].join('\n');

			WHERE = '\nWHERE { ' + WHERE ' } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE ;

			var queryObj = client.query(query);
				queryObj.bind('resource', params.resource);
				queryObj.bind('creator', params.creator);
				queryObj.bind('startDate', params.startDate);
				queryObj.bind('endDate', params.endDate);

			rp(misc.req_opts(_endpoint, query.currentQuery))
				.then(function(response) {
					if (response.statusCode == 200) {
						// resolve(response.body.results.bindings);
						var customContext = JSON.parse(JSON.stringify(misc.context));
						customContext['for'] = {'@id':misc.context['omisc'] + 'for', '@type':'uri'};
						customContext['creator'] = {'@id':misc.context['omisc'] + 'creator', '@type':'uri'};
						customContext['creation_date'] = {'@id':misc.context['dc'] + 'creation_date', '@type':'xsd:dateTime'};
						customContext['comment'] = {'@id':misc.context['omisc'] + 'comment', '@type':'xsd:string'};
						misc._compact_triples(response.body.results.bindings, customContext).then(resolve).catch(reject);
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _count = function(params) {
		// params: { user, resource }
		var p = new Promise(function(resolve, reject) {
			var SELECT = '', 
				WHERE = '';

			SELECT = 'SELECT (COUNT(DISTINCT ?c) AS ?count) ';

			WHERE += ' ?c a omisc:Comment . ';
			WHERE += (params.resource != undefined)? ' ?c omisc:for ?resource . ' : '';
			WHERE += (params.creator != undefined)? ' ?c dc:creator ?creator . ' : '';
			WHERE = '{ ' + WHERE + ' }';

			var query = misc.prefixes_str() + SELECT + WHERE ;

			var queryObj = client.query(query);
			queryObj.bind('resource', params.resource);
			queryObj.bind('creator', params.creator);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery))
				.then((response) => { resolve(parseInt(response.body.results.bindings[0].count.value)); })
				.catch(reject);

		});

		return p;
	}

	var _create = function(params) {
		var p = new Promise((resolve, reject) => {
			uuidGen.create()
				.then(function(uuid) {
					var INSERT = '';
					var WHERE = '';

					INSERT += '\n ?id a omisc:Comment . ';
					INSERT += '\n ?id omisc:for ?target . ';
					INSERT += '\n ?id dc:creator ?creator . ';
					INSERT += '\n ?id dc:creation_date ?creationDate . ';
					INSERT += '\n ?id dc:description ?comment . ';
					INSERT = '\nINSERT { ' + INSERT + ' } ';

					WHERE += '\n ?creator a omisc:User . ';
					WHERE += '\n { ?target ?p1 ?o } UNION { ?s ?p2 ?target } '
					WHERE += '\n BIND(IRI(concat(STR(icomm:), ?uuid )) AS ?id) ';
					WHERE += '\n BIND(NOW() AS ?creationDate) ';
					WHERE = '\nWHERE { ' + WHERE + ' } ';

					var query = misc.prefixes_str() + INSERT + WHERE;
					var queryObj = client.query(query);
						queryObj.bind('target', params.target);
						queryObj.bind('uuid', '\"' + uuid + '\"^^xsd:string');
						queryObj.bind('creator', params.creator);
						queryObj.bind('comment', '\"' + params.comment + '\"^^xsd:string');

					// console.log(queryObj.currentQuery);

					rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
						.then(function(response) {
							if (response.statusCode == 200) {
								resolve('icomm:' + uuid);
								return;
							}
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
		return delete_resource(_endpoint, IRI, 'omisc:Comment');
	}


	return {
		count: _count, 
		get: _get, 
		create: _create, 
	}
}