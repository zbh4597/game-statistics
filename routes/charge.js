var express = require('express');
var router = express.Router();
var utils = require('../utils');
var COLLECTION = 'charge';

router.get('/totalAmount/:startDate/:endDate', function(req, res, next) {
    var title = '日总充值金额';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
            $match: {
                $and: [
                    { state: 1 },
                    { time: { $gte: startDateStr } },
                    { time: { $lt: tempDateStr } }
                ]
            }
        }, { $group: { _id: "", total: { $sum: "$yuan" } } }];
    });
});

router.get('/agent/:agent/:startDate/:endDate', function(req, res, next) {
    var title = '指定平台充值额';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
            $match: {
                $and: [
                    { state: 1 },
                    { agent: req.params['agent'] },
                    { time: { $gte: startDateStr } },
                    { time: { $lt: tempDateStr } }
                ]
            }
        }, { $group: { _id: "", total: { $sum: "$yuan" } } }];
    });
});

router.get('/unfinishOrder/:startDate/:endDate', function(req, res, next) {
    var title = '未完成订单数';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
                $match: {
                    $and: [
                        { state: 1 },
                        { time: { $gte: startDateStr } },
                        { time: { $lt: tempDateStr } }
                    ]
                }
            },
            { $group: { _id: "", total: { $sum: 1 } } }
        ];
    });
});

router.get('/playerNum/:startDate/:endDate', function(req, res, next) {
    var title = '充值人数（按角色去除重复）';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
                $match: {
                    $and: [
                        { state: 1 },
                        { time: { $gte: startDateStr } },
                        { time: { $lt: tempDateStr } }
                    ]
                }
            },
            { $group: { _id: "$playerId", total: { $sum: 1 } } }
        ];
    });
});

router.get('/times/:startDate/:endDate', function(req, res, next) {
    var title = '充值次数';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
                $match: {
                    $and: [
                        { state: 1 },
                        { time: { $gte: startDateStr } },
                        { time: { $lt: tempDateStr } }
                    ]
                }
            },
            { $group: { _id: "", total: { $sum: 1 } } }
        ];
    });
});

router.get('/firstNum/:startDate/:endDate', function(req, res, next) {
    var title = '首充人数';

    utils.doFetch(req, res, next, title, COLLECTION, function(startDateStr, tempDateStr) {
        return [{
                $match: {
                    $and: [
                        { state: 1 },
                        { bindIngot: { $gt: 0 } },
                        { time: { $gte: startDateStr } },
                        { time: { $lt: tempDateStr } }
                    ]
                }
            },
            { $group: { _id: "$playerId", total: { $sum: 1 } } }
        ];
    });
});

module.exports = router;