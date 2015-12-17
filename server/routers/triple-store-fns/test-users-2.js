var E = 'http://localhost:9999/bigdata/namespace/kb/sparql';
var misc = require('./misc.js')();

function print_error(m) { console.error(m); }
function print_success(m) { console.error(m); }

for (var i=0; i<100; i++) {
	misc.create_resource(E, ['omisc:User'])
}


misc.create_resource(E, ['oann:AnnotationsBoard'])
		.then((boardIRI) => {
			// console.log('New board: ' + boardIRI);
			for (var i=0; i<10; i++) {
				misc.create_resource(E, ['oann:AnnotationsTrack'])
						.then((trackIRI) => {
							// console.log('New track: ' + trackIRI);
							misc.add_triple(E, trackIRI, )
							misc.add_triple(E, trackIRI, 'oann:in_board', boardIRI);
						})
			}
			
		})
		.catch(print_error);