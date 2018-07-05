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
exports.add = function(first, last, email, phone, team){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                INSERT INTO volunteers(first_name, last_name, email, phone, team)
                VALUES('${first}', '${last}', '${email}', '${phone}', '${team}');
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

// searches by first name
exports.searchByFirstName = function(search){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT z.vol_id, z.first_name, z.last_name, z.hours, z.team, z.last_active, teams.name preferred
                FROM
                    (SELECT c.vol_id, c.first_name, c.last_name, f.hours, f.team, f.last_active, c.preferred
                        FROM 
                        (SELECT volunteers.vol_id, first_name, last_name, team preferred
                        FROM volunteers
                        WHERE lower(first_name) LIKE '${search}%') c
                        LEFT OUTER JOIN
                        (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name team, h.last_active
                        FROM
                            (SELECT volunteers.vol_id, SUM(hours) total_hours
                            FROM logs
                            LEFT OUTER JOIN volunteers
                            ON volunteers.vol_id = logs.vol_id
                            GROUP BY volunteers.vol_id
                            HAVING volunteers.vol_id IN
                            (SELECT volunteers.vol_id
                            FROM volunteers
                            WHERE lower(first_name) LIKE '${search}%')
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
                                    WHERE lower(first_name) LIKE '${search}%')
                                GROUP BY vol_id) e
                                ON e.temp_id = teams.team_id) b
                            JOIN
                            (SELECT volunteers.vol_id, MAX(logs.date) last_active
                            FROM volunteers
                            JOIN logs
                            ON volunteers.vol_id = logs.vol_id
                            WHERE volunteers.vol_id 
                            IN
                            (SELECT volunteers.vol_id
                                FROM volunteers
                                WHERE lower(first_name) LIKE '${search}%')
                            GROUP BY volunteers.vol_id) g
                            ON g.vol_id = b.vol_id) h
                        ON a.vol_id = h.vol_id) f
                    ON f.vol_id = c.vol_id) z
                JOIN teams
                ON z.preferred = teams.team_id
                ORDER BY z.vol_id;
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
exports.searchByLastName = function(search){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT z.vol_id, z.first_name, z.last_name, z.hours, z.team, z.last_active, teams.name preferred
                FROM
                    (SELECT c.vol_id, c.first_name, c.last_name, f.hours, f.team, f.last_active, c.team preferred
                        FROM 
                        (SELECT volunteers.vol_id, first_name, last_name, team
                            FROM volunteers
                            JOIN
                                ((SELECT vol_id
                                FROM logs
                                GROUP BY vol_id
                                HAVING mode() within group (order by team_id) = ${search})
                                UNION 
                                (SELECT vol_id
                                FROM volunteers
                                WHERE team = ${search})) j
                            ON j.vol_id = volunteers.vol_id) c
                        LEFT OUTER JOIN
                        (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name team, h.last_active
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
                                ((SELECT vol_id
                                FROM logs
                                GROUP BY vol_id
                                HAVING mode() within group (order by team_id) = ${search})
                                UNION 
                                (SELECT vol_id
                                FROM volunteers
                                WHERE team = ${search})) c
                            ON c.vol_id = volunteers.vol_id)
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
                                    ((SELECT vol_id
                                    FROM logs
                                    GROUP BY vol_id
                                    HAVING mode() within group (order by team_id) = ${search})
                                    UNION 
                                    (SELECT vol_id
                                    FROM volunteers
                                    WHERE team = ${search})) c
                                    ON c.vol_id = volunteers.vol_id)
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
                                ((SELECT vol_id
                                FROM logs
                                GROUP BY vol_id
                                HAVING mode() within group (order by team_id) = ${search})
                                UNION 
                                (SELECT vol_id
                                FROM volunteers
                                WHERE team = ${search})) c
                                ON c.vol_id = volunteers.vol_id)
                            GROUP BY volunteers.vol_id) g
                            ON g.vol_id = b.vol_id) h
                        ON a.vol_id = h.vol_id) f
                    ON f.vol_id = c.vol_id) z
                JOIN teams
                ON z.preferred = teams.team_id
                ORDER BY z.vol_id;
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

// searches by most active team
exports.searchByTeam = function(team){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT c.vol_id, c.first_name, c.last_name, f.hours, f.team, f.last_active
                FROM 
                (SELECT volunteers.vol_id, first_name, last_name, email
                    FROM volunteers
                    JOIN
                        (SELECT vol_id
                        FROM logs
                        GROUP BY vol_id
                        HAVING mode() within group (order by team_id) = ${team}
                        ORDER BY vol_id) j
                    ON j.vol_id = volunteers.vol_id) c
                LEFT OUTER JOIN
                (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name team, h.last_active
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
                        (SELECT vol_id
                        FROM logs
                        GROUP BY vol_id
                        HAVING mode() within group (order by team_id) = ${team}
                        ORDER BY vol_id) c
                    ON c.vol_id = volunteers.vol_id)
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
                            (SELECT vol_id
                            FROM logs
                            GROUP BY vol_id
                            HAVING mode() within group (order by team_id) = ${team}
                            ORDER BY vol_id) c
                            ON c.vol_id = volunteers.vol_id)
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
                        (SELECT vol_id
                        FROM logs
                        GROUP BY vol_id
                        HAVING mode() within group (order by team_id) = ${team}
                        ORDER BY vol_id) c
                        ON c.vol_id = volunteers.vol_id)
                    GROUP BY volunteers.vol_id) g
                    ON g.vol_id = b.vol_id) h
                ON a.vol_id = h.vol_id) f
                ON f.vol_id = c.vol_id
                ORDER BY c.vol_id;
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
exports.searchByDate = function(date){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT c.vol_id, c.first_name, c.last_name, c.hours, c.team, d.last_active
                FROM
                    (SELECT g.vol_id, g.first_name, g.last_name, g.hours, b.team
                    FROM
                        (SELECT a.vol_id, a.hours, e.first_name, e.last_name
                        FROM 
                            (SELECT volunteers.vol_id, SUM(hours) hours
                            FROM volunteers
                            JOIN logs
                            ON logs.vol_id = volunteers.vol_id
                            WHERE date = '${date}'
                            GROUP BY volunteers.vol_id) a
                        JOIN
                            (SELECT volunteers.vol_id, first_name, last_name
                            FROM volunteers
                            WHERE volunteers.vol_id IN
                                (SELECT volunteers.vol_id
                                    FROM volunteers
                                    JOIN logs
                                    ON logs.vol_id = volunteers.vol_id
                                    WHERE date = '${date}'
                                    GROUP BY volunteers.vol_id)
                            ) e
                        ON e.vol_id = a.vol_id
                        ) g
                    JOIN
                        (SELECT h.vol_id, teams.name team
                        FROM teams
                        JOIN 
                            (SELECT volunteers.vol_id, mode() within group (order by team_id) team
                            FROM volunteers
                            JOIN logs
                            ON logs.vol_id = volunteers.vol_id
                            WHERE date = '${date}'
                            GROUP BY volunteers.vol_id) h
                            ON 
                            h.team = teams.team_id
                        ) b
                    ON g.vol_id = b.vol_id) c
                JOIN 
                    (SELECT volunteers.vol_id, MAX(logs.date) last_active
                    FROM volunteers
                    JOIN logs
                    ON volunteers.vol_id = logs.vol_id
                    WHERE volunteers.vol_id IN
                        (SELECT volunteers.vol_id
                        FROM volunteers
                        JOIN logs
                        ON logs.vol_id = volunteers.vol_id
                        WHERE date = '${date}'
                        GROUP BY volunteers.vol_id)
                    GROUP BY volunteers.vol_id) d
                ON d.vol_id = c.vol_id;
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

// fetches the monthly leaderboard
exports.leaderboard = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var date = new Date();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            client.query(`
                SELECT c.vol_id, c.first_name, c.last_name, c.hours, f.team, f.last_active
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
                (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name team, h.last_active
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
                        FROM 
                            (SELECT *
                            FROM logs
                            WHERE extract(month from date) = 7
                            AND extract(year from date) = 2018) k
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
                ORDER BY c.hours DESC;
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
exports.getInactive = function(){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            var date = new Date();
            // inactivity period is 60 days
            date = new Date(date.setTime(date.getTime() - 60 * 86400000));
            date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
            client.query(`
                SELECT z.vol_id, z.first_name, z.last_name, z.hours, z.team, z.last_active, teams.name preferred
                FROM
                    (SELECT c.vol_id, c.first_name, c.last_name, f.hours, f.team, f.last_active, c.preferred
                    FROM 
                    (SELECT vol_id, first_name, last_name, team preferred
                    FROM volunteers
                    WHERE vol_id IN
                            (((SELECT vol_id
                            FROM logs
                            GROUP BY vol_id
                            HAVING MAX(date) < '${date}')
                            UNION ALL
                            (SELECT vol_id
                            FROM volunteers
                            WHERE vol_id NOT IN
                            (SELECT vol_id
                            FROM logs))))
                        ) c
                    LEFT OUTER JOIN
                    (SELECT a.vol_id, a.total_hours hours, h.favorite_team_name team, h.last_active
                    FROM
                        (SELECT volunteers.vol_id, SUM(hours) total_hours
                        FROM logs
                        LEFT OUTER JOIN volunteers
                        ON volunteers.vol_id = logs.vol_id
                        GROUP BY volunteers.vol_id
                        HAVING volunteers.vol_id IN
                        ((SELECT vol_id
                            FROM logs
                            GROUP BY vol_id
                            HAVING MAX(date) < '${date}')
                            UNION ALL
                            (SELECT vol_id
                            FROM volunteers
                            WHERE vol_id NOT IN
                            (SELECT vol_id
                            FROM logs)))
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
                                ((SELECT vol_id
                                FROM logs
                                GROUP BY vol_id
                                HAVING MAX(date) < '${date}')
                                UNION ALL
                                (SELECT vol_id
                                FROM volunteers
                                WHERE vol_id NOT IN
                                (SELECT vol_id
                                FROM logs)))
                            GROUP BY vol_id) e
                            ON e.temp_id = teams.team_id) b
                        JOIN
                        (SELECT volunteers.vol_id, MAX(logs.date) last_active
                        FROM volunteers
                        JOIN logs
                        ON volunteers.vol_id = logs.vol_id
                        WHERE volunteers.vol_id 
                        IN
                        ((SELECT vol_id
                            FROM logs
                            GROUP BY vol_id
                            HAVING MAX(date) < '${date}')
                            UNION ALL
                            (SELECT vol_id
                            FROM volunteers
                            WHERE vol_id NOT IN
                            (SELECT vol_id
                            FROM logs)))
                        GROUP BY volunteers.vol_id) g
                        ON g.vol_id = b.vol_id) h
                    ON a.vol_id = h.vol_id) f
                    ON f.vol_id = c.vol_id) z
                JOIN teams
                ON z.preferred = teams.team_id
                ORDER BY z.vol_id;
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

exports.getByID = function(id){
    return new Promise((resolve, reject) => {
        pool.connect()
        .then(client => {
            client.query(`
                SELECT volunteers.vol_id, first_name, last_name, phone, email, name team
                FROM volunteers
                JOIN teams
                ON team = teams.team_id
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

// fetches hours for a certain month
exports.month = function(){

}