var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/cq01';

router.get('/', function(req, res, next) {
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        if (err) next(err);
        console.log('连接成功！');
        console.log(db);
        var collection = db.collection('charge');
        res.json({ a: 1 });
    });
});

module.exports = router;