/**
 * Created by Kanthi on 17/09/2015.
 */
'use strict';
var app = angular.module('validateItUserPortalApp');
//.value('Papa', Papa);

app.controller('ProjectDetailCtrl',['$scope', '$timeout', '$http','Papa' ,function($scope, $timeout, $http ) {
  $scope.rowHeaders = false;
  $scope.colHeaders = true;


  $scope.filterData = function() {
    $scope.newResidenceData = {
      columns: [
        ['Yes', 20],
        ['No', 70],
        ['Dont know', 10]
      ], type: 'donut'
    }

    $scope.bankData = {
      columns: [
        ['TD',30.4],
        ['RBC', 37.6],
        ['Scotiabank', 23.7],
        ['BMO', 8.8]
      ], type: 'pie'
    }

    $scope.switchData = {
      columns: [
        ['Yes', 40],
        ['No', 50],
        ['Dont know', 10]
      ], type: 'donut'
    }
  }

  $scope.switchData = {
    columns: [
      ['Yes', 80],
      ['No', 10],
      ['Dont know', 10]
    ], type: 'donut'
  }
  $scope.creditCardData = {
    columns: [
      ['TD',30.4],
      ['Scotiabank', 40.7],
      ['BMO', 8.8]
    ], type: 'pie'
  }


  $scope.newResidenceData = {
    columns: [
      ['Yes', 70],
      ['No', 10],
      ['Dont know', 20]
    ], type: 'donut'
  }

  $scope.bankData = {
    columns: [
      ['TD',30.4],
      ['RBC', 13.7],
      ['Scotiabank', 13.7],
      ['BMO', 8.8]
    ], type: 'pie'
  }

  $scope.parseCsvResults = function(results) {
    console.log(results);
  }

  $scope.parseCvsError = function(err, file, inputElem, reason) {
    console.log(err);
  }
  $scope.parseCsv = function(){
    $http.get('docs/Creative_Test.csv').success(function(data) {
     // $scope.self.jsonData = data;

      Papa.parse(data, {
        complete: function (results) {
          var data = results.data;
          console.log(data);
         //$scope.items = data;
          for(var i = 0; i < data.length; i++) {
            var dataObject = data[i];
            var j = 0;
            var newObject = {};
            newObject.id = dataObject[0];
            newObject.time = dataObject[1];
            newObject.gender = dataObject[2];
            newObject.age = dataObject[3];
            newObject.geography = dataObject[4];
            newObject.urbanDensity = dataObject[5];
            newObject.income = dataObject[6];
            $scope.items.push(newObject);
          }
        }
      });

    })};

  $timeout($scope.parseCsv, 1000);



  $scope.items = [
    
    //more items go here
  ];
  // ..or as one object
  $scope.settings = {
    contextMenu: [
      'row_above', 'row_below', 'remove_row'
    ]
  };

}]);
