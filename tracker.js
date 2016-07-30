var farmhash = require('farmhash');

function Tracker() {
  this.live = {};
  
  var that = this;
  this.cleanTimer = setInterval(function(){
    that.clean();
  },2000);
}

Tracker.prototype.getData = function () {
  return this.live;
}

Tracker.prototype.addRequest = function (info, req) {
  var ip = info.ip;
  var ua = req.headers['user-agent'];
  var cid = farmhash.fingerprint32(ip+ua);
  var d = new Date();
  var time = d.getTime();
  
  if (!this.live[cid]) {
    var ual = ua.toLowerCase();
    var type = 2;  
    if (ual.includes("mobile")) {
      type = 1;
    } else if (ual.includes("tablet")) {
      type = 3;
    }
    
    var request = {
      "ip":ip,
      "date":time,
      "latest":time,
      "type":type,
      "count":0
    }
    
    this.live[cid] = request;
  } else {
    this.live[cid].count++;
    this.live[cid].latest = time;
  }
};

Tracker.prototype.clean = function() {
  //if older than 10 minutes, delete
  var d = new Date();
  var removeDate = d.getTime();
  //removeDate -= 10*60*1000;
  removeDate -= 4*1000;
  for (var i in this.live) {
    if (this.live[i].latest < removeDate) {
      //console.log("removed " + i);
      delete this.live[i];
    }
  }
}

module.exports = Tracker;
