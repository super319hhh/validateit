var app = angular.module('validateItUserPortalApp');

app.directive('donutChart', function() {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    link: function(scope, elem) {
      scope.donutChart = false;

      function drawChart(data) {
        if (typeof scope.data !== 'undefined') {
          return c3.generate({
            bindto: elem[0],
            size: {
              width: 200,
              height: 200
            },
            color: scope.data.color,
            data: scope.data,
            donut: {
              title: scope.data.title,
              label: {
                show: false
              }
            },
            legend: {
              show: false
            },
            tooltip: {
              show: false
            }
          });
        }
      }

      scope.$watch('data', function(data) {
        if (scope.donutChart)
          scope.donutChart.load(data);
        else
          scope.donutChart = drawChart(data);
      }, true);
    }
  }
});

app.directive('barChart', function() {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    link: function(scope, elem) {
      scope.barChart = false;

      function drawChart(data) {
        if (typeof scope.data !== 'undefined') {
          return c3.generate({
            bindto: elem[0],
            padding: data.padding,
            // bar: data.bar,
            // color: {
            //   pattern: ['#3366ff']
            // },
            size: data.size,
            data: data.data,
            axis: data.axis,
            legend: {
              show: true
            },
            tooltip: {
              show: false,
            }
          });
        }
      }

      scope.$watch('data', function(data) {
        console.log("question data changed");
        if (scope.barChart)
          scope.barChart.load(data);
        else
        // scope.barChart = drawChart(data);
          drawChart(data);
      }, true);
    }
  }
});

app.directive('areaChart', function() {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    link: function(scope, elem) {
      scope.areaChart = false;

      function drawChart(data) {
        if (typeof scope.data !== 'undefined') {
          return c3.generate({
            bindto: elem[0],
            // size: {
            //   width: 1300,
            //   height: 200
            // },
            data: scope.data.data,
            legend: {
              show: false
            },
            axis: scope.data.axis,
            // axis: {
            //   x: {
            //     type: 'timeseries',
            //     tick: {
            //       format: '%Y-%m-%d'
            //     }
            //   }
            // }
          });
        }
      }

      scope.$watch('data', function(data) {
        if (scope.areaChart)
          scope.areaChart.load(data);
        else
          scope.areaChart = drawChart(data);
      }, true);
    }
  }
});