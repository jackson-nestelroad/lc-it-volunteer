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
    })
// /new is new volunteer registration form
app.route('/new')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/new/index.html');
    })
    // registration form is successfully submitted
    .post(function(req, res){
        // req.body contains all of the information we submitted
        database.checkIfRegistered(req.body.first, req.body.last, req.body.email)
        .then(id => {
            // searchByFullName came back with an ID -- volunteer already registered
            if(id){
                res.send('exists');
            }
            else{
                // create the volunteer
                database.add(req.body.first, req.body.last, req.body.email, req.body.phone)
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
// /validate is a page to enter the volunteer's email if there is more than one volunteers with the same name
app.route('/validate')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/validate/index.html');
    })
    // email is submitted
    .post(function(req, res){
        // we need to check the information again to make sure it didn't get changed in the URL
        function checkInfo(date, team, hours){
            if(date == ''){
                return false;
            }
            else{
                // min is first day of the same month last year
                var min = new Date(`${(new Date()).getMonth()+1}/1/${(new Date()).getFullYear()-1}`);
                // max is next month
                var max = new Date(`${(new Date()).getMonth()+2}/1/${(new Date()).getFullYear()}`);
                date = new Date(date);
                if(date <= min || date > max){
                    return false;
                }
                else{
                    // need to update this if more teams are ever added
                    if([1,2,3,4].includes(parseInt(team)) && parseInt(hours)){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
            }
        }
        // req.body.email is the email
        // req.query has everything else
        if(!checkInfo(req.query.date, req.query.team, req.query.hours)){
            res.send('bad');
        }
        // info still looks good
        else{
            database.checkIfRegistered(req.query.name, req.body.email)
            .then(id => {
                if(!id){
                    res.send('dne');
                }
                else{
                    // id is vol_id, so let's log the info
                    database.log(req.query.date, id, req.query.team, req.query.hours)
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
    })
// /data is database page with leaderboard, search, and inactive list
app.get('/data', function(req, res){
    res.sendFile(__dirname + '/public/src/data/index.html');
})
// /display is the display for TV
app.get('/display', function(req, res){
    res.sendFile(__dirname + '/public/src/display/index.html');
})
// port
app.listen(port, () => console.log('Listening on port '+ port + '!'));