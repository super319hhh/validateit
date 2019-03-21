/**
 * Created by Kanthi on 21/09/2015.
 */

'use strict';
var app = angular.module('validateItUserPortalApp');
//.value('Papa', Papa);

app.controller('ImportDataCtrl',['$scope', '$timeout', '$http','Papa','questionTemplateService','changePathService',
  function($scope, $timeout, $http, $questionTemplateService, $changePathService) {

  $scope.disabledButtons = [true, true, true, true];
  $scope.disabledButtons[0] = false;
  $scope.currentStep = 0;


  //$scope.metaDataDescription = "";

  $scope.tabs = [
    { title:'Dynamic Title 1', content:'Dynamic content 1' },
    { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
  ];

  $scope.items = [

    //more items go here
  ];

  $scope.surveyItems = [

  ];

    $scope.combinedItems = [

    ];

  $scope.filterOptions = [
    {
      number: "AND",
      active:true
    },
    {
      number: "OR",
      active:false
    }
  ]
  $scope.dbServer = "192.168.0.20";

  $scope.dbUserName = "admin";
  $scope.dbPassword = "Test123";

  $scope.rowHeaders = false;
  $scope.colHeaders = true;

  $scope.showAddQuestionFlag = false;
  $scope.showSurveyTabFlag = false;
  $scope.showFilterColumnFlag = false;
  $scope.showCombineFlag = false;

    $scope.metaDataDescription = "";
    $scope.afterOnCellMouseDown = function(event, coords, TD) {
      console.log("afterOnCellMouseDown");

      if(coords.row == -1 && coords.col == 0) {
        $scope.metaDataDescription = "Date: The date on which the transaction occured.";
        $scope.$apply();
      } else if(coords.row == -1 && coords.col == 1) {
        $scope.metaDataDescription = "# Transactions: Number of credit card transactions performed by the customer.";
        $scope.$apply();
      } else if(coords.row == -1 && coords.col == 2) {
        $scope.metaDataDescription = "Product: The Product type that was purchased.";
        $scope.$apply();
      } else if(coords.row == -1 && coords.col == 3) {
        $scope.metaDataDescription = "Price: Price of the transaction performed";
        $scope.$apply();
      } else if(coords.row == -1 && coords.col == 4) {
        $scope.metaDataDescription = "Payment Type: Credit Card used for performing the transaction(Visa/MasterCard/AMEX)";
        $scope.$apply();
      }else if(coords.row == -1 && coords.col == 5) {
        $scope.metaDataDescription = "Name: Customer's name as per billing information";
        $scope.$apply();
      }else if(coords.row == -1 && coords.col == 6) {
        $scope.metaDataDescription = "City: Customer's city as per billing information, Note: This is not the transaction location";
        $scope.$apply();
      }
    }
  $scope.onAfterSelection = function(row, col, row2, col2) {

    console.log('onAfterSelection call => row:' + row + ', col: ' + col + ', row2: ' + row2 + ', col2: ' + col2);

    if(col2 == 3 && col == 2) {
     $scope.showFilterColumnFlag = true;
      $scope.showCombineFlag = false;
    }
    else if(col == 6 && row == 0) {
      console.log("Column selected");
      $scope.showAddQuestionFlag = true;
    }
    else
    {
      $scope.showFilterColumnFlag = false;
      $scope.showCombineFlag = false;
    }
  };

  $scope.showQuestionTemplates = function() {
    $changePathService.setPath('questionTemplates')
  }
  $scope.onAfterContextMenuExecute = function() {
    console.log("Context menu executed");
  }

  $scope.addSurveyData = function() {
    $scope.showSurveyTabFlag = true;
  }

  $scope.showCombinedTabFlag = false;

  $scope.combineSurveyData = function() {
    $scope.showCombinedTabFlag = true;
  }
  $scope.addSheet = function() {
    $scope.showAddFlag = false;
    $scope.showFilterFlag = false;
    $scope.showCombineFlag = true;
    $scope.showFilterColumnFlag = false;
    $scope.showAddQuestionFlag = false;
  }

  $scope.combineSheet = function() {
    $scope.showCombineFlag = false;
    $scope.showFilterFlag = false;
    $scope.showFilterColumnFlag = false;
    $scope.showAddFlag = true;
    $scope.showAddQuestionFlag = false;
  }

  $scope.filterSheet = function() {
    $scope.showFilterFlag = !$scope.showFilterFlag;
    //$scope.showAddFlag = false;
    //$scope.showCombineFlag = false;
    //$scope.showFilterColumnFlag = false;
  }

  $scope.addQuestion = function(product, paymentType, country, state) {
   // changePath('views/admin/project_overview.html');


    var matchedItems = [];
    for(var i = 0; i < $scope.items.length; i++) {
      var dataObject = $scope.items[i];

      if(product == dataObject.product && paymentType == dataObject.payment_type && country == dataObject.country
      && state == dataObject.state) {
        matchedItems.push(dataObject);
      }
    }
    //$scope.items = [];
    //$scope.items.length = 0;

    $scope.items = matchedItems;
  }

  $scope.settings = {
    contextMenu: [
      //'row_above', 'row_below', 'remove_row'
      'Add Question'
    ]
  };

  $scope.combinedSurveyDataClick = function() {
    $timeout($scope.parseCombinedCsv, 1000);
  }

  $scope.onSurveyDataTabClick = function() {
    $timeout($scope.parseSurveyDataCsv, 1000);
  }

  $scope.parseCsvResults = function(results) {
    console.log(results);
  }

  $scope.parseCvsError = function(err, file, inputElem, reason) {
    console.log(err);
  }

  $scope.parseSurveyDataCsv = function(){
    $http.get('docs/SurveyData.csv').success(function(data) {
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
            newObject.paymentType = dataObject[7];
            $scope.surveyItems.push(newObject);
          }
        }
      });

      $scope.metaDataDescription = "";
      $scope.apply();
    })};

    $scope.parseCombinedCsv = function(){
      $http.get('docs/combined.csv').success(function(data) {
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
              newObject.date = dataObject[0];
              newObject.product = dataObject[1];
              newObject.price = dataObject[2];
              newObject.payment_type = dataObject[3];
              newObject.name = dataObject[4];
              newObject.city = dataObject[5];
              newObject.state = dataObject[6];
              newObject.country = dataObject[7];
              newObject.accountCreated = dataObject[8];
              newObject.lastLogin = dataObject[9];
              newObject.latitude = dataObject[10];
              newObject.gender = dataObject[13];
              newObject.age = dataObject[14];
              newObject.geography = dataObject[15];
              newObject.urbanDensity = dataObject[16];
              newObject.income = dataObject[17];
              newObject.paymentType = dataObject[18];
              $scope.combinedItems.push(newObject);
            }
          }
        });
      })};


  $scope.parseCsv = function(){
    $http.get('docs/SalesJan2009.csv').success(function(data) {
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
            newObject.date = dataObject[0];
            newObject.product = dataObject[1];
            newObject.noTransactions = dataObject[2];
            newObject.price = dataObject[3];
            newObject.payment_type = dataObject[4];
            newObject.name = dataObject[5];
            newObject.city = dataObject[6];
            newObject.state = dataObject[7];
            newObject.country = dataObject[8];
            newObject.accountCreated = dataObject[9];
            newObject.lastLogin = dataObject[10];
            newObject.latitude = dataObject[11];
            newObject.longitude = dataObject[12];
            $scope.items.push(newObject);
          }
        }
      });

    })};

 // $timeout($scope.parseCsv, 1000);


  $scope.showDBTablesFlag = true;

  $scope.connectToServer = function() {
    $scope.showDBTablesFlag = !$scope.showDBTablesFlag;
  }
  $scope.nextStep = function() {
    //$scope.emptyProjectNameErrorFlag = false;
    if($scope.currentStep === 3) {

    }
    else {
      if($scope.currentStep == 0) {

        $timeout($scope.parseCsv, 1000);

        //console.log("The value of project name" + $scope.projectName.text);
        //if($scope.projectNameInput.length == 0) {
        //  //console.log("Error length");
        //  $scope.emptyProjectNameErrorFlag = true;
        //  return;
        //}
        //
      }

      $scope.currentStep++;
      for(var i = 0; i < $scope.disabledButtons.length; i++) {
        if(i === $scope.currentStep) {
          $scope.disabledButtons[i] = false;
        } else {
          $scope.disabledButtons[i] = true;
        }
      }
    }

  }


  $scope.prevStep = function() {
    if($scope.currentStep === 0) {

    } else {
      $scope.currentStep--;
      for(var i = 0; i < $scope.disabledButtons.length; i++) {
        if(i === $scope.currentStep) {
          $scope.disabledButtons[i] = false;
        } else {
          $scope.disabledButtons[i] = true;
        }
      }
    }
  }


}]);
