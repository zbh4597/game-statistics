var express = require('express');
var router = express.Router();
var utils = require('../utils');
var COLLECTION = 'user';

router.get('/newAdd/:startDate/:endDate', function(req, res, next) {
    var title = '日新增用户数';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        var agent = req.query['agent'];
        var query;
        if (agent) {
            query = [{
                    $match: {
                        $and: [
                            { agent: agent },
                            { registerTime: { $gte: startDateStr } },
                            { registerTime: { $lt: tempDateStr } }
                        ]
                    }
                },
                { $count: "total" }
            ];
        } else {
            query = [{
                    $match: {
                        $and: [
                            { registerTime: { $gte: startDateStr } },
                            { registerTime: { $lt: tempDateStr } }
                        ]
                    }
                },
                { $count: "total" }
            ];
        }
        return query;
    });
});

/*router.get('/saved/:startDate/:endDate', function(req, res, next) {
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
});*/

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

router.get('/saved/:date/:xday', function(req, res, next) {
    var title = '用户留存';

    var xday = +req.params['xday'],
        date = req.params['date'].split('-');
    var db = req.db,
        collection = db.collection('dayLogin');

    var year = +date[0],
        month = +date[1],
        day = +date[2];
    var sum = 0,
        sum2 = 0,
        doneCount = 0;

    var cursor = collection.find({ year: year, month: month, day: day });
    cursor.toArray(function(err, docs) {
        if (err) next(err);

        sum = docs.length;

        date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + xday);

        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        for (var i = 0; i < sum; i++) {
            var doc = docs[i];
            var playerId = +doc.playerId;

            cursor = collection.find({ playerId: playerId, year: year, month: month, day: day });

            cursor.count(function(err, count) {
                doneCount++;
                sum2 += count;
            });
        }
    });

    var checkFlag = function() {
        if (sum === doneCount) {
            var savedPercent = 0;
            if (sum != 0) {
                savedPercent = sum2 / sum;
            }
            res.json({ savedPercent: (savedPercent * 100).toFixed(2) + '%' });
        } else {
            setTimeout(checkFlag, 1000);
        }
    }
    setTimeout(checkFlag, 1000);
});

router.get('/saved2/:date/:xdays', function(req, res, next) {
    var title = '用户留存';

    var xdays = req.params['xdays'].split('-'),
        date = req.params['date'].split('-');
    var db = req.db,
        collection = db.collection('dayLogin');

    var year = +date[0],
        month = +date[1],
        day = +date[2];
    var sum = 0,
        sum2 = [],
        doneCount = [];

    var cursor = collection.find({ year: year, month: month, day: day });
    cursor.toArray(function(err, docs) {
        if (err) next(err);

        sum = docs.length;
        for (var i = 0; i < xdays.length; i++) {
            doneCount[i] = 0;
            sum2[i] = 0;

            var xday = +xdays[i];
            date = new Date(year, month - 1, day);
            date.setDate(date.getDate() + xday);

            var ayear = date.getFullYear();
            var amonth = date.getMonth() + 1;
            var aday = date.getDate();
            for (var j = 0; j < sum; j++) {
                var doc = docs[j];
                var playerId = +doc.playerId;

                cursor = collection.find({ playerId: playerId, year: ayear, month: amonth, day: aday });

                cursor.count((function(i) {
                    return function(err, count) {
                        doneCount[i]++;
                        sum2[i] += count;
                    };
                })(i));
            }
        }
    });

    var lastIndex = 0;
    var checkFlag = function() {
        for (var i = lastIndex; i < doneCount.length; i++, lastIndex++) {
            if (sum !== doneCount[i]) {
                break;
            }
        }
        if (lastIndex === doneCount.length) {
            var savedPercents = [];
            for (var i = 0; i < sum2.length; i++) {
                var savedPercent = 0;
                if (sum != 0) {
                    savedPercent = sum2[i] / sum;
                }
                savedPercents.push((savedPercent * 100).toFixed(2) + '%');
            }

            res.json(savedPercents);
        } else {
            setTimeout(checkFlag, 1000);
        }
    }
    setTimeout(checkFlag, 1000);
});

router.get('/lev/:startZhuan/:endZhuan/:startLevel/:endLevel', function(req, res, next) {
    var title = '等级统计';

    utils.doFetch2(req, res, next, title, 'playerInfo', function(zhuan, level) {
        return [{
                $match: {
                    $and: [
                        { zhuan: zhuan },
                        { level: level }
                    ]
                }
            },
            { $count: "total" }
        ];
    });
});

module.exports = router;