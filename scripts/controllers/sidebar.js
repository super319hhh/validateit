/**
 * Created by Kanthi on 19/08/2015.
 */
angular.module('validateItUserPortalApp');

app.controller('SideBarCtrl', ['$scope', 'sideBarService', '$location','$window', function($scope, sideBarService , $location, $window) {



  $scope.changePath = function(newPath, index) {

    sideBarService.setShowSideBar(true);
    $window.location.assign(newPath);

    //$location.path = newPath;
    if(newPath == 'views/admin/overview.html') {
      sideBarService.setShowSideBar(false);
    } else {
      sideBarService.setShowSideBar(true);
    }
    //$scope.sidebar_items[index].selected = true;
    //$scope.$parent.showSideBar = true;
    //$scope.changeSideBarVisibility(true);
    //console.log("The value of showSideBar" + $scope.showSideBar);
    //this.showSideBar = true;
    //console.log("The value of showSideBar" + $scope.showSideBar);
    //$scope.$parent.$parent.showSideBar = true;
    //$scope.filePath = newPath;
    //changePathService.setPath(newPath);
    //$scope.selected = index;
  };
  /*$scope.sidebar_items = [
    {
      name:"Users",
      icon: "fa-user",
      path: "/#/team_overview",
      selected: false
    },
    {
      name: "Billing",
      icon: "fa-dollar",
      path: "/#/balance_overview",
      selected: false
    },
    {
      name: "Projects",
      icon: "fa-book",
      path: "/#/project_overview",
      selected: true
    },

      name: "Question Templates",
      icon: "fa-file-text",
      path: "views/admin/team_question_templates.html"
    },
    {
      name: "Communities",
      icon: "fa-bullseye",
      path: "/#/communities",
      selected: false
    },
    {
      name: "New Project",
      icon: "fa-plus",
      path: "/#/new_project_wizard",
      selected: false
    },

    {
      name: "Import",
      icon: "fa-database",
      path: "views/admin/import_wizard.html"
    }
  ];*/
}]);
