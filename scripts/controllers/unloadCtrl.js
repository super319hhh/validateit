/**
 * Created by Yongkeng on 2015-12-02.
 */
'use strict';

var app = angular.module('validateItUserPortalApp');

// app.controller('unloadController', ['$scope', '$http', 'httpServerService', function($scope, $http, httpServerService) {
  
    // app.controller('TestController', ['$scope', function($scope){
    // $scope.$on('onBeforeUnload', function (e, confirmation) {
    //     confirmation.message = "All data willl be lost.";
    //     e.preventDefault();
    // });
    // $scope.$on('onUnload', function (e) {
    //     console.log('leaving page'); // Use 'Preserve Log' option in Console
    // });

// }])

app.controller('unloadController', ['$scope', '$http', 'httpServerService', function($scope, $http, httpServerService) {
    $scope.$on('onBeforeUnload', function(e) {
        // confirmation.message = "All data willl be lost.";
        var loginUrl = httpServerService.getServerPath() + "ws/logout";
        var request = $http({
            method: "get",
            url: loginUrl,
        });
        request.then(function(response) {
        	console.log(response.status);
            alert("Logout Successfully with status code " + response.status);
        }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.])
            $scope.dataFetchMsg = "logout failed";
       

        });

    })


    $scope.$on('onUnload', function(e) {
        // console.log('leaving page'); // Use 'Preserve Log' option in Console
		// e.preventDefault();

        var loginUrl = httpServerService.getServerPath() + "ws/logout";
        var request = $http({
            method: "get",
            url: loginUrl,
        });
        request.then(function(response) {
        	console.log(response.status);
            alert("Logout Successfully with status code " + response.status);
        }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.])
            $scope.dataFetchMsg = "logout failed";
        });
    });
}])
