var E = 'http://localhost:9999/bigdata/namespace/kb/sparql';
var misc = require('./misc.js')();

function print_error(m) { console.error(m); }
function print_success(m) { console.error(m); }

// for (var i=0; i<100; i++)
// 	misc.create_resource(E, ['omisc:Music']).then(print_success).catch(print_error);

// for (var i=0; i<100; i++)
// 	misc.create_resource(E, ['omisc:Music']).then((IRI)=>{return misc.delete_resource(E, IRI, 'omisc:Music')}).then(print_success).catch(print_error);

// misc.create_resource(E, ['omisc:Music'])
// 	.then((IRI) => {
// 		misc.exists_triple(E, IRI, 'a', 'omisc:Music')
// 			.then(() => {
// 				misc.add_triple(E, IRI, 'dc:title', '"valor 2"^^xsd:string');
// 				misc.add_triple(E, IRI, 'dc:title', '"valor 3"^^xsd:string');
// 			})
// 			.catch(print_error);
// 	})
// 	.catch(print_error);


// for (var k=0; k<100; k++) {
// 	misc.create_resource(E, ['oann:AnnotationsBoard'], 'iannb')
// 			.then((boardIRI) => {
// 				console.log('BOARD : ' + boardIRI);
// 				for (var i=0; i<10; i++) {
// 					misc.create_resource(E, ['oann:AnnotationsTrack'], 'iannt')
// 							.then((trackIRI) => {
// 								console.log('TRACK : ' + trackIRI);
// 								misc.add_triple(E, trackIRI, 'oann:in_board', boardIRI);
// 								misc.add_triple(E, trackIRI, 'dc:title', '"track nº'+ i +'"^^xsd:string');
// 								for (var j=0; j<5; j++) {
// 									misc.create_resource(E, ['oann:Annotation'], 'ianna')
// 											.then((annotationIRI) => {
// 												console.log('ANNOTATION : ' + boardIRI);
// 												misc.add_triple(E, annotationIRI, 'oann:in_board', trackIRI);
// 												misc.add_triple(E, annotationIRI, 'dc:title', '"annotation nº'+ i +'"^^xsd:string');
// 											})
// 											.catch(print_error);
// 								}
// 							})
// 				}
				
// 			})
// 			.catch(print_error);
// }



// var params = {
// 	title: 'track de anotações 1', 
// 	description: 'descrição da track 1',
// 	track: 'iannt:at1',
// 	time: 10, 
// 	duration: 2,
// 	creator: 'iuser:u100'
// };

// misc.create_resource(E, ['oann:Annotation'], 'iannt', [
// 	{ name: 'dc:title', value: 'track de anotações 1', type: 'xsd:string' }, 
// 	{ name: 'dc:description', value: 'descrição da track 1', type: 'xsd:string' }, 
// 	{ name: 'oann:in_track', value: params.track, type: 'oann:AnnotationsTrack', mustExist: true, isResource: true },
// 	{ name: 'oann:time', value: params.time, type: 'xsd:float' },
// 	{ name: 'oann:duration', value: params.duration, type: 'xsd:float' },
// 	{ name: 'dc:creator', value: params.creator, type: 'omisc:User', mustExist: true, isResource: true },
// ]).then().catch();






// misc.create_resource(E, ['omisc:User'], 'iuser', [
// 	{ name: 'omisc:username' , value: 'echo77', type: 'xsd:string' }
// ]).then((triples) => {
// 	misc.compact_triples(triples, misc.context)
// 			.then((userDoc) => {

// 				var params = {
// 					title: 'board de anotações 1', 
// 					description: 'descrição da board 1',
// 					track: 'iannt:ab1',
// 					creator: userDoc['@id'],
// 				};

// 				misc.create_resource(E, ['oann:AnnotationsBoard'], 'iannb', [
// 					{ name: 'dc:title', value: params.title, type: 'xsd:string' }, 
// 					{ name: 'dc:description', value: params.description, type: 'xsd:string' }, 
// 					{ name: 'dc:creator', value: params.creator, type: 'omisc:User', mustExist: true, isResource: true },
// 				]).then((boardDoc) => {



// 				}).catch(print_error);

// 			})
// 			.catch(print_error);
// }).catch(print_error);







// misc.update_resource(E, 'iuser:8dc31657-1c71-411a-b90a-2dd1b6020cec', [
// 	{ name: 'omisc:username', value: 'echo100', unique: true, type: 'xsd:string'}
// ]).then((triples) => {
//     misc.compact_triples(triples, misc.context)
//       .then((doc) => {
//         var jsonld = require('jsonld');
//         jsonld.toRDF(ld, {format: 'application/nquads'}, function(err, nquads) {
//         console.log(nquads);
//         jsonld.fromRDF(nquads, {format: 'application/nquads'}, function(err, doc) {
//     console.log(doc);
//   });
// });
// 			})
// 			.catch(print_error);
// }).catch(print_error);



// misc.create_resource(E, misc.context, 'iannt', ['oann:AnnotationsTrack'], [
//   { prop: 'dc:title', literal: 'title da track a2', type: 'xsd:string' }, 
//   { prop: 'dc:description', literal: 'description da track a2', type: 'xsd:string' }
// ]).then(print_success).catch(print_error);





// misc.create_resource(E, misc.context, 'ianna', ['oann:Annotation'], [
//   { prop: 'dc:title', literal: 'este é o título da anotação a3', type: 'xsd:string' }, 
//   { prop: 'dc:description', literal: 'esta é a descrição da anotação a3', type: 'xsd:string' },
//   { prop: 'oann:in_track', uri: 'iannt:aedd3354-2eed-405d-a9d9-8718d11aa86f' }
// ]).then(print_success).catch(print_error);




// misc.update_resource(E, misc.context, 'ianna:6c4889cf-ea0b-4633-9e61-cf8cb4e20eff', [
//   { prop: 'dc:title', literal: 'este é o título da anotação a1' , delete: true },
//   { prop: 'dc:title', literal: 'título 1' , type: 'xsd:string' }
// ]).then(print_success).catch(print_error);


ctx = misc.clone_context();
// ctx['rdf:type'] = {"@id": "rdf:type", "@type": "@vocab"};
ctx['dc:creation_date'] = { "@type" : "xsd:dateTime" };
misc.get_resources_from_association(E, misc.context, 'iannt:aedd3354-2eed-405d-a9d9-8718d11aa86f', 'oann:in_track', true)
  .then( function(triples) {
    // console.log(triples);

    misc.good_form(triples, ctx)
        .then(print_success);

  })
  .catch(print_error);