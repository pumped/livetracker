var farmhash = require('farmhash');
var fs = require('fs');

function Tracker() {
  this.live = {};
  this.locations = {};
  this.liveFile = "live.json";
  
  var that = this;
  setTimeout(function() {
      that.cleanTimer = setInterval(function(){
        that.clean();
      },2000);
  }, 30000);

  
  var fs = require('fs');
  fs.readFile(this.liveFile, 'utf8', function (err, data) {
    if (err) {
      return;
    }
    that.live = JSON.parse(data);
  });
}

Tracker.prototype.getData = function () {
  return this.live;
}

Tracker.prototype.addRequest = function (info, req) {
  var ip = info.ip;
  var ua = req.headers['user-agent'];
  if (!ua) { ua = "none"; }
  var cid = farmhash.fingerprint32(ip+ua);
  var d = new Date();
  var time = d.getTime();
  
  //attempt to get Location
  var location = this.detectLocation(req);
  
  if (this.locations[cid]) {    
    this.locations[cid].locations.push(location);
    this.locations[cid].time = time;
  } else {
    this.locations[cid] = {
      "locations":[],
      "time":time
    };
  }
  
  this.writeLocations(cid,location);
  
  
  
  if (!this.live[cid]) {
    var ual = ua.toLowerCase();
    var type = 2;  
    if (ual.includes("mobile")) {
      type = 1;
    } else if (ual.includes("tablet")) {
      type = 3;
    }
    
    if (this.locations[cid]) {
      var loc = this.locations[cid].locations;
    } else {
      var loc = [location];
    }
    
    var request = {
      "ip":ip,
      "date":time,
      "latest":time,
      "type":type,
      "count":0,
      "locations":loc
    }
    
    this.live[cid] = request;
  } else {
    this.live[cid].count++;
    this.live[cid].latest = time;
    if (!this.live[cid].locations) {
      this.live[cid].locations = [];
    }
    this.live[cid].locations.push(location);
    
    //pop first location off if it's too long
    if (this.live[cid].hasOwnProperty("locations")) {
      var len = this.live[cid].locations.length
        for (var i=len; i > 30; i--) {
          this.live[cid].locations.shift();     
        } 
    }
  }
};

Tracker.prototype.writeLocations = function (id,location) {
  var locString = id + "," + location[0]  + "," + location[1]+"\n";
  fs.appendFile("locations.json", locString, function (err) {
  });
};

Tracker.prototype.detectLocation = function(req) {
  if (!req || !req.hasOwnProperty("params")) {
    console.log("not post");
    return false;
  }

  var x = Number(req.query.x);
  var y = Number(req.query.y);
  
  if (x && y) {
    return [x,y];
  } else {
    return false;
  }
};

Tracker.prototype.clean = function() {
  //if older than 10 minutes, delete
  var d = new Date();
  var removeDate = d.getTime();
  var locationDate = d.getTime();
  //removeDate -= 10*60*1000;
  removeDate -= 45*1000;
  locationDate -= 5*60*1000;
  
  for (var i in this.live) {
    if (this.live[i].latest < removeDate) {
      //console.log("removed " + i);
      delete this.live[i];
    }
  }
  
  for (var i in this.locations) {
    if (this.locations[i].time < locationDate) {
      delete this.locations[i];
    }
  }
  
  var str = JSON.stringify(this.live);
  fs.writeFile(this.liveFile, str, function(err) {
      if(err) {
          return console.log(err);
      }
  }); 
}

module.exports = Tracker;
