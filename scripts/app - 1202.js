'use strict';

/**
 * @ngdoc overview
 * @name angularSeedApp
 * @description
 * # angularSeedApp
 *
 * Main module of the application.
 */
angular
  .module('validateItUserPortalApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'summernote',
    'xeditable',
    'ngPDFViewer',
    'ui.bootstrap',
    'angular.morris-chart',
    'ngHandsontable',
    'ngPapaParse',
    'rzModule',
    'flow',
    // 'ngIdle'  // include ng-idle dependency

  ])
  .controller('EventsCtrl', function($scope, Idle) {
        $scope.events = [];
        $scope.idle = 3;
        $scope.timeout = 3;

        $scope.$on('IdleStart', function() {
          addEvent({event: 'IdleStart', date: new Date()});
        });

        $scope.$on('IdleEnd', function() {
          addEvent({event: 'IdleEnd', date: new Date()});
        });

        $scope.$on('IdleWarn', function(e, countdown) {
          addEvent({event: 'IdleWarn', date: new Date(), countdown: countdown});
        });

        $scope.$on('IdleTimeout', function() {
          addEvent({event: 'IdleTimeout', date: new Date()});
        });

        $scope.$on('Keepalive', function() {
          addEvent({event: 'Keepalive', date: new Date()});
        });

        function addEvent(evt) {
          $scope.$evalAsync(function() {
            $scope.events.push(evt);
          })
        }

        $scope.reset = function() {
          Idle.watch();
        }

        $scope.$watch('idle', function(value) {
          if (value !== null) Idle.setIdle(value);
        });

        $scope.$watch('timeout', function(value) {
          if (value !== null) Idle.setTimeout(value);
        });
      })
  .config(function ( $routeProvider, $locationProvider, $httpProvider) // include ng-idle dependency
  // .config(function ( $routeProvider, $locationProvider, $httpProvider, IdleProvider, KeepaliveProvider) // include ng-idle dependency
    {
    $routeProvider
      //.when('/', {
      //  templateUrl: 'views/main.html',
      //  controller: 'MainCtrl',
      //  controllerAs: 'main'
      //})
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      }, {reloadOnSearch: true})
      .when('/reset_password',{
        templateUrl: 'views/reset_password.html',
        controller: 'PasswordCtrl',
        controllerAs: 'password'
      }, {reloadOnSearch: true})
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/admin', {
        templateUrl: 'admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin'
      }, {reloadOnSearch: false})
      .when('/overview',{
        templateUrl: 'views/admin/overview.html',
        controller: 'OverviewCtrl',
        controllerAs: 'overview'
      }, {reloadOnSearch: false})
        .when('/team_overview',{
          templateUrl: 'views/admin/team_overview.html',
          controller: 'UsersCtrl',
          controllerAs: 'users'
        }, {reloadOnSearch: false})
        .when('/balance_overview',{
          templateUrl: 'views/admin/balance_overview.html',
          controller: 'billingCtrl',
          controllerAs: 'balance'
        }, {reloadOnSearch: false})
        .when('/communities',{
          templateUrl: 'views/admin/communities.html',
          controller: 'CommunitiesCtrl',
          controllerAs: 'communities'
        }, {reloadOnSearch: false})
        .when('/project_overview',{
          templateUrl: 'views/admin/project_overview.html',
          controller: 'ProjectsCtrl',
          controllerAs: 'projects'
        }, {reloadOnSearch: false})
        .when('/new_project_wizard',{
          templateUrl: 'views/admin/new_project_wizard.html',
          controller: 'NewProjectCtrl',
          controllerAs: 'newProjects'
        }, {reloadOnSearch: false})
      .when('/employee',{
        templateUrl: 'views/admin/employee.html',
        controller: 'EmployeeCtrl',
        controllerAs: 'employee'
      }, {reloadOnSearch: false})
      .when('/employee_overview',{
        templateUrl: 'views/admin/employee_overview.html',
        controller: 'EmployeeOverviewCtrl',
        controllerAs: 'employeeOverview'
      }, {reloadOnSearch: false})

      .otherwise({
        redirectTo: '/login'
      });

      $httpProvider.defaults.withCredentials = true;
    //$locationProvider.html5Mode({enabled:true, requireBase: true});
      /*$flowFactoryProvider.defaults = {
          target: 'upload.php',
          permanentErrors: [404, 500, 501],
          maxChunkRetries: 1,
          chunkRetryInterval: 5000,
          simultaneousUploads: 4
      };
      flowFactoryProvider.on('catchAll', function (event) {
          console.log('catchAll', arguments);
      });*/

      // IdleProvider.idle(3);           //set the time out arguments
      // IdleProvider.timeout(3);
      // KeepaliveProvider.interval(6);
  })
  // .factory('beforeUnload', function ($rootScope, $window) {
  //     // Events are broadcast outside the Scope Lifecycle
      
  //     $window.onbeforeunload = function (e) {
  //         var confirmation = {};
  //         var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
  //         if (event.defaultPrevented) {
  //             return confirmation.message;
  //         }
  //     };
      
  //     $window.onunload = function () {
  //         $rootScope.$broadcast('onUnload');
  //     };
  //     return {};
  // })
  // .run(function(editableOptions, Idle, $log, Keepalive){
  .run(function(editableOptions){
    editableOptions.theme = 'bs3';

    // Idle.watch();
    // $log.debug('timeout started.');
  }
);
