'use strict';

var express = require('express');
var compression = require('compression');

var environment = process.env.NODE_ENV;

var app = express();
app.use(compression());

app.use('/src', express.static(__dirname + '/src'));
app.use('/dist', express.static(__dirname + '/dist'));

app.listen(3000, function(){
  console.log('Express server listening on port 3000');
});

app.get('/', function(req, res){
  environment != 'production' ? res.sendfile('src/game.html') : res.sendfile('dist/game.html');
});