'use strict';
var app = angular.module('validateItUserPortalApp');

app.controller('activityCtrl', ['$scope', '$rootScope', '$location', 'usersService', 'httpServerService', '$window', 'sideBarService', 'sharedService', function($scope, $rootScope, $location, usersService, httpServerService, $window, sideBarService, sharedService) {

  var pagingArray = []; // object to store the paging's key and value pair
  var pageIndex = 0; // for remembering the current page

  $scope.disableNext = true;
  $scope.disablePrevious = true;
  $scope.displayActivity = false;
  $scope.showPagination = false;
  /**
   * Function that's called when the users page is loaded.
   */
  $scope.init = function() {
      sideBarService.setSelectedByRoute($location.$$path);
      $rootScope.unCompletedProcessOnCurrentPage = false;
      $rootScope.currentPage = {
        name: "Users",
        action: "",
        msgTitle: "",
        onChangeMsg: "",
      }
      $scope.userObject = usersService.getUserObject();

      var today = new Date();
      $scope.fetchActivityByDates(today, today, ''); // load today's activities

      /*------ [Start] Breadcrumb Code -------*/
      $scope.breadcrumb = {
        lists: [{
          name: "Home",
          onClickFnc: "showPageHome('employee_overview')",
        }, {
          name: "Activity",
          onClickFnc: "showActivities()",
        }]
      }
    }
    /* ------ [Start] SideBar Code ------- */
  $scope.teamName = usersService.getUserObject().teamname;
  $scope.sidebar_items = sideBarService.getSideBarItems();
  $scope.showSideBarFn = function() {
    return sideBarService.getShowSideBar();
  }
  sideBarService.setShowSideBar(true);
  $scope.changePath = function(newPath, index) {
    if($rootScope.unCompletedProcessOnCurrentPage===false){
      sideBarService.setShowSideBar(true);
      if (typeof(index) === 'number' || !isNaN(parseFloat(index)) === true) {
        sideBarService.setSelectedIndex(index);
      }
    }
    //console.log(sideBarService.getSideBarItems());
    $window.location.assign(newPath);
  }
    /* ------ [End] SideBar Code ------- */
  $scope.breadcrumbLink = function(homeFnc, index) {
    if (index > 0) {
      $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, index + 1);
    }
    $scope.$eval(homeFnc);
  }
  $scope.showPageHome = function(param) {
    $scope.changePath('/#/' + param, 0);
  };
  $scope.showActivities = function() {};

  $scope.toDate = null;

  $scope.setFromToday = function() {
    $scope.fromDate = new Date();
  };
  $scope.setToToday = function() {
    $scope.toDate = new Date();
  };

  $scope.setFromToday();
  $scope.setToToday();

  $scope.clearFromDate = function() {
    $scope.fromDate = null;
  };
  $scope.clearToDate = function() {
    $scope.toDate = null;
  };

  /**
   * Decription: disable future dates
   */
  $scope.disabled = function(date, mode) {
    return (mode === 'day' && (date > (new Date())));
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);

  $scope.openFromDate = function($event) {
    $scope.status.fromDateOpened = true;
  };
  $scope.openToDate = function($event) {
    $scope.status.toDateOpened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.fromDate = new Date(year, month, day);
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    fromDateOpened: false,
    toDateOpened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [{
      date: tomorrow,
      status: 'full'
    }, {
      date: afterTomorrow,
      status: 'partially'
    }];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };

  /**
   * [fetchActivityByDates: Get activity list by specify from and to dates]
   * @param  {[type]} fromDate [description]
   * @param  {[type]} toDate   [description]
   * @param  {[type]} pageInfo ['': load current page; 'pre': load previous page; 'next': load next page]
   */
  $scope.fetchActivityByDates = function(fromDate, toDate, pageInfo) {
    if (fromDate > toDate) { // reverse the from date and to date if the from date is behide the to date
      var from = toDate;
      var to = fromDate;
    } else {
      var from = fromDate;
      var to = toDate;
    };
    var fromMonth = from.getMonth() + 1;
    var toMonth = to.getMonth() + 1;
    var from = from.getFullYear() + "-" + fromMonth + "-" + from.getDate();
    var to = to.getFullYear() + "-" + toMonth + "-" + to.getDate();

    var url = '';

    if (pageInfo === '') {
      url = "activity?teamName=" + $scope.userObject.teamname + "&startDate=" + from + "&endDate=" + to;
    } else if (pageInfo === 'next') {
      url = "activity?teamName=" + $scope.userObject.teamname + "&startDate=" + from + "&endDate=" + to + "&paging=" + pagingArray[pageIndex];
    } else {
      if (pageIndex < 2) {
        url = "activity?teamName=" + $scope.userObject.teamname + "&startDate=" + from + "&endDate=" + to;
      } else {
        url = "activity?teamName=" + $scope.userObject.teamname + "&startDate=" + from + "&endDate=" + to + "&paging=" + pagingArray[pageIndex - 2];
      }
    }

    httpServerService.makeHttpRequest(url, "GET")
      .then(function(response) {
        console.log("Edit user response" + response.status);
        $(document).scrollTop(0);    // move the page to the top
        var statusCode = response.status;
        if (statusCode === 200) {
          $scope.displayActivity = true;
          console.log("Fetch Activity successfully");
          $scope.employeeActivities = sharedService.formatActivityLogs(response.data.activity);
          var pagingString = response.data.paging;

          if (pagingString) { // if returns paging string
            $scope.showPagination = true;
            $scope.disablePrevious = false; // enable previous button
            $scope.disableNext = false; // todo: enable next button

            if (pageInfo === '') {
              pagingArray = []; // reset
              pageIndex = 0; // reset
              pagingArray.push(pagingString);
              $scope.disablePrevious = true;
            } else if (pageInfo === 'next') {
              pageIndex++;
              if (pagingArray.indexOf(pagingString) < 0) {
                pagingArray.push(pagingString);
              }
            } else {
              if (pageIndex > 1) {
                pageIndex--;
              } else {
                pageIndex = 0;
                $scope.disablePrevious = true; // disable previous button
              }
            }
          } else {
            if (pageInfo === '') {
              $scope.showPagination = false;
              pagingArray = []; // reset
              pageIndex = 0; // reset
              $scope.disablePrevious = true;
            } else {
              pageIndex++;
              if (pageIndex > 0) {
                $scope.disablePrevious = false; // enable previous button
              }
            }
            $scope.disableNext = true; // disable next button
          }
        } else {
          $scope.displayActivity = false;
          console.log("Fetch Activity failed");
        }
      }, function(response) {
        console.log("Fetch Activity failed");
      });
  }



  // $scope.totalItems = 188;
  // $scope.currentPage = 4;
  // $scope.numPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);

  // $scope.itemsPerPage = 15;   // set items to display per page

  // $scope.setPage = function (pageNo) {
  //   $scope.currentPage = pageNo;
  // };

  // $scope.pageChanged = function() {
  //   $log.log('Page changed to: ' + $scope.currentPage);
  // };

  // $scope.maxSize = 5;
}]);
// $scope.isAdminFlag = usersService.getUserObject().isadmin;

// $scope.employeeActivities = usersService.getUserActivity();
// if ($scope.employeeActivities.length > 0) {
//   for (var i = 0; i < $scope.employeeActivities.length; i++) {
//     switch ($scope.employeeActivities[i].activityType) {
//       case "Create":
//         $scope.employeeActivities[i].iconClass = "fa-plus";
//         break;
//       case "Edit":
//         $scope.employeeActivities[i].iconClass = "fa-pencil-square-o";
//         break;
//       case "Approve":
//         $scope.employeeActivities[i].iconClass = "fa-check-circle-o";
//         break;
//       case "Reject":
//         $scope.employeeActivities[i].iconClass = "fa-ban";
//         break;
//       case "Delete":
//         $scope.employeeActivities[i].iconClass = "fa-trash-o";
//         break;
//       default:
//         $scope.employeeActivities[i].iconClass = "fa-info-circle";
//         break;
//     }
//   }
// }