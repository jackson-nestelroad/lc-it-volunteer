const mssql = require('mssql');

const config = {
    user: 'volunteer-tracking',
    password: process.env.CAMPUS_DATA_PASS,
    server: 'mssql01.unity.com',
    database: 'LCDW',
    pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
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
    return new Promise((reject, resolve) => {
        mssql.connect(config, err => {
            if(err){
                console.log(err);
                reject('error');
            }
            else{
                new mssql.Request().query(`
                
                `, (err, res) => {
                    if(err){
                        console.log(err);
                        reject('error');   
                    }
                    else{
                        console.log(res);
                        reject('error');
                    }
                })
            }
        })
        mssql.on('error', err => {
            console.log('err');
            reject('error');
        })
    })
}