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
                // volunteers of the same name found
                if(res.rows.length > 1){
                    resolve('duplicate');
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

// checks for a volunteer with this name AND email and returns ID
exports.checkIfRegistered = function(name, email){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT vol_id
                FROM volunteers
                WHERE lower(concat(first_name, ' ', last_name)) = lower('${name}')
                AND email = '${email}';
            `)
            .then(res => {
                // no volunteer found
                if(res.rows.length == 0){
                    resolve(false);
                }
                // volunteer found
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
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var date = new Date();
            var month = date.getMonth();
            var year = date.getFullYear();
            client.query(`
                SELECT c.vol_id, c.first_name, c.last_name, c.hours, f.favorite, f.last_active
                FROM 
                (SELECT volunteers.vol_id, first_name, last_name, SUM(hours) hours
                FROM volunteers
                JOIN 
                        (SELECT *
                        FROM logs
                        WHERE extract(month from date) = ${month}
                        AND extract(year from date) = ${year}) a
                    ON a.vol_id = volunteers.vol_id
                    GROUP BY volunteers.vol_id
                    ORDER BY SUM(hours) DESC
                    LIMIT 10) c
                LEFT OUTER JOIN
                (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name favorite, h.last_active
                FROM
                    (SELECT volunteers.vol_id, SUM(hours) total_hours
                    FROM logs
                    LEFT OUTER JOIN volunteers
                    ON volunteers.vol_id = logs.vol_id
                    GROUP BY volunteers.vol_id
                    HAVING volunteers.vol_id IN
                        (SELECT volunteers.vol_id
                        FROM volunteers
                        JOIN 
                            (SELECT *
                            FROM logs
                            WHERE extract(month from date) = ${month}
                            AND extract(year from date) = ${year}) a
                        ON a.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id
                        ORDER BY SUM(hours) DESC
                        LIMIT 10)
                    ) a
                JOIN
                    (SELECT b.vol_id, b.favorite_team_name, g.last_active
                    FROM
                    (SELECT e.vol_id, name favorite_team_name
                        FROM teams
                        LEFT OUTER JOIN 
                        (SELECT vol_id, mode() within group (order by team_id) temp_id
                        FROM logs
                        WHERE vol_id IN
                            (SELECT volunteers.vol_id
                            FROM volunteers
                            JOIN 
                                (SELECT *
                                FROM logs
                                WHERE extract(month from date) = ${month}
                                AND extract(year from date) = ${year}) a
                            ON a.vol_id = volunteers.vol_id
                            GROUP BY volunteers.vol_id
                            ORDER BY SUM(hours) DESC
                            LIMIT 10)
                        GROUP BY vol_id) e
                        ON e.temp_id = teams.team_id) b
                    JOIN
                    (SELECT volunteers.vol_id, MAX(logs.date) last_active
                    FROM volunteers
                    JOIN logs
                    ON volunteers.vol_id = logs.vol_id
                    WHERE volunteers.vol_id IN
                        (SELECT volunteers.vol_id
                            FROM volunteers
                            JOIN 
                                (SELECT *
                                FROM logs
                                WHERE extract(month from date) = ${month}
                                AND extract(year from date) = ${year}) a
                            ON a.vol_id = volunteers.vol_id
                            GROUP BY volunteers.vol_id
                            ORDER BY SUM(hours) DESC
                            LIMIT 10)
                    GROUP BY volunteers.vol_id) g
                    ON g.vol_id = b.vol_id) h
                ON a.vol_id = h.vol_id) f
                ON f.vol_id = c.vol_id
                ORDER BY c.month_hours DESC;
            `)
            .then(res => {
                resolve(res.rows);
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

// gets all inactive volunteers
exports.getInactive = function(){

}

exports.getByID = function(id){

}

// fetches hours for a certain month
exports.month = function(){

}