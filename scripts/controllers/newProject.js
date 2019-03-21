/**
 * Created by Kanthi on 2015-08-24.
 */
'use strict';
var app = angular.module('validateItUserPortalApp');

app.controller('NewProjectCtrl', ['$scope', '$rootScope', '$location', '$window', 'usersService', 'sideBarService', 'httpServerService', 'communityService', 'sharedService', 'loadingDialogService', 'ModalService', 'detectIEService', '$timeout', 'Upload', '$interval', 'growl', '$q',
  function($scope, $rootScope, $location, $window, usersService, sideBarService, httpServerService, communityService, sharedService, loadingDialogService, ModalService, detectIEService, $timeout, Upload, $interval, growl, $q) {

    /* ------------------------------------- [Start] of init function ------------------------------------- */
    /**
     * Function that's called when the users page is loaded.
     * This function will make a webservice to call the backend
     * and it will load the data for the users list.
     *
     * @newProject.communities: community list collected from web service
     * @selectedCommunity: A list of selected communities
     */
    var projectOrg = {};
    

    // Handle the result of a gapi.auth.authorize() call.
    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Authorization was successful. Hide authorization prompts and show
        // content that should be visible after authorization succeeds.
        $('.pre-auth').hide();
        $('.post-auth').show();
        loadAPIClientInterfaces();
      } else {
        // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
        // client flow. The current function is called when that flow completes.
        $('#login-link').click(function() {
          gapi.auth.authorize({
            client_id: OAUTH2_CLIENT_ID,
            scope: OAUTH2_SCOPES,
            immediate: false
            }, handleAuthResult);
        });
      }
    }

    // Load the client interfaces for the YouTube Analytics and Data APIs, which
    // are required to use the Google APIs JS client. More info is available at
    // http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
    function loadAPIClientInterfaces() {
      gapi.client.load('youtube', 'v3', function() {
        handleAPILoaded();
      });
    }


    var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.


    /**
     * YouTube video uploader class
     *
     * @constructor
     */
    
    UploadVideo.prototype.ready = function(accessToken) {
      this.accessToken = accessToken;
      this.gapi = gapi;
      this.authenticated = true;
      this.gapi.client.request({
        path: '/youtube/v3/channels',
        params: {
          part: 'snippet',
          mine: true
        },
        callback: function(response) {
          if (response.error) {
            console.log(response.error.message);
          } else {
            $('#channel-name').text(response.items[0].snippet.title);
            $('#channel-thumbnail').attr('src', response.items[0].snippet.thumbnails.default.url);

            $('.pre-sign-in').hide();
            $('.post-sign-in').show();
          }
        }.bind(this)
      });
      $('#button').on("click", this.handleUploadClicked.bind(this));
    };

    /**
     * Uploads a video file to YouTube.
     *
     * @method uploadFile
     * @param {object} file File object corresponding to the video to upload.
     */
    UploadVideo.prototype.uploadFile = function(file) {
      var metadata = {
        snippet: {
          title: $('#title').val(),
          description: $('#description').text(),
          tags: this.tags,
          categoryId: this.categoryId
        },
        status: {
          privacyStatus: $('#privacy-status option:selected').text()
        }
      };
      var uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: this.accessToken,
        metadata: metadata,
        params: {
          part: Object.keys(metadata).join(',')
        },
        onError: function(data) {
          var message = data;
          // Assuming the error is raised by the YouTube API, data will be
          // a JSON string with error.message set. That may not be the
          // only time onError will be raised, though.
          try {
            var errorResponse = JSON.parse(data);
            message = errorResponse.error.message;
          } finally {
            alert(message);
          }
        }.bind(this),
        onProgress: function(data) {
          var currentTime = Date.now();
          var bytesUploaded = data.loaded;
          var totalBytes = data.total;
          // The times are in millis, so we need to divide by 1000 to get seconds.
          var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
          var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
          var percentageComplete = (bytesUploaded * 100) / totalBytes;
          
          if (document.getElementById("progressPercentage")) {
            document.getElementById('loading_newProjectStep2Video').className = "loading";
            document.getElementById("progressPercentage").style.width = percentageComplete + '%';
          }
          
          $('#upload-progress').attr({
            value: bytesUploaded,
            max: totalBytes
          });

          $('#percent-transferred').text(percentageComplete);
          $('#bytes-transferred').text(bytesUploaded);
          $('#total-bytes').text(totalBytes);

          $('.during-upload').show();
        }.bind(this),
        onComplete: function(data) {
          setTimeout(function() {
            loadingDialogService.hideUploadingPleaseWait();
          }, 500);
          document.getElementById('loading_newProjectStep2Video').className = "";
          var uploadResponse = JSON.parse(data);
          this.videoId = uploadResponse.id;
          $('#video-id').text(this.videoId);
          $('.post-upload').show();
          this.pollForVideoStatus();
        }.bind(this)
      });
      // This won't correspond to the *exact* start of the upload, but it should be close enough.
      this.uploadStartTime = Date.now();
      uploader.upload();
    };

    UploadVideo.prototype.handleUploadClicked = function() {
      $('#buttondisable').attr('disabled', true);
      this.uploadFile($('#file').get(0).files[0]);
    };

    UploadVideo.prototype.pollForVideoStatus = function() {
      this.gapi.client.request({
        path: '/youtube/v3/videos',
        params: {
          part: 'status,player',
          id: this.videoId
        },
        callback: function(response) {
          if (response.error) {
            // The status polling failed.
            console.log(response.error.message);
            setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
          } else {
            var uploadStatus = response.items[0].status.uploadStatus;
            switch (uploadStatus) {
              // This is a non-final status, so we need to poll again.
              case 'uploaded':
                $('#post-upload-status').append('<li>Upload status: ' + uploadStatus + '</li>');
                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                break;
              // The video was successfully transcoded and is available.
              case 'processed':
                $('#player').append(response.items[0].player.embedHtml);
                $('#post-upload-status').append('<li>Final status.</li>');
                break;
              // All other statuses indicate a permanent transcoding failure.
              default:
                $('#post-upload-status').append('<li>Transcoding failed.</li>');
                break;
            }
          }
        }.bind(this)
      });
    };
    //end of google code

    $scope.init = function() {
      sideBarService.setSelectedByRoute($location.$$path);

      $rootScope.unCompletedProcessOnCurrentPage = false;
      $rootScope.currentPage = {
        name: "New Project",
        action: "",
        msgTitle: "",
        onChangeMsg: "",
      }

      $scope.newProjectFlag = true;
      $scope.projectID = null;
      $scope.imageFile = null;
      $scope.file = null;
      $scope.manager = {
        display: false,
        email: "",
        name: "",
      }
      $scope.modalOnClose = {
          callingFunc: '',
          data: {}
        }
        /*-------------------------------------------- [Start] New Project Options Code Begin ------------------------------------------------*/
      $scope.showNewProjectForm = true;

      hideCopyModal();

      $scope.modalOnClose.callingFunc = 'focusProjectName';
      $scope.chosenProjectID;
      // httpServerService.getDefaultErrorMessage();
      /**
       * Variable: newProject
       * @type {{ projectName: string, numberOfResponents: number, country: string, community: string, gender: {male: number, female: number}, questionnaireDocument: Array, images: Array}}
       * Description: This variable will store all information provided by the user during new project creation process
       */
      $scope.project = communityService.createProjectObject();

      // @newCommunityForm : This is a temporary variable to store data for add new community form
      $scope.newCommunityForm = communityService.createNewCommunityFormObject();
      $scope.showCommunityForm = false;
      //$scope.project.communities = communityService.getCommunities2();
      $scope.addMoreCommunity = {
        showBtn: false,
        disableBtn: true,
      }
      $scope.questions = [];
      $scope.priceTable = [];
      $scope.manager = {
        display: false,
        email: "",
        name: "",
      }

      /*------ [Start] Breadcrumb Code -------*/
      $scope.breadcrumb = {
        lists: [{
          name: "Home",
          onClickFnc: "showPageHome('employee_overview')",
        }, {
          name: "New Project",
          onClickFnc: "showNewProjectOptions()",
        }]
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

      /*------------------------------------------------- [Start] New Project Options Code End -----------------------------------------*/

      /**
       * File Upload for question document functionality,
       */
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
        },
        video: {
          valid: false,
          buttonClass: 'disabled',
          buttonDisabled: true,
          removeBtn: false,
          uploadBtnClass: "btn-default",
          browseBtnClass: "btn-primary",
        }
      }

      $scope.showNewProjectWizatd = false;
      loadingDialogService.showProcessingPleaseWait('Loading ... Please wait...');
      httpServerService.makeHttpRequest("newProjectAuth?teamName=" + usersService.getUserObject().teamname, "get").then(function(responseData) {
        loadingDialogService.hideProcessingPleaseWait();
        if (responseData.status == 200) {
          $scope.showNewProjectWizatd = true;
          $timeout(function() {   //  set delay to make sure the dialog shows
            if($location.path() === "/new_project_wizard") {  // only show the options dialog when it is in new project page
              $scope.showOptionsModal();  // debug - pls uncomment
            }
          }, 500);
        } else {
            $timeout(function() {
              $scope.changePath('/#/employee_overview');
            }, 5000);
            ModalService.showModal({
              templateUrl: "views/modal_templates/notification.html",
              controller: "dialogCtrl",
              inputs: {
                data: {
                  modalTitle: "Access restricted.",
                  modalText: "You don't have permission to create new project.",
                  autoClose: true,
                  closingDelay: 5000
                }
              },
            }).then(function(modal) {
              modal.close.then(function(result) {
                console.log(result);
                if (result.result === 'cancel') {
                  $scope.changePath('/#/employee_overview');
                } else {

                }
              });
            });
        }

      });

      $scope.submit = function() {
        if ($scope.uploadOption.qDocument.valid === true) {
          if ($scope.file) {
            $scope.upload($scope.file);
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
        var qDocTags = $scope.uploadOption.qDocument.questionnaire;
        var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        Upload.upload({
          url: uploadPath,
          data: {
            file: file,
            'description': qDocTags
          }
        }).then(function(resp) {
          console.log(resp);
          $scope.uploadOption.qDocument.buttonDisabled = true;
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
          $scope.pushAttachemntToUploadedDocList({
            file: file,
            name: resp.config.data.file.name,
            note: qDocTags,
            link: resp.data,
            emptyNote: false,
            error: ''
          });
          $scope.file = null;
          $scope.docName = null;
          $scope.uploadOption.qDocument.questionnaire = '';
          $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
          $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
          document.getElementById('loading_newProjectStep2Doc').className = "";
          setTimeout(function() {
            loadingDialogService.hideUploadingPleaseWait();
          }, 500);
        }, function(resp) {
          console.log('Error status: ' + resp.status);
          $scope.file = null;
          $scope.docName = null;
          $scope.uploadOption.qDocument.questionnaire = '';
          $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
          $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
          document.getElementById('loading_newProjectStep2Doc').className = "";
          //loadingDialogService.showDefaultErrorMessage("", true, 5000);
          growl.error("Oops!Seems something went wrong. If the issue persists, please contact support@validateit.com.");
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

      $scope.submitImage = function() {
        if ($scope.uploadOption.image.valid === true) {
          if ($scope.imageFile) {
            $scope.uploadImage($scope.imageFile);
          }
          $scope.resetImageUploadErrorFlags();
        } else {
          $scope.imageUploadFlags.error = true;
          $scope.imageUploadFlags.message = "Unauthorized action performed. Please reload the page and try again.";
        }

      };

      $scope.submitVideo = function() {
        
        if ($scope.uploadOption.video.valid === true) {
            loadingDialogService.showUploadingPleaseWait('Uploading Video, Please wait...', '0');
            $scope.videoFile = null;
            $scope.videoName = null;
            $scope.uploadOption.video.buttonDisabled = true;
            $scope.uploadOption.video.removeBtn = false;
            $scope.uploadOption.video.uploadBtnClass = "btn-default";
            $scope.uploadOption.video.browseBtnClass = "btn-primary";
            $scope.resetVideoUploadErrorFlags();

          // setTimeout(function() {
          //   loadingDialogService.hideUploadingPleaseWait();
          // }, 500);
        } else {
          $scope.videoUploadFlags.error = true;
          $scope.videoUploadFlags.message = "Unauthorized action performed. Please reload the page and try again.";
        }

      };

      // upload on file select or drop
      $scope.uploadImage = function(file) {
        loadingDialogService.showUploadingPleaseWait('Uploading Image, Please wait...', '0');
        document.getElementById('loading_newProjectStep2Img').className = "loading";
        var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        Upload.upload({
          url: uploadPath,
          data: {
            file: file,
            'description': '',
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
          growl.error("Oops!Seems something went wrong. If the issue persists, please contact support@validateit.com.");
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

      // ----------------------- Parse Community Records --------------------------
      // Teamname: usersService.getUserObject().teamname
      communityService.getCommunityListFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
        var firstCommunity = responseData.communities[0].communityname;
        communityService.parseDataGetCommunityList(responseData.communities);
        communityService.saveHttpResponseData("CommunityList", responseData); // save query data
        // Set countries
        $scope.newCommunityForm.countries = communityService.getCountries();
        $scope.project.communityDetails[0].countries = communityService.getCountries();
      });

      sharedService.getPricingInfoFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
        sharedService.saveHttpResponseData("NewProjectPricing", responseData);
        sharedService.parseDataGetProjectPricing(responseData);
        $scope.priceTable = sharedService.getPricingTable();
        communityService.setRespondentSet(sharedService.getRespondentSet());
        //console.log($scope.priceTable);
        for (var i = $scope.priceTable.nQmin; i <= $scope.priceTable.nQmax; i++) {
          $scope.questions.push(i);
        }
      });

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

      // Save And Continue Validation
      $scope.activateNextStep = function() {
        var i, temp, status = false;
        console.log("----------------------------------------------------------------------------");
        console.log($scope.project);
        console.log("Current Step: " + $scope.newProjectProgress.currentStep);
        console.log($scope.newProjectProgress);
        console.log("----------------------------------------------------------------------------");
        if ($scope.newProjectProgress.currentStep == 0) {
          var ret = $scope.validateStepOne();
          temp = ret.temp;
          status = ret.status;
        }
        if ($scope.newProjectProgress.currentStep == 1) {
          if ($scope.project.uploadedDocs.length > 0) {
            /*temp = true;
            for(i=0; i<$scope.project.uploadedDocs.length; i++){
              if($scope.project.uploadedDocs[i].emptyNote===true){
                temp = false;
                break;
              }
            }
            if(temp==false){
             $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
              status = false;
            }else{
             $scope.newProjectProgress.saveContinueBtn.disabled = '';
              status = true;
            }*/
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
        //console.log("----------------------------------------------------------------");
        return status;
      }

      $scope.validateStepOne = function(){
        var i, temp, status = false;
        if ($scope.project.projectName.trim().length > 0 && $scope.project.questions > 0 && $scope.project.communitiesAdded > 0 && $scope.project.projectDescription.length > 0) {
          temp = true;
          for (i = 0; i < $scope.project.communityDetails.length; i++) {
            if ($scope.project.communityDetails[i].isSaved === false) {
              temp = false;
              break;
            }
          }
          if (temp === true) {
            if ($scope.showCommunityForm === true) {
              $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
              status = false;
            } else {
              $scope.newProjectProgress.saveContinueBtn.disabled = '';
              status = true;
            }
          } else {
            //$scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
            status = false;
          }
        } else {
          $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
          status = false;
        }
        return {
          temp: temp,
          status:status
        };
      };


      /* ------------------------------------- [Start] New Project Process Step Button ------------------------------------- */
      $scope.disabledButtons = [true, true, true];
      $scope.disabledButtons = false;
      $scope.currentStep = 0;
      $scope.emptyProjectNameErrorFlag = false;

      $scope.fieldError = {
        projectName: false,
        projectDescription: false,
        questions: false,
        allVerified: false,
      }

      /****************************** [Start: Auto save of Step 1 of new project ********************************/
      /**
       * Ruturn flag to determine whether to save peoject or not after validating all the fileds
       */
      function enableSave() {
        $scope.project.communitiesAdded = $scope.project.communityDetails.length;
        if ($scope.project.projectName.trim().length <= 0 || $scope.project.questions <= 0 || $scope.project.communitiesAdded <= 0 || $scope.project.projectDescription.length <= 0) {
          return false;
        }
        console.log("passed fields check");
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {    // validate all the added communities 
          var isCommunityFormValid = $scope.project.communityDetails[i].selected.countries.length > 0 && $scope.project.communityDetails[i].selected.ages.length > 0 && Object.keys($scope.project.communityDetails[i].selected.respondents).length > 0 && $scope.project.communityDetails[i].selected.gender_text.length > 0;
          if (!isCommunityFormValid) {
            return false;
          } else {
            console.log("passed added communities check");
            $scope.saveCommunityInfo($scope.project.communityDetails[i].recordID);
          }
        }
        if ($scope.showCommunityForm) {    // validate new community form if it shows
          var isNewCommunityFormValid = $scope.newCommunityForm.selected.countries.length > 0 && $scope.newCommunityForm.selected.ages.length > 0 && Object.keys($scope.newCommunityForm.selected.respondents).length > 0 && $scope.newCommunityForm.selected.gender_text.length > 0 && $scope.newCommunityForm.showErrorFlag === false
          if (!isNewCommunityFormValid) {
            return false;
          } else {
            console.log("passed new community check");
            $scope.addCommunityToList();
          }
        }
        console.log("Ready for auto save");
        $scope.newProjectProgress.saveContinueBtn.disabled = '';
        return true;
      }
      /**
       * Cancel the interval
       */
      $scope.stopAutoSave = function() {
        if (angular.isDefined(save)) {
          $interval.cancel(save);
          save = undefined;
        }
      }
      /**
       * start the interval to auto save the new project form if it is complete or updated 
       */
      var save;
      $scope.autoSave = function() {
        save = $interval(function() {
            console.log("Entered autosave function");
            if ($scope.disabledButtons[0]) { //Cancel the interval after finish step 1
              $scope.stopAutoSave();
            }
            // do nothing when the dialogs show up or the new project form is invalid
            if ($('#custom-modal').length) {
              console.log("Project is unsaved. Please choose an option");
              return;
            } else if ($scope.showCopyProjectModal) {
              console.log("Project is unsaved. Please Choose an existing project");
              return;
            // } else if (!$scope.activateNextStep()) {
            } else if (!enableSave()) {
              console.log("Project is unsaved. Please complete the form");

              return;
            } else {
              if (!$scope.disabledButtons[0]) { // confirm if it is in step 1 before committing auto save
                // if ($scope.checkProjectDataChanges()) {
                  $scope.nextStep(true);
                // } else {
                //   console.log("Project is unsaved. No changes to the project");
                //   return;
                // }
              };
            }
          }, 60000);   //  Auto save is triggered every 60s
      }

      $scope.autoSave();    // start the interval function

      /**
       * Cancel the interval when leave this page
       */
      $scope.$on('$destroy', function() {
        $scope.stopAutoSave();
      })
      /****************************** End: Auto save of Step 1 of new project ********************************/


      $scope.nextStep = function(isAutoSave) {
        if ($scope.newProjectProgress.currentStep == 0) {
          if ($scope.newProjectProgress.saveContinueBtn.disabled == 'disabled') {
              document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
              $scope.modal.title = "Unauthorized Action Performed";
              $scope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
              $scope.modal.buttons.delete.show = false;
              $scope.modal.buttons.delete.fnc = "";
              $scope.modal.buttons.delete.params = "";
              document.getElementById("modal-root").style.display = 'block';
              document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
              $scope.modal.show = true;
          } else {
            if (isAutoSave) {   //  if it is auto save, skip the community unsaved check because the forms have been validated before this function is call 
              $scope.saveProject(isAutoSave);
            } else {
              if ($scope.activateNextStep()) {
                var unsavedComm = $scope.checkUnsavedCommunityCard();
                if (unsavedComm.found) {
                  $scope.warningCommunityInfoNotSaved();
                  $scope.newProjectProgress.saveContinueBtn.disabled = '';
                  console.log($scope.newProjectProgress);
                } else {
                  $scope.saveProject(isAutoSave);
                }
              } else {
                $scope.warningCommunityInfoNotSaved();
                $scope.newProjectProgress.saveContinueBtn.disabled = '';
                console.log($scope.newProjectProgress);
              }
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
          $scope.disabledButtons = [true, true, false];
          httpServerService.makeHttpRequest("projectQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID, "get").then(function(responseData) {
            if (responseData.status == 200) {
              console.log(responseData.data);

            } else {
              growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
            }

          });
          $scope.newProjectProgress.currentStep++;
        } else if ($scope.newProjectProgress.currentStep == 2) {
          if ($scope.newProjectProgress.submitProjectBtn.disabled == 'disabled') {
            document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
            $scope.modal.title = "Unauthorized Action Performed";
            $scope.modal.text = "You are not allowed perform the action you are trying. Please reload the page and follow instructions properly."
            $scope.modal.buttons.delete.show = false;
            $scope.modal.buttons.delete.fnc = "";
            $scope.modal.buttons.delete.params = "";
            document.getElementById("modal-root").style.display = 'block';
            document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
            $scope.modal.show = true;
          } else {
            $scope.disabledButtons = [true, true, false];

            $scope.newProjectProgress.previousBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
            $scope.newProjectProgress.saveContinueBtn.visible = false;
            $scope.newProjectProgress.saveContinueBtn.disabled = '';
            $scope.activateNextStep();
            console.log($scope.project);
            $scope.newProjectProgress.currentStep++;
          }

        }

        //$scope.newProjectProgress.currentStep++;
        /*for (var i = 0; i < $scope.disabledButtons.length; i++) {
          if (i === $scope.newProjectProgress.currentStep) {
            $scope.disabledButtons[i] = false;
          } else {
            $scope.disabledButtons[i] = true;
          }
        }*/
        $scope.activateNextStep();

      }

      $scope.prevStep = function() {
        console.log("PrevBtn: Current Step: " + $scope.newProjectProgress.currentStep);
        if ($scope.newProjectProgress.currentStep == 0) {

          /*$scope.newProjectProgress.previousBtn.visible = true;
           $scope.newProjectProgress.previousBtn.disabled = '';
           $scope.newProjectProgress.submitProjectBtn.visible = false;
           $scope.newProjectProgress.saveContinueBtn.visible = true;
           $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
          */
        } else if ($scope.newProjectProgress.currentStep == 1) {
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
        } else if ($scope.newProjectProgress.currentStep == 3) {
          $scope.newProjectProgress.previousBtn.visible = true;
          $scope.newProjectProgress.saveContinueBtn.visible = false;
          $scope.newProjectProgress.submitProjectBtn.visible = true;
        }
        $scope.newProjectProgress.currentStep--;
        for (var i = 0; i < $scope.disabledButtons.length; i++) {
          if (i === $scope.newProjectProgress.currentStep) {
            $scope.disabledButtons[i] = false;
          } else {
            $scope.disabledButtons[i] = true;
          }
        }
        $scope.activateNextStep();
      }

      /* ------------------------------------- [End] New Project Process Step Button ------------------------------------- */
      $scope.showModal = false;

    } /* ------------------------------------- [End] of init function ------------------------------------- */
    /**
     * the Function to show the new project options dialog
     */
    $scope.showOptionsModal = function() {
      ModalService.showModal({
        templateUrl: "views/modal_templates/newProjectSelect.html",
        controller: "dialogCtrl",
        inputs: {
          data: {}
        },
      }).then(function(modal) {
        modal.close.then(function(result) {
          if (result.result === 'copyFromOldProject') {
            $scope.copyFromOldProject();
          } else {
            $scope.startNewProject();
          }
        });
      });
    };

    function showCopyModal() {
      $scope.showCopyProjectModal = true;
      // document.getElementById("modal-choose-existing").style.display = 'block';
      // document.getElementById("modal-choose-existing").style.background = 'rgba(0,0,0,0.5)';
      // document.getElementById("modal-choose-existing").className = document.getElementById("modal-choose-existing").className.replace(' in', '');
      // document.getElementById("modal-choose-existing").className = document.getElementById("modal-choose-existing").className + " in";
    }

    function hideCopyModal() {
      $scope.showCopyProjectModal = false;
      // document.getElementById("modal-choose-existing").style.display = 'none';
      // document.getElementById("modal-choose-existing").className = document.getElementById("modal-choose-existing").className.replace(' in', '');
    }

    $scope.teamName = usersService.getUserObject().teamname;
    $scope.onChangeProjectName = function() {
      if ($scope.project.projectName.trim() == '') {
        $scope.fieldError.projectName = true;
      } else {
        $scope.fieldError.projectName = false;
      }
      $scope.activateCommunitySection();
      $scope.activateNextStep();
      $scope.checkForUnCompletedProcess();
    }

    $scope.onChangeProjectDescription = function() {
      if ($scope.project.projectDescription.trim() == '') {
        $scope.fieldError.projectDescription = true;
      } else {
        $scope.fieldError.projectDescription = false;
      }
      $scope.activateCommunitySection();
      $scope.activateNextStep();
      $scope.checkForUnCompletedProcess();
    }

    /* ------------------------------------- [Start] SideBar Code ------------------------------------- */
    $scope.sidebar_items = sideBarService.getSideBarItems();
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
    /* ------------------------------------- [End] SideBar Code ------------------------------------- */

    $scope.activateCommunitySection = function() {
      if ($scope.project.projectName.trim().length > 0 && $scope.project.projectDescription.trim().length > 0 && $scope.project.questions > 0) {
        document.getElementById("block-wrap").style.display = 'none';
      }
    }

    /* *
     * Method: updateSelectedCommunities
     * Parameters:
     * Description: This method invokes when community checkboxs are clicked and updated the currently selected community list.
     * */
    $scope.updateSelectedCommunities = function(recordID, index) {
      /*var communityIndex = $scope.project.communityDetails.map(function(item) {
        return item.recordID;
      }).indexOf(recordID);*/
      var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
      if(communityIndex<0){
        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
      }
      if (Object.keys($scope.project.communityDetails[communityIndex].selected.community).length > 0) {
        if ($scope.project.communityDetails[communityIndex].selected.community) {
          $scope.checkForUnCompletedProcess();
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
      }
      $scope.project.communityDetails[communityIndex].progress.age = '';
      $scope.project.communityDetails[communityIndex].progress.respondents = '';
      $scope.project.communityDetails[communityIndex].progress.gender = '';
      $scope.validateAddedCommunity(communityIndex);
      //$scope.activateNextStep();
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
     * Method: prepareCountries
     * Parameters: Added Community Index
     * Description: prepareCountries method will invoke when ever user checks or uncheck a country and create a string to display selected countries in summary
     * */
    $scope.prepareCountries = function(recordID, countryIndex, type) {
      var selected_countries = [],
        selected_countries_text = "",
        selected_countries_set = [];
      if (type == 'NewForm') {
        for (var i = 0; i < $scope.newCommunityForm.countries.length; i++) {
          $scope.newCommunityForm.countries[i].checked = false;
        }
        if(countryIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
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
        var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
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
      $scope.checkForUnCompletedProcess();
    };

    $scope.checkCountry = function(recordID, index, type) {
        if (type == 'NewForm') {
          $scope.newCommunityForm.selected.countries_text = $scope.newCommunityForm.countries[index].name;
          $scope.prepareCountries(0, index, 'NewForm');
        } else {
          var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
          if(communityIndex<0){
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          }
          $scope.project.communityDetails[communityIndex].selected.countries_text = $scope.project.communityDetails[communityIndex].countries[index].name;
          $scope.prepareCountries(recordID, index, '');
        }
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
        var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
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
      //$scope.activateNextStep();
      $scope.checkForUnCompletedProcess();
    }

    $scope.ageChecked = function(recordID, index, type) {
      if (type == 'NewForm') {
        if(index<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
        if($scope.newCommunityForm.ages[index].locked===false){
          if ($scope.newCommunityForm.ages[index].checked === true) {
            $scope.newCommunityForm.ages[index].checked = false;
          } else {
            $scope.newCommunityForm.ages[index].checked = true;
          }
          $scope.newCommunityForm.isSaved = false;
        }
      } else {
        var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
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
    }

    /* *
     * Method: toggleCommunityContainer
     * Parameters: Unique ID for each community which has added in the list
     * Description: This method will invoke when ever user clicks a community from the list of communities which has added shortly.
     * */
    $scope.toggleCommunityContainer = function(recordID) {
      var communityIndex = $scope.project.communityDetails.map(function(item) {
        return item.recordID;
      }).indexOf(recordID);
      if(communityIndex<0){
        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
      }

      var unsavedData = false,
        i;
      console.log($scope.project.communityDetails[communityIndex]);
      $scope.addMoreCommunity.disableBtn = '';
      if ($scope.project.communityDetails[communityIndex].editEnabled === true) {
        for (i = 0; i < $scope.project.communityDetails.length; i++) {
          //$scope.project.communityDetails[communityIndex].popup.open
          //if ($scope.project.communityDetails[i].disableSubmitBtn == 'disabled') {
          if ($scope.project.communityDetails[i].isSaved === false) {
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
          $timeout(function() {
            $scope.project.communityDetails[i].showErrorFlag = false;
          }, 10000);
        } else {
          for (i = 0; i < $scope.project.communityDetails.length; i++) {
            if ($scope.project.communityDetails[i].recordID == recordID) {
              if ($scope.project.communityDetails[i].showContainerFlag == true) {
                $scope.project.communityDetails[i].showContainerFlag = false;
                //$scope.project.communityDetails[index].animationClass = 'animated fadeOutUp';
              } else {
                $scope.project.communityDetails[i].showContainerFlag = true;
                // Restore the web service data in communityService
                console.log($scope.project.communityDetails[communityIndex]);
                console.log($scope.project.communityDetails[communityIndex].data);

                if ($scope.project.communityDetails[communityIndex].data.httpResponseData.communityList.length > 0) {
                  communityService.httpResponseData.communityList = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList;
                }
                if ($scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails.length > 0) {
                  communityService.saveHttpResponseData("CommunityDetails", $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails, $scope.project.communityDetails[communityIndex].selected.community.name);
                  //communityService.httpResponseData.communityDetails = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails;
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
                //communityService.httpResponseData.communityDetails = $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails;
                //$scope.project.communityDetails[index].animationClass = 'animated fadeInDown';
              }
            } else {
              $scope.project.communityDetails[i].showContainerFlag = false;
            }
          }
        }
        $scope.showCommunityForm = false;
      }
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
        if ($scope.showCommunityForm === true) {
          found = true;
          recordID = null;
        }
      }
      return {
        found: found,
        recordID: recordID
      }
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
      } else {
        $scope.project.communityDetails[comIndex].showErrorFlag = true;
        $scope.project.communityDetails[comIndex].errorMessage = "Please complete and save the changes, otherwise you will lose informaton.";
        $timeout(function() {
          $scope.project.communityDetails[comIndex].showErrorFlag = false;
        }, 10000);
      }

    }

    /* *
     * Method: respondentChanged
     * Parameters:
     * Description: This method will invoke when user change the number of respondent selection in both new form to add community and recently added communities.
     * */
    $scope.respondentChanged = function(recordID, index, type) {
      console.log("Respondents Changed: ");
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
            $scope.newCommunityForm.progress.gender = '';
            $scope.newCommunityForm.genderFlag = false;
          } else {
            $scope.newCommunityForm.errorMessage = '';
            $scope.newCommunityForm.showErrorFlag = false;
            $scope.newCommunityForm.progress.respondents = 'verified';
          }
        }
        $scope.newCommunityForm.isSaved = false;
      } else {
        //var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
        var communityIndex = $scope.project.communityDetails.map(function(item) {
          return item.recordID;
        }).indexOf(recordID);
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
        //console.log($scope.project.communityDetails[communityIndex].selected.ages + " - " + $scope.project.communityDetails[communityIndex].selected.respondents + " - " + $scope.project.communityDetails[communityIndex].selected.community.name);
        //console.log($scope.project.communityDetails[communityIndex].selected.ages);
        //console.log($scope.project.communityDetails[communityIndex].selected.respondents.number);
        if (Object.keys($scope.project.communityDetails[communityIndex].selected.respondents).length > 0) {
          if ($scope.project.communityDetails[communityIndex].selected.respondents) {

            communityService.filterGender($scope.project.communityDetails[communityIndex].selected.ages, $scope.project.communityDetails[communityIndex].selected.respondents.number, $scope.project.communityDetails[communityIndex].selected.community.name);
            $scope.project.communityDetails[communityIndex].gender = communityService.getGender();
            if(communityService.getLockedGenderFlag()){
              $scope.prepareGender(recordID, -1, '');
              $scope.project.communityDetails[communityIndex].progress.gender = 'verified';
              $scope.project.communityDetails[communityIndex].genderFlag = true;
            }else{
              $scope.project.communityDetails[communityIndex].selected.gender = [];
              $scope.project.communityDetails[communityIndex].selected.gender_text = "";
              $scope.project.communityDetails[communityIndex].genderFlag = true;
              $scope.project.communityDetails[communityIndex].progress.gender = '';
            }

            $scope.project.communityDetails[communityIndex].cost = $scope.getCommunityCost($scope.project.communityDetails[communityIndex].selected.respondents.number);
            //console.log(Number($scope.project.communityDetails[communityIndex].selected.respondents) + " - " + $scope.project.communityDetails[communityIndex].selected.respondents);
            if (Number($scope.project.communityDetails[communityIndex].selected.respondents.number) > 0) {
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
              //$scope.project.communityDetails[communityIndex].selected.respondents = null;
            }
          }
        }
        $scope.project.communityDetails[communityIndex].isSaved = false;
      }
      $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);

      //$scope.activateNextStep();
      $scope.checkForUnCompletedProcess();
    }

    $scope.calculateTotalRespondents = function() {
        // $scope.project.communityDetails
        var totalRespondents = 0;
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
          totalRespondents += $scope.project.communityDetails[i].selected.respondents.number;
        }
        if ($scope.newCommunityForm.selected.respondents.hasOwnProperty('number')) {
          totalRespondents += $scope.newCommunityForm.selected.respondents.number;
        }
        $scope.project.totalRespondents = totalRespondents;
        console.log("totalRespondents: " + $scope.project.totalRespondents);
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
       * Method: calculateTotalCost
       * Parameters:
       * Description: This method will invoke when user check or change 'number of respondents' radio button and when question number changes
       * */
      /*$scope.calculateTotalCost = function() {

        var cost = 0;
        if($scope.project.totalRespondents>0){
          for (var i = 0; i < $scope.priceTable.priceChar[$scope.project.totalRespondents].length; i++) {
            if ($scope.project.questions <= $scope.priceTable.priceChar[$scope.project.totalRespondents][i].max) {
              cost = $scope.priceTable.priceChar[$scope.project.totalRespondents][i].price;
              break;
            }
          }
        }
        $scope.project.cost = cost;

        //return cost;

        //var sum = 0,
          i = 0;
        //for (i = 0; i < $scope.project.communityDetails.length; i++) {
        //  sum += $scope.project.communityDetails[i].cost;
        //}
        //if ($scope.showCommunityForm === true && $scope.newCommunityForm.genderFlag === true) {
         // sum += $scope.newCommunityForm.cost;
        //}
        //$scope.project.cost = sum;
      }*/

    /* *
     * Method: questionSelectorChanged
     * Parameters:
     * Description: This method invokes when user changes number of questions selection in new project.
     * */
    $scope.questionSelectorChanged = function() {
      console.log(" ---- questionSelectorChanged ----");
      if ($scope.project.questions > 0) {
        $scope.fieldError.questions = false;
      } else {
        $scope.fieldError.questions = true;
      }
      if ($scope.project.communityDetails.length > 0) {
        for (var i = 0; i < $scope.project.communityDetails.length; i++) {
          if (Object.keys($scope.project.communityDetails[i].selected.respondents).length > 0) {
            $scope.project.communityDetails[i].cost = $scope.getCommunityCost($scope.project.communityDetails[i].selected.respondents.number);
          }
        }
      }
      //if ($scope.newCommunityForm.selected.respondents != "") {
      if (Object.keys($scope.newCommunityForm.selected.respondents).length > 0) {
        $scope.newCommunityForm.cost = $scope.getCommunityCost($scope.newCommunityForm.selected.respondents.number);
      }
      $scope.activateCommunitySection();
      $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
      $scope.activateNextStep();
      $scope.checkForUnCompletedProcess();
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
      $scope.checkForUnCompletedProcess();
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
        var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
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
      $scope.checkForUnCompletedProcess();
    }

    $scope.genderChecked = function(recordID, index, type) {
        if (type == 'NewForm') {
          if(index<0){
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          }
          if ($scope.newCommunityForm.gender[index].selected === true) {
            $scope.newCommunityForm.gender[index].selected = false;
          } else {
            $scope.newCommunityForm.gender[index].selected = true;
          }
          $scope.newCommunityForm.isSaved = false;
        } else {
          var communityIndex = $scope.getArrayIndexByCommunityRecordID(recordID);
          if(communityIndex<0){
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          }
          if ($scope.project.communityDetails[communityIndex].gender[index].selected === true) {
            $scope.project.communityDetails[communityIndex].gender[index].selected = false;
          } else {
            $scope.project.communityDetails[communityIndex].gender[index].selected = true;
          }
        }
        $scope.prepareGender(recordID, index, type);
        //$scope.activateNextStep();
      }
      /* *
       * Method: validateAddedCommunity
       * Parameters: Community Index in @newProject
       * Description: This method will invoke when user change any information in any of the recently added community.
       * */
    $scope.validateAddedCommunity = function(communityIndex) {
        if(communityIndex<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
        if ($scope.project.communityDetails[communityIndex].selected.countries.length > 0 && $scope.project.communityDetails[communityIndex].selected.ages.length > 0 && Object.keys($scope.project.communityDetails[communityIndex].selected.respondents).length > 0 && $scope.project.communityDetails[communityIndex].selected.gender_text.length > 0) {
          $scope.project.communityDetails[communityIndex].disableSubmitBtn = '';
          //$scope.addMoreCommunity.disableBtn = '';
          $scope.project.communityDetails[communityIndex].validated = true;
        } else {
          //$scope.addMoreCommunity.disableBtn = 'disabled';
          $scope.project.communityDetails[communityIndex].disableSubmitBtn = 'disabled';
          $scope.project.communityDetails[communityIndex].validated = false;
          $scope.project.communityDetails[communityIndex].popup.open = true;
          $scope.project.communityDetails[communityIndex].popup.type = 'Error';
          $scope.project.communityDetails[communityIndex].popup.message = 'Please complete and save the changes, otherwise you will lose informaton.';
        }
        //$scope.activateNextStep();
      }
      /* *
       * Method: validateNewCommunityForm
       * Parameters:
       * Description: This method will invoke when user change any information in any of the recently added community.
       * */
    $scope.validateNewCommunityForm = function() {
      if ($scope.newCommunityForm.selected.countries.length > 0 && $scope.newCommunityForm.selected.ages.length > 0 && Object.keys($scope.newCommunityForm.selected.respondents).length > 0 && $scope.newCommunityForm.selected.gender_text.length > 0 && $scope.newCommunityForm.showErrorFlag === false) {
        $scope.newCommunityForm.disableSubmitBtn = '';
        $scope.newCommunityForm.validated = true;
      } else {
        $scope.newCommunityForm.disableSubmitBtn = 'disabled';
        $scope.newCommunityForm.validated = false;
      }
      //$scope.activateNextStep();
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

        //var newCommunity = {
        //recordID: $scope.generateUniqueID(),
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
        newCommunity.isSaved = true;
        newCommunity.progress.country = $scope.newCommunityForm.progress.country;
        newCommunity.progress.age = $scope.newCommunityForm.progress.age;
        newCommunity.progress.respondents = $scope.newCommunityForm.progress.respondents;
        newCommunity.progress.gender = $scope.newCommunityForm.progress.gender;
        newCommunity.showContainerFlag = false;
        newCommunity.editEnabled = true;
        newCommunity.disableEditBtn = '';
        newCommunity.showEditBtn = true;
        newCommunity.disableDeleteBtn = '';
        newCommunity.showDeleteBtn = true;
        newCommunity.isSaved = true;

        console.log("--- New Project --");
        $scope.project.communityDetails.push(newCommunity);
        $scope.resetNewCommunityForm();
        $scope.showCommunityForm = false;
        $scope.addMoreCommunity.disableBtn = '';
        console.log($scope.project.communityDetails);
        console.log("--- --- Progress  ---");
        console.log($scope.newProjectProgress);
        $scope.project.communitiesAdded = $scope.project.communityDetails.length;
        $scope.activateNextStep();
      }
    }



    $scope.prepareToDelete = function(recordID) {
        var index = $scope.project.communityDetails.map(function(item) {
          return item.recordID;
        }).indexOf(recordID);
        if(index<0){
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
        document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
        $scope.modal.title = "Delete Community";
        $scope.modal.text = "Are you sure you want to delete " + $scope.project.communityDetails[index].selected.community.name + " from your project?"
        document.getElementById("modalText").innerHTML = $scope.modal.text;
        $scope.modal.buttons.delete.show = true;
        $scope.modal.buttons.custom.show = false;
        $scope.modal.buttons.confirm.show = false;
        $scope.modal.buttons.cancel.show = true;
        $scope.modal.buttons.delete.fnc = "deleteCommunityFromProject";
        $scope.modal.buttons.delete.params = "'" + index + "'";
        document.getElementById("modal-root").style.display = 'block';
        document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
        $scope.modal.show = true;
        //$scope.activateNextStep();
      }
      /* *
       * Method: deleteCommunityFromProject
       * Parameters:  Unique ID for each recently added community
       * Description: This method will invoke when user deletes recently added community from the project
       * */
    $scope.deleteCommunityFromProject = function(recordIndex) {
      //loadingDialogService.showDefaultErrorMessage("You have successfully deleted the <b>"+$scope.project.communityDetails[recordIndex].selected.community.name+"</b> community from this project.", true, 5000);
      var notificationText = "You have successfully deleted the <b>"+$scope.project.communityDetails[recordIndex].selected.community.name+"</b> community from this project.";
      $scope.project.communityDetails.splice(recordIndex, 1);
      growl.info(notificationText,{ttl: 5000});
      $scope.project.communitiesAdded = $scope.project.communityDetails.length - 1;
      console.log("Len:" + $scope.project.communityDetails.length + " " + $scope.project.communitiesAdded);
      if ($scope.project.communityDetails.length == 0) {
        console.log("communityService.httpResponseData.communityList: ");
        console.log(communityService.httpResponseData);
        communityService.parseDataGetCommunityList(communityService.httpResponseData.communityList.communities);
        var comObj = communityService.getCommunityDetailsObject();
        comObj.countries = communityService.getCountries();
        $scope.project.communityDetails.push(comObj);
        $scope.addMoreCommunity.disableBtn = 'disabled';
      }
      $scope.project.communitiesAdded = $scope.project.communityDetails.length;
      $scope.calculateTotalRespondents();
      $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
      $scope.modal.show = false;
      $scope.resetModal();
      $scope.activateNextStep();
      if($scope.projectID!=null){
        $scope.checkProjectDataChanges();
      }
    }

    /* *
     * Method: saveCommunityInfo
     * Parameters: Unique ID for each recently added community
     * Description: This method will invoke when user saves the updates in any recently added community
     * */
    $scope.saveCommunityInfo = function(recordID) {
      console.log("--------- Save Community Info -----------");
      var communityIndex = $scope.project.communityDetails.map(function(item) {
        return item.recordID;
      }).indexOf(recordID);
      if(communityIndex<0){
        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
      }
      console.log($scope.project.communityDetails[communityIndex]);
      $scope.project.communityDetails[communityIndex].showSuccessMessage = true;
      $scope.project.communityDetails[communityIndex].showErrorFlag = false;
      $scope.project.communityDetails[communityIndex].data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
      $scope.project.communityDetails[communityIndex].data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", $scope.project.communityDetails[communityIndex].selected.community.name);
      $scope.project.communityDetails[communityIndex].data.parsedData.communityList = communityService.getCommunityList();
      $scope.project.communityDetails[communityIndex].data.parsedData.countries = communityService.getCountries();
      $scope.project.communityDetails[communityIndex].data.parsedData.ageRanges = communityService.getAgeRanges();
      $scope.project.communityDetails[communityIndex].data.parsedData.gender = communityService.getGender();
      $scope.project.communityDetails[communityIndex].data.parsedData.respondents = communityService.getRespondents();

      $scope.addMoreCommunity.showBtn = true;
      $scope.addMoreCommunity.disableBtn = '';
      $scope.project.communitiesAdded = $scope.project.communityDetails.length + 1;
      $scope.project.communityDetails[communityIndex].editEnabled = true;
      $scope.project.communityDetails[communityIndex].disableEditBtn = '';
      $scope.project.communityDetails[communityIndex].showEditBtn = true;
      $scope.project.communityDetails[communityIndex].disableDeleteBtn = '';
      $scope.project.communityDetails[communityIndex].showDeleteBtn = true;
      $scope.project.communityDetails[communityIndex].isSaved = true;
      $scope.addMoreCommunity.disableBtn = '';
      $timeout(function() {
        $scope.project.communityDetails[communityIndex].showSuccessMessage = false;
        $scope.project.communityDetails[communityIndex].showContainerFlag = false;
      }, 2000);
      $timeout(function() {
        $scope.project.communityDetails[communityIndex].showErrorFlag = false
      }, 10000);
      //$timeout(function(){$scope.project.communityDetails[communityIndex].showContainerFlag = false}, 5500);
      $scope.activateNextStep();
    }

    /* *
     * Method: resetNewCommunityForm
     * Parameters:
     * Description: This method will invoke when user add a community to a project and reset the add more community form
     * */
    $scope.resetNewCommunityForm = function() {
      $scope.newCommunityForm = communityService.createNewCommunityFormObject();
      $scope.newCommunityForm.countries = communityService.getCountries();
      $scope.showCommunityForm = false;
      $scope.addMoreCommunity.disableBtn = '';
      $scope.activateNextStep();
    }

    $scope.agreedTerms = function() {
        console.log($scope.project.agreedTerms);
        if ($scope.project.agreedTerms === true) {
          $scope.newProjectProgress.submitProjectBtn.disabled = '';
          document.getElementById("confirmation").style.borderColor = '#255d95';
        } else {
          $scope.newProjectProgress.submitProjectBtn.disabled = 'disabled';
          document.getElementById("confirmation").style.borderColor = '#a7a7a7';
        }
        $scope.activateNextStep();
      }
      /* *
       * Method: getArrayIndexByCommunityRecordID
       * Parameters:
       * Description: This method will find the index of any recently added community by community record id
       * */
    $scope.getArrayIndexByCommunityRecordID = function(recordID) {
      var index = 0;
      for (var i = 0; i < $scope.project.communityDetails.length; i++) {
        if ($scope.project.communityDetails[i].recordID == recordID) {
          index = i;
          break;
        }
      }
      return index;
    }

    //$scope.uploadedImages = [];  // store the uploaded files in angular js variable
    $scope.imageUploadFlags = {
      count: 0,
      error: false,
      message: ""
    };

    $scope.videoUploadFlags = {
      count: 0,
      error: false,
      message: ""
    };

    $scope.resetImageUploadErrorFlags = function() {
      $scope.imageUploadFlags.error = false;
      $scope.imageUploadFlags.message = "";

    }

    $scope.resetVideoUploadErrorFlags = function() {
      $scope.videoUploadFlags.error = false;
      $scope.videoUploadFlags.message = "";

    }

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
        $scope.resetImageUploadErrorFlags();
      } else {
        $scope.imageUploadFlags.error = true;
        $scope.imageUploadFlags.message = "The picture is already attached.";
      }

    }

    //$scope.uploadedDocs = [];  // store the uploaded files in angular js variable
    /*$scope.docUploadFlags = {
      uploadBtnClass: "btn-default",
      browseBtnClass: "btn-primary",
      count: 0,
      error: false,
      message: ""
    };*/

    /* Watch the attached files for type checking
    $scope.$watch('file', function(newVal, oldVal) {
      console.log("Attached Questionnaire Document:" + newVal);
      var sz_mb = 0;
      if (newVal != undefined && typeof (newVal.size) != 'undefined' ) {
        if(newVal.size>0){
          var fileValid = false;
          sz_mb = newVal.size / (1024 * 1024);
          if (sz_mb > 10) { // Step 1: check the file size
            $scope.uploadOption.qDocument.error = true;
            $scope.uploadOption.qDocument.message = "Attached file exceeds 10MB in size, please upload a smaller one.";
            return null;
          } else { // Step 2: check file type
            if (newVal.type !== "") { // when the file to be upload is a ms office file(e.g. '.doc', '.docx', '.xls'), the type is '', thus Mimetype check doesn't apply
              fileValid = $scope.isValidMimeType("document", newVal.type);
            } else { // when the Mimetype check doesn't apply, check the file extension name instead
              var ext = newVal.name.substr(newVal.name.lastIndexOf('.') + 1);
              fileValid = $scope.isValidExtensionName("document", ext);
            }
          }
        }else{
          sz_mb = 0;
          fileValid = false;
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
          if(sz_mb==0 || sz_mb===false){
            $scope.uploadOption.qDocument.message = "Unable to attach the selected file. Please try with another file.";
          }else{
            $scope.uploadOption.qDocument.message = "Attached file is not supported. Please upload document with following file formats: .doc, .docx, .odt, .rtf, .pdf";
          }
        }

        if (detectIEService.detectIE()) { // IE version number or false
          $scope.docName = newVal.name;
        }
      } else {
        $scope.uploadOption.qDocument.error = false;
        $scope.uploadOption.qDocument.message = null;
        if($scope.hasOwnProperty('uploadOption')){
          $scope.uploadOption.qDocument.buttonDisabled = true;
        }

        if ($scope.docName) {
          $scope.docName = null;
        }
      }
      console.log(newVal);
    }, true); */
    $scope.qDocFileChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){
      var fileObj = {}, z_mb = 0, fileValid = true;
      if(files != null &&  invalidFiles != null){
        if(typeof(files) != 'undefined' && files != null && files != ''){
          if(files.length > 0){
            $scope.file = files[0];
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

    $scope.resetQDocAttachment = function(){
      $scope.uploadOption.qDocument.valid = false;
      $scope.uploadOption.qDocument.buttonDisabled = true;
      $scope.uploadOption.qDocument.showQuestionnaire = false;
      $scope.uploadOption.qDocument.questionnaire = "";
      $scope.file = false;
      $scope.docName = "";
      $scope.uploadOption.qDocument.error = false;
      $scope.uploadOption.qDocument.message = "";
      $scope.uploadOption.qDocument.uploadBtnClass = "btn-default";
      $scope.uploadOption.qDocument.browseBtnClass = "btn-primary";
    }

    /*$scope.$watch('imageFile', function(newVal, oldVal) {
      console.log("Attached Image File:" + newVal);

      if (newVal != undefined && typeof (newVal.size) != 'undefined' ) {
        if (newVal.size > 0) {
          var fileValid = false, sz_mb;
          sz_mb = newVal.size / (1024 * 1024);
          if (sz_mb > 10) { // Step 1: check the fil
            $scope.uploadOption.image.buttonDisabled = true;
            $scope.imageUploadFlags.error = true;
            if (!$scope.isValidMimeType("image", newVal.type)) {
              $scope.imageUploadFlags.message = "Attached file is not supported. Please upload document with following file formats: .jpg, .jpeg, .png, .bmp, .gif, .tiff, .tif ";
            } else {
              $scope.imageUploadFlags.message = "Attached image exceeds 10MB in size, please upload a smaller one.";
            }
          } else {
            $scope.uploadOption.image.valid = true;
            $scope.uploadOption.image.buttonDisabled = false;
            $scope.resetImageUploadErrorFlags();
          }
          if (detectIEService.detectIE()) { // IE version number or false
            $scope.imageName = newVal.name;
          }
        }else{
          $scope.uploadOption.image.buttonDisabled = true;
          $scope.imageUploadFlags.error = true;
          $scope.imageUploadFlags.message = "Unable to attach the selected file. Please try with another file.";
        }
      }else{
        $scope.imageUploadFlags.error = false;
        $scope.imageUploadFlags.message = null;
        if($scope.hasOwnProperty('uploadOption')){
          $scope.uploadOption.image.buttonDisabled = true;
        }
        if ($scope.imageName) {
          $scope.imageName = null;
        }
      }

    }, true);*/

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

    $scope.videoFileChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){
      var fileObj = {}, z_mb= 0, fileValid = true;
      if(files != null &&  invalidFiles != null){
        if(typeof(files) != 'undefined' && files != null && files != ''){
          if(files.length > 0){
            $scope.videoFile = files[0];
            $scope.videoName = files[0].name;
            console.log($scope.videoName);
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
            fileValid = sharedService.isValidMimeType("video", fileObj.type);
          } else { // when the Mimetype check doesn't apply, check the file extension name instead
            var ext = fileObj.name.substr(fileObj.name.lastIndexOf('.') + 1);
            fileValid = sharedService.isValidExtensionName("video", ext);
          }
        }

        if(fileObj != null && fileValid === true && z_mb <= 200){
          $scope.uploadOption.video.valid = true;
          $scope.uploadOption.video.buttonDisabled = false;
          $scope.uploadOption.video.removeBtn = true;
          $scope.resetVideoUploadErrorFlags();
          $scope.uploadOption.video.browseBtnClass = "btn-default";
          $scope.uploadOption.video.uploadBtnClass = "btn-primary"
          $scope.uploadOption.video.removeBtn = true;
        }else{
          $scope.uploadOption.video.browseBtnClass = "btn-primary";
          $scope.uploadOption.video.uploadBtnClass = "btn-default"
          $scope.uploadOption.video.buttonDisabled = true;
          $scope.uploadOption.video.removeBtn = false;
          $scope.videoUploadFlags.error = true;
          $scope.videoUploadFlags.message = "Something wrong happened. Please try again with another file";
          if(fileValid===false){
            $scope.videoUploadFlags.message = "Attached file is not supported. Please upload document with following file formats: .MOV .MPEG4 .MP4 .AVI .WMV .MPEGPS .FLV .3GPP .WEBM ";
            $scope.uploadOption.video.removeBtn = true;
          }else{
            if(z_mb>200){
              $scope.videoUploadFlags.message = "Attached video exceeds 200MB in size, please upload a smaller one.";
              $scope.uploadOption.video.removeBtn = true;
            } else if(z_mb==0 || z_mb===false){
              $scope.uploadOption.video.removeBtn = false;
              $scope.videoFile = null;
              $scope.videoName = null;
              $scope.videoUploadFlags.message = "Unable to attach the selected file. Please try with another file.";
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
      $scope.imageName = "";
      $scope.imageUploadFlags.error = false;
      $scope.imageUploadFlags.message = "";
    }

    $scope.resetVideoAttachment = function(){
      $scope.uploadOption.video.browseBtnClass = "btn-primary";
      $scope.uploadOption.video.uploadBtnClass = "btn-default"
      $scope.uploadOption.video.valid = false;
      $scope.uploadOption.video.buttonDisabled = true;
      $scope.uploadOption.video.removeBtn = false;
      $scope.videoFile = false;
      $scope.videoName = "";
      $scope.videoUploadFlags.error = false;
      $scope.videoUploadFlags.message = "";
    }
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

      //console.log(file);
      //console.log($scope.project.uploadedDocs);

      $scope.activateNextStep();
    }
    $scope.onChangeQdocDescription = function(index) {
        if ($scope.project.uploadedDocs[index].note.trim() != '') {
          $scope.project.uploadedDocs[index].emptyNote = false;
        } else {
          $scope.project.uploadedDocs[index].emptyNote = true;
        }
        $scope.activateNextStep();
    }


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
          $scope.uploadOption.image.removeBtn = false;
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
          $scope.imageUploadFlags.message = "Sorry, Sorry, Something unexpected happened, please contact support@validateit.com.";
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
          growl.info("You have successfully deleted your questionnaire from this project.", {
            ttl: 5000
          });
          $scope.project.uploadedDocs.splice(fileIndex, 1);
          $scope.uploadOption.qDocument.count--;
          $scope.project.uploadDocumentFlag = true;
          $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
          setTimeout(function() {
            loadingDialogService.hideProcessingPleaseWait();
          }, 500);
        } else {
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          console.log(responseData);
          setTimeout(function() {
            loadingDialogService.hideProcessingPleaseWait();
          }, 500);
        }
      });


    }


    /* *
     * Method: saveProject
     * Parameters:
     * Description: Prepare an object with new project information and make a web service call to create new project.
     * Note: Document and Images are not part of this function.
     * */
    $scope.saveProject = function(isAutoSave) {
      console.log("---------- Save Project -----------");

      if ($scope.newProjectProgress.currentStep == 2) {
        loadingDialogService.showProcessingPleaseWait('Submitting project. Please wait...');
        $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
        httpServerService.makeHttpRequest("projectState", "post", {
          teamName: usersService.getUserObject().teamname,
          projectId: $scope.projectID,
          notes: $scope.project.notes
        }).then(function(responseData) {
          if (responseData.status == 200) {
            console.log("Success!!!");
            console.log(responseData);
            //sharedService.setProjectFlag('isCreated');
            //sharedService.setProjectRedirectedTo(true);
            //sharedService.setProjectID($scope.projectID);
            growl.info("Your project <b>"+$scope.project.projectName+"</b> has been successfully submitted.", {
              ttl: 2500
            });

            $timeout(function() {
              $scope.changePath('/#/project_details/'+$scope.projectID);
            }, 2500);
            //sharedService.setNotification({type:'success', message:'You have successfully completed creating a new project.', ttl:10000});
            setTimeout(function() {
              loadingDialogService.hideProcessingPleaseWait();
            }, 500);

          } else {
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
            console.log("Error : ");
            console.log(responseData);
            setTimeout(function() {
              loadingDialogService.hideProcessingPleaseWait();
            }, 500);
          }
        });
      } else {
        if (isAutoSave) {
          loadingDialogService.autoSaveNotification(true);
        }
        var ws_url = "project",
          countries = [],
          age = {},
          gender = {},
          temp, i, j;
        if ($scope.newProjectFlag === false) {
          ws_url = "projectFromExisting?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.projectID;
        }
        var insertData = {
          teamname: usersService.getUserObject().teamname,
          projectname: $scope.project.projectName,
          projectdescription: $scope.project.projectDescription,
          numquestions: $scope.project.questions,
          projectcost: $scope.project.cost,
          communities: []
        }
        for (i = 0; i < $scope.project.communityDetails.length; i++) {
          var countries = [],
            age = {},
            gender = {};
          for (j = 0; j < $scope.project.communityDetails[i].selected.countries.length; j++) {
            countries.push($scope.project.communityDetails[i].selected.countries[j].name);
          }
          for (j = 0; j < $scope.project.communityDetails[i].ages.length; j++) {
            temp = "age_" + $scope.project.communityDetails[i].ages[j].ageRange.replace("-", "_");
            if (temp == 'age_65+') {
              temp = 'age_65_plus';
            }
            if ($scope.project.communityDetails[i].ages[j].checked === true) {
              age[temp] = true;
            } else {

              age[temp] = false;
            }
          }
          for (j = 0; j < $scope.project.communityDetails[i].gender.length; j++) {
            if ($scope.project.communityDetails[i].gender[j].selected === true) {
              gender[$scope.project.communityDetails[i].gender[j].name.toLowerCase()] = 100;
            } else {
              gender[$scope.project.communityDetails[i].gender[j].name.toLowerCase()] = 0;
            }
          }
          insertData.communities.push({
            communityname: $scope.project.communityDetails[i].selected.community.name,
            communitydescription: $scope.project.communityDetails[i].selected.community.description,
            ageselection: age,
            respondents: $scope.project.communityDetails[i].selected.respondents.number,
            country: countries,
            province: [],
            region: [],
            gender: gender
          });
        }
        console.log(insertData);

        if ($scope.newProjectFlag === true && $scope.projectID != null) {
          ws_url += "?projectId=" + $scope.projectID;
        }

        if (isAutoSave) {
          //var notificationText = "Auto saving...";
          //growl.info(notificationText,{ttl: 2000});
          loadingDialogService.autoSaveNotification(false);
        } else {
          loadingDialogService.showProcessingPleaseWait('Submitting project. Please wait...');
        }

        httpServerService.makeHttpRequest(ws_url, "post", insertData).then(function(responseData) {
          if (responseData.status == 200) {
            // success
            $scope.resetCurrentPageVars();
            $rootScope.unCompletedProcessOnCurrentPage = false;
            $scope.updateProjectOrg($scope.project);
            console.log(" **** SUCCESS ****");
            console.log(responseData);

            if (responseData.data.hasOwnProperty('projectId')) {
              $scope.projectID = responseData.data.projectId;
              $scope.newProjectFlag = true;
            }
            httpServerService.makeHttpRequest("projectQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + responseData.data.projectId, "get").then(function(responseFiles) {
              if (responseFiles.status == 200) {
                if (Object.keys(responseFiles.data.questionData).length > 0) {
                  for (var key in responseFiles.data.questionData) {
                    $scope.pushAttachemntToUploadedImageList({
                      file: null,
                      name: key.toString(),
                      note: '',
                      link: responseFiles.data.questionData[key].url,
                      emptyNote: false,
                      error: ''
                    });
                  }
                  $scope.resetImageUploadErrorFlags();
                }
                if (Object.keys(responseFiles.data.questionDoc).length > 0) {
                  for (key in responseFiles.data.questionDoc) {
                    $scope.pushAttachemntToUploadedDocList({
                      file: null,
                      name: key.toString(),
                      note: '', //(responseData.hasOwnProperty('data') ? responseData.data.questiondoc.description: ''),
                      link: responseFiles.data.questionDoc[key],
                      emptyNote: false,
                      error: ''
                    });
                  }
                }
              }
            });

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
            $scope.uploadOption.image.buttonDisabled = true;
            $scope.newProjectProgress.previousBtn.visible = true;
            $scope.newProjectProgress.submitProjectBtn.visible = false;
            $scope.newProjectProgress.saveContinueBtn.visible = true;
            console.log("projectID: " + $scope.projectID);
            console.log("newProjectFlag: " + $scope.newProjectFlag);
            console.log($scope.project);

            if (!isAutoSave) {
              $scope.newProjectProgress.saveContinueBtn.disabled = 'disabled';
              $scope.newProjectProgress.currentStep++;
              $scope.disabledButtons = [true, false, true];
            }

          } else {
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
            console.log(" **** Failed ****");
            //alert("Something is wrong.");
            $scope.disabledButtons = [false, true, true];
            console.log(responseData);
            $scope.resetModal();
            document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
            $scope.modal.show = false;
            $scope.modal.title = "Warning";
            $scope.modal.text = "Something unexpected happened, please contact support@validateit.com."
            $scope.modal.buttons.delete.show = false;
            $scope.modal.buttons.delete.fnc = "";
            $scope.modal.buttons.delete.params = "";
            document.getElementById("modal-root").style.display = 'block';
            //document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
            document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
            $scope.modal.show = true;
            $scope.newProjectProgress.saveContinueBtn.disabled = "";


          }
          setTimeout(function() {
            loadingDialogService.hideProcessingPleaseWait();
          }, 500);

        });
        $scope.resetImageUploadErrorFlags();
      }
      //communityService.setNewProject($scope.project);
      //$scope.changePath('/#/project_overview');
    }

    $scope.warningCommunityInfoNotSaved = function() {
      //var comIndex = $scope.project.communityDetails.map(function(item) { return item.recordID; }).indexOf(unsavedComm.recordID);
      $scope.modal.show = false;
      document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
      $scope.modal.title = "Unsaved community information";
      $scope.modal.text = "You haven't saved community information. Please save community information first to proceed to next step.";
      $scope.modal.buttons.delete.show = false;
      $scope.modal.buttons.custom.show = false;
      $scope.modal.buttons.confirm.show = true;
      $scope.modal.buttons.confirm.text = "Ok";
      $scope.modal.buttons.confirm.fnc = "closeModal";
      $scope.modal.buttons.confirm.params = "";
      $scope.modal.buttons.cancel.show = true;

      document.getElementById("modal-root").style.display = 'block';
      document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
      $scope.modal.show = true;
      $scope.newProjectProgress.saveContinueBtn.disabled = '';
    }


    $scope.reDirectTo = function(url) {
      if (url != null && url != 'undefined') {
        if ($scope.modal.show == true) {
          $scope.modal.show = false;

          $scope.resetModal();
        }
        //$scope.changePath(url);
      }
    }
    $scope.modal = {
      show: false,
      title: "Delete Community",
      text: "You are about to delete community from the project. Are you sure?",
      buttons: {
        delete: {
          show: true,
          text: "Delete",
          fnc: "deleteCommunityFromProject",
          params: "12345667"
        },
        cancel: {
          show: true,
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
          params: ""
        }
      }
    }
    $scope.closeModal = function() {
      $scope.modal.show = false;
      $scope.resetModal();

    }
    $scope.modalAction = function(action, params) {
      if (typeof(params) != 'undefined' && params != null) {
        $scope.$eval(action + "(" + params + ")");
      } else {
        $scope.$eval(action);
      }

    }
    $scope.resetModal = function() {
      $scope.modal.show = false;
      $scope.modal.title = "";
      $scope.modal.text = "";
      $scope.modal.buttons.delete.params = "";
      $scope.modal.buttons.cancel.params = "";
      $scope.modal.buttons.custom.show = false;
      $scope.modal.buttons.custom.test = "";
      $scope.modal.buttons.custom.fnc = "";
      $scope.modal.buttons.custom.params = "";
      $scope.modalOnClose.callingFunc = '';
      $scope.modalOnClose.data = {};
      document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
      document.getElementById("modal-root").style.display = 'none';
      console.log($scope.newProjectProgress);
    }

    /*$scope.addSpecialWarnMessage = function() {
      growl.warning("This adds a warn message 1",{ttl: 5000});
      growl.warning("This adds a warn <a href='#fsdfsadfsf'>message 2</a>",{ttl: 5000});
      growl.warning("This adds a warn message 3",{ttl: 5000});
      growl.info("This adds a info message"),{ttl: 5000};
      growl.info("This adds a success message",{ttl: 5000});
      growl.error("This adds a error message");
      growl.custom("This Custom Message");
    }*/
    $scope.resetProjectObject = function() {
      $scope.project = communityService.createProjectObject();
      $scope.project.communityDetails[0].countries = communityService.getCountries();
    }

    /* Copy Project */
    $scope.showNewProjectOptions = function() {
      $scope.resetProjectObject();
      $scope.resetNewCommunityForm();
      $scope.modalOnClose.callingFunc = 'focusProjectName';
    }

    $scope.startNewProject = function() {
      $scope.resetProjectObject();
      $scope.resetNewCommunityForm();
      $scope.newProjectFlag = true;

      hideCopyModal();

      $scope.focusProjectName();
    }

    $scope.copyFromOldProject = function() {

      showCopyModal();

      $scope.projectListError = false;

      var teamname = usersService.getUserObject().teamname;
      var url = "projectsummary?teamName=" + teamname + "&status=C"; // fetch the existing projects list
      httpServerService.makeHttpRequest(url, "get")
        .then(function(response) {
          if(response.status == 200){
            console.log("---- copyFromOldProject ----");
            console.log(response.data);
            var existingProjectData = response.data;
            if ((typeof(existingProjectData) !== 'undefined' && existingProjectData !== null)) {

              $scope.existingProjects = existingProjectData;

              if ($scope.existingProjects.length > 0) {
                $scope.chosenProject = $scope.existingProjects[0];
                $scope.chosenProjectIndex = 0;
                $scope.clickedProject(0);
              } else {
                $scope.projectListError = true;
                $scope.projectsFetchMsg = "There is no existing projects";
              }

            } else {
              $scope.projectListError = true;
              $scope.projectsFetchMsg = "Cannot fetch existing projects list";
            }
          }else{
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          }
        }, function(response) {
          $scope.projectListError = true;
          $scope.projectsFetchMsg = "Cannot fetch existing projects list";
        });

      // More work to do
    }

    $scope.clickedProject = function(index) {

      httpServerService.makeHttpRequest("projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.existingProjects[index].projectId, "get").then(function(response) {
        if (response.status == 200) {
          if (response.data.communities.length > 0) {
            var projectCommunityDetails = new Object();
            for (var i = 0; i < response.data.communities.length; i++) {
              projectCommunityDetails[response.data.communities[i].communityname] = httpServerService.makeHttpRequest("subCommunityList?teamName=" + usersService.getUserObject().teamname + "&communityName=" + response.data.communities[i].communityname, "get");
            }
            $q.all(projectCommunityDetails).then(function(arrayOfResults) {
              console.log(" All Responses ***");
              console.log(arrayOfResults);
              for (var key in arrayOfResults) {
                if (arrayOfResults.hasOwnProperty(key)) {
                  if (arrayOfResults[key].status == 200) {
                    if (key === 'files') {
                      console.log(arrayOfResults[key]);
                    } else {
                      communityService.setCommunityDetails(arrayOfResults[key].data, key);
                    }
                  }
                }
              }
              $scope.chosenProject = $scope.existingProjects[index];
              $scope.chosenProject.projectId = $scope.existingProjects[index].projectId;
              $scope.chosenProjectIndex = index;
            });
          }


        }else{
          growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        }
      });

      // get project documents

      // $scope.chosenProjectID = $scope.existingProjects[index].projectID;
    }

    $scope.copyProject = function() {

      var url = "projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.chosenProject.projectId; // fetch the selected project
      httpServerService.makeHttpRequest(url, "get")
        .then(function(response) {
          if(response.status == 200){
            $rootScope.unCompletedProcessOnCurrentPage = true;
            $rootScope.currentPage.action = "Uncompleted Step 1";
            $rootScope.currentPage.msgTitle = "<b>Warning:</b> <b>New Project</b> ?";
            $rootScope.currentPage.onChangeMsg = "<p>You are about to leave new project page. If you leave then all unsaved data of this project will be lost which are not recoverable.</p>";
            $rootScope.currentPage.onChangeMsg += "<p>Are you sure ?</p>";
            console.log("----- Copy Project -----");
            console.log("## seleted project response: ");
            console.log(response);

            var selectedProjectData = response.data;

            if ((typeof(selectedProjectData) !== 'undefined' && selectedProjectData !== null)) {
              $scope.projectID = selectedProjectData.projectId;
              $scope.project.projectName = selectedProjectData.projectname;
              $scope.project.projectDescription = selectedProjectData.projectdescription;
              $scope.project.questions = selectedProjectData.numquestions;
              $scope.project.totalRespondents = 0;
              $scope.project.cost = 0;
              $scope.project.communityDetails = [];
              $scope.project.communitiesAdded = selectedProjectData.communities.length;
              var temp, i, j, comIndex = 0;
              for (var i = 0; i < selectedProjectData.communities.length; i++) {
                var communityStruc = communityService.getCommunityDetailsObject();

                communityStruc.countries = communityService.getCountries();
                communityStruc.communities = communityService.getCommunityByCountry(selectedProjectData.communities[i].country[0]);
                communityStruc.communities.communityFlag = true;
                //subComDetails = communityService.setCommunityDetails(communityService.getCommunityDetails($scope.projectDetailsData.communities[i].communityname), );
                temp = communityService.formatCountry(selectedProjectData.communities[i].country);
                communityStruc.selected.countries_text = temp.text;
                communityStruc.selected.countries = temp.array;

                comIndex = communityStruc.communities.map(function(item) {
                  return item.name;
                }).indexOf(selectedProjectData.communities[i].communityname);
                if(comIndex<0){
                  growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                }
                communityStruc.selected.community.name = selectedProjectData.communities[i].communityname;
                communityStruc.selected.community.description = selectedProjectData.communities[i].communitydescription;
                communityStruc.selected.community.selected = true;
                communityStruc.selected.community.returnDataListID = communityStruc.communities[comIndex].returnDataListID;

                communityService.parseDataGetCommunityDetails(selectedProjectData.communities[i].communityname);
                console.log(communityService.httpResponseData);
                console.log(communityService.parsedData);
                communityStruc.ages = communityService.getAgeRanges();
                temp = {};
                temp = communityService.formatSelectedAgeRanges(selectedProjectData.communities[i].ageselection);
                communityStruc.selected.age_text = temp.text;
                communityStruc.selected.ages = temp.formattedArray;
                for (var j = 0; j < communityStruc.selected.ages.length; j++) {
                  temp = communityStruc.ages.map(function(item) {
                    return item.ageRange;
                  }).indexOf(communityStruc.selected.ages[j].ageRange)
                  communityStruc.ages[temp].checked = true;
                }
                communityService.filterRespondentByAge(communityStruc.selected.ages, selectedProjectData.communities[i].communityname);
                communityStruc.respondents = communityService.getRespondents();
                var respdIndex = communityStruc.respondents.map(function(item) {
                  return item.number
                }).indexOf(selectedProjectData.communities[i].respondents);
                if(respdIndex<0){
                  growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                }
                communityStruc.selected.respondents = communityStruc.respondents[respdIndex];

                communityService.filterGender(communityStruc.selected.ages, communityStruc.selected.respondents.number, communityStruc.selected.community.name);
                communityStruc.gender = communityService.getGender();
                temp = communityService.formatGender(selectedProjectData.communities[i].gender);
                communityStruc.selected.gender_text = temp.text;
                communityStruc.selected.gender = temp.array;

                for (var j = 0; j < communityStruc.selected.gender.length; j++) {
                  temp = communityStruc.gender.map(function(item) {
                    return item.name;
                  }).indexOf(communityStruc.selected.gender[j].name)
                  communityStruc.gender[temp].selected = true;
                }
                communityStruc.cost = $scope.getCommunityCost(communityStruc.selected.respondents);

                communityStruc.data.httpResponseData.communityList = communityService.getHttpResponseData("CommunityList");
                communityStruc.data.httpResponseData.communityDetails = communityService.getHttpResponseData("CommunityDetails", selectedProjectData.communities[i].communityname);
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
                communityStruc.showEditBtn = true;
                communityStruc.disableEditBtn = '';
                communityStruc.showDeleteBtn = true;
                communityStruc.disableDeleteBtn = '';
                communityStruc.isSaved = true;

                $scope.project.communityDetails.push(communityStruc);
                //$scope.project.totalRespondents += selectedProjectData.communities[i].respondents.number;
                //$scope.project.cost += communityStruc.cost;
              }
              $scope.calculateTotalRespondents();
              $scope.project.cost = sharedService.calculateTotalCost($scope.project.totalRespondents, $scope.project.questions, $scope.priceTable);
              $scope.newProjectFlag = false;
              $scope.addMoreCommunity.showBtn = true;
              $scope.addMoreCommunity.disableBtn = false;
              $scope.activateNextStep();
              //$scope.project.communityDetails = new Array(selectedProjectData.communities.length);
              if ($scope.project.projectName.trim().length > 0 && $scope.project.projectDescription.trim().length > 0 && $scope.project.questions > 0) {
                document.getElementById("block-wrap").style.display = 'none';
              }

              console.log($scope.project);

              hideCopyModal();

              $scope.focusProjectName();
              if ($scope.project.projectName.trim().length > 0 && $scope.project.projectDescription.trim().length > 0 && $scope.project.questions > 0) {
                document.getElementById("block-wrap").style.display = 'none';
              }
            } else {
              $scope.selectedProjectFetchMsg = "Cannot fetch existing projects list";
            }
          }else{
            growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
          }

        }, function(response) {
          $scope.selectedProjectFetchMsg = "Cannot fetch existing projects list";
        });

      // More work to do
    }


    $scope.redirectedToCommunities = function(communityName) {
      sharedService.setRedirection("community", "flag", true);
      sharedService.setRedirection("community", "name", communityName);
      console.log(window.location.protocol + "//" + window.location.host + "/#/communities");
      var win = window.open(window.location.protocol + "//" + window.location.host + "/#/communities", '_blank');
      win.focus();
    }

    $scope.cancelCopy = function() {
      $scope.newProjectFlag = true;

      hideCopyModal();

      $scope.focusProjectName();
    }

    $scope.focusProjectName = function() {
      $scope.fieldError.projectName = '';
      document.getElementById("project-name").focus();
      $scope.modalOnClose.callingFunc = '';
    }

    $scope.stepIconClicked = function(step) {
      console.log("--> Step Icon Clicked ");
      console.log(step);
      $scope.disabledButtons[step] = true;
      $scope.disabledButtons = [true, true, true];
    }

    function isEmpty(object) {
      for(var key in object) {
        if(object.hasOwnProperty(key)){
          return false;
        }
      }
      return true;
    }

    /*$rootScope.unCompletedProcessOnCurrentPage = false;
    $rootScope.currentPage = {
      name: "New Project",
      action: "",
      msgTitle: "",
      onChangeMsg: "",
    }*/
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
    $scope.checkForUnCompletedProcess = function(){
      var unCompleteForm = false;
      //$scope.projectID
      if($scope.projectID!=null){
        $scope.checkProjectDataChanges();
      }else{
        if ($scope.newProjectProgress.currentStep === 0) {
          //var ret = $scope.validateStepOne();
          if ($scope.project.projectName.trim().length < 1 && $scope.project.questions < 1 && $scope.project.communitiesAdded < 1 && $scope.project.projectDescription.length < 1) {
            unCompleteForm = false;
            $rootScope.unCompletedProcessOnCurrentPage = false;
            $scope.resetCurrentPageVars();
          } else{
            unCompleteForm = true;
            $rootScope.unCompletedProcessOnCurrentPage = true;
            $rootScope.currentPage.action = "Uncompleted Step 1";
            $rootScope.currentPage.msgTitle = "<b>Warning:</b> <b>New Project</b> ?";
            $rootScope.currentPage.onChangeMsg = "<p>You are about to leave new project page. If you leave then all unsaved data of this project will be lost which are not recoverable.</p>";
            $rootScope.currentPage.onChangeMsg += "<p>Are you sure ?</p>";
          }
        }
      }
    }

    $scope.checkProjectDataChanges = function(){
      // project name
      var isChanged = false, projectName="", checkProp=["projectName","projectDescription","questions","totalRespondents","communitiesAdded"];
      checkProp.forEach(function(key) {
        if($scope.project[key] != projectOrg[key]){
          projectName = projectOrg.projectName;
          isChanged = true;
        }
      });

      // check community details
      // communityDetails
      // check community exists or not first
      // then check selected data
      var communityEd = {},communityOrg = {}, comIndexEd=0;
      for(var i=0; i<projectOrg.communityDetails.length; i++){
        communityEd = {};
        communityOrg = {};
        communityOrg = projectOrg.communityDetails[i];
        // find community in Original
        comIndexEd = $scope.project.communityDetails.map(function(item){return item.selected.community.name;}).indexOf(communityOrg.selected.community.name);
        if(comIndexEd<0){
          // community not found - info updated
          isChanged = true;
          break;
        }else{
          communityEd = $scope.project.communityDetails[comIndexEd];

          if(isChanged === false && communityEd.selected.countries_text != communityOrg.selected.countries_text){
            isChanged = true;
            break;
          }

          if(isChanged === false && communityEd.selected.community.name != communityOrg.selected.community.name){
            isChanged = true;
            break;
          }
          if (isChanged === false && communityEd.selected.ages.length != communityOrg.selected.ages.length ){
            isChanged = true;
            break;
          }else{
            if (isChanged === false && communityEd.selected.age_text != communityOrg.selected.age_text ){
              isChanged = true;
              break;
            }
          }

          if (isChanged === false && communityEd.selected.gender.length != communityOrg.selected.gender.length ){
            isChanged = true;
            break;
          }else{
            if (isChanged === false && communityEd.selected.gender_text != communityOrg.selected.gender_text ){
              isChanged = true;
              break;
            }
          }
          if(isChanged === false && communityEd.selected.respondents.number != communityOrg.selected.respondents.number){
            isChanged = true;
            break;
          }
        }
      }
      if(isChanged===true){
        $rootScope.unCompletedProcessOnCurrentPage = true;
        $rootScope.currentPage.action = "Uncompleted Step 1";
        $rootScope.currentPage.msgTitle = "<b>Warning:</b> <b>"+projectName+"</b>";
        $rootScope.currentPage.onChangeMsg = "<p>You are about to leave this page. If you leave then all unsaved data of this project will be lost which are not recoverable.</p>";
        $rootScope.currentPage.onChangeMsg += "<p>Are you sure ?</p>";

        return true;
      }else{
        $rootScope.unCompletedProcessOnCurrentPage = false;
        $rootScope.currentPage.action = "Uncompleted Step 1";
        $rootScope.currentPage.msgTitle = "";
        $rootScope.currentPage.onChangeMsg = "";

        return false;
      }
    }
  }
]);