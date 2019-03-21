/**
 * Description: When the user logins successfully, it starts the time out. If there is no interactions(click, mousemove etc.) for some time, then the user will be logged out.
 *              Upon route change, detect if cookie contains object that has the key "userObjectKey". If yes, start the idle detect, otherwise stop it(in the case of login page)
 * 
 * Impotant: this service is injected into AdminCtrl, and the templates(popup dialog) it use are in admin.html(controlled by AdminCtrl)
 *           Therefore, make sure all the pages that a signed in user can see cantain admin.html to ensure the idle detect.
 */
var app = angular.module('validateItUserPortalApp');

app.service('idleService', ['$rootScope', '$window', 'httpServerService', 'usersService', 'Idle', 'Keepalive', '$modal', function($rootScope, $window, httpServerService, usersService, Idle, Keepalive, $modal) {
    $rootScope.started = false;

    function closeModals() {
      if ($rootScope.warning) {
        $rootScope.warning.close();
        $rootScope.warning = null;
      }

      if ($rootScope.timedout) {
        $rootScope.timedout.close();
        $rootScope.timedout = null;
      }
    }

    /**
     * Upon route change, detect if cookie contains object that has the key "userObjectKey". If yes, start the idle detect, otherwise stop it(in the case of login page)
     */
    $rootScope.$on('$routeChangeStart', function() {
      var cookie = usersService.getCookies();
      if (!cookie) {
        $rootScope.ngIdleStop();
      } else {
        $rootScope.ngIdleStop();
        $rootScope.ngIdleStart();
      }
    });

    $rootScope.$on('IdleStart', function() {
      closeModals();

      $rootScope.warning = $modal.open({
        templateUrl: 'warning-dialog.html',
        windowClass: 'modal-danger'
      });
    });

    $rootScope.$on('IdleEnd', function() {
      closeModals();
    });

    $rootScope.$on('IdleTimeout', function() {
      closeModals();
      $rootScope.started = false;

      $rootScope.logOut(); // logout

      var cookies = document.cookie.split(";"); // delete all cookies
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      $rootScope.timedout = $modal.open({
        templateUrl: 'timedout-dialog.html',
        windowClass: 'modal-danger'
      });
    });

    $rootScope.ngIdleStart = function() {
      if (usersService.getCookies) {
        closeModals();
        Idle.watch();
        $rootScope.started = true;
      }
    };

    $rootScope.ngIdleStop = function() {
      closeModals();
      Idle.unwatch();
      $rootScope.started = false;

    };

    /**
     * Function to log out the user
     */
    $rootScope.logOut = function() {
      var url = "logout";
      httpServerService.makeHttpRequest(url, "GET")
        .then(function(response) {
          console.log('The user is logged log due to idle for 5 minutes.');
          usersService.timedOut = true;   // set logout reason: not because of timed out
          usersService.clearUserObjectFields();   // clear the userObject in usersService
          usersService.clearCookies();  // clear the cookies 'userObjectKey', so the ng-idle would not trigger in login page after redirect
          $window.location.assign('/#/login');
        }, function(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          // $window.location.assign('/login');
          $rootScope.loginError = true;

          if (response.status == 400) {
            //The username does not exist.
          } else if (response.status == 403) {
            //The credentials are wrong.
          } else {
            //Cannot reach the server.
          }

        });
      return false;
    };

    /**
     * Description: Immediately involved function. Start the idle detect if user is logged in whenever page is loaded
     */
    (function() {
          var cookie = usersService.getCookies();
      if (!cookie) {
        $rootScope.ngIdleStop();
      } else {
        $rootScope.ngIdleStop();
        $rootScope.ngIdleStart();
      }
    })();

  }])
  .config(function(IdleProvider, KeepaliveProvider) {
    IdleProvider.idle(300); // set the idle time to 5 mins
    IdleProvider.timeout(10); // set the count down time to 10 seconds in the warning period
    KeepaliveProvider.interval(10);
  });