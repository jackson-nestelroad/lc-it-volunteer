const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true // required for Heroku connections
});

var exports = module.exports = {};

// searches by full name and returns ID
exports.searchByFullName = function(){

}

// logs hours to an ID
exports.log = function(id, hours){

}

// searches by first name
exports.searchByFirstName = function(search){
    client.connect();
    client.query(`
        SELECT *
        FROM volunteers;
    `)
    .then(res => {
        console.log(res);
        console.log(client);
    })
    .catch(err => console.error(error.stack))
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