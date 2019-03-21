/**
 * Created by Kanthi on 21/08/2015.
 */
'use strict';
var app = angular.module('validateItUserPortalApp').value();

app.controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', '$routeParams', '$location', '$window', 'sideBarService', 'communityService', 'sharedService', 'usersService', 'httpServerService', 'Upload', 'growl', '$q', 'ModalService', 'loadingDialogService', '$timeout', function($rootScope, $scope, $route, $routeParams, $location, $window, sideBarService, communityService, sharedService, usersService, httpServerService, Upload, growl, $q, ModalService, loadingDialogService, $timeout) {

  /**
   * Function that's called when the users page is loaded.
   * This function will make a webservice to call the backend
   * and it will load the data for the users list.
   */
  $scope.init = function() {
      NProgress.start();
      $rootScope.unCompletedProcessOnCurrentPage = false;
      $rootScope.currentPage = {
        name: "Projects",
        action: "",
        msgTitle: "",
        onChangeMsg: "",
      }
      $scope.projectState = "draft";
      if($routeParams.projectState){
        $scope.projectState = $routeParams.projectState;
      }
      console.log($scope.projectState);
      sideBarService.setSelectedByRoute($location.$$path);
      $rootScope.update = {
        project: {
          projectID: null,
          details: {},
          communityDetails: [],
          projectNote: {},
        }
      }
      $rootScope.wizard = {
          project: {
            activate: false,
            projectID: null, // required
            type: 'UpdateProject', // required  { NewProject, UpdateProject, CopyProject, NewProjectWithCommunities }
            details: {},
            communityDetails: [],
            display: false,
            projectNote: {},
            initFunc: '',
            dataDependency: {},
            onSubmitFunc: 'updateProjectOnSubmit',
            onSubmitParams: {},
          }
        }
        /*$scope.newProject = communityService.getNewProject();
         console.log(" --- New Project --- ");
         console.log($scope.newProject);
         var communityName = "";
         for(var i = 0; i<$scope.newProject.communityDetails.length; i++){
         communityName += $scope.newProject.communityDetails[i].selected.community.name+ ", ";
         }
         communityName = communityName.substring(0, communityName.length - 2)

         $scope.approvalRequiredProjects.push(
         {
         name: $scope.newProject.projectName,
         community: communityName,
         submittedBy: usersService.getUserObject().name,
         submittedDate: $scope.newProject.entryDate,
         }
         );*/
      $scope.newProjectShownFlag = true;
      $scope.showBreadcrumbNav = false;
      $scope.showProjectDetailsFlag = false;
      $scope.customModalResult = null;

      $scope.httpResponses = {
        draftProjects: [],
        approvalRequiredProjects: [],
        approvedProjects: [],
        inProgressProjects: [],
        completedProjects: []
      }
      $scope.projectStatusOnHttpResponses = {
        'D' : ['draftProjects','draft'],
        'R' : ['approvalRequiredProjects','approvalRequired'],
        'A' : ['approvedProjects','approved'],
        'P' : ['inProgressProjects','inProgress'],
        'C' : ['completedProjects','completed']
      }
      $scope.projectStateRouteParams = [
        { routeParam: 'draft', match: 'D'},
        { routeParam: 'approval_required', match: 'R' },
        { routeParam: 'in_review', match: 'A' },
        { routeParam: 'launched', match: 'P' },
        { routeParam: 'completed', match: 'C' },
      ];
      $scope.userEmailList = [];
      $scope.totalCount = {
        draft: 0,
        approvalRequired: 0,
        approved: 0,
        inProgress: 0,
        completed: 0,
      }
      $scope.priceTable = [];

      /*------ [Start] Breadcrumb Code -------*/
      $scope.breadcrumb = {
        lists: [{
          name: "Home",
          onClickFnc: "showPageHome('employee_overview')",
        },
          /* {
           name: "Projects",
           onClickFnc: "showProject('project')",
           },*/
          {
            name: "Drafts",
            onClickFnc: "showProject('draft')",
          }
        ]
      }
      // $scope.upDel flag will be used to control visibility of update/delete action button in project list view
      $scope.upDel = false;
      if (usersService.getUserObject().teamrole == "A" || usersService.getUserObject().teamrole == "M" || usersService.getUserObject().teamrole == "U") {
        $scope.upDel = true;
      }
      $scope.draftProjects = [];
      //http://dev2.validateitclients.com/ws/projectById?teamName=Wealth%20Management&projectId=dac8-447a-89e8-e168fd996185



      /* ----- Get Projects Price Table ------*/
      sharedService.getPricingInfoFromDataSource(usersService.getUserObject().teamname).then(function(responseData) {
        sharedService.saveHttpResponseData("NewProjectPricing", responseData);
        sharedService.parseDataGetProjectPricing(responseData);
        $scope.priceTable = sharedService.getPricingTable();
        console.log($scope.priceTable);

      });
      /* ----- Get Projects Overview ------*/
      httpServerService.makeHttpRequest("teamoverview?teamName=" + usersService.getUserObject().teamname, "get").then(function(responseData) {
        if (responseData.status == 200) {
          console.log("Team Overview");
          console.log(responseData.data);
          $scope.totalCount.draft = responseData.data.hasOwnProperty('draft') ? responseData.data.draft : 0;
          $scope.totalCount.approvalRequired = responseData.data.hasOwnProperty('approvalrequired') ? responseData.data.approvalrequired : 0;
          $scope.totalCount.approved = responseData.data.hasOwnProperty('approved') ? responseData.data.approved : 0;
          $scope.totalCount.inProgress = responseData.data.hasOwnProperty('inprogress') ? responseData.data.inprogress : 0;
          $scope.totalCount.completed = responseData.data.hasOwnProperty('completed') ? responseData.data.completed : 0;
          console.log($scope.totalCount);
        }
      });
      httpServerService.makeHttpRequest("usersEmailList?teamName=" + usersService.getUserObject().teamname, "get").then(function(responseData) {
        if (responseData.status == 200) {
          console.log("User Email List");


          console.log(usersService.getUserObject().email);

          for(var i=0; i<responseData.data.users.length; i++){
            $scope.userEmailList.push({
              recordID: sharedService.generateUniqueID(),
              firstName: responseData.data.users[i].name.firstname,
              lastName: responseData.data.users[i].name.lastname,
              fullName: responseData.data.users[i].name.firstname+" " + responseData.data.users[i].name.lastname,
              email: responseData.data.users[i].email
            });
          }

          $scope.userEmailList.sort(function(a, b){
            var nameA=a.fullName.toLowerCase(), nameB=b.fullName.toLowerCase();
            if (nameA < nameB) //sort string ascending
              return -1;
            if (nameA > nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      });


      NProgress.done();
      //$rootScope.showProjectUpdateForm = false;
      $rootScope.wizard.project.display = false;
      $scope.newNote = '';
      $scope.colorsClasses = ['blue', 'green', 'red', 'purple', 'dark-gray', 'dark-green', 'cayn', 'brown', 'light-purple', 'light-gray', 'dark-cayn', 'light-green', 'light-cayn', 'orange', 'dark-cayn', 'light-brown', 'dark-green', 'dark-brown'];

      $rootScope.modal = {
        show: false,
        title: "Delete Community",
        text: "You are about to delete community from the project. Are you sure?",
        input: {
          show: false,
          value: '',
          required: false,
          dependent: '',
          select: {
            show: false,
            value: '',
            required: false,
            dependent: '',
            listData: [],
          },
          textarea: {
            show: false,
            value: '',
            required: false,
            dependent: '',
          }
        },

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
            link: "",
            fnc: "resetModal()",
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

      /* ------ [Start] Tab -------*/

      $scope.activeTab = {
        draft: '',
        approvalRequired: '',
        inProgress: '',
        completed: ''
      }
      $scope.projectStatus = {
          draft: {
            displayName: "Drafts",
            show: true,
            active: 'active',
            code: 'D'
          },
          approvalRequired: {
            displayName: "Approval Required",
            show: false,
            active: '',
            code: 'R',
          },
          approved: {
            displayName: "In Review",
            show: false,
            active: '',
            code: 'A'
          },
          inProgress: {
            displayName: "Launched",
            show: false,
            active: '',
            code: 'P'
          },
          completed: {
            displayName: "Completed",
            show: false,
            active: '',
            code: 'C'
          }
        }
        // -------------------
      var queryStrObj = $location.search();
      if(Object.keys(queryStrObj).length>0){
        console.log("Params are there");
        if(queryStrObj.hasOwnProperty('projectId')){
          if(queryStrObj.projectId != '' && queryStrObj.projectId !== false){
            $scope.displayProjectDetails(queryStrObj.projectId, '');
          }
        }

      }else{
        console.log("No Query Params");
      }

      if (sharedService.getProjectRedirectedTo()) {
        var redirectedFlags = sharedService.getProjectFlags();
        if(redirectedFlags.displayProjectList.active === true){
          var active_tab = "";
          for(var key in redirectedFlags.displayProjectList.status){
            if(redirectedFlags.displayProjectList.status[key] === true){
              $scope.setActiveTab(key);
              $scope.displayProjectList(key);
              break;
            }
          }
        }else{
          if (redirectedFlags.isCreated === true) {
            if (usersService.isUser()) {
              // display approval required
              $scope.setActiveTab('approvalRequired');
              $scope.displayProjectList('approvalRequired');
            } else if (usersService.isAdmin() || usersService.isManager()) {
              // display approved project list
              $scope.setActiveTab('approved');
              $scope.displayProjectList('approved');

            }

          }
        }
        sharedService.resetProjectRedirectedFlags();
      }
      $scope.authorization = {
        edit: false,
        delete: false,
        changeState: false
      }

      $scope.reportDoc = null;
      $scope.questionnaireDoc = null;
      $scope.imageFile = null;

      var state = "D";
      if($routeParams.projectState){
        var matchIndex = $scope.projectStateRouteParams.map(function(item){ return item.routeParam; }).indexOf($routeParams.projectState.toLowerCase());
        if(matchIndex<0){
          state = "D";
          showProjectUnavailableModal("This project state is invalid.", "draftProjects");
        }else{
          state = $scope.projectStateRouteParams[matchIndex].match;
        }
        $scope.displayProjectList(state);
      }else{
        httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=D", "get").then(function(responseData) {
          if (responseData.status == 200) {
            // success
            console.log(" **** SUCCESS ****");
            console.log(responseData);
            if (responseData.data.length > 0) {
              $scope.httpResponses.draftProjects = [];
              $scope.totalCount.draft = responseData.data.length;
              $scope.countAssignedToYou = 0;
              $scope.countRequireChanges = 0;
              responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
              var reqChangeProjects = [], projectsAssignedToYou = [];
              for (var i = 0; i < responseData.data.length; i++) {
                var communities_text = "", communitiesAr = [], assignedToYou=false;
                $scope.httpResponses.draftProjects[i] = responseData.data[i];
                for (var j = 0; j < responseData.data[i].communities.length; j++) {
                  communities_text += responseData.data[i].communities[j].communityname + ", ";
                  communitiesAr.push(responseData.data[i].communities[j].communityname);
                }
                communities_text = communities_text.substring(0, communities_text.length - 2);

                if(usersService.getUserObject().email == responseData.data[i].assignedtoemail && responseData.data[i].requireschanges===true){
                  assignedToYou = true;
                  projectsAssignedToYou.push({
                    projectID: responseData.data[i].projectId,
                    name: responseData.data[i].projectnameci,
                    community: communities_text,
                    communityAr: communitiesAr,
                    status: "",
                    requireschanges: responseData.data[i].requireschanges,
                    createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                    createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                    assignedToYou: assignedToYou
                  });
                  $scope.countAssignedToYou++;
                }else{
                  $scope.httpResponses.draftProjects[i].assigndedToYou = false;
                  assignedToYou = false;
                  if(responseData.data[i].requireschanges===true){
                    reqChangeProjects.push({
                      projectID: responseData.data[i].projectId,
                      name: responseData.data[i].projectnameci,
                      community: communities_text,
                      communityAr: communitiesAr,
                      status: "",
                      requireschanges: responseData.data[i].requireschanges,
                      createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                      createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                      assignedToYou: assignedToYou
                    });
                    $scope.countRequireChanges++;
                  }else{
                    $scope.draftProjects.push({
                      projectID: responseData.data[i].projectId,
                      name: responseData.data[i].projectnameci,
                      community: communities_text,
                      communityAr: communitiesAr,
                      status: "",
                      requireschanges: responseData.data[i].requireschanges,
                      createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                      createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                      assignedToYou: false
                    });
                  }
                }

              }
              for(var i=reqChangeProjects.length-1; i>-1; i--){
                $scope.draftProjects.unshift(reqChangeProjects[i]);
              }
              for(var i=projectsAssignedToYou.length-1; i>-1; i--){
                $scope.draftProjects.unshift(projectsAssignedToYou[i]);
              }
              console.log($scope.formatTime(responseData.data[0].createddate));
            }else{
              $scope.httpResponses.draftProjects = [];
              $scope.draftProjects = [];
            }
            ////0bc3104f-9e36-4f6e-b3c1-df6b0f09eeb8
            console.log($scope.httpResponses);
          } else {
            console.log(" **** Failed ****");
            console.log(responseData);
          }
        });
      }
    }
    /* ------ [End] Init Code ------- */
  /**
   * File Upload for question document functionality,
   */
  $scope.uploadOption = {
    reportDoc: {
      valid: false,
      buttonClass: 'disabled',
    },
    reportExcel: {
      valid: false,
      buttonClass: 'disabled',
    },
    questionnaireDoc:{
      valid: false,
      removeBtn: false,
      submitBtn: false,
      submitDisabled: true,
      qDocDesc: false,
    },
    imageFile:{
      valid: false,
      removeBtn: false,
      submitBtn: false,
      submitDisabled: true,
    },
    error: false,
    errorMessage: ""
  }

  $scope.breadcrumbLink = function(homeFnc, index) {
    if (index > 0) {
      $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, index + 1);
    }
    $scope.resetProjectUpdateForm();
    $scope.$eval(homeFnc);
    $scope.backToProjectList();
    $scope.clearFlags(); // hide the forms and charts that should only show in specified page
    $location.search('');
  }
  $scope.showPageHome = function(param) {
    $scope.changePath('/#/' + param, 0);
  }
  $scope.showProject = function(projectStatus) {
    if (projectStatus == 'project') {
      $scope.setActiveTab('undefined');
      $scope.hideProjectList();
    } else {
      $scope.setActiveTab(projectStatus);
    }
  }

  $scope.teamName = usersService.getUserObject().teamname;

  /* ------ [Start] SideBar Code ------- */
  $scope.sidebar_items = sideBarService.getSideBarItems();
  $scope.showSideBarFn = function() {
    return sideBarService.getShowSideBar();
  }
  sideBarService.setShowSideBar(true);
  $scope.changePath = function(newPath, index) {
    if($rootScope.unCompletedProcessOnCurrentPage===false) {
      sideBarService.setShowSideBar(true);
      if (typeof(index) === 'number' || !isNaN(parseFloat(index)) === true) {
        sideBarService.setSelectedIndex(index);
      }
    }
    $window.location.assign(newPath);
  };

  $scope.logOut = function() {

  }


  /* ------ [End] SideBar Code ------- */

  /* *
   * Method: setActiveTab
   * Parameters: tab name
   * Description: This method will add .active class to the currently clicked tab and remove .active class from all other tabs
   * */
  $scope.setActiveTab = function(tabName) {
    for (var key in $scope.projectStatus) {
      if ($scope.projectStatus.hasOwnProperty(key)) {
        if (tabName != key) {
          $scope.projectStatus[key].active = '';
          $scope.projectStatus[key].show = false;
        } else {
          $scope.projectStatus[key].active = 'active';
          $scope.projectStatus[key].show = true;
        }
      }
    }
    $scope.showProjectDetailsFlag = false;
  }

  /* *
   * Method: setActiveTab
   * Parameters: tab name
   * Description: This method will add .active class to the currently clicked tab and remove .active class from all other tabs
   * */
  $scope.getActiveTab = function() {
    var active = '';
    for (var key in $scope.projectStatus) {
      if ($scope.projectStatus.hasOwnProperty(key)) {
        if ($scope.projectStatus[key].active === 'active' || $scope.projectStatus[key].active === 'active hide') {
          active = key;
        }
      }
    }
    return active;
  }
  $scope.hideAllTabExcept = function() {
    for (var key in $scope.projectStatus) {
      if ($scope.projectStatus.hasOwnProperty(key)) {
        if ($scope.projectStatus[key].active != 'active hide') {
          if ($scope.projectStatus[key].active == 'active') {
            $scope.projectStatus[key].active = 'active hide';
          } else {
            $scope.projectStatus[key].active = 'hide';
          }
        }
      }
    }
  }
  $scope.showAllTabs = function() {
      var active = '';
      for (var key in $scope.projectStatus) {
        if ($scope.projectStatus.hasOwnProperty(key)) {
          if ($scope.projectStatus[key].active.indexOf("active") > -1) {
            active = key;
            //$scope.projectStatus[key].active = "active";
            $scope.projectStatus[key].show = true;
          } else {
            //$scope.projectStatus[key].active = "";
            $scope.projectStatus[key].show = false;
          }
          if ($scope.projectStatus[key].active.indexOf("hide") > -1) {
            $scope.projectStatus[key].active = $scope.projectStatus[key].active.replace("hide", "").trim();
          }
        }

      }
      console.log($scope.projectStatus);
      return active;
    }
    /* *
     * Method: hideProjectList
     * Parameters:
     * Description: This method will hide project lists
     * */
  $scope.hideProjectList = function() {
      for (var key in $scope.projectStatus) {
        if ($scope.projectStatus.hasOwnProperty(key)) {
          $scope.projectStatus[key].show = false;
        }
      }
    }
    /* ------ [End] Tab -------*/


  $scope.newProject = function() {
    $scope.newProjectShownFlag = false;
  }

  /* *
   * Method: displayProjectList
   * Parameters: tab name
   * Description: This method activates the currently clicked tab and call display function of that tab.
   * */
  $scope.displayProjectList = function(state) {
    if(state!=""){
      NProgress.start();
      $location.search('');
      $rootScope.wizard.project.display = false;
      $scope.showProjectDetailsFlag = false;

      var activeTabName = $scope.projectStatusOnHttpResponses[state][1];
      $scope.setActiveTab(activeTabName);

      var ind = $scope.projectStateRouteParams.map(function(item){ return item.match}).indexOf(state);
      if(ind>-1){
        $route.updateParams({projectState: $scope.projectStateRouteParams[ind].routeParam });
      }
      //console.log("display"+activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1)+"()");
      $scope.$eval("display" + activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1) + "()");

      if ($scope.breadcrumb.lists.length <= 1) {
        $scope.breadcrumb.lists.push({
          name: $scope.projectStatus[activeTabName].displayName,
          onClickFnc: "display" + activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1) + "()",
        });
      } else {
        $scope.breadcrumb.lists[1].name = $scope.projectStatus[activeTabName].displayName;
        $scope.breadcrumb.lists[1].onClickFnc = "display" + activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1) + "()";
        $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);
      }
      NProgress.done();
      $scope.clearFlags(); // hide the forms and charts that should only show in specified page

    }

  }

  /* *
   * Method: displayDraft
   * Parameters: tab name
   * Description: This method make a web service call to get draft projects and display draft Project List
   * */
  $scope.displayDraft = function() {
      console.log(" ------ displayDraft ------");
      httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=D", "get").then(function(responseData) {
        if (responseData.status == 200) {
          // success
          //console.log(" **** SUCCESS ****");
          //console.log(responseData);
          if (responseData.data.length > 0) {
            $scope.httpResponses.draftProjects = [];
            $scope.draftProjects = [];
            $scope.countAssignedToYou = 0;
            $scope.countRequireChanges = 0;
            responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
            var reqChangeProjects = [], projectsAssignedToYou = [],c=0;
            for (var i = 0; i < responseData.data.length; i++) {
              var communities_text = "", communityAr  = [], assignedToYou = false;
              $scope.httpResponses.draftProjects[i] = responseData.data[i];
              for (var j = 0; j < responseData.data[i].communities.length; j++) {
                communities_text += responseData.data[i].communities[j].communityname + ", ";
                communityAr.push(responseData.data[i].communities[j].communityname);
              }
              communities_text = communities_text.substring(0, communities_text.length - 2);
              if(usersService.getUserObject().email == responseData.data[i].assignedtoemail && responseData.data[i].requireschanges===true){
                assignedToYou = true;
                projectsAssignedToYou.push({
                  projectID: responseData.data[i].projectId,
                  name: responseData.data[i].projectnameci,
                  community: communities_text,
                  communityAr: communityAr,
                  status: "",
                  requireschanges: responseData.data[i].requireschanges,
                  createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                  createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                  assignedToYou: assignedToYou
                });
                $scope.countAssignedToYou++;
              }else{
                $scope.httpResponses.draftProjects[i].assigndedToYou = false;
                assignedToYou = false;
                if(responseData.data[i].requireschanges===true){
                  reqChangeProjects.push({
                    projectID: responseData.data[i].projectId,
                    name: responseData.data[i].projectnameci,
                    community: communities_text,
                    communityAr: communityAr,
                    status: "",
                    requireschanges: responseData.data[i].requireschanges,
                    createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                    createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                    assignedToYou: assignedToYou
                  });
                  $scope.countRequireChanges++;
                }else{
                  $scope.draftProjects.push({
                    projectID: responseData.data[i].projectId,
                    name: responseData.data[i].projectnameci,
                    community: communities_text,
                    communityAr: communityAr,
                    status: "",
                    requireschanges: responseData.data[i].requireschanges,
                    createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                    createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                    assignedToYou: false
                  });
                }
              }


            }
            for(var i=reqChangeProjects.length-1; i>-1; i--){
              $scope.draftProjects.unshift(reqChangeProjects[i]);
            }
            for(var i=projectsAssignedToYou.length-1; i>-1; i--){
              $scope.draftProjects.unshift(projectsAssignedToYou[i]);
            }
            $scope.hideProjectList();
            $scope.projectStatus.draft.show = true;
            $scope.showProjectDetailsFlag = false;
          }else{
            $scope.httpResponses.draftProjects = [];
            $scope.draftProjects = [];
          }

          $scope.totalCount.draft = responseData.data.length;
        } else {
          console.log(" **** Failed ****");
          console.log(responseData);
        }
      });
    }
    /* *
     * Method: displayApprovalRequired
     * Parameters:
     * Description: This method make a web service call to get projects that requires approval and display Project List.
     * */
  $scope.displayApprovalRequired = function() {
    console.log(" ------ displayApprovalRequired ------");
    // Make a web service call to retrieve projects
    httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=R", "get").then(function(responseData) {
      if (responseData.status == 200) {
        // success

        if (responseData.data.length > 0) {
          $scope.httpResponses.approvalRequiredProjects = [];
          $scope.approvalRequiredProjects = [];
          $scope.countAssignedToYou = 0;
          responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
          var assignedToYou = [], communities_text, communityAr;
          for (var i = 0; i < responseData.data.length; i++) {
            communities_text = "";
            communityAr = [];
            $scope.httpResponses.approvalRequiredProjects[i] = responseData.data[i];
            for (var j = 0; j < responseData.data[i].communities.length; j++) {
              communities_text += responseData.data[i].communities[j].communityname + ", ";
              communityAr.push(responseData.data[i].communities[j].communityname);
            }
            communities_text = communities_text.substring(0, communities_text.length - 2);
            if(usersService.getUserObject().email == responseData.data[i].assignedtoemail){
              assignedToYou.push({
                projectID: responseData.data[i].projectId,
                name: responseData.data[i].projectnameci,
                community: communities_text,
                communityAr: communityAr,
                status: "",
                actionRequiredBy: (responseData.data[i].assignedtoname.firstname != null ? responseData.data[i].assignedtoname.firstname : '') + (responseData.data[i].assignedtoname.lastname != null ? ' ' + responseData.data[i].assignedtoname.lastname : ''),
                createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                assignedToYou: true
              });
              $scope.countAssignedToYou++;
            }else{
              $scope.approvalRequiredProjects.push({
                projectID: responseData.data[i].projectId,
                name: responseData.data[i].projectnameci,
                community: communities_text,
                communityAr: communityAr,
                status: "",
                actionRequiredBy: (responseData.data[i].assignedtoname.firstname != null ? responseData.data[i].assignedtoname.firstname : '') + (responseData.data[i].assignedtoname.lastname != null ? ' ' + responseData.data[i].assignedtoname.lastname : ''),
                createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                assignedToYou: false
              });
            }
          }

          for(var i=assignedToYou.length-1; i>-1; i--){
            $scope.approvalRequiredProjects.unshift(assignedToYou[i]);
          }
          $scope.hideProjectList();
          $scope.projectStatus.approvalRequired.show = true;
          $scope.showProjectDetailsFlag = false;
        }else{
          $scope.httpResponses.approvalRequiredProjects = [];
          $scope.approvalRequiredProjects = [];
        }
        $scope.totalCount.approvalRequired = responseData.data.length;
        console.log($scope.httpResponses);
      } else {
        console.log(" **** Failed ****");
        console.log(responseData);
      }
    });
  }

  /* *
   * Method: displayApprovalRequired
   * Parameters:
   * Description: This method make a web service call to get projects that requires approval and display Project List.
   * */
  $scope.displayApproved = function() {
      console.log(" ------ displayApproved ------");
      $rootScope.wizard.project.display = false;
      // Make a web service call to retrieve projects
      httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=A", "get").then(function(responseData) {
        if (responseData.status == 200) {
          // success
          if (responseData.data.length > 0) {
            $scope.httpResponses.approvedProjects = [];
            $scope.approvedProjects = [];
            console.log(responseData.data);
            responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
            var communities_text, communityAr=[];
            for (var i = 0; i < responseData.data.length; i++) {
              communities_text = "";
              communityAr=[];
              $scope.httpResponses.approvedProjects[i] = responseData.data[i];
              for (var j = 0; j < responseData.data[i].communities.length; j++) {
                communities_text += responseData.data[i].communities[j].communityname + ", ";
                communityAr.push(responseData.data[i].communities[j].communityname);
              }
              communities_text = communities_text.substring(0, communities_text.length - 2);
              var approvedBy = "";
              if(responseData.data[i].hasOwnProperty("approvedbyusername")){
                if(responseData.data[i].approvedbyusername != null){
                  if(responseData.data[i].approvedbyusername.hasOwnProperty('firstname')){
                    approvedBy += (responseData.data[i].approvedbyusername.firstname != null ? responseData.data[i].approvedbyusername.firstname : '');
                  }
                  if(responseData.data[i].approvedbyusername.hasOwnProperty('lastname')){
                    approvedBy += (approvedBy.length>0 ? ' ':'')+(responseData.data[i].approvedbyusername.lastname != null ? responseData.data[i].approvedbyusername.lastname : '');
                  }
                }
              }

              $scope.approvedProjects.push({
                projectID: responseData.data[i].projectId,
                name: responseData.data[i].projectnameci,
                community: communities_text,
                communityAr: communityAr,
                status: "",
                createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
                createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
                approvedBy: approvedBy,
                approveDate: $scope.formatTime(responseData.data[i].updateddate, 'date only'),
              });
            }

            $scope.hideProjectList();
            $scope.projectStatus.approved.show = true;
            $scope.showProjectDetailsFlag = false;
          }else{
            $scope.httpResponses.approvedProjects = [];
            $scope.approvedProjects = [];
          }
          $scope.totalCount.approved = responseData.data.length;

          console.log($scope.httpResponses);
        } else {
          console.log(" **** Failed ****");
          console.log(responseData);
        }
      });
    }
    /* *
     * Method: displayInProgress
     * Parameters:
     * Description: This method make a web service call to get in progress projects and display in progress Project List
     * */
  $scope.displayInProgress = function() {
      console.log(" ------ displayInProgress ------");
      // Make a web service call to retrieve projects
      //     httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=R", "get").then(function(responseData) {
      httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=P", "get").then(function(responseData) {
        if (responseData.status == 200) {
          // success
          if (responseData.data.length > 0) {
            $scope.httpResponses.inProgressProjects = [];
            $scope.inProgressProjects = [];
            responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
            var communities_text, communityAr;
            for (var i = 0; i < responseData.data.length; i++) {
              communities_text = "";
              communityAr = [];

              $scope.httpResponses.inProgressProjects[i] = responseData.data[i];
              // if (!responseData.data[i].reportdoc) {  // set 'reportdoc' felld if it is null in responseData
              //   $scope.httpResponses.inProgressProjects[i].reportdoc = {
              //     name: "",
              //     url: ""
              //   }
              // }
              // if (!responseData.data[i].surveyresponsedata) {  // set 'reportdoc' felld if it is null in responseData
              //   $scope.httpResponses.inProgressProjects[i].surveyresponsedata = {
              //     name: "",
              //     url: ""
              //   }
              // }

              for (var j = 0; j < responseData.data[i].communities.length; j++) {
                communities_text += responseData.data[i].communities[j].communityname + ", ";
                communityAr.push(responseData.data[i].communities[j].communityname);
              }
              communities_text = communities_text.substring(0, communities_text.length - 2);
              var approvedBy = '';
              if(responseData.data[i].approvedbyusername != null){
                if(responseData.data[i].approvedbyusername.hasOwnProperty('firstname')){
                  approvedBy += (responseData.data[i].approvedbyusername.firstname != null ? responseData.data[i].approvedbyusername.firstname : '');
                }
                if(responseData.data[i].approvedbyusername.hasOwnProperty('lastname')){
                  approvedBy += (approvedBy.length>0 ? ' ':'')+(responseData.data[i].approvedbyusername.lastname != null ? responseData.data[i].approvedbyusername.lastname : '');
                }
              }
              $scope.inProgressProjects.push({
                projectID: responseData.data[i].projectId,
                name: responseData.data[i].projectnameci,
                community: communities_text,
                communityAr: communityAr,
                status: "",
                createdBy: approvedBy,
                createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
              });
            }
            $scope.hideProjectList();
            $scope.projectStatus.inProgress.show = true;
            $scope.showProjectDetailsFlag = false;
          }else{
            $scope.httpResponses.inProgressProjects = [];
            $scope.inProgressProjects = [];
          }
          $scope.totalCount.inProgress = responseData.data.length;
          console.log($scope.httpResponses);
        } else {
          console.log(" **** Failed ****");
          console.log(responseData);
        }
      });
      // $scope.hideProjectList();
      // $scope.projectStatus.inProgress.show = true;
    }
    /* *
     * Method: displayCompleted
     * Parameters:
     * Description: This method make a web service call to get completed projects and display completed Project List
     * */
  $scope.displayCompleted = function() {
    console.log(" ------ displayCompleted ------");
    // Make a web service call to retrieve projects
    httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&status=C", "get").then(function(responseData) {
      if (responseData.status == 200) {
        // success
        if (responseData.data.length > 0) {
          $scope.httpResponses.completedProjects = [];
          $scope.completedProjects = [];
          responseData.data.sort(sharedService.sort_by('createddate', false, parseInt));
          var communities_text, communityAr;
          for (var i = 0; i < responseData.data.length; i++) {
            communities_text = "";
            communityAr = [];
            $scope.httpResponses.completedProjects[i] = responseData.data[i];
            for (var j = 0; j < responseData.data[i].communities.length; j++) {
              communities_text += responseData.data[i].communities[j].communityname + ", ";
              communityAr.push(responseData.data[i].communities[j].communityname);
            }
            communities_text = communities_text.substring(0, communities_text.length - 2);
            $scope.completedProjects.push({
              projectID: responseData.data[i].projectId,
              name: responseData.data[i].projectnameci,
              community: communities_text,
              communityAr: communityAr,
              status: "",
              createdBy: (responseData.data[i].createdbyusername.firstname != null ? responseData.data[i].createdbyusername.firstname : '') + (responseData.data[i].createdbyusername.lastname != null ? ' ' + responseData.data[i].createdbyusername.lastname : ''),
              createdDate: $scope.formatTime(responseData.data[i].createddate, 'date only'),
              completeDate: $scope.formatTime(responseData.data[i].updateddate, 'date only'),
            });
          }
          $scope.hideProjectList();
          $scope.projectStatus.completed.show = true;
          $scope.showProjectDetailsFlag = false;
        }else{
          $scope.httpResponses.completedProjects = [];
          $scope.completedProjects = [];
        }
        $scope.totalCount.completed = responseData.data.length;
        console.log($scope.httpResponses);
      } else {
        console.log(" **** Failed ****");
        console.log(responseData);
      }
    });
  }

  $scope.showAllProjects = function() {
    $scope.showBreadcrumbNav = false;
    $scope.newProjectShownFlag = true;
    $scope.showProjectDetailsFlag = false;
  }

  $scope.selectedProject = {
    projectId: "",
    data: {}, // project details from ws/project?teamName='' web service
    name: "",
    community: [],
    description: "",
    questions: 1,
    communities: [],
    questionnaireDocuments: [],
    questionnaireDocumentsNote: "",
    images: [],
    totalRespondents: 100,
    cost: 1050.00,
    custom: {},
    buttons: {
      approve: {
        show: false,
        onClickFnc: 'approve()',
        btnText: 'Approve',
        btnClass: 'btn-success',
      },
      edit: {
        show: false,
        onClickFnc: 'updateProject()',
        btnText: 'Edit',
        btnClass: 'btn-primary',
      },
      delete: {
        show: false,
        onClickFnc: 'prepareToDeleteProject()',
        btnText: 'Delete',
        btnClass: 'btn-danger',
      },
      requireChanges: {
        show: false,
        onClickFnc: 'prepareToRequireChanges()',
        btnText: 'Require Changes',
        btnClass: 'btn-info',
      },
      startSurvey: {
        show: false,
        onClickFnc: 'prepareToStartSurvey()',
        btnText: 'Start Survey',
        btnClass: 'btn-info',
      },
      complete: {
        show: false,
        onClickFnc: 'prepareToComplete()',
        btnText: 'Complete',
        btnClass: 'btn-info',
      }


    },
    detailsBoxClass: 'zoomIn animated',
    notes: [],
    projectState: '',
  }
  $scope.resetSelectedProject = function() {
      $scope.selectedProject.projectId = "";
      $scope.selectedProject.name = "";
      $scope.selectedProject.community = [];
      $scope.selectedProject.description = "";
      $scope.selectedProject.questions = "";
      $scope.selectedProject.communities = [];
      $scope.selectedProject.questionnaireDocuments = [];
      $scope.selectedProject.questionnaireDocumentsNote = "";
      $scope.selectedProject.images = [];
      $scope.selectedProject.totalRespondents = 0;
      $scope.selectedProject.cost = 0.0;
      $scope.selectedProject.assignedtoname = "";
      $scope.selectedProject.assignedtoemail = "";
      $scope.selectedProject.organizationname = "";
      $scope.selectedProject.teamname = "";
      $scope.selectedProject.createdbyusername = "";
      $scope.selectedProject.createdbyemail = "";
      $scope.selectedProject.createdate = "";
      $scope.selectedProject.updatedbyusername = "";
      $scope.selectedProject.updateddate = "";
      $scope.selectedProject.updatedbyemail = "";
      $scope.selectedProject.custom = {};
      $scope.selectedProject.buttons.approve.show = false;
      $scope.selectedProject.buttons.approve.onClickFnc = '';
      $scope.selectedProject.buttons.approve.btnText = 'Approve';
      $scope.selectedProject.buttons.edit.show = false;
      $scope.selectedProject.buttons.edit.onClickFnc = '';
      $scope.selectedProject.buttons.edit.btnText = 'Edit';
      $scope.selectedProject.buttons.delete.show = false;
      $scope.selectedProject.buttons.delete.onClickFnc = '';
      $scope.selectedProject.buttons.delete.btnText = 'Delete';
      $scope.selectedProject.buttons.requireChanges.show = false;
      $scope.selectedProject.buttons.requireChanges.onClickFnc = '';
      $scope.selectedProject.buttons.requireChanges.btnText = 'Require Changes';
      $scope.selectedProject.buttons.complete.show = false;
      $scope.selectedProject.buttons.complete.onClickFnc = '';
      $scope.selectedProject.buttons.complete.btnText = 'Complete';

      $scope.selectedProject.notes = [];
      $scope.selectedProject.projectState = '';

      if ($scope.selectedProject.hasOwnProperty('reportdocObj')) { // clear additional fields of selected 'inprogress' projects
        $scope.selectedProject.reportdocObj = null;
      }
      if ($scope.selectedProject.hasOwnProperty('surveyResponseDataObj')) {
        $scope.selectedProject.surveyResponseDataObj = null;
      }
      //$scope.$digest();
    }
    /* *
     * Method: displayProjectDetails
     * Parameters:
     * Description: This method make a web service call to get details of any draft project by project id and display details information.
     * */
  $scope.displayProjectDetails = function(projectID, status, getData) {
      // @todo
      NProgress.start();
      console.log(status);
      $scope.hideProjectList();
      $scope.projectNote.details.class = 'normal';
      $scope.projectNote.sliderClass = 'slideOutToRight';
      $scope.resetSelectedProject();
      console.log($scope.selectedProject);
      console.log("getData: ");
      console.log(getData);

      var index = $scope.httpResponses.inProgressProjects.map(function(item) {
        return item.projectId;
      }).indexOf($scope.selectedProject.projectId);
      while ($scope.projectNote.list.length) {
        $scope.projectNote.list.pop();
      }
      $scope.selectedProject.projectId = projectID;
      $scope.selectedProject.projectState = status;
      $scope.selectedProject.custom = {};
      if(getData != undefined && getData != null && getData != ''){
        if(Object.keys(getData).length>0){
          for(var key in getData){
            $scope.selectedProject.custom[key] = getData[key];
          }
        }
      }
      //$scope.projectNoteSlider();
      document.getElementById("project-details-wrap").style.display = '';

      $scope.selectedProject.data = {};


      httpServerService.makeHttpRequest("projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectID, "get").then(function(responseData) {
        console.log(" ---- Project By Id ---- ");
        console.log(responseData);
        if(responseData.status===200){
          $scope.selectedProject.data = responseData.data;
          $scope.selectedProject.projectname = responseData.data.projectnameci;
          if(status==''){
            status = $scope.projectStatusOnHttpResponses[$scope.selectedProject.data.projectstatus][0];
            var activeTabName = $scope.projectStatusOnHttpResponses[$scope.selectedProject.data.projectstatus][1];
            $scope.setActiveTab(activeTabName);
            $scope.projectStatus[activeTabName].show = false;
            $scope.breadcrumb.lists[1].name = $scope.projectStatus[activeTabName].displayName;
            $scope.breadcrumb.lists[1].onClickFnc = "display" + activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1) + "()";
            //$scope.breadcrumb.lists[2].name = $scope.projectStatus[activeTabName].displayName;
            //$scope.breadcrumb.lists[2].onClickFnc = "display" + activeTabName.charAt(0).toUpperCase() + activeTabName.slice(1) + "()";

            $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);

            $scope.selectedProject.projectState = status;
            $scope.httpResponses[status].push(responseData.data);
          }
          var index = $scope.httpResponses[status].map(function(item) {
            return item.projectId;
          }).indexOf(projectID);

          // get each community details
          var projectCommunityDetails = new Object();
          for (var i = 0; i < $scope.selectedProject.data.communities.length; i++) {
            projectCommunityDetails[$scope.selectedProject.data.communities[i].communityname] = httpServerService.makeHttpRequest("subCommunityList?teamName=" + usersService.getUserObject().teamname + "&communityName=" + $scope.selectedProject.data.communities[i].communityname, "get");
          }

          projectCommunityDetails['authorization'] = httpServerService.makeHttpRequest("projectAuth?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectID, "get")
          $q.all(projectCommunityDetails).then(function(arrayOfResults) {
            console.log(" All Responses ***");
            console.log(arrayOfResults);
            for (var key in arrayOfResults) {

              if (arrayOfResults.hasOwnProperty(key)) {
                if (key == 'authorization') {
                  if (arrayOfResults[key].status == 200) {
                    console.log("Authorization: ");
                    console.log(arrayOfResults[key].data);
                    for (var skey in arrayOfResults[key].data) {
                      if (arrayOfResults[key].data.hasOwnProperty(skey)) {
                        $scope.authorization[skey] = arrayOfResults[key].data[skey];
                        if (skey == 'delete' && arrayOfResults[key].data[skey] === true) {
                          $scope.selectedProject.buttons.delete.show = true;
                        }
                        if (skey == 'edit' && arrayOfResults[key].data[skey] === true) {
                          $scope.selectedProject.buttons.requireChanges.show = $scope.getActiveTab() != 'draft' ? true : false;
                        }
                        if (skey == 'changeState' && arrayOfResults[key].data[skey] === true) {
                          $scope.selectedProject.buttons.approve.show = $scope.getActiveTab() === 'approvalRequired' ? true : false; // when in approval required state
                          $scope.selectedProject.buttons.startSurvey.show = $scope.getActiveTab() === 'approved' ? true : false; // when in approved state

                          if ($scope.getActiveTab() === 'inProgress') {
                            if ($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false) {
                              $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true : false;
                              $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
                                  $scope.selectedProject.buttons.complete.btnText = 'Complete';
                              $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
                            } else {
                              $scope.selectedProject.buttons.complete.show = false;
                            }
                          }
                          //$scope.selectedProject.buttons.complete.show = $scope.getActiveTab()==='inProgress' ? true:false; // when in inprogress state
                        }
                      }
                    }
                  }
                } else {
                  if (arrayOfResults[key].status == 200) {
                    communityService.setCommunityDetails(arrayOfResults[key].data, key);
                    //console.log(communityService.getCommunityDetails());
                  }
                }
              }
            }
          });

          // end each community details
          httpServerService.makeHttpRequest("projectQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.data.projectId, "get").then(function(responseData) {
            if (responseData.status == 200) {
              if (Object.keys(responseData.data.questionData).length > 0) {
                $scope.selectedProject.images = [];
                for (key in responseData.data.questionData) {
                  $scope.selectedProject.images.push({
                    recordID: sharedService.generateUniqueID(),
                    name: key.toString(),
                    link: responseData.data.questionData[key].url,
                    file: {
                      name: key.toString(),
                      type: responseData.data.questionData[key].mimeType
                    },
                  });
                }
              }
              console.log($scope.selectedProject.images);
              if (Object.keys(responseData.data.questionDoc).length > 0) {
                $scope.selectedProject.questionnaireDocuments = [];
                var dVersion = '';
                for (key in responseData.data.questionDoc) {
                  dVersion = (Object.keys($scope.selectedProject.data.questiondoc).length > 0 && $scope.selectedProject.data.questiondoc.hasOwnProperty('version')) ? $scope.selectedProject.data.questiondoc.version : '';
                  if (dVersion == null || dVersion == 'undefined') {
                    dVersion = '';
                  }
                  $scope.selectedProject.questionnaireDocuments.push({
                    name: key.toString(),
                    link: responseData.data.questionDoc[key],
                    description: (Object.keys($scope.selectedProject.data.questiondoc).length > 0 && $scope.selectedProject.data.questiondoc.hasOwnProperty('description')) ? $scope.selectedProject.data.questiondoc.description : '',
                    docType: (Object.keys($scope.selectedProject.data.questiondoc).length > 0 && $scope.selectedProject.data.questiondoc.hasOwnProperty('mimetype')) ? $scope.selectedProject.data.questiondoc.mimetype : '',
                    version: dVersion,
                  });
                }
              }

              if (Object.keys(responseData.data.reportdoc).length > 0) {
                $scope.httpResponses[status][index].hasReportdocObj = true;
                $scope.httpResponses[status][index].reportdocObj = {
                  name: "",
                  url: ""
                };
                $scope.httpResponses[status][index].reportdocObj.name = Object.keys(responseData.data.reportdoc)[0];
                $scope.httpResponses[status][index].reportdocObj.url = responseData.data.reportdoc[$scope.httpResponses[status][index].reportdocObj.name];
                $scope.selectedProject.reportdocObj = $scope.httpResponses[status][index].reportdocObj;
                $scope.selectedProject.hasReportdocObj = true;
              }else{
                $scope.selectedProject.hasReportdocObj = false;
              }
              if (Object.keys(responseData.data.surveyResponseData).length > 0) {
                $scope.httpResponses[status][index].hasSurveyResponseDataObj = true;
                $scope.httpResponses[status][index].surveyResponseDataObj = {
                  name: "",
                  url: ""
                };
                $scope.httpResponses[status][index].surveyResponseDataObj.name = Object.keys(responseData.data.surveyResponseData)[0];
                $scope.httpResponses[status][index].surveyResponseDataObj.url = responseData.data.surveyResponseData[$scope.httpResponses[status][index].surveyResponseDataObj.name];
                $scope.selectedProject.surveyResponseDataObj = $scope.httpResponses[status][index].surveyResponseDataObj;
                $scope.selectedProject.hasSurveyResponseDataObj = true;
              }else{
                $scope.selectedProject.hasSurveyResponseDataObj = false;
              }
              httpServerService.makeHttpRequest("projectNote?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.data.projectId, "get").then(function(responseData) {
                if (responseData.status == 200) {
                  var noteText = '',
                      firstColor = '',
                      colorClass = '',
                      notes = [];
                  for (var i = responseData.data.length - 1; i >= 0; i--) {
                    noteText = '';

                    if (responseData.data[i].username.firstname !== null && responseData.data[i].username.firstname.trim() !== '') {
                      noteText += responseData.data[i].username.firstname.charAt(0).toUpperCase();
                    }
                    if (responseData.data[i].username.lastname !== null && responseData.data[i].username.lastname.trim() !== '') {
                      noteText += responseData.data[i].username.lastname.charAt(0).toUpperCase();
                    }
                    if (noteText == '') {
                      noteText = '?';
                    }

                    notes.push({
                      id: responseData.data[i].notesid,
                      name: (responseData.data[i].username.firstname != null ? responseData.data[i].username.firstname : '') + ' ' + (responseData.data[i].username.lastname != null ? responseData.data[i].username.lastname : ''),
                      note: responseData.data[i].projectnotes,
                      date: $scope.formatTime(responseData.data[i].dateadded, 'date only'),
                      colorClass: '',
                      text: noteText,
                    });
                  }
                  sharedService.formatProjectNotes(notes);
                  $scope.projectNote.list = notes;

                  if ($scope.projectNote.list.length > 0) {
                    $scope.projectNote.sliderVisibility = false;
                    $scope.projectNoteSlider();
                  }
                } else {
                  console.log(" Project Note Failed");
                  console.log(responseData);
                  $scope.projectNote.list = [];
                }
              });
            } else {

            }
          });

          var i = 0,
              age_text, gender_text, temp, key, totalRespondents = 0;

          for (i = 0; i < $scope.selectedProject.data.communities.length; i++) {
            age_text = "", gender_text = "";
            for (key in $scope.selectedProject.data.communities[i].ageselection) {
              if ($scope.selectedProject.data.communities[i].ageselection[key] === true) {
                temp = key.split("_");
                age_text += temp[1] + (temp[2]==='plus' ? '+':( "-" + temp[2] )) + ", ";
              }
            }
            if (age_text.length > 0) {
              age_text = age_text.substring(0, age_text.length - 2);
            }
            if ($scope.selectedProject.data.communities[i].male === 100) {
              gender_text += 'Male';
            }
            for (key in $scope.selectedProject.data.communities[i].gender) {
              if ($scope.selectedProject.data.communities[i].gender[key] === 100) {
                gender_text += key.charAt(0).toUpperCase() + key.slice(1) + ', ';
              }
            }
            if (gender_text.length > 0) {
              gender_text = gender_text.substring(0, gender_text.length - 2);
            }

            $scope.selectedProject.community.push({
              name: $scope.selectedProject.data.communities[i].communityname,
              country: $scope.selectedProject.data.communities[i].country[0],
              age: age_text,
              gender: gender_text,
              respondents: $scope.selectedProject.data.communities[i].respondents,
            });
            totalRespondents += $scope.selectedProject.data.communities[i].respondents;
            console.log($scope.selectedProject.data);
            //$scope.getCostByCommunity($scope.selectedProject.data.communities[i].respondents, $scope.selectedProject.data.numquestions);

          }
          $scope.selectedProject.cost = 0;
          $scope.selectedProject.description = $scope.selectedProject.data.projectdescription;
          $scope.selectedProject.questions = $scope.selectedProject.data.numquestions;
          //$scope.selectedProject.questionnaireDocuments = $scope.httpResponses[status][index].questionnaireDocuments;
          //$scope.selectedProject.questionnaireDocumentsNote = $scope.httpResponses[status][index].questionnaireDocumentsNote;
          $scope.selectedProject.images = $scope.httpResponses[status][index].images;
          $scope.selectedProject.totalRespondents = totalRespondents;
          if ($scope.selectedProject.data.assignedtoname != null) {
            $scope.selectedProject.assignedtoname = ($scope.selectedProject.data.assignedtoname.firstname != null ? $scope.selectedProject.data.assignedtoname.firstname : '') + ' ' + ($scope.selectedProject.data.assignedtoname.lastname !== null ? $scope.selectedProject.data.assignedtoname.lastname : '');
          }
          $scope.selectedProject.assignedtoemail = $scope.selectedProject.data.assignedtoemail;
          $scope.selectedProject.organizationname = $scope.selectedProject.data.organizationname;
          $scope.selectedProject.teamname = $scope.selectedProject.data.teamname;
          $scope.selectedProject.createdbyusername = ($scope.selectedProject.data.createdbyusername.firstname != null ? $scope.selectedProject.data.createdbyusername.firstname : '') + ' ' + ($scope.selectedProject.data.createdbyusername.lastname !== null ? $scope.selectedProject.data.createdbyusername.lastname : '');
          $scope.selectedProject.approvedby = "";
          if($scope.selectedProject.data.hasOwnProperty('approvedbyusername')){
            if($scope.selectedProject.data.approvedbyusername != null && Object.keys($scope.selectedProject.data.approvedbyusername).length>0){
              if($scope.selectedProject.data.approvedbyusername.hasOwnProperty('firstname')){
                $scope.selectedProject.approvedby += ($scope.selectedProject.data.approvedbyusername.firstname != null ? $scope.selectedProject.data.approvedbyusername.firstname : '');
              }
              if($scope.selectedProject.data.approvedbyusername.hasOwnProperty('lastname')){
                if($scope.selectedProject.approvedby != ""){
                  $scope.selectedProject.approvedby += " ";
                }
                $scope.selectedProject.approvedby += ($scope.selectedProject.data.approvedbyusername.lastname != null ? $scope.selectedProject.data.approvedbyusername.lastname : '');
              }
            }
          }

          $scope.selectedProject.createdbyemail = $scope.selectedProject.data.createdbyemail;
          $scope.selectedProject.createdate = $scope.formatTime($scope.selectedProject.data.createddate, 'date only');
          $scope.selectedProject.updatedbyusername = ($scope.selectedProject.data.updatedbyusername.firstname != null ? $scope.selectedProject.data.updatedbyusername.firstname : '') + ' ' + ($scope.selectedProject.data.updatedbyusername.lastname !== null ? $scope.selectedProject.data.updatedbyusername.lastname : '');
          $scope.selectedProject.updateddate = $scope.formatTime($scope.selectedProject.data.updateddate);
          $scope.selectedProject.updatedbyemail = $scope.selectedProject.data.updatedbyemail;

          $scope.formatProjectNote();

          console.log(' ---- > Selected Project');
          console.log($scope.selectedProject);
          //
          $location.search('');
          $location.search('projectId', $scope.selectedProject.data.projectId);

          $scope.hideAllTabExcept();
          $scope.newProjectShownFlag = false;
          $scope.showBreadcrumbNav = true;
          $scope.showProjectDetailsFlag = true;
          $scope.selectedProject.name = $scope.selectedProject.data.projectname;

          $scope.showHideActionButtons(false, true);
          // 1. Draft Projects
          if (status === 'draftProjects') {
            $scope.selectedProject.buttons.edit.show = true; // apply conditions to show update button
            $scope.selectedProject.buttons.edit.onClickFnc = "updateProject('" + projectID + "', 'Draft')";
            $scope.selectedProject.buttons.edit.btnText = 'Update';
            $scope.selectedProject.buttons.edit.btnClass = 'btn-primary';

            $scope.selectedProject.buttons.delete.show = true; // apply conditions to show delete button
            $scope.selectedProject.buttons.delete.onClickFnc = "prepareToDeleteProject({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'draftProjects')";
            $scope.selectedProject.buttons.delete.btnText = 'Delete';
            $scope.selectedProject.buttons.delete.btnClass = 'btn-danger';
            // 2. Approval Required Projects
          } else if (status == 'approvalRequiredProjects') {
            //$scope.selectedProject.buttons.approve.show = true;
            $scope.selectedProject.buttons.approve.btnText = 'Approve';
            $scope.selectedProject.buttons.approve.btnClass = 'btn-success';

            //$scope.selectedProject.buttons.delete.show = true; // apply conditions to show delete button
            $scope.selectedProject.buttons.delete.onClickFnc = "prepareToDeleteProject({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'approvalRequiredProjects')";
            $scope.selectedProject.buttons.delete.btnText = 'Delete';
            $scope.selectedProject.buttons.delete.btnClass = 'btn-danger';

            //$scope.selectedProject.buttons.requireChanges.show = true;
            $scope.selectedProject.buttons.requireChanges.btnText = 'Require Changes';
            $scope.selectedProject.buttons.requireChanges.btnClass = 'btn-info';
            // 3. inProgress Projects
          } else if (status == 'approvedProjects') {

            //$scope.selectedProject.buttons.delete.show = true; // apply conditions to show delete button
            $scope.selectedProject.buttons.delete.onClickFnc = "prepareToDeleteProject({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'approvedProjects')";
            $scope.selectedProject.buttons.delete.btnText = 'Delete';
            $scope.selectedProject.buttons.delete.btnClass = 'btn-danger';

            //$scope.selectedProject.buttons.requireChanges.show = true;
            $scope.selectedProject.buttons.requireChanges.onClickFnc = "prepareToRequireChanges({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'approvedProjects')",
            $scope.selectedProject.buttons.requireChanges.btnText = 'Require Changes';
            $scope.selectedProject.buttons.requireChanges.btnClass = 'btn-info';

            //$scope.selectedProject.buttons.startSurvey.show = true;
            $scope.selectedProject.buttons.startSurvey.onClickFnc = "prepareToStartSurvey({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'approvedProjects')",
            $scope.selectedProject.buttons.startSurvey.btnText = 'Start Survey';
            $scope.selectedProject.buttons.startSurvey.btnClass = 'btn-success';

          } else if (status === 'inProgressProjects' || status === 'completedProjects') {
            $scope.showDocExcelUploadForms = true;

            if (!$scope.httpResponses[status][index].reportdocModified) {
              if ($scope.httpResponses[status][index].reportdoc) {
                $scope.DocFormTitle = "Uploaded Report Document";
                $scope.showUploadDocForm = false;
              } else {
                $scope.DocFormTitle = "Upload Report Document";
                $scope.showUploadDocForm = true;
              }
            } else {
              if ($scope.httpResponses[status][index].reportdocObj.name) {
                $scope.DocFormTitle = "Uploaded Report Document";
                $scope.showUploadDocForm = false;
              } else {
                $scope.DocFormTitle = "Upload Report Document";
                $scope.showUploadDocForm = true;
              }
            }

            if (!$scope.httpResponses[status][index].surveyResponseDataModified) {
              if ($scope.httpResponses[status][index].surveyresponsedata) {
                $scope.ExcelFormTitle = "Uploaded Survey Response Data";
                $scope.showUploadExcelForm = false;
              } else {
                $scope.ExcelFormTitle = "Upload Survey Response Data";
                $scope.showUploadExcelForm = true;
              }
            } else {
              if ($scope.httpResponses[status][index].surveyResponseDataObj.name) {
                $scope.ExcelFormTitle = "Uploaded Survey Response Data";
                $scope.showUploadExcelForm = false;
              } else {
                $scope.ExcelFormTitle = "Upload Survey Response Data";
                $scope.showUploadExcelForm = true;
              }
            }

            /*if(status === 'inProgressProjects'){
             if($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false){
             $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true:false;
             $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + projectID + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
             $scope.selectedProject.buttons.complete.btnText = 'Complete';
             $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
             }else{
             $scope.selectedProject.buttons.complete.show = false;
             }

             }*/
          }
          // 4. Only for Completed Projects
          if (status == 'completedProjects') {
            $scope.surveyResponseDataErrorMsg = ''; // reset message
            /* If surveyResponseData (excel file) has been uploaded, make the survice call to load the parsed results */
            var isExcelUploaded = $scope.httpResponses[status][index].surveyresponsedata || ((typeof $scope.httpResponses[status][index].surveyResponseDataObj !== 'undefined') && (typeof $scope.httpResponses[status][index].surveyResponseDataObj.name !== 'undefined'));
            if (isExcelUploaded) {
              $scope.loadSurveyResult($scope.httpResponses[status][index].projectId);
            }
          }

          if ($scope.breadcrumb.lists.length >= 4) {
            $scope.breadcrumb.lists.pop();
          }
          $scope.breadcrumb.lists.push({
            name: sharedService.textEllipsis($scope.httpResponses[status][index].projectnameci, 55),
            onClickFnc: "",
          });
          NProgress.done();
          // end
        }else if (responseData.status===400) {
          console.log("Error in Loading project details. Response code 400");
          NProgress.done();
          var errorText = "This project is unavailable at the moment. Please refresh the page to see whether it is deleted."
          showProjectUnavailableModal(errorText, status);
        } else {
          console.log("Error in Loading project details");
          NProgress.done();
          var errorText = "This project is unavailable at the moment due to server error."
          showProjectUnavailableModal(errorText, status);
        }
      });
      /*httpServerService.makeHttpRequest("projectById?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectID, "get").then(function(responseData) {
        console.log(" ---- Project By Id ---- ");
        console.log(responseData);
      });

      console.log(" ---- Porject In List ---- ");
      console.log($scope.httpResponses[status][index]);
      */
    console.log($scope.selectedProject);

    }

  $scope.projectDetails = function(projectID, status, data){
    $window.location.assign("/#/project_details/"+projectID);
  }
  $scope.qDocChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){

    if(invalidFiles.length>0){
      console.log(invalidFiles[0].error);
      $scope.uploadOption[type].valid = false;
      $scope.uploadOption[type].submitBtn = true;
      $scope.uploadOption[type].removeBtn = true;
      $scope.uploadOption[type].qDocDesc = false;
      $scope.uploadOption.error = true;
      var fileValid = sharedService.isValidMimeType("image", fileObj.type);
      if(fileValid){
        $scope.uploadOption.errorMessage = "Attached file exceeds 10MB in size, please upload a smaller one.";
      }else{
        if(type=='questionnaireDoc'){
          $scope.uploadOption.errorMessage = "Attached file is not supported. Please upload document with following file formats: .doc,.dot,.docx,.docm,.dotx,.dotm,.docb,.txt,.pdf,.ppt,.pot,.pps,.pptx,.pptm,.pptm,.potx,.potm,.ppam,.ppsx,.ppsm,.sldx,.sldm ";
        }else{
          $scope.uploadOption.errorMessage = "Attached file is not supported. Please upload document with following file formats: .jpg, .jpeg, .png, .bmp, .gif, .tiff, .tif ";
        }

      }

    }else{
      $scope.uploadOption[type].valid = true;
      $scope.uploadOption[type].submitBtn = true;
      $scope.uploadOption[type].removeBtn = true;
      $scope.uploadOption[type].qDocDesc = true;
      $scope.uploadOption.error = false;
      $scope.uploadOption.errorMessage = "";
    }
  }
  $scope.removeQDoc = function(){
    loadingDialogService.showProcessingPleaseWait('Deleting document. Please wait...');
    httpServerService.makeHttpRequest("questionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId, "delete").then(function(responseData) {
      if (responseData.status == 200) {
        console.log("Success!!!");
        console.log(responseData);
        growl.info("You have successfully deleted your questionnaire from this project.", {
          ttl: 5000
        });
        $scope.selectedProject.questionnaireDocuments = [];
        $scope.questionnaireDoc = null;
        $scope.uploadOption.questionnaireDoc.valid = true;
        $scope.uploadOption.questionnaireDoc.submitBtn = false;
        $scope.uploadOption.questionnaireDoc.removeBtn = false;
        $scope.uploadOption.questionnaireDoc.qDocDesc = false;
        $scope.uploadOption.questionnaireDoc.description = "";
        $scope.uploadOption.error = false;

        loadingDialogService.hideProcessingPleaseWait();

      } else {
        growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
        console.log(responseData);
        setTimeout(function() {
          loadingDialogService.hideProcessingPleaseWait();
        }, 500);
      }
    });
  }
  $scope.removeImgAttachment = function(){
    $scope.imageFile = null;
    $scope.uploadOption.imageFile.valid = true;
    $scope.uploadOption.imageFile.submitBtn = false;
    $scope.uploadOption.imageFile.removeBtn = false;
  }
  $scope.removeQDocAttachment = function(){
    $scope.questionnaireDoc = null;
    $scope.uploadOption.questionnaireDoc.valid = true;
    $scope.uploadOption.questionnaireDoc.submitBtn = false;
    $scope.uploadOption.questionnaireDoc.removeBtn = false;
    $scope.uploadOption.questionnaireDoc.qDocDesc = false;
    $scope.uploadOption.questionnaireDoc.description = "";
  }
  $scope.uploadQDoc = function(docFile, status) {
    // upload on file select or drop

    if($scope.authorization.changeQuestionnaire === false){
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadDoc").innerHTML = "<p class='message'>You are not authorized to upload report document</p>";
      $timeout(function() {
        $scope.questionnaireDoc = null; // clear the selected file
        document.getElementById("loading_uploadDoc").className = "";
        document.getElementById("loading_uploadDoc").innerHTML = "";
      }, 5000);
    }else{
      loadingDialogService.showUploadingPleaseWait('Uploading Document, Please wait...', '0');
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      Upload.upload({
            url: uploadPath,
            data: {
              file: docFile,
              description: $scope.uploadOption.questionnaireDoc.description,
            }
          })
          .then(function(response) {
            // docFile.result = response.data;

            $scope.selectedProject.questionnaireDocuments.push({
              name: response.config.data.file.name,
              link: response.data,
              description: $scope.uploadOption.questionnaireDoc.description,
              docType: '',
              version: '',
            });


            $scope.questionnaireDoc = null; // clear the selected file
            document.getElementById("loading_uploadDoc").className = "";
            document.getElementById("questionnaireDoc").value = "";
            $scope.uploadOption.questionnaireDoc.valid = true;
            $scope.uploadOption.questionnaireDoc.submitBtn = true;
            $scope.uploadOption.questionnaireDoc.removeBtn = false;
            $scope.uploadOption.questionnaireDoc.qDocDesc = false;

            $scope.uploadOption.error = false;
            $scope.uploadOption.errorMessage = "";
            growl.info("You have successfully uploaded survey document.", {
              ttl: 5000
            });
            setTimeout(function() {
              loadingDialogService.hideUploadingPleaseWait();
            }, 500);
          }, function(response) {
            if (response.status > 0){
              $scope.uploadOption.questionnaireDoc.valid = false;
              $scope.uploadOption.questionnaireDoc.submitBtn = true;
              $scope.uploadOption.questionnaireDoc.removeBtn = true;
              $scope.uploadOption.questionnaireDoc.qDocDesc = false;
              $scope.uploadOption.error = true;
              $scope.uploadOption.errorMessage = "Failed to upload doc file " + questionnaireDoc.name + " " + response.status + ': ' + response.data;
            }
            loadingDialogService.hideUploadingPleaseWait();
            document.getElementById("loading_uploadDoc").className = "";
          }, function(evt) {
            // Math.min is to fix IE which reports 200% sometimes
            // docFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            if (document.getElementById("progressPercentage")) {
              document.getElementById("progressPercentage").style.width = progressPercentage + '%';
            }
          });
    }

  };

  $scope.uploadImage = function(imageFile, status) {
    // upload on file select or drop

    if($scope.authorization.changeQuestionnaire === false){
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadDoc").innerHTML = "<p class='message'>You are not authorized to upload report document</p>";
      $timeout(function() {
        $scope.imageFile = null; // clear the selected file
        document.getElementById("loading_uploadDoc").className = "";
        document.getElementById("loading_uploadDoc").innerHTML = "";
      }, 5000);
    }else{
      loadingDialogService.showUploadingPleaseWait('Uploading image, Please wait...', '0');
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      var uploadPath = httpServerService.getServerPath() + "ws/uploadQuestionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      Upload.upload({
            url: uploadPath,
            data: {
              file: imageFile,
              description: '',
            }
          })
          .then(function(response) {
            // docFile.result = response.data;
            $scope.selectedProject.images.push({
              recordID: sharedService.generateUniqueID(),
              name: response.config.data.file.name,
              link: response.data,
              file: response.config.data.file
            });


            $scope.imageFile = null; // clear the selected file
            document.getElementById("loading_uploadDoc").className = "";
            document.getElementById("imageFile").value = "";
            $scope.uploadOption.imageFile.valid = true;
            $scope.uploadOption.imageFile.submitBtn = false;
            $scope.uploadOption.imageFile.removeBtn = false;
            $scope.uploadOption.error = false;
            $scope.uploadOption.errorMessage = "";
            growl.info("You have successfully uploaded a new image.", {
              ttl: 5000
            });
            setTimeout(function() {
              loadingDialogService.hideUploadingPleaseWait();
            }, 500);
          }, function(response) {
            if (response.status > 0){
              $scope.uploadOption.imageFile.valid = false;
              $scope.uploadOption.imageFile.submitBtn = true;
              $scope.uploadOption.imageFile.removeBtn = true;
              $scope.uploadOption.error = true;
              $scope.uploadOption.errorMessage = "Failed to upload image file " + imageFile.name + " " + response.status + ': ' + response.data;
            }
            growl.error("Oops!Seems something went wrong. If the issue persists, please contact support@validateit.com.");
            document.getElementById("loading_uploadDoc").className = "";
            loadingDialogService.hideUploadingPleaseWait();

          }, function(evt) {
            // Math.min is to fix IE which reports 200% sometimes
            // docFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            if (document.getElementById("progressPercentage")) {
              document.getElementById("progressPercentage").style.width = progressPercentage + '%';
            }
          });
    }

  };
  $scope.prepareToRemoveUploadedImage = function(recordID, imageFile) {
    ModalService.showModal({
      templateUrl: "views/modal_templates/confirm.html",
      controller: "dialogCtrl",
      inputs: {
        data: {
          modalTitle: "Delete Image",
          modalText: "Are you sure you want to delete " + imageFile.name + " from your project?",
          buttonText: "Delete"
        }
      },
    }).then(function(modal) {
      modal.close.then(function(result) {
        if (result.result === 'delete') {
          $scope.removeUploadedImage(recordID, imageFile);
        }
      });
    });
  }

  /* *
   * Method: removeUploadedImage
   * Parameters:
   * Description: removeUploadedImage method will remove attached image from imaged list
   * */
  $scope.removeUploadedImage = function(recordID, imageFile) {
    loadingDialogService.showProcessingPleaseWait('Deleting image. Please wait...');
    httpServerService.makeHttpRequest("questionData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId + "&filename=" + imageFile.name+"&mimetype="+imageFile.type, "delete").then(function(responseData) {
      if (responseData.status == 200) {
        console.log("Success!!!");
        console.log(responseData);

        growl.info("You have successfully deleted your image from this project.", {
          ttl: 5000
        });
        var fileIndex = $scope.selectedProject.images.map(function(item){ return item.recordID; }).indexOf(recordID);

        $scope.selectedProject.images.splice(fileIndex, 1);

        setTimeout(function() {
          loadingDialogService.hideProcessingPleaseWait();
        }, 500);
      } else {
        setTimeout(function() {
          loadingDialogService.hideProcessingPleaseWait();
        }, 500);
        $scope.uploadOption.error = true;
        $scope.uploadOption.errorMessage = "Sorry, Something unexpected happened, please contact support@validateit.com.";
        $timeout(function() {
          $scope.uploadOption.error = false;
          $scope.uploadOption.message = "";
        }, 10000);
      }
    });
  }

  // This function will do the necessary changes to return to project list by status page from details page
  $scope.backToProjectList = function() {
    var activeTab = $scope.showAllTabs();
    $scope.clearFlags(); // hide the forms and charts that should only show in specified page
    $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);
    if ($scope.breadcrumb.lists.length >= 2) {
      $scope.breadcrumb.lists[1].onClickFnc = "";
    }
    $scope.displayProjectList($scope.projectStatus[activeTab].code);

    //$scope.projectStatus[activeTab].show = true;
    //$scope.projectStatus[activeTab].active = 'active';
    $scope.showProjectDetailsFlag = false;
    $location.search('');
  }
  $scope.showMoreDetails = function() {
    if ($scope.selectedProject.showMoreInfo == false) {
      toggleAll('show', 'box-project-details');
      $scope.selectedProject.detailsBoxClass = 'zoomIn animated';
      $scope.selectedProject.showMoreInfo = true;
      $scope.selectedProject.showMoreInfoBtnIcon = 'fa-chevron-circle-up'
    } else {
      $scope.selectedProject.detailsBoxClass = 'zoomOut animated';
      $scope.selectedProject.showMoreInfo = false;
      $scope.selectedProject.showMoreInfoBtnIcon = 'fa-chevron-circle-down'
    }
  }

  function toggleAll(type, className) {
    var elems = document.getElementsByClassName(className),
      i;
    if (type == 'show') {
      for (i = 0; i < elems.length; i++) {
        var elem = elems[i];
        elem.style.display = 'inline-block';
      }
    } else {
      for (i = 0; i < elems.length; i++) {
        var elem = elems[i];
        elem.style.display = 'none';
      }
    }

  }


  $scope.formatProjectNote = function() {
    // assign colorClass

    var current_color = "",
      new_color = "";
    for (var i = 0; i < $scope.projectNote.list.length; i++) {
      if (current_color == "") {
        current_color = $scope.colorsClasses[Math.floor(Math.random() * $scope.colorsClasses.length)];
        new_color = current_color;
      } else {
        //new_color = current_color;
        new_color = $scope.getRandomColorClass(current_color);
        //while(current_color === new_color){
        //  new_color = $scope.colorsClasses[Math.floor(Math.random()*$scope.colorsClasses.length)];
        //}
      }
      current_color = new_color;
      $scope.projectNote.list[i].colorClass = new_color;
      $scope.projectNote.list[i].text = $scope.projectNote.list[i].name.charAt(0).toUpperCase();
    }
  }
  $scope.getRandomColorClass = function(exceptColor) {
    var new_color = "",
      current_color = "";
    current_color = exceptColor;
    new_color = current_color;
    console.log("New Col: " + new_color + " Curr Col:" + current_color);
    while (current_color === new_color) {
      new_color = $scope.colorsClasses[Math.floor(Math.random() * $scope.colorsClasses.length)];
      console.log(">>>> New Col: " + new_color + " Curr Col:" + current_color);
    }

    return new_color;
  }

  /* *
   * Method: getCostByCommunity
   * Parameters: Number of Respondents, Number of Questions
   * Description: This method will return the cost per community by number of respondents and number of questions
   * */
  $scope.getCostByCommunity = function(respondents, questions) {
    var cost = 0;
    for (var i = 0; i < $scope.priceTable.priceChar[respondents].length; i++) {
      if (questions <= $scope.priceTable.priceChar[respondents][i].max) {
        cost = $scope.priceTable.priceChar[respondents][i].price;
        break;
      }
    }
    return cost;
  }

  /* *
   * Method: displayApprovalRequiredProjectDetails
   * Parameters:
   * Description: This method make a web service call to get details of any project which is pending for approval and display details information.
   * */
  $scope.displayApprovalRequiredProjectDetails = function(index) {
    $scope.hideProjectList();
    var projectID = $scope.approvalRequiredProjects[index].projectId;
    /* @TODO
     * Make a web service call to retrieve project details by project id
     */
    $scope.selectedProject.name = $scope.approvalRequiredProjects[index].name;
    $scope.selectedProject.community = $scope.approvalRequiredProjects[index].community;
    $scope.newProjectShownFlag = false;
    $scope.showBreadcrumbNav = true;
    $scope.showProjectDetailsFlag = true;
    $scope.activeProjectName = $scope.approvalRequiredProjects[index].name;
  }

  /* *
   * Method: displayInProgressProjectDetails
   * Parameters:
   * Description: This method make a web service call to get details of any project which is in progress, by project id and display details information.
   * */
  $scope.displayInProgressProjectDetails = function(index) {
    $scope.hideProjectList();
    $scope.selectedProject.projectId = $scope.inProgressProjects[index].projectID;
    /* @TODO
     * Make a web service call to retrieve project details by project id
     */
    $scope.selectedProject.name = $scope.inProgressProjects[index].name;
    $scope.selectedProject.community = $scope.inProgressProjects[index].community;
    $scope.newProjectShownFlag = false;
    $scope.showBreadcrumbNav = true;
    $scope.showProjectDetailsFlag = true;
    $scope.activeProjectName = $scope.inProgressProjects[index].name;
    // $scope.showUploadDocAndExcel = true;
  }

  /* *
   * Method: displayCompletedProjectDetails
   * Parameters:
   * Description: This method make a web service call to get details of any completed project by project id and display details information.
   * */
  $scope.displayCompletedProjectDetails = function(index) {
    $scope.hideProjectList();
    var projectID = $scope.completedProjects[index].projectId;
    /* @TODO
     * Make a web service call to retrieve project details by project id
     */
    $scope.selectedProject.name = $scope.completedProjects[index].name;
    $scope.selectedProject.community = $scope.completedProjects[index].community;
    $scope.newProjectShownFlag = false;
    $scope.showBreadcrumbNav = true;
    $scope.showProjectDetailsFlag = true;
    $scope.activeProjectName = $scope.completedProjects[index].name;
    $scope.showCompletedProjectResult = true; // show the questions statistics of the survey
    setTimeout(function() {
      $scope.displaySelectedQuestion(0)
    }, 10); // If time out is not set, the width of the chart are not set correctly
  }

  $scope.displaySelectedQuestion = function(index) {
      $scope.selectedQuestion = $scope.questions[index];
      $scope.selectedQuestionIndex = index; // for setting the style of the selected question row
      // var arrayLength = $scope.selectedQuestion.answers.length + 1;
      // var columns_1 = new Array(arrayLength); // answers array (e.g. ['x', 'Strongly disagree', 'Somewhat disagree', 'Neutral / Not Sure', 'Somewhat agree', 'Strongly agree'])
      // var columns_2 = new Array(arrayLength); // percentages array (e.g. ['Answers', 10.6, 12.9, 46.8, 26.6, 3.0])
      // columns_1[0] = 'x';
      // columns_2[0] = 'Answers';
      // for (var i = 0; i < $scope.selectedQuestion.answers.length; i++) {
      //   var answer = $scope.selectedQuestion.answers[i];
      //   columns_1[i + 1] = answer.answerText;
      //   columns_2[i + 1] = answer.percentage;
      // }
      var arrayLength = $scope.selectedQuestion.answers.length;
      var chartData = new Array(arrayLength);    
      for (var i = 0; i < $scope.selectedQuestion.answers.length; i++) {
        var answer = $scope.selectedQuestion.answers[i];
        chartData[i] = {c: [
          {v: answer.answerText},
          {v: answer.percentage},
        ]};
      }

    // Scope Data for Google chart
    $scope.chartObject = {};
    $scope.chartObject.type = "BarChart";
    
    // $scope.onions = [
    //     {v: "Onions"},
    //     {v: 3}
    // ];

    $scope.chartObject.data = {
      "cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Percentage (%)", type: "number"}
      ], 
      "rows": chartData
    }

    $scope.chartObject.options = {
        'title': 'Answers Statistics',
        'colors': ['#337AB7'],
        'backgroundColor': 'transparent',
        'hAxis': {minValue: 0}
    };

    // Scope data for C3js chart
      // $scope.myData = {
      //   padding: {
      //     top: 0,
      //     right: 0,
      //     bottom: 0,
      //     left: 150
      //   },
      //   // bar: {
      //   //   width: 35,
      //   // },
      //   data: {
      //     x: 'x',
      //     labels: true,
      //     columns: [
      //       columns_1, columns_2
      //     ],
      //     groups: [
      //       ['Answers']
      //     ],
      //     type: 'bar',
      //   },
      //   axis: {
      //     rotated: true,
      //     x: {
      //       type: 'category',
      //       tick: {
      //         multiline: true
      //       },
      //     },
      //     y: {
      //       label: 'Percentage ( % )',
      //     },
      //   },
      // }
    }
    // -----------------------------------------------------------------------------
    /**
     * description: To Solve d3.js error of "Invalid value for <g> attribute transform="translate(NaN, 0)" when go the other pages
     */
  // $scope.$on('$locationChangeStart', function(event) { // solve d3.js error of "Invalid value for <g> attribute transform="translate(NaN, 0)"
  //   window.onresize = null;
  // });
  // -----------------------------------------------------------------------------

  $scope.SelectPreviousQuestion = function() {
    if ($scope.selectedQuestionIndex === 0) {
      $scope.selectedQuestionIndex = $scope.questions.length - 1;
    } else {
      $scope.selectedQuestionIndex--;
    }
    $scope.displaySelectedQuestion($scope.selectedQuestionIndex);
  }

  $scope.SelectNextQuestion = function() {
    if ($scope.selectedQuestionIndex === ($scope.questions.length - 1)) {
      $scope.selectedQuestionIndex = 0;
    } else {
      $scope.selectedQuestionIndex++;
    }
    $scope.displaySelectedQuestion($scope.selectedQuestionIndex);
  }

  $scope.uploadDoc = function(docFile, status) {
    // upload on file select or drop
    console.log(">>>> " + $scope.getActiveTab());
    if($scope.authorization.changeReportAndSurveyData === false){
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadDoc").innerHTML = "<p class='message'>You are not authorized to upload report document</p>";
      $timeout(function() {
        $scope.reportDoc = null; // clear the selected file
        document.getElementById("loading_uploadDoc").className = "";
        document.getElementById("loading_uploadDoc").innerHTML = "";
      }, 5000);
    }else{
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      var uploadPath = httpServerService.getServerPath() + "ws/uploadReportDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      Upload.upload({
            url: uploadPath,
            data: {
              file: docFile,
              'description': ""
            }
          })
          .then(function(response) {
            // docFile.result = response.data;
            $scope.DocFormTitle = "Uploaded Report Document";
            if (status === "inProgressProjects") {
              var index = $scope.httpResponses.inProgressProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            } else if (status === "completedProjects") {
              var index = $scope.httpResponses.completedProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            }
            $scope.httpResponses[status][index].reportdocObj = {
              name: "",
              url: ""
            };
            $scope.httpResponses[status][index].reportdocObj.name = docFile.name;
            $scope.httpResponses[status][index].reportdocObj.url = response.data;
            $scope.selectedProject.reportdocObj = $scope.httpResponses[status][index].reportdocObj;

            var docName = docFile.name;
            var docUrl = response.data;
            $scope.selectedProject.reportdoc = {
              docName: docUrl
            }

            $scope.showUploadDocForm = false;
            $scope.reportDoc = null; // clear the selected file
            document.getElementById("loading_uploadDoc").className = "";
            $scope.httpResponses[status][index].reportdocModified = true;


            if ($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false && $scope.getActiveTab() != 'completed') {
              $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true : false;
              $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + $scope.selectedProject.projectId + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
                  $scope.selectedProject.buttons.complete.btnText = 'Complete';
              $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
            } else {
              $scope.selectedProject.buttons.complete.show = false;
            }

            $scope.uploadOption.reportDoc.valid = true;
            $scope.uploadOption.reportDoc.buttonDisabled = false;
            $scope.uploadOption.error = false;
            $scope.uploadOption.errorMessage = "";
            growl.info("You have successfully uploaded survey document.", {
              ttl: 5000
            });
          }, function(response) {
            if (response.status > 0){
              $scope.uploadOption.reportDoc.valid = false;
              $scope.uploadOption.reportDoc.buttonDisabled = true;
              $scope.uploadOption.error = true;
              $scope.uploadOption.errorMessage = "Failed to upload doc file " + docFile.name + " " + response.status + ': ' + response.data;
            }

            document.getElementById("loading_uploadDoc").className = "";
          }, function(evt) {
            // Math.min is to fix IE which reports 200% sometimes
            // docFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          });
    }

  };
  $scope.deleteDoc = function(status) {
    console.log(">>>> " + $scope.getActiveTab());
    if($scope.authorization.changeReportAndSurveyData === false){
      document.getElementById("loading_uploadDoc").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadDoc").innerHTML = "<p class='message'>You are not authorized to delete report document</p>";
      $timeout(function() {
        $scope.reportDoc = null; // clear the selected file
        document.getElementById("loading_uploadDoc").className = "";
        document.getElementById("loading_uploadDoc").innerHTML = "";
      }, 5000);
    }else{
      document.getElementById("loading_uploadedDoc").className = "loading"; // display the loading beackground
      var deletePath = "reportDoc?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      httpServerService.makeHttpRequest(deletePath, "delete")
          .then(function(response) {
            console.log("Successfully deleted report document");
            if (status === "inProgressProjects") {
              var index = $scope.httpResponses.inProgressProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            } else if (status === "completedProjects") {
              var index = $scope.httpResponses.completedProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            }
            $scope.httpResponses[status][index].reportdocObj.name = "";
            $scope.httpResponses[status][index].reportdocObj.url = "";
            $scope.selectedProject.reportdocObj = $scope.httpResponses[status][index].reportdocObj;

            // $scope.selectedProject.reportdoc = null;
            $scope.DocFormTitle = "Upload Report Document";
            $scope.showUploadDocForm = true;
            document.getElementById("loading_uploadedDoc").className = "";
            $scope.httpResponses[status][index].reportdocModified = true;
            if ($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false && $scope.getActiveTab() != 'completed') {
              $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true : false;
              $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + $scope.selectedProject.projectId + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
                  $scope.selectedProject.buttons.complete.btnText = 'Complete';
              $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
            } else {
              $scope.selectedProject.buttons.complete.show = false;
            }
          }, function(response) {
            $scope.uploadOption.reportDoc.valid = false;
            $scope.uploadOption.reportDoc.buttonDisabled = true;
            $scope.uploadOption.error = true;
            $scope.uploadOption.errorMessage = "Failed to delete report document";
            document.getElementById("loading_uploadedDoc").className = "";
          })
    }

  };

  $scope.uploadExcel = function(excelFile, status) {
    if($scope.authorization.changeReportAndSurveyData === false){
      document.getElementById("loading_uploadExcel").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadExcel").innerHTML = "<p class='message'>You are not authorized to upload survey response data</p>";
      $timeout(function() {
        $scope.reportExcel = null; // clear the selected file
        document.getElementById("loading_uploadExcel").className = "";
        document.getElementById("loading_uploadExcel").innerHTML = "";
      }, 5000);
    }else{
      document.getElementById("loading_uploadExcel").className = "loading"; // display the loading beackground
      var uploadPath = httpServerService.getServerPath() + "ws/uploadSurveyResponseData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      Upload.upload({
            url: uploadPath,
            data: {
              file: excelFile,
              'description': ""
            }
          })
          .then(function(response) {
            $scope.ExcelFormTitle = "Uploaded Survey Response Document";
            if (status === "inProgressProjects") {
              var index = $scope.httpResponses.inProgressProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            } else if (status === "completedProjects") {
              var index = $scope.httpResponses.completedProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            }
            $scope.httpResponses[status][index].surveyResponseDataObj = {
              name: "",
              url: ""
            };
            $scope.httpResponses[status][index].surveyResponseDataObj.name = excelFile.name;
            $scope.httpResponses[status][index].surveyResponseDataObj.url = response.data;
            $scope.selectedProject.surveyResponseDataObj = $scope.httpResponses[status][index].surveyResponseDataObj;

            var surveyResponseName = excelFile.name;
            var surveyResponseUrl = response.data;
            $scope.selectedProject.surveyResponseData = {
              surveyResponseName: surveyResponseUrl
            };

            $scope.showUploadExcelForm = false;
            $scope.reportExcel = null; // clear the selected file
            document.getElementById("loading_uploadExcel").className = "";
            $scope.httpResponses[status][index].surveyResponseDataModified = true;

            $scope.loadSurveyResult($scope.selectedProject.projectId);    // display the questions table and chart

            if ($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false && $scope.getActiveTab() != 'completed') {
              $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true : false;
              $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + $scope.selectedProject.projectId + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
                  $scope.selectedProject.buttons.complete.btnText = 'Complete';
              $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
            } else {
              $scope.selectedProject.buttons.complete.show = false;
            }
            $scope.uploadOption.reportExcel.valid = true;
            $scope.uploadOption.reportExcel.buttonDisabled = false;
            $scope.uploadOption.error = false;
            $scope.uploadOption.errorMessage = "";
            growl.info("You have successfully uploaded survey data.", {
              ttl: 5000
            });
          }, function(response) {
            if (response.status > 0){
              $scope.uploadOption.reportExcel.valid = false;
              $scope.uploadOption.reportExcel.buttonDisabled = true;
              $scope.uploadOption.error = true;
              $scope.uploadOption.errorMessage = "Failed to upload survey response document " + excelFile.name + " " + response.status + ': ' + response.data;
            }
            document.getElementById("loading_uploadExcel").className = "";
          }, function(evt) {
            // Math.min is to fix IE which reports 200% sometimes
            // excelFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          });
    }

  }
  $scope.deleteExcel = function(status) {
    if($scope.authorization.changeReportAndSurveyData === false){
      document.getElementById("loading_uploadedExcel").className = "loading"; // display the loading beackground
      document.getElementById("loading_uploadedExcel").innerHTML = "<p class='message'>You are not authorized to delete survey response data</p>";
      $timeout(function() {
        $scope.reportDoc = null; // clear the selected file
        document.getElementById("loading_uploadedExcel").className = "";
        document.getElementById("loading_uploadedExcel").innerHTML = "";
      }, 5000);
    }else{
      document.getElementById("loading_uploadedExcel").className = "loading"; // display the loading beackground
      var deletePath = "surveyResponseData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId;
      httpServerService.makeHttpRequest(deletePath, "delete")
          .then(function(response) {
            console.log("Successfully deleted Survey Response document");
            if (status === "inProgressProjects") {
              var index = $scope.httpResponses.inProgressProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            } else if (status === "completedProjects") {
              var index = $scope.httpResponses.completedProjects.map(function(item) {
                return item.projectId;
              }).indexOf($scope.selectedProject.projectId);
            }
            $scope.httpResponses[status][index].surveyResponseDataObj.name = "";
            $scope.httpResponses[status][index].surveyResponseDataObj.url = "";
            $scope.selectedProject.surveyResponseDataObj = $scope.httpResponses[status][index].surveyResponseDataObj;

            // $scope.selectedProject.surveyResponseData = null;
            $scope.ExcelFormTitle = "Upload Survey Response Document";
            $scope.showUploadExcelForm = true;
            document.getElementById("loading_uploadedExcel").className = "";
            $scope.httpResponses[status][index].surveyResponseDataModified = true;

            if ($scope.showUploadDocForm === false && $scope.showUploadExcelForm === false && $scope.getActiveTab() != 'completed') {
              $scope.selectedProject.buttons.complete.show = $scope.authorization.changeState === true ? true : false;
              $scope.selectedProject.buttons.complete.onClickFnc = "prepareToComplete({projectID: " + $scope.selectedProject.projectId + ", name: '" + $scope.selectedProject.name + "'}, 'inProgressProjects')",
                  $scope.selectedProject.buttons.complete.btnText = 'Complete';
              $scope.selectedProject.buttons.complete.btnClass = 'btn-success';
            } else {
              $scope.selectedProject.buttons.complete.show = false;
            }
            $scope.showCompletedProjectResult = false;    // hide the questions table and chart
            growl.info("Successfully deleted Survey Response document.", {
              ttl: 5000
            });
          }, function(response) {
            console.log("Failed to delete Survey Response document");
            $scope.uploadOption.reportExcel.valid = false;
            $scope.uploadOption.reportExcel.buttonDisabled = true;
            $scope.uploadOption.error = true;
            $scope.uploadOption.errorMessage = "Failed to Survey Response report document";

            document.getElementById("loading_uploadedExcel").className = "";
          });
    }

  }

  $scope.loadSurveyResult = function(projectId) {
    $scope.surveyResponseDataErrorMsg = "";
    httpServerService.makeHttpRequest("surveyResponseData?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectId, "get").then(function(responseData) {
      if (responseData.status == 200) {
        console.log('Questions of selected project' + '\n' + responseData.data);
        $scope.questions = responseData.data;

        $scope.showCompletedProjectResult = true; // show the questions statistics of the survey
        $scope.displaySelectedQuestion(0);
        // setTimeout(function() {
        //   $scope.displaySelectedQuestion(0)
        // }, 10); // If time out is not set, the width of the chart are not set correctly
      } else {
        $scope.surveyResponseDataErrorMsg = "Failed to load Survey Response Data."
        console.log("Get Project surveyResponseData Failed");
      }
    });
  }

  /**
   * Hide the forms and charts that should only show in specified page
   */
  $scope.clearFlags = function() {
    $scope.showCompletedProjectResult = false;
    $scope.showDocExcelUploadForms = false;
  };

  $scope.surveyFileChanged = function(files, file, newFiles, duplicateFiles, invalidFiles, event, type){

     if(invalidFiles.length>0){
       console.log(invalidFiles[0].error);
      $scope.uploadOption[type].valid = false;
      $scope.uploadOption[type].buttonDisabled = true;
      $scope.uploadOption.error = true;
      $scope.uploadOption.errorMessage = "Attached file exceeds 10MB in size, please upload a smaller one.";
    }else{
      $scope.uploadOption[type].valid = true;
      $scope.uploadOption[type].buttonDisabled = false;
      $scope.uploadOption.error = false;
      $scope.uploadOption.errorMessage = "";
    }
  }


  $scope.prepareToDeleteProject = function(project, state) {
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Delete Project";
    $rootScope.modal.text = "Are you sure you want to delete " + project.name + "? This cannot be undone."
    document.getElementById("modalText").innerHTML = $scope.modal.text;
    $rootScope.modal.buttons.delete.show = true;
    $rootScope.modal.buttons.delete.fnc = "deleteProject";
    $rootScope.modal.buttons.delete.params = "'" + project.projectID + "', '" + state + "', '" + project.name + "'";
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = false;
    $rootScope.modal.buttons.custom.text = '';
    $rootScope.modal.buttons.custom.fnc = "";
    $rootScope.modal.buttons.custom.params = "";
    $scope.resetModalInputs();
    $rootScope.modal.show = true;

    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  }


  $scope.deleteProject = function(projectID, projectState, projectName) {
    loadingDialogService.showProcessingPleaseWait('Deleting project. Pleasing wait...');
    httpServerService.makeHttpRequest("project?teamName=" + usersService.getUserObject().teamname + "&projectId=" + projectID, "delete").then(function(responseData) {
      if (responseData.status == 200) {
        // success
        $scope.hideProjectFromList(projectState, projectID);
        $rootScope.modal.show = false;
        $rootScope.closeModal();
        $scope.backToProjectList();
        growl.info("You have successfully deleted <b>" + projectName + "</b>.", {
          ttl: 5000
        });

        var state = '';
        switch (projectState) {
          case 'draftProjects':
            state = 'draft';
            break;
          case 'approvalRequiredProjects':
            state = 'approvalRequired';
            break;
          case 'approvedProjects':
            state = 'approved';
            break;
        }
        $scope.totalCount[state] = $scope.totalCount[state] - 1;
        setTimeout(function() {
          loadingDialogService.hideProcessingPleaseWait();
        }, 300);
      } else {
        console.log(" **** WS deleteProject Failed ****");
        console.log(responseData);
        setTimeout(function() {
          loadingDialogService.hideProcessingPleaseWait();
        }, 300);
      }
    });
  }
  $scope.prepareToApprove = function(project, projectState) {
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Approve Project";
    $rootScope.modal.text = "Are you sure you want to approve " + project.name + "?"
    document.getElementById("modalText").innerHTML = $scope.modal.text;
    $rootScope.modal.buttons.delete.show = false;
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = true;
    $rootScope.modal.buttons.custom.text = 'Approved';
    $rootScope.modal.buttons.custom.fnc = "approve";
    $rootScope.modal.buttons.custom.params = "'" + project.projectID + "', '" + projectState + "', '" + project.name + "'";
    $scope.resetModalInputs();

    $rootScope.modal.show = true;
    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.3)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  };

  $scope.resetModalInputs = function(){
    $rootScope.modal.input.show = false;
    $rootScope.modal.input.value = '';
    $rootScope.modal.input.required = false;
    $rootScope.modal.input.dependent = '';

    $rootScope.modal.input.textarea.show = false;
    $rootScope.modal.input.textarea.value = '';
    $rootScope.modal.input.textarea.required = false;
    $rootScope.modal.input.textarea.dependent = '';

    $rootScope.modal.input.select.show = false;
    $rootScope.modal.input.select.value = '';
    $rootScope.modal.input.select.required = false;
    $rootScope.modal.input.select.listData = [];
    $rootScope.modal.input.select.dependent = '';
  }
  $scope.prepareToRequireChanges = function(project, state) {

    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Changes Required";
    $rootScope.modal.text = "Are you sure you want to make changes to " + project.name + "? Please add some notes regarding the changes required."
    document.getElementById("modalText").innerHTML = $scope.modal.text;
    $rootScope.modal.buttons.delete.show = false;
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = true;
    $rootScope.modal.buttons.custom.text = 'Changes Required';
    $rootScope.modal.buttons.custom.fnc = "projectRequireChanges";
    $rootScope.modal.buttons.custom.params = "'" + project.projectID + "', '" + state + "', '" + project.name + "'";
    $scope.resetModalInputs();
    $rootScope.modal.input.show = true;
    $rootScope.modal.input.value = '';
    $rootScope.modal.input.required = true;
    $rootScope.modal.input.dependent = 'custom';

    $rootScope.modal.input.textarea.show = true;
    $rootScope.modal.input.textarea.value = '';
    $rootScope.modal.input.textarea.required = true;
    $rootScope.modal.input.textarea.dependent = 'custom';

    $rootScope.modal.input.select.show = true;
    $rootScope.modal.input.select.value = '';
    $rootScope.modal.input.select.required = true;
    $rootScope.modal.input.select.listData = $scope.userEmailList;

    /*    [
      {returnDataListID: sharedService.generateUniqueID(), firstname: 'Fn 1', lastname: 'Ln 1', emailaddress: 'name_1_@email.com'},
      {returnDataListID: sharedService.generateUniqueID(), firstname: 'Fn 2', lastname: 'Ln 2', emailaddress: 'name_2_@email.com'},
      {returnDataListID: sharedService.generateUniqueID(), firstname: 'Fn 3', lastname: 'Ln 3', emailaddress: 'name_3_@email.com'},
      {returnDataListID: sharedService.generateUniqueID(), firstname: 'Fn 4', lastname: 'Ln 4', emailaddress: 'name_4_@email.com'}
    ];*/
    $rootScope.modal.input.select.dependent = 'custom';
    $rootScope.modal.show = true;
    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  }

  $scope.reqChangeAssignToUpdated = function(index){
    console.log("reqChangeAssignToUpdated");
    console.log("Inded: "+index);
    console.log("Value:"+$rootScope.modal.input.select.value);
    console.log($rootScope.modal.input.select.value);
  }
  $scope.approve = function(projectID, projectState, name) {
    httpServerService.makeHttpRequest("projectState", "post", {
      teamName: usersService.getUserObject().teamname,
      projectId: projectID
    }).then(function(responseData) {
      if (responseData.status == 200) {
        console.log("Success!!!");
        console.log(responseData);
        $scope.hideProjectFromList(projectState, projectID);
        $scope.totalCount.approvalRequired = $scope.totalCount.approvalRequired - 1;
        $scope.totalCount.approved = $scope.totalCount.approved + 1;

        growl.info("You have successfully approved <b>"+name+ "</b>", {
          ttl: 5000
        });
        $scope.displayProjectList('approved');
        $scope.backToProjectList();
        $rootScope.modal.show = false;
        $rootScope.resetModal();
      } else {
        console.log("Error : ");
        console.log(responseData);
      }
    });

  }

  $scope.projectRequireChanges = function(projectID, projectState, projectName) {
    //console.log(' ----> projectRequireChanges '+projectState);
    var validation = (($rootScope.modal.input.show==true ? false:true) || ( $rootScope.modal.input.textarea.dependent == 'custom' ? ( $rootScope.modal.input.textarea.value !='' ? false:true):false) || ( $rootScope.modal.input.select.dependent == 'custom' ? ( $rootScope.modal.input.select.value != '' ? false:true):false));
    if(validation===false){
      httpServerService.makeHttpRequest("projectState", "post", {
        teamName: usersService.getUserObject().teamname,
        projectId: projectID,
        newState: 'D',
        notes: $rootScope.modal.input.textarea.value,
        assignToEmail: $rootScope.modal.input.select.value.email,
        assignToFirstName: $rootScope.modal.input.select.value.firstName,
        assignToLastName: $rootScope.modal.input.select.value.lastName,
      }).then(function(responseData) {
        if (responseData.status == 200) {
          console.log("Success!!!");
          console.log(responseData);
          $scope.hideProjectFromList(projectState, projectID);
          growl.info("You have successfully sent back <b>"+projectName+"</b> for changes.", {
            ttl: 5000
          });
          //  //approvalRequiredProjects
          if (projectState === 'approvedProjects') {
            $scope.totalCount.approved = $scope.totalCount.approved - 1;
          } else if (projectState === 'approvalRequiredProjects') {
            $scope.totalCount.approvalRequired = $scope.totalCount.approvalRequired - 1;
          }
          $scope.totalCount.draft = $scope.totalCount.draft + 1;
          $scope.displayProjectList('draft')
          $scope.backToProjectList();
          $rootScope.modal.show = false;
          $rootScope.resetModal();
        } else {
          console.log("Error : ");
          console.log(responseData);
        }
      });
    }

  }

  $scope.prepareToStartSurvey = function(project, projectState) {
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Start " + project.name + " project ?";
    $rootScope.modal.text = "You are about to start project <span class='hightlight'>" + project.name + "</span>. Are you sure?"
    document.getElementById("modalText").innerHTML = $scope.modal.text;
    $rootScope.modal.buttons.delete.show = false;
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = true;
    $rootScope.modal.buttons.custom.text = 'Start Survey';
    $rootScope.modal.buttons.custom.fnc = "startSurvey";
    $rootScope.modal.buttons.custom.params = "'" + project.projectID + "', '" + projectState + "', '" + project.name + "'";
    $rootScope.modal.input.show = false;
    $rootScope.modal.input.value = '';
    $rootScope.modal.input.required = false;
    $rootScope.modal.input.dependent = 'custom';

    $rootScope.modal.show = true;
    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  }

  $scope.prepareToComplete = function(project, projectState) {
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Complete " + project.name + " project ?";
    $rootScope.modal.text = "You are about to complete project <span class='hightlight'>" + project.name + "</span>. Are you sure?"
    document.getElementById("modalText").innerHTML = $scope.modal.text;
    $rootScope.modal.buttons.delete.show = false;
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = true;
    $rootScope.modal.buttons.custom.text = 'Complete';
    $rootScope.modal.buttons.custom.fnc = "completeProject";
    $rootScope.modal.buttons.custom.params = "'" + project.projectID + "', '" + projectState + "', '" + project.name + "'";
    $rootScope.modal.input.show = false;
    $rootScope.modal.input.value = '';
    $rootScope.modal.input.required = false;
    $rootScope.modal.input.dependent = '';
    $rootScope.modal.show = true;
    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  }

  $scope.startSurvey = function(projectID, projectState, projectName) {
    httpServerService.makeHttpRequest("projectState", "post", {
      teamName: usersService.getUserObject().teamname,
      projectId: projectID,
      // newState: 'P',
      //notes: $rootScope.modal.input.value,
    }).then(function(responseData) {
      if (responseData.status == 200) {
        console.log("Success!!!");
        console.log(responseData);
        $scope.hideProjectFromList(projectState, projectID);
        growl.info("<b>" + projectName + "</b> project is in progress", {
          ttl: 5000
        });
        //  //approvalRequiredProjects
        $scope.totalCount.approved = $scope.totalCount.approved - 1;
        $scope.totalCount.inProgress = $scope.totalCount.inProgress + 1;
        $scope.displayProjectList('inProgress');
        $scope.backToProjectList();
        $rootScope.modal.show = false;
        $rootScope.resetModal();
      } else {
        console.log("Error : ");
        console.log(responseData);
      }
    });
  }

  $scope.completeProject = function(projectID, projectState, projectName) {
      httpServerService.makeHttpRequest("projectState", "post", {
        teamName: usersService.getUserObject().teamname,
        projectId: projectID,
        // newState: 'C',
        //notes: $rootScope.modal.input.value,
      }).then(function(responseData) {
        if (responseData.status == 200) {
          console.log("Success!!!");
          console.log(responseData);
          $scope.hideProjectFromList(projectState, projectID);
          growl.info("<b>" + projectName + "</b> project is completed.", {
            ttl: 5000
          });
          //  //approvalRequiredProjects
          $scope.totalCount.inProgress = $scope.totalCount.inProgress - 1;
          $scope.totalCount.completed = $scope.totalCount.completed + 1;
          $scope.displayProjectList('completed');
          $scope.backToProjectList();
          $rootScope.modal.show = false;
          $rootScope.resetModal();
        } else {
          console.log("Error : ");
          console.log(responseData);
        }
      });
    }
    // @TODO @TODO
  $scope.updateProject = function(projectID, projectStatus) {
    console.log(" ------ updateProject ------");
    console.log("projectID: " + projectID + " projectStatus: " + projectStatus);
    $rootScope.wizard.project.projectID = projectID;
    $rootScope.wizard.project.activate = true;
    $rootScope.wizard.project.initFunc = 'UpdateProject';
    $scope.showProjectDetailsFlag = false;
    document.getElementById("project-details-wrap").style.display = 'none';
    document.getElementById("projectWizard").style.display = '';
    $rootScope.wizard.project.dataDependency.selectedProject = $scope.selectedProject;
    $rootScope.wizard.project.projectNote = $scope.projectNote;
    console.log("showProjectUpdateForm : " + $rootScope.showProjectUpdateForm);
    $rootScope.update.selectedProject = $scope.selectedProject;
    console.log("------------ Selected Project ----------");
    console.log($scope.selectedProject);
    // hide project list and details page

    if (projectStatus == 'draftProjects') {
      var index = $scope.httpResponses.draftProjects.map(function(item) {
        return item.projectId;
      }).indexOf(projectID);
      sharedService.setProjectAction('draft');

      sharedService.setProjectData($scope.httpResponses.draftProjects[index]);
      sharedService.setSelectedProject($scope.selectedProject);
      //$scope.changePath('/#/new_project_wizard');
      $scope.hideProjectList();
      //$scope.showProjectUpdateForm = true;

      $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, 2);
      $scope.breadcrumb.lists.push({
        name: sharedService.textEllipsis($scope.httpResponses.draftProjects[index].projectnameci, 55),
        onClickFnc: "",
      });
    }
  }
  $scope.toggleProjectUpdatePage = function() {
    if ($rootScope.wizard.project.display === true) {
      $scope.hideProjectList();

    } else {
      $scope.backToProjectList();
    }
  }
  $scope.resetProjectUpdateForm = function() {
    $rootScope.update.projectID = '';
    $rootScope.wizard.project.projectID = null;
    $rootScope.wizard.project.activate = false;
    $scope.showProjectDetailsFlag = false;
    document.getElementById("projectWizard").style.display = 'none';
  }

  $scope.hideProjectFromList = function(projectStatus, projectID) {
    console.log(" -- hideProjectFromList -- ");
    console.log(projectStatus);
    console.log($scope[projectStatus]);
    var temp = [];
    if($scope.hasOwnProperty(projectStatus)){
      var removeIndex = $scope[projectStatus].map(function(item) {
        return item.projectID;
      }).indexOf(projectID);
      $scope[projectStatus].splice(removeIndex, 1);
    }
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
    $scope.resetModalInputs();
    document.getElementById("modalText").innerHTML = "";
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    document.getElementById("modal-root").style.display = 'none';
  }

  $scope.formatTime = function(UNIX_timestamp, type) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = '';
    if (type != null && type != 'undefined' && type == 'date only') {
      time = month + ' ' + date + ', ' + year;
    } else {
      time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec;
    }
    return time;
  };

  $scope.projectNote = {
    sliderClass: '',
    sliderVisibility: false,
    visibility: true,
    handleClass: 'closed',
    details: {
      class: 'normal',
    },
    list: []
  }

  $scope.addNewNote = function() {
    if ($scope.newNote != '') {
      httpServerService.makeHttpRequest("projectNote?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId, "post", {
        notes: $scope.newNote
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

          var newProjectNote = {
            id: responseData.data.notesid,
            name: usersService.getUserObject().name,
            note: $scope.newNote,
            date: $scope.formatTime(new Date().getTime(), 'date only'),
            colorClass: '',
            text: noteText,
          }
          var newFormattedProjectNote = sharedService.setNewProjectNoteColor(newProjectNote);

          $scope.projectNote.list.unshift(newFormattedProjectNote);
          $scope.newNote = '';
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
    var index = $scope.projectNote.list.map(function(item) {
      return item.id;
    }).indexOf(noteId);
    document.getElementById("modal-root").className = document.getElementById("modal-root").className.replace(' in', '');
    $rootScope.modal.show = false;
    $rootScope.modal.title = "Delete Note ?";
    $rootScope.modal.text = "You are about to delete your note '<i>" + $scope.projectNote.list[index].note + "</i>' . Are you sure?";
    document.getElementById("modalText").innerHTML = $rootScope.modal.text;
    $rootScope.modal.buttons.delete.show = true;
    $rootScope.modal.buttons.delete.fnc = "deleteNote";
    $rootScope.modal.buttons.delete.params = "'" + noteId + "'";
    $rootScope.modal.buttons.cancel.show = true;
    $rootScope.modal.buttons.custom.show = false;
    $rootScope.modal.buttons.custom.text = '';
    $rootScope.modal.buttons.custom.fnc = "";
    $rootScope.modal.buttons.custom.params = "";
    $scope.resetModalInputs();
    $rootScope.modal.show = true;
    document.getElementById("modal-root").style.display = 'block';
    document.getElementById("modal-root").style.background = 'rgba(0, 0, 0, 0.4)';
    document.getElementById("modal-root").className = document.getElementById("modal-root").className + " in";
  }
  $scope.deleteNote = function(noteId) {
    //$rootScope.modal.show = true;
    var index = $scope.projectNote.list.map(function(item) {
      return item.id;
    }).indexOf(noteId);


    var seletedNote = document.getElementsByClassName('note')[index];
    seletedNote.childNodes[1].style.display = 'inline-block';

    httpServerService.makeHttpRequest("projectNote?teamName=" + usersService.getUserObject().teamname + "&projectId=" + $scope.selectedProject.projectId + "&notesId=" + noteId, "delete").then(function(responseData) {
      if (responseData.status == 200) {
        // success
        seletedNote.childNodes[1].style.display = 'none';
        $scope.projectNote.list.splice(index, 1);
        $rootScope.modal.show = false;
        $rootScope.resetModal();
      } else {
        console.log(" **** Failed ****");
        console.log(responseData);
      }
    });
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

  $scope.showDeleteReportDocModal = function(fileName) {
    var templateUrl, modalText;
    if($scope.authorization.changeReportAndSurveyData === false){
      templateUrl = "views/modal_templates/notification.html";
      modalText = "You are not authorized to delete report document";

    }else{
      templateUrl = "views/modal_templates/confirm.html";
      modalText = "Are you sure to delete uploaded report document";

    }
    ModalService.showModal({
      templateUrl: templateUrl,
      controller: "dialogCtrl",
      inputs: {
        data: {
          modalText: modalText,
          name: fileName,
          buttonText: "Delete"
        }
      },
    }).then(function(modal) {
      modal.close.then(function(result) {
        // $scope.customModalResult = result;
        if (result.result === 'delete') {
          $scope.deleteDoc($scope.selectedProject.projectState);
        }
      });
    });

  };

  $scope.showDeleteSurveyResponseModal = function(fileName) {
    var templateUrl, modalText;
    if($scope.authorization.changeReportAndSurveyData === false){
      templateUrl = "views/modal_templates/notification.html";
      modalText = "You are not authorized to delete  survey response data";

    }else{
      templateUrl = "views/modal_templates/confirm.html";
      modalText = "Are you sure to delete the uploaded survey response data";
    }

    ModalService.showModal({
      templateUrl: templateUrl,
      controller: "dialogCtrl",
      inputs: {
        data: {
          modalText: modalText,
          name: fileName,
          buttonText: "Delete"
        }
      },
    }).then(function(modal) {
      modal.close.then(function(result) {
        // $scope.customModalResult = result;
        if (result.result === 'delete') {
          $scope.deleteExcel($scope.selectedProject.projectState);
        }
      });
    });
  };

  $scope.showDeleteProjectModal = function(projectInfo, state) {
    ModalService.showModal({
      templateUrl: "views/modal_templates/confirm.html",
      controller: "dialogCtrl",
      inputs: {
        modalText: "You are about to delete " + projectInfo.name + " from " + state + " state. Are you sure?",
        buttonText: "Delete"
      },
    }).then(function(modal) {
      modal.close.then(function(result) {
        // $scope.customModalResult = result;
        if (result.result === 'delete') {
          $scope.modalAction($scope.modal.buttons.custom.fnc, $scope.modal.buttons.custom.params);
        }
      });
    });
  };


  // type: ( true - show, false - hide}
  // actions: {true - show/hide all, *** to show/hide one specific action}
  $scope.showHideActionButtons = function(type, actions) {
    if (actions === true) {
      for (var key in $scope.selectedProject.buttons) {
        $scope.selectedProject.buttons[key].show = type === true ? true : false;
      }
    } else {
      if ($scope.selectedProject.buttons.hasOwnProperty(actions)) {
        $scope.selectedProject.buttons[actions].show = type === true ? true : false;
      }
    }
  }

  $scope.redirectedToCommunities = function(communityName) {
    sharedService.setRedirection("community", "flag", true);
    sharedService.setRedirection("community", "name", communityName);
    console.log(">>>> communityName : " + communityName);
    $timeout(function() {
      $scope.changePath('/#/communities');
    }, 200);
  }

  function showProjectUnavailableModal(text, status) {
    ModalService.showModal({
      templateUrl: "views/modal_templates/notification.html",
      controller: "dialogCtrl",
      inputs: {
        data: {
          modalText: text,
        }
      },
    }).then(function(modal) {
      modal.close.then(function(result) {
        if (status === 'draftProjects') {
          $scope.displayDraft();
        } else if (status === 'approvalRequiredProjects') {
          $scope.displayApprovalRequired();
        } else if (status === 'approvedProjects') {
          $scope.displayApproved();
        } else if (status === 'inProgressProjects') {
          $scope.displayInProgress();
        } else {
          $scope.displayCompleted();
        }
      });
    });

  };

}]);
