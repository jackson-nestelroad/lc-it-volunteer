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
// base page is the base volunteer form
app.route('/')
    .get(function(req, res){
        res.sendFile(__dirname + '/public/src/form/index.html');
    })
    .post(function(req, res){
        console.log(req.body);// this is the data to send to the database
        database.searchByFirstName('H');
        res.send('Volutneer logged');
    })
// /new is new volunteer registration form
app.get('/new', function(req, res){
    res.sendFile(__dirname + '/public/src/new/index.html');
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