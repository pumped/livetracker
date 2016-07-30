var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var app = express();
var Tracker = require('./tracker.js');

var tracker = new Tracker();


http.createServer(app).listen(8000);

app.use(express.static('./public'));
app.use('/live', express.static('public'));

// -- get data request -- //
app.get('/live/data', function (req, res) {
  var data = tracker.getData();
  var clients = Object.keys(data).length;
  var computer = 0;
  var mobile = 0;
  var tablet = 0;
  
  for (var i in data) {
    if (data[i].type == 1) {
      mobile++;
    } else if (data[i].type == 2) {
      computer++;
    } else if (data[i].type == 3) {
      tablet++;
    }
  }
  
  var resp = {
    "clients":clients,
    "computer":computer,
    "mobile":mobile,
    "tablet":0
  }  
  
  var response = JSON.stringify(resp);
  
  res.status(200).send(response);
  
});

app.get('/live/report', function (req, res) {
  
  //get ip
  var ip = "";
  ip = req.connection.remoteAddress
  if (!ip) {
    req.headers['x-forwarded-for'];
  }
  
  console.log(ip);
  
  tracker.addRequest({"ip":ip}, req);
  
  res.status(200).send("");  
});


/*
// --- redirect server --- //
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);*/
