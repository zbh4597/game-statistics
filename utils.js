function doFetch(req, res, next, title, collection, aggregation) {

    var db = req.db;
    var collection = db.collection(collection);

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
        var tempDateStr = tempDate.toLocaleDateString('zh-CN').replace(/\//g, '-');

        var cursor = collection.aggregate((function(startDateStr, tempDateStr) {
            return aggregation(startDateStr, tempDateStr);
        })(startDateStr, tempDateStr));

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
                var aDate = new Date(a.date),
                    bDate = new Date(b.date);
                if (aDate < bDate)
                    return -1;
                else if (aDate > bDate)
                    return 1;
                else
                    return 0;
            });
            var labels = [],
                data = [];
            for (var i = 0; i < result.length; i++) {
                var aResult = result[i];
                labels.push(aResult.date);
                data.push(aResult.total);
            }
            res.json({ title: title, labels: labels, data: data });
        } else {
            setTimeout(checkFlag, 1000);
        }
    }
    setTimeout(checkFlag, 1000);
}

module.exports = {
    doFetch: doFetch
};