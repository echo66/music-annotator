var mongoskin = require('mongoskin');

var db = mongoskin.db('mongodb://localhost/mixcollective-annotations');

var col = db.collection('annotations');

col.insert({ title: "a1" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a2" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a3" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a4" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a5" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a6" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a7" }, {}, function(e, results){ console.log([e, results]); });
col.insert({ title: "a8" }, {}, function(e, results){ console.log([e, results]); });

col.find({} ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
 console.log("conseguiu");
})

db.collection('test').insert({foo: 'bar'}, function(err, result) {
    console.log(result);
    db.collection('test').drop();
    db.close();

});