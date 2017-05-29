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

router.get('/playerInfo', function(req, res, next) {
    var title = '玩家信息';

    var db = req.db;
    var playerInfo = req.collection('playerInfo');
});

module.exports = router;