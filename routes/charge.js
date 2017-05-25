var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.collection('charge');
    var cursor = collection.aggregate([{
            $match: {
                $and: [
                    { state: 1 },
                    { agent: "Test" },
                    { time: { $gte: "2017-5-26" } },
                    { time: { $lt: "2017-5-27" } }
                ]
            }
        },
        { $group: { _id: "$agent", total: { $sum: "$yuan" } } }
    ]);
    cursor.toArray(function(err, docs) {
        res.json(docs);
    })
});

module.exports = router;