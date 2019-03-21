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
  //  'summernote',
    'xeditable',
    //'ngPDFViewer',
    'ui.bootstrap',
    'angular.morris-chart',
    //'ngHandsontable',
    //'ngPapaParse',
    'rzModule',
    //'flow',
    'n3-pie-chart',
    'angular-growl',
    'ngFileUpload',
    'ngIdle',
    'angulartics', 
    'angulartics.google.analytics',
    'googlechart',
    // 'googlechart-docs'
    'ngLodash',
  ])  
  .config(function($routeProvider, $locationProvider, $httpProvider, growlProvider) {
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
      }, {
        reloadOnSearch: true
      })
      .when('/forgot_password', {
        templateUrl: 'views/forgot_password.html',
        controller: 'forgotPasswordCtrl',
        controllerAs: 'forgotPassword',
      }, {
        reloadOnSearch: false
      })
      .when('/reset_password', {
        templateUrl: 'views/reset_password.html',
        controller: 'PasswordCtrl',
        controllerAs: 'password',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: true
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      })
      .when('/admin', {
        templateUrl: 'views/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/overview', {
        templateUrl: 'views/admin/overview.html',
        controller: 'OverviewCtrl',
        controllerAs: 'overview',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/team_overview', {
        templateUrl: 'views/admin/team_overview.html',
        controller: 'UsersCtrl',
        controllerAs: 'users',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/balance_overview', {
        templateUrl: 'views/admin/balance_overview.html',
        controller: 'billingCtrl',
        controllerAs: 'balance',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/communities', {
        templateUrl: 'views/admin/communities.html',
        controller: 'CommunitiesCtrl',
        controllerAs: 'communities',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/project_overview/:projectState?', {
        templateUrl: 'views/admin/project_overview.html',
        controller: 'ProjectsCtrl',
        controllerAs: 'projects',
        reloadOnSearch: false, // restrict page to reload if query string is changed
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/project_details/:projectId', {
        templateUrl: 'views/admin/project_details.html',
        controller: 'ProjectDetails',
        controllerAs: 'projectdetails',
        reloadOnSearch: false, // restrict page to reload if query string is changed
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
          reloadOnSearch: false
      })
      .when('/new_project_wizard', {
        templateUrl: 'views/admin/new_project_wizard.html',
        controller: 'NewProjectCtrl',
        controllerAs: 'newProjects',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/employee', {
        templateUrl: 'views/admin/employee.html',
        controller: 'EmployeeCtrl',
        controllerAs: 'employee',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/employee_overview', {
        templateUrl: 'views/admin/employee_overview.html',
        controller: 'EmployeeOverviewCtrl',
        controllerAs: 'employeeOverview',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })
      .when('/activity', {
        templateUrl: 'views/admin/activity.html',
        controller: 'activityCtrl',
        controllerAs: 'activity',
        resolve: {
          permission: function(authorizationService, $route) {
            return authorizationService.permissionCheck();
          }
        }
      }, {
        reloadOnSearch: false
      })

    .otherwise({
      redirectTo: '/login'
    });

    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.cache = false;

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
    growlProvider.globalDisableCountDown(true);
    //growlProvider.onlyUniqueMessages(false);

  })

// .run(function(editableOptions, Idle, $log, Keepalive){
.run(function(editableOptions, $templateCache, $rootScope, $route, $location, $window, $document, ModalService, sideBarService) {
  editableOptions.theme = 'bs3';
  $templateCache.put('templates/growl/growl.html', '<div class="growl-container" ng-class="wrapperClasses()">' + '<div class="growl-item alert" ng-repeat="message in growlMessages.directives[referenceId].messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)"><div class="leftbar"></div>' + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="growlMessages.deleteMessage(message)" ng-show="!message.disableCloseButton">&times;</button>' + '<button type="button" class="close" aria-hidden="true" ng-show="showCountDown(message)">{{message.countdown}}</button>' + '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' + '<div class="growl-message" ng-bind-html="message.text"></div>' + '</div>' + '</div>');

  $rootScope.$on('$locationChangeStart',function(event, newUrl, oldUrl){

    if($rootScope.hasOwnProperty('unCompletedProcessOnCurrentPage')){
      if($rootScope.unCompletedProcessOnCurrentPage===true){
        event.preventDefault();
        ModalService.showModal({
          templateUrl: "views/modal_templates/general.html",
          controller: "dialogCtrl",
          inputs: {
            data: {
              modalTitle: "<b>"+$rootScope.currentPage.msgTitle+"</b>",
              modalText: $rootScope.currentPage.onChangeMsg,
              modalTextClass: "text-lg",
              buttons: {
                custom: {
                  buttonText: "Yes",
                  class: "btn-primary",
                  show: true,
                  noClickFnc: "leaveThisPage",
                  inputs: [],
                },
                cancel: {
                  buttonText: "No",
                  class: "btn-default",
                  show: true,
                  noClickFnc: "",
                  inputs: [],
                }
              },
            }
          },
        }).then(function(modal) {
          modal.close.then(function(result) {
            if (result.result === 'success') {
              if(result.hasOwnProperty("noClickFnc")){
                if(result.noClickFnc==='leaveThisPage'){
                  $rootScope.unCompletedProcessOnCurrentPage = false;
                  ModalService.closeModal(0,newUrl);
                  //$window.location.href = newUrl;
                }else{
                  event.preventDefault();
                }
              }
            }
          });
        });
      }else{
        ModalService.closeModal(0);
      }
    }else{
      $rootScope.unCompletedProcessOnCurrentPage = false;
    }

  });

  // Idle.watch();
  // $log.debug('timeout started.');
});