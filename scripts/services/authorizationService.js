/**
 * Description: To determine whether the user has loggen in and have right to access the certain pages
 * Return: promise object
 */

'use strict';
angular.module('validateItUserPortalApp')
	.factory('authorizationService', ['$q', '$rootScope', '$location', 'usersService', function($q, $rootScope, $location, usersService) {

		var AuthorizedRoles = ['M', 'U', 'R', 'A'];
		var permissionPassed = false;

		return {
			// permissionModel: {
			// 	permission: {},
			// 	isPermissionLoaded: false
			// },

			permissionCheck: function() {
				var deferred = $q.defer();

				var userObject = usersService.getUserObject();								
		
				this.getPermission(userObject, deferred);
				return deferred.promise;
			},

			getPermission: function(userObject, deferred) {
				var role;
				if (typeof(userObject) === 'undefined') {
					role = "undefined"
				} else {
					role = userObject.teamrole;
				}

				if (!role || role === "") {
					permissionPassed = false;
				} else if (AuthorizedRoles.indexOf(role) > -1) {	// set permissionPassed to true if the user role is one of the authorized roles
					permissionPassed = true;
				} else {
					permissionPassed = false;
				}
				if (permissionPassed) {
					$zopim(function() {
						if($zopim.livechat.window.getDisplay()===true){
						}else{
							$zopim.livechat.button.show();
						}
					});
					deferred.resolve();
				} else {
					//If user does not have required access, 
					//we will route the user to unauthorized access page
					$rootScope.goto = {
						pageUrl: $location.url(),
						path: $location.path(),
						params: $location.search()
					}

					$zopim(function() {
						//$zopim.livechat.theme.setColor('#337ab7');
						$zopim.livechat.button.setPosition('bl');
						$zopim.livechat.button.setColor('#FFCC00');
						$zopim.livechat.window.setPosition('bl');
						$zopim.livechat.theme.setColors({badge: '#337ab7', primary: '#DDDDDD'});
						$zopim.livechat.theme.reload();
						$zopim.livechat.hideAll();
					});
					$location.path('/login').search({});
					//As there could be some delay when location change event happens, 
					//we will keep a watch on $locationChangeSuccess event
					// and would resolve promise when this event occurs.
					$rootScope.$on('$locationChangeSuccess', function(next, current) {
						deferred.resolve();
					});
				}
			},


		}
	}])