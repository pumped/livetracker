$(document).ready(function(){
  
  setInterval(function(){
    getData();
  },2000);
  
  setupChart();
});

function getData() {
  $.getJSON('/live/data',function(data){
    updateData(data);
  })
}

function updateData(data) {
  console.log(data);
  $("#liveUsers").html(data.clients);
  userChart.series[0].setData([data.mobile]);
  userChart.series[1].setData([data.computer]);
  userChart.series[2].setData([data.tablet]);
  var max = data.mobile + data.computer + data.tablet;
  userChart.yAxis[0].setExtremes(0,max);
  userChart.redraw();
  console.log(userChart);
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
            tickLength: 0
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
                stacking: 'normal'
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
