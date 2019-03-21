/**
 * Created by Kanthi on 2015-09-11.
 */
'use strict';

var app = angular.module('validateItUserPortalApp');

app.controller('OverviewCtrl', ['$scope', '$rootScope', '$location', '$window', 'httpServerService', 'sideBarService', 'usersService', function($scope, $rootScope, $location, $window, httpServerService,sideBarService, usersService) {
  $scope.userName = usersService.getUserObject().name;
  $scope.teamName = usersService.getUserObject().teamname;
  $scope.headLinks = usersService.getOverviewHeaderLinks(usersService.getUserObject().teamrole);
  $rootScope.unCompletedProcessOnCurrentPage = false;
  $rootScope.currentPage = {
    name: "Overview",
    action: "",
    msgTitle: "",
    onChangeMsg: "",
  }
   // $scope.init = function() {
            console.log("init function of overview called");
            sideBarService.setSelectedByRoute($location.$$path);
            //NProgress.start();
            //getUsersList();
            $scope.teamname = usersService.getUserObject().teamname;
            fetchTeamList();
        // }
  /**
   * Make the service call and put the response JSON data in the modal
   */
  function fetchTeamList() {
    var url = "teamoverview?teamName=" + $scope.teamname;
    httpServerService.makeHttpRequest(url, "get")
      .then(function(response) {
        if (response.status == 200) {
          console.log("team list loaded" + response.data);
          var teamData = response.data;
          $scope.teams = teamData.teams;
          // $scope.managers = usersData.managers;

          var userEmail = usersService.getUserObject().email;

          var users = $scope.users;
          // set the flag for the label style of the teamrole
          // for (var i = 0; i < users.length; i++) {
          //   if (users[i].teamrole == "Manager") {
          //     users[i].label = "label-success";
          //   } else if (users[i].teamrole == "Reviewer") {
          //     users[i].label = "label-info";
          //   } else if (users[i].teamrole == "Employee") {
          //     users[i].label = "label-default";
          //   } else if (users[i].teamrole == "Administrator") {
          //     users[i].label = "label-primary";
          //   } else {
          //     users[i].label = "label-Warning";
          //   }

          //   if (users[i].email == userEmail) {
          //     users[i].disableDelete = true;
          //   };
          // }
        } else {
          // $scope.showErrorMsg = true;
          // $scope.errorMsg = "cannot fetch users list";
        }
      })
  }

  $scope.teams = [{
    "organizationName": "BMO",
    "teamname": "Wealth Management",
    "approvalrequired": 0,
    "balance": 100000,
    "completed": 0,
    "inprogress": 0,
    "numcommunities": 0,
    "numusers": 0,
    "totalnumprojects": 0
  }, {
    "organizationName": "BMO",
    "teamname": "P & C Marketing",
    "approvalrequired": 3,
    "balance": 102000,
    "completed": 5,
    "inprogress": 2,
    "numcommunities": 0,
    "numusers": 0,
    "totalnumprojects": 10
  }, {
    "organizationName": "BMO",
    "teamname": "Wealth Management Marketing",
    "approvalrequired": 0,
    "balance": 130000,
    "completed": 0,
    "inprogress": 0,
    "numcommunities": 0,
    "numusers": 0,
    "totalnumprojects": 0
  }];

  //calculate the percentages of each section of projects
  // for(var i = 0; i < $scope.teams; i++) {
  //   $scope.teams[i].approvalRequiredPercentage = $scope.teams[i].approvalrequired / $scope.teams[i].totalnumprojects;
  //   $scope.teams[i].inProgressPercentage = $scope.teams[i].inprogress / $scope.teams[i].totalnumprojects;
  //   $scope.teams[i].completedPercentage = $scope.teams[i].completed / $scope.teams[i].totalnumprojects;
  // }

  $scope.myData = {
    columns: [
      ['Original', 200000],
      ['Available', 90000]
    ],
    type: 'donut',
    title: "Credits($)",
    legendShow: false
  }

  $scope.sidebar_items = sideBarService.getSideBarItems();

  $scope.changeLocationPathAndSetTeamname = function() {
    usersService.setUserObjectTeamname("Wealth Management"); // set the selected teamname to the UserObject in usersService
    sideBarService.setShowSideBar(true);
    $window.location.assign('/#/project_overview'); //redirect
  };
  //   $scope.changeLocationPathAndSetTeamname = function(index) {
  //   usersService.setUserObjectTeamname($scope.teams[index].teamname); // set the selected teamname to the UserObject in usersService
  //   sideBarService.setShowSideBar(true);
  //   $window.location.assign('/#/project_overview'); //redirect
  // };
}]);