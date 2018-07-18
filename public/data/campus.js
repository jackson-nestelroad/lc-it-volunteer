// get campus data from Life.Church Data Warehouse

const mssql = require('mssql');

const config = {
    user: 'volunteer_tracking',
    password: process.env.CAMPUS_DATA_PASS,
    server: 'mssql01.unity.com',
    database: 'LCDW',
    port: '1433'
}

var exports = module.exports = {};

// gets campus data 
exports.get = function(){
    return new Promise((resolve, reject) => {
        var conn = new mssql.ConnectionPool(config);
        conn.connect().then(function(){
            var request = new mssql.Request(conn);
            request.query(`
                SELECT [CampusKey]
                        ,[CampusDurableKey]
                        ,[CampusCode]
                        ,[Name]
                        ,[State]
                    FROM [LCDW].[Dimension].[Campus]
                    WHERE [LCDW].[Dimension].[Campus].[RowIsCurrent] = 'Y'
                    ORDER BY [LCDW].[Dimension].[Campus].[Name];
            `)
            .then(res => {
                resolve(res.recordset);
                conn.close();
            })
            .catch(err => {
                console.log(err);
                conn.close();
                reject('error');
            })
        })
        .catch(err => {
            console.log(err);
            reject('error');
        })
    })
}