'use strict';

/**
 * @ngdoc function
 * @name angularSeedApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularSeedApp
 */
angular.module('validateItUserPortalApp')
  .controller('NavAdminCtrl', NavAdminCtrl);

function NavAdminCtrl($scope, $location) {
  $scope.hamburgClicked = hamburgClicked;

  function hamburgClicked() {
    console.log("Hamburg clicked");
    $location.path('/login');
   // $scope.apply();
  }
}
