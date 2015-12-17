// require libraries
Promise = require('bluebird');
request = Promise.promisifyAll(require('request'));

// create ajax function for sending requests
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data,
    }).then(function(res) {
        return new Promise(function(resolve) {
            resolve(res.body);
        });
    });
};

// init jassa with loaded Promise and ajax request function
window = {};
require('/home/echo66/html/music-annotator/server/Jassa-Core/lib/jassa.js');
var jassa = new window.Jassa(Promise, ajax);
// _ = require('underscore');


var vocab = jassa.vocab;
var rdf = jassa.rdf;
var sparql = jassa.sparql;
var service = jassa.service;
var sponate = jassa.sponate;
var facete = jassa.facete;
var util = jassa.util;

var langs = ['de', 'en'];
var searchMode = 'fulltext';
var searchString = 'Chateau';

var prefixes = {
    'dbpedia-owl': 'http://dbpedia.org/ontology/',
    'dbpedia': 'http://.org/resource/',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'foaf': 'http://xmlns.com/foaf/0.1/'
};

/*
 * Set up the sparql service with as many buffs (decorations) as we like
 */
//var sparqlService = new service.SparqlServiceHttp('http://lod.openlinksw.com/sparql', ['http://dbpedia.org'], {type: 'POST'});
var sparqlService = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org'], {type: 'POST'});
sparqlService = new service.SparqlServiceCache(sparqlService);
sparqlService = new service.SparqlServiceVirtFix(sparqlService);
sparqlService = new service.SparqlServicePaginate(sparqlService, 1000);
sparqlService = new service.SparqlServicePageExpand(sparqlService, 100);


/*
 * Set up the Sponate mapping for the data we are interested in
 */
var store = new sponate.StoreFacade(sparqlService, {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'dbpedia-owl': 'http://dbpedia.org/ontology/',
    'foaf': 'http://xmlns.com/foaf/0.1/'
});


var labelConfig = new sparql.BestLabelConfig(langs);
var labelTemplate = sponate.MappedConceptUtils.createMappedConceptBestLabel(labelConfig);
var commentTemplate = sponate.MappedConceptUtils.createMappedConceptBestLabel(new sparql.BestLabelConfig(langs, [rdf.NodeFactory.createUri('http://dbpedia.org/ontology/abstract')]));

store.addMap({
    name: 'castles',
    template: [{
        id: '?s',
        label: { $ref: { target: labelTemplate, attr: 'displayLabel' }},
        comment: { $ref: { target: commentTemplate, attr: 'displayLabel' }},
        depiction: '?d',
        owners: [{
            id: '?o',
            name: '?on'
        }]
    }],
    from:  '?s a dbpedia-owl:Castle .' 
   		 + '?s dbpedia-owl:owner ?o .'
         + '?o rdfs:label ?on .'
         + 'Optional { ?s foaf:depiction ?d }'
});


/*
 * Create a list service for our mapping and decorate it with
 * keyword search support
 */
var listService = store.castles.getListService();

listService = new service.ListServiceTransformConcept(listService, function(searchString) {

    var searchConfig = new sparql.BestLabelConfig(langs, [rdf.NodeFactory.createUri('http://dbpedia.org/ontology/abstract'), vocab.rdfs.label]);

    var result;
    if(searchString == null || searchString.trim() === '') {
        result = null;
    } else {
        var labelRelation = sparql.LabelUtils.createRelationPrefLabels(searchConfig);

        switch(searchMode) {
        case 'regex':
            result = sparql.KeywordSearchUtils.createConceptRegexLabelOnly(labelRelation, searchString);
            break;
        case 'fulltext':
            result = sparql.KeywordSearchUtils.createConceptBifContains(labelRelation, searchString);
            break;
        default:
            throw new Error('Unknown search mode: ', searchMode);
        }
    }

    return result;
});

listService.fetchItems(searchString, 5, 0).then(function(items) { console.log(items); });