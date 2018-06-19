const express = require('express');
const path = require('path');

const app = new express();

// let Heroku define the port
var port = process.env.PORT || 8080;

// include all files
app.use(express.static(__dirname + '/public'));
// include all node modules
app.use(express.static(__dirname + '/node_modules'));
// base page is the base volunteer form
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/src/form/index.html');
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