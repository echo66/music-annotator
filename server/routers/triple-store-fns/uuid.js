module.exports = function(endpoint) {

	var rp = require('request-promise');
	var _endpoint = endpoint;

	return {
		'create' : function() {
			var p = new Promise(function(resolve, reject) {
				rp(_endpoint + '?uuid')
					.then(function(uuid) {
						resolve(uuid);
					})
					.catch(function(error) {
						reject(error);
					})
			});
			return p;
		}
	}
}