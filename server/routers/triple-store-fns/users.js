module.exports = function(endpoint) {

	var _endpoint = endpoint;
	var rp = require('request-promise');
	var jsonld = require('jsonld');
	var misc = require('./misc.js')();
	var uuidGen = require('./uuid.js')(_endpoint);
	var SparqlClient = require('sparql-client');
	var client = new SparqlClient(_endpoint);
	var that = this;

	var _create = function(params) {
		// params: {id, username}
		var p = new Promise((resolve, reject) => {
			uuidGen.create()
				.then(function(uuid) {

					// console.log(uuid);

					var INSERT = '';
					var WHERE = '';

					INSERT += '\n ?id a omisc:User . ';
					INSERT += '\n ?id omisc:username ?username . ';
					INSERT += '\n ?id omisc:signup_date ?signUpDate . ';
					INSERT = '\nINSERT { ' + INSERT + ' } ';

					WHERE += '\n BIND(IRI(concat(STR(iuser:), ?uuid )) AS ?id) ';
					WHERE += '\n BIND(NOW() AS ?signUpDate) ';
					WHERE = '\nWHERE { ' + WHERE + ' } ';

					var query = misc.prefixes_str() + INSERT + WHERE;
					var queryObj = client.query(query);
						queryObj.bind('uuid', '\"' + uuid + '\"^^xsd:string');
						queryObj.bind('username', '\"' + params.username + '\"^^xsd:string');

					// console.log(queryObj.currentQuery);

					rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
						.then(function(response) {
							if (response.statusCode == 200) {
								resolve('iuser:' + uuid);
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

	var _update = function(params) {
		// params: {id, username, custom}
	}

	var _get = function(IRI, expand) {
		// TODO expand: { cooments, rates, boards, tracks, annotations}
		var p = new Promise((resolve, reject) => {
			var DESCRIBE = '\nDESCRIBE ?u ';
			
			var WHERE = '\nWHERE { ?u a omisc:User . } ';

			var query = misc.prefixes_str() + DESCRIBE + WHERE;

			var queryObj = client.query(query);
				queryObj.bind('u', IRI);

			// console.log(queryObj.currentQuery);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery))
				.then(function(response) {
					if (response.statusCode == 200) {
						// resolve(response.body.results.bindings);
						var customContext = JSON.parse(JSON.stringify(misc.context));
						customContext['signin_date'] = {'@id':misc.context['omisc'] + 'signin_date', '@type':'xsd:dateTime'};
						customContext['signup_date'] = {'@id':misc.context['omisc'] + 'signup_date', '@type':'xsd:dateTime'};
						customContext['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
						misc._compact_triples(response.body.results.bindings, customContext).then(resolve).catch(reject);
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _delete = function(IRI) {
		
		return delete_resource(_endpoint, IRI, 'omisc:User');
	}

	var _search = function(params) {
		// TODO
	}

	var _rate = function(resource, value) {
		// TODO
	}

	var _comment = function(resource, comment) {
		// TODO
	}

	var _login = function(IRI) {
		var p = new Promise((resolve, reject) => {
			var INSERT = '', WHERE = '';

			INSERT += '\n ?id omisc:signin_date ?loginDate . ';
			INSERT = '\nINSERT {' + INSERT + ' } ';

			WHERE += '\n ?id a omisc:User . '
			WHERE += '\n BIND(NOW() AS ?loginDate) ';
			WHERE = '\nWHERE {' + WHERE + ' } ';

			var query = misc.prefixes_str() + INSERT + WHERE;
			var queryObj = client.query(query);
				queryObj.bind('id', IRI);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
				.then(function(response) {
					if (response.statusCode == 200) {
						resolve(IRI);
						return;
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var _logout = function(IRI) {
		var p = new Promise((resolve, reject) => {
			var INSERT = '', WHERE = '';

			INSERT += '\n ?id omisc:signout_date ?logoutDate . ';
			'\nINSERT {' + INSERT + ' } ';

			WHERE += '\n ?id a omisc:User . '
			WHERE += '\n BIND(NOW() AS ?logoutDate) ';
			WHERE += '\n BIND(IRI(?iri) AS ?id) ';
			'\nWHERE {' + WHERE + ' } ';

			var query = misc.prefixes_str() + INSERT + WHERE;
			var queryObj = client.query(query);
				queryObj.bind('iri', IRI);

			rp(misc.req_opts(_endpoint, queryObj.currentQuery, 'update'))
				.then(function(response) {
					if (response.statusCode == 200) {
						resolve(IRI);
						return;
					}
				})
				.catch(function(error) {
					reject(error);
				});
		});

		return p;
	}

	var add_property = function(userIRI, prop, val) {
		// TODO
		// var p = new Promise((resolve, reject) => {
		// 	INSERT += '\n ?id ?p ?val . '
		// 	INSERT = '\nINSERT { ' + INSERT + ' } ';

		// 	WHERE += ' ?id a omisc:User . ';
		// 	WHERE += ' BIND(AS ?id ) ';
		// 	WHERE = '\nWHERE { ' + WHERE + ' } ';
		// });
	}

	return {
		create	: _create,
		delete  : _delete,
		login	: _login,
		logout	: _logout,
		get		: _get,
	}
}