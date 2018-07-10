const express = require('express');
const path = require('path');
const database = require(__dirname + '/public/data/data.js');

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
        // req.body contains all of the information we submitted
        database.checkIfRegistered(req.body.first + ' ' + req.body.last, req.body.email)
        .then(id => {
            // checkIfRegistered came back with an ID -- volunteer already registered
            if(id){
                res.send('exists');
            }
            else{
                // create the volunteer
                database.add(req.body.first, req.body.last, req.body.email, req.body.phone, req.body.team)
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
        // popup with email and phone number
        if(category == 0){
            database.getByID(query)
            .then(rows => {
                res.send(rows);
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
            database.searchByFirstName(query.toLowerCase())
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
            database.searchByLastName(query.toLowerCase())
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // search by favorite team
        if(category == 4){
            database.searchByTeam(query.toLowerCase())
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
            database.searchByDate(query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            })
        }
        // inactivity list, no query
        if(category == 6){
            database.getInactive()
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
    .post(function(req, res){
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
// port
app.listen(port, () => console.log('Listening on port '+ port + '!'));
