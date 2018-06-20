const express = require('express');
const path = require('path');
const database = require(__dirname + '/public/data/data.js');

const app = new express();

// let Heroku define the port
var port = process.env.PORT || 3000;

// need these for receiving POST requests
app.use(express.urlencoded({ extended: true }));
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
            else{
                // id is vol_id for logs
                // database.log(id)
                res.send('success');
            }
        })
        .catch(err => {
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
        database.searchByFullName(req.body.first + ' ' + req.body.last)
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
            res.send('error');
        });
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