'use strict';

/**
 * @ngdoc function
 * @name angularSeedApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the angularSeedApp
 */
angular.module('validateItUserPortalApp')
  .controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$location', 'httpServerService', 'usersService', 'sideBarService', 'ModalService', function($rootScope, $scope, $http, $location, httpServerService,
    usersService, sideBarService, ModalService) {
    $scope.user = {
      email: "",
      password: ""
    };
    /* ----- Temporary code to save user email & password in browser cookie: [Start] ----- */
    //deleteAllCookies();
    /*var cemail = getCookie("cemail");
    if (cemail.length > 0) {
      $scope.user.email = cemail;
    }
    var cpass = getCookie("cpassword");
    console.log("Cookie { Email: " + cemail + ", Pass:" + cpass + " }");
    if (cpass.length > 0) {
      $scope.user.password = cpass;
    }*/
    /* ----- Temporary code to save user email & password in browser cookie: [End] ----- */
    $scope.loginError = false;

    $scope.loginErrorMsg = "Invalid Email/Password, Please Try Again.";

    var loginErrorConstants = {
      'emptyUserName': 'Please enter a valid username',
      'emptyPassword': 'Please enter a valid password',
      'wrongCredentials': 'You have entered a invalid username or password, please try again.',
      'nonExistentUser': 'The username does not exist, please contact your administrator or support(support@validateit.com)',
      'nonAdministrator': 'This user is not an administrator. Please uncheck the checkbox or enter the username and password of a valid administrator.' 
    };

    $scope.showModal = false; // flag to show or hide pop up modal for inactive user

    /**
     * Description: Upon page loaded, check timeOut flag at usersService to determine whether the user was redirected to 
     *              login page due to idle. This timeOut flag should be cleared at the end of this function.
     */
    $scope.$on('$viewContentLoaded', function(){
        $scope.showTimedOut = usersService.timedOut;
        console.log($scope.showTimedOut);
        usersService.timedOut = false;    //  clear timeout flag in userService
    });

    /**
     * Function thats called when the user tries to login.
     * @returns
     */
    $scope.submit = function() {
        $scope.showTimedOut = false;  //  Hide the timeout message box if it shows
        sideBarService.setShowSideBar(false);
        $scope.loginError = false;
        NProgress.start();
        console.log("The value of email and password" + $scope.user.email);

        var email = $scope.user.email;
        var password = $scope.user.password;

        if (email == undefined || email.length == 0) {
          $scope.loginError = true;
          $scope.loginErrorMsg = loginErrorConstants.emptyUserName;
          NProgress.done();
          // $scope.apply();
          return;
        }
        if (password == undefined || password.length == 0) {
          $scope.loginError = true;
          $scope.loginErrorMsg = loginErrorConstants.emptyPassword;
          NProgress.done();
          //$scope.apply();
          return;
        }
        var loginUrl = httpServerService.getServerPath() + "ws/login";
        var data = {
            email: email,
            password: password
          }
        if ($scope.isAdmin) {
          data["isAdmin"] = true;
        }
        var request = $http({
          method: "post",
          url: loginUrl,
          //transformRequest: transformRequestAsFormPost,
          data: data
        });

        request.then(function(response) {
          // this callback will be called asynchronously
          // when the response is available
          NProgress.done();
          console.log("Login response" + response);
          console.log(response);
          var loginResponseData = response.data;
          if ((typeof(loginResponseData) != 'undefined' && loginResponseData != null)) {
            usersService.setUserObject(loginResponseData);
              $zopim(function() {
                  $zopim.livechat.button.show();
              });
            console.log(usersService.userObject);
            if (usersService.userObject.isactive === true) {
              if (usersService.userObject.isnewuser === true) {
                $location.path('/reset_password'); // New user redirect to reset password page
              } else {
                /* ----- Temporary code to save user email & password in browser cookie: [Start] ----- */
                /*if (!checkCookie(usersService.userObject.email)) {
                  setCookie("cemail", usersService.userObject.email, 1);
                  setCookie("cpassword", $scope.user.password, 1);
                }*/
                /* ----- Temporary code to save user email & password in browser cookie: [End] ----- */
                  if($rootScope.hasOwnProperty("goto")){
                      if($rootScope.goto.hasOwnProperty("pageUrl") && $rootScope.goto.hasOwnProperty("path")){
                          console.log($rootScope.goto.pageUrl);
                          console.log($rootScope.goto.params);
                          if($rootScope.goto.path.length>0){
                              var _path = $rootScope.goto.path;
                              var _params = $rootScope.goto.params;
                              delete $rootScope.goto;
                              if(Object.keys(_params).length>0){
                                  $location.path(_path).search(_params);
                              }else{
                                  $location.path(_path)
                              }
                          }
                      }
                  }else{
                      var redirectTo = usersService.getUserRedirectPath();
                      $location.path(redirectTo);
                  }

              };
            } else { // if user is inactive, pop up a modal to ask user to contact the manager
              //$scope.showModal = true;
                ModalService.showModal({
                    templateUrl:"views/modal_templates/notification.html",
                    controller: "dialogCtrl",
                    inputs: {
                        data: {
                            modalTitle: "",
                            modalText: "<h4>Sorry, Your account has been disabled.<br ><br >Please contact support@validateit.com if you have any further questions.</h4>",
                            buttonText: "OK"
                        }
                    },
                }).then(function(modal) {
                    modal.close.then(function(result) {});
                });
            }
          }
        }, function(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          NProgress.done();
          //$location.path('/admin');
          $scope.loginError = true;

          if (response.status == 401) {
            //The username does not exist.
            $scope.loginErrorMsg = loginErrorConstants.nonExistentUser;
          } else if (response.status == 403) {
            //The credentials are wrong.
            $scope.loginErrorMsg = loginErrorConstants.wrongCredentials;
          } else if (response.status == 405) {
            //The user is not an administrator but checked the check box
            $scope.loginErrorMsg = loginErrorConstants.nonAdministrator;
          } else {
            //Cannot reach the server.
            $scope.loginErrorMsg = loginErrorConstants.nonExistentUser;
          }
        })
      }

    $scope.toggleModal = function() {
      $scope.showModal = !$scope.showModal;
    }
  }]);

/* ----- Temporary code to save user email & password in browser cookie: [Start] ----- */
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
  //checkCookie(cname)
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

function checkCookie(cname) {
  var user = getCookie(cname),
    ret = false;
  if (user != "") {
    alert("Welcome again " + user);
    ret = true;
  } else {
    /*user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
        setCookie(cname, user, 1);
    }*/
    ret = false;
  }
  return ret;
}

function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
/* ----- Temporary code to save user email & password in browser cookie: [End] ----- */

  //     if(usersService.userObject.isactive===true && usersService.userObject.isnewuser===true){
            //         $location.path('/reset_password');  // New user redirect to reset password page
            //     }else{
            //         /* ----- Temporary code to save user email & password in browser cookie: [Start] ----- */
            //         if(!checkCookie(usersService.userObject.email)){
            //             setCookie("cemail",usersService.userObject.email, 1);
            //             setCookie("cpassword",$scope.user.password, 1);
            //         }
            //         /* ----- Temporary code to save user email & password in browser cookie: [End] ----- */

            //         var redirectTo = usersService.getUserRedirectPath();
            //         $location.path(redirectTo);
            //     }
            // } else {
            //     $scope.loginError = true;
            //     $scope.loginErrorMsg = loginErrorConstants.nonExistentUser;
            // }

      //$location.path('/admin');
      //$scope.loginError = true;
      //setTimeout(function(){

    //do what you need here
    //NProgress.done();

    //$scope.user.email="Thank u";

    //}, 2000);

    // return false;