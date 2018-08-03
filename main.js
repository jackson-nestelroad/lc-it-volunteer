const express = require('express');
const path = require('path');
const database = require(__dirname + '/public/data/data.js');
const campusDatabase = require(__dirname + '/public/data/campus.js');

const app = new express();

// let Heroku define the port
var port = process.env.PORT || 3000;

// need these for receiving POST requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// include all files
app.use(express.static(__dirname + '/public'));
// include all node modules
app.use(express.static(__dirname + '/node_modules'));
// base page is the base log hours form
app.route('/')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/form/index.html');
    })
    // log form is successfully submitted
    .post(function(req, res){
        // req.body contains all of the information we submitted
        // we were given an email through validation
        if(req.body.email){
            database.checkIfRegistered(req.body.name, req.body.email)
            .then(id => {
                if(!id){
                    res.send('dne');
                }
                else{
                    // id is vol_id, so let's log the info
                    database.log(req.body.date, id, req.body.team, req.body.hours)
                    .then(code => {
                        res.send('success');
                    })
                    .catch(err => {
                        res.send('error');
                    })
                }
            })
            .catch(err => {
                res.send('error');
            })
        }
        // normal submission -- no email
        else{
            database.searchByFullName(req.body.name)
            .then(id => {
                // searchByFullName came back false -- volunteer not registered
                if(!id){
                    res.send('dne');
                }
                // we need to validate an email to see which volunteer this is
                else if(id == 'duplicate'){
                    res.send('validate');
                }
                else{
                    // id is vol_id for logs
                    database.log(req.body.date, id, req.body.team, req.body.hours)
                    .then(code => {
                        res.send('success');
                    })
                    .catch(err => {
                        res.send('error');
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
        }
    })
// /new is new volunteer registration form
app.route('/new')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/new/index.html');
    })
    // registration form is successfully submitted
    .post(function(req, res){
        // page loaded and sent this request to get the campus data
        if(req.body.load){
            campusDatabase.get()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
        }
        // form was submitted
        else{
            database.checkIfRegistered(req.body.first + ' ' + req.body.last, req.body.email)
            .then(id => {
                // checkIfRegistered came back with an ID -- volunteer already registered
                if(id){
                    res.send('exists');
                }
                else{
                    // create the volunteer
                    database.add(req.body.first, req.body.last, req.body.email, req.body.phone, req.body.team, req.body.campus)
                    .then(code => {
                        res.send('success');
                    })
                    .catch(err => {
                        res.send('error');
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
        }
        
    })
// /search is database page with leaderboard, search, and inactive list
app.route('/search')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/search/index.html');
    })
    // this is where we will handle what was searched for
    .post(function(req, res){
        var category = req.body.category;
        var query = req.body.query;
        var order = req.body.order;
        // update activity
        if(req.body.category == -2){
            database.switchActivity(req.body.id, req.body.active)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // return initial campus data
        if(req.body.category == -1){
            campusDatabase.get()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
        }
        // popup with email and phone number
        // WILL return an object with TWO sets of rows!!
        if(category == 0){
            database.getByID(query)
            .then(object => {
                res.send(object);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // leaderboard, no query
        if(category == 1){
            database.leaderboard()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by first name
        if(category == 2){
            database.searchByFirstName(query.toLowerCase(), order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by last name
        if(category == 3){
            database.searchByLastName(query.toLowerCase(), order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by favorite/preferred team
        if(category == 4){
            database.searchByTeam(query.toLowerCase(), order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by date
        if(category == 5){
            query = JSON.parse(query);
            // one date
            if(query.length == 1){
                database.searchByDate(query[0], order)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    console.log(err);
                    res.send('error');
                })
            }
            // range of dates
            else if(query.length == 2){
                database.searchByDates(query, order)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    console.log(err);
                    res.send('error');
                })
            }
            // invalid
            else{
                res.send('error');
            }
        }
        // inactivity list, no query
        if(category == 6){
            database.getInactive(order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by campus
        if(category == 7){
            database.searchByCampus(query, order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        if(category == 8){
            database.getAll(order)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
    })
// /display is the display for TV
app.route('/display')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/display/index.html');
    })
    // this is received as soon as the page loads
    .post(function(req, res){
        // get graph data
        if(req.body.graph){
            database.getGraphData()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // get pie chart data
        if(req.body.pie){
            database.getPieData()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
    })
// notebook page where staff can add notes to their volunteer entries
app.route('/notebook')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/notebook/password.html');
    })
    .post(function(req, res){
        var reason = req.body.reason;
        // check password input
        // change password to environment variable
        if(reason == 'load'){
            var password = req.body.password;
            if(password == process.env.NOTEBOOK_PASS){
                res.sendFile(__dirname + '/public/src/notebook/index.html');
            }
            else{
                res.send('incorrect');
            }
        }
        if(reason == 'update'){
            var id = req.body.id;
            var staff = req.body.staff;
            var notes = req.body.notes;
            database.assignLog(id, staff, notes)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        if(reason == 'delete'){
            var id = req.body.id;
            database.deleteLog(id)
            .then(rows => {
                res.send('success');
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        if(reason == 'fetch'){
            var search = req.body.category;
            var query = req.body.query;
            database.returnLogs(search, query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        if(reason == 'modal'){
            var id = req.body.id;
            database.getNotes(id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
    })
// port
app.listen(port, () => console.log('Listening on port '+ port + '!'));