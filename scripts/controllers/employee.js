/**
 * Created by pijus on 2015-11-26.
 */
'use strict';

/**
 * @ngdoc function
 * @name angularSeedApp.controller:EmployeeOverviewCtrl
 * @description
 * # EmployeeOverviewCtrl
 * Controller of the angularSeedApp
 */

var app = angular.module('validateItUserPortalApp');
app.controller('EmployeeCtrl',['$scope','PDFViewerService','$http', '$location', '$window', 'httpServerService', 'usersService', 'sideBarService', 'changePathService', function($scope, pdf, $http, $location, $window, httpServerService, usersService, sideBarService, changePathService){
    changePathService.setPath("views/admin/employee_overview.html"); // Default loaded page in employee page

    $scope.userName = usersService.getUserObject().name;
    $scope.userRole = usersService.getUserObject().teamrole;
    $scope.userRoleTagClass = usersService.getUserRoleTagClass();
    $scope.headLinks = usersService.getOverviewHeaderLinks(usersService.getUserObject().teamrole);
    $scope.overviewLink = usersService.getOverviewPageLink();
    $scope.getFilePath =  function() {
        return changePathService.getPath();
    }

    $scope.showArrow = [true, false, false, false, false];

    $scope.selected = 0;
    $scope.changePath = function(newPath){
        $window.location.assign(newPath);
    }
}]);
