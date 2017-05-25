var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://127.0.0.1:27017/cq01';

/* GET users listing. */
router.get('/:startDate/:endDate', function(req, res, next) {
    var db = req.db;
    var collection = db.collection('charge');

    var startDate = req.params['startDate'];
    var endDate = req.params['endDate'];
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    endDate.setDate(endDate.getDate() + 1); //包含结束日期

    var count = startDate.getDate() + 1;
    var result = [];
    var index = 0;
    while (startDate.toString() != endDate.toString()) {
        var tempDate = new Date(startDate.getTime());
        tempDate.setDate(tempDate.getDate() + 1);
        var startDateStr = startDate.toLocaleDateString('zh-CN').replace(/\//g, '-');
        var cursor = collection.aggregate([{
            $match: {
                $and: [
                    { state: 1 },
                    { time: { $gte: startDateStr } },
                    { time: { $lt: tempDate.toLocaleDateString('zh-CN').replace(/\//g, '-') } }
                ]
            }
        }, { $group: { _id: "", total: { $sum: "$yuan" } } }]);
        cursor.next((function(index, startDateStr) {
            return function(err, doc) {
                if (err) next(err);

                if (doc)
                    result.push({ date: startDateStr, total: doc.total });
                else
                    result.push({ date: startDateStr, total: 0 });
            };
        })(index, startDateStr));
        startDate.setDate(count++);
        index++;
    }
    var checkFlag = function() {
        if (result.length === index) {
            result.sort(function(a, b) {
                if (a.date < b.date)
                    return -1;
                else if (a.date > b.date)
                    return 1;
                else
                    return 0;
            });
            res.json(result);
        } else {
            setTimeout(checkFlag, 1000);
        }
    }
    setTimeout(checkFlag, 1000);
});

module.exports = router;