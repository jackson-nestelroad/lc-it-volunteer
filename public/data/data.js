const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true // required for Heroku connections
});

var exports = module.exports = {};

// searches by first name
searchByFirstName = function(){
    client.connect();

    client.query(`
        SELECT *
        FROM volunteers;
    `, (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
          console.log(JSON.stringify(row));
        }
        client.end();
    });
}