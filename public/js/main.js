$(document).ready(function(){
  
  
  setupChart();
  getData();
});

function getData() {
  $.getJSON('/live/data',function(data){
    updateData(data);
    setTimeout(getData,2000);
  })
}

function updateData(data) {
  $("#liveUsers").html(data.clients);
  userChart.series[0].setData([data.mobile]);
  userChart.series[1].setData([data.computer]);
  userChart.series[2].setData([data.tablet]);
  
  var max = data.mobile + data.computer + data.tablet;
  //userChart.xAxis[0].setExtremes(0,max);
  
  userChart.redraw();
  
  if (data.timeOnSite.average) {
    var d = new Date();
    var time = d.getTime();
    
    var tos = timeSince(data.timeOnSite.longest.date);
    $('#longest .time').html(tos);
    $('#longest .ip').html(data.timeOnSite.longest.ip);
    
    var tos = timeSince(data.timeOnSite.shortest.date);
    $('#shortest .time').html(tos);
    $('#shortest .ip').html(data.timeOnSite.shortest.ip);
    
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
