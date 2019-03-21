/**
 * Created by pijus on 2015-11-26.
 */

'use strict';

var app = angular.module('validateItUserPortalApp');

app.controller('EmployeeOverviewCtrl', ['$scope', '$rootScope', '$location', 'usersService', 'httpServerService', '$window', 'sideBarService', 'sharedService', '$timeout', 'ModalService', function($scope, $rootScope, $location, usersService, httpServerService, $window, sideBarService, sharedService, $timeout, ModalService) {
  /**
   * Function that's called when the users page is loaded.
   * This function will make a webservice to call the backend
   * and it will load the data for the users list.
   */
  $scope.init = function() {
    $rootScope.unCompletedProcessOnCurrentPage = false;
    $rootScope.currentPage = {
        name: "Employee Overview",
        action: "",
        msgTitle: "",
        onChangeMsg: "",
    }
    sideBarService.setSelectedByRoute($location.$$path);
    var userObj = usersService.getUserObject();
    $scope.teamname = userObj.teamname;
    $scope.showOverviewCard = false;
    $scope.displayActivity = false;
    $scope.isAdmin = false;
    if (userObj.isadmin) {
      $scope.isAdmin = true;
      if (!userObj.isTeamSelected) {
        $timeout(function() {   //  set delay to make sure the dialog shows
              if($location.path() === "/employee_overview") {
                $scope.showTeamsOptionsModal();
              }
            }, 500);
      } else {
        fetchTeamList($scope.teamname);
      }
    } else {
      fetchTeamList($scope.teamname);
      fetchActivity();
    }
  }
    /* ------ [Start] SideBar Code ------- */
  $scope.sidebar_items = sideBarService.getSideBarItems();
  $scope.showSideBarFn = function() {
    return sideBarService.getShowSideBar();
  }
  sideBarService.setShowSideBar(true);
  $scope.changePath = function(newPath, index) {
      if($rootScope.unCompletedProcessOnCurrentPage===false) {
          sideBarService.setShowSideBar(true);
          if (typeof(index) === 'number' || !isNaN(parseFloat(index)) === true) {
              sideBarService.setSelectedIndex(index);
          }
      }
      //console.log(sideBarService.getSideBarItems());
      $window.location.assign(newPath);
  }
    /* ------ [End] SideBar Code ------- */

  $scope.showTeamsOptionsModal = function() {
    ModalService.showModal({
      templateUrl: "views/modal_templates/teamSelection.html",
      controller: "dialogCtrl",
      inputs: {
        data: {teamList: usersService.getUserObject().companiesList}
      },
    }).then(function(modal) {
        modal.close.then(function(result) {
          if (result.result !== '') {
            usersService.setUserObjectTeamname(result.result);
            usersService.setCookies();
            fetchTeamList(result.result);
          }
        });
    });
  };

  $scope.showActivityPage = function() {
    $scope.changePath('/#/activity', 0);
  }

  $scope.showTheWholeSideBar = function(){
          if(($window.innerWidth>50)&&($window.innerWidth<768)&&($window.innerWidth!=320)&&($window.innerWidth!=360)&&($window.innerWidth!=375)&&($window.innerWidth!=384)&&($window.innerWidth!=412)&&($window.innerWidth!=414)&&($window.innerWidth!=600)){
            $scope.isHided = true;
            $scope.isMoved = true;
          }      
       }

       $scope.hideTheWholeSideBar = function(){
           if(($window.innerWidth>50)&&($window.innerWidth<768)&&($window.innerWidth!=320)&&($window.innerWidth!=360)&&($window.innerWidth!=375)&&($window.innerWidth!=384)&&($window.innerWidth!=412)&&($window.innerWidth!=414)&&($window.innerWidth!=600)){ 
            $scope.isHided = false;
            $scope.isMoved = false;
          }
       }

       $scope.$watch(function(){
          return window.innerWidth;
          }, function(value) {
          if(value>768)
            $scope.isHided = true;
          else if((value<768)&&(value>50))
            $scope.isHided = false;
       });
  
  function fetchTeamList(teamName) {
    var url = "teamoverview?teamName=" + teamName;
    httpServerService.makeHttpRequest(url, "get")
      .then(function(response) {
        if (response.status == 200) {
          console.log("team list loaded" + response.data);
          var teamData = response.data;

          $scope.teamModel = teamData;
          if(!$scope.teamModel.hasOwnProperty('userrequireschanges')){
              $scope.teamModel.userrequireschanges = 0;
          }
          // data for rendering the donut chart
          $scope.myData = {
            color: {
              pattern: ['#5db2ff', '#fb6e52', '#ffce55', '#e75b8d', '#a0d468', '#7e3794']
            },
            columns: [
              ['DRAFT', teamData.draft],
              ['APPROVAL REQUIRED', teamData.approvalrequired],
              ['APPROVED', teamData.approved],
              ['REQUIRES CHANGES', teamData.requireschanges],
              ['COMPLETED', teamData.completed],
              ['IN PROGRESS', teamData.inprogress]
            ],
            type: 'donut',
            labels: false,
            title: '',
            // legendShow: false
          }
        } else {
          $scope.teamDataErrorMsg = "Sorry, the team data connot be fetched."
        }
        $scope.showOverviewCard = true;
      })
  }

  function fetchActivity() {
    var url = "recentActivity?teamName=" + usersService.getUserObject().teamname;
    httpServerService.makeHttpRequest(url, "GET")
      .then(function(response) {
        var statusCode = response.status;
        console.log(response.data);
        if (statusCode === 200) {
          console.log("Fetch Activity successfully");
          $scope.displayActivity = true;
          $scope.employeeActivities = sharedService.formatActivityLogs(response.data);
        } else {
          $scope.displayActivity = false;
          console.log("Fetch Activity failed");
        }
      }, function(response) {
        console.log("Fetch Activity failed");
      });
  }

  $scope.redirectToProject = function(status) {
    /*sharedService.setProjectRedirectedTo(true);
    sharedService.setDisplayProjectList(status);
    $timeout(function() {
      $scope.changePath('/#/project_overview');
    }, 200);*/
      $scope.changePath('/#/project_overview/'+status);
  }

  // $scope.userName = usersService.getUserObject().name;
  // $scope.isAdminFlag = usersService.getUserObject().isadmin;

  // $scope.employeeActivities = usersService.getUserActivity();
}]);