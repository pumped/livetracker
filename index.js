var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var app = express();
var Tracker = require('./tracker.js');

var tracker = new Tracker();


http.createServer(app).listen(8000);

//app.use(express.static('./public'));
app.use('/live/view', express.static('public'));

// -- get data request -- //
app.get('/live/data', function (req, res) {
  var data = tracker.getData();
  var clients = Object.keys(data).length;
  var computer = 0;
  var mobile = 0;
  var tablet = 0;
  
  var topClients = {};
  
  for (var i in data) {
    if (data[i].type == 1) {
      mobile++;
    } else if (data[i].type == 2) {
      computer++;
    } else if (data[i].type == 3) {
      tablet++;
    }
  }
  
  var tos = timeOnSite(data);
  
  var resp = {
    "clients":clients,
    "computer":computer,
    "mobile":mobile,
    "tablet":0,
    "timeOnSite":tos
  }  
  
  var response = JSON.stringify(resp);
  
  res.status(200).send(response);
  
});

function timeOnSite(data) {
  var clients = Object.keys(data).length;
  
  var d = new Date;
  var time = d.getTime();
  
  var timeSum = 0;  
  var longest;
  var shortest;
  for (var i in data) {
    var sessionsTime = time - data[i].date;
    
    //average
    timeSum += sessionsTime;
    
    //setup longest
    if (!longest || sessionsTime > (time-longest.date)) {
      longest = data[i];
    }
    
    if (!shortest || sessionsTime < (time-shortest.date)) {
      shortest = data[i];
    }
  }
  
  var averageTime = timeSum / clients;
  
  var hitStats = lastHitStats(data);
  
  var timeOnSite = {
    "average": averageTime,
    "total": timeSum,
    "longest": longest,
    "shortest": shortest,
    "hitStats": hitStats  
  }
  
  return timeOnSite;
}

function lastHitStats(data) {
  var binCount = 30;
  var binPeriod = 60*1000;
  var maxTime = binCount * binPeriod;
  var bins = Array.apply(null, Array(binCount)).map(Number.prototype.valueOf,0);;
  
  var d = new Date;
  var time = d.getTime();
  
  for (var i in data) {
    var sessionTime = time - data[i].date;
    var binNum = parseInt(sessionTime/binPeriod);
    if (binNum < binCount) {
      bins[binNum]+=1;
    }
  }
  
  return bins;
}

app.get('/live/report', function (req, res) {
  
  //get ip
  var ip = "";
  ip = req.connection.remoteAddress
  if (ip.includes("127.0.0.1")) {
    nip = req.headers['x-forwarded-for'];
    if (nip) {
      ip = nip;
    }    
  }
  
  tracker.addRequest({"ip":ip}, req);
  var rid = Math.random();
  
  res.status(200).send(rid.toString());  
});


/*
// --- redirect server --- //
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);*/
