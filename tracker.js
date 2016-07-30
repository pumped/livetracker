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
  
  var d = new Date();
  var time = d.getTime();
  
  var ua = req.headers['user-agent'];
  var ual = ua.toLowerCase();
  var type = 2;
  
  if (ual.includes("mobile")) {
    type = 1;
  } 
  
  if (ual.includes("tablet")) {
    type = 3;
  }
  
  var request = {
    "date":time,
    "type":type
  }
  
  this.live[ip] = request;
};

Tracker.prototype.clean = function() {
  //if older than 10 minutes, delete
  var d = new Date();
  var removeDate = d.getTime();
  //removeDate -= 10*60*1000;
  removeDate -= 60*1000;
  for (var i in this.live) {
    if (this.live[i].date < removeDate) {
      console.log("removed " + i);
      delete this.live[i];
    }
  }
}

module.exports = Tracker;
