/**
 * Created by Kanthi on 25/08/2015.
 */
var app = angular.module('validateItUserPortalApp');

app.controller('UsersCtrl', ['$scope', '$rootScope', '$location', '$http', 'httpServerService', '$window', 'sideBarService', 'usersService', 'loadingDialogService', 'ModalService', 'growl',
    function($scope, $rootScope, $location, $http, httpServerService, $window, sideBarService, usersService, loadingDialogService, ModalService, growl) {

        console.log("user controller loaded");
        /* ------ [Start] SideBar Code ------- */
        $scope.teamName = usersService.getUserObject().teamname;
        $scope.sidebar_items = sideBarService.getSideBarItems();
        console.log($scope.sidebar_items);
        $scope.showSideBarFn = function() {
            return sideBarService.getShowSideBar();
        }
        sideBarService.setShowSideBar(true);
        $scope.changePath = function(newPath, index) {
            if($rootScope.unCompletedProcessOnCurrentPage===false){
                sideBarService.setShowSideBar(true);
                sideBarService.setSelectedIndex(index);
            }
            $window.location.assign(newPath);
        };
        /* ------ [End] S1ideBar Code ------- */

        /**
         * set initial status of the page
         */
        function initialReset() {
            $scope.activeForm = "view users";
            $scope.showNewUserButtonFlag = true;
            $scope.showErrorMsg = false;
            $scope.showUserTableFlag = true;
            $scope.users = null;
            $scope.managers = null;
            $scope.managersForEditUser = null;

            $scope.resetPasswordMsg = "";

            $scope.showEditUserFormFlag = false;
            $scope.showEditUserError = false;
            $scope.editUserErrorMsg = "";

            $scope.showNewUserFormFlag = false;
            $scope.newUserFormValid = false; //flag of new user form valid
            $scope.newUserFailure = "";
            $scope.showNewUserFormErrorFlag = false;
            $scope.newUserFormErrorMsg = "";
        }

        /**
         * Function that's called when the users page is loaded.
         * This function will make a webservice to call the backend
         * and it will load the data for the users list.
         */
        $scope.init = function() {
            $rootScope.unCompletedProcessOnCurrentPage = false;
            $rootScope.currentPage = {
                name: "Users",
                action: "",
                msgTitle: "",
                onChangeMsg: "",
            }
            console.log("init function called");
            initialReset();
            sideBarService.setSelectedByRoute($location.$$path);
            NProgress.start();
            //getUsersList();
            $scope.teamName = usersService.getUserObject().teamname;
            fetchUsersList(); // get the users data to display in the users table
            NProgress.done();

            /*------ [Start] Breadcrumb Code -------*/
            $scope.breadcrumb = {
                    lists: [{
                        name: "Home",
                        onClickFnc: "showPageHome('employee_overview')",
                    }, {
                        name: "Users",
                        onClickFnc: "showUsers()",
                    }]
                }
                /*------ [End] Breadcrumb Code -------*/
        }

        $scope.breadcrumbLink = function(homeFnc, index) {
            if (index > 0) {
                $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, index + 1);
            }
            $scope.$eval(homeFnc);
        }
        $scope.showPageHome = function(param) {
            $scope.changePath('/#/' + param, 0);
        }

        $scope.newUserData = new resetNewUserData();

        function resetNewUserData() {
            this.firstName = "";
            this.lastName = "";
            this.email = "";          
            this.status = {
                availableOptions: [
                    {name: 'Active'},
                    {name: 'Inactive'}
                ],
                selectedOption: {
                    // id: '1',
                    name: 'Active'
                } //This sets the default value of the select in the ui
            };
            this.language = {
                availableOptions: [{
                    name: 'English'
                }, {
                    name: 'French'
                }, ],
                selectedOption: {
                    name: 'English'
                } //This sets the default value of the select in the ui
            };
            this.manageremail = "";
            this.teamrole = "";
        };

        var ErrorMsgs = {
            firstName: "Please enter a First Name.",
            lastName: "Please enter a Last Name.",
            email: "Please enter an Email Address.",
            status: "Status of the user",
            language: "Language of the user",
            manageremail: "Please select a Manager.",
            teamrole: "Please select a Role.",
        };

        /**
         * Function to log out the user
         */
        $scope.getUsersList = function() { // Todo: maybe change the function name?
            var request = $http({
                method: "post",
                url: "http://localhost:8080/ws/logOut"
            });

            request.then(function(response) {
                // this callback will be called asynchronously
                // when the response is available

                $location.path('/admin');
            }, function(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                //$location.path('/admin');
                $scope.loginError = true;

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

        // $scope.teamName = usersService.getUserObject().teamname;
        /**
         * Make the service call and put the response JSON data in the modal
         */
        function fetchUsersList() {
            // var url = "usersList?teamName=" + $scope.teamName;
            var url = "usersList?teamName=" + $scope.teamName;
            httpServerService.makeHttpRequest(url, "get")
                .then(function(response) {
                    if (response.status == 200) {
                        console.log("users list loaded" + response.data);
                        var usersData = response.data;
                        $scope.users = usersData.users;
                        $scope.managers = usersData.managers;

                        var userEmail = usersService.getUserObject().email;

                        var users = $scope.users;
                        // set the flag for the label style of the teamrole
                        for (var i = 0; i < users.length; i++) {
                            if (users[i].teamrole == "Manager") {
                                users[i].label = "label-success";
                            } else if (users[i].teamrole == "Reviewer") {
                                users[i].label = "label-info";
                            } else if (users[i].teamrole == "User") {
                                users[i].label = "label-default";
                            } else if (users[i].teamrole == "A") {
                                users[i].label = "label-primary";
                            } else {
                                users[i].label = "label-Warning";
                            }

                            if (users[i].email == userEmail) {
                                users[i].disableDelete = true;
                            };

                            if (users.length == 0) {
                                $scope.noRecords = true;
                                $scope.noRecordsText = "No users found";
                            } else {
                                $scope.noRecords = false;
                                $scope.noRecordsText = "";
                            }
                        }
                    } else {
                        $scope.showErrorMsg = true;
                        $scope.errorMsg = "cannot fetch users list";
                    }
                })
        }

        /**
         * Click the Users Link
         */
        $scope.showUsers = function() {
            $scope.showUserTableFlag = true;
            $scope.showNewUserFormFlag = false;
            $scope.showEditUserFormFlag = false;
            $scope.activeForm = "view users";
            $scope.showNewUserButtonFlag = true;
            $scope.selectedUser = null;

            $scope.breadcrumb = {
                lists: [{
                    name: "Home",
                    onClickFnc: "showPageHome('employee_overview')",
                }, {
                    name: "Users",
                    onClickFnc: "showUsers()",
                }]
            }
        };
        /**
         * Create User
         */
        $scope.addNewUser = function() {
            $scope.showUserTableFlag = false;
            $scope.showErrorMsg = false;
            $scope.showNewUserFormErrorFlag = false;
            $scope.showNewUserFormFlag = true;
            $scope.tableHeader = "New User";
            $scope.activeForm = "New User";
            $scope.showNewUserButtonFlag = false;

            $scope.breadcrumb = {
                lists: [{
                    name: "Home",
                    onClickFnc: "showPageHome('employee_overview')",
                }, {
                    name: "Users",
                    onClickFnc: "showUsers()",
                }, {
                    name: "New User",
                    onClickFnc: "addNewUser()",
                }]
            }
            $scope.newUserData = new resetNewUserData();
        };

        $scope.submitNewUser = function() {
            $scope.newUserData.email = $scope.newUserData.email.toLowerCase();

            formValidate($scope.newUserData); //form validation

            var uploadObj = {}; //object to be submit
            if (!$scope.newUserFormValid) { //if form has error, show error bar
                $scope.showNewUserFormErrorFlag = true; //if form valid, post the form
            } else {
                $scope.showNewUserFormErrorFlag = false; //if form valid, post the form

                for (var prop in $scope.newUserData) { // copy fields to upload object
                    if (prop === 'language' || prop === 'status') {
                        continue;
                    } else {
                        uploadObj[prop] = $scope.newUserData[prop];
                    }
                }
                // uploadObj.status = $scope.newUserData.status.selectedOption.name;
                // uploadObj.language = $scope.newUserData.language.selectedOption.name;

                // process submited data
                if ($scope.newUserData.status.selectedOption.name == "Active") {
                    uploadObj.active = true;
                } else {
                    uploadObj.active = false;
                }
                if ($scope.newUserData.language.selectedOption.name == "English") {
                    uploadObj.language = "English";
                } else {
                    uploadObj.language = "French";
                }

                //construct the upload data
                var userObject = usersService.getUserObject();
                uploadObj.teamname = userObject.teamname;
                uploadObj.teamshortname = userObject.teamshortname;
                uploadObj.userfirstname = userObject.firstname;
                uploadObj.userlastname = userObject.lastname;

                if ($scope.newUserData.teamrole !== "Manager") {
                    uploadObj.manageremail = $scope.newUserData.manageremail; // find the manager's full name according to the email
                    for (var i = $scope.managers.length - 1; i >= 0; i--) {
                        if ($scope.managers[i].email == $scope.newUserData.manageremail) {
                            uploadObj.managerfirstname = $scope.managers[i].name.firstname;
                            uploadObj.managerlastname = $scope.managers[i].name.lastname;
                            // uploadObj.manageremail = $scope.managers[i].email;
                        }
                    }
                } else {
                    uploadObj.manageremail = $scope.newUserData.manageremail;
                    uploadObj.managerfirstname = $scope.newUserData.firstName;
                    uploadObj.managerlastname = $scope.newUserData.lastName;
                }

                loadingDialogService.showProcessingPleaseWait('Creating User. Please wait...'); // display the processing dialog
                /**
                 * Post request to submit the new user form
                 */
                var url = "user";
                httpServerService.makeHttpRequest(url, "POST", uploadObj)
                    .then(function(response) {
                        if (response.status == 200) {
                            console.log("user created successfully" + uploadObj.email );

                            fetchUsersList(); // retrieve the updated users list by making a new service call
                            $scope.showUsers();
                            growl.info("You have successfully created a new user for <b>"+uploadObj.firstName+" "+uploadObj.lastName+"</b>",{ttl: 5000});
                            $scope.newUserData = new resetNewUserData();
                            setTimeout(function() {
                                loadingDialogService.hideProcessingPleaseWait();
                            }, 300); // disappear the processing dialog
                        } else if (response.status == 470) { // Todo: 470 cannot be caught due to cross domain issue. Check id this works properly after that is solved
                            $scope.showNewUserFormErrorFlag = true;
                            $scope.newUserFailure = "Oops! The email address you entered already exists. Please try another one."
                            setTimeout(function() {
                                loadingDialogService.hideProcessingPleaseWait();
                            }, 300); // disappear the processing dialog
                        } else {
                            $scope.showNewUserFormErrorFlag = true;
                            $scope.newUserFailure = httpServerService.getDefaultErrorMessage();
                            setTimeout(function() {
                                loadingDialogService.hideProcessingPleaseWait();
                            }, 300); // disappear the processing dialog
                        }
                    })
            };
            // loadingDialogService.hideProcessingPleaseWait(); // disappear the processing dialog
        };

        $scope.isManagerNewUserForm = function() {
            if ($scope.newUserData.teamrole === "Manager") {
                $scope.newUserData.manageremail = $scope.newUserData.email; // must do this first to let manageremail field pass the validtion
            } else {
                $scope.newUserData.manageremail = "";
            };
        }
        $scope.isManagerEditUserForm = function() {
            if ($scope.editUserData.teamrole === "Manager") {
                $scope.editUserData.manageremail = $scope.selectedUser.email; // must do this first to let manageremail field pass the validtion
            } else {
                $scope.editUserData.manageremail = "";
            };
        }

        $scope.showDeleteUserModal = function(index) {
            $scope.selectedIndex = index;
            var username = $scope.users[index].name.firstname + ' ' + $scope.users[index].name.lastname;
            ModalService.showModal({
                templateUrl: "views/modal_templates/confirm.html",
                controller: "dialogCtrl",
                inputs: {
                    data: {
                        modalTitle: "Delete User",
                        modalText: "Are you sure to delete " + username + "? This cannot be undone.",
                        buttonText: "Delete",
                    }
                },
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result.result === 'delete') {
                        $scope.deleteUser();
                    }
                });
            });
        }

        /**
         * Delete User
         */
        $scope.deleteUser = function() {
            console.log("Deleting User " + $scope.users[$scope.selectedIndex].name.firstname + " " + $scope.users[$scope.selectedIndex].name.lastname);
            var teamnameStr = "teamname=" + $scope.users[$scope.selectedIndex].teamname;
            var emailStr = "useremail=" + $scope.users[$scope.selectedIndex].email;
            loadingDialogService.showProcessingPleaseWait('Deleting user. Please Wait...');
            var url = "user?" + "teamname=" + $scope.users[$scope.selectedIndex].teamname + "&useremail=" + $scope.users[$scope.selectedIndex].email+"&firstname="+$scope.users[$scope.selectedIndex].name.firstname+"&lastname="+$scope.users[$scope.selectedIndex].name.lastname;
            httpServerService.makeHttpRequest(url, "DELETE")
                .then(function(response) {
                    if (response.status == 200) {
                        fetchUsersList(); // retrieve the updated users list by making a new service call
                        growl.info("You have successfully deleted user account for <b>"+$scope.users[$scope.selectedIndex].name.firstname +" "+$scope.users[$scope.selectedIndex].name.lastname +"</b>",{ttl: 5000});
                        setTimeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 300);
                    } else {
                        $scope.showErrorMsg = true;
                        $scope.errorMsg =  httpServerService.getDefaultErrorMessage();
                        setTimeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 300);

                    }
                })
        }

        $scope.cancelNewUser = function() {
            $scope.newUserData = new resetNewUserData();
            $scope.showUsers();
        };

        /**
         * Edit User
         */
        $scope.editUserData = new resetEditUserData();

        function resetEditUserData() {
            this.firstName = "";
            this.lastName = "";
            this.statusOptions = [{id: 0, text:'Active'}, {id:1, text:'Inactive'}];
            this.languageOptions = [{id: 0, text:'English'}, {id:1, text:'French'}];
            this.selectedStatus = {};
            this.selectedLanguage = {};
            this.manageremail = "";
            this.teamrole = "";
        };

        $scope.editUser = function(index) {
            $scope.editUserData = new resetEditUserData(); // reset the form
            $scope.selectedUser = $scope.users[index];
            if($scope.users[index].hasOwnProperty('isactive')){
                if ($scope.users[index].isactive) {
                    $scope.selectedUser.status = 'Active';
                    $scope.editUserData.selectedStatus = $scope.editUserData.statusOptions[0];
                } else {
                    $scope.selectedUser.status = 'Inactive';
                    $scope.editUserData.selectedStatus = $scope.editUserData.statusOptions[1];
                }
            }

            if($scope.users[index].hasOwnProperty('language')){
                if($scope.users[index].language==='English'){
                    $scope.editUserData.selectedLanguage = $scope.editUserData.languageOptions[0];
                }else{
                    $scope.editUserData.selectedLanguage = $scope.editUserData.languageOptions[1];
                }
            }

            $scope.editUserData.firstName = $scope.selectedUser.name.firstname;
            $scope.editUserData.lastName = $scope.selectedUser.name.lastname;
            $scope.editUserData.teamrole = $scope.selectedUser.teamrole; // Solved ng-checked doesn't bind data to model
            $scope.editUserData.manageremail = $scope.selectedUser.manageremail; // Solved ng-selected doesn't bind data to model

            $scope.showEditUserError = false;
            $scope.showEditUserFormFlag = true;
            $scope.showUserTableFlag = false;
            $scope.showNewUserFormFlag = false;
            $scope.tableHeader = $scope.users[index].email;
            $scope.activeForm = "Edit User";
            $scope.showNewUserButtonFlag = false;

            $scope.managersForEditUser = new Array($scope.managers.length);
            for (var i = $scope.managers.length - 1; i >= 0; i--) {
                $scope.managersForEditUser[i] = $scope.managers[i];
            };
            if ($scope.selectedUser.teamrole === "Manager") { // if the selected user is a manager, then his email should not be in the manager list
                for (var i = $scope.managersForEditUser.length - 1; i >= 0; i--) {
                    if ($scope.managersForEditUser[i].email === $scope.selectedUser.email) {
                        $scope.managersForEditUser.splice(i, 1);
                    };
                };
            }
            // $scope.editUserData.manageremail =

            $scope.breadcrumb = {
                lists: [{
                    name: "Home",
                    onClickFnc: "showPageHome('employee_overview')",
                }, {
                    name: "Users",
                    onClickFnc: "showUsers()",
                }, {
                    name: $scope.selectedUser.name.firstname + " " + $scope.selectedUser.name.lastname,
                    onClickFnc: "",
                }]
            }
        }

        $scope.editSubmit = function() {
            $scope.showEditUserError = false; //reset

            // validation for edit form
            for (var prop in $scope.editUserData) {
                if (isEmpty($scope.editUserData[prop])) {
                    $scope.showEditUserError = true;
                    $scope.editUserErrorMsg = ErrorMsgs[prop]
                    return;
                }
            };

            var userUpObj = {}; //object to be submit
            userUpObj.firstName = $scope.editUserData.firstName;
            userUpObj.lastName = $scope.editUserData.lastName;
            userUpObj.teamrole = $scope.editUserData.teamrole;


            // process submited data
            if ($scope.editUserData.selectedStatus.text == "Active") {
                userUpObj.active = true;
            } else {
                userUpObj.active = false;
            }
            if ($scope.editUserData.selectedLanguage.text == "English") {
                userUpObj.language = "English";
            } else {
                userUpObj.language = "French";
            }

            //construct the upload data
            var userObject = usersService.getUserObject();
            userUpObj.teamname = userObject.teamname;
            userUpObj.teamshortname = userObject.teamshortname;
            userUpObj.userfirstname = userObject.firstname;
            userUpObj.userlastname = userObject.lastname;

            userUpObj.email = $scope.selectedUser.email;

            // uploadObj.manageremail = $scope.editUserData.manageremail; // find the manager's full name according to the email
            // for (var i = $scope.managers.length - 1; i >= 0; i--) {
            //     if ($scope.managers[i].email == $scope.editUserData.manageremail) {
            //         uploadObj.managerfirstname = $scope.managers[i].name.firstname;
            //         uploadObj.managerlastname = $scope.managers[i].name.lastname;
            //         // uploadObj.manageremail = $scope.managers[i].email;
            //     };
            // };

            if ($scope.editUserData.teamrole !== "Manager") {
                userUpObj.manageremail = $scope.editUserData.manageremail; // find the manager's full name according to the email
                for (var i = $scope.managers.length - 1; i >= 0; i--) {
                    if ($scope.managers[i].email == $scope.editUserData.manageremail) {
                        userUpObj.managerfirstname = $scope.managers[i].name.firstname;
                        userUpObj.managerlastname = $scope.managers[i].name.lastname;
                    }
                }
            } else {
                userUpObj.manageremail = $scope.editUserData.manageremail;
                userUpObj.managerfirstname = $scope.editUserData.firstName;
                userUpObj.managerlastname = $scope.editUserData.lastName;
            }
            loadingDialogService.showProcessingPleaseWait('Editing User. Please wait...');
            var url = "updateUser";
            httpServerService.makeHttpRequest(url, "post", userUpObj)
                .then(function(response) {
                    console.log("Edit user response" + response.status);
                    var statusCode = response.status;
                    if (statusCode === 200) {
                        console.log("Edit user successfully");
                        fetchUsersList(); // retrieve the updated users list by making a new service call
                        setTimeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 300);
                        $scope.showUsers();
                    } else if (statusCode === 400) { // Bad request. In most cases, the user has been deleted
                        $scope.showEditUserError = true;
                        $scope.editUserErrorMsg = httpServerService.getDefaultErrorMessage();
                        setTimeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 0);
                        showUserUnavailableModal();     // show the dialog of user unavailable
                    } else {
                        $scope.showEditUserError = true;
                        $scope.editUserErrorMsg = httpServerService.getDefaultErrorMessage();
                        setTimeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 300);
                        showUserUnavailableModal();     // show the dialog of user unavailable
                    }
                }, function(response) {
                    $scope.showEditUserError = true;
                    $scope.editUserErrorMsg = httpServerService.getDefaultErrorMessage();;
                    setTimeout(function() {
                        loadingDialogService.hideProcessingPleaseWait();
                    }, 300);
                });
        }

        $scope.cancelEdit = function() {
            $scope.showUsers();
        }


        var formValidate = function(formData) {

            for (var prop in formData) { //check if field is empty
                if (isEmpty(formData[prop])) {

                    $scope.newUserFormValid = false;
                    $scope.newUserFailure = ErrorMsgs[prop];
                    return false;
                }
                if (prop === 'email') {
                    if (!validateEmail(formData.email)) { //check is the email address is valid
                        $scope.newUserFormValid = false;
                        $scope.newUserFailure = 'Please enter a valid Email Address.';
                        return false;
                    }
                }
            }



            $scope.newUserFormValid = true;
        }

        var isEmpty = function(field) {
            return !field || field == "undefined" || field === "";
        }

        var validateEmail = function(email) { // Create email() method
            // Rudimentary regular expression that checks for a single @ in the email
            var valid = /^[-a-z0-9~!$%^&=+}{\'?]+(\.[-a-z0-9~!$%^&=+}{\'?]+)*@([a-z0-9][-a-z0-9]*(\.[-a-z0-9]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(email);
            return valid;
        }

        $scope.showNotificationdModal = function() {
            ModalService.showModal({
                templateUrl: "views/modal_templates/notification.html",
                controller: "dialogCtrl",
                inputs: {
                    data: {
                        modalTitle: "Reset Password Result",
                        modalText: $scope.resetPasswordMsg,
                    }
                },
            }).then(function(modal) {
                modal.close.then(function(result) {
                    return;
                });
            });
        }

        $scope.showConfirmResetModal = function() {
            // var userEmail = $scope.selectedUser.email;
            var username = $scope.selectedUser.name.firstname + ' ' + $scope.selectedUser.name.lastname;
            ModalService.showModal({
                templateUrl: "views/modal_templates/confirm.html",
                controller: "dialogCtrl",
                inputs: {
                    data: {
                        modalTitle: "Reset Password",
                        modalText: "Are you sure you want to reset the password for " + username + "?",
                        buttonText: "Reset",
                    }
                },
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result.result === 'delete') {
                        $scope.resetPassword();
                    }
                });
            });
        };

        $scope.resetPassword = function() {
            console.log("Request for reseting password of user " + $scope.selectedUser.email + " is being sent.");
            var resetObj = {
                "email": $scope.selectedUser.email,
                "teamName": $scope.selectedUser.teamname
            };
            var url = "resetPassword";
            httpServerService.makeHttpRequest(url, "post", resetObj)
                .then(function(response) {
                    console.log("rest password result" + response.status);
                    var statusCode = response.status;
                    if (statusCode === 200) {
                        console.log("Reset password successfully");
                        $scope.resetPasswordMsg = "An email with a temporary password has been sent to " + $scope.selectedUser.email + ". The user now can use the temporary password to login in and reset the password.";
                    } else {
                        $scope.resetPasswordMsg = httpServerService.getDefaultErrorMessage(); //"Server Error. We cannot process your request now.";
                    }
                    $scope.showNotificationdModal();
                }, function(response) {
                    $scope.resetPasswordMsg = httpServerService.getDefaultErrorMessage(); //"Server Error. We cannot process your request now.";
                    $scope.showNotificationdModal();
                });
        };

        function showUserUnavailableModal() {
            var text = "Failed to edit user. Please check whether the user is still available in the reloaded user list"
            ModalService.showModal({
                templateUrl: "views/modal_templates/notification.html",
                controller: "dialogCtrl",
                inputs: {
                    data: {
                        modalTitle: "Error",
                        modalText: text,
                    }
                },
            }).then(function(modal) {
                initialReset();
                fetchUsersList();
            });
        };
    }
]);

// app.directive('validateEmail', function() {
//   var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;

//   return {
//     require: 'ngModel',
//     restrict: '',
//     link: function(scope, elm, attrs, ctrl) {
//       // only apply the validator if ngModel is present and Angular has added the email validator
//       if (ctrl && ctrl.$validators.email) {

//         // this will overwrite the default Angular email validator
//         ctrl.$validators.email = function(modelValue) {
//           return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
//         };
//       }
//     }
//   };
// });