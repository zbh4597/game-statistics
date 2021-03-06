var express = require('express');
var router = express.Router();
var utils = require('../utils');

router.get('/functionList', function(req, res, next) {
    res.json([{
        value: 'charge/totalAmount/',
        label: '日总充值金额'
    }, {
        value: 'charge/unfinishOrder/',
        label: '未完成订单数'
    }, {
        value: 'charge/playerNum/',
        label: '充值人数（按角色去除重复）'
    }, {
        value: 'charge/times/',
        label: '充值次数'
    }, {
        value: 'charge/firstNum/',
        label: '首充人数'
    }, {
        value: 'users/newAdd/',
        label: '日新增用户数'
    }]);
});

//获取开服日期
router.get('/severStartTime', function(req, res, next) {
    var db = req.db;
    var collection = db.collection('gameConfig');
    collection.findOne({}, {}, function(err, doc) {
        if (err) next(err);
        res.json({ serverStartTime: utils.formatDate(new Date(doc.severStartTime * 1000)) });
    });
});

router.get('/agents', function(req, res, next) {
    var db = req.db;
    var collection = db.collection('user');
    collection.distinct('agent', function(err, doc) {
        if (err) next(err);
        res.json({ agents: doc });
    });
});

module.exports = router;