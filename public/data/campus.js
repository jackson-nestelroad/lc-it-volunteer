const mssql = require('mssql');

const config = {
    user: 'volunteer_tracking',
    password: process.env.CAMPUS_DATA_PASS,
    server: 'mssql01.unity.com',
    database: 'LCDW',
    port: 1433,
    options: {
        encrypt: true,
        debug: true
    }
}

// const pool = new mssql.ConnectionPool(config, err => {
//     if(err){
//         console.log(err);
//     }
// });
// pool.on('error', err => {
//     console.log(err);
// })

var exports = module.exports = {};

// gets campus data 
exports.get = function(){
    return new Promise((resolve, reject) => {
        var conn = new mssql.ConnectionPool(config);
        conn.on('debug', (connection, message) => {
            console.log(message);
        })
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