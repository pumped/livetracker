$(document).ready(function(){
  
  
  setupChart();
  setupRequestGraph();
  getData();
});

function getData() {
  $.getJSON('/live/data',function(data){
    updateData(data);
    setTimeout(getData,2000);
  })
}

function updateData(data) {
  console.log(data)
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
            headerFormat: '<span style="font-size:10px">{point.key}0 Seconds Ago</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Requests',
            data: [],
            color: "#3c87ff"
        }]
    });
}
