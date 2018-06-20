const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true // required for Heroku connections
});

var exports = module.exports = {};

// searches by full name and returns ID
exports.searchByFullName = function(name){
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
                client.query(`
                    SELECT vol_id, concat(first_name, ' ', last_name) full_name
                    FROM volunteers
                    WHERE lower(concat(first_name, ' ', last_name)) = lower(${name});
                `)
                .then(res => {
                    if(res.rows.length == 0){
                        resolve(false);
                    }
                    else{
                        console.log(res.rows[0]);
                    }
                    client.end();
                })
                .catch(err => {
                    console.error(err);
                    client.end();
                    reject('error');
                })
            })
            .catch(err => {
                client.end();
                reject('error');
            })
    })
}

// logs hours to an ID
exports.log = function(id, hours){

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

// adds a new volunteer
exports.add = function(){

}

// gets all inactive volunteers
exports.getInactive = function(){

}