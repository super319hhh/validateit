'use strict';

/**
 * @ngdoc function
 * @name angularSeedApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularSeedApp
 */
var app = angular.module('validateItUserPortalApp');
//app.service('sideBarService', function() {
//  this.showSideBar = false;
//
//  this.setShowSideBar = function(visibility) {
//    this.showSideBar = visibility;
//  }
//  this.getShowSideBar = function() {
//    return this.showSideBar;
//  }
//});

app.service('questionTemplateService', function() {
  this.showNewProjectFlowFlag = false;
  this.setNewProjectFlow = function(projectFlowFlag) {
    this.showNewProjectFlowFlag = projectFlowFlag;
  }

  this.getNewProjectFlow = function() {
    return this.showNewProjectFlowFlag;
  }
});


app.service('changePathService', function() {
  this.filePath = "views/admin/employee_overview.html";

  this.setPath = function(path) {
    this.filePath = path;
  }

  this.getPath = function () {
    return this.filePath;
  }
});

  app.controller('AdminCtrl', ['$scope', '$rootScope', 'sideBarService',
    'changePathService', '$http', '$location','usersService', '$window', 'httpServerService', 'idleService', 'ModalService', 'sharedService', function($scope, $rootScope, sideBarService, changePathService, $http, $location,
    usersService, $window, httpServerService, idleService, ModalService, sharedService) {
    changePathService.setPath("views/admin/overview.html"); // Default loaded page on admin
    //$scope.userName = "Corrine Sandler";
    $scope.userName = usersService.getUserObject().name;
    $scope.userRole = usersService.getUserObject().teamrole;
    $scope.userRoleTagClass = usersService.getUserRoleTagClass();
    $scope.overviewLink = usersService.getOverviewPageLink();
    $scope.teamShortName= usersService.getUserObject().teamshortname;
    $scope.teamName = usersService.getUserObject().teamname;
    $rootScope.showSearch = true;

    $scope.changePath = function(newPath) {
        if($rootScope.unCompletedProcessOnCurrentPage===false){
          $window.location.assign(newPath);
        }

    };
    $scope.showCompletedTableFlag = false;

    $scope.showHideCompletedTable = function() {
      $scope.showCompletedTableFlag = !$scope.showCompletedTableFlag;
    }
    $scope.oneAtATime = true;
    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };


    $scope.templateDescription = "";
    $scope.easyPieChartPercent = 65;
    $scope.easyPieChartOptions = {
      animate:{
        duration:0,
        enabled:false
      },
      barColor:'#800180',
      trackColor: '#000000',
      scaleColor:false,
      lineWidth:5,
      lineCap:'circle',
      size: 50,
      percent: 65
    };

    $scope.options = {
      chart: {
        type: 'pieChart',
        height: 450,
        donut: true,
        x: function(d){return d.key;},
        y: function(d){return d.y;},
        showLabels: true,

        pie: {
          startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
          endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
        },
        transitionDuration: 500,
        legend: {
          margin: {
            top: 5,
            right: 70,
            bottom: 5,
            left: 0
          }
        }
      }
    };

    $scope.data = [
      {
        key: "One",
        y: 5
      },
      {
        key: "Two",
        y: 2
      },
      {
        key: "Three",
        y: 9
      },
      {
        key: "Four",
        y: 7
      },
      {
        key: "Five",
        y: 4
      },
      {
        key: "Six",
        y: 3
      },
      {
        key: "Seven",
        y: .5
      }
    ];
    //$scope.options = [{ name: "New Product Test Template", id: 1 }, { name: "Name Test", id: 2 }, { name: "Product Benefit Test", id: 3 },
    //  {name: "Creative Test", id:4}, {name: "Messaging Test", id:5}, {name: "Video Test", id: 6}, {name: "Incentive Test", id:7},
    //  {name:"Call-to-Action Test", id:8}];

    $scope.selectedOption = $scope.options[0];

    //$scope.filePath = "views/admin/overview.html";

    $scope.getFilePath =  function() {
      return changePathService.getPath();
    }
    $scope.showOverlay = false;

   // $scope.showSideBar = true;

    $scope.overlayBtnClick = function() {
      $scope.showOverlay = false;
    }

   // $scope.viewer = pdf.Instance("viewer");

    //$scope.nextPage = function() {
    //  $scope.viewer.nextPage();
    //};
    //
    //$scope.prevPage = function() {
    //  $scope.viewer.prevPage();
    //};

    $scope.pageLoaded = function(curPage, totalPages) {
      $scope.currentPage = curPage;
      $scope.totalPages = totalPages;
    };




    $scope.team_names = [
      {
        //name:"TD Securities",
        name:"Wealth Management",
        path: "overview"
      },
      {
        name: "Wealth Management Marketing",
        //name: "TD Capital Markets",
        path: ""
      },
      {
        name: "P&C Marketing",
        //name: "TD Investment Banking",
        path: ""
      }
    ];

    $scope.team_overview = [
      {
        icon:"fa-user",
        title:"Users",
        number:"6",
        showArrow: false,
        active: false,
        path: "views/admin/team_overview.html"
      },
      {
        icon:"fa-book",
        title:"Projects",
        number:"7",
        showArrow: false,
        active: false,
        path: "views/admin/project_overview.html"
      },
      {
        icon:"fa-dollar",
        title:"Balance",
        number:"20,000$",
        showArrow: false,
        active: false,
        path: "views/admin/balance_overview.html"
      },
      {
        icon:"fa-file-text",
        title:"Question Templates",
        number:"4",
        showArrow: false,
        active: false,
        path: "views/admin/team_question_templates.html"
      },
      {
        icon:"fa-bullseye",
        title:"Communities",
        number:"5",
        showArrow: false,
        active: false,
        path: "views/admin/communities.html"
      }];

    $scope.showSideBarFn = function() {
      return sideBarService.getShowSideBar();
    }
    $scope.showArrow = [true, false, false, false, false];
    //for(var i = 0; i < $scope.team_overview.length; i++) {
    //  $scope.showArrow[i] = false;
    //}
    //$scope.showArrow = [false, false, false, false,false];

    //$scope.changeSideBarVisibility = function(visibility) {
    //  $scope.$parent.showSideBar = visibility;
    //}


    $scope.selected = 0;
    $scope.changePathSideBar = function(newPath, index) {
      $location.path(newPath);
      //$scope.selected = index;
    };

    $scope.boxClick = function(objs, index) {
      //objs.showArrow = !objs.showArrow;
      $scope.filePath = objs.path;
      console.log("The value of index" + index);


      for(var i=0; i < $scope.showArrow.length; i++) {
        if (i == index) {
          $scope.showArrow[i] = true;
        } else {
          $scope.showArrow[i] = false;

        }
      }
      return objs.showArrow = !objs.showArrow;
      //return objs.active = !objs.active;
    };

    $scope.hover = function(objs) {
      //return objs.showArrow = !objs.showArrow;
      return false;
    };


    $scope.data =[ {name:"India", population:"2"}];
    $scope.treeData = [{
      label: "abcType", data: {name: "abcType"}, children: $scope.Arraylist
    }];
    $scope.openTeamPage = function(view){
      $location.path('panel');
    };

    /**
     * Function to log out the user
     */
    $scope.prepareToLogOut = function () {
      ModalService.showModal({
        templateUrl: "views/modal_templates/general.html",
        controller: "dialogCtrl",
        inputs: {
          data: {
            modalTitle: "<b>Logout</b>",
            modalText: "<h5>You are about to log out.<br /> Are you sure?</h5>",
            buttons: {
              custom: {
                buttonText: "Logout",
                class: "btn-primary",
                show: true,
                noClickFnc: "logOut",
                inputs: [],
              },
              cancel: {
                buttonText: "Cancel",
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
              if(result.hasOwnProperty("inputs")){
                //$scope.$eval();
                $scope.modalInputParams = result.inputs;
              }else{
                $scope.modalInputParams = [];
              }
              $scope.$eval(""+result.noClickFnc+"()");
            }
          }
        });
      });
    }

    $scope.logOut = function() {
      var request = $http({
        method: "get",
        url: httpServerService.getServerPath()  + "ws/logout"
      });

      request.then(function(response) {
        // this callback will be called asynchronously
        // when the response is available
        usersService.timedOut = false;    // set logout reason: not because of timed out
        usersService.clearUserObjectFields();   // clear the userObject in usersService
        usersService.clearCookies(); // clear the cookies 'userObjectKey', so the ng-idle would not trigger in login page after redirect
        $zopim(function() {
          //$zopim.livechat.theme.setColor('#337ab7');
          $zopim.livechat.button.setPosition('bl');
          $zopim.livechat.button.setColor('#FFCC00');
          $zopim.livechat.window.setPosition('bl');
          $zopim.livechat.theme.setColors({badge: '#337ab7', primary: '#DDDDDD'});
          $zopim.livechat.theme.reload();
          $zopim.livechat.hideAll();
        });
        $window.location.assign('/#/login');
      }, function(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        // $window.location.assign('/login');
        $scope.loginError = true;

        if(response.status == 400) {
          //The username does not exist.
        }  else if(response.status == 403) {
          //The credentials are wrong.
        } else {
          //Cannot reach the server.
        }

      });
      return false;
    };

    $scope.addProject = function() {
      $window.location.assign('/#/new_project_wizard');
    }


      $rootScope.searchQuery = "";
      $rootScope.showSearchResult = false;
      $rootScope.searchResult = [];
      $scope.searchOnKeypress = function(searchQuery){
        //console.log($rootScope.searchQuery);
        console.log("> On Keypress: "+searchQuery);

      }
      $scope.searchOnChange = function(searchQuery){
        console.log("> On Change - "+searchQuery);
        if(searchQuery.trim().length>0){
          httpServerService.makeHttpRequest("queryDocuments?teamName=" + usersService.getUserObject().teamname + "&query="+searchQuery, "get").then(function(responseData) {
            if (responseData.status == 200) {
              // $rootScope.searchResult
              $rootScope.searchResult = [];
              if(responseData.data.length>0){
                var link = "";


                for(var i=0; i<responseData.data.length; i++){
                  if(responseData.data[i].type=="P"){
                    // project
                    link = "/#/project_details/"+responseData.data[i].id;
                  }else if(responseData.data[i].type=="C"){
                    link = "/#/communities?communityId="+responseData.data[i].id;
                  }else{
                    link = "#";
                  }
                  $rootScope.searchResult.push({
                    title: responseData.data[i].name,
                    shortDesc: sharedService.textEllipsis(responseData.data[i].description, 50),
                    type: responseData.data[i].type,
                    id: responseData.data[i].id,
                    link: link,
                  });
                }
              }else{
                $rootScope.searchResult = [];
                $rootScope.searchResult.push({
                  title: "No matching data ",
                  shortDesc: '',
                  type: '',
                  id: '',
                  link: '#',
                });
              }
            }else{
              $rootScope.searchResult = [];
              $rootScope.searchResult.push({
                title: 'No matching data.',
                shortDesc: '',
                type: '',
                id: '',
                link: '#',
              });
            }

          });

          $rootScope.showSearchResult = true;
        }else{
          console.log("No data")
          $rootScope.showSearchResult = false;

        }
      }
      $scope.searchBlur = function(searchQuery){
        if(searchQuery.trim().length>0){
          $rootScope.showSearchResult = true;
        }else{
          $rootScope.showSearchResult = false;
        }
      }
      $scope.redirectTo = function(link){
        if(link != "#"){
          $window.location.assign(link);
          //$window.location.reload();
        }
      }

  }]);


