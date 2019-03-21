
'use strict';
var app = angular.module('validateItUserPortalApp').value();

app.controller('ProjectEdit',['$rootScope', '$scope', '$location', '$window', 'sideBarService','communityService', 'sharedService','usersService', 'httpServerService', 'Upload', '$q', '$http', '$timeout', 'growl', function($rootScope, $scope, $location, $window, sideBarService, communityService, sharedService, usersService, httpServerService, Upload, $q, $http, $timeout, growl){

    $scope.init = function() {
        console.log(" ProjectEdit Controller:  Init() ");
        $scope.showProjectUpdateForm = false;
        $scope.projectDetailsData = {};
        $scope.priceTable = sharedService.getPricingTable();
        $scope.questions = [];
        $scope.projectID = '';
        $scope.responces = {};
        $scope.imageFile = null;
        $scope.qdocFile = null;
        $scope.allCountries = [];
        $scope.allCommunities = [];
        //$scope.projectCommunityDetails = {};

        /**
         * File Upload for question document functionality,
         */
        $scope.uploadOption = {
            qDocument: {
                valid: false,
                buttonClass: 'disabled',
                showQuestionnaire: false,
                questionnaire: '',
            },
            image: {
                valid: false,
                buttonClass: 'disabled',
            }
        }
        $scope.imageUploadFlags = {
            count: 0,
            error: false,
            message: ""
        };
        $scope.docUploadFlags = {
            count: 0,
            error: false,
            message: ""
        };
        /**
         * Variable: newProject
         * @type {{ projectName: string, numberOfResponents: number, country: string, community: string, gender: {male: number, female: number}, questionnaireDocument: Array, images: Array}}
         * Description: This variable will store all information provided by the user during new project creation process
         */
            //$scope.allCommunities = communityService.getCommunities2();
        $scope.project = {
            projectName: "",
            projectDescription: "",
            questions: 0,
            totalRespondents: 0,
            cost: 0,
            communityDetails: [/*{
                recordID: sharedService.generateUniqueID(),
                communities: [],
                countries: [], // get countries by community
                ages: [], // get ages by community
                gender: [],
                respondents: [], // get respondents by community
                selected: {
                    community: [],
                    countries: [],
                    countries_text: "",
                    ages: [],
                    age_text: "",
                    respondents: "",
                    gender: [],
                    gender_text: "",
                },
                showErrorFlag: false,
                errorMessage: '',
                showSuccessMessage: false,
                showContainerFlag: true,
                communityFlag: false,
                ageRangeFlag: false,
                respondentFlag: false,
                genderFlag: false,
                animationClass: '',
                showSubmitBtn: true,
                disableSubmitBtn: 'disabled',
                popup: {
                    open: false,
                    type: '',
                    message: '',
                },
                data: {
                    httpResponseData: {
                        communityList: [],
                        communityDetails: [],
                    },
                    parsedData: {
                        communityList: [],
                        countries: [],
                        ageRanges: [],
                        gender: [],
                        respondents: [],
                    }
                },
                cost: 0,
                validated: false,
                progress: {
                    country: '',
                    age: '',
                    respondents: '',
                    gender: ''
                }
            }*/],
            notes: '',
            communitiesAdded: 0,
            uploadedDocs: [],
            uploadDocumentFlag: true,
            uploadedImages: [],
            agreedTerms: false,
        };
        // @newCommunityForm : This is a temporary variable to store data for add new community form
        $scope.newCommunityForm = {
            communities: [],
            // selectedCountry: "Canada",
            countries: [], // get countries by community
            ages: [], // get ages by community
            gender: {},
            respondents: [], // get respondents by community
            selected: {
                community: {},
                countries: [],
                countries_text: "",
                ages: [],
                age_text: '',
                respondents: '',
                gender: {},
                gender_text: ''
            },
            cost: 0,
            validated: false,
            progress: {
                country: '',
                age: '',
                respondents: '',
                gender: ''
            },
            showErrorFlag: false,
            errorMessage: "",
            showSuccessMessage: false,
            communityFlag: false,
            ageRangeFlag: false,
            respondentFlag: false,
            genderFlag: false,
            animationClass: '',
            showSubmitBtn: false,
            disableSubmitBtn: 'disabled',

        };
        $scope.showCommunityForm = false;
        //$scope.newProject.communities = communityService.getCommunities2();
        $scope.addMoreCommunity = {
            showBtn: true,
            disableBtn: false,
        }
        $scope.projectDetailsData = {};
        $scope.selectedProjectDetailsData = {};
        $scope.newProjectProgress = {
            currentStep: 0,
            previousStep: -1,
            previousBtn: {
                visible: false,
            },
            saveContinueBtn: {
                visible: true,
                disabled: 'disabled',
            },
            submitProjectBtn: {
                visible: false,
            }
        };
        // Teamname: usersService.getUserObject().teamname
        communityService.getCommunityListFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
            var firstCommunity = responseData.communities[0].communityname;
            communityService.parseDataGetCommunityList(responseData.communities);
            communityService.saveHttpResponseData("CommunityList", responseData); // save query data
            $scope.responces.CommunityList = responseData;

            // Set countries
            $scope.newCommunityForm.countries = communityService.getCountries();
            //$scope.project.communityDetails[0].countries = communityService.getCountries();
            $scope.allCountries = communityService.getCountries();

        });

        sharedService.getPricingInfoFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
            sharedService.saveHttpResponseData("NewProjectPricing", responseData);
            sharedService.parseDataGetProjectPricing(responseData);
            $scope.priceTable = sharedService.getPricingTable();
            for (var i = $scope.priceTable.nQmin; i <= $scope.priceTable.nQmax; i++) {
                $scope.questions.push(i);
            }
        });

    }  /*- End of Init () -*/


    $rootScope.$watch('update.projectID', function(newVal, oldVal){
        if($rootScope.update.projectID!='' && newVal!==oldVal){
            // load project details
            // then view the page
            $scope.resetProjectUpdateForm();
            $scope.projectID = $rootScope.update.projectID;
            $scope.showProjectUpdateForm = true;
            $scope.initiatePage();
        }else{
            $scope.resetProjectUpdateForm();
        }
    });

    $scope.initiatePage = function(){
        console.log("Initiate Update Page");
        $scope.projectID = $rootScope.update.projectID;
        $scope.projectDetailsData = sharedService.getProjectData(); //$rootScope.update.project;
        $scope.projectNote = $scope.$parent.projectNote;
        console.log("Project Note");
        if($scope.projectNote.list.length>0){
            $scope.projectNote.sliderVisibility = false;
            $scope.noteWd = {'width':'27%'};
            $scope.addNoteBtn = false;
        }else{
            $scope.wizardWd = {};
            $scope.noteWd = {'width':'27%'};
            $scope.projectNote.sliderVisibility = true;
            $scope.addNoteBtn = true;
        }
        $scope.projectNoteSlider();
        $scope.newNote = '';
        //console.log(communityService.getCommunityDetails());
        //console.log(" --------- projectCommunityDetails ---------- ");
        //console.log($scope.projectCommunityDetails);

        $scope.selectedProjectDetailsData = sharedService.getSelectedProject();
        //console.log(" ---> projectDetailsData");
        //console.log($scope.projectDetailsData);
        //console.log(" ---> selectedProjectData");
        //console.log($scope.selectedProjectDetailsData);
        communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
        communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList);
        //$scope.selectedProjectDetailsData = $rootScope.update.selectedProject;
        $scope.config = {
            sh: {
                updateProjectForm: true,
            },
            appearance: {
                first: 'zoomIn animated',
                second: '',
                third: '',
            },

            disabledButtons: [false, true, true],

        }
        $scope.fieldError = {
            projectName: false,
            projectDescription: false,
            questions: false,
        }
        $scope.manager = {
            display: false,
            email: "",
            name: "",
        }
        $scope.project.projectName = $scope.projectDetailsData.projectname;
        $scope.project.projectDescription = $scope.projectDetailsData.projectdescription;
        $scope.project.questions = 5;//$scope.projectDetailsData.numquestions;
        $scope.project.totalRespondents = $scope.selectedProjectDetailsData.totalRespondents;
        $scope.project.cost = $scope.selectedProjectDetailsData.cost;
        // Communities
        $scope.project.communityDetails = [];
        var temp, i, j, comIndex= 0;
        for(var i=0; i<$scope.projectDetailsData.communities.length; i++){
            var communityStruc = communityService.getCommunityDetailsObject();

            communityStruc.countries = communityService.getCountries();
            communityStruc.communities = communityService.getCommunityByCountry($scope.projectDetailsData.communities[i].country[0]);
            communityStruc.communities.communityFlag = true;
            //subComDetails = communityService.setCommunityDetails(communityService.getCommunityDetails($scope.projectDetailsData.communities[i].communityname), );
            temp = communityService.formatCountry($scope.projectDetailsData.communities[i].country);
            communityStruc.selected.countries_text = temp.text;
            communityStruc.selected.countries = temp.array;

            comIndex = communityStruc.communities.map(function(item) { return item.name; }).indexOf($scope.projectDetailsData.communities[i].communityname);

            communityStruc.selected.community.name = $scope.projectDetailsData.communities[i].communityname;
            communityStruc.selected.community.description = $scope.projectDetailsData.communities[i].communitydescription;
            communityStruc.selected.community.selected = true;
            communityStruc.selected.community.returnDataListID = communityStruc.communities[comIndex].returnDataListID;

            communityService.parseDataGetCommunityDetails($scope.projectDetailsData.communities[i].communityname);
            communityStruc.ages = communityService.getAgeRanges();
            temp = communityService.formatSelectedAgeRanges($scope.projectDetailsData.communities[i].ageselection);
            communityStruc.selected.age_text = temp.text;
            communityStruc.selected.ages = temp.formattedArray;
            for(var j=0; j<communityStruc.selected.ages.length; j++){
                temp = communityStruc.ages.map(function(item) { return item.ageRange; }).indexOf(communityStruc.selected.ages[j].ageRange)
                communityStruc.ages[temp].checked = true;
            }
            communityService.filterRespondentByAge(communityStruc.selected.ages, $scope.projectDetailsData.communities[i].communityname);
            communityStruc.respondents = communityService.getRespondents();
            communityStruc.selected.respondents = $scope.projectDetailsData.communities[i].respondents;

            communityService.filterGender(communityStruc.selected.ages, communityStruc.selected.respondents, communityStruc.selected.community.name);
            communityStruc.gender = communityService.getGender();
            temp = communityService.formatGender($scope.projectDetailsData.communities[i].gender);
            communityStruc.selected.gender_text = temp.text;
            communityStruc.selected.gender = temp.array;

            for(var j=0; j<communityStruc.selected.gender.length; j++){
                temp = communityStruc.gender.map(function(item) { return item.name; }).indexOf(communityStruc.selected.gender[j].name)
                communityStruc.gender[temp].selected = true;
            }
            communityStruc.cost = $scope.getCommunityCost(communityStruc.selected.respondents);

            communityStruc.data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
            communityStruc.data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", $scope.projectDetailsData.communities[i].communityname);
            communityStruc.data.parsedData.communityList = communityService.getCommunityList();
            communityStruc.data.parsedData.countries = communityService.getCountries();
            communityStruc.data.parsedData.ageRanges = communityService.getAgeRanges();
            communityStruc.data.parsedData.gender = communityService.getGender();
            communityStruc.data.parsedData.respondents = communityService.getRespondents();

            communityStruc.communityFlag = true;
            communityStruc.ageRangeFlag = true;
            communityStruc.respondentFlag = true;
            communityStruc.genderFlag = true;
            communityStruc.cost = 0;
            communityStruc.validated = true;
            communityStruc.progress.country = 'verified';
            communityStruc.progress.age = 'verified';
            communityStruc.progress.respondents = 'verified';
            communityStruc.progress.gender = 'verified';
            communityStruc.showContainerFlag = false;
            communityStruc.disableSubmitBtn = '';

            $scope.project.communityDetails.push(communityStruc);

        }
        $scope.project.communitiesAdded = $scope.project.communityDetails.length;
        if($scope.selectedProjectDetailsData.hasOwnProperty('questionnaireDocuments')){
            if($scope.selectedProjectDetailsData.questionnaireDocuments.length>0){
                for(var i=0; i<$scope.selectedProjectDetailsData.questionnaireDocuments.length; i++){
                    $scope.project.uploadedDocs.push({
                        file: '',
                        name: $scope.selectedProjectDetailsData.questionnaireDocuments[i].name,
                        note: $scope.selectedProjectDetailsData.questionnaireDocuments[i].description,
                        link: $scope.selectedProjectDetailsData.questionnaireDocuments[i].link,
                        emptyNote: false,
                        error: '',
                    });
                }
            }
        }

        if($scope.project.uploadedDocs.length>0){
            $scope.project.uploadDocumentFlag = false;
        }else{
            $scope.project.uploadDocumentFlag = true;
        }
        if($scope.selectedProjectDetailsData.hasOwnProperty('images')){
            if($scope.selectedProjectDetailsData.images.length>0){
                for(var i=0; i<$scope.selectedProjectDetailsData.images.length; i++){
                    $scope.project.uploadedImages.push({
                        file: '',
                        name: $scope.selectedProjectDetailsData.images[i].name,
                        note: '',
                        link: $scope.selectedProjectDetailsData.images[i].link,
                        emptyNote: false,
                        error: '',
                    });
                }
            }
        }
        $scope.addMoreCommunity.showBtn = true;
        $scope.addMoreCommunity.disableBtn = '';
        $scope.activateNextStep();
        console.log(" ______________ Project ____________");
        console.log($scope.project);

    }

    /* *
     * Method: onChangeProjectName
     * Parameters:
     * Description: This method will invoke when user change project name and check if the project name is empty or not.
     * */
    $scope.onChangeProjectName = function() {
        if ($scope.project.projectName.trim() == '') {
            $scope.fieldError.projectName = true;
        } else {
            $scope.fieldError.projectName = false;
        }
       // $scope.activateNextStep();  create new function to find which steps are completed  **** TODO TODO TODO ****
    }

    /* *
     * Method: calculateTotalCost
     * Parameters:
     * Description: This method will invoke when user check or change 'number of respondents' radio button and when question number changes
     * */
    $scope.calculateTotalCost = function() {
        var sum = 0,
            i = 0;
        for (i = 0; i < $scope.project.communityDetails.length; i++) {
            sum += $scope.project.communityDetails[i].cost;
        }
        if ($scope.showCommunityForm === true && $scope.newCommunityForm.genderFlag === true) {
            sum += $scope.newCommunityForm.cost;
        }
        $scope.project.cost = sum;
    }
    /* *
     * Method: questionSelectorChanged
     * Parameters:
     * Description: This method invokes when user changes number of questions selection in new project.
     * */
    $scope.questionSelectorChanged = function() {
        if ($scope.project.communityDetails.length > 0) {
            for (var i = 0; i < $scope.project.communityDetails.length; i++) {
                if ($scope.project.communityDetails[i].selected.respondents != "") {
                    $scope.project.communityDetails[i].cost = $scope.getCommunityCost($scope.project.communityDetails[i].selected.respondents);
                }
            }
        }
        if ($scope.newCommunityForm.selected.respondents != "") {
            $scope.newCommunityForm.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents);
        }
        $scope.calculateTotalCost();
        //$scope.activateNextStep();
    }

    $scope.calculateTotalRespondents = function() {
        var totalRespondents = 0;
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
            totalRespondents += Number($scope.project.communityDetails[i].selected.respondents);
        }
        totalRespondents += Number($scope.newCommunityForm.selected.respondents);
        $scope.project.totalRespondents = totalRespondents;
    }

    /* *
     * Method: getCommunityCost
     * Parameters: Number of Respondents
     * Description: This method will invoke when user check or change 'number of respondents' radio button
     * */
    $scope.getCommunityCost = function(respondents) {
        var cost = 0;
        for (var i = 0; i < $scope.priceTable.priceChar[respondents].length; i++) {
            if ($scope.project.questions <= $scope.priceTable.priceChar[respondents][i].max) {
                cost = $scope.priceTable.priceChar[respondents][i].price;
                break;
            }
        }
        return cost;
    }

    /* *
     * Method: onChangeProjectDescription
     * Parameters:
     * Description: This method will invoke when user changes number project description and check if the project description is empty or not.
     * */
    $scope.onChangeProjectDescription = function() {
        if ($scope.project.projectDescription.trim() == '') {
            $scope.fieldError.projectDescription = true;
        } else {
            $scope.fieldError.projectDescription = false;
        }
        //$scope.activateNextStep();
    }

    /* *
     * Method: toggleCommunityContainer
     * Parameters: Unique ID for each community which has added in the list
     * Description: This method will invoke when ever user clicks a community from the list of communities which has added shortly.
     * */
    $scope.toggleCommunityContainer = function(recordID) {
        console.log("--- toggleCommunityContainer ---");
        communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
        communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList); // save query data

        // Reset New Community form
        $scope.resetNewCommunityForm();
        $scope.addMoreCommunity.disableBtn = '';
        $scope.addMoreCommunity.showBtn = true;

        var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID), temp;
        communityService.getCommunityDetailsFromDataSource(usersService.getUserObject().teamname, $scope.project.communityDetails[communityIndex].selected.community.name).then(function(responseData) {
            communityService.saveHttpResponseData("CommunityDetails", responseData, $scope.project.communityDetails[communityIndex].selected.community.name);
            communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].ages = communityService.getAgeRanges();
            for(var i=0; i<$scope.project.communityDetails[communityIndex].selected.ages.length; i++){
                temp = $scope.project.communityDetails[communityIndex].ages.map(function(item) { return item.ageRange; }).indexOf($scope.project.communityDetails[communityIndex].selected.ages[i].ageRange)
                $scope.project.communityDetails[communityIndex].ages[temp].checked = true;
            }
            //$scope.project.communityDetails[communityIndex].selected.age_text = selected_age_text.substring(0, selected_age_text.length - 2);
            communityService.filterRespondentByAge($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].respondents = communityService.getRespondents();

            communityService.filterGender($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.respondents, $scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
            for(var i=0; i<$scope.project.communityDetails[communityIndex].selected.gender.length; i++){
                temp = $scope.project.communityDetails[communityIndex].gender.map(function(item) { return item.name; }).indexOf($scope.project.communityDetails[communityIndex].selected.gender[i].name)
                $scope.project.communityDetails[communityIndex].gender[temp].selected = true;
            }
            $scope.project.communityDetails[communityIndex].cost = $scope.getCommunityCost($scope.project.communityDetails[communityIndex].selected.respondents);
        });

        var unsavedData = false,i;
        for (i = 0; i < $scope.project.communityDetails.length; i++) {
            //$scope.project.communityDetails[communityIndex].popup.open
            if ($scope.project.communityDetails[i].disableSubmitBtn == 'disabled') {
                $scope.project.communityDetails[i].popup.open = true;
                $scope.project.communityDetails[i].popup.type = 'Error';
                $scope.project.communityDetails[i].popup.message = 'Please complete and save the changes, otherwise you will lose informaton.';
                unsavedData = true;
                break;
            }
        }
        if (unsavedData === true) {
            $scope.project.communityDetails[i].showErrorFlag = true;
            $scope.project.communityDetails[i].errorMessage = $scope.project.communityDetails[i].popup.message;
        } else {
            for (i = 0; i < $scope.project.communityDetails.length; i++) {
                if ($scope.project.communityDetails[i].recordID == recordID) {
                    if ($scope.project.communityDetails[i].showContainerFlag == true) {
                        $scope.project.communityDetails[i].showContainerFlag = false;
                    } else {
                        $scope.project.communityDetails[i].showContainerFlag = true;
                        // Restore the web service data in communityService
                        communityService.httpResponseData.communityList = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList;

                        communityService.saveHttpResponseData("CommunityDetails", $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails, $scope.project.communityDetails[communityIndex].selected.community.name);
                        communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);

                        communityService.parsedData.communityList = $scope.project.communityDetails[communityIndex].data.parsedData.communityList;
                        communityService.parsedData.communityDetails = $scope.project.communityDetails[communityIndex].data.parsedData.communityDetails;
                        communityService.parsedData.countries = $scope.project.communityDetails[communityIndex].data.parsedData.countries;
                        communityService.parsedData.ageRanges = $scope.project.communityDetails[communityIndex].data.parsedData.ageRanges;
                        communityService.parsedData.gender = $scope.project.communityDetails[communityIndex].data.parsedData.gender;
                        communityService.parsedData.respondents = $scope.project.communityDetails[communityIndex].data.parsedData.respondents;
                    }
                } else {
                    $scope.project.communityDetails[i].showContainerFlag = false;
                }
            }
        }
        $scope.showCommunityForm = false;
    }

    /* *
     * Method: prepareCountries
     * Parameters: Added Community Index
     * Description: prepareCountries method will invoke when ever user checks or uncheck a country and create a string to display selected countries in summary
     * */
    $scope.prepareCountries = function(recordID, countryIndex, type) {
        var selected_countries = [],
            selected_countries_text = "",
            selected_countries_set = [];
        communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
        communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList);
        if (type == 'NewForm') {
            for (var i = 0; i < $scope.newCommunityForm.countries.length; i++) {
                $scope.newCommunityForm.countries[i].checked = false;
            }
            $scope.newCommunityForm.countries[countryIndex].checked = true;
            selected_countries.push($scope.newCommunityForm.countries[countryIndex]);
            selected_countries_text += $scope.newCommunityForm.countries[countryIndex].name + ", ";
            selected_countries_set.push($scope.newCommunityForm.countries[countryIndex].name);

            $scope.newCommunityForm.selected.countries = selected_countries;
            $scope.newCommunityForm.selected.countries_text = selected_countries_text.substring(0, selected_countries_text.length - 2);
            // get community list by selected countries
            if (selected_countries_set.length > 0) {
                $scope.newCommunityForm.communities = communityService.getCommunityByCountry(selected_countries_set);
                $scope.newCommunityForm.communityFlag = true;
            } else {
                $scope.resetNewCommunityForm();
                $scope.newCommunityForm.communities = [];
                $scope.newCommunityForm.communityFlag = false;
                $scope.newCommunityForm.ageRangeFlag = false;
                $scope.newCommunityForm.respondentFlag = false;
                $scope.newCommunityForm.genderFlag = false;
            }
            $scope.newCommunityForm.progress.country = 'verified';
            $scope.newCommunityForm.progress.age = '';
            $scope.newCommunityForm.progress.respondents = '';
            $scope.newCommunityForm.progress.gender = '';
            $scope.validateNewCommunityForm();
            $scope.newCommunityForm.showSubmitBtn = true;
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID);//$scope.getArrayIndexByCommunityRecordID(recordID);
            for (var i = 0; i < $scope.project.communityDetails[communityIndex].countries.length; i++) {
                $scope.project.communityDetails[communityIndex].countries[i].checked = false;
            }
            $scope.project.communityDetails[communityIndex].countries[countryIndex].checked = true;
            selected_countries.push($scope.project.communityDetails[communityIndex].countries[countryIndex]);
            selected_countries_text += $scope.project.communityDetails[communityIndex].countries[countryIndex].name + ", ";
            selected_countries_set.push($scope.project.communityDetails[communityIndex].countries[countryIndex].name);

            $scope.project.communityDetails[communityIndex].selected.countries = selected_countries;
            $scope.project.communityDetails[communityIndex].selected.countries_text = selected_countries_text.substring(0, selected_countries_text.length - 2);
            // get community list by selected countries
            if (selected_countries_set.length > 0) {
                $scope.project.communityDetails[communityIndex].communities = communityService.getCommunityByCountry(selected_countries_set);
                $scope.project.communityDetails[communityIndex].communityFlag = true;
                $scope.project.communityDetails[communityIndex].progress.country = 'verified';
            } else {
                $scope.resetNewCommunityForm();
                $scope.project.communityDetails[communityIndex].communities = [];
                $scope.project.communityDetails[communityIndex].communityFlag = false;
                $scope.project.communityDetails[communityIndex].selected.countries = [];
                $scope.project.communityDetails[communityIndex].selected.countries_text = "";
                $scope.project.communityDetails[communityIndex].progress.country = '';
            }

            $scope.project.communityDetails[communityIndex].selected.community = {};

            $scope.project.communityDetails[communityIndex].selected.ages = [];
            $scope.project.communityDetails[communityIndex].selected.age_text = "";
            $scope.project.communityDetails[communityIndex].selected.respondents = "";
            $scope.project.communityDetails[communityIndex].selected.gender = [];
            $scope.project.communityDetails[communityIndex].selected.gender_text = "";
            $scope.project.communityDetails[communityIndex].ageRangeFlag = false;
            $scope.project.communityDetails[communityIndex].respondentFlag = false;
            $scope.project.communityDetails[communityIndex].genderFlag = false;
            $scope.project.communityDetails[communityIndex].progress.age = '';
            $scope.project.communityDetails[communityIndex].progress.respondents = '';
            $scope.project.communityDetails[communityIndex].progress.gender = '';
            $scope.validateAddedCommunity(communityIndex);
        }
        $scope.activateNextStep();
    };

    /* *
     * Method: updateSelectedCommunities
     * Parameters:
     * Description: This method invokes when community checkboxs are clicked and updated the currently selected community list.
     * */
    $scope.updateSelectedCommunities = function(recordID, index) {
        var communityIndex =  $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
        console.log(" ----- updateSelectedCommunities -----");
        if (Object.keys($scope.project.communityDetails[communityIndex].selected.community).length > 0) {
            if ($scope.project.communityDetails[communityIndex].selected.community)
                communityService.getCommunityDetailsFromDataSource(usersService.getUserObject().teamname, $scope.project.communityDetails[communityIndex].selected.community.name).then(function(responseData) {
                    communityService.saveHttpResponseData("CommunityDetails", responseData, $scope.project.communityDetails[communityIndex].selected.community.name);
                    communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);

                    $scope.project.communityDetails[communityIndex].ages = communityService.getAgeRanges();
                    $scope.project.communityDetails[communityIndex].respondents = [];
                    $scope.project.communityDetails[communityIndex].gender = [];
                    $scope.project.communityDetails[communityIndex].selected.ages = [];
                    $scope.project.communityDetails[communityIndex].selected.age_text = '';
                    $scope.project.communityDetails[communityIndex].selected.respondents = '';
                    $scope.project.communityDetails[communityIndex].selected.gender = [];
                    $scope.project.communityDetails[communityIndex].selected.gender_text = '';

                    $scope.project.communityDetails[communityIndex].ageRangeFlag = true;
                    $scope.project.communityDetails[communityIndex].respondentFlag = false;
                    $scope.project.communityDetails[communityIndex].genderFlag = false;
                });
        }
        $scope.project.communityDetails[communityIndex].progress.age = '';
        $scope.project.communityDetails[communityIndex].progress.respondents = '';
        $scope.project.communityDetails[communityIndex].progress.gender = '';
        $scope.validateAddedCommunity(communityIndex);
        $scope.activateNextStep();
    }

    $scope.ageChecked = function(recordID, index, type) {
        if (type == 'NewForm') {
            if ($scope.newCommunityForm.ages[index].checked === true) {
                $scope.newCommunityForm.ages[index].checked = false;
            } else {
                $scope.newCommunityForm.ages[index].checked = true;
            }
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            if ($scope.project.communityDetails[communityIndex].ages[index].checked === true) {
                $scope.project.communityDetails[communityIndex].ages[index].checked = false;
            } else {
                $scope.project.communityDetails[communityIndex].ages[index].checked = true;
            }
        }
        $scope.prepareAges(recordID, type);
        $scope.activateNextStep();
    }

    /* *
     * Method: prepareAges
     * Parameters: Added Community Index
     * Description: prepareAges method will invoke when ever user checks or uncheck an age range and create a string to display selected age ranges in summar
     * */
    $scope.prepareAges = function(recordID, type) {
        var selected_ages = [],
            selected_age_text = "",
            i;
        if (type == 'NewForm') {
            for (i = 0; i < $scope.newCommunityForm.ages.length; i++) {
                if ($scope.newCommunityForm.ages[i].checked === true) {
                    selected_ages.push($scope.newCommunityForm.ages[i]);
                    selected_age_text += $scope.newCommunityForm.ages[i].ageRange + ", ";
                }
            }
            $scope.newCommunityForm.selected.ages = selected_ages;
            if (selected_ages.length > 0) {
                $scope.newCommunityForm.selected.age_text = selected_age_text.substring(0, selected_age_text.length - 2);
                communityService.filterRespondentByAge(selected_ages, $scope.newCommunityForm.selected.community.name);
                $scope.newCommunityForm.respondents = communityService.getRespondents();
                $scope.newCommunityForm.selected.respondents = "";
                $scope.newCommunityForm.respondentFlag = true;
                $scope.newCommunityForm.gender = [];
                $scope.newCommunityForm.selected.gender = [];
                $scope.newCommunityForm.selected.gender_text = "";
                $scope.newCommunityForm.progress.age = 'verified';
            } else {
                $scope.newCommunityForm.selected.respondents = '';
                $scope.newCommunityForm.respondentFlag = false;
                $scope.newCommunityForm.gender = [];
                $scope.newCommunityForm.selected.gender = [];
                $scope.newCommunityForm.selected.gender_text = '';
                $scope.newCommunityForm.genderFlag = false;
                $scope.newCommunityForm.progress.age = '';
            }
            $scope.newCommunityForm.progress.respondents = '';
            $scope.newCommunityForm.progress.gender = '';

            $scope.validateNewCommunityForm();
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            for (i = 0; i < $scope.project.communityDetails[communityIndex].ages.length; i++) {
                if ($scope.project.communityDetails[communityIndex].ages[i].checked === true) {
                    selected_ages.push($scope.project.communityDetails[communityIndex].ages[i]);
                    selected_age_text += $scope.project.communityDetails[communityIndex].ages[i].ageRange + ", ";
                }
            }
            $scope.project.communityDetails[communityIndex].selected.ages = selected_ages;
            if (selected_ages.length > 0) {
                $scope.project.communityDetails[communityIndex].selected.age_text = selected_age_text.substring(0, selected_age_text.length - 2);
                communityService.filterRespondentByAge(selected_ages, $scope.project.communityDetails[communityIndex].selected.community.name);
                $scope.project.communityDetails[communityIndex].respondents = communityService.getRespondents();
                $scope.project.communityDetails[communityIndex].selected.respondents = '';
                $scope.project.communityDetails[communityIndex].respondentFlag = true;
                $scope.project.communityDetails[communityIndex].gender = [];
                $scope.project.communityDetails[communityIndex].selected.gender = [];
                $scope.project.communityDetails[communityIndex].selected.gender_text = "";
                $scope.project.communityDetails[communityIndex].progress.age = 'verified';
            } else {
                $scope.project.communityDetails[communityIndex].selected.age_text = "";
                $scope.project.communityDetails[communityIndex].selected.respondents = '';
                $scope.project.communityDetails[communityIndex].respondentFlag = false;
                $scope.project.communityDetails[communityIndex].gender = [];
                $scope.project.communityDetails[communityIndex].selected.gender = [];
                $scope.project.communityDetails[communityIndex].selected.gender_text = '';
                $scope.project.communityDetails[communityIndex].progress.age = '';
            }
            $scope.project.communityDetails[communityIndex].progress.respondents = '';
            $scope.project.communityDetails[communityIndex].progress.gender = '';
            $scope.project.communityDetails[communityIndex].genderFlag = false;
            $scope.validateAddedCommunity(communityIndex);
        }
        $scope.activateNextStep();
    }

    /* *
     * Method: prepareGender
     * Parameters:
     * Description: This method will invoke when user change the gender selection in both new form to add community and recently added communities.
     * */
    $scope.prepareGender = function(recordID, index, type) {
        var selected_genders = [],
            selected_gender_text = ""
        if (type == 'NewForm') {
            for (var i = 0; i < $scope.newCommunityForm.gender.length; i++) {
                if ($scope.newCommunityForm.gender[i].selected === true) {
                    selected_genders.push($scope.newCommunityForm.gender[i]);
                    selected_gender_text += $scope.newCommunityForm.gender[i].name + ", ";
                }
            }
            if (selected_genders.length > 0) {
                $scope.newCommunityForm.selected.gender = selected_genders;
                $scope.newCommunityForm.selected.gender_text = selected_gender_text.substring(0, selected_gender_text.length - 2);
                $scope.newCommunityForm.progress.gender = 'verified';
            } else {
                $scope.newCommunityForm.selected.gender_text = "";
                $scope.newCommunityForm.progress.gender = '';
            }
            $scope.validateNewCommunityForm();
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            for (var i = 0; i < $scope.project.communityDetails[communityIndex].gender.length; i++) {
                if ($scope.project.communityDetails[communityIndex].gender[i].selected === true) {
                    selected_genders.push($scope.project.communityDetails[communityIndex].gender[i]);
                    selected_gender_text += $scope.project.communityDetails[communityIndex].gender[i].name + ", ";
                }
            }
            if (selected_genders.length > 0) {
                $scope.project.communityDetails[communityIndex].selected.gender = selected_genders;
                $scope.project.communityDetails[communityIndex].selected.gender_text = selected_gender_text.substring(0, selected_gender_text.length - 2);
                $scope.project.communityDetails[communityIndex].progress.gender = 'verified';
            } else {
                $scope.project.communityDetails[communityIndex].selected.gender_text = "";
                $scope.project.communityDetails[communityIndex].progress.gender = '';
            }
            $scope.validateAddedCommunity(communityIndex);
        }
        $scope.activateNextStep();
    }

    /* *
     * Method: saveCommunityInfo
     * Parameters: Unique ID for each recently added community
     * Description: This method will invoke when user saves the updates in any recently added community
     * */
    $scope.saveCommunityInfo = function(recordID) {
        console.log("--------- Save Community Info -----------");
        var communityIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
        $scope.project.communityDetails[communityIndex].showSuccessMessage = true;
        $scope.project.communityDetails[communityIndex].showErrorFlag = false;
        $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
        $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails");
        $scope.project.communityDetails[communityIndex].data.parsedData.communityList = communityService.getCommunityList();
        $scope.project.communityDetails[communityIndex].data.parsedData.countries = communityService.getCountries();
        $scope.project.communityDetails[communityIndex].data.parsedData.ageRanges = communityService.getAgeRanges();
        $scope.project.communityDetails[communityIndex].data.parsedData.gender = communityService.getGender();
        $scope.project.communityDetails[communityIndex].data.parsedData.respondents = communityService.getRespondents();

        $scope.addMoreCommunity.showBtn = true;
        $scope.addMoreCommunity.disableBtn = '';
        $scope.project.communitiesAdded = $scope.project.communityDetails.length + 1;

        $timeout(function() {
            $scope.project.communityDetails[communityIndex].showSuccessMessage = false
        }, 5000);
        $timeout(function() {
            $scope.project.communityDetails[communityIndex].showErrorFlag = false
        }, 10000);
        //$timeout(function(){$scope.project.communityDetails[communityIndex].showContainerFlag = false}, 5500);
        $scope.activateNextStep();
    }

    /* *
     * Method: validateAddedCommunity
     * Parameters: Community Index in @newProject
     * Description: This method will invoke when user change any information in any of the recently added community.
     * */
    $scope.validateAddedCommunity = function(communityIndex) {
        if ($scope.project.communityDetails[communityIndex].selected.countries.length > 0 && $scope.project.communityDetails[communityIndex].selected.ages.length > 0 && $scope.project.communityDetails[communityIndex].selected.respondents > 0 && $scope.project.communityDetails[communityIndex].selected.gender_text.length > 0) {
            $scope.project.communityDetails[communityIndex].disableSubmitBtn = '';
            $scope.addMoreCommunity.disableBtn = '';
            $scope.project.communityDetails[communityIndex].validated = true;

        } else {
            $scope.addMoreCommunity.disableBtn = 'disabled';
            $scope.project.communityDetails[communityIndex].disableSubmitBtn = 'disabled';
            $scope.project.communityDetails[communityIndex].validated = false;
            $scope.project.communityDetails[communityIndex].popup.open = true;
            $scope.project.communityDetails[communityIndex].popup.type = 'Error';
            $scope.project.communityDetails[communityIndex].popup.message = 'Please complete and save the changes, otherwise you will lose informaton.';
        }
        $scope.activateNextStep();
    }

    /* *
     * Method: respondentChanged
     * Parameters:
     * Description: This method will invoke when user change the number of respondent selection in both new form to add community and recently added communities.
     * */
    $scope.respondentChanged = function(recordID, index, type) {
        if (type == "NewForm") {
            communityService.filterGender($scope.newCommunityForm.selected.ages, $scope.newCommunityForm.selected.respondents, $scope.newCommunityForm.selected.community.name);
            $scope.newCommunityForm.gender = communityService.getGender();
            $scope.newCommunityForm.selected.gender = [];
            $scope.newCommunityForm.selected.gender_text = "";
            $scope.newCommunityForm.genderFlag = true;
            $scope.newCommunityForm.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents);
            if (Number($scope.newCommunityForm.selected.respondents) > 0) {
                $scope.newCommunityForm.progress.respondents = 'verified';
            } else {
                $scope.newCommunityForm.progress.respondents = '';
            }
            $scope.newCommunityForm.progress.gender = '';

            $scope.validateNewCommunityForm();
            $scope.calculateTotalRespondents();
            if ($scope.project.totalRespondents > 1000) {
                $scope.newCommunityForm.errorMessage = 'Maximum respondents for each project is 1000. Your project crossed the maximum limit of respondents. To add more communities delete some previously added communities.';
                $scope.newCommunityForm.showErrorFlag = true;
                $scope.newCommunityForm.selected.respondents = 0;
                $scope.newCommunityForm.progress.respondents = '';
                $scope.newCommunityForm.gender = communityService.getGender();
                $scope.newCommunityForm.selected.gender = [];
                $scope.newCommunityForm.selected.gender_text = "";
                $scope.newCommunityForm.genderFlag = false;
            } else {
                $scope.newCommunityForm.errorMessage = '';
                $scope.newCommunityForm.showErrorFlag = false;
                $scope.newCommunityForm.progress.respondents = 'verified';
            }
        } else {
            var communityIndex =  $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            communityService.filterGender($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.respondents, $scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
            $scope.project.communityDetails[communityIndex].selected.gender = [];
            $scope.project.communityDetails[communityIndex].selected.gender_text = "";
            $scope.project.communityDetails[communityIndex].genderFlag = true;
            $scope.project.communityDetails[communityIndex].cost = $scope.getCommunityCost($scope.project.communityDetails[communityIndex].selected.respondents);
            if (Number($scope.project.communityDetails[communityIndex].selected.respondents) > 0) {
                $scope.project.communityDetails[communityIndex].progress.respondents = 'verified';
            } else {
                $scope.project.communityDetails[communityIndex].progress.respondents = '';
            }
            $scope.project.communityDetails[communityIndex].progress.gender = '';
            $scope.validateAddedCommunity(communityIndex);
            $scope.calculateTotalRespondents();
            if ($scope.project.totalRespondents > 1000) {
                $scope.project.communityDetails[communityIndex].errorMessage = 'Maximum respondents for each project is 1000. Your project crossed the maximum limit of respondents. To add more communities delete some previously added communities.';
                $scope.project.communityDetails[communityIndex].showErrorFlag = true;
                $scope.project.communityDetails[communityIndex].progress.respondents = '';
                $scope.project.communityDetails[communityIndex].selected.respondents = 0;
                $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
                $scope.project.communityDetails[communityIndex].selected.gender = [];
                $scope.project.communityDetails[communityIndex].selected.gender_text = "";
                $scope.project.communityDetails[communityIndex].genderFlag = false;
            } else {
                $scope.project.communityDetails[communityIndex].errorMessage = '';
                $scope.project.communityDetails[communityIndex].showErrorFlag = false;
                $scope.project.communityDetails[communityIndex].progress.respondents = 'verified';
            }
        }

        $scope.calculateTotalCost();
        $scope.activateNextStep();
    }

    /* *
     * Method: addCommunityToList
     * Parameters:
     * Description: This method will invoke when user change any information in any of the recently added community.
     * */
    $scope.addCommunityToList = function() {
        $scope.calculateTotalRespondents();
        if ($scope.project.totalRespondents > 1000) {
            $scope.newCommunityForm.errorMessage = 'Maximum respondents for each project is 1000. Your project crossed the maximum limit of respondents. To add more communities delete some previously added communities.';
            $scope.newCommunityForm.showErrorFlag = true;
            $scope.newCommunityForm.selected.respondents = 0;
            $scope.newCommunityForm.progress.respondents = '';
            $scope.newCommunityForm.gender = communityService.getGender();
            $scope.newCommunityForm.selected.gender = [];
            $scope.newCommunityForm.selected.gender_text = "";
            $scope.newCommunityForm.genderFlag = false;
        } else {
            $scope.newCommunityForm.errorMessage = '';
            $scope.newCommunityForm.showErrorFlag = false;
            $scope.newCommunityForm.progress.respondents = 'verified';

            var newCommunity = {
                recordID: sharedService.generateUniqueID(),
                communities: communityService.getCommunityList(),
                countries: communityService.getCountries(), // get countries by community
                ages: communityService.getAgeRanges(), // get ages by community
                gender: communityService.getGender(),
                respondents: communityService.getRespondents(), // get respondents by community
                selected: {
                    community: $scope.newCommunityForm.selected.community,
                    countries: $scope.newCommunityForm.selected.countries,
                    countries_text: $scope.newCommunityForm.selected.countries_text,
                    ages: $scope.newCommunityForm.selected.ages,
                    age_text: $scope.newCommunityForm.selected.age_text,
                    respondents: $scope.newCommunityForm.selected.respondents,
                    gender: $scope.newCommunityForm.selected.gender,
                    gender_text: $scope.newCommunityForm.selected.gender_text,
                },

                showErrorFlag: false,
                errorMessage: '',
                showSuccessMessage: false,
                communityFlag: true,
                ageRangeFlag: true,
                respondentFlag: true,
                genderFlag: true,
                animationClass: '',
                showSubmitBtn: true,
                disableSubmitBtn: '',
                popup: {
                    open: false,
                    type: '',
                    message: '',
                },
                data: {
                    httpResponseData: {
                        communityList: communityService.getHttpResponseData("CommunityList"),
                        communityDetails: communityService.getHttpResponseData("CommunityDetails"),
                    },
                    parsedData: {
                        communityList: communityService.getCommunityList(),
                        countries: communityService.getCountries(),
                        ageRanges: communityService.getAgeRanges(),
                        gender: communityService.getGender(),
                        respondents: communityService.getRespondents(),
                    }
                },
                cost: $scope.getCommunityCost($scope.newCommunityForm.selected.respondents),
                validated: true,
                progress: {
                    country: $scope.newCommunityForm.progress.country,
                    age: $scope.newCommunityForm.progress.age,
                    respondents: $scope.newCommunityForm.progress.respondents,
                    gender: $scope.newCommunityForm.progress.gender
                },
            };

            $scope.project.communityDetails.push(newCommunity);
            $scope.resetNewCommunityForm();
            $scope.showCommunityForm = false;
            $scope.addMoreCommunity.disableBtn = '';
            $scope.project.communitiesAdded = $scope.project.communityDetails.length;
            $scope.activateNextStep();
        }
    }


    $rootScope.prepareToDelete = function(recordID) {
        var index = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(recordID);


        $rootScope.modal.title = "Delete " + $scope.project.communityDetails[index].selected.community.name + " community ?";
        $rootScope.modal.text = "You are about to delete community <span class='hightlight'>" + $scope.project.communityDetails[index].selected.community.name + " from project " + $scope.project.projectName + "</span>. Are you sure?"
        document.getElementById("modalText").innerHTML = $scope.modal.text;
        $rootScope.modal.buttons.delete.fnc = "deleteCommunityFromProject";
        $rootScope.modal.buttons.delete.params = "'" + index + "'";
        $rootScope.modal.show = true;
        $scope.activateNextStep();
    }

    /* *
     * Method: deleteCommunityFromProject
     * Parameters:  Unique ID for each recently added community
     * Description: This method will invoke when user deletes recently added community from the project
     * */
    $rootScope.deleteCommunityFromProject = function(recordIndex) {
        if ($scope.project.communityDetails.length == 1) {
            $scope.project.communityDetails.splice(recordIndex, 1);
            $scope.project.communityDetails.push({
                recordID: sharedService.generateUniqueID(),
                communities: [],
                countries: communityService.getCountries(), // get countries by community
                ages: [], // get ages by community
                gender: [],
                respondents: [], // get respondents by community
                selected: {
                    community: [],
                    countries: [],
                    countries_text: "",
                    ages: [],
                    age_text: "",
                    respondents: "",
                    gender: [],
                    gender_text: "",
                },
                showErrorFlag: false,
                errorMessage: '',
                showSuccessMessage: false,
                showContainerFlag: true,
                communityFlag: false,
                ageRangeFlag: false,
                respondentFlag: false,
                genderFlag: false,
                animationClass: '',
                showSubmitBtn: true,
                disableSubmitBtn: 'disabled',
                popup: {
                    open: false,
                    type: '',
                    message: '',
                },
                data: {
                    httpResponseData: {
                        communityList: [],
                        communityDetails: [],
                    },
                    parsedData: {
                        communityList: [],
                        countries: [],
                        ageRanges: [],
                        gender: [],
                        respondents: [],
                    }
                },
                cost: 0,
                validated: false,
                progress: {
                    country: '',
                    age: '',
                    respondents: '',
                    gender: '',
                },
            });
            $scope.project.communitiesAdded = $scope.project.communityDetails.length;
            $scope.addMoreCommunity.disableBtn = 'disabled';
            growl.info("You have successfully deleted a community from this project.", {ttl: 5000});
        } else {
            $scope.project.communityDetails.splice(recordIndex, 1);
            $scope.project.communitiesAdded = $scope.project.communityDetails.length;
        }
        $scope.calculateTotalRespondents();
        $scope.calculateTotalCost();
        $rootScope.modal.show = false;
        $rootScope.resetModal();
        $scope.activateNextStep();
    }

    /* *
     * Method: validateNewCommunityForm
     * Parameters:
     * Description: This method will invoke when user change any information in any of the recently added community.
     * */
    $scope.validateNewCommunityForm = function() {
        if ($scope.newCommunityForm.selected.countries.length > 0 && $scope.newCommunityForm.selected.ages.length > 0 && $scope.newCommunityForm.selected.respondents.length > 0 && $scope.newCommunityForm.selected.gender_text.length > 0 && $scope.newCommunityForm.showErrorFlag === false) {
            $scope.newCommunityForm.disableSubmitBtn = '';
            $scope.newCommunityForm.validated = true;
        } else {
            $scope.newCommunityForm.disableSubmitBtn = 'disabled';
            $scope.newCommunityForm.validated = false;
        }
        $scope.activateNextStep();
    }


    /* *
     * Method: addAnoterCommunity
     * Parameters:
     * Description: This method will invoke when user clicks add more buttom to add more communities.
     * */
    $scope.addAnoterCommunity = function() {
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
            $scope.project.communityDetails[i].showContainerFlag = false;
        }
        $scope.resetNewCommunityForm();
        $scope.newCommunityForm.countries = $scope.allCountries;
        $scope.showCommunityForm = true;
        $scope.newCommunityForm.communityFlag = false;
        $scope.newCommunityForm.ageRangeFlag = false;
        $scope.newCommunityForm.respondentFlag = false;
        $scope.newCommunityForm.genderFlag = false;
        $scope.newCommunityForm.animationClass = '';
        $scope.newCommunityForm.showSubmitBtn = false;
        $scope.newCommunityForm.disableSubmitBtn = 'disabled';
        $scope.newCommunityForm.progress.country = '';
        $scope.newCommunityForm.progress.age = '';
        $scope.newCommunityForm.progress.respondents = '';
        $scope.newCommunityForm.progress.gender = '';
        $scope.addMoreCommunity.disableBtn = 'disabled';
        $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
    }

    /* *
     * Method: newformCommunityChanged
     * Parameters:
     * Description: This method invokes when community select dropdown change in add more community frame.
     * */
    $scope.newformCommunityChanged = function() {
        // ws to get data for selected community
        // subCommunityList?teamName=Research&communityName=TeleMarketing
        communityService.getCommunityDetailsFromDataSource(usersService.getUserObject().teamname, $scope.newCommunityForm.selected.community.name).then(function(responseData) {
            communityService.saveHttpResponseData("CommunityDetails", responseData, $scope.newCommunityForm.selected.community.name);
            communityService.parseDataGetCommunityDetails($scope.newCommunityForm.selected.community.name);
            $scope.newCommunityForm.ages = communityService.getAgeRanges();
            $scope.newCommunityForm.respondents = [];
            $scope.newCommunityForm.gender = [];
            $scope.newCommunityForm.ageRangeFlag = true;
            $scope.newCommunityForm.respondentFlag = false;
            $scope.newCommunityForm.genderFlag = false;
        });
        $scope.validateNewCommunityForm();
    }
    /* *
     * Method: resetNewCommunityForm
     * Parameters:
     * Description: This method will invoke when user add a community to a project and reset the add more community form
     * */
    $scope.resetNewCommunityForm = function() {
        $scope.newCommunityForm.countries = communityService.getCountries();
        $scope.newCommunityForm.ages = [];
        $scope.newCommunityForm.gender = [];
        $scope.newCommunityForm.gender_text = '';
        $scope.newCommunityForm.respondents = [];
        $scope.newCommunityForm.selected.community = {};
        $scope.newCommunityForm.selected.countries = [];
        $scope.newCommunityForm.selected.countries_text = "";
        $scope.newCommunityForm.selected.ages = [];
        $scope.newCommunityForm.selected.age_text = "";
        $scope.newCommunityForm.selected.respondents = '';
        $scope.newCommunityForm.selected.gender = {};
        $scope.newCommunityForm.selected.gender_text = '';
        $scope.newCommunityForm.selected.showErrorFlag = false;
        $scope.newCommunityForm.selected.showSuccessMessage = false;
        // Flags
        $scope.newCommunityForm.selected.communityFlag = false;
        $scope.newCommunityForm.selected.ageRangeFlag = false;
        $scope.newCommunityForm.selected.respondentFlag = false;
        $scope.newCommunityForm.selected.genderFlag = false;
        $scope.newCommunityForm.selected.animationClass = '';
        $scope.newCommunityForm.selected.showSubmitBtn = false;
        $scope.newCommunityForm.selected.disableSubmitBtn = 'disabled';
        $scope.showCommunityForm = false;
        $scope.addMoreCommunity.disableBtn = '';
        $scope.activateNextStep();
    }

    /* *
     * Method: saveProject
     * Parameters:
     * Description: Prepare an object with new project information and make a web service call to create new project.
     * Note: Document and Images are not part of this function.
     * */
    $scope.saveProject = function() {
        console.log("---------- Save Project -----------");

        if ($scope.newProjectProgress.currentStep == 2) {
            httpServerService.makeHttpRequest("projectState", "post", {
                teamName: usersService.getUserObject().teamname,
                projectId: $scope.projectID,
                notes: $scope.project.notes
            }).then(function(responseData) {
                if (responseData.status == 200) {
                    console.log("Success!!!");
                    console.log(responseData);
                    httpServerService.makeHttpRequest("projectById?teamName="+usersService.getUserObject().teamname+"&projectId="+$scope.projectID,"get").then(function(projectData){
                        if(projectData.status == 200){
                            var index = $scope.$parent.httpResponses['draftProjects'].map(function(item) { return item.projectId; }).indexOf($scope.projectID);
                            $scope.$parent.httpResponses['draftProjects'][index] = {};
                            $scope.$parent.httpResponses['draftProjects'][index] = projectData.data;

                            growl.info("You have successfully completed creating a new project. ");
                            $scope.showProjectUpdateForm = false;
                            $rootScope.update.projectID = '';
                            $scope.$parent.displayProjectDetails($scope.projectID, 'draftProjects');
                            /*if(usersService.isAdmin() || usersService.isManager() || usersService.isReviewer()){
                                $scope.$parent.displayProjectList('approved');
                            }else if(usersService.isEmployee()){
                                $scope.$parent.displayProjectList('approvalRequired');
                            }*/

                        }
                    });

                    //sharedService.setNotification({type:'success', message:'You have successfully completed creating a new project.', ttl:10000});
                } else {
                    console.log("Error : ");
                    console.log(responseData);
                }
            });
        } else {
            var  ws_url = "project", insertData = communityService.prepareProjectDataToSave($scope.project);
            console.log(insertData);

            if ($scope.projectID != null && typeof $scope.projectID != 'undefined') {
                ws_url += "?projectId=" + $scope.projectID;
            }

            httpServerService.makeHttpRequest(ws_url, "post", insertData).then(function(responseData) {
                if (responseData.status == 200) {
                    // success
                    console.log(" **** SUCCESS ****");
                    console.log(responseData);
                    if (responseData.data.hasOwnProperty('projectId')) {
                        $scope.projectID = responseData.data.projectId;
                    }
                    console.log($scope.projectID);
                    if (usersService.getUserObject().teamrole == "User") {
                        if (responseData.data.hasOwnProperty('manageremail') && responseData.data.hasOwnProperty('managerfirstname')) {
                            if (responseData.data.manageremail) {
                                $scope.manager.display = true;
                                $scope.manager.email = responseData.data.manageremail;
                                $scope.manager.name = (responseData.data.managerfirstname != null ? responseData.data.managerfirstname : '') + ((responseData.data.managerlastname != null && responseData.data.managerlastname != 'undefined') ? ' ' + responseData.data.managerlastname : '');
                            } else {
                                $scope.manager.display = false;
                            }
                        } else {
                            $scope.manager.display = false;
                            $scope.manager.email = '';
                            $scope.manager.name = '';
                        }
                    }
                } else {
                    console.log(" **** Failed ****");
                    console.log(responseData);
                }
            });
        }
    }

    $scope.backToProjectDetails = function(projectID){
        httpServerService.makeHttpRequest("projectById?teamName="+usersService.getUserObject().teamname+"&projectId="+$scope.projectID,"get").then(function(projectData) {
            if (projectData.status == 200) {
                var index = $scope.$parent.httpResponses['draftProjects'].map(function (item) {
                    return item.projectId;
                }).indexOf($scope.projectID);
                $scope.$parent.httpResponses['draftProjects'][index] = {};
                $scope.$parent.httpResponses['draftProjects'][index] = projectData.data;

                $scope.resetProjectUpdateForm();
                $scope.showProjectUpdateForm = false;
                $rootScope.update.projectID = '';
                $scope.$parent.displayProjectDetails(projectID, 'draftProjects');
                /*if(usersService.isAdmin() || usersService.isManager() || usersService.isReviewer()){
                 $scope.$parent.displayProjectList('approved');
                 }else if(usersService.isEmployee()){
                 $scope.$parent.displayProjectList('approvalRequired');
                 }*/
            }
        });
    }
    /* *
     * Method: resetProjectObject
     * Parameters:
     * Description: This method will invoke when user arrive to edit project page and reset the project object
     * */
    $scope.resetProjectObject = function(){
        $scope.project.projectName = "";
        $scope.project.projectDescription = "";
        $scope.project.questions = 0;
        $scope.project.totalRespondents = 0;
        $scope.project.cost = 0;
        $scope.project.communityDetails = [];
        $scope.project.notes = '';
        $scope.project.communitiesAdded = 0;
        $scope.project.uploadedDocs = [];
        $scope.project.uploadDocumentFlag = true;
        $scope.project.uploadedImages = [];
        $scope.project.agreedTerms = false;
    }

    /* *
     * Method: agreedTerms
     * Parameters:
     * Description: This method will invoke when user click the agreed terms checkbox in confirmation page
     * */
    $scope.agreedTerms = function() {
        if ($scope.project.agreedTerms === true) {
            $scope.newProjectProgress.submitProjectBtn.disabled = '';
            document.getElementById("confirmation").style.borderColor = '#255d95';
        } else {
            $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            document.getElementById("confirmation").style.borderColor = '#a7a7a7';
        }
        $scope.activateNextStep();
    }

    $scope.submit = function() {
        if ($scope.uploadOption.qDocument.valid === true) {
            if ($scope.qdocFile) {
                $scope.upload($scope.qdocFile);
            }
            $scope.docUploadFlags.error = false;
            $scope.docUploadFlags.message = "";
            $scope.uploadOption.qDocument.showQuestionnaire = false;
            //$scope.uploadOption.qDocument.questionnaire = ''
        } else {
            $scope.docUploadFlags.error = true;
            $scope.docUploadFlags.message = "Unauthorized action performed. Please reload the page and try again.";
            $scope.uploadOption.qDocument.showQuestionnaire = false;
            $scope.uploadOption.qDocument.questionnaire = '';
        }
    };

    // upload on file select or drop
    $scope.upload = function(file) {
        var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        Upload.upload({
            url: uploadPath,
            data: {
                file: file,
                'description': $scope.uploadOption.qDocument.questionnaire
            }
        }).then(function(resp) {

            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            $scope.pushAttachemntToUploadedDocList({
                file: file,
                name: resp.config.data.file.name,
                note: $scope.uploadOption.qDocument.questionnaire,
                link: resp.data,
                emptyNote: false,
                error: ''
            });
            $scope.uploadOption.qDocument.questionnaire = '';
        }, function(resp) {
            console.log('Error status: ' + resp.status);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

    /* *
     * Method: pushAttachemntToUploadedDocList
     * Parameters: File info to add
     * Description: pushAttachemntToUploadedDocList method check the existance of current file in the already uploaded pool and maintain unique uploaded file list.
     * */
    $scope.pushAttachemntToUploadedDocList = function(file) {
        var duplicate = false;
        for (var j = 0; j != $scope.project.uploadedDocs.length; ++j) {
            if ($scope.project.uploadedDocs[j].name == file.name) duplicate = true;
        }
        if (duplicate === false) {
            $scope.project.uploadedDocs.push(file);
            $scope.docUploadFlags.count++;
            if ($scope.project.uploadedDocs.length < 1) {
                $scope.project.uploadDocumentFlag = true;
            } else {
                $scope.project.uploadDocumentFlag = false;
            }
        }

        $scope.activateNextStep();
    }

    $scope.submitImage = function() {
        if ($scope.uploadOption.image.valid === true) {
            if ($scope.imageFile) {
                $scope.uploadImage($scope.imageFile);
            }
            $scope.imageUploadFlags.error = false;
            $scope.imageUploadFlags.message = "";
        } else {
            $scope.imageUploadFlags.error = true;
            $scope.imageUploadFlags.message = "Unauthorized action performed. Please reload the page and try again.";
        }

    };

    // upload on file select or drop
    $scope.uploadImage = function(file) {
        var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        Upload.upload({
            url: uploadPath,
            data: {
                file: file,
                'description': $scope.project.projectDescription
            }
        }).then(function(resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            $scope.pushAttachemntToUploadedImageList({
                file: file,
                name: resp.config.data.file.name,
                note: '',
                link: resp.data,
                emptyNote: false,
                error: ''
            });
        }, function(resp) {
            console.log('Error status: ' + resp.status);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

    /* *
     * Method: pushAttachemntToUploadedImageList
     * Parameters: File info to add
     * Description: pushAttachemntToUploadedList method check the existance of current file in the already uploaded pool and maintain unique uploaded file list.
     * */
    $scope.pushAttachemntToUploadedImageList = function(file) {
        var duplicate = false;
        for (var j = 0; j != $scope.project.uploadedImages.length; ++j) {
            if ($scope.project.uploadedImages[j].name == file.name) duplicate = true;
        }
        if (!duplicate) {
            $scope.project.uploadedImages.push(file);
            $scope.imageUploadFlags.count++;
            $scope.imageUploadFlags.error = false;
            $scope.imageUploadFlags.message = "";
        } else {
            $scope.imageUploadFlags.error = true;
            $scope.imageUploadFlags.message = "The picture is already attached.";
        }

    }

        /* Watch the attached files for type checking */
    $scope.$watch('qdocFile', function(newVal, oldVal) {
        //newVal;
        console.log("Attached Questionnaire Document:" + newVal);
        if (newVal != undefined) {
            if (sharedService.isValidMimeType("document", newVal.type)) {
                $scope.uploadOption.qDocument.valid = true;
                $scope.uploadOption.qDocument.buttonClass = '';
                $scope.uploadOption.qDocument.showQuestionnaire = true;
                $scope.docUploadFlags.error = false;
                $scope.docUploadFlags.message = "";
                console.log($scope.project.uploadedDocs);
            } else {
                $scope.uploadOption.qDocument.valid = false;
                $scope.docUploadFlags.error = true;
                $scope.docUploadFlags.message = "Attached file is not supported. Please upload document with following file formats: .doc, .docx, .odt, .rtf";
                $scope.uploadOption.qDocument.showQuestionnaire = false;
            }
        }
        //$scope.file = newVal;
        console.log(newVal);
    });
    $scope.$watch('imageFile', function(newVal, oldVal) {
        console.log("Attached Image File:" + newVal);
        if (newVal != undefined) {
            if (sharedService.isValidMimeType("image", newVal.type)) {
                $scope.uploadOption.image.valid = true;
                $scope.uploadOption.image.buttonClass = '';
                $scope.imageUploadFlags.error = false;
                $scope.imageUploadFlags.message = "";
            } else {
                $scope.imageUploadFlags.error = true;
                $scope.imageUploadFlags.message = "Attached file is not supported. Please upload document with following file formate: .jpg, .jpeg, .png, .bmp, .gif, .tiff, .tif ";
            }
        }

        console.log(newVal);
    });

    /* *
     * Method: removeUploadedFile
     * Parameters:
     * Description: removeUploadedFile method will remove attached files from attachment list
     * */
    $scope.removeUploadedImage = function(fileIndex, ffiles) {
        $scope.project.uploadedImages.splice(fileIndex, 1);
        $scope.imageUploadFlags.count--;
        console.log($scope.imageUploadFlags.count);
    }

    /* *
     * Method: removeUploadedDoc
     * Parameters:
     * Description: removeUploadedDoc method will remove attached files from attachment list
     * */
    $scope.removeUploadedDoc = function(fileIndex) {
        $scope.uploadOption.qDocument.buttonClass = 'disabled';
        httpServerService.makeHttpRequest("questionDoc?teamName="+usersService.getUserObject().teamname+"&projectId="+$scope.projectID, "delete").then(function(responseData) {
            if (responseData.status == 200) {
                console.log("Success!!!");
                console.log(responseData);
                growl.info("Questionnaire document is removed from this project.");
                $scope.project.uploadedDocs.splice(fileIndex, 1);
                $scope.docUploadFlags.count--;
                $scope.project.uploadDocumentFlag = true;
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';

            } else {
                console.log("Error : ");
                console.log(responseData);
            }
        });
    }
    $scope.projectNoteSlider = function(){
        if($scope.projectNote.sliderVisibility===false){
            $scope.projectNote.sliderClass = 'slideInFromRight';
            $scope.projectNote.sliderVisibility = true;
            $scope.projectNote.details.class = 'shrink';
            $scope.projectNote.handleClass = 'expanded';
        }else{
            $scope.projectNote.sliderClass = 'slideOutToRight';
            $scope.projectNote.sliderVisibility = false;
            $scope.projectNote.details.class = 'normal';
            $scope.projectNote.handleClass = 'closed';
        }
    }
    $scope.addNewNote = function(){
        if($scope.newNote!=''){
            httpServerService.makeHttpRequest("projectNote?teamName="+usersService.getUserObject().teamname+"&projectId="+$scope.projectID,"post",{notes: $scope.newNote}).then(function(responseData){
                if(responseData.status==200){
                    // success
                    console.log(" **** PROJECT NOTE ****");
                    console.log(responseData);
                    var noteText = '', firstColor='', colorClass='';
                    if(usersService.getUserObject().firstname !== null && usersService.getUserObject().firstname.trim() !== ''){
                        noteText += usersService.getUserObject().firstname.charAt(0).toUpperCase();
                    }
                    if(usersService.getUserObject().lastname !== null && usersService.getUserObject().lastname.trim() !== ''){
                        noteText += usersService.getUserObject().lastname.charAt(0).toUpperCase();
                    }
                    //$scope.colorsClasses[Math.floor(Math.random()*$scope.colorsClasses.length)]
                    console.log($scope.projectNote.list);
                    if($scope.projectNote.list.length>0){
                        colorClass = $scope.$parent.colorsClasses[Math.floor(Math.random()*$scope.$parent.colorsClasses.length)];
                    }else{
                        colorClass = $scope.$parent.colorsClasses[Math.floor(Math.random()*$scope.$parent.colorsClasses.length)];
                    }
                    console.log("colorClass: "+colorClass);

                    $scope.projectNote.list.unshift({
                        id: responseData.data.notesid,
                        name: usersService.getUserObject().name,
                        note: $scope.newNote,
                        date: $scope.formatTime(new Date().getTime(), 'date only'),
                        colorClass: colorClass+ ' slideInRight animated',
                        text: noteText,
                    });
                    $scope.newNote = '';
                    //$scope.hideProjectFromList(projectState, projectID);
                    //$scope.modal.show = false;
                    //$scope.resetModal();
                }else{
                    console.log(" **** PROJECT NOTE Failed ****");
                    console.log(responseData);
                }
            });
        }else{

        }
    }
    $scope.prepareToDeleteNote = function(noteId){
        //console.log("delete Note: "+project.projectID);
        var index = $scope.projectNote.list.map(function(item) { return item.id; }).indexOf(noteId);

        $rootScope.modal.title = "Delete Note ?";
        $rootScope.modal.text = "You are about to delete your note '<i>"+$scope.projectNote.list[index].note+"</i>' . Are you sure?";
        document.getElementById("modalText").innerHTML = $rootScope.modal.text;
        $rootScope.modal.buttons.delete.fnc = "deleteNote";
        $rootScope.modal.buttons.delete.params = "'"+noteId+"'";
        $rootScope.modal.show = true;
        console.log($scope.projectNote.list);
    }
    $scope.deleteNote = function(noteId){
        $rootScope.modal.show = true;

        console.log("Note ID: "+noteId);
        var index = $scope.projectNote.list.map(function(item) { return item.id; }).indexOf(noteId);
        $scope.projectNote.list.splice(index, 1);
        httpServerService.makeHttpRequest("projectNote?teamName="+usersService.getUserObject().teamname+"&projectId="+$scope.projectID+"&notesId="+noteId,"delete").then(function(responseData){
            if(responseData.status==200){
                // success
                console.log(" **** PROJECT DELETED ****");
                console.log(responseData);
                //$scope.hideProjectFromList(projectState, projectID);

                $rootScope.modal.show = false;
                $scope.resetModal();
            }else{
                console.log(" **** Failed ****");
                console.log(responseData);
            }
        });
    }
    // Save And Continue Validation
    $scope.activateNextStep = function() {
        var i, temp, status = false;
        if ($scope.newProjectProgress.currentStep == 0) {
            if ($scope.project.projectName.trim().length > 0 && $scope.project.questions > 0 && $scope.project.communitiesAdded > 0 && $scope.project.projectDescription.length > 0) {
                temp = true;
                for (i = 0; i < $scope.project.communityDetails.length; i++) {
                    if ($scope.project.communityDetails[i].validated === false) {
                        temp = false;
                        break;
                    }
                }
                if (temp === true) {
                    $scope.newProjectProgress.saveContinueBtn.disabled = '';
                    status = true;
                } else {
                    $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                    status = false;
                }
            } else {
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                status = false;
            }
        }
        if ($scope.newProjectProgress.currentStep == 1) {
            if ($scope.project.uploadedDocs.length > 0) {
                $scope.newProjectProgress.saveContinueBtn.disabled = '';
                status = true;
            } else {
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                status = false;
            }
        }
        if ($scope.newProjectProgress.currentStep == 2) {
            if ($scope.project.uploadedImages.length > 0) {
                $scope.newProjectProgress.saveContinueBtn.disabled = '';
                status = true;
            } else {
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                status = false;
            }
        }
        return status;
    }

    $scope.nextStep = function() {
        console.log($scope.newProjectProgress);
        if ($scope.newProjectProgress.currentStep == 0) {
            if($scope.newProjectProgress.saveContinueBtn.disabled == 'disabled'){
                $scope.modal.title = "Unauthorized Action Performed";
                $scope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
                $scope.modal.buttons.delete.show = false;
                $scope.modal.buttons.delete.fnc = "";
                $scope.modal.buttons.delete.params = "";
                $scope.modal.show = true;
            }else{
                $scope.newProjectProgress.previousBtn.visible = true;
                $scope.newProjectProgress.submitProjectBtn.visible = false;
                $scope.newProjectProgress.saveContinueBtn.visible = true;
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                //console.log($scope.project);
                if ($scope.activateNextStep()) {
                    $scope.saveProject();
                }
            }
        } else if ($scope.newProjectProgress.currentStep == 1) {
            $scope.newProjectProgress.previousBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.visible = true;
            if($scope.project.agreedTerms !== true){
                $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            }else{
                $scope.newProjectProgress.submitProjectBtn.disabled = '';
            }
            $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            $scope.newProjectProgress.saveContinueBtn.visible = false;
            $scope.newProjectProgress.saveContinueBtn.disabled = '';
            $scope.activateNextStep();

            // get uploaded files
            httpServerService.makeHttpRequest("projectQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID, "get").then(function(responseData) {
                if (responseData.status == 200) {
                    console.log(responseData.data);
                } else {
                    console.log("Error: ");
                }
            });
        } else if ($scope.newProjectProgress.currentStep == 2) {
            if($scope.newProjectProgress.submitProjectBtn.disabled == 'disabled'){
                $scope.modal.title = "Unauthorized Action Performed";
                $scope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
                $scope.modal.buttons.delete.show = false;
                $scope.modal.buttons.delete.fnc = "";
                $scope.modal.buttons.delete.params = "";
                $scope.modal.show = true;
            }else{
                $scope.newProjectProgress.previousBtn.visible = true;
                $scope.newProjectProgress.submitProjectBtn.visible = true;
                $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
                $scope.newProjectProgress.saveContinueBtn.visible = false;
                $scope.newProjectProgress.saveContinueBtn.disabled = '';
                $scope.activateNextStep();
            }
        }

        $scope.newProjectProgress.currentStep++;
        for (var i = 0; i < $scope.config.disabledButtons.length; i++) {
            if (i === $scope.newProjectProgress.currentStep) {
                $scope.config.disabledButtons[i] = false;
            } else {
                $scope.config.disabledButtons[i] = true;
            }
        }
        $scope.activateNextStep();
    }

    $scope.prevStep = function() {
        if ($scope.newProjectProgress.currentStep == 1) {
            $scope.newProjectProgress.previousBtn.visible = false;
        } else if ($scope.newProjectProgress.currentStep == 2) {
            if($scope.project.agreedTerms !== true){
                $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            }else{
                $scope.newProjectProgress.submitProjectBtn.disabled = '';
            }
            $scope.newProjectProgress.previousBtn.visible = true;
            $scope.newProjectProgress.saveContinueBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.visible = false;
        }
        $scope.newProjectProgress.currentStep--;
        for (var i = 0; i < $scope.config.disabledButtons.length; i++) {
            if (i === $scope.newProjectProgress.currentStep) {
                $scope.config.disabledButtons[i] = false;
            } else {
                $scope.config.disabledButtons[i] = true;
            }
        }
        $scope.activateNextStep();
    }
    $scope.resetFileUploadConfig = function(){
        $scope.uploadOption.qDocument.valid = false;
        $scope.uploadOption.qDocument.buttonClass = 'disabled';
        $scope.uploadOption.qDocument.showQuestionnaire = false;
        $scope.uploadOption.qDocument.questionnaire = '';
        $scope.uploadOption.image.valid = false;
        $scope.uploadOption.image.buttonClass = 'disabled';

        $scope.imageUploadFlags.count = 0;
        $scope.imageUploadFlags.error = false;
        $scope.imageUploadFlags.message = "";

        $scope.docUploadFlags.count = 0;
        $scope.docUploadFlags.error = false;
        $scope.docUploadFlags.message = "";
    }

    $scope.resetProjectUpdateForm = function(){
        $scope.resetProjectObject();
        $scope.showProjectUpdateForm = false;
        $scope.projectDetailsData = {};
        $scope.projectID = '';
        $scope.imageFile = null;
        $scope.qdocFile = null;
        $scope.resetFileUploadConfig();
        $scope.resetNewCommunityForm();

        $scope.showCommunityForm = false;
        $scope.addMoreCommunity.showBtn = true;
        $scope.addMoreCommunity.disableBtn = false;
        $scope.projectDetailsData = {};
        $scope.selectedProjectDetailsData = {};
        $scope.newProjectProgress.currentStep = 0;
        $scope.newProjectProgress.previousStep = -1;
        $scope.newProjectProgress.previousBtn.visible = false;
        $scope.newProjectProgress.saveContinueBtn.visible = true;
        $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
        $scope.newProjectProgress.submitProjectBtn.visible = false;


    }
}]);
