var express = require('express');
var router = express.Router();
var utils = require('../utils');
var COLLECTION = 'user';

router.get('/newAdd/:startDate/:endDate', function(req, res, next) {
    var title = '日新增用户数';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
                $match: {
                    $and: [
                        { registerTime: { $gte: startDateStr } },
                        { registerTime: { $lt: tempDateStr } }
                    ]
                }
            },
            { $count: "total" }
        ];
    });
});

router.get('/saved/:startDate/:endDate', function(req, res, next) {
    var title = '用户留存';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        var startDate = new Date(startDateStr);
        startDate.setDate(startDate.getDate() - 1);
        var lastDateOfStartStr = startDate.toLocaleDateString('zh-CN').replace(/\//g, '-');
        return [{
                $match: {
                    $and: [
                        { registerTime: { $gte: lastDateOfStartStr } },
                        { registerTime: { $lt: startDateStr } },
                        { lastTime: { $gte: startDateStr } },
                        { lastTime: { $lt: tempDateStr } }
                    ]
                }
            },
            { $count: "total" }
        ];
    });
});

router.get('/playerInfo/:skip/:limit/:startDate/:endDate', function(req, res, next) {
    var title = '玩家信息';

    var skip = +req.params['skip'],
        limit = +req.params['limit'],
        startDate = req.params['startDate'],
        endDate = req.params['endDate'];

    var db = req.db,
        playerInfoColl = db.collection('playerInfo'),
        chargeColl = db.collection('charge');

    var result = {},
        size = 0;
    result.data = [];

    playerInfoColl.find({}).toArray(function(err, docs) {
        if (err) next(err);

        size = docs.length;
        result.size = size;

        for (var i = 0; i < docs.length; i++) {
            var aResult = {};
            var doc = docs[i];

            Object.assign(aResult, doc);

            var playerId = doc.playerId;
            chargeColl.aggregate([{
                    $match: {
                        $and: [
                            { state: 1 },
                            { playerId: +playerId },
                            { time: { $gte: startDate } },
                            { time: { $lt: endDate } }
                        ]
                    }
                },
                { $group: { _id: "", total: { $sum: "$yuan" } } }
            ]).next((function(aResult) {
                return function(err, doc) {
                    if (err) next(err);

                    //充值金额
                    var chargeTotal;
                    if (doc)
                        chargeTotal = doc.total;
                    else
                        chargeTotal = 0;
                    aResult.chargeTotal = chargeTotal;
                };
            })(aResult));
            result.data.push(aResult);
        }
    });

    var index = 0;
    var checkFlag = function() {
        for (var i = index; i < result.data.length; i++, index++) {
            if (result.data[i].chargeTotal === undefined) {
                break;
            }
        }
        if (result.data.length === index) {
            result.data.sort(function(a, b) {
                if (+a.chargeTotal > +b.chargeTotal) {
                    return -1;
                } else if (+a.chargeTotal < +b.chargeTotal) {
                    return 1;
                } else {
                    return 0;
                }
            });
            //分页
            if (skip < 0) skip = 0; //默认第1页
            if (skip > size - 1) skip = size - limit;
            if (limit <= 0) limit = 10; //默认页大小为10
            if (limit >= size) limit = size;

            res.json({ size: result.size, data: result.data.slice(skip, skip + limit) });
        } else {
            setTimeout(checkFlag, 1000);
        }
    }
    setTimeout(checkFlag, 1000);
});

module.exports = router;