'use strict';

var phonecatServices = angular.module('userInfoServices', ['ngResource']);

phonecatServices.factory('UserInfo', ['$resource',
  function($resource){
    return $resource('checkUser/:user.json', {}, {
      query: {method:'POST', params:{emailAddress:'email', password: 'password'}, isArray:true}
    });
  }]);
