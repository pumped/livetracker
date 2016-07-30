var farmhash = require('farmhash');

function Tracker() {
  this.live = {};
  
  var that = this;
  this.cleanTimer = setInterval(function(){
    that.clean();
  },10000);
}

Tracker.prototype.getData = function () {
  return this.live;
}

Tracker.prototype.addRequest = function (info, req) {
  var ip = info.ip;
  var ua = req.headers['user-agent'];
  var cid = farmhash.fingerprint32(ip+ua);
  
  if (!this.live[cid]) {
      
    var d = new Date();
    var time = d.getTime();
    

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
      "type":type,
      "count":0
    }
    
    this.live[cid] = request;
  } else {
    this.live[cid].count++;
  }
};

Tracker.prototype.clean = function() {
  //if older than 10 minutes, delete
  var d = new Date();
  var removeDate = d.getTime();
  //removeDate -= 10*60*1000;
  removeDate -= 60*1000;
  for (var i in this.live) {
    if (this.live[i].date < removeDate) {
      //console.log("removed " + i);
      delete this.live[i];
    }
  }
}

module.exports = Tracker;