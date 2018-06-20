const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true, // required for Heroku connections
    max: 20
});

var exports = module.exports = {};

// searches by full name and returns ID
exports.searchByFullName = function(name){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT vol_id, concat(first_name, ' ', last_name) full_name
                FROM volunteers
                WHERE lower(concat(first_name, ' ', last_name)) = lower('${name}');
            `)
            .then(res => {
                // no volunteer found
                if(res.rows.length == 0){
                    resolve(false);
                }
                // volunteer found, so return the vol_id
                else{
                    resolve(res.rows[0].vol_id);
                }
                client.release();
            })
            .catch(err => {
                console.log(err);
                client.release();
                reject('error');
            })
        })
        .catch(err => {
            console.log(err);
            client.release();
            reject('error');
        })
    })
}

// adds a new volunteer
exports.add = function(first, last, email, phone){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                INSERT INTO volunteers(first_name, last_name, email, phone)
                VALUES('${first}', '${last}', '${email}', '${phone}');
            `)
            .then(res => {
                resolve('success');
            })
            .catch(err => {
                console.log(err);
                reject('error');
            })
        })
        .catch(err => {
            console.log(err);
            client.release();
            reject('error');
        }) 
    })
}

// logs hours to an ID
exports.log = function(date, id, team, hours){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                INSERT INTO logs(date, vol_id, team_id, hours)
                VALUES('${date}', ${id}, ${team}, ${hours});
            `)
            .then(res => {
                resolve('success');
            })
            .catch(err => {
                console.log(err);
                reject('error');
            })
        })
        .catch(err => {
            console.log(err);
            client.release();
            reject('error');
        })
    })
}

// searches by first name
exports.searchByFirstName = function(search){

}

// searches by most active team
exports.searchByTeam = function(team){

}

// searches by date
exports.searchByDate = function(date){

}

// fetches the monthly leaderboard
exports.leaderboard = function(){

}

// fetches hours for a certain month
exports.month = function(){

}

// gets all inactive volunteers
exports.getInactive = function(){

}