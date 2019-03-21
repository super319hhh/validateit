/**
 * Created by Kanthi on 2015-08-30.
 * revised by Yongkeng on 2015-11-26
 */
'use strict';
var app = angular.module('validateItUserPortalApp');

app.controller('CommunitiesCtrl', ['$rootScope', '$scope', '$http', 'httpServerService', '$window', '$location', '$q', '$anchorScroll', '$timeout', 'sideBarService', 'usersService', 'growl', 'communityService', 'sharedService', 'loadingDialogService', 'ModalService', function($rootScope, $scope, $http, httpServerService, $window, $location, $q, $timeout, $anchorScroll, sideBarService, usersService, growl, communityService, sharedService, loadingDialogService, ModalService) {
    //initial status of the page
    // $scope.showButton = true;
    var loaded_communities = null; //  to store the loaded communities

    $scope.activeForm = "";
    $scope.showNewCommunitiesButtonFlag = true;
    $scope.showCommunitiesTableFlag = true;
    $scope.showNewCommunityFlag = false;
    $scope.showBreadcrumbNav = false;
    $scope.showCommunityDetailsFlag = false;
    $scope.selectedSubCommunitiesNotEmpty = false;
    $scope.users = null;
    $scope.showNewSubCommunity = true;
    // $scope.newSubCommunityValidationFlag = {};
    $scope.newSubCommunityErrorFlag = false;
    $scope.newSubCommunityErrorMsg = "";
    $scope.savedSubCommunitiesShowFlags = new Array();
    $scope.subCommunitiesValidationFlags;
    $scope.subCommunitiesInvalidFlag;

    $scope.newCommunityName = "";
    $scope.newCommunityDescription = "";
    $scope.communityErrorFlag = false;
    $scope.communityErrorMsg = "";
    $scope.disableAddMore = true;
    $scope.newCommunityNameConflict;
    $scope.subCommunityNameConflict;
    $scope.newSubCommunityNameConflict;
    //define objects for New Community
    $scope.newSubCommunity = new ResetSubCommunity();
    $scope.project = communityService.createProjectObject();
    $scope.checkedCommunities = [];
    $scope.npOptions = {
        checkedAll: false,
        checkAllClass: 'unchecked',
    }
    $scope.actionBar = sharedService.getActionBarObject();
    $scope.createNewProjectFlag = false;

    $scope.projectConfig = {
        //type: 'NewProject',
        //type: 'UpdateProject',
        //type: 'CopyProject',
        type: 'NewProjectWithCommunities',
        showProjectUpdateForm: false,
        projectID: '',
    };

    $rootScope.wizard = {
        project: {
            activate: false,
            projectID: null, // required
            type: 'NewProjectWithCommunities', // required  { NewProject, UpdateProject, CopyProject, NewProjectWithCommunities }
            details: {},
            communityDetails: [],
            display: false,
            projectNote: {},
            initFunc: '',
            dataDependency: {},
            onSubmitFunc: 'newProjectWithCommunitiesOnSubmit',
            onSubmitParams: {},

        }
    }
    $rootScope.modal = {
        show: false,
        title: "",
        text: "",
        input: {
            show: false,
            value: '',
            required: false,
            dependent: ''
        },

        buttons: {
            delete: {
                show: false,
                text: "Delete",
                fnc: "deleteCommunityFromProject",
                params: "12345667"
            },
            cancel: {
                show: false,
                text: "Cancel",
                fnc: "resetModal()"
            },
            confirm: {
                show: false,
                text: "Confirm",
                fnc: "resetModal()",
                link: "",
                params: "12345667"
            },
            custom: {
                show: false,
                text: "OK",
                fnc: "",
                params: "",
            }
        }
    }
    var ErrorMsgs = {
        name: "Name",
        description: "Description",
        ageselection: "Age Range",
        country: "Country",
        numRespondents: "Number of Members should not be 0. Please add Number of Males and Number of Females",
    };

    function ResetSubCommunity() {
        this.recordID = sharedService.generateUniqueID(),
            this.country = "";
        this.name = "";
        this.description = "";
        this.ageselection = [{
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "18-24",
            dbKey: "age_18_24",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "25-34",
            dbKey: "age_25_34",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "35-44",
            dbKey: "age_35_44",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "45-54",
            dbKey: "age_45_54",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "55-64",
            dbKey: "age_55_64",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: true,
            displayText: "65+",
            dbKey: "age_65_plus",
            checked: false
        }, {
            recordID: sharedService.generateUniqueID(),
            display: false,
            displayText: "ALL",
            dbKey: "age_all",
            checked: false
        }, ];
        this.numMale = 0;
        this.numFemale = 0;
        this.selectedAgeText = "";
        this.lockAges = false;
    }

    $scope.savedSubCommunities = new Array();

    // set the "New communities" button display flag
    $scope.isTeamRole = (usersService.getUserObject().teamrole == "A" || usersService.getUserObject().teamrole == "M") ? true : false;
    $scope.teamName = usersService.getUserObject().teamname;

    // fetchCommunitiesList(); //fetch communities data and display

    /* ------ [Start] SideBar Code ------- */
    // sideBarService.setSelectedIndex(3);
    $scope.sidebar_items = sideBarService.getSideBarItems();
    $scope.showSideBarFn = function() {
        return sideBarService.getShowSideBar();
    }
    sideBarService.setShowSideBar(true);
    $scope.changePath = function(newPath, index) {
        sideBarService.setShowSideBar(true);
        if (typeof(index) === 'number' || !isNaN(parseFloat(index)) === true) {
            sideBarService.setSelectedIndex(index);
        }
        $window.location.assign(newPath);
    };
    /* ------ [End] SideBar Code ------- */

    $scope.init = function() {
        sideBarService.setSelectedByRoute($location.$$path);
        httpServerService.makeHttpRequest("newProjectAuth?teamName=" + usersService.getUserObject().teamname, "get").then(function(responseData) {
            loadingDialogService.hideProcessingPleaseWait();
            if (responseData.status == 200) {
                $scope.createNewProjectFlag = true;
            } else {
                $scope.createNewProjectFlag = false;
            }
        });
        fetchCommunitiesList(); //fetch communities data and display

        /*------ [Start] Breadcrumb Code -------*/
        $scope.breadcrumb = {
                lists: [{
                    name: "Home",
                    onClickFnc: "showPageHome('employee_overview')",
                }, {
                    name: "Communities",
                    onClickFnc: "showCommunityHome()",
                }]
            }
            /*------ [End] Breadcrumb Code -------*/
            // showSelectedCommunity($index);

    }

    $scope.breadcrumbLink = function(homeFnc, index) {
        if (index > 0) {
            $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, index + 1);
        }
        $scope.$eval(homeFnc);
    }
    $scope.showPageHome = function(param) {
        $scope.hideProjectWizard();
        $scope.changePath('/#/' + param, 0);
    }
    $scope.showCommunityHome = function() {
        $scope.hideProjectWizard();
        $scope.resetCheckedCommunities();
        $scope.resetActionBar();
        $scope.showNewCommunityFlag = false;
        $scope.showCommunitiesTableFlag = true;
        $scope.showCommunityDetailsFlag = false;
    }

    function fetchCommunitiesList() {
        console.log('entered fetchCommunitiesList');
        $scope.showAddCommunity = false;

        var url = "communityList?teamName=" + $scope.teamName;
        httpServerService.makeHttpRequest(url, "get")
            .then(function(response) {
                    console.log(" -- communities response ---");
                    console.log(response.data);
                    var communitiesResponseData = response.data;
                    if (communitiesResponseData.communities.length > 0) {
                        var communityDetails = {};
                        for (var i = 0; i < communitiesResponseData.communities.length; i++) {
                            communitiesResponseData.communities[i].recordID = sharedService.generateUniqueID();
                        }
                    }
                    if ((typeof(communitiesResponseData) !== 'undefined' && communitiesResponseData !== null)) {

                        $scope.communities = communitiesResponseData.communities;

                        $scope.showAddCommunity = communitiesResponseData.addCommunity;
                        $scope.countries = { // array to hold the countries of communities
                            availableOptions: [{
                                name: 'All'
                            }, ],
                            selectedOption: { //This sets the default value of the select in the ui
                                name: 'All'
                            },
                            allCountries: ['All'],
                        };
                        console.log($scope.communities);
                        for (var i = 0; i < $scope.communities.length; i++) {
                            //$scope.communities[i].recordID = sharedService.generateUniqueID();
                            $scope.communities[i].checked = false;
                            // set country flag
                            if ($scope.communities[i].country !== null) {
                                if ($scope.communities[i].country.indexOf("USA") > -1) {
                                    $scope.communities[i].isUS = true;
                                    if ($scope.countries.allCountries.indexOf("USA") < 0) { // if not found, add to countries list to make it a option used to filter communities
                                        $scope.countries.allCountries.push('USA');
                                        $scope.countries.availableOptions.push({
                                            name: 'USA'
                                        });
                                    }
                                }
                                if ($scope.communities[i].country.indexOf("Canada") > -1) {
                                    $scope.communities[i].isCanada = true;
                                    if ($scope.countries.allCountries.indexOf("Canada") < 0) { // if not found, add to countries list to make it a option used to filter communities
                                        $scope.countries.allCountries.push('Canada');
                                        $scope.countries.availableOptions.push({
                                            name: 'Canada'
                                        });
                                    }
                                }
                            }
                            // calculate gender percentages
                            // if ($scope.communities[i].gender.male || $scope.communities[i].gender.female) {
                            //     if ($scope.communities[i].gender.male && !$scope.communities[i].gender.female) {
                            //         $scope.communities[i].malePercentage = 100;
                            //         $scope.communities[i].femalePercentage = 0;
                            //     } else if ($scope.communities[i].gender.female && !$scope.communities[i].gender.male) {
                            //         $scope.communities[i].malePercentage = 0;
                            //         $scope.communities[i].femalePercentage = 100;
                            //     } else {
                            //         $scope.communities[i].malePercentage = Math.round($scope.communities[i].gender.male / ($scope.communities[i].gender.male + $scope.communities[i].gender.female) * 100);
                            //         $scope.communities[i].femalePercentage = 100 - $scope.communities[i].malePercentage;
                            //     }
                            // }

                            // Data for the pie charts
                            $scope.communities[i].chartObject = {
                                "type": "PieChart",
                                "data": {
                                    "cols": [{
                                        id: "t",
                                        label: "Gender",
                                        type: "string"
                                    }, {
                                        id: "s",
                                        label: "Percentage(%)",
                                        type: "number"
                                    }],
                                    "rows": [{
                                        "c": [{
                                            "v": "M"
                                        }, {
                                            "v": $scope.communities[i].gender.male
                                        }]
                                    }, {
                                        "c": [{
                                            "v": "F"
                                        }, {
                                            "v": $scope.communities[i].gender.female
                                        }]
                                    }]
                                },
                                options: {
                                    'fontSize': '14',
                                    'colors': ['#337AB7', '#aaaaaa'],
                                    'backgroundColor': 'transparent',
                                    'width': 100,
                                    'height': 100,
                                    'chartArea': {
                                        'width': '85%',
                                        'height': '85%'
                                    },
                                    'legend': 'none',
                                    'pieSliceText': 'label',
                                    'tooltip': {
                                        // 'trigger': 'none',
                                        'text': 'percentage',
                                        textStyle: {
                                            fontSize: 14,
                                            bold: false
                                        },
                                        // ignoreBounds: true
                                    }
                                }
                            }
                        }

                        $scope.communitiesArray = $scope.communities; // display the loaded communities array
                        loaded_communities = $scope.communities; // store the loaded communities array

                        console.log("Communities: ");
                        console.log($scope.communities);
                        if (sharedService.getRedirection("community", "flag")) {
                            if (sharedService.getRedirection("community", "name") != "" || sharedService.getRedirection("community", "name") != null) {
                                var comn = sharedService.getRedirection("community", "name");
                                var index = $scope.communities.map(function(item) {
                                    return item.communityname.toLowerCase();
                                }).indexOf(comn.toLowerCase());

                                $scope.showSelectedCommunity($scope.communities[index].recordID);
                                sharedService.setRedirection("community", "flag", false);
                                sharedService.setRedirection("community", "name", "");
                            }
                        }
                    } else {
                        $scope.dataFetchMsg = "cannot process user's communities data";
                    }
                },
                function(response) {
                    $scope.dataFetchMsg = "cannot fetch user's communities data";
                });
    }

    $scope.filterByCountry = function() {
        $scope.communitiesArray = [];
        if ($scope.countries.selectedOption.name === "All") {
            $scope.communitiesArray = loaded_communities; // recover from the stored communities array
        } else {
            for (var i = $scope.communities.length - 1; i >= 0; i--) {
                if ($scope.communities[i].country.indexOf($scope.countries.selectedOption.name) > -1) {
                    $scope.communitiesArray.unshift($scope.communities[i]);
                };
            };
        }
    }

    $scope.addNewCommunity = function() {
        $scope.hideProjectWizard();
        // $scope.showButton = false;
        $scope.showBreadcrumbNav = true;
        $scope.activeForm = "New Community";
        $scope.showNewCommunityFlag = true;
        $scope.showCommunitiesTableFlag = false;

        // reset forms
        $scope.newCommunityName = "";
        $scope.newCommunityDescription = "";
        $scope.newSubCommunity = new ResetSubCommunity();
        $scope.savedSubCommunities = new Array();
        $scope.communityErrorFlag = false;
        $scope.subCommunitiesInvalidFlag = false;
        $scope.newSubCommunityErrorFlag = false; // reset

        if ($scope.breadcrumb.lists.length > 2) {
            $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);
        }
        $scope.breadcrumb.lists.push({
            name: "Add New Community",
            onClickFnc: "",
        });
    }

    $scope.showCommunities = function() {
        // $scope.showButton = true;
        $scope.showBreadcrumbNav = false;
        $scope.showNewCommunityFlag = false;
        $scope.showCommunityDetailsFlag = false;
        $scope.showCommunitiesTableFlag = true;

        $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);
    }

    $scope.showSelectedCommunity = function(recordID) {
        $scope.hideProjectWizard();
        $scope.resetActionBar();
        $scope.selectedSubCommunitiesNotEmpty = false; //reset
        var comIndex = $scope.communities.map(function(item) {
            return item.recordID;
        }).indexOf(recordID);
        $scope.selectedCommunityData = $scope.communities[comIndex];

        // check the teamrole to determine whether displays sub communities
        if (usersService.getUserObject().teamrole == "A") {

            // fetch sub communities data of selected community
            var url = "subCommunityList?teamName=" + $scope.teamName + "&communityName=" + $scope.selectedCommunityData.communityname;
            httpServerService.makeHttpRequest(url, "get")
                .then(function(response) {
                    console.log("subcommunities of selected community's loaded" + response.data);
                    var responseData = response.data;
                    if ((typeof(responseData) !== 'undefined' && responseData !== null)) {

                        if (responseData.length > 0) {
                            $scope.selectedSubCommunitiesNotEmpty = true;
                        };

                        $scope.selectedSubCommunities = responseData;

                        for (var i = 0; i < $scope.selectedSubCommunities.length; i++) {
                            if ($scope.communities[i].country == null) {
                                continue;
                            } else {
                                if ($scope.selectedSubCommunities[i].country.indexOf("USA") > -1) {
                                    $scope.selectedSubCommunities[i].isUS = true;
                                }
                                if ($scope.selectedSubCommunities[i].country.indexOf("Canada") > -1) {
                                    $scope.selectedSubCommunities[i].isCanada = true;
                                }
                            }
                        }
                    } else {
                        $scope.dataFetchMsg = "cannot process selected community's subcommunities data";
                    }
                }, function(response) {
                    $scope.dataFetchMsg = "cannot fetch selected community's subcommunities communities data";
                });
        }


        $scope.showCommunityDetailsFlag = true;
        $scope.showBreadcrumbNav = true;
        $scope.showCommunitiesTableFlag = false;
        $scope.activeForm = $scope.selectedCommunityData.communityname;

        $(document).scrollTop(0);; // move the page to the top

        if ($scope.breadcrumb.lists.length > 2) {
            $scope.breadcrumb.lists.pop();
        }
        $scope.breadcrumb.lists.push({
            name: $scope.selectedCommunityData.communityname,
            onClickFnc: "",
        });
    }

    $scope.addNewSubCommunity = function() {
        $scope.showNewSubCommunity = true;
        $scope.disableAddMore = true;
    }
    $scope.deleteNewSubCommunity = function(index) {
        $scope.savedSubCommunities.splice(index, 1);
        $scope.savedSubCommunitiesShowFlags.splice(index, 1);
    }
    $scope.closeNewSubCommunity = function() {
        $scope.showNewSubCommunity = false;
        $scope.disableAddMore = false;
    }
    $scope.resetNewSubCommunity = function() {
        $scope.newSubCommunity = new ResetSubCommunity();
        $scope.newSubCommunityNameConflict = false;
        $scope.newSubCommunityErrorFlag = false;
        $scope.newSubCommunityErrorMsg = "";
    }
    $scope.submitNewSubCommunity = function() {
        $scope.newSubCommunityErrorFlag = false; // reset
        /* form validation begin */
        for (var prop in $scope.newSubCommunity) { //check if field is empty
            if (prop == "numMale" || prop == "numFemale" || prop == "lockAges") { // omit numMale and numMFemale because either of them can be 0
                continue;
            } else {
                if (isEmpty($scope.newSubCommunity[prop])) {
                    $scope.newSubCommunityErrorFlag = true;
                    $scope.newSubCommunityErrorMsg = ErrorMsgs[prop] + " is required."
                    return;
                }
            }
        }

        if (typeof $scope.newSubCommunity["numMale"] === 'undefined') { // the variable's value is 'undefined 'if the user doesn't fill this field, and 0 if the filled value is not a number (e.g. 34yus)
            $scope.newSubCommunity["numMale"] = 0;
        }
        if (typeof $scope.newSubCommunity["numFemale"] === 'undefined') {
            $scope.newSubCommunity["numFemale"] = 0;
        }
        if (($scope.newSubCommunity["numMale"] + $scope.newSubCommunity["numFemale"]) < 1) { // numMale and numFemale can't both be 0
            $scope.newSubCommunityErrorFlag = true;
            $scope.newSubCommunityErrorMsg = ErrorMsgs["numRespondents"];
            return;
        };
        /* form validation end */
        if (!$scope.newSubCommunityErrorFlag && !$scope.newSubCommunityNameConflict) { // if the form is valid
            $scope.savedSubCommunities.push($scope.newSubCommunity);
            $scope.savedSubCommunitiesShowFlags.push(false);
            for (var i = 0; i < $scope.savedSubCommunitiesShowFlags.length; i++) { //collapse all the saved sub community forms
                $scope.savedSubCommunitiesShowFlags[i] = false;
            }
            $scope.newSubCommunity = null; //reset the newSubCommunity form
            $scope.newSubCommunity = new ResetSubCommunity();
            $scope.showNewSubCommunity = false; //hide the newSubCommunity form
            $scope.disableAddMore = false;
        } else {
            console.log($scope.newSubCommunityErrorMsg);
        };
        console.log("--> Saved Sub Community:");
        console.log($scope.savedSubCommunities);
    }

    $scope.submitCommunity = function() {
        $scope.subCommunitiesInvalidFlag = false; // reset
        $scope.communityErrorFlag = false; // reset
        /* form validation begin */
        /* 1. cheek if community or sub community names conflicts */
        if ($scope.newCommunityNameConflict || $scope.subCommunityNameConflict || $scope.newSubCommunityNameConflict) {
            $scope.subCommunitiesInvalidFlag = true;
        };

        /* 2. cheek the community name and description */
        if ($scope.newCommunityName === "" || $scope.newCommunityDescription === "") {
            $scope.communityErrorFlag = true;
            $scope.communityErrorMsg = "Please be sure to enter the community name and description";
            // return;
        }
        /* 3. cheek if there is a sub community */
        if ($scope.savedSubCommunities.length == 0) {
            $scope.communityErrorFlag = true;
            $scope.communityErrorMsg = "Please create at least one sub community.";
            return;
        };

        /* 4. cheek each field of each sub community */
        $scope.subCommunitiesValidationFlags = new Array($scope.savedSubCommunities.length);

        for (var i = 0; i < $scope.savedSubCommunities.length; i++) { // check if all the sub communities forms are valid
            $scope.subCommunitiesValidationFlags[i] = {
                    "isFormInvalid": false,
                    "errorMsg": ""
                }
                /* validate each saved sub community begin */
            for (var prop in $scope.savedSubCommunities[i]) { //check if field is empty
                if (prop == "numMale" || prop == "numFemale" || prop == "lockAges") { // omit numMale and numMFemale because either of them can be 0
                    continue;
                } else {
                    if (isEmpty($scope.savedSubCommunities[i][prop])) {
                        $scope.subCommunitiesValidationFlags[i] = { // set the error status and quit
                            "isFormInvalid": true,
                            "errorMsg": ErrorMsgs[prop] + " is required"
                        };
                        break;
                    }
                }
            }
            if ($scope.subCommunitiesValidationFlags[i]["isFormInvalid"] === false) {
                if (($scope.savedSubCommunities[i]["numMale"] + $scope.savedSubCommunities[i]["numFemale"]) < 1) { // numMale and numFemale can't both be 0
                    $scope.subCommunitiesValidationFlags[i] = {
                        "isFormInvalid": true,
                        "errorMsg": ErrorMsgs["numRespondents"] + " is required"
                    }
                    continue;
                }

            }
        };
        /* validate each saved sub community end */

        for (var j = $scope.subCommunitiesValidationFlags.length - 1; j >= 0; j--) {
            if ($scope.subCommunitiesValidationFlags[j]["isFormInvalid"] || $scope.subCommunityNameConflict) {
                $scope.subCommunitiesInvalidFlag = true;
                $scope.savedSubCommunitiesShowFlags[j] = true; // open the save sub community table to show the error
            } else {
                $scope.savedSubCommunitiesShowFlags[j] = false;
            }
        };
        /* form validation end */


        if (!$scope.communityErrorFlag && !$scope.subCommunitiesInvalidFlag) { // if all the forms are valid

            var userObject = usersService.getUserObject();
            if ($scope.savedSubCommunities.length > 0) {
                var uploadObj = {}; // construct the upload data
                uploadObj.communityname = $scope.newCommunityName;
                uploadObj.communitydescription = $scope.newCommunityDescription;
                uploadObj.subcommunities = []; //new Array($scope.savedSubCommunities.length);
                for (var i = $scope.savedSubCommunities.length - 1; i >= 0; i--) {
                    uploadObj.subcommunities[i] = {};
                    uploadObj.subcommunities[i].subcommunityname = $scope.savedSubCommunities[i].name;
                    uploadObj.subcommunities[i].subcommunitydescription = $scope.savedSubCommunities[i].description;
                    uploadObj.subcommunities[i].country = [$scope.savedSubCommunities[i].country];
                    uploadObj.subcommunities[i].province = [];
                    uploadObj.subcommunities[i].region = [];
                    uploadObj.subcommunities[i].gender = {
                        "male": $scope.savedSubCommunities[i].numMale,
                        "female": $scope.savedSubCommunities[i].numFemale
                    };
                    uploadObj.subcommunities[i].respondents = $scope.savedSubCommunities[i].numMale + $scope.savedSubCommunities[i].numFemale;

                    uploadObj.subcommunities[i].teamname = userObject.teamname;
                    uploadObj.subcommunities[i].organizationname = userObject.organizationname;

                    uploadObj.subcommunities[i].ageselection = {
                        "age_all": false,
                        "age_18_24": false,
                        "age_25_34": false,
                        "age_35_44": false,
                        "age_45_54": false,
                        "age_55_64": false,
                        "age_65_plus": false
                    };

                    for (var j = 0; j < $scope.savedSubCommunities[i].ageselection.length; j++) {
                        uploadObj.subcommunities[i].ageselection[$scope.savedSubCommunities[i].ageselection[j].dbKey] = $scope.savedSubCommunities[i].ageselection[j].checked;
                    }
                    uploadObj.subcommunities[i].lockageselection = $scope.savedSubCommunities[i].lockAges;

                };

                loadingDialogService.showProcessingPleaseWait('Creating community. Please wait...');
                /**
                 * Post request to submit the new community form
                 */
                var teamName = userObject.teamname
                var postUrl = httpServerService.getServerPath() + "ws/community?teamName=" + teamName;
                var request = $http({
                    method: 'POST',
                    url: postUrl,
                    // url: 'http://localhost:8080/ws/newUser',
                    // headers: {
                    //     'Content-Type': 'application/json',
                    // },
                    data: uploadObj
                });

                request.then(function(response) {
                        console.log("server response data" + response.data);
                        var responseStatus = response.status;
                        if (responseStatus == 200) {
                            console.log("New Community created successfully")
                            growl.info("New Community created successfully", {
                                ttl: 5000
                            });
                            fetchCommunitiesList(); //fetch communities data and display
                            $scope.showCommunities(); //show communities table, hide new community tableponseStatus == 200) { // new community created successfully
                            $scope.newCommunityName = "";
                            $scope.newCommunityDescription = "";
                            $scope.savedSubCommunities = null;
                            $scope.showNewSubCommunity = true;
                            loadingDialogService.hideProcessingPleaseWait();
                        } else {
                            alert("Sorry, we cannot process your request");
                            console.log("Sorry, we cannot process your request");
                            loadingDialogService.hideProcessingPleaseWait();
                        }
                    },
                    function(response) {
                        var responseStatus = response.status;
                        if (responseStatus == 500) { // if username already exists
                            alert("Sorry, we cannot process your request");
                            console.log("Sorry, we cannot process your request")
                            loadingDialogService.hideProcessingPleaseWait();
                        } else {
                            alert("Sorry, we cannot process your request");
                            console.log("Sorry, we cannot process your request")
                            loadingDialogService.hideProcessingPleaseWait();
                        }
                    });
            };
        };
    }
    $scope.prepareAges = function(type, recordID) {
            console.log("-- Age Ranges --");
            console.log($scope.newSubCommunity.ageselection);
            if (type === 'saved') {
                var subComIndex = $scope.savedSubCommunities.map(function(item) {
                    return item.recordID;
                }).indexOf(recordID);
                $scope.savedSubCommunities[subComIndex].selectedAgeText = "";
                for (var i = 0; i < $scope.savedSubCommunities[subComIndex].ageselection.length; i++) {
                    if ($scope.savedSubCommunities[subComIndex].ageselection[i].checked === true) {
                        $scope.savedSubCommunities[subComIndex].selectedAgeText += $scope.savedSubCommunities[subComIndex].ageselection[i].displayText + ", ";
                    }
                }
                $scope.savedSubCommunities[subComIndex].selectedAgeText = $scope.savedSubCommunities[subComIndex].selectedAgeText.substring(0, $scope.savedSubCommunities[subComIndex].selectedAgeText.length - 2);
            } else {
                $scope.newSubCommunity.selectedAgeText = "";
                for (var i = 0; i < $scope.newSubCommunity.ageselection.length; i++) {
                    if ($scope.newSubCommunity.ageselection[i].checked === true) {
                        $scope.newSubCommunity.selectedAgeText += $scope.newSubCommunity.ageselection[i].displayText + ", ";
                    }
                }
                $scope.newSubCommunity.selectedAgeText = $scope.newSubCommunity.selectedAgeText.substring(0, $scope.newSubCommunity.selectedAgeText.length - 2);
            }

        }
        /**
         * form validation begin
         */
    var formValidate = function(formData) {
        for (var i = 0; i < formData.length; i++) { // check if all the sub communities forms are valid

            for (var prop in formData[i]) { //check if field is empty
                if (isEmpty(formData[i][prop])) {
                    $scope.subCommunitiesValidationFlags[i] = {}; //initiate the object
                    $scope.subCommunitiesValidationFlags[i]["isFormInvalid"] = true;
                    $scope.subCommunitiesValidationFlags[i]["errorMsg"] = prop + " is required."
                    break;
                }
            }

            if (($scope.subCommunitiesValidationFlags[i]["numMale"] + $scope.subCommunitiesValidationFlags[i]["numFemale"]) < 1) {
                $scope.subCommunitiesValidationFlags[i]["isFormInvalid"] = true;
                $scope.subCommunitiesValidationFlags[i]["errorMsg"] = "Numbers of Male and Female should not both be 0.";
            };
        }
    }

    var isEmpty = function(field) {
            return !field || field === "";
        }
        // form validation end

    $scope.toggleSubCommunity = function(index) {
        // for (var i = 0; i < $scope.savedSubCommunitiesShowFlags.length; i++) {
        //     $scope.savedSubCommunitiesShowFlags[i] = false;
        // }
        $scope.savedSubCommunitiesShowFlags[index] = !$scope.savedSubCommunitiesShowFlags[index];
    };
    /*
     * check if the entered community name exists 
     */
    $scope.checkName = function() {
        $scope.newCommunityNameConflict = false;
        if ($scope.newCommunityName.trim() !== "") {

            var url = "communityExist?teamName=" + $scope.teamName + "&communityName=" + $scope.newCommunityName.trim();

            httpServerService.makeHttpRequest(url, "GET").then(function(response) {
                    var responseStatus = response.status;
                    if (responseStatus == 470) { //  this community name is available
                        $scope.newCommunityNameConflict = false;
                        console.log("Community Name is available");
                    } else if (responseStatus == 200) {
                        $scope.newCommunityNameConflict = true;
                        console.log("Community Name Already Exists");
                    } else {
                        console.log("Error! Response status of 'checkName' is neither 200 or 470");
                    }
                }
                // , function(response) {  // This error handler will never get called if httpServerService.makeHttpRequest() is called
                //     var responseStatus = response.status;
                //     if (responseStatus == 200) { // if community name already exists
                //         $scope.newCommunityNameConflict = true;
                //         console.log("Community Name Already Exists");

                //     } else {
                //         console.log("Error! Response status of 'checkName' is neither 200 or 470");
                //     }
                // }
            )
        }
    };

    $scope.checkNewSubCommunityName = function() {
            $scope.newSubCommunityNameConflict = false; // reset
            if ($scope.newSubCommunity.name.trim() != "") {
                /* 1. check if this name already exists in the saved new sub communities */
                if ($scope.savedSubCommunities !== null && $scope.savedSubCommunities.length > 0) {
                    for (var i = 0; i < $scope.savedSubCommunities.length; i++) {
                        if ($scope.newSubCommunity.name.trim() === $scope.savedSubCommunities[i].name.trim()) {
                            $scope.newSubCommunityNameConflict = true;
                            return;
                        };
                    }
                };
                /* 2. If the first check passed, check if this name already exists in the Database */
                var url = "subcommunityExist?teamName=" + $scope.teamName + "&subcommunityName=" + $scope.newSubCommunity.name.trim();

                httpServerService.makeHttpRequest(url, "GET").then(function(response) {
                        var responseStatus = response.status;
                        if (responseStatus == 470) { //  this community name is available
                            $scope.newSubCommunityNameConflict = false;
                            console.log("Sub Community Name is available");
                        } else if (responseStatus == 200) {
                            $scope.newSubCommunityNameConflict = true;
                            console.log("Sub Community Name Already Exists");
                        } else {
                            console.log("Error! Response status of 'checkName' is neither 200 or 470");
                        }
                    }
                    // , function(response) {  // This error handler will never get called if httpServerService.makeHttpRequest() is called
                    //     var responseStatus = response.status;
                    //     if (responseStatus == 200) { // if community name already exists
                    //         $scope.newCommunityNameConflict = true;
                    //         console.log("Community Name Already Exists");

                    //     } else {
                    //         // $scope.communityErrorFlag = true;
                    //         // $scope.communityErrorMsg = "Sorry, we cannot process your request";
                    //         console.log("Error! Response status of 'checkName' is neither 200 or 470");
                    //     }
                    // }
                );
            }
        }
        /*
         * check if the entered sub community name exists 
         */
    $scope.checkSubCommunityName = function(index) {
            $scope.subCommunityNameConflict = false;
            if ($scope.savedSubCommunities[index].name.trim() != "") {
                /* 1. check if this name already exists in other saved new sub communities */
                if ($scope.savedSubCommunities !== null && $scope.savedSubCommunities.length > 0) {
                    for (var i = 0; i < $scope.savedSubCommunities.length; i++) {
                        if (index == i) {
                            continue; // pass if it compares to itself
                        } else {
                            if ($scope.savedSubCommunities[index].name.trim() === $scope.savedSubCommunities[i].name.trim()) {
                                $scope.subCommunityNameConflict = true;
                                return;
                            };
                        }
                    };
                }
                /* 2. If the first check passed, check if this name already exists in the Database */
                var url = "subcommunityExist?teamName=" + $scope.teamName + "&subcommunityName=" + $scope.savedSubCommunities[index].name.trim();

                httpServerService.makeHttpRequest(url, "GET").then(function(response) {
                        var responseStatus = response.status;
                        if (responseStatus == 470) { //  this community name is available
                            $scope.subCommunityNameConflict = false;
                            console.log("Sub Community Name is available");
                        } else if (responseStatus == 200) {
                            $scope.subCommunityNameConflict = true;
                            console.log("Sub Community Name Already Exists");
                        } else {
                            console.log("Error! Response status of 'checkName' is neither 200 or 470");
                        }
                    }
                    // , function(response) {  // This error handler will never get called if httpServerService.makeHttpRequest() is called
                    //     var responseStatus = response.status;
                    //     if (responseStatus == 200) { // if community name already exists
                    //         $scope.newCommunityNameConflict = true;
                    //         console.log("Community Name Already Exists");

                    //     } else {
                    //         // $scope.communityErrorFlag = true;
                    //         // $scope.communityErrorMsg = "Sorry, we cannot process your request";
                    //         console.log("Error! Response status of 'checkName' is neither 200 or 470");
                    //     }
                    // }
                );
            };
        }
        /* *
         * Method: communityCheckBoxOnClick
         * Parameters: Unique ID, temporarily created for each community
         * Description: This method will invoke when user click checkboxes in community list page.
         * */
    $scope.communityCheckBoxOnClick = function(recordID) {
        console.log(' ---- communityCheckBoxOnClick ---- ');
        var index = $scope.communities.map(function(item) {
            return item.recordID;
        }).indexOf(recordID);
        console.log($scope.communities[index]);
        //$scope.checkedCommunities
        var found = $scope.checkedCommunities.map(function(item) {
            return item.recordID;
        }).indexOf(recordID);
        if ($scope.communities[index].checked === true) {
            if (found < 0) {
                $scope.checkedCommunities.push({
                    recordID: recordID,
                    name: $scope.communities[index].communityname,
                    data: $scope.communities[index],
                })
            }
        } else {
            if (found > -1) {
                $scope.checkedCommunities.splice(found, 1);
            }
        }
        if ($scope.checkedCommunities.length === $scope.communities.length) {
            $scope.npOptions.checkAllClass = 'checked';
            $scope.npOptions.checkedAll = true;

        } else {
            $scope.npOptions.checkAllClass = 'unchecked';
            $scope.npOptions.checkedAll = false;
        }
        $scope.updateActionBar('', recordID);
        console.log(" --- Checked Communities --- ");
        console.log($scope.checkedCommunities);
        console.log($scope.actionBar);

    }

    /* *
     * Method: checkAllCommunities
     * Parameters:
     * Description: This method will invoke When user click the All text at the top of the checkbox column to check all the communities
     * */
    $scope.checkAllCommunities = function() {
        if ($scope.checkedCommunities.length === $scope.communities.length) {
            for (var i = 0; i < $scope.communities.length; i++) {
                $scope.communities[i].checked = false;
            }
            $scope.checkedCommunities = [];
            $scope.npOptions.checkAllClass = 'unchecked';
            $scope.npOptions.checkedAll = false;
        } else {
            for (var i = 0; i < $scope.communities.length; i++) {
                $scope.communities[i].checked = true;
                if ($scope.checkedCommunities.map(function(item) {
                        return item.recordID;
                    }).indexOf($scope.communities[i].recordID) < 0) {
                    $scope.checkedCommunities.push({
                        recordID: $scope.communities[i].recordID,
                        name: $scope.communities[i].communityname,
                        data: $scope.communities[i],
                    });
                }
            }
            $scope.npOptions.checkAllClass = 'checked';
            $scope.npOptions.checkedAll = true;
        }
        console.log("Check All Class: " + $scope.npOptions.checkAllClass);

        // console.log(" --- Checked Communities --- ");
        // console.log($scope.checkedCommunities);
        $scope.updateActionBar('all', '');
        // console.log($scope.actionBar);
    }

    $scope.uncheckCommunities = function() {
        for (var i = 0; i < $scope.communities.length; i++) {
            $scope.communities[i].checked = false;
        }
        $scope.checkedCommunities = [];
    }

    /* *
     * Method: updateActionBar
     * Parameters: type - represents whether one or all checkboxes are checked, recordID - temporary id of a community, if one checkbox is checked
     * Description: This method will invoke When user check or uncheck any or all communities.
     * */
    $scope.updateActionBar = function(type, recordID) {
        if ($scope.checkedCommunities.length > 0) {
            $scope.actionBar.leftCol.display = true;
            if ($scope.createNewProjectFlag === true) {
                var pos = $scope.actionBar.leftCol.actions.map(function(item) {
                        return item.text;
                    }).indexOf('Create New Project'),
                    actIndex, cindex, dindex, found, delFlag = false,
                    delIndex;

                if (pos < 0) {
                    var actionObject = {
                        text: 'Create New Project',
                        icon: true,
                        iconClass: 'fa fa-plus-square',
                        borderRight: '', //'brdr',
                        isShadow: 'shadow',
                        bgColor: true,
                        bgColorClass: 'cblue',
                        hasMoreClass: false,
                        moreClass: '',
                        onClickFunc: "prepareToCreateNewProject",
                        data: []
                    };
                    //actionObject.data.push($scope.communities[index]);
                    $scope.actionBar.leftCol.actions.push(actionObject);
                    actIndex = $scope.actionBar.leftCol.actions.map(function(item) {
                        return item.text;
                    }).indexOf('Create New Project');
                } else {
                    actIndex = pos;
                }
            }

            if ($scope.showAddCommunity === true) {
                delFlag = true;
                delIndex = $scope.actionBar.leftCol.actions.map(function(item) {
                    return item.text;
                }).indexOf('Delete');

                if (delIndex < 0) {
                    var actionObject = {
                        text: 'Delete',
                        icon: true,
                        iconClass: 'fa fa-trash-o',
                        borderRight: '', //'brdr',
                        isShadow: 'shadow',
                        bgColor: true,
                        bgColorClass: 'cred',
                        hasMoreClass: false,
                        moreClass: '',
                        onClickFunc: "prepareToDeleteCommunity",
                        data: []
                    };
                    //actionObject.data.push($scope.communities[index]);
                    $scope.actionBar.leftCol.actions.push(actionObject);
                    delIndex = $scope.actionBar.leftCol.actions.map(function(item) {
                        return item.text;
                    }).indexOf('Delete');
                }
            }
            if (type == 'all') {
                if ($scope.checkedCommunities.length === $scope.communities.length) {
                    var tmp;
                    for (var i = 0; i < $scope.communities.length; i++) {
                        tmp = $scope.actionBar.leftCol.actions[actIndex].data.map(function(item) {
                            return item.recordID;
                        }).indexOf($scope.communities[i].recordID);
                        if (tmp < 0) {
                            // add
                            $scope.actionBar.leftCol.actions[actIndex].data.push($scope.communities[i]);
                            if (delFlag === true) {
                                $scope.actionBar.leftCol.actions[delIndex].data.push($scope.communities[i]);
                            }
                        }
                    }
                    $scope.actionBar.display = true;
                } else {
                    $scope.actionBar.display = false;
                    $scope.actionBar.leftCol.actions = [];
                }
            } else {
                cindex = $scope.communities.map(function(item) {
                    return item.recordID;
                }).indexOf(recordID);
                found = $scope.actionBar.leftCol.actions[actIndex].data.map(function(item) {
                    return item.recordID;
                }).indexOf(recordID);
                if (found < 0) {
                    // add
                    $scope.actionBar.leftCol.actions[actIndex].data.push($scope.communities[cindex]);
                    if (delFlag === true) {
                        $scope.actionBar.leftCol.actions[delIndex].data.push($scope.communities[cindex]);
                    }
                }
                if (found > -1) {
                    // remove
                    dindex = $scope.actionBar.leftCol.actions[actIndex].data.map(function(item) {
                        return item.recordID
                    }).indexOf(recordID);
                    $scope.actionBar.leftCol.actions[actIndex].data.splice(dindex, 1);
                    if (delFlag === true) {
                        $scope.actionBar.leftCol.actions[delIndex].data.splice(dindex, 1);
                    }
                }
            }
            $scope.actionBar.display = true;
        } else {
            $scope.actionBar.display = false;
            $scope.actionBar.leftCol.display = true;
            $scope.actionBar.leftCol.actions = [];
            $scope.actionBar.rightCol.display = true;
            $scope.actionBar.rightCol.actions = [];
        }
        console.log(" --- Action Bar --- ");
        console.log($scope.actionBar);
    }

    /* *
     * Method: resetCheckedCommunities
     * Parameters:
     * Description: This method will uncheck all the checked communities.
     * */
    $scope.resetCheckedCommunities = function() {
            if ($scope.checkedCommunities.length > 0) {
                for (var i = 0; i < $scope.checkedCommunities.length; i++) {
                    var index = $scope.communities.map(function(item) {
                        return item.recordID;
                    }).indexOf($scope.checkedCommunities[i].recordID);
                    $scope.communities[index].checked = false;
                }
            }
            $scope.checkedCommunities = [];
        }
        /* *
         * Method: hideProjectWizard
         * Parameters:
         * Description: This method will hide the project Wizard
         * */
    $scope.hideProjectWizard = function() {
            $rootScope.wizard.project.display = false;
            $rootScope.wizard.project.activate = false;
        }
        /* *
         * Method: showProjectWizard
         * Parameters: side - leftCol or rightCol of action bar, index - action index
         * Description: This method will show the project Wizard and hide all other pages.
         * */
    $scope.showProjectWizard = function() {
            $rootScope.wizard.project.display = true;
            $rootScope.wizard.project.activate = true;
            $scope.showCommunitiesTableFlag = false;
            $scope.showCommunityDetailsFlag = false;
            $scope.showNewCommunityFlag = false;
        }
        /* *
         * Method: actionBarOnClick
         * Parameters: functionName - name of the function which will trigger, side - leftCol or rightCol of action bar, index - action index
         * Description: This method will invoke When user click any action button on action bar and evaluate the function which will be triggered for this action.
         * */
    $scope.actionBarOnClick = function(functionName, side, index) {
            $scope.$eval(functionName + "('" + side + "', " + index + ")");
            $scope.actionBar.display = false;
        }
        /* *
         * Method: prepareToCreateNewProject
         * Parameters: side - leftCol or rightCol of action bar, index - action index
         * Description: This method will invoke after clicking action button.
         * */
    $scope.prepareToCreateNewProject = function(side, index) {
        console.log("----- prepare To Create New Project -----");
        console.log("index: " + index + " side:" + side);
        console.log($scope.actionBar[side].actions[index]);
        if ($scope.actionBar[side].actions[index].data.length > 0) { // more then one community selected
            var subCommunities = new Object();
            communityService.removeCommunityDetails('all');
            for (var i = 0; i < $scope.actionBar[side].actions[index].data.length; i++) {
                subCommunities[$scope.actionBar[side].actions[index].data[i].communityname] = httpServerService.makeHttpRequest("subCommunityList?teamName=" + usersService.getUserObject().teamname + "&communityName=" + $scope.actionBar[side].actions[index].data[i].communityname, "get");
            }

            $q.all(subCommunities).then(function(arrayOfResults) {
                console.log(" All Responses ***");
                console.log(arrayOfResults);
                for (var key in arrayOfResults) {
                    if (arrayOfResults.hasOwnProperty(key)) {
                        if (arrayOfResults[key].status == 200) {
                            communityService.setCommunityDetails(arrayOfResults[key].data, key);
                        }
                    }
                }
                $rootScope.wizard.project.projectID = null;
                $rootScope.wizard.project.activate = true;
                $rootScope.wizard.project.initFunc = 'NewProjectWithSelectedCommunities';
                document.getElementById("projectWizard").style.display = '';
                $rootScope.wizard.project.dataDependency.communities = [];
                $rootScope.wizard.project.dataDependency.communities = $scope.actionBar[side].actions[index].data;
                //$scope.resetCheckedCommunities();
                $scope.showProjectWizard();
                console.log($scope.breadcrumb.lists);
                if ($scope.breadcrumb.lists.length > 2) {
                    $scope.breadcrumb.lists.pop();
                }
                $scope.breadcrumb.lists.push({
                    name: "New Project",
                    onClickFnc: "",
                });
            });
        }


    }

    $scope.prepareToDeleteCommunity = function(side, index) {
        console.log("----- prepare To Delete Project -----");
        // document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        // $rootScope.modal.show = false;
        // $rootScope.modal.title = "Delete Community";
        // // $rootScope.modal.text = "You are about to delete " + $scope.actionBar[side].actions[index].data.length + " communities. Are you sure?";
        // $rootScope.modal.text = "Are you sure you want to delete this community? This cannot be undone.";
        // document.getElementById("modalText").innerHTML = $scope.modal.text;
        // $rootScope.modal.buttons.delete.show = true;
        // $rootScope.modal.buttons.delete.fnc = "deleteCommunity";
        // $rootScope.modal.buttons.delete.params = "'" + side + "', '" + index + "'";
        // $rootScope.modal.buttons.cancel.show = true;
        // $rootScope.modal.show = true;
        // document.getElementById("modal-root").style.display = 'block';
        // document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
        // document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";

        ModalService.showModal({
            templateUrl: "views/modal_templates/confirm.html",
            controller: "dialogCtrl",
            inputs: {
                data: {
                    modalTitle: "Delete Community",
                    modalText: "Are you sure you want to delete this community? This cannot be undone.",
                    buttonText: "Delete"
                }
            },
        }).then(function(modal) {
            modal.close.then(function(result) {
                if (result.result === 'delete') {
                    $scope.deleteCommunity(side, index);
                }
                $scope.uncheckCommunities();
            });
        });

    }

    $scope.deleteCommunity = function(side, index) {
        console.log(" ----> Delete Community <-----");

        if (side != undefined && side != '' && index != undefined && index != '') {
            if ($scope.actionBar.hasOwnProperty(side)) {
                if ($scope.actionBar[side].actions.hasOwnProperty(index)) {
                    var comText = "communit" + ($scope.actionBar[side].actions[index].data.length > 0 ? "ies" : "y");
                    loadingDialogService.showProcessingPleaseWait("Deleting " + comText + ". Please wait...");
                    if ($scope.actionBar[side].actions[index].data.length > 0) {
                        var communityname = [],
                            communityname_html = "",
                            removeIndex = 0;
                        for (var i = 0; i < $scope.actionBar[side].actions[index].data.length; i++) {
                            communityname.push($scope.actionBar[side].actions[index].data[i].communityname);
                            communityname_html += "<strong>" + $scope.actionBar[side].actions[index].data[i].communityname + "</strong>, ";
                            removeIndex = $scope.communitiesArray.map(function(item) {
                                return item.recordID;
                            }).indexOf($scope.actionBar[side].actions[index].data[i].recordID);
                            if (removeIndex > -1) {
                                $scope.communitiesArray.splice(removeIndex, 1);
                                removeIndex = loaded_communities.map(function(item) {
                                    return item.recordID;
                                }).indexOf($scope.actionBar[side].actions[index].data[i].recordID);
                                if (removeIndex > -1) {
                                    loaded_communities.splice(removeIndex, 1);
                                }
                            }
                        }
                        communityname_html = communityname_html.substring(0, communityname_html.length - 2);
                        var url = "deleteCommunity?teamName=" + $scope.teamName;
                        httpServerService.makeHttpRequest(url, "post", {

                            teamName: usersService.getUserObject().teamname,
                            communitynames: communityname,
                        }).then(function(responseData) {
                            if (responseData.status == 200) {
                                loadingDialogService.hideProcessingPleaseWait();
                                growl.info(communityname.length + " [" + communityname_html + "] " + comText + " deleted successfully.", {
                                    ttl: 5000
                                });
                            }
                        });

                        $timeout(function() {
                            loadingDialogService.hideProcessingPleaseWait();
                        }, 500);
                        // $scope.uncheckCommunities();
                        $scope.resetActionBar();
                        // $rootScope.modal.show = false;
                        // $rootScope.closeModal();
                    }
                }
            }

        }


    }

    $scope.resetActionBar = function() {
        $scope.actionBar = sharedService.getActionBarObject();
    }
    $rootScope.closeModal = function() {
        $rootScope.modal.show = false;
        $rootScope.resetModal();
    }
    $rootScope.modalAction = function(action, params) {
        if (typeof(params) != 'undefined' && params != null) {
            $scope.$eval(action + "(" + params + ")");
        } else {
            $scope.$eval(action);
        }
    }
    $rootScope.resetModal = function() {
        $rootScope.modal.show = false;
        $rootScope.modal.title = "";
        $rootScope.modal.text = "";
        $rootScope.modal.buttons.delete.params = "";
        $rootScope.modal.buttons.cancel.params = "";
        $rootScope.modal.buttons.custom.show = false;
        $rootScope.modal.buttons.custom.test = "";
        $rootScope.modal.buttons.custom.fnc = "";
        $rootScope.modal.buttons.custom.params = "";
        $rootScope.modal.input.show = false;
        $rootScope.modal.input.value = '';
        $rootScope.modal.input.required = false;
        $rootScope.modal.input.dependent = '';
        document.getElementById("modalText").innerHTML = "";
        document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        document.getElementById("modal-root").style.display = 'none';
        $scope.uncheckCommunities();
        $scope.resetActionBar();
    }

    /**
     * To remove the remaining tooltip of the google pie charts after scroll the page quickly, which is a bug of google chart.
     */
    $(window).scroll(function() {
        setTimeout(function(){
            $('[google-chart] svg').each(function() {
                $(this).children().last().html('');
            });
        }, 100)
    });

}]);