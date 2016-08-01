$(document).ready(function(){
  
  
  setupChart();
  setupRequestGraph();
  getData();
  setupMap();
});

function getData() {
  $.getJSON('/live/data',function(data){
    updateData(data);
    setTimeout(getData,2000);
  })
}

function updateData(data) {
  updateMarkers(data);
  
  $("#liveUsers").html(data.clients);
  userChart.series[0].setData([data.mobile]);
  userChart.series[1].setData([data.computer]);
  userChart.series[2].setData([data.tablet]);
  
  var max = data.mobile + data.computer + data.tablet;
  //userChart.xAxis[0].setExtremes(0,max);
  
  userChart.redraw();
  
  reqChart.series[0].setData(data.timeOnSite.hitStats);
  
  if (data.timeOnSite.average) {
    var d = new Date();
    var time = d.getTime();
    
    var tos = timeSince(data.timeOnSite.longest.date);
    $('#longest .time').html(tos);
    $('#longest .ip').html(data.timeOnSite.longest.ip);
    
    $('#mean .time').html(timeSince(time - data.timeOnSite.average));
  }
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

var userChart;
var reqChart;

function setupChart() {
    userChart = new Highcharts.chart({
        chart: {
            renderTo: 'makeup',
            type: 'bar'
        },
        title: {
            text: '',
            enabled: 'false'
        },
        credits: {
          enabled: false
        },
        xAxis: {
            categories: ['Mobile','Computer','Tablet'],
            lineWidth: 0,
            grdiLineWidth:0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',    
            labels: {
                enabled: false
            },
            minorTickLength: 0,
            tickLength: 0,
            ordinal: false
        },
        yAxis: {
            min: 0,
            title: {
                text: '',
                enabled: false
            },
            lineWidth: 0,
            grdiLineWidth:0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',    
            labels: {
                enabled: false
            },
            minorTickLength: 0,
            tickLength: 0,
            gridLineColor: 'transparent'
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'percent',
                dataLabels: {
                   enabled: true,
                   align: 'right',
                   color: '#FFFFFF',
                   x: -10,
                   formatter: function() {
                    if (this.percentage < 15) {
                      return "";
                    }
                    return Math.round(this.percentage)+"%";
                  },
                  style: {
                    color: 'white',
                    
                    textShadow: 'none'
                  }
               },
               pointPadding: 0.1,
               groupPadding: 0
            }
        },
        series: [{
            name: 'Mobile',
            data: [15],
            color: "#50b432"
        },{
            name: 'Desktop',
            data: [5],
            color: "#3c87ff"
        },{
            name: 'Tablet',
            data: [5],
            color:"#ffd138"
        }]
    });
}

function setupRequestGraph() {
    reqChart = new Highcharts.chart({
        chart: {
            type: 'column',
            renderTo: 'reqGraph'
        },
        title: {
            text: '',
            enabled: false
        },
        credits: {
          enabled:false
        },
        legend: {
          enabled:false
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            crosshair: true,
            reversed: false
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Requests'
            },
            minTickInterval: 1,
            lineWidth: 0,
            grdiLineWidth:0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',    
            labels: {
                enabled: false
            },
            minorTickLength: 0,
            tickLength: 0,
            gridLineColor: 'transparent'
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}0 Minutes Ago</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.1,
                borderWidth: 0
            },
            series: {
                pointPadding: 0.1,
                borderWidth: 0,
                groupPadding: 0
            }
        },
        series: [{
            name: 'Requests',
            data: [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            color: "#3c87ff"
        }]
    });
}

function updateMarkers(data) {
  var delIDS = {};
  for (var i in markers) {
    delIDS[i] = true;
  }
  
  for (var i in data.data) {
    //remove from delete queue
    delete delIDS[i];
    
    var client = data.data[i];
    var latestLocation = false;
    var lineList = [];
    for (var j in client.locations) {
      if (client.locations[j] != false) {
        latestLocation = client.locations[j].reverse();
        lineList.push(latestLocation);
      }
    }
    
    if (latestLocation) {
      if (markers[i]) {
        markers[i].marker.setLatLng(latestLocation);
        markers[i].track.setLatLngs(lineList);
      } else {        
        markers[i] = {};
        
        markers[i].track = new L.Polyline(lineList, {
          color: 'red',
          weight: 1,
          opacity: 0.5,
          smoothFactor: 1
        });
        markers[i].track.addTo(trackLayer);
        
        markers[i].marker = L.circleMarker(latestLocation,userMarker).addTo(locationLayer);
      }        
    }
    
  }
  
  for (var i in delIDS) {
    locationLayer.removeLayer(markers[i].track);
    trackLayer.removeLayer(markers[i].marker);
    delete markers[i];
  }
  
}

var map;
var locationLayer;
var trackLayer;
var markers = {};

var userMarker = {
  fillColor:"rgb(36, 196, 237)",
  color:"#ffffff",
  weight:2,
  fillOpacity:1,
  opacity:0.6,
  radius:5
};

function setupMap() {
  map = L.map('map').setView([-19.245171, 146.810350], 14);

  trackLayer = L.layerGroup();
  trackLayer.addTo(map); 
  
  locationLayer = L.layerGroup();
  locationLayer.addTo(map);
  
  trackLayer.setZIndex(99);
  locationLayer.setZIndex(0);

  
  
  
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  var Hydda_Full = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
  	attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var positron = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  });

  var Thunderforest_Transport = L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	maxZoom: 19
  });

  var baseMaps = {
  	"Default": Thunderforest_Transport,
  	//"Pokemon": pokeMap,
   	"Map": Hydda_Full, 
  	"Satelite": Esri_WorldImagery
  };
  
  var locationLayers = {
    "markers": locationLayer,
    "tracks": trackLayer
  }
    
  L.control.layers(baseMaps, locationLayers).addTo(map);
}
