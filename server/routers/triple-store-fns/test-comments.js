var endpoint = 'http://localhost:9999/bigdata/namespace/kb/sparql';
var comments = require('./comments.js')(endpoint);


comments.count({resource: '<http://www.mixcollective.com/instances/misc/r1>'})
	.then(function(count){
		console.log(count);
	}).catch(function(error) {
		console.error(error);
	});

comments.create({target: 'imisc:r1', comment: 'primeiro comentário', creator: 'iuser:u1'})
	.then(function(uuid) {
		console.log(uuid);
	})
	.catch(function(error) {
		console.log(error);
	});