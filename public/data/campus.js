const mssql = require('mssql');

const config = {
    user: 'volunteer_tracking',
    password: process.env.CAMPUS_DATA_PASS,
    server: '10.5.1.235',
    database: 'LCDW',
    port: 1433,
    options: {
        encrypt: true,
        trustedConnection: true
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
        // mssql.connect(config, err => {
        //     if(err){
        //         console.log(err);
        //         reject('error');
        //     }
        //     else{
        //         new mssql.Request().query(`
        //             SELECT [CampusKey]
        //                 ,[CampusDurableKey]
        //                 ,[CampusCode]
        //                 ,[Name]
        //                 ,[State]
        //             FROM [LCDW].[Dimension].[Campus]
        //             WHERE [LCDW].[Dimension].[Campus].[RowIsCurrent] = 'Y'
        //             ORDER BY [LCDW].[Dimension].[Campus].[Name];
        //         `, (err, res) => {
        //             if(err){
        //                 console.log(err);
        //                 reject('error');   
        //             }
        //             else{
        //                 console.log(res);
        //                 reject('error');
        //             }
        //         })
        //     }
        // })
        // mssql.on('error', err => {
        //     console.log('err');
        //     reject('error');
        // })
    })
}