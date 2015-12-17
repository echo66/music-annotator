var MongoClient = require('mongodb').MongoClient;

var col;
var db

MongoClient.connect("mongodb://localhost:27017/mixcollective-annotations", function(err, _db) {
  if(!err) {
    console.log("We are connected");
    db = _db;
    col = db.collection('annotations');
  }
});