var mssql = require('mssql');

module.exports = (app) => {
    app.route('/api/ussd/discharged')
        .get((req, res) => {

            const mobile = req.query.mobile;
            const sessionid = req.query.sessionid;
            const call = req.query.call;
            const containerNo = call;

            if (mobile == null || sessionid == null || call == null) {
                res.send('خطا در کد کانتینر ارسال شده توسط کاربر');
            }

            runQuery(estelamTakhliehQuery(containerNo))
                .then(result => {
                    console.log(JSON.stringify(result));
                    var response = '';
                    if (result.rowsAffected == 0)
                        res.send(`تا کنون تخلیه نشده است ${containerNo} کانتینر شماره`);
                    else {
                        const record = result.recordset[0];
                        res.json(record);
                    }
                })
                .catch(err => {
                    console.log(`error:${err}`);
                    res.send('خطا در سامانه ، لطفا مجددا تلاش بفرمایید.');
                });
        });

    function runQuery(queryString) {
        return new Promise((resolve, reject) => {
            var connection = mssql.connect(connectionConfig)
                .then(pool => {
                    return pool.request()
                        .query(queryString).then(result => {
                            mssql.close();
                            resolve(result);
                        })
                })
                .catch(err => {
                    mssql.close();
                    reject(err);
                })
        });
    }

    const connectionConfig = {
        user: 'ussd',
        password: 'Www.bpm0.ir',
        server: '10.1.1.25',
        database: 'CCS',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }

    function estelamTakhliehQuery(containerNo) {
        var query = `SELECT TOP (1) dbo.DischargeTally.ContainerNumber, dbo.Voyage.arrivalTime, dbo.Voyage.vesselName, dbo.Voyage.shippingAgent, dbo.DischargeList.DischargeDate, dbo.Voyage.portOfLoadingID, 
        dbo.Voyage.portOfDischargeID
        FROM dbo.DischargeTally INNER JOIN
        dbo.DischargeList ON dbo.DischargeTally.DischargeID = dbo.DischargeList.DischargeListID INNER JOIN
        dbo.Voyage ON dbo.DischargeList.VoyageID = dbo.Voyage.voyageID
        GROUP BY dbo.DischargeTally.ContainerNumber, dbo.Voyage.departureDate, dbo.Voyage.arrivalTime, dbo.Voyage.vesselName, dbo.Voyage.shippingAgent, dbo.DischargeList.DischargeDate, dbo.Voyage.portOfLoadingID, 
        dbo.Voyage.portOfDischargeID
        HAVING (dbo.DischargeTally.ContainerNumber = N'${containerNo}')
        ORDER BY dbo.Voyage.departureDate DESC`;
        return query;
    }
}
