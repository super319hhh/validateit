/**
 * 
 */

'use strict';

var app = angular.module('validateItUserPortalApp');

	// app.directive('windowExit', ['$http', 'httpServerService', function($window) {
	app.directive('windowExit', function($window, $http, httpServerService) {
	    return {
	        restrict: 'AE',
	        //performance will be improved in compile
	        link: function(element, attrs) {
	            var myEvent = $window.attachEvent || $window.addEventListener,
	                chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compatable

	            myEvent(chkevent, function(e) { 

	            	// For >=IE7, Chrome, Firefox
	                // var confirmationMessage = ' '; // a space
	                // (e || $window.event).returnValue = "Are you sure that you'd like to close the browser?";
	                // return confirmationMessage;
	                // var loginUrl = httpServerService.getServerPath() + "ws/logout";
	                // var request = $http({
	                //     method: "get",
	                //     url: loginUrl,
	                // });

	                // request.then(function(response) {
	                // 	var res = response;
	                // 	console.log(response);
	                // })

		                var confirmationMessage = ' '; // a space
		                (e || $window.event).returnValue = "Are you sure that you'd like to close the browser?";
		                return confirmationMessage;
	            });
	        }
	    };
	})