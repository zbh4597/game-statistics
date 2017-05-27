var express = require('express');
var router = express.Router();

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
    }, {
        value: 'users/saved/',
        label: '用户留存'
    }]);
    // {
    //     value: 'charge/agent/',
    //     label: '指定平台充值额'
    // }TODO 需要进一步处理
});

module.exports = router;