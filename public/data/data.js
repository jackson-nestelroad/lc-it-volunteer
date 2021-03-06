// communicates with the volunteer database

const { Pool } = require('pg');

const pool = new Pool({
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    host: process.env.PGHOST,
    max: 20
})

// connection string used with Heroku

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true,
//     max: 20
// })

var exports = module.exports = {};


// deletes the tables
exports.delete = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                DROP TABLE volunteers, logs, teams;
            `)
            .then(res => {
                resolve('success');
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
            reject('error');
        }) 
    })
}

// builds the database tables
exports.build = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                 CREATE TABLE IF NOT EXISTS volunteers(
                     vol_id serial PRIMARY KEY,
                     first_name VARCHAR(255) NOT NULL,
                     last_name VARCHAR(255) NOT NULL,
                     email VARCHAR(255) UNIQUE NOT NULL,
                     phone VARCHAR(255) NOT NULL,
                     team integer NOT NULL,
                     campus VARCHAR(255) NOT NULL,
                     active boolean NOT NULL
                 );  
            `)
             .then(res => {
                 client.release();
             })
             .catch(err => {
                 console.log(err);
                 client.release();
             })
        })
        pool.connect()
        .then(client => {
            client.query(`
                 CREATE TABLE IF NOT EXISTS logs(
                     log_id serial PRIMARY KEY,
                     date DATE NOT NULL,
                     vol_id integer NOT NULL,
                     team_id integer NOT NULL,
                     hours integer NOT NULL,
                     staff VARCHAR(255),
                     notes VARCHAR(1000)
                 );
            `)
             .then(res => {
                 client.release();
             })
             .catch(err => {
                 console.log(err);
                 client.release();
             })
        })
        pool.connect()
        .then(client => {
            client.query(`
                 CREATE TABLE IF NOT EXISTS teams(
                     team_id integer UNIQUE NOT NULL,
                     name VARCHAR(255) NOT NULL,
                     full_name VARCHAR(255) NOT NULL
                 );
            `)
             .then(res => {
                 client.query(`
                     INSERT INTO teams(team_id, name, full_name)
                     VALUES(1, 'Hardware', 'Hardware and Infrastructure Support'),
                             (2, 'Software', 'Software and User Support'),
                             (3, 'Database', 'Database Operations'),
                             (4, 'Project', 'Project Manager'),
                             (5, 'Admin', 'Administration'),
                             (6, 'Develop', 'Develop Operations'),
                             (7, 'Social', 'Social Media'),
                             (8, 'Launch', 'Campus Launch');
                 `)
                 .then(res => {
                     client.release();
                 })
                 .catch(err => {
                     console.log(err);
                     client.release();
                 })
             })
             .catch(err => {
                 console.log(err);
                 client.release();
             })
        })
        resolve([]);   
    }) 
 }

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
            reject('error');
        })
    })
}


// adds a new volunteer
exports.add = function(first, last, email, phone, team, campus){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                INSERT INTO volunteers(first_name, last_name, email, phone, team, campus, active)
                VALUES('${first}', '${last}', '${email}', '${phone}', '${team}', '${campus}', TRUE);
            `)
            .then(res => {
                resolve('success');
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
            reject('error');
        })
    })
}

// gets the last Sunday and upcoming Saturday
function getWeek(){
    var now = new Date();
    var start = new Date(now.setTime(now.getTime() - now.getDay() * 86400000));
    var end = new Date((start.getTime() + 6 * 86400000));
    var week = [];
    week.push(`${start.getMonth()+1}/${start.getDate()}/${start.getFullYear()}`);
    week.push(`${end.getMonth()+1}/${end.getDate()}/${end.getFullYear()}`);
    return week;
}

// goes back in time to return a date string (mm/dd/yyyy)
function subtractDays(number){
    var now = new Date();
    var then =  new Date((now.getTime() - number * 86400000));
    return `${then.getMonth()+1}/${then.getDate()}/${then.getFullYear()}`;
}

// order options for search page
const orders = [
    'first_name, last_name',
    'campus',
    'week DESC NULLS LAST',
    'total DESC NULLS LAST',
    'preferred',
    'last_active DESC NULLS LAST'
]

// searches by first name
exports.searchByFirstName = function(search, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            var inactiveDate = subtractDays(90);
            client.query(`
                WITH 
                    inactive AS
                        (SELECT logs.vol_id
                        FROM logs
                        GROUP BY logs.vol_id
                        HAVING MAX(date) < '${inactiveDate}'),
                    query AS
                        (SELECT vol_id
                        FROM volunteers
                        WHERE lower(first_name) LIKE '${search}%'
                        AND vol_id NOT IN (SELECT vol_id FROM inactive)
                        AND active IS TRUE),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// searches by last name
exports.searchByLastName = function(search, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            var inactiveDate = subtractDays(90);
            client.query(`
                WITH 
                    inactive AS
                        (SELECT logs.vol_id
                        FROM logs
                        GROUP BY logs.vol_id
                        HAVING MAX(date) < '${inactiveDate}'),
                    query AS
                        (SELECT vol_id
                        FROM volunteers
                        WHERE lower(last_name) LIKE '${search}%'
                        AND vol_id NOT IN (SELECT vol_id FROM inactive)
                        AND active IS TRUE),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// searches by most active OR preferred team
exports.searchByTeam = function(team, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            var inactiveDate = subtractDays(90);
            client.query(`
                WITH 
                    inactive AS
                        (SELECT logs.vol_id
                        FROM logs
                        GROUP BY logs.vol_id
                        HAVING MAX(date) < '${inactiveDate}'),
                    query AS
                        (SELECT vol_id
                        FROM volunteers
                        WHERE vol_id IN
                            ((SELECT vol_id
                            FROM logs
                            GROUP BY vol_id
                            HAVING mode() within group (order by team_id) = ${team})
                            UNION 
                            (SELECT vol_id
                            FROM volunteers
                            WHERE team = ${team}))
                        AND vol_id NOT IN (SELECT vol_id FROM inactive)
                        AND active IS TRUE),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// searches by date
exports.searchByDate = function(date, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            client.query(`
                WITH query AS
                        (SELECT volunteers.vol_id, 
                        SUM(hours) hours, 
                        mode() within group (order by team_id) favorite
                        FROM volunteers
                        JOIN logs
                        ON logs.vol_id = volunteers.vol_id
                        WHERE date = '${date}'
                        GROUP BY volunteers.vol_id),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.last_active,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id),
                    sub3 AS
                        (SELECT sub2.vol_id,
                        first_name,
                        last_name,
                        campus,
                        active,
                        last_active,
                        query.hours total,
                        sub2.hours week,
                        teams.name preferred,
                        query.favorite favorite
                        FROM sub2
                        LEFT JOIN teams ON teams.team_id = sub2.preferred
                        LEFT JOIN query ON query.vol_id = sub2.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                week,
                preferred, 
                teams.name favorite
                FROM sub3
                LEFT JOIN teams ON teams.team_id = sub3.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// searches by range of dates
exports.searchByDates = function(dates, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            client.query(`
                WITH query AS
                        (SELECT volunteers.vol_id, 
                        SUM(hours) hours, 
                        mode() within group (order by team_id) favorite
                        FROM volunteers
                        JOIN logs
                        ON logs.vol_id = volunteers.vol_id
                        WHERE date BETWEEN '${dates[0]}' AND '${dates[1]}'
                        GROUP BY volunteers.vol_id),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.last_active,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id),
                    sub3 AS
                        (SELECT sub2.vol_id,
                        first_name,
                        last_name,
                        campus,
                        active,
                        last_active,
                        query.hours total,
                        sub2.hours week,
                        teams.name preferred,
                        query.favorite favorite
                        FROM sub2
                        LEFT JOIN teams ON teams.team_id = sub2.preferred
                        LEFT JOIN query ON query.vol_id = sub2.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                week,
                preferred, 
                teams.name favorite
                FROM sub3
                LEFT JOIN teams ON teams.team_id = sub3.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// searches by campus
exports.searchByCampus = function(campus, order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            var inactiveDate = subtractDays(90);
            client.query(`
                WITH 
                    inactive AS
                        (SELECT logs.vol_id
                        FROM logs
                        GROUP BY logs.vol_id
                        HAVING MAX(date) < '${inactiveDate}'),
                    query AS
                        (SELECT vol_id
                        FROM volunteers
                        WHERE campus = '${campus}'
                        AND vol_id NOT IN (SELECT vol_id FROM inactive)
                        AND active IS TRUE),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
                client.release();
            })
            .catch(err => {
                console.log(err);
                client.rlease();
                reject('error');
            })
        })
        .catch(err => {
            console.log(err);
            reject('error');
        })
    })
}

// fetches the monthly leaderboard
exports.leaderboard = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var date = new Date();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var week = getWeek();
            client.query(`
                WITH query AS
                        (SELECT volunteers.vol_id, 
                        SUM(hours) hours, 
                        mode() within group (order by team_id) favorite
                        FROM volunteers
                        JOIN logs
                        ON logs.vol_id = volunteers.vol_id
                        WHERE extract(month from date) = ${month}
                        AND extract(year from date) = ${year}
                        GROUP BY volunteers.vol_id),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.last_active,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id),
                    sub3 AS
                        (SELECT sub2.vol_id,
                        first_name,
                        last_name,
                        campus,
                        active,
                        last_active,
                        query.hours total,
                        sub2.hours week,
                        teams.name preferred,
                        query.favorite favorite
                        FROM sub2
                        LEFT JOIN teams ON teams.team_id = sub2.preferred
                        LEFT JOIN query ON query.vol_id = sub2.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                week,
                preferred, 
                teams.name favorite
                FROM sub3
                LEFT JOIN teams ON teams.team_id = sub3.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY total DESC;
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// gets all inactive volunteers
exports.getInactive = function(order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var inactiveDate = subtractDays(30);
            var week = getWeek();
            client.query(`
                WITH query AS
                        ((SELECT vol_id
                        FROM logs
                        GROUP BY vol_id
                        HAVING MAX(date) < '${inactiveDate}')
                        UNION ALL
                        (SELECT vol_id
                        FROM volunteers
                        WHERE vol_id NOT IN
                        (SELECT vol_id FROM logs)
                        OR active IS FALSE)),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// gets all all volunteers
exports.getAll = function(order){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var week = getWeek();
            var inactiveDate = subtractDays(90);
            client.query(`
                WITH 
                    inactive AS
                        (SELECT logs.vol_id
                        FROM logs
                        GROUP BY logs.vol_id
                        HAVING MAX(date) < '${inactiveDate}'),
                    query AS
                        (SELECT vol_id
                        FROM volunteers
                        WHERE vol_id NOT IN (SELECT vol_id FROM inactive)
                        AND active IS TRUE),
                    week AS
                        (SELECT vol_id, SUM(hours) hours
                        FROM logs
                        WHERE date BETWEEN '${week[0]}' AND '${week[1]}'
                        GROUP BY vol_id),
                    sub AS
                        (SELECT volunteers.vol_id, 
                        SUM(logs.hours) total,
                        mode() within group (order by team_id) favorite,
                        MAX(date) last_active
                        FROM volunteers
                        LEFT JOIN logs ON logs.vol_id = volunteers.vol_id
                        GROUP BY volunteers.vol_id),
                    sub2 AS
                        (SELECT volunteers.vol_id,
                        volunteers.first_name,
                        volunteers.last_name,
                        volunteers.campus,
                        volunteers.active,
                        volunteers.team preferred,
                        sub.favorite,
                        sub.last_active,
                        sub.total,
                        week.hours
                        FROM volunteers
                        LEFT JOIN sub ON sub.vol_id = volunteers.vol_id
                        LEFT JOIN week on week.vol_id = volunteers.vol_id)
                SELECT vol_id,
                first_name,
                last_name,
                campus,
                active,
                last_active,
                total,
                hours week,
                team1.name preferred,
                team2.name favorite
                FROM sub2
                LEFT JOIN teams AS team1 ON team1.team_id = sub2.preferred
                LEFT JOIN teams AS team2 ON team2.team_id = sub2.favorite
                WHERE vol_id IN
                    (SELECT vol_id FROM query)
                ORDER BY ${orders[order]};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// gets info by ID number
exports.getByID = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var object = {};
            client.query(`
                WITH history AS
                    (SELECT
                    date,
                    vol_id,
                    name team,
                    hours
                    FROM logs
                    JOIN teams ON teams.team_id = logs.team_id
                    WHERE vol_id = ${id}
                    ORDER BY date DESC
                    LIMIT 5)
                SELECT
                volunteers.vol_id,
                first_name,
                last_name, 
                phone, 
                email, 
                campus,
                active,
                name preferred,
                date,
                history.team team,
                hours
                FROM volunteers
                LEFT JOIN history ON history.vol_id = volunteers.vol_id
                LEFT JOIN teams ON teams.team_id = volunteers.team
                WHERE volunteers.vol_id = ${id}
                ORDER BY date DESC;
            `)
            .then(res => {
                object.info = res.rows;
                client.query(`
                    WITH dist AS 
                        (SELECT team_id, SUM(hours) frequency
                        FROM logs
                        WHERE vol_id = ${id}
                        GROUP BY team_id
                        ORDER BY frequency DESC)
                    SELECT
                    teams.team_id,
                    name team,
                    frequency
                    FROM dist
                    RIGHT JOIN teams ON teams.team_id = dist.team_id
                    ORDER BY team_id;
                `)
                .then(res2 => {
                    object.dist = res2.rows;
                    resolve(object);
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
        .catch(err => {
            console.log(err);
            reject('error');
        })
    })
}

// gets a volunteer's team distribution by ID
exports.getTeamDistribution = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT name team, COUNT(*) frequency
                FROM logs
                JOIN teams ON teams.team_id = logs.team_id
                WHERE vol_id = ${id}
                GROUP BY name
                ORDER BY frequency DESC;
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// gets hours per month for graph
exports.getGraphData = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            // var date = new Date();
            // var months = [];
            // var currentMonth = date.getMonth();
            // var currentYear = date.getFullYear();
            // for(var k = 0; k < 13; k++){
            //     months.push({
            //         month: currentMonth,
            //         year: currentYear
            //     });
            //     if(currentMonth == 1){
            //         currentYear -= 1;
            //         currentMonth -= 1;
            //     }
            //     else{
            //         currentMonth -= 1;
            //     }
            // }
            var now = new Date();
            var startDate = `${now.getMonth()+1}/1/${now.getFullYear()-1}`;
            if(now.getMonth() == 11){
                var endDate = `1/1/${now.getFullYear()+1}`
            }
            else{
                var endDate = `${now.getMonth()+2}/1/${now.getFullYear()}`;
            }
            client.query(`
                SELECT SUM(hours) hours,
                to_date(concat(extract(month from date), '/', extract(year from date)),'MM/YYYY') month_year
                FROM logs
                WHERE date >= '${startDate}'
                AND date < '${endDate}'
                GROUP BY month_year
                ORDER BY month_year DESC;
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// gets this month's hours by team for pie chart
exports.getPieData = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var now = new Date();
            var startDate = `${now.getMonth()+1}/1/${now.getFullYear()}`;
            if(now.getMonth() == 11){
                var endDate = `1/1/${now.getFullYear()+1}`;
            }
            else{
                var endDate = `${now.getMonth()+2}/1/${now.getFullYear()}`;
            }
            client.query(`
                SELECT hours, name
                FROM teams
                LEFT OUTER JOIN
                    (SELECT SUM(hours) hours, team_id
                    FROM logs
                    WHERE date >= '${startDate}'
                    AND date < '${endDate}'
                    GROUP BY team_id
                    ORDER BY team_id) a
                ON a.team_id = teams.team_id;
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// switch activity attribute by ID
exports.switchActivity = function(id, active){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var bool = JSON.parse(active) ? 'TRUE' : 'FALSE';
            client.query(`
                UPDATE volunteers
                SET active = ${bool}
                WHERE vol_id = ${id};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// assign log entry to a staff member with notes
exports.assignLog = function(id, staff, notes){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            staff = staff ? "'" + staff + "'" : 'null';
            notes = notes ? "'" + notes + "'" : 'null';
            client.query(`
                UPDATE logs
                SET staff = ${staff},
                    notes = ${notes}
                WHERE log_id = ${id};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// deletes log entry by ID
exports.deleteLog = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                DELETE FROM logs
                WHERE log_id = ${id};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// get log entry WITH staff and notes by log ID
exports.getNotes = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT first_name,
                last_name,
                log_id,
                date,
                name team,
                hours,
                staff,
                notes
                FROM logs
                JOIN teams ON teams.team_id = logs.team_id
                JOIN volunteers ON volunteers.vol_id = logs.vol_id 
                AND log_id = ${id};
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// get log entries on notebook page
exports.returnLogs = function(search, query){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var sql;
            var minDate = subtractDays(30);
            if(search == 'team'){
                // query is team_id
                sql = `
                    WITH 
                        display AS
                            (SELECT log_id,
                            date, 
                            vol_id,
                            team_id,
                            hours,
                            staff,
                            notes
                            FROM logs
                            WHERE team_id = '${query}'
                            AND date > '${minDate}')
                    SELECT log_id,
                    date,
                    name team,
                    hours,
                    first_name,
                    last_name,
                    campus,
                    staff,
                    notes
                    FROM display
                    JOIN volunteers ON volunteers.vol_id = display.vol_id
                    JOIN teams ON teams.team_id = display.team_id
                    ORDER BY date DESC;
                `;
            }
            else{
                // query is an array
                // this is different from searchByDate (used a single string), so now we always have to use an array
                query = JSON.parse(query);
                if(query.length == 1){
                    sql = `
                        WITH 
                            display AS
                                (SELECT log_id,
                                date, 
                                vol_id,
                                team_id,
                                hours,
                                staff,
                                notes
                                FROM logs
                                WHERE date = '${query[0]}')
                        SELECT log_id,
                        date,
                        name team,
                        hours,
                        first_name,
                        last_name,
                        campus,
                        staff,
                        notes
                        FROM display
                        JOIN volunteers ON volunteers.vol_id = display.vol_id
                        JOIN teams ON teams.team_id = display.team_id
                        ORDER BY date DESC;
                    `; 
                }
                else{
                    sql = `
                        WITH 
                            display AS
                                (SELECT log_id,
                                date, 
                                vol_id,
                                team_id,
                                hours,
                                staff,
                                notes
                                FROM logs
                                WHERE date BETWEEN '${query[0]}' AND '${query[1]}')
                        SELECT log_id,
                        date,
                        name team,
                        hours,
                        first_name,
                        last_name,
                        campus,
                        staff,
                        notes
                        FROM display
                        JOIN volunteers ON volunteers.vol_id = display.vol_id
                        JOIN teams ON teams.team_id = display.team_id
                        ORDER BY date DESC;
                    `;
                }                
            }
            client.query(sql)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// get volunteers per month by assigned staff member
exports.getStaff = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var date = new Date();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            client.query(`
                WITH sub AS
                    (SELECT mode() within group (order by team_id) team,
                    MAX(date) date,
                    SUM(hours) hours,
                    COUNT(vol_id) volunteers, 
                    staff
                    FROM logs
                    WHERE staff IS NOT NULL
                    AND date >= '${month}/1/${year}'
                    GROUP BY staff)
                SELECT staff,
                volunteers,
                hours,
                date,
                name team
                FROM sub
                JOIN teams ON teams.team_id = sub.team
                ORDER BY volunteers DESC
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}

// get teams data
exports.getTeams = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT * FROM teams;
            `)
            .then(res => {
                resolve(res.rows);
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
            reject('error');
        })
    })
}