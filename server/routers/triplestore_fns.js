module.exports = function() {

	var rp = require('request-promise');
	var misc = require('./misc.js');


	{
		'comments' : {
			'count' : function(params) {
				// params: { user, resource }
				var countPromise = new Promise(function(resolve, reject) {
					var SELECT = '', 
						WHERE = '';

					SELECT = 'SELECT COUNT(DISTINCT ?c) '

					WHERE += ' ?c a misc:Comment . '
					WHERE += (params.resource != undefined)? ' ?c misc:for ?resource . ' : '';
					WHERE += (params.user != undefined)? ' ?c dc:creator ?user . ' : '';
					WHERE = '{ ' + WHERE + ' }';

				});
			}
			'search' : function(params) {
				// params: { user, resource }
			}
			'delete' : function(id) {

			}
			'create' : function(params) {
				var creator = params.creator;
				var comment = params.comment;
				var target  = params.target;

				var uuidfn = require('triplestore_fns/uuid.js');
			}
		},
	}
}