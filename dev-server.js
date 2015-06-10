var express         = require('express');
var router          = express.Router();
var vhost           = require('vhost');
var app             = require('express.io')();
var socket          = require('socket.io');
var port            = parseInt(process.env.PORT, 10) || 4000;

app.http().io();

app.listen(port);
app.enable('trust proxy');

var home = require('express.io')();

home.use('/js', express.static(__dirname + '/app/js'));
home.use('/css', express.static(__dirname + '/app/css'));
home.use('/img', express.static(__dirname + '/app/img'));
home.use('/test', express.static(__dirname + '/app/test'));

home.set('jsonp callback', true);

//var hostname = 'srl.tak.com'; // Replace this with your own hostname.
var hostname = 'localhost'; // Replace this with your own hostname.
app.use(vhost(hostname, home));

home.get('/', function(req, res) {

    res.sendfile(__dirname + '/app/index.html');

    req.io.route('home');
})

/* Outputs the users' ips visiting your website */
app.io.route('home', function (req) {
    console.log(req.ip);
});

/* Debug */
console.log(__dirname);
console.log(__dirname + '/app/');
console.log('Listening on port: ' + port);
console.log('hostname: ' + hostname + ':' + port);
