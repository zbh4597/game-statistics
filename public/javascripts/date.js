(function(module) {
    //日期选择
    $.datepicker.regional['zh-CN'] = {
        clearText: '清除',
        clearStatus: '清除已选日期',
        closeText: '关闭',
        closeStatus: '不改变当前选择',
        prevText: '<上月',
        prevStatus: '显示上月',
        prevBigText: '<<',
        prevBigStatus: '显示上一年',
        nextText: '下月>',
        nextStatus: '显示下月',
        nextBigText: '>>',
        nextBigStatus: '显示下一年',
        currentText: '今天',
        currentStatus: '显示本月',
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        monthNamesShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        monthStatus: '选择月份',
        yearStatus: '选择年份',
        weekHeader: '周',
        weekStatus: '年内周次',
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
        dayStatus: '设置 DD 为一周起始',
        dateStatus: '选择 m月 d日, DD',
        dateFormat: 'yy-m-d',
        firstDay: 1,
        initStatus: '请选择日期',
        isRTL: false
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);

    var a = 0;
    var tmpdate = "";

    /**
     * 实例化日期控件，并绑定回调函数，传入相应参数
     * tagId 日期控件实例化的标签id
     * ajaxMethod 回调函数
     * ajaxMethod 函数需要用到的额外参数
     **/
    function datePickerById(tagId, callback) {
        $(tagId).datepicker({
            isDataChecked: true,
            autoClose: true,
            showOtherMonths: true,
            changeYear: true,
            //showStatus: true,
            //showOn: "both",
            numberOfMonths: 2, //显示几个月
            showMonthAfterYear: true,
            onSelect: function(dateText, inst) { //选择日期后执行的操作
                a++;
                inst.autoClose = true;
                if (a == 1) {
                    inst.settings.isDataChecked = false;
                    tmpdate = dateText;
                }
                if (a == 2) {
                    a = 0;
                    inst.settings.isDataChecked = false;
                    inst.autoClose = false;
                    var date1 = new Date(tmpdate).getTime();
                    var date2 = new Date(dateText).getTime();

                    var arg = {
                        time_s: date1,
                        time_e: date2
                    }; //ajax函数要用到的时间参数

                    if (date1 < date2) {
                        $(tagId).val(tmpdate.replace(/-/ig, "-") + "至" + dateText.replace(/-/ig, "-"));
                        //执行回调。将选择好的两个日期传入回调函数。
                        callback(tmpdate.replace(/-/ig, "-"), dateText.replace(/-/ig, "-"));
                    } else if (date1 == date2) {
                        a = 1;
                        inst.settings.isDataChecked = false;
                        inst.autoClose = true;
                    } else {
                        $(tagId).val(dateText.replace(/-/ig, "-") + "至" + tmpdate.replace(/-/ig, "-"));
                        //执行回调。将选择好的两个日期传入回调函数。
                        callback(dateText.replace(/-/ig, "-"), tmpdate.replace(/-/ig, "-"));
                    }


                }

            }
        });
    }

    var mydate = {};
    mydate.select = function(elem, callback) {
        datePickerById(elem, callback);
    };
    module.mydate = mydate;
})(window)