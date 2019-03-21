/**
 * Created by pijus on 2016-01-21.
 */


'use strict';
var app = angular.module('validateItUserPortalApp').value();

app.controller('ProjectWizard', ['$rootScope', '$scope', '$location', '$window', 'sideBarService', 'communityService', 'sharedService', 'usersService', 'httpServerService', 'Upload', '$q', '$http', '$timeout', 'growl', 'loadingDialogService', 'detectIEService', 'ModalService', 'lodash', function($rootScope, $scope, $location, $window, sideBarService, communityService, sharedService, usersService, httpServerService, Upload, $q, $http, $timeout, growl, loadingDialogService, detectIEService, ModalService, lodash) {

    $scope.init = function() {
        $rootScope.unCompletedProcessOnCurrentPage = false;
        $rootScope.currentPage = {
            name: "Uncompleted Step 1",
            action: "",
            msgTitle: "",
            onChangeMsg: "",
        }
        console.log(" ProjectWizard Controller:  Init() ");
        /* identify wizard type
         {
         NewProject : Create a Completely New Project
         UpdateProject : Update an existing Project
         CopyProject: Create a new project form an existing project(completed)
         NewProjectWithCommunities: Create a new project with some selected communities
         }
         */
        $scope.projectWizardType = {
            "newProject": false,
            "updateProject": false,
            "newProjectWithSelectedCommunities": false,
            "copyProject": false
        };


        $scope.config = {
            sh: {
                displayForm: true,
                showCommunityForm: false,
                addMoreCommunity: {
                    showBtn: true,
                    disableBtn: false,
                },
            },
            appearance: {
                first: 'zoomIn animated',
                second: '',
                third: '',
            },
            backBtn: {
                display: false,
                text: 'Back To Draft',
                onClickFunc: 'backToProjectDetails',
                params: {
                    projectID: $scope.projectID,
                },
            },
            disabledButtons: [false, true, true],
            overlay: {
                display: false,
                title: 'Processing your request',
                content: 'Please wait for a moment. Thank you for your patience.',
                spinner: true,
            },
            newNote: '',
            noteWd: '',
            addNoteBtn: true,
            wizardClass: 'col-lg-12 pad-lr-15',
        }
        $scope.newProjectProgress = { // @TODO : change the variable name
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

        $scope.projectDetailsData = {};
        $scope.priceTable = [];
        $scope.questions = [];
        $scope.projectID = null;
        $scope.responces = {};
        $scope.imageFile = null;
        $scope.qdocFile = null;
        $scope.allCountries = [];
        $scope.allCommunities = [];

        $scope.uploadOption = {
            qDocument: {
                valid: false,
                buttonClass: 'disabled',
                showQuestionnaire: false,
                questionnaire: '',
                buttonDisabled: true,
                uploadBtnClass: "btn-default",
                browseBtnClass: "btn-primary",
                count: 0,
                error: false,
                message: ""
            },
            image: {
                valid: false,
                buttonClass: 'disabled',
                buttonDisabled: true,
                removeBtn: false,
                uploadBtnClass: "btn-default",
                browseBtnClass: "btn-primary",
            }
        }
        $scope.imageUploadFlags = {
            count: 0,
            error: false,
            message: ""
        };
        /*$scope.docUploadFlags = {
            count: 0,
            error: false,
            message: ""
        };*/
        $scope.error = {
            occurred: false,
            type: '',
            location: '',
            message: '',
        };
        /**
         * Variable: project
         * @type {{ projectName: string, numberOfResponents: number, country: string, community: string, gender: {male: number, female: number}, questionnaireDocument: Array, images: Array}}
         * Description: This variable will store all information provided by the user during new project creation process
         */
        //$scope.allCommunities = communityService.getCommunities2();
        $scope.project = communityService.createProjectObject();
        // @newCommunityForm : This is a temporary variable to store data for add new community form
        $scope.newCommunityForm = communityService.createNewCommunityFormObject();

        /* ----- Get Projects Price Table ------*/
        sharedService.getPricingInfoFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
            sharedService.saveHttpResponseData("NewProjectPricing", responseData);
            sharedService.parseDataGetProjectPricing(responseData);
            $scope.priceTable = sharedService.getPricingTable();
            communityService.setRespondentSet(sharedService.getRespondentSet());
            console.log($scope.priceTable);
        });

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

    } /*- End of Init () -*/
    var projectOrg = {};
    //console.log($scope.$parent.projectConfig);
    //$scope.projectConfig = $scope.$parent.projectConfig;
    //console.log($scope.projectConfig);
    $rootScope.$watch('wizard.project.activate', function(newVal, oldVal) {
        //console.log("----> Watcher ");
        //console.log($rootScope.wizard.project.activate+" ");
        //console.log($rootScope.wizard.project);

        //console.log($rootScope.wizard.project.activate);

        if ($rootScope.wizard.project.activate === true) {
            //console.log('Project Wizard Activated');
            // load project details
            // then view the page
            $scope.resetProjectWizard();
            $scope.projectID = $rootScope.wizard.project.projectID;
            $scope.wizardType = $rootScope.wizard.project.initFunc;
            $scope.config.disabledButtons = [false, true, true];
            $scope.$eval("initiate" + $scope.wizardType + "()");
            //$scope.initiatePage();
        } else {
            $scope.resetProjectWizard();
        }
    });

    $scope.setProjectWizardType = function(type, value) {
        $scope.projectWizardType = {
            "newProject": false,
            "updateProject": false,
            "newProjectWithSelectedCommunities": false,
            "copyProject": false
        };
        if (typeof value === 'undefined' || value === undefined || value === false || value === '' || value === null) {
            value = false;
        } else {
            value = true;
        }
        if (typeof type === 'undefined' || type === undefined || type === null || type === '' || type === false) {
            if (value === false) {
                for (var key in $scope.projectWizardType) {
                    if ($scope.projectWizardType.hasOwnProperty(type)) {
                        $scope.projectWizardType[key] = value;
                    }
                }
            } else {
                // all can't be true
            }
        } else {
            if ($scope.projectWizardType.hasOwnProperty(type)) {
                for (var key in $scope.projectWizardType) {
                    if ($scope.projectWizardType.hasOwnProperty(type)) {
                        $scope.projectWizardType[key] = false;
                    }
                }
                $scope.projectWizardType[type] = value;
            } else {

            }
        }
    }
    $scope.getProjectWizardType = function(type) {
            if (typeof type != 'undefined' || type != undefined || type != null || type != '' || type != false) {
                if ($scope.projectWizardType.hasOwnProperty(type)) {
                    return $scope.projectWizardType[type];
                }
            }
        }
        /* *
         * Method: initiateUpdateProject
         * Parameters:
         * Description: This method perform initialization for update project wizard
         * */
    $scope.initiateUpdateProject = function() {
        console.log(" **** initiateUpdateProject ****");

        $scope.resetConfig();
        $scope.config.overlay.display = true;
        $scope.setProjectWizardType('updateProject', true);

        $timeout(function() {
            $scope.config.overlay.display = false;
        }, 30000);

        $scope.projectDetailsData = sharedService.getProjectData(); //$rootScope.update.project;
        $scope.projectNote = $rootScope.wizard.project.projectNote;
        //console.log("Project Note");
        if ($scope.projectNote.list.length > 0) {
            $scope.projectNote.sliderVisibility = false;
            $scope.config.noteWd = {
                'width': '27%'
            };
            $scope.config.addNoteBtn = false;
        } else {
            $scope.wizardWd = {};
            $scope.config.noteWd = {
                'width': '27%'
            };
            $scope.projectNote.sliderVisibility = true;
            $scope.config.addNoteBtn = true;
        }
        $scope.projectNoteSlider();
        $scope.config.newNote = '';
        $scope.config.backBtn.text = "Back To Draft";
        $scope.config.backBtn.onClickFunc = "backToProjectDetails";
        $scope.config.backBtn.display = true;
        $scope.config.backBtn.params.projectID = $scope.projectID;

        $scope.selectedProjectDetailsData = sharedService.getSelectedProject();
        communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
        communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList);
        // reset configs
        //$scope.resetConfig();
        $scope.fieldError.projectName = false;
        $scope.fieldError.projectDescription = false;
        $scope.fieldError.questions = false;

        $scope.manager.display = false;
        $scope.manager.email = "";
        $scope.manager.name = "";

        $scope.project.projectName = $scope.projectDetailsData.projectnameci;
        $scope.project.projectDescription = $scope.projectDetailsData.projectdescription;
        $scope.project.questions = $scope.projectDetailsData.numquestions;
        $scope.project.totalRespondents = 0; //$scope.selectedProjectDetailsData.totalRespondents;
        $scope.project.cost = 0; //$scope.selectedProjectDetailsData.cost;
        // Communities
        $scope.project.communityDetails = [];
        projectOrg = {
            projectName: $scope.project.projectName,
            projectDescription: $scope.project.projectDescription,
            questions: $scope.project.questions,
            totalRespondents: $scope.project.totalRespondents,
            communitiesAdded: $scope.project.communitiesAdded,
            communityDetails: [],
        };
        var temp, i, j, k, comIndex = 0, communityError=false;

        for (var i = 0; i < $scope.projectDetailsData.communities.length; i++) {
            var communityStruc = communityService.getCommunityDetailsObject();


            communityStruc.countries = communityService.getCountries();
            communityStruc.communities = communityService.getCommunityByCountry($scope.projectDetailsData.communities[i].country[0]);
            communityStruc.communities.communityFlag = true;
            //subComDetails = communityService.setCommunityDetails(communityService.getCommunityDetails($scope.projectDetailsData.communities[i].communityname), );
            temp = communityService.formatCountry($scope.projectDetailsData.communities[i].country);
            communityStruc.selected.countries_text = temp.text;
            communityStruc.selected.countries = temp.array;

            comIndex = communityStruc.communities.map(function(item) {
                return item.name;
            }).indexOf($scope.projectDetailsData.communities[i].communityname);

            if(comIndex<0){  // community not found
                communityError = true;
                $scope.config.overlay.display = false;
            }else{
                communityStruc.selected.community.name = $scope.projectDetailsData.communities[i].communityname;
                communityStruc.selected.community.description = $scope.projectDetailsData.communities[i].communitydescription;
                communityStruc.selected.community.selected = true;
                communityStruc.selected.community.returnDataListID = communityStruc.communities[comIndex].returnDataListID;

                communityService.parseDataGetCommunityDetails($scope.projectDetailsData.communities[i].communityname);
                communityStruc.ages = communityService.getAgeRanges();
                temp = communityService.formatSelectedAgeRanges($scope.projectDetailsData.communities[i].ageselection);
                communityStruc.selected.age_text = temp.text;
                communityStruc.selected.ages = temp.formattedArray;
                for (var j = 0; j < communityStruc.selected.ages.length; j++) {
                    temp = communityStruc.ages.map(function(item) {
                        return item.ageRange;
                    }).indexOf(communityStruc.selected.ages[j].ageRange);
                    if (temp > -1) {
                        communityStruc.ages[temp].checked = true;
                    }
                }
                communityService.filterRespondentByAge(communityStruc.selected.ages, $scope.projectDetailsData.communities[i].communityname);
                communityStruc.respondents = communityService.getRespondents();
                k = communityStruc.respondents.map(function(item) {
                    return item.number;
                }).indexOf($scope.projectDetailsData.communities[i].respondents);
                if (k > -1) {
                    communityStruc.selected.respondents = {
                        uid: communityStruc.respondents[k].uid,
                        number: $scope.projectDetailsData.communities[i].respondents,
                        selected: true,
                    };
                } else {
                    communityStruc.selected.respondents = {
                        uid: 0,
                        number: 0,
                        selected: false,
                    };
                }


                communityService.filterGender(communityStruc.selected.ages, communityStruc.selected.respondents.number, communityStruc.selected.community.name);
                communityStruc.gender = communityService.getGender();
                temp = communityService.formatGender($scope.projectDetailsData.communities[i].gender);
                communityStruc.selected.gender_text = temp.text;
                communityStruc.selected.gender = temp.array;

                for (var j = 0; j < communityStruc.selected.gender.length; j++) {
                    temp = communityStruc.gender.map(function(item) {
                        return item.name;
                    }).indexOf(communityStruc.selected.gender[j].name)
                    communityStruc.gender[temp].selected = true;
                }
                communityStruc.cost = $scope.getCommunityCost(communityStruc.selected.respondents.number);

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
                communityStruc.editEnabled = true;
                communityStruc.disableEditBtn = '';
                communityStruc.showEditBtn = true;
                communityStruc.disableDeleteBtn = '';
                communityStruc.showDeleteBtn = true;
                communityStruc.isSaved = true;

                $scope.config.sh.addMoreCommunity.disableBtn = '';
                $scope.project.communityDetails.push(communityStruc);

                projectOrg.communityDetails.push({
                    selected:{
                        countries_text: communityStruc.selected.countries_text,
                        community: communityStruc.selected.community,
                        ages: communityStruc.selected.ages,
                        age_text: communityStruc.selected.age_text,
                        gender: communityStruc.selected.gender,
                        gender_text: communityStruc.selected.gender_text,
                        respondents: communityStruc.selected.respondents,
                    }
                });
            }

            if(communityError===true){
                break;
            }
        }
        if(communityError){
            $scope.error.occurred = true;
            $scope.error.type = 'Initiate Project Wizard';
            $scope.error.debugLoc = 'Check Communities';
            $scope.error.message = '<p>Oops! Seems the community of this project is not available.';
            if($scope.projectDetailsData.communities.length>0){
                $scope.error.message = '<p>Oops! Seems all the communities of this project are not available.';
            }
            $scope.error.message += ' <br />Please contact <a href="mailto:support@validateit.com">support@validateit.com</a>.</p>';
            $scope.displayErrorMessage();
        }else{
            $scope.calculateTotalRespondents();
            $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);

            $scope.project.communitiesAdded = $scope.project.communityDetails.length;

            if ($scope.selectedProjectDetailsData.hasOwnProperty('questionnaireDocuments')) {
                if ($scope.selectedProjectDetailsData.questionnaireDocuments.length > 0) {
                    for (var i = 0; i < $scope.selectedProjectDetailsData.questionnaireDocuments.length; i++) {
                        $scope.project.uploadedDocs.push({
                            file: {
                                name: $scope.selectedProjectDetailsData.questionnaireDocuments[i].name,
                                type: "image/jpeg"
                            },
                            name: $scope.selectedProjectDetailsData.questionnaireDocuments[i].name,
                            note: $scope.selectedProjectDetailsData.questionnaireDocuments[i].description,
                            link: $scope.selectedProjectDetailsData.questionnaireDocuments[i].link,
                            emptyNote: false,
                            error: '',
                        });
                    }
                }
            }

            if ($scope.project.uploadedDocs.length > 0) {
                $scope.project.uploadDocumentFlag = false;
            } else {
                $scope.project.uploadDocumentFlag = true;
            }

            if ($scope.selectedProjectDetailsData.hasOwnProperty('images')) {
                if ($scope.selectedProjectDetailsData.images.length > 0) {
                    for (var i = 0; i < $scope.selectedProjectDetailsData.images.length; i++) {
                        $scope.project.uploadedImages.push({
                            file: {
                                name: $scope.selectedProjectDetailsData.images[i].file.name,
                                type: $scope.selectedProjectDetailsData.images[i].file.type
                            },
                            name: $scope.selectedProjectDetailsData.images[i].name,
                            note: '',
                            link: $scope.selectedProjectDetailsData.images[i].link,
                            emptyNote: false,
                            error: '',
                        });
                    }
                }
            }

            projectOrg.totalRespondents = $scope.project.totalRespondents;
            projectOrg.communitiesAdded = $scope.project.communitiesAdded;

            $scope.config.sh.addMoreCommunity.showBtn = true;
            $scope.config.sh.addMoreCommunity.disableBtn = '';
            $scope.activateNextStep();
            $scope.config.wizardClass = "col-lg-8 pad-r-0";
            $scope.config.overlay.display = false;
            $rootScope.wizard.project.display = true;
        }
    }

    $scope.displayErrorMessage = function(){
        ModalService.showModal({
            templateUrl: "views/modal_templates/general.html",
            controller: "dialogCtrl",
            inputs: {
                data: {
                    modalTitle: "<b>Something went wrong</b>",
                    modalText: $scope.error.message,
                    autoClose: false,
                    closingDelay: 0,
                    modalTextClass: "text-lg",
                    buttons: {
                        custom: {
                            buttonText: "Yes",
                            class: "btn-primary",
                            show: false,
                            noClickFnc: "",
                            inputs: [],
                        },
                        cancel: {
                            buttonText: "Close",
                            class: "btn-default",
                            show: true,
                            noClickFnc: "Close",
                            inputs: [],
                        }
                    }
                }
            },
        }).then(function(modal) {
                modal.close.then(function(result) {
                    $scope.resetErrorMessageFlags();
                    document.location.reload(true);
            });
        });
        $timeout(function() {
            document.location.reload(true);
        },6000);
        $timeout(function() {
            $scope.resetErrorMessageFlags();
            ModalService.closeModal();
        }, 8000);
    }

    /* *
     * Method: initiateNewProjectWithSelectedCommunities
     * Parameters:
     * Description: This method will initialize project wizard with selected communities
     * */
    $scope.initiateNewProjectWithSelectedCommunities = function() {
        console.log(" ---- Initiate New Project With Selected Communities ---- ");
        communityService.getCommunityListFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
            var firstCommunity = responseData.communities[0].communityname;
            communityService.parseDataGetCommunityList(responseData.communities);
            communityService.saveHttpResponseData("CommunityList", responseData); // save query data
            $scope.responces.CommunityList = responseData;

            // Set countries
            $scope.newCommunityForm.countries = communityService.getCountries();
            //$scope.project.communityDetails[0].countries = communityService.getCountries();
            $scope.allCountries = communityService.getCountries();

            console.log($rootScope.wizard);
            // reset configs
            $scope.resetConfig();
            $scope.config.overlay.display = true;
            $timeout(function() {
                $scope.config.overlay.display = false;
            }, 10000);
            //$scope.$parent.resetActionBar();
            $scope.$parent.actionBar = sharedService.getActionBarObject();
            $scope.setProjectWizardType('newProjectWithSelectedCommunities', true);
            //$scope.projectDetailsData = sharedService.getProjectData(); //$rootScope.update.project;
            $scope.projectNote = {
                sliderClass: '',
                sliderVisibility: false,
                visibility: false,
                handleClass: 'closed',
                details: {
                    class: 'normal',
                },
                list: []
            }
            $rootScope.wizard.project.projectNote = $scope.projectNote;
            //$rootScope.wizard.project.projectNote;
            //console.log("Project Note");
            if ($scope.projectNote.list.length > 0) {
                $scope.projectNote.sliderVisibility = false;
                $scope.config.noteWd = {
                    'width': '27%'
                };
                $scope.config.addNoteBtn = false;
            } else {
                $scope.wizardWd = {};
                $scope.config.noteWd = {
                    'width': '27%'
                };
                $scope.projectNote.sliderVisibility = true;
                $scope.config.addNoteBtn = true;
                $rootScope.wizard.project.projectNote.details.class = '';
            }
            //$scope.projectNoteSlider();
            $scope.config.newNote = '';

            //$scope.selectedProjectDetailsData = sharedService.getSelectedProject();
            communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
            communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList);


            $scope.config.backBtn.text = "Back to Community List";
            $scope.config.backBtn.onClickFunc = "backToCommunityList";
            $scope.config.backBtn.display = true;
            $scope.config.addNoteBtn = false;
            $scope.config.overlay.display = true;
            $scope.wizardWd = {};

            $scope.fieldError.projectName = false;
            $scope.fieldError.projectDescription = false;
            $scope.fieldError.questions = false;

            $scope.manager.display = false;
            $scope.manager.email = "";
            $scope.manager.name = "";

            // Communities
            $scope.project.communityDetails = [];

            $scope.selectedCommunities = $rootScope.wizard.project.dataDependency.communities;
            var temp, i, j, comIndex = 0, cmIndex;

            for (var i = 0; i < $scope.selectedCommunities.length; i++) {
                var communityStruc = communityService.getCommunityDetailsObject();

                communityStruc.countries = communityService.getCountries();
                communityStruc.communities = communityService.getCommunityByCountry($scope.selectedCommunities[i].country[0]);
                communityStruc.communities.communityFlag = true;
                //subComDetails = communityService.setCommunityDetails(communityService.getCommunityDetails($scope.projectDetailsData.communities[i].communityname), );
                //temp = communityService.formatCountry($scope.projectDetailsData.communities[i].country);
                communityStruc.selected.countries_text = $scope.selectedCommunities[i].country[0];
                communityStruc.selected.countries = [{
                    name: $scope.selectedCommunities[i].country[0],
                    flagCode: communityService.getCountryFlagCode($scope.selectedCommunities[i].country[0]),
                    checked: true,
                }];

                comIndex = communityStruc.communities.map(function(item) {
                    return item.name;
                }).indexOf($scope.selectedCommunities[i].communityname);

                communityStruc.selected.community.name = $scope.selectedCommunities[i].communityname;
                communityStruc.selected.community.description = $scope.selectedCommunities[i].communitydescription;
                communityStruc.selected.community.selected = true;
                communityStruc.selected.community.returnDataListID = communityStruc.communities[comIndex].returnDataListID;

                communityService.parseDataGetCommunityDetails($scope.selectedCommunities[i].communityname);
                communityStruc.ages = communityService.getAgeRanges();
                temp = communityService.formatSelectedAgeRanges($scope.selectedCommunities[i].ageselection);


                communityStruc.data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
                communityStruc.data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", $scope.selectedCommunities[i].communityname);
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
                communityStruc.progress.age = '';
                communityStruc.progress.respondents = '';
                communityStruc.progress.gender = '';
                communityStruc.showContainerFlag = false;
                communityStruc.disableSubmitBtn = 'disabled';
                communityStruc.editEnabled = true;
                communityStruc.disableEditBtn = '';
                communityStruc.disableDeleteBtn = '';

                $scope.project.communityDetails.push(communityStruc);

                cmIndex = $scope.project.communityDetails.map(function(item){ return item.recordID; }).indexOf(communityStruc.recordID);
                if(communityService.getLockedAgeRangeFlag()){
                    $scope.prepareAges(communityStruc.recordID, '');
                    $scope.project.communityDetails[cmIndex].respondentFlag = true;
                }else{
                    $scope.project.communityDetails[cmIndex].respondents = [];
                    $scope.project.communityDetails[cmIndex].selected.ages = [];
                    $scope.project.communityDetails[cmIndex].selected.age_text = '';
                    $scope.project.communityDetails[cmIndex].respondentFlag = false;
                }
            }
            $scope.project.communitiesAdded = $scope.project.communityDetails.length;
            $scope.project.communityDetails[0].showContainerFlag = true;

            $scope.config.sh.addMoreCommunity.showBtn = true;
            $scope.config.sh.addMoreCommunity.disableBtn = '';
            $scope.activateNextStep();
            console.log(" ______________ Project ____________");
            console.log($scope.project);
            $scope.config.wizardClass = "col-lg-12 pad-lr-15";
            $scope.config.overlay.display = false;
            $rootScope.wizard.project.display = true;

        });


    }

    /* *
     * Method: backToCommunityList
     * Parameters:
     * Description: This method will redirect user from new project wizard to community list page.
     * */
    $scope.backToCommunityList = function() {
        document.getElementById("projectWizard").style.display = 'none';
        $scope.project.communityDetails = [];
        $scope.resetProjectWizard();
        $rootScope.wizard.project.projectID = null;
        $rootScope.wizard.project.activate = false;
        $rootScope.wizard.project.display = false;
        $rootScope.wizard.project.initFunc = '';
        $scope.$parent.resetActionBar();
        $scope.$parent.showCommunityHome();

    }

    /* *
     * Method: onChangeProjectName
     * Parameters:
     * Description: This method will invoke when user change project name and check if the project name is empty or not.
     * */
    $scope.onChangeProjectName = function() {
        $scope.checkProjectDataChanges();
        if ($scope.project.projectName.trim() == '') {
            $scope.fieldError.projectName = true;
        } else {
            $scope.fieldError.projectName = false;
        }
        $scope.activateCommunitySection();
        if ($scope.projectWizardType.updateProject) {
            $scope.$parent.breadcrumb.lists[2].name = sharedService.textEllipsis($scope.project.projectName, 55);
        }
        $scope.checkProjectDataChanges();
        // $scope.activateNextStep();  create new function to find which steps are completed  **** TODO TODO TODO ****
    }

    $scope.projectNameChanged = function() {
        //console.log($scope.projectOrg.projectName);
        //console.log($scope.project.projectName);
        if ($scope.project.projectName.trim() == '') {
            $scope.fieldError.projectName = true;
        } else {
            $scope.fieldError.projectName = false;
        }
        $scope.activateCommunitySection();
        if ($scope.projectWizardType.updateProject) {
            $scope.$parent.breadcrumb.lists[2].name = sharedService.textEllipsis($scope.project.projectName, 55);
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
            if ($scope.config.sh.showCommunityForm === true && $scope.newCommunityForm.genderFlag === true) {
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
                if (lodash.isEmpty($scope.project.communityDetails[i].selected.respondents) === false) {
               // if (typeof($scope.project.communityDetails[i].selected.respondents.number) != 'undefined') {
                    $scope.project.communityDetails[i].cost = $scope.getCommunityCost($scope.project.communityDetails[i].selected.respondents.number);
                }
            }
        }
        if ($scope.newCommunityForm.selected.respondents != "") {
            $scope.newCommunityForm.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents);
        }
        $scope.calculateTotalRespondents();
        $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
        $scope.activateNextStep();
        $scope.checkProjectDataChanges();
    }

    $scope.calculateTotalRespondents = function() {
        var totalRespondents = 0;
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
            console.log($scope.project.communityDetails[i].selected.respondents);
            //if (typeof ($scope.project.communityDetails[i].selected.respondents) !== "undefined" > 0) {
            if(lodash.isEmpty($scope.project.communityDetails[i].selected.respondents) === false){
                totalRespondents += $scope.project.communityDetails[i].selected.respondents.number;
            }
        }
        if (lodash.isEmpty($scope.newCommunityForm.selected.respondents) === false) {
            totalRespondents += $scope.newCommunityForm.selected.respondents.number;
        }
        $scope.project.totalRespondents = totalRespondents;
    }

    /* *
     * Method: getCommunityCost
     * Parameters: Number of Respondents
     * Description: This method will invoke when user check or change 'number of respondents' radio button
     * */
    $scope.getCommunityCost = function(respondent) {
        var cost = 0,
            respondents = respondent.number;
        if ($scope.priceTable.priceChar.hasOwnProperty(respondents)) {
            for (var i = 0; i < $scope.priceTable.priceChar[respondents].length; i++) {
                if ($scope.project.questions <= $scope.priceTable.priceChar[respondents][i].max) {
                    cost = $scope.priceTable.priceChar[respondents][i].price;
                    break;
                }
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
        if ($scope.project.projectDescription.trim().length > 0) {
            $scope.fieldError.projectDescription = false;
        } else {
            $scope.fieldError.projectDescription = true;
        }
        $scope.activateCommunitySection();
        $scope.checkProjectDataChanges();
        //$scope.activateNextStep();
    }

    $scope.questionSelectorClicked = function() {
        console.log(" ---- Question Selector Clicked ----");
        console.log($scope.project.questions);
        if ($scope.project.questions > 0) {
            $scope.fieldError.questions = false;
        } else {
            $scope.fieldError.questions = true;
        }
        $scope.activateCommunitySection();
        $scope.checkProjectDataChanges();
    }

    /* *
     * Method: toggleCommunityContainer
     * Parameters: Unique ID for each community which has added in the list
     * Description: This method will invoke when ever user clicks a community from the list of communities which has added shortly.
     * */
    $scope.toggleCommunityContainer = function(recordID) {
        console.log("--- toggleCommunityContainer ---");

        var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID),
            temp;
        if ($scope.project.communityDetails[communityIndex].editEnabled === true) {
            var unsavedData = false,
                i;
            for (i = 0; i < $scope.project.communityDetails.length; i++) {
                //$scope.project.communityDetails[communityIndex].popup.open
                if ($scope.project.communityDetails[i].isSaved === false || $scope.project.communityDetails[i].disableSubmitBtn == 'disabled') {
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
                $scope.project.communityDetails[i].showContainerFlag = true;
                $timeout(function() {
                    $scope.project.communityDetails[i].showErrorFlag = false;
                }, 10000);
            } else {
                if ($scope.project.communityDetails[communityIndex].editEnabled === true) {
                    communityService.parseDataGetCommunityList($scope.responces.CommunityList.communities);
                    communityService.saveHttpResponseData("CommunityList", $scope.responces.CommunityList); // save query data

                    // Reset New Community form
                    $scope.resetNewCommunityForm();
                    $scope.config.sh.addMoreCommunity.disableBtn = '';
                    $scope.config.sh.addMoreCommunity.showBtn = true;

                    communityService.getCommunityDetailsFromDataSource(usersService.getUserObject().teamname, $scope.project.communityDetails[communityIndex].selected.community.name).then(function(responseData) {
                        communityService.saveHttpResponseData("CommunityDetails", responseData, $scope.project.communityDetails[communityIndex].selected.community.name);
                        communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);
                        $scope.project.communityDetails[communityIndex].ages = communityService.getAgeRanges();
                        if ($scope.project.communityDetails[communityIndex].selected.ages.length > 0) {
                            for (var i = 0; i < $scope.project.communityDetails[communityIndex].selected.ages.length; i++) {
                                temp = $scope.project.communityDetails[communityIndex].ages.map(function(item) {
                                    return item.ageRange;
                                }).indexOf($scope.project.communityDetails[communityIndex].selected.ages[i].ageRange);
                                if (temp != undefined && temp > -1) {
                                    $scope.project.communityDetails[communityIndex].ages[temp].checked = true;
                                }
                            }
                            //$scope.project.communityDetails[communityIndex].selected.age_text = selected_age_text.substring(0, selected_age_text.length - 2);
                            communityService.filterRespondentByAge($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.community.name);
                            $scope.project.communityDetails[communityIndex].respondents = communityService.getRespondents();

                            communityService.filterGender($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.respondents.number, $scope.project.communityDetails[communityIndex].selected.community.name);
                            $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
                            for (var i = 0; i < $scope.project.communityDetails[communityIndex].selected.gender.length; i++) {
                                temp = $scope.project.communityDetails[communityIndex].gender.map(function(item) {
                                    return item.name;
                                }).indexOf($scope.project.communityDetails[communityIndex].selected.gender[i].name)
                                $scope.project.communityDetails[communityIndex].gender[temp].selected = true;
                            }
                            $scope.project.communityDetails[communityIndex].cost = $scope.getCommunityCost($scope.project.communityDetails[communityIndex].selected.respondents);
                        }

                    });

                    var unsavedData = false,
                        i;
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
                        $scope.project.communityDetails[i].showContainerFlag = true;
                        for (var j = 0; j < $scope.project.communityDetails.length; j++) {
                            if (i != j) {
                                $scope.project.communityDetails[j].showContainerFlag = false;
                            }
                        }
                        $timeout(function() {
                            $scope.project.communityDetails[i].showErrorFlag = false;
                        }, 10000);

                    } else {
                        for (i = 0; i < $scope.project.communityDetails.length; i++) {
                            if ($scope.project.communityDetails[i].recordID == recordID) {
                                if ($scope.project.communityDetails[i].showContainerFlag == true) {
                                    $scope.project.communityDetails[i].showContainerFlag = false;
                                } else {
                                    $scope.project.communityDetails[i].showContainerFlag = true;
                                    // Restore the web service data in communityService

                                    if ($scope.project.communityDetails[communityIndex].data.httpResponseData.communityList.length > 0) {
                                        communityService.httpResponseData.communityList = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList;
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails.length > 0) {
                                        //communityService.httpResponseData.communityDetails = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails;
                                        communityService.saveHttpResponseData("CommunityDetails", $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails, $scope.project.communityDetails[communityIndex].selected.community.name);
                                        communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.parsedData.communityList.length > 0) {
                                        communityService.parsedData.communityList = $scope.project.communityDetails[communityIndex].data.parsedData.communityList;
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.parsedData.countries.length > 0) {
                                        communityService.parsedData.countries = $scope.project.communityDetails[communityIndex].data.parsedData.countries;
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.parsedData.ageRanges.length > 0) {
                                        communityService.parsedData.ageRanges = $scope.project.communityDetails[communityIndex].data.parsedData.ageRanges;
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.parsedData.gender.length > 0) {
                                        communityService.parsedData.gender = $scope.project.communityDetails[communityIndex].data.parsedData.gender;
                                    }
                                    if ($scope.project.communityDetails[communityIndex].data.parsedData.respondents.length > 0) {
                                        communityService.parsedData.respondents = $scope.project.communityDetails[communityIndex].data.parsedData.respondents;
                                    }
                                }
                            } else {
                                $scope.project.communityDetails[i].showContainerFlag = false;
                            }
                        }
                    }
                    /*if($scope.wizardType === 'NewProjectWithSelectedCommunities'){
                     $scope.project.communityDetails[communityIndex].showContainerFlag = true;
                     }*/
                    $scope.config.sh.showCommunityForm = false;
                } else {

                }
            }
        }

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
            $scope.newCommunityForm.isSaved = false;
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
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
            $scope.project.communityDetails[communityIndex].isSaved = false;
        }
        communityService.setLockedGenderFlag(false);
        //$scope.activateNextStep();
        $scope.checkProjectDataChanges();
    };

    /* *
     * Method: updateSelectedCommunities
     * Parameters:
     * Description: This method invokes when community checkboxs are clicked and updated the currently selected community list.
     * */
    $scope.updateSelectedCommunities = function(recordID, index) {
        var communityIndex = $scope.project.communityDetails.map(function(item) {
            return item.recordID;
        }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
        console.log(" ----- updateSelectedCommunities -----");
        if (Object.keys($scope.project.communityDetails[communityIndex].selected.community).length > 0) {
            if ($scope.project.communityDetails[communityIndex].selected.community)
                communityService.getCommunityDetailsFromDataSource(usersService.getUserObject().teamname, $scope.project.communityDetails[communityIndex].selected.community.name).then(function(responseData) {
                    communityService.saveHttpResponseData("CommunityDetails", responseData, $scope.project.communityDetails[communityIndex].selected.community.name);
                    communityService.parseDataGetCommunityDetails($scope.project.communityDetails[communityIndex].selected.community.name);

                    $scope.project.communityDetails[communityIndex].ages = communityService.getAgeRanges();
                    if(communityService.getLockedAgeRangeFlag()){
                        $scope.prepareAges(recordID, '');
                        $scope.project.communityDetails[communityIndex].respondentFlag = true;
                    }else{
                        $scope.project.communityDetails[communityIndex].respondents = [];
                        $scope.project.communityDetails[communityIndex].selected.ages = [];
                        $scope.project.communityDetails[communityIndex].selected.age_text = '';
                        $scope.project.communityDetails[communityIndex].respondentFlag = false;
                    }

                    $scope.project.communityDetails[communityIndex].gender = [];
                    $scope.project.communityDetails[communityIndex].selected.respondents = '';
                    $scope.project.communityDetails[communityIndex].selected.gender = [];
                    $scope.project.communityDetails[communityIndex].selected.gender_text = '';
                    $scope.project.communityDetails[communityIndex].ageRangeFlag = true;
                    $scope.project.communityDetails[communityIndex].genderFlag = false;
                });
        }
        $scope.project.communityDetails[communityIndex].progress.age = '';
        $scope.project.communityDetails[communityIndex].progress.respondents = '';
        $scope.project.communityDetails[communityIndex].progress.gender = '';
        $scope.validateAddedCommunity(communityIndex);
        communityService.setLockedGenderFlag(false);
        //$scope.activateNextStep();
        $scope.checkProjectDataChanges();
    }

    $scope.ageChecked = function(recordID, index, type) {
        if (type == 'NewForm') {
            if($scope.newCommunityForm.ages[index].locked===false){
                if ($scope.newCommunityForm.ages[index].checked === true) {
                    $scope.newCommunityForm.ages[index].checked = false;
                } else {
                    $scope.newCommunityForm.ages[index].checked = true;
                }
                $scope.newCommunityForm.isSaved = false;
            }
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            if($scope.project.communityDetails[communityIndex].ages[index].locked===false){
                if ($scope.project.communityDetails[communityIndex].ages[index].checked === true) {
                    $scope.project.communityDetails[communityIndex].ages[index].checked = false;
                } else {
                    $scope.project.communityDetails[communityIndex].ages[index].checked = true;
                }
            }

        }
        $scope.prepareAges(recordID, type);
        //$scope.activateNextStep();
        $scope.checkProjectDataChanges();
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
            $scope.newCommunityForm.isSaved = false;
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
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
            $scope.project.communityDetails[communityIndex].isSaved = false;
        }
        communityService.setLockedGenderFlag(false);
        //$scope.activateNextStep();
        $scope.checkProjectDataChanges();
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
            $scope.newCommunityForm.isSaved = false;
        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
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
            $scope.project.communityDetails[communityIndex].isSaved = false;
        }
        //$scope.activateNextStep();
        $scope.checkProjectDataChanges();
    }

    /* *
     * Method: saveCommunityInfo
     * Parameters: Unique ID for each recently added community
     * Description: This method will invoke when user saves the updates in any recently added community
     * */
    $scope.saveCommunityInfo = function(recordID) {
        console.log("--------- Save Community Info -----------");
        console.log($scope.project.communityDetails);
        var communityIndex = $scope.project.communityDetails.map(function(item) {
            return item.recordID;
        }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
        if(communityIndex>-1){
            $scope.project.communityDetails[communityIndex].showSuccessMessage = true;
            $scope.project.communityDetails[communityIndex].showErrorFlag = false;
            $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
            $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", $scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].data.parsedData.communityList = communityService.getCommunityList();
            $scope.project.communityDetails[communityIndex].data.parsedData.countries = communityService.getCountries();
            $scope.project.communityDetails[communityIndex].data.parsedData.ageRanges = communityService.getAgeRanges();
            $scope.project.communityDetails[communityIndex].data.parsedData.gender = communityService.getGender();
            $scope.project.communityDetails[communityIndex].data.parsedData.respondents = communityService.getRespondents();

            $scope.config.sh.addMoreCommunity.showBtn = true;
            $scope.config.sh.addMoreCommunity.disableBtn = '';
            $scope.project.communitiesAdded = $scope.project.communityDetails.length + 1;
            $scope.project.communityDetails[communityIndex].editEnabled = true;
            $scope.project.communityDetails[communityIndex].disableEditBtn = '';
            $scope.project.communityDetails[communityIndex].showEditBtn = true;
            $scope.project.communityDetails[communityIndex].disableDeleteBtn = '';
            $scope.project.communityDetails[communityIndex].showDeleteBtn = true;
            $scope.project.communityDetails[communityIndex].isSaved = true;

            $timeout(function() {
                $scope.project.communityDetails[communityIndex].showSuccessMessage = false;
                $scope.project.communityDetails[communityIndex].showContainerFlag = false;
                if ($scope.getProjectWizardType('newProjectWithSelectedCommunities')) {
                    if (communityIndex < ($scope.project.communityDetails.length - 1)) {
                        $scope.project.communityDetails[communityIndex + 1].showContainerFlag = true;
                        document.getElementById('communityID_' + (communityIndex + 1)).scrollIntoView();
                    }

                }
            }, 2000);
            $timeout(function() {
                $scope.project.communityDetails[communityIndex].showErrorFlag = false
            }, 10000);
        }

        //$timeout(function(){$scope.project.communityDetails[communityIndex].showContainerFlag = false}, 5500);
        $scope.activateNextStep();
        $scope.checkProjectDataChanges();
    }

    /* *
     * Method: validateAddedCommunity
     * Parameters: Community Index in @newProject
     * Description: This method will invoke when user change any information in any of the recently added community.
     * */
    $scope.validateAddedCommunity = function(communityIndex) {
        $scope.config.overlay.display = false;
        var hasError = false;
        if(typeof(communityIndex) == 'undefined' || typeof communityIndex == undefined){
            hasError = true;
        }else {
            if(communityIndex>-1){
                //if ($scope.project.communityDetails[communityIndex].selected.countries.length > 0 && $scope.project.communityDetails[communityIndex].selected.ages.length > 0 && $scope.project.communityDetails[communityIndex].selected.respondents.length > 0 && $scope.project.communityDetails[communityIndex].selected.gender_text.length > 0) {
                console.log(lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.countries) +" - " + lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.ages) +" - " + lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.respondents)  +" - " + lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.gender_text));
                if (lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.countries) === false && lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.ages) === false &&  lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.respondents) === false &&  lodash.isEmpty($scope.project.communityDetails[communityIndex].selected.gender_text) === false) {
                    $scope.project.communityDetails[communityIndex].disableSubmitBtn = '';
                    //$scope.config.sh.addMoreCommunity.disableBtn = '';
                    $scope.project.communityDetails[communityIndex].validated = true;
                } else {
                    //$scope.config.sh.addMoreCommunity.disableBtn = 'disabled';
                    $scope.project.communityDetails[communityIndex].disableSubmitBtn = 'disabled';
                    $scope.project.communityDetails[communityIndex].validated = false;
                    $scope.project.communityDetails[communityIndex].popup.open = true;
                    $scope.project.communityDetails[communityIndex].popup.type = 'Error';
                    $scope.project.communityDetails[communityIndex].popup.message = 'Please complete and save the changes, otherwise you will lose informaton.';
                    $scope.config.overlay.display = false;
                }
            }else{
                hasError = true;
            }
        }
        if(hasError){
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }

        //$scope.activateNextStep();
    }

    /* *
     * Method: respondentChanged
     * Parameters:
     * Description: This method will invoke when user change the number of respondent selection in both new form to add community and recently added communities.
     * */
    $scope.respondentChanged = function(recordID, index, type) {
        if (type == "NewForm") {
            if (Object.keys($scope.newCommunityForm.selected.respondents).length > 0) {
                communityService.filterGender($scope.newCommunityForm.selected.ages, $scope.newCommunityForm.selected.respondents.number, $scope.newCommunityForm.selected.community.name);
                $scope.newCommunityForm.gender = communityService.getGender();
                if(communityService.getLockedGenderFlag()){
                    $scope.prepareGender(recordID, -1, 'NewForm');
                    $scope.newCommunityForm.progress.gender = 'verified';
                }else{
                    $scope.newCommunityForm.selected.gender = [];
                    $scope.newCommunityForm.selected.gender_text = "";
                    $scope.newCommunityForm.progress.gender = '';
                }

                $scope.newCommunityForm.genderFlag = true;
                $scope.newCommunityForm.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents.number);
                if ($scope.newCommunityForm.selected.respondents.number > 0) {
                    $scope.newCommunityForm.progress.respondents = 'verified';
                } else {
                    $scope.newCommunityForm.progress.respondents = '';
                }


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
                    $scope.newCommunityForm.progress.gender = '';
                    $scope.newCommunityForm.genderFlag = false;
                } else {
                    $scope.newCommunityForm.errorMessage = '';
                    $scope.newCommunityForm.showErrorFlag = false;
                    $scope.newCommunityForm.progress.respondents = 'verified';
                }
            }

        } else {
            var communityIndex = $scope.project.communityDetails.map(function(item) {
                return item.recordID;
            }).indexOf(recordID); //$scope.getArrayIndexByCommunityRecordID(recordID);
            if (typeof ($scope.project.communityDetails[communityIndex].selected.respondents.number) != 'undefined') {
                communityService.filterGender($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.respondents.number, $scope.project.communityDetails[communityIndex].selected.community.name);
                $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
                if(communityService.getLockedGenderFlag()){
                    $scope.prepareGender(recordID, -1, '');
                    $scope.project.communityDetails[communityIndex].progress.gender = 'verified';
                }else{
                    $scope.project.communityDetails[communityIndex].selected.gender = [];
                    $scope.project.communityDetails[communityIndex].selected.gender_text = "";
                    $scope.project.communityDetails[communityIndex].progress.gender = '';
                }
                $scope.project.communityDetails[communityIndex].genderFlag = true;
                $scope.project.communityDetails[communityIndex].cost = $scope.getCommunityCost($scope.project.communityDetails[communityIndex].selected.respondents);

                if ($scope.project.communityDetails[communityIndex].selected.respondents.number > 0) {
                    $scope.project.communityDetails[communityIndex].progress.respondents = 'verified';
                } else {
                    $scope.project.communityDetails[communityIndex].progress.respondents = '';
                }

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
                    $scope.project.communityDetails[communityIndex].progress.gender = '';
                    $scope.project.communityDetails[communityIndex].genderFlag = false;
                } else {
                    $scope.project.communityDetails[communityIndex].errorMessage = '';
                    $scope.project.communityDetails[communityIndex].showErrorFlag = false;
                    $scope.project.communityDetails[communityIndex].progress.respondents = 'verified';
                }
            }

        }

        $scope.calculateTotalRespondents();
        $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
        $scope.activateNextStep();
        $scope.checkProjectDataChanges();
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

            var newCommunity = communityService.getCommunityDetailsObject();


            //recordID: sharedService.generateUniqueID(),
            newCommunity.communities = communityService.getCommunityList();
            newCommunity.countries = communityService.getCountries(); // get countries by community
            newCommunity.ages = communityService.getAgeRanges(); // get ages by community
            newCommunity.gender = communityService.getGender();
            newCommunity.respondents = communityService.getRespondents(); // get respondents by community
            newCommunity.selected.community = $scope.newCommunityForm.selected.community;
            newCommunity.selected.countries = $scope.newCommunityForm.selected.countries;
            newCommunity.selected.countries_text = $scope.newCommunityForm.selected.countries_text;
            newCommunity.selected.ages = $scope.newCommunityForm.selected.ages;
            newCommunity.selected.age_text = $scope.newCommunityForm.selected.age_text;
            newCommunity.selected.respondents = $scope.newCommunityForm.selected.respondents;
            newCommunity.selected.gender = $scope.newCommunityForm.selected.gender;
            newCommunity.selected.gender_text = $scope.newCommunityForm.selected.gender_text;
            newCommunity.progress.country = $scope.newCommunityForm.progress.country;
            newCommunity.progress.age = $scope.newCommunityForm.progress.age;
            newCommunity.progress.respondents = $scope.newCommunityForm.progress.respondents;
            newCommunity.progress.gender = $scope.newCommunityForm.progress.gender;

            newCommunity.showErrorFlag = false;
            newCommunity.errorMessage = '';
            newCommunity.showSuccessMessage = false;
            newCommunity.communityFlag = true;
            newCommunity.ageRangeFlag = true;
            newCommunity.respondentFlag = true;
            newCommunity.genderFlag = true;
            newCommunity.animationClass = '';
            newCommunity.showSubmitBtn = true;
            newCommunity.disableSubmitBtn = '';
            newCommunity.popup.open = false;
            newCommunity.popup.type = '';
            newCommunity.popup.message = '';
            newCommunity.data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
            newCommunity.data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", $scope.newCommunityForm.selected.community.name);
            newCommunity.data.parsedData.communityList = communityService.getCommunityList();
            newCommunity.data.parsedData.countries = communityService.getCountries();
            newCommunity.data.parsedData.ageRanges = communityService.getAgeRanges();
            newCommunity.data.parsedData.gender = communityService.getGender();
            newCommunity.data.parsedData.respondents = communityService.getRespondents();
            newCommunity.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents);
            newCommunity.validated = true;

            newCommunity.showContainerFlag = false;
            newCommunity.editEnabled = true;
            newCommunity.disableEditBtn = '';
            newCommunity.showEditBtn = true;
            newCommunity.disableDeleteBtn = '';
            newCommunity.showDeleteBtn = true;
            newCommunity.isSaved = true;

            $scope.project.communityDetails.push(newCommunity);
            $scope.resetNewCommunityForm();
            $scope.config.sh.showCommunityForm = false;
            $scope.config.sh.addMoreCommunity.disableBtn = '';
            $scope.project.communitiesAdded = $scope.project.communityDetails.length;
            $scope.activateNextStep();
        }
        $scope.checkProjectDataChanges();
    }


    $rootScope.prepareToDelete = function(recordID) {
        var index = $scope.project.communityDetails.map(function(item) {
            return item.recordID;
        }).indexOf(recordID);

        document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        $rootScope.modal.title = "Delete community";
        $rootScope.modal.text = "Are you sure you want to delete " + $scope.project.communityDetails[index].selected.community.name + " from your project?";
        document.getElementById("modalText").innerHTML = $rootScope.modal.text;
        $rootScope.modal.buttons.show = true;
        $rootScope.modal.buttons.delete.show = true;
        $rootScope.modal.buttons.delete.fnc = "deleteCommunityFromProject";
        $rootScope.modal.buttons.delete.params = "'" + index + "'";
        $rootScope.modal.buttons.cancel.show = true;
        document.getElementById("modal-root").style.display = 'block';
        document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
        $rootScope.modal.show = true;
        //$scope.activateNextStep();
    }

    /* *
     * Method: deleteCommunityFromProject
     * Parameters:  Unique ID for each recently added community
     * Description: This method will invoke when user deletes recently added community from the project
     * */
    $rootScope.deleteCommunityFromProject = function(recordIndex) {
        var notificationText = "You have successfully deleted the <b>"+$scope.project.communityDetails[recordIndex].selected.community.name+"</b> community from this project.";
        $scope.project.communityDetails.splice(recordIndex, 1);
        if ($scope.project.communityDetails.length == 0) {
            communityService.parseDataGetCommunityList(communityService.httpResponseData.communityList.communities);
            var comObj = communityService.getCommunityDetailsObject();
            comObj.countries = communityService.getCountries();
            $scope.project.communityDetails.push(comObj);
            $scope.config.sh.addMoreCommunity.disableBtn = 'disabled';
        }
        growl.info(notificationText,{ttl: 5000});

        $scope.project.communitiesAdded = $scope.project.communityDetails.length;
        $scope.calculateTotalRespondents();
        $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
        $rootScope.modal.show = false;
        $rootScope.resetModal();
        $scope.activateNextStep();
        $scope.checkProjectDataChanges();
        console.log("After Delete");
        console.log($scope.project);
        console.log(projectOrg);
    }

    /* *
     * Method: validateNewCommunityForm
     * Parameters:
     * Description: This method will invoke when user change any information in any of the recently added community.
     * */
    $scope.validateNewCommunityForm = function() {

        //if ($scope.newCommunityForm.selected.countries.length > 0 && $scope.newCommunityForm.selected.ages.length > 0 && Object.keys($scope.newCommunityForm.selected.respondents).length > 0 && $scope.newCommunityForm.selected.gender_text.length > 0 && $scope.newCommunityForm.showErrorFlag === false) {
        if (lodash.isEmpty($scope.newCommunityForm.selected.countries) === false && lodash.isEmpty($scope.newCommunityForm.selected.ages) === false && lodash.isEmpty($scope.newCommunityForm.selected.respondents) === false && lodash.isEmpty($scope.newCommunityForm.selected.gender_text) === false && $scope.newCommunityForm.showErrorFlag === false) {
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
        var unsavedData = false,
            comIndex = 0;
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
            if ($scope.project.communityDetails[i].isSaved === false) {
                unsavedData = true;
                comIndex = i;
                break;
            }
        }
        if (unsavedData === false) {
            for (var i = 0; i < $scope.project.communityDetails.length; i++) {
                $scope.project.communityDetails[i].showContainerFlag = false;
            }
            $scope.resetNewCommunityForm();
            $scope.newCommunityForm.countries = $scope.allCountries;
            $scope.config.sh.showCommunityForm = true;
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
            $scope.config.sh.addMoreCommunity.disableBtn = 'disabled';
            $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
        } else {
            $scope.project.communityDetails[comIndex].showErrorFlag = true;
            $scope.project.communityDetails[comIndex].errorMessage = "Please complete and save the changes, otherwise you will lose informaton.";
            $timeout(function() {
                $scope.project.communityDetails[comIndex].showErrorFlag = false;
            }, 10000);
        }

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
            if(communityService.getLockedAgeRangeFlag()){
                $scope.prepareAges(0, 'NewForm');
                $scope.newCommunityForm.respondentFlag = true;
            }else{
                $scope.newCommunityForm.respondents = [];
                $scope.newCommunityForm.selected.ages = [];
                $scope.newCommunityForm.selected.age_text = "";
                $scope.newCommunityForm.respondentFlag = false;
            }
            $scope.newCommunityForm.gender = [];
            $scope.newCommunityForm.ageRangeFlag = true;
            $scope.newCommunityForm.genderFlag = false;
        });
        $scope.validateNewCommunityForm();
        $scope.newCommunityForm.isSaved = false;
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
            $scope.uploadOption.qDocument.error = false;
            $scope.uploadOption.qDocument.message = "";
            $scope.uploadOption.qDocument.showQuestionnaire = false;
            //$scope.uploadOption.qDocument.questionnaire = ''

        } else {
            $scope.uploadOption.qDocument.error = true;
            $scope.uploadOption.qDocument.message = "Unauthorized action performed. Please reload the page and try again.";
            $scope.uploadOption.qDocument.showQuestionnaire = false;
            $scope.uploadOption.qDocument.questionnaire = '';
        }

    };

    // upload on file select or drop
    $scope.upload = function(file) {
        loadingDialogService.showUploadingPleaseWait('Uploading Document, Please wait...', '0');
        document.getElementById('loading_newProjectStep2Doc').className = "loading";
        var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        var qDocTags = $scope.uploadOption.qDocument.questionnaire;
        Upload.upload({
            url: uploadPath,
            data: {
                file: file,
                'description': qDocTags
            }
        }).then(function(resp) {
            $scope.uploadOption.qDocument.buttonDisabled = true;
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            $scope.pushAttachemntToUploadedDocList({
                file: file,
                name: resp.config.data.file.name,
                note: $scope.uploadOption.qDocument.questionnaire,
                link: resp.data,
                emptyNote: false,
                error: ''
            });
            $scope.qdocFile = null;
            $scope.docName = null;
            $scope.uploadOption.qDocument.questionnaire = '';
            $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
            $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
            document.getElementById('loading_newProjectStep2Doc').className = "";
            $scope.resetQuesFileConfig();
            setTimeout(function() {
                loadingDialogService.hideUploadingPleaseWait();
            }, 500);
        }, function(resp) {
            console.log(resp);
            if(resp.status!=413){
                $scope.uploadOption.qDocument.error = true;
                $scope.uploadOption.qDocument.message = "Attached file exceeds 10MB in size, please upload a smaller one.";

            }
            $scope.qdocFile = null;
            $scope.docName = null;
            $scope.uploadOption.qDocument.questionnaire = '';
            $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
            $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";

            console.log('Error status: ' + resp.status);
            document.getElementById('loading_newProjectStep2Doc').className = "";
            setTimeout(function() {
                loadingDialogService.hideUploadingPleaseWait();
            }, 500);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            if (document.getElementById("progressPercentage")) {
                document.getElementById("progressPercentage").style.width = progressPercentage + '%';
            }
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
            $scope.uploadOption.qDocument.count++;
            if ($scope.project.uploadedDocs.length < 1) {
                $scope.project.uploadDocumentFlag = true;
            } else {
                $scope.project.uploadDocumentFlag = false;
            }
        }

        $scope.activateNextStep();
    }

    $scope.imageFileChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){
        var fileObj = {}, z_mb= 0, fileValid = true;
        if(files != null &&  invalidFiles != null){
            if(typeof(files) != 'undefined' && files != null && files != ''){
                if(files.length > 0){
                    $scope.imageFile = files[0];
                    $scope.imageName = files[0].name;
                    /*if (detectIEService.detectIE()) { // IE version number or false
                     $scope.imageName = newVal.name;
                     }*/
                    fileObj = files[0];
                }
            }
            if(typeof(invalidFiles) != 'undefined' && invalidFiles != null && invalidFiles != '') {
                if (invalidFiles.length > 0) {
                    fileObj = invalidFiles[0];
                }
            }

            if(fileObj != null) {
                z_mb = fileObj.size / (1024 * 1024);

                if (fileObj.type !== "") { // when the file to be upload is a ms office file(e.g. '.doc', '.docx', '.xls'), the type is '', thus Mimetype check doesn't apply
                    fileValid = sharedService.isValidMimeType("image", fileObj.type);
                } else { // when the Mimetype check doesn't apply, check the file extension name instead
                    var ext = fileObj.name.substr(fileObj.name.lastIndexOf('.') + 1);
                    fileValid = sharedService.isValidExtensionName("image", ext);
                }
            }

            if(fileObj != null && fileValid === true && z_mb <= 10){
                $scope.uploadOption.image.valid = true;
                $scope.uploadOption.image.buttonDisabled = false;
                $scope.uploadOption.image.removeBtn = true;
                $scope.resetImageUploadErrorFlags();
                $scope.uploadOption.image.browseBtnClass = "btn-default";
                $scope.uploadOption.image.uploadBtnClass = "btn-primary"
                $scope.uploadOption.image.removeBtn = true;
            }else{
                $scope.uploadOption.image.browseBtnClass = "btn-primary";
                $scope.uploadOption.image.uploadBtnClass = "btn-default"
                $scope.uploadOption.image.buttonDisabled = true;
                $scope.uploadOption.image.removeBtn = false;
                $scope.imageUploadFlags.error = true;
                $scope.imageUploadFlags.message = "Something wrong happened. Please try again with another file";
                if(fileValid===false){
                    $scope.imageUploadFlags.message = "Attached file is not supported. Please upload document with following file formats: .jpg, .jpeg, .png, .bmp, .gif, .tiff, .tif ";
                    $scope.uploadOption.image.removeBtn = true;
                }else{
                    if(z_mb>10){
                        $scope.imageUploadFlags.message = "Attached image exceeds 10MB in size, please upload a smaller one.";
                        $scope.uploadOption.image.removeBtn = true;
                    } else if(z_mb==0 || z_mb===false){
                        $scope.uploadOption.image.removeBtn = false;
                        $scope.imageFile = null;
                        $scope.imageName = null;
                        $scope.imageUploadFlags.message = "Unable to attach the selected file. Please try with another file.";
                        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                    }
                }
                //$scope.imageFile = null;
                //$scope.imageName = null;
            }
        }
    }
    $scope.resetImageAttachment = function(){
        $scope.uploadOption.image.browseBtnClass = "btn-primary";
        $scope.uploadOption.image.uploadBtnClass = "btn-default"
        $scope.uploadOption.image.valid = false;
        $scope.uploadOption.image.buttonDisabled = true;
        $scope.uploadOption.image.removeBtn = false;
        $scope.imageFile = false;
        $scope.imageName = false;
        $scope.imageUploadFlags.error = false;
        $scope.imageUploadFlags.message = "";
    }
    $scope.resetImageUploadErrorFlags = function() {
        $scope.imageUploadFlags.error = false;
        $scope.imageUploadFlags.message = "";
    }
    $scope.submitImage = function() {
        if ($scope.uploadOption.image.valid === true) {
            if ($scope.imageFile) {
                $scope.uploadImage($scope.imageFile);
            }
            $scope.imageUploadFlags.error = false;
            $scope.imageUploadFlags.message = "";
            $scope.resetImageFileConfig();
        } else {
            $scope.imageUploadFlags.error = true;
            $scope.imageUploadFlags.message = "Unauthorized action performed. Please reload the page and try again.";
        }

    };

    // upload on file select or drop
    $scope.uploadImage = function(file) {
        document.getElementById('loading_newProjectStep2Img').className = "loading";

        loadingDialogService.showUploadingPleaseWait('Uploading Document, Please wait...', '0');

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
            console.log($scope.project.uploadedImages);
            $scope.imageFile = null;
            $scope.imageName = null;
            $scope.uploadOption.image.buttonDisabled = true;
            $scope.uploadOption.image.removeBtn = false;
            $scope.uploadOption.image.uploadBtnClass = "btn-default";
            $scope.uploadOption.image.browseBtnClass = "btn-primary";
            document.getElementById('loading_newProjectStep2Img').className = "";
            setTimeout(function() {
                loadingDialogService.hideUploadingPleaseWait();
            }, 500);
        }, function(resp) {
            console.log('Error status: ' + resp.status);
            $scope.uploadOption.image.uploadBtnClass = "btn-default";
            $scope.uploadOption.image.browseBtnClass = "btn-primary";
            document.getElementById('loading_newProjectStep2Img').className = "";
            setTimeout(function() {
                loadingDialogService.hideUploadingPleaseWait();
            }, 500);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            if (document.getElementById("progressPercentage")) {
                document.getElementById("progressPercentage").style.width = progressPercentage + '%';
            }
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
    $scope.qDocFileChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){
        var fileObj = {}, z_mb = 0, fileValid = true;
        if(files != null &&  invalidFiles != null){
            if(typeof(files) != 'undefined' && files != null && files != ''){
                if(files.length > 0){
                    $scope.qdocFile = files[0];
                    $scope.docName = files[0].name;
                    /*if (detectIEService.detectIE()) { // IE version number or false
                     $scope.docName = newVal.name;
                     }*/
                    fileObj = files[0];
                }
            }
            if(typeof(invalidFiles) != 'undefined' && invalidFiles != null && invalidFiles != ''){
                if(invalidFiles.length > 0){
                    fileObj = invalidFiles[0];
                }
            }

            if(fileObj != null) {
                z_mb = fileObj.size / (1024 * 1024);
                if (fileObj.type !== "") { // when the file to be upload is a ms office file(e.g. '.doc', '.docx', '.xls'), the type is '', thus Mimetype check doesn't apply
                    fileValid = sharedService.isValidMimeType("document", fileObj.type);
                } else { // when the Mimetype check doesn't apply, check the file extension name instead
                    var ext = fileObj.name.substr(fileObj.name.lastIndexOf('.') + 1);
                    fileValid = sharedService.isValidExtensionName("document", ext);
                }
            }

            if(fileObj != null && fileValid === true && z_mb <= 10){
                $scope.uploadOption.qDocument.valid = true;
                $scope.uploadOption.qDocument.buttonDisabled = false;
                $scope.uploadOption.qDocument.showQuestionnaire = true;
                $scope.uploadOption.qDocument.error = false;
                $scope.uploadOption.qDocument.message = "";
                $scope.uploadOption.qDocument.uploadBtnClass = "btn-primary";
                $scope.uploadOption.qDocument.browseBtnClass = "btn-default";
            }else{
                $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
                $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
                $scope.uploadOption.qDocument.buttonDisabled = true;
                $scope.uploadOption.qDocument.valid = false;
                $scope.uploadOption.qDocument.error = true;
                $scope.uploadOption.qDocument.showQuestionnaire = false;
                $scope.uploadOption.qDocument.message = "Something wrong happened. Please try again with another file";
                if(fileValid===false){
                    $scope.uploadOption.qDocument.message = "Attached file is not supported. Please upload document with following file formats: .doc, .docx, .odt, .rtf, .pdf";
                }else{
                    if(z_mb>10){
                        $scope.uploadOption.qDocument.message = "Attached image exceeds 10MB in size, please upload a smaller one.";
                    } else if(z_mb==0 || z_mb===false){
                        $scope.uploadOption.qDocument.message = "Unable to attach the selected file. Please try with another file.";
                        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                    }
                }
            }
        }

    }
    /*$scope.$watch('qdocFile', function(newVal, oldVal) {

        //console.log("Attached Questionnaire Document:");
        //console.log(newVal);

        if (newVal != undefined) {
            var fileValid = false, sz_mb;
                if(typeof (newVal.size) != 'undefined' && newVal.size > 0){
                    sz_mb = newVal.size / (1024 * 1024);
                    console.log("File Size: "+sz_mb+"Mb");
                    if(sz_mb> 10){
                        $scope.uploadOption.qDocument.error = true;
                        $scope.uploadOption.qDocument.message = "Attached file exceeds 10MB in size, please upload a smaller one.";
                        return null;
                    }else{
                        if (newVal.type !== "") { // when the file to be upload is a ms office file(e.g. '.doc', '.docx', '.xls'), the type is '', thus Mimetype check doesn't apply
                            fileValid = sharedService.isValidMimeType("document", newVal.type);
                        } else { // when the Mimetype check doesn't apply, check the file extension name instead
                            var ext = newVal.name.substr(newVal.name.lastIndexOf('.') + 1);
                            fileValid = sharedService.isValidExtensionName("document", ext);
                        }
                    }
                }

            if (newVal.size > 2097152) { // Step 1: check the file size
                $scope.uploadOption.qDocument.error = true;
                $scope.uploadOption.qDocument.message = "Attached file exceeds 2MB in size, please upload a smaller one.";
                return null;
            } else { // Step 2: check file type
                if (newVal.type !== "") { // when the file to be upload is a ms office file(e.g. '.doc', '.docx', '.xls'), the type is '', thus Mimetype check doesn't apply
                    fileValid = sharedService.isValidMimeType("document", newVal.type);
                } else { // when the Mimetype check doesn't apply, check the file extension name instead
                    var ext = newVal.name.substr(newVal.name.lastIndexOf('.') + 1);
                    fileValid = sharedService.isValidExtensionName("document", ext);
                }
            }

            if (fileValid) {
                $scope.uploadOption.qDocument.valid = true;
                $scope.uploadOption.qDocument.buttonDisabled = false;
                $scope.uploadOption.qDocument.showQuestionnaire = true;
                $scope.uploadOption.qDocument.error = false;
                $scope.uploadOption.qDocument.message = "";
                console.log($scope.project.uploadedDocs);
            } else {
                $scope.uploadOption.qDocument.buttonDisabled = true;
                $scope.uploadOption.qDocument.valid = false;
                $scope.uploadOption.qDocument.error = true;
                $scope.uploadOption.qDocument.showQuestionnaire = false;
                $scope.uploadOption.qDocument.message = "Attached file is not supported. Please upload document with following file formats: .doc, .docx, .odt, .rtf, .pdf";
            }

            if (detectIEService.detectIE()) { // IE version number or false
                $scope.docName = newVal.name;
            }
        } else {
            $scope.uploadOption.qDocument.error = false;
            $scope.uploadOption.qDocument.message = null;
            $scope.uploadOption.qDocument.buttonDisabled = true;
            if ($scope.docName) {
                $scope.docName = null;
            }
        }
        console.log(newVal);
    });
    */
    $scope.$watch('imageFile', function(newVal, oldVal) {
        //console.log("Attached Image File:");
        //console.log(newVal);
        var sz_mb = 0;
        if (newVal != undefined) {
            sz_mb = newVal.size / (1024 * 1024);
            console.log("File Size: "+sz_mb+"Mb");
            if (sharedService.isValidMimeType("image", newVal.type) && (sz_mb <= 10)) {
                $scope.uploadOption.image.valid = true;
                $scope.uploadOption.image.buttonDisabled = false;
                $scope.imageUploadFlags.error = false;
                $scope.imageUploadFlags.message = "";
            } else {
                $scope.uploadOption.image.buttonDisabled = true;
                $scope.imageUploadFlags.error = true;
                if (!sharedService.isValidMimeType("image", newVal.type)) {
                    $scope.imageUploadFlags.message = "Attached file is not supported. Please upload document with following file formats: .jpg, .jpeg, .png, .bmp, .gif, .tiff, .tif";
                } else {
                    $scope.imageUploadFlags.message = "Attached image exceeds 10MB in size, please upload a smaller one.";
                }
            }

            if (detectIEService.detectIE()) { // IE version number or false
                $scope.imageName = newVal.name;
            }
        } else {
            $scope.imageUploadFlags.error = false;
            $scope.imageUploadFlags.message = null;
            $scope.uploadOption.image.buttonDisabled = true;
            if ($scope.imageName) {
                $scope.imageName = null;
            }
        }
        console.log(newVal);
    });

    $scope.prepareToRemoveUploadedImage = function(fileIndex, ffiles) {
        ModalService.showModal({
          templateUrl: "views/modal_templates/confirm.html",
          controller: "dialogCtrl",
          inputs: {
            data: {
              modalTitle: "Delete Image",
              modalText: "Are you sure you want to delete " + ffiles.name + " from your project?",
              buttonText: "Delete"
            }
          },
        }).then(function(modal) {
          modal.close.then(function(result) {
            if (result.result === 'delete') {
              $scope.removeUploadedImage(fileIndex, ffiles);
            }
          });
        });
    }
    /* *
    * Method: removeUploadedImage
    * Parameters:
    * Description: removeUploadedImage method will remove attached image from imaged list
    * */
    $scope.removeUploadedImage = function(fileIndex, ffiles) {
      loadingDialogService.showProcessingPleaseWait('Deleting image. Please wait...');
      httpServerService.makeHttpRequest("questionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID + "&filename=" + ffiles.name+"&mimetype="+ffiles.file.type, "delete").then(function(responseData) {
        if (responseData.status == 200) {
          console.log("Success!!!");
          console.log(responseData);
          $scope.uploadOption.image.buttonDisabled = true;
          growl.info("You have successfully deleted your image from this project.", {
            ttl: 5000
          });

          $scope.project.uploadedImages.splice(fileIndex, 1);
          $scope.imageUploadFlags.count--;
          setTimeout(function() {
            loadingDialogService.hideProcessingPleaseWait();
          }, 500);
        } else {
          console.log("Error : ");
          console.log(responseData);
          setTimeout(function() {
            loadingDialogService.hideProcessingPleaseWait();
          }, 500);
            $scope.imageUploadFlags.error = true;
            $scope.imageUploadFlags.message = "Sorry, Something unexpected happened, please contact support@validateit.com.";
            $timeout(function() {
                $scope.imageUploadFlags.error = false;
                $scope.imageUploadFlags.message = "";
            }, 10000);
        }
      });
    }

    $scope.prepareToRemoveUploadedDoc = function(fileIndex, qdoc) {
        ModalService.showModal({
          templateUrl: "views/modal_templates/confirm.html",
          controller: "dialogCtrl",
          inputs: {
            data: {
              modalTitle: "Delete Document",
              modalText: "Are you sure you want to delete " + qdoc.name + " from your project?",
              buttonText: "Delete"
            }
          },
        }).then(function(modal) {
          modal.close.then(function(result) {
            if (result.result === 'delete') {
              $scope.removeUploadedDoc(fileIndex);
            }
          });
        });
      }
    /* *
     * Method: removeUploadedDoc
     * Parameters:
     * Description: removeUploadedDoc method will remove attached files from attachment list
     * */
    $scope.removeUploadedDoc = function(fileIndex) {
        loadingDialogService.showProcessingPleaseWait('Deleting document. Please wait...');
        httpServerService.makeHttpRequest("questionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID, "delete").then(function(responseData) {
            if (responseData.status == 200) {
                console.log("Success!!!");
                console.log(responseData);
                $scope.uploadOption.qDocument.buttonDisabled = true;
                growl.info("Questionnaire document is removed from this project.", {
                    ttl: 5000
                });
                $scope.project.uploadedDocs.splice(fileIndex, 1);
                $scope.uploadOption.qDocument.count--;
                $scope.project.uploadDocumentFlag = true;
                $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                $scope.qdocFile = null;
                $scope.resetQuesFileConfig();
                setTimeout(function() {
                    loadingDialogService.hideProcessingPleaseWait();
                }, 500);
            } else {
                console.log("Error : ");
                console.log(responseData);
                setTimeout(function() {
                    loadingDialogService.hideProcessingPleaseWait();
                }, 500);
            }
        });
    }

    /* *
     * Method: onBack
     * Parameters:
     * Description: This method will invoke when user click back button the the wizard
     * */
    $scope.onBack = function() {
            $scope.$eval($scope.config.backBtn.onClickFunc + "()");
        }
        /* *
         * Method: backToProjectDetails
         * Parameters:
         * Description: This method will redirect user from update page to project details page.
         * */
    $scope.backToProjectDetails = function() {
        var projectID = $scope.config.backBtn.params.projectID;
        document.getElementById("projectWizard").style.display = 'none';
        $rootScope.wizard.project.activate = false;
        $scope.resetProjectWizard();
        $scope.$parent.breadcrumb.lists = $scope.$parent.breadcrumb.lists.slice(0, 2);
        if ($scope.$parent.breadcrumb.lists.length >= 2) {
            $scope.$parent.breadcrumb.lists[1].onClickFnc = "D";
        }
        $scope.$parent.displayProjectDetails(projectID, 'draftProjects');

        /*httpServerService.makeHttpRequest("projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectID, "get").then(function(projectData) {
            if (projectData.status == 200) {
                var index = $scope.$parent.httpResponses['draftProjects'].map(function(item) {
                    return item.projectId;
                }).indexOf(projectID);
                $scope.$parent.httpResponses['draftProjects'][index] = {};
                $scope.$parent.httpResponses['draftProjects'][index] = projectData.data;
                $rootScope.wizard.project.projectID = null;
                $rootScope.wizard.project.activate = false;
                $rootScope.wizard.project.initFunc = '';

                $scope.$parent.breadcrumb.lists = $scope.$parent.breadcrumb.lists.slice(0, 2);
                if ($scope.$parent.breadcrumb.lists.length >= 2) {
                    $scope.$parent.breadcrumb.lists[1].onClickFnc = "";
                }

                $scope.$parent.displayProjectDetails(projectID, 'draftProjects');

                if(usersService.isAdmin() || usersService.isManager() || usersService.isReviewer()){
                 $scope.$parent.displayProjectList('approved');
                 }else if(usersService.isEmployee()){
                 $scope.$parent.displayProjectList('approvalRequired');
                 }
            }
        });*/
    }

    $scope.projectNoteSlider = function() {
        if ($scope.projectNote.sliderVisibility === false) {
            $scope.projectNote.sliderClass = 'slideInFromRight';
            $scope.projectNote.sliderVisibility = true;
            $scope.projectNote.details.class = 'shrink';
            $scope.projectNote.handleClass = 'expanded';
        } else {
            $scope.projectNote.sliderClass = 'slideOutToRight';
            $scope.projectNote.sliderVisibility = false;
            $scope.projectNote.details.class = 'normal';
            $scope.projectNote.handleClass = 'closed';
        }
    }
    $scope.addNewNote = function() {
        if ($scope.config.newNote != '') {
            httpServerService.makeHttpRequest("projectNote?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID, "post", {
                notes: $scope.config.newNote
            }).then(function(responseData) {
                if (responseData.status == 200) {
                    // success
                    console.log(" **** PROJECT NOTE ****");
                    console.log(responseData);
                    var noteText = '',
                        firstColor = '',
                        colorClass = '';
                    if (usersService.getUserObject().firstname !== null && usersService.getUserObject().firstname.trim() !== '') {
                        noteText += usersService.getUserObject().firstname.charAt(0).toUpperCase();
                    }
                    if (usersService.getUserObject().lastname !== null && usersService.getUserObject().lastname.trim() !== '') {
                        noteText += usersService.getUserObject().lastname.charAt(0).toUpperCase();
                    }
                    //$scope.colorsClasses[Math.floor(Math.random()*$scope.colorsClasses.length)]
                    console.log($scope.projectNote.list);
                    if ($scope.projectNote.list.length > 0) {
                        colorClass = $scope.$parent.colorsClasses[Math.floor(Math.random() * $scope.$parent.colorsClasses.length)];
                    } else {
                        colorClass = $scope.$parent.colorsClasses[Math.floor(Math.random() * $scope.$parent.colorsClasses.length)];
                    }
                    console.log("colorClass: " + colorClass);

                    $scope.projectNote.list.unshift({
                        id: responseData.data.notesid,
                        name: usersService.getUserObject().name,
                        note: $scope.config.newNote,
                        date: $scope.formatTime(new Date().getTime(), 'date only'),
                        colorClass: colorClass + ' slideInRight animated',
                        text: noteText,
                    });
                    $scope.config.newNote = '';
                    //$scope.hideProjectFromList(projectState, projectID);
                    //$scope.modal.show = false;
                    //$scope.resetModal();
                } else {
                    console.log(" **** PROJECT NOTE Failed ****");
                    console.log(responseData);
                }
            });
        } else {

        }
    }
    $scope.prepareToDeleteNote = function(noteId) {
        //console.log("delete Note: "+project.projectID);
        var index = $scope.projectNote.list.map(function(item) {
            return item.id;
        }).indexOf(noteId);

        document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        $rootScope.modal.title = "Delete Note ?";
        $rootScope.modal.text = "You are about to delete your note '<i>" + $scope.projectNote.list[index].note + "</i>' . Are you sure?";
        document.getElementById("modalText").innerHTML = $rootScope.modal.text;
        $rootScope.modal.buttons.delete.fnc = "deleteNote";
        $rootScope.modal.buttons.delete.params = "'" + noteId + "'";
        document.getElementById("modal-root").style.display = 'block';
        document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
        $rootScope.modal.show = true;
        console.log($scope.projectNote.list);
    }
    $scope.deleteNote = function(noteId) {
        $rootScope.modal.show = true;

        console.log("Note ID: " + noteId);
        var index = $scope.projectNote.list.map(function(item) {
            return item.id;
        }).indexOf(noteId);
        $scope.projectNote.list.splice(index, 1);
        httpServerService.makeHttpRequest("projectNote?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID + "&notesId=" + noteId, "delete").then(function(responseData) {
            if (responseData.status == 200) {
                // success
                console.log(" **** PROJECT DELETED ****");
                console.log(responseData);
                //$scope.hideProjectFromList(projectState, projectID);

                $rootScope.modal.show = false;
                $scope.resetModal();
            } else {
                console.log(" **** Failed ****");
                console.log(responseData);
            }
        });
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
            $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
            loadingDialogService.showProcessingPleaseWait('Submitting project. Please wait...');
            httpServerService.makeHttpRequest("projectState", "post", {
                teamName: usersService.getUserObject().teamname,
                projectId: $scope.projectID,
                notes: $scope.project.notes
            }).then(function(responseData) {
                if (responseData.status == 200) {
                    loadingDialogService.hideProcessingPleaseWait();
                    growl.info("Your project <b>"+$scope.project.projectName+"</b> has been successfully submitted.", {
                        ttl: 2500
                    });
                    console.log("Success!!!");
                    console.log(responseData);
                    $scope.$eval($rootScope.wizard.project.onSubmitFunc + "()");
                    //sharedService.setNotification({type:'success', message:'You have successfully completed creating a new project.', ttl:10000});
                } else {
                    console.log("Error : ");
                    console.log(responseData);
                }
            });
            setTimeout(function() {
                loadingDialogService.hideProcessingPleaseWait();
            }, 2000);
        } else {

            loadingDialogService.showProcessingPleaseWait('Submitting project. Please wait...');
            var ws_url = "project",
                insertData = communityService.prepareProjectDataToSave($scope.project);
            console.log(insertData);

            if ($scope.projectID != null && typeof $scope.projectID != 'undefined') {
                ws_url += "?projectId=" + $scope.projectID;
            }

            httpServerService.makeHttpRequest(ws_url, "post", insertData).then(function(responseData) {
                if (responseData.status == 200) {
                    $scope.resetCurrentPageVars();
                    $rootScope.unCompletedProcessOnCurrentPage = false;
                    $scope.updateProjectOrg($scope.project);
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
                    setTimeout(function() {
                        loadingDialogService.hideProcessingPleaseWait();
                    }, 500);
                    $scope.newProjectProgress.previousBtn.visible = true;
                    $scope.newProjectProgress.submitProjectBtn.visible = false;
                    $scope.newProjectProgress.saveContinueBtn.visible = true;
                    $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                    $scope.config.disabledButtons = [true, false, true];
                    $scope.newProjectProgress.currentStep++;
                    $scope.activateNextStep();

                } else {
                    console.log(" **** Failed ****");
                    console.log(responseData);
                    setTimeout(function() {
                        loadingDialogService.hideProcessingPleaseWait();
                    }, 500);

                    $scope.config.disabledButtons = [false, true, true];
                    console.log(responseData);
                    $rootScope.resetModal();
                    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
                    $rootScope.modal.show = false;
                    $rootScope.modal.title = "Warning";
                    $rootScope.modal.text = "Something unexpected happened, please contact support@validateit.com."
                    document.getElementById("modalText").innerHTML = $rootScope.modal.text;
                    $rootScope.modal.buttons.delete.show = false;
                    $rootScope.modal.buttons.delete.fnc = "";
                    $rootScope.modal.buttons.delete.params = "";
                    document.getElementById("modal-root").style.display = 'block';
                    //document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
                    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
                    $scope.modal.show = true;
                    $scope.newProjectProgress.saveContinueBtn.disabled = "";
                }
            });
        }
    }

    $scope.updateProjectOnSubmit = function() {
        $window.location.assign("/#/project_details/"+$scope.projectID);
        $window.location.reload();
        /*httpServerService.makeHttpRequest("projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID, "get").then(function(projectData) {
            if (projectData.status == 200) {

                var index = $scope.$parent.httpResponses['draftProjects'].map(function(item) {
                    return item.projectId;
                }).indexOf($scope.projectID);
                // TODO : the project will be removed from draft and move to approval required or Approved
                //$scope.$parent.httpResponses['draftProjects'].splice(index, 1);

                //$scope.$parent.httpResponses['draftProjects'][index] = {};
                //$scope.$parent.httpResponses['draftProjects'][index] = projectData.data;

                //$scope.showProjectUpdateForm = false;
                $rootScope.wizard.project.activate = false;
                $rootScope.wizard.project.projectID = null;
                document.getElementById("projectWizard").style.display = 'none';
                $scope.resetProjectWizard();
                //$scope.$parent.displayProjectDetails($scope.projectID, 'draftProjects');

                $window.location.assign("/#/project_details/"+$scope.projectID);
                if (usersService.isAdmin() || usersService.isManager() || usersService.isReviewer()) {
                    $scope.$parent.displayProjectList('approved');


                } else if (usersService.isUser()) {
                    $scope.$parent.displayProjectList('approvalRequired');

                }
            }
        });*/
    }
    $scope.newProjectWithCommunitiesOnSubmit = function() {
        //sharedService.setProjectFlag('isCreated');
        //sharedService.setProjectRedirectedTo(true);
        //sharedService.setProjectID($scope.projectID);

        $timeout(function() {
            $window.location.assign("/#/project_details/"+$scope.projectID);
            //$window.location.reload();
        }, 1000);
    }
    $scope.activateCommunitySection = function() {
            if ($scope.project.projectName.trim().length > 0 && $scope.project.projectDescription.trim().length > 0 && $scope.project.questions > 0) {
                document.getElementById("block-wrap").style.display = 'none';
            } else {
                document.getElementById("block-wrap").style.display = 'inline-block';
            }
        }
        // Save And Continue Validation
    $scope.activateNextStep = function() {
        var i, temp, status = false;
        if ($scope.newProjectProgress.currentStep == 0) {
            if ($scope.project.projectName.trim().length > 0 && $scope.project.questions > 0 && $scope.project.communitiesAdded > 0 && $scope.project.projectDescription.length > 0) {
                temp = true;
                for (i = 0; i < $scope.project.communityDetails.length; i++) {
                    if ($scope.project.communityDetails[i].isSaved === false) {
                        temp = false;
                        break;
                    }
                }
                if (temp === true) {
                    if ($scope.config.sh.showCommunityForm === true) {
                        $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
                        status = false;
                    } else {
                        $scope.newProjectProgress.saveContinueBtn.disabled = '';
                        status = true;
                    }

                    $scope.newProjectProgress.saveContinueBtn.disabled = '';
                    status = true;
                } else {
                    //$scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
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
            if ($scope.newProjectProgress.saveContinueBtn.disabled == 'disabled') {
                $rootScope.modal.show = false;
                document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
                $rootScope.modal.title = "Unauthorized Action Performed";
                $rootScope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
                document.getElementById("modalText").innerHTML = $rootScope.modal.text;
                $rootScope.modal.buttons.delete.show = false;
                $rootScope.modal.buttons.delete.fnc = "";
                $rootScope.modal.buttons.delete.params = "";
                document.getElementById("modal-root").style.display = 'block';
                document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
                $rootScope.modal.show = true;

            } else {
                if ($scope.activateNextStep()) {
                    var unsavedComm = $scope.checkUnsavedCommunityCard();
                    if (unsavedComm.found) {
                        $scope.warningCommunityInfoNotSaved();
                        $scope.newProjectProgress.saveContinueBtn.disabled = '';
                    } else {
                        $scope.saveProject();
                    }
                } else {
                    $scope.warningCommunityInfoNotSaved();
                    $scope.newProjectProgress.saveContinueBtn.disabled = '';
                }
            }
        } else if ($scope.newProjectProgress.currentStep == 1) {
            $scope.newProjectProgress.previousBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.visible = true;
            $scope.project.agreedTerms = false;
            $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            document.getElementById("confirmation").style.borderColor = '#a7a7a7';
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
            $scope.config.disabledButtons = [true, true, false];
            $scope.newProjectProgress.currentStep++;
        } else if ($scope.newProjectProgress.currentStep == 2) {
            if ($scope.newProjectProgress.submitProjectBtn.disabled == 'disabled') {
                $scope.modal.show = false;
                document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
                $rootScope.modal.title = "Unauthorized Action Performed";
                $rootScope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
                document.getElementById("modalText").innerHTML = $rootScope.modal.text;
                $rootScope.modal.buttons.delete.show = false;
                $rootScope.modal.buttons.delete.fnc = "";
                $rootScope.modal.buttons.delete.params = "";
                document.getElementById("modal-root").style.display = 'block';
                document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
                $rootScope.modal.show = true;
            } else {
                $scope.newProjectProgress.previousBtn.visible = true;
                $scope.newProjectProgress.submitProjectBtn.visible = true;
                $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
                $scope.newProjectProgress.saveContinueBtn.visible = false;
                $scope.newProjectProgress.saveContinueBtn.disabled = '';
                $scope.activateNextStep();
                $scope.newProjectProgress.currentStep++;
            }
        }

        /*$scope.newProjectProgress.currentStep++;
        for (var i = 0; i < $scope.config.disabledButtons.length; i++) {
            if (i === $scope.newProjectProgress.currentStep) {
                $scope.config.disabledButtons[i] = false;
            } else {
                $scope.config.disabledButtons[i] = true;
            }
        }*/
        $scope.activateNextStep();
    }

    $scope.prevStep = function() {
        if ($scope.newProjectProgress.currentStep == 1) {
            $scope.newProjectProgress.previousBtn.visible = false;
        } else if ($scope.newProjectProgress.currentStep == 2) {
            if ($scope.project.agreedTerms !== true) {
                $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            } else {
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

    $scope.checkUnsavedCommunityCard = function() {
        var found = false,
            recordID = null;
        if ($scope.project.communityDetails.length > 0) {
            for (var i = 0; i < $scope.project.communityDetails.length; i++) {
                if ($scope.project.communityDetails[i].isSaved === false) {
                    found = true;
                    recordID = $scope.project.communityDetails[i].recordID;
                    break;
                }
            }
            if ($scope.config.sh.showCommunityForm === true) {
                found = true;
                recordID = null;
            }
        }
        return {
            found: found,
            recordID: recordID
        }
    }

    $scope.warningCommunityInfoNotSaved = function() {
        //var comIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(unsavedComm.recordID);
        $rootScope.modal.show = false;
        document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        $rootScope.modal.title = "Unsaved community information";
        $rootScope.modal.text = "You haven't saved community information. Please save community information first to proceed to next step.";
        document.getElementById("modalText").innerHTML = $rootScope.modal.text;
        $rootScope.modal.buttons.delete.show = false;
        $rootScope.modal.buttons.custom.show = false;
        $rootScope.modal.buttons.confirm.show = true;
        $rootScope.modal.buttons.confirm.text = "Ok";
        $rootScope.modal.buttons.confirm.fnc = "closeModal";
        $rootScope.modal.buttons.confirm.params = "";
        $rootScope.modal.buttons.cancel.show = true;
        $rootScope.modal.buttons.cancel.fnc = "closeModal";

        document.getElementById("modal-root").style.display = 'block';
        document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
        $rootScope.modal.show = true;
        $scope.newProjectProgress.saveContinueBtn.disabled = '';

    }

    $scope.resetConfig = function() {
        $scope.config.sh.displayForm = true;
        $scope.config.sh.showCommunityForm = false,
            $scope.config.sh.addMoreCommunity.showBtn = true;
        $scope.config.sh.addMoreCommunity.disableBtn = false;

        $scope.config.appearance.first = 'zoomIn animated';
        $scope.config.appearance.second = '';
        $scope.config.appearance.third = '';

        $scope.config.backBtn.display = true;
        $scope.config.backBtn.text = '';
        $scope.config.backBtn.onClickFunc = '';
        $scope.config.backBtn.params = {};
        $scope.config.backBtn.disabledButtons = [false, true, true];
        $scope.resetOverlay();
    }
    $scope.resetOverlay = function() {
        $scope.config.overlay.display = false;
        $scope.config.overlay.title = 'Processing your request';
        $scope.config.overlay.content = 'Please wait for a moment. Thank you for your patience.';
        $scope.config.overlay.spinner = true;
    }

    /* *
     * Method: resetProjectObject
     * Parameters:
     * Description: This method will invoke when user arrive to edit project page and reset the project object
     * */
    $scope.resetProjectObject = function() {
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
         * Method: resetNewCommunityForm
         * Parameters:
         * Description: This method will invoke when user add a community to a project and reset the add more community form
         * */
    $scope.resetNewCommunityForm = function() {
            $scope.newCommunityForm = communityService.createNewCommunityFormObject();
            $scope.newCommunityForm.countries = communityService.getCountries();

            /*$scope.newCommunityForm.countries = communityService.getCountries();
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
            */
            // $scope.activateNextStep(); @TODO - uncomment
            $scope.config.sh.showCommunityForm = false;
            $scope.config.sh.addMoreCommunity.disableBtn = '';
            $scope.activateNextStep();

        }
        /* *
         * Method: resetFileUploadConfig
         * Parameters:
         * Description: This method will reset file uploading configuration
         * */
    $scope.resetFileUploadConfig = function() {
        $scope.resetQuesFileConfig();
        $scope.resetImageFileConfig();
    }
    $scope.resetQuesFileConfig = function() {
        $scope.uploadOption.qDocument.valid = false;
        $scope.uploadOption.qDocument.buttonDisabled = true;
        $scope.uploadOption.qDocument.showQuestionnaire = false;
        $scope.uploadOption.qDocument.questionnaire = '';
        $scope.uploadOption.qDocument.count = 0;
        $scope.uploadOption.qDocument.error = false;
        $scope.uploadOption.qDocument.message = "";
        $scope.qdocFile = null;
    }
    $scope.resetImageFileConfig = function() {
            $scope.uploadOption.image.valid = false;
            $scope.uploadOption.image.buttonDisabled = true;
            $scope.imageUploadFlags.count = 0;
            $scope.imageUploadFlags.error = false;
            $scope.imageUploadFlags.message = "";
            $scope.imageFile = null;
    }
    $scope.resetQDocAttachment = function(){
        $scope.uploadOption.qDocument.valid = false;
        $scope.uploadOption.qDocument.buttonDisabled = true;
        $scope.uploadOption.qDocument.showQuestionnaire = false;
        $scope.uploadOption.qDocument.questionnaire = "";
        $scope.qdocFile = null;
        $scope.docName = null;
        $scope.uploadOption.qDocument.error = false;
        $scope.uploadOption.qDocument.message = "";
        $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
        $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
    }
        /* *
         * Method: resetFileUploadConfig
         * Parameters:
         * Description: This method will reset file uploading configuration
         * */
    $scope.resetProjectWizard = function() {
        $scope.resetProjectObject();
        $scope.showProjectUpdateForm = false;
        $scope.wizardType = '';
        $scope.projectDetailsData = {};
        $scope.projectID = '';
        $scope.imageFile = null;
        $scope.qdocFile = null;
        $scope.resetFileUploadConfig();
        $scope.resetNewCommunityForm();
        $scope.resetConfig();
        $scope.config.sh.showCommunityForm = false;
        $scope.config.sh.addMoreCommunity.showBtn = true;
        $scope.config.sh.addMoreCommunity.disableBtn = false;
        $scope.projectDetailsData = {};
        $scope.selectedProjectDetailsData = {};
        $scope.newProjectProgress.currentStep = 0;
        $scope.newProjectProgress.previousStep = -1;
        $scope.newProjectProgress.previousBtn.visible = false;
        $scope.newProjectProgress.saveContinueBtn.visible = true;
        $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
        $scope.newProjectProgress.submitProjectBtn.visible = false;
    }

    $scope.checkForUnCompletedProcess = function(){

            if ($scope.newProjectProgress.currentStep === 0) {
                //var ret = $scope.validateStepOne();
                if ($scope.project.projectName.trim().length < 1 && $scope.project.questions < 1 && $scope.project.communitiesAdded < 1 && $scope.project.projectDescription.length < 1) {
                    $rootScope.unCompletedProcessOnCurrentPage = false;
                    $scope.resetCurrentPageVars();
                } else{
                    $rootScope.unCompletedProcessOnCurrentPage = true;
                    $rootScope.currentPage.action = "Uncompleted Step 1";
                    $rootScope.currentPage.msgTitle = "<b>Warning:</b> <b>New Project</b> ?";
                    $rootScope.currentPage.onChangeMsg = "<p>You are about to leave new project page. If you leave then all unsaved data of this project will be lost which are not recoverable.</p>";
                    $rootScope.currentPage.onChangeMsg += "<p>Are you sure ?</p>";
                }
            }

    }

    $scope.checkProjectDataChanges = function(){
        // project name
        if ($scope.projectID != null && typeof $scope.projectID != 'undefined') {
            var isChanged = false, projectName = "", checkProp = ["projectName", "projectDescription", "questions", "totalRespondents", "communitiesAdded"];
            checkProp.forEach(function (key) {
                if ($scope.project[key] != projectOrg[key]) {
                    projectName = projectOrg.projectName;
                    isChanged = true;
                }
            });
            // check community details
            // communityDetails
            // check community exists or not first
            // then check selected data
            var communityEd = {}, communityOrg = {}, comIndexEd = 0;
            for (var i = 0; i < projectOrg.communityDetails.length; i++) {
                communityEd = {};
                communityOrg = {};
                communityOrg = projectOrg.communityDetails[i];
                // find community in Original
                comIndexEd = $scope.project.communityDetails.map(function (item) {
                    return item.selected.community.name;
                }).indexOf(communityOrg.selected.community.name);
                if (comIndexEd < 0) {
                    // community not found - info updated
                    isChanged = true;
                    break;
                } else {
                    communityEd = $scope.project.communityDetails[comIndexEd];

                    if (isChanged === false && communityEd.selected.countries_text != communityOrg.selected.countries_text) {
                        isChanged = true;
                        break;
                    }

                    if (isChanged === false && communityEd.selected.community.name != communityOrg.selected.community.name) {
                        isChanged = true;
                        break;
                    }
                    if (isChanged === false && communityEd.selected.ages.length != communityOrg.selected.ages.length) {
                        isChanged = true;
                        break;
                    } else {
                        if (isChanged === false && communityEd.selected.age_text != communityOrg.selected.age_text) {
                            isChanged = true;
                            break;
                        }
                    }

                    if (isChanged === false && communityEd.selected.gender.length != communityOrg.selected.gender.length) {
                        isChanged = true;
                        break;
                    } else {
                        if (isChanged === false && communityEd.selected.gender_text != communityOrg.selected.gender_text) {
                            isChanged = true;
                            break;
                        }
                    }
                    if (isChanged === false && communityEd.selected.respondents.number != communityOrg.selected.respondents.number) {
                        isChanged = true;
                        break;
                    }
                }
            }
            if (isChanged === true) {
                $rootScope.unCompletedProcessOnCurrentPage = true;
                $rootScope.currentPage.action = "Update Draft Project: Step 1";
                $rootScope.currentPage.msgTitle = "<b>Warning:</b> <b>" + projectName + "</b>";
                $rootScope.currentPage.onChangeMsg = "<p>You are about to leave this page. If you leave then all unsaved data of this project will be lost which are not recoverable.</p>";
                $rootScope.currentPage.onChangeMsg += "<p>Are you sure ?</p>";
            } else {
                $rootScope.unCompletedProcessOnCurrentPage = false;
                $rootScope.currentPage.action = "Update Draft Project: Step 1";
                $rootScope.currentPage.msgTitle = "";
                $rootScope.currentPage.onChangeMsg = "";
            }
        }else{
            $scope.checkForUnCompletedProcess();
        }
    }

    $scope.updateProjectOrg = function(projectObj){
        projectOrg = {
            projectName: projectObj.projectName,
            projectDescription: projectObj.projectDescription,
            questions: projectObj.questions,
            totalRespondents: projectObj.totalRespondents,
            communitiesAdded: projectObj.communitiesAdded,
            communityDetails: [],
        };

        for (var i = 0; i < projectObj.communityDetails.length; i++) {
            projectOrg.communityDetails.push({
                selected:{
                    countries_text: projectObj.communityDetails[i].selected.countries_text,
                    community: projectObj.communityDetails[i].selected.community,
                    ages: projectObj.communityDetails[i].selected.ages,
                    age_text: projectObj.communityDetails[i].selected.age_text,
                    gender: projectObj.communityDetails[i].selected.gender,
                    gender_text: projectObj.communityDetails[i].selected.gender_text,
                    respondents: projectObj.communityDetails[i].selected.respondents,
                }
            });
        }
    }
    $scope.resetCurrentPageVars = function(){
        if($rootScope.hasOwnProperty('currentPage')){
            $rootScope.currentPage.name = "New Project";
            $rootScope.currentPage.action = "";
            $rootScope.currentPage.msgTitle = "";
            $rootScope.currentPage.onChangeMsg = "";
        }
    }

    $scope.resetErrorMessageFlags = function(){
        $scope.error.occurred = false;
        $scope.error.type = '';
        $scope.error.debugLoc = '';
        $scope.error.message = '';
    }
}]);