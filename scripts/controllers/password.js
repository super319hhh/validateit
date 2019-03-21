'use strict';

/**
 * @ngdoc function
 * @name angularSeedApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the angularSeedApp
 */
angular.module('validateItUserPortalApp')
    .controller('PasswordCtrl', ['$scope', '$http', '$location', 'httpServerService', 'usersService', function($scope, $http, $location, httpServerService, usersService) {
        // $scope.user = {
        //     password: "",
        //     confirmPassword: "",
        //     email: usersService.userObject.email
        // };
        $scope.resetPasswordError = false;
        $scope.teamName = usersService.getUserObject().teamname;
        // $scope.resetPasswordErrorMsg = "";

        var resetPasswordErrorMessage = {
            emptyPassword: "Password field is empty. Please enter your new password.",
            emptyConfPassword: "Confirm Password field is empty. Please enter your new password again.",
            passwordMismatch: "Passwords do not match. Please enter the same password and try again.",
            passwordLength: "Password is too short. Minimum password length is 8.",
            serverError: "Password has not changed. Please try again."

        };

        $scope.showPasswordError = false;
        $scope.passwordErrorMsg = "";
        $scope.disableSubmit = true;

        $scope.password = new Password();
        $scope.strengthText = "";
        $scope.progressBarType = "";
        $scope.showStrength = false;

        function Password() {
            this.newPassword = "";
            this.confirmPassword = "";
        }
        /* *
         * Method: validatePassword
         * Parameters:
         * Description: validatePassword method will be invocked as the submit button clicked to check the password before actual submit.
         *              This functions does simple validation on password, like empty string, mismatch password fields, too small password
         * */
        $scope.validatePassword = function() {
            var errorMsg = "";
            if ($scope.password.newPassword.trim() === '') {
                errorMsg = resetPasswordErrorMessage.emptyPassword;
            } else if (typeof $scope.password.confirmPassword == 'undefined' || $scope.password.confirmPassword.trim() === '') {
                errorMsg = resetPasswordErrorMessage.emptyConfPassword;
            } else if ($scope.password.newPassword !== $scope.password.confirmPassword) {
                errorMsg = resetPasswordErrorMessage.passwordMismatch;
            } else if ($scope.password.newpassword == $scope.password.confirmPassword) {
                if ($scope.password.newPassword.trim().length < 8) {
                    errorMsg = resetPasswordErrorMessage.passwordLength;
                }
            }

            if (errorMsg != "") {
                $scope.resetPasswordError = true;
                $scope.passwordErrorMsg = errorMsg;
            } else {
                $scope.resetPasswordError = false;
            }
        }

        /* *
         * Method: resetPassword
         * Parameters:
         * Description: resetPassword method will be invocked when user click reset password button.
         * */
        $scope.resetPassword = function() {
            $scope.resetPasswordError = false;
            $scope.validatePassword();
            console.log("passwords are valid: " + !$scope.resetPasswordError); // log if the passwords are valid and equal

            if ($scope.resetPasswordError === true) {
                return;
            }
            console.log(" -- Reseting Password --");
            //return ;
            NProgress.start();

            var url = "changePassword";
            var uploadData = {
                password: $scope.password.newPassword
            };

            httpServerService.makeHttpRequest(url, "post", uploadData)
                .then(function(response) {
                    if (response.status == 200) {
                        NProgress.done();
                        console.log("---- Reset Password Successfully ----");
                        var redirectTo = usersService.getUserRedirectPath();
                        $location.path(redirectTo);
                    } else {
                        console.log("---- Reset Password ERROR ----");
                        NProgress.done();
                        $scope.resetPasswordError = true;
                        $scope.resetPasswordErrorMsg = resetPasswordErrorMessage.serverError;
                    }
                })
        }

        $scope.checkPasswordStrength = function(password) {
            $scope.disableSubmit = true;

            if (password.length > 0) {
                var result = zxcvbn(password);
                // $scope.result = result.score;
                switch (result.score) {
                    case 0:
                        $scope.percentage = 'width_10';
                        $scope.strengthText = 'Weak';
                        break;
                    case 1:
                        $scope.percentage = 'width_40';
                        $scope.strengthText = 'Weak';
                        $scope.disableSubmit = false;
                        break;
                    case 2:
                        $scope.percentage = 'width_60';
                        $scope.strengthText = 'Normal';
                        $scope.disableSubmit = false;
                        break;
                    case 3:
                        $scope.percentage = 'width_80';
                        $scope.strengthText = 'Good';
                        $scope.disableSubmit = false;
                        break;
                    case 4:
                        $scope.percentage = 'width_100';
                        $scope.strengthText = 'Strong';
                        $scope.disableSubmit = false;
                        break;
                }
                $scope.showStrength = true;
            } else {
                $scope.showStrength = false;
            };
        }
    }]);

// var loginUrl = httpServerService.getServerPath() + "ws/changePassword";
// var request = $http({
//     method: "post",
//     url: loginUrl,
//     //transformRequest: transformRequestAsFormPost,
//     data: {
//         password: $scope.password.newPassword
//     }
// });

// request.then(function(response) {
//     // this callback will be called asynchronously
//     // when the response is available
//     NProgress.done();
//     console.log("---- Reset Password response ----");
//     console.log(response);
//     if(response.status == 200) {
//         var redirectTo = usersService.getUserRedirectPath();
//         $location.path(redirectTo);
//     }
// }, function(response) {
//     // called asynchronously if an error occurs
//     // or server returns response with an error status.
//     console.log("---- ERROR ----");
//     console.log(response);
//     NProgress.done();
//     $scope.resetPasswordError = true;
//     $scope.resetPasswordErrorMsg = resetPasswordErrorMessage.serverError;
// });