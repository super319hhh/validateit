/**
 * Created by Yongkeng on 2015-11-25.
 */
"use strict";

var app = angular.module('validateItUserPortalApp');

app.controller('billingCtrl', ['$scope', '$rootScope', '$http', 'httpServerService', '$location', 'balanceFetchService', '$window', 'sideBarService', 'usersService', function($scope, $rootScope, $http, httpServerService, $location,
    balanceFetchService, $window, sideBarService, usersService) {
    /**
     * Function that's called when the users page is loaded.
     * This function will make a webservice to call the backend
     * and it will load the data for the users list.
     */
    $scope.init = function() {
            $rootScope.unCompletedProcessOnCurrentPage = false;
            $rootScope.currentPage = {
                name: "Biling",
                action: "",
                msgTitle: "",
                onChangeMsg: "",
            }
            sideBarService.setSelectedByRoute($location.$$path);
            /*------ [Start] Breadcrumb Code -------*/
            $scope.breadcrumb = {
                    lists: [{
                        name: "Home",
                        onClickFnc: "showPageHome('employee_overview')",
                    }, {
                        name: "Billing",
                        onClickFnc: "showBilling()", // Todo: Complete showBilling() function
                    }, ]
                }
                /*------ [End] Breadcrumb Code -------*/
            $scope.showBillingHistory();
        }
        /* ------ [Start] SideBar Code ------- */
    $scope.teamName = usersService.getUserObject().teamname;
    $scope.sidebar_items = sideBarService.getSideBarItems();
    $scope.showSideBarFn = function() {
        return sideBarService.getShowSideBar();
    };
    sideBarService.setShowSideBar(true);
    $scope.changePath = function(newPath, index) {
        if ($rootScope.unCompletedProcessOnCurrentPage === false) {
            sideBarService.setShowSideBar(true);
            if (typeof(index) === 'number' || !isNaN(parseFloat(index))) {
                sideBarService.setSelectedIndex(index);
            }
        }
        $window.location.assign(newPath);
    };
    /* ------ [End] SideBar Code ------- */
    $scope.breadcrumbLink = function(homeFnc, index) {
        if (index > 0) {
            $scope.breadcrumb.lists = $scope.breadcrumb.lists.slice(0, index + 1);
        }
        $scope.$eval(homeFnc);
    };

    $scope.showPageHome = function(param) {
        $scope.changePath('/#/' + param, 0);
    };

    /* ----------------------------------------- Date Picker Section begin --------------------------------------------- */
    $scope.toDate = null;

    $scope.setFromToday = function() {
        $scope.fromDate = new Date();
    };
    $scope.setToToday = function() {
        $scope.toDate = new Date();
    };

    $scope.setFromToday();
    $scope.setToToday();

    $scope.clearFromDate = function() {
        $scope.fromDate = null;
    };
    $scope.clearToDate = function() {
        $scope.toDate = null;
    };

    /**
     * Decription: disable future dates
     */
    $scope.disabled = function(date, mode) {
        return (mode === 'day' && (date > (new Date())));
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);

    $scope.openFromDate = function($event) {
        $scope.status.fromDateOpened = true;
    };
    $scope.openToDate = function($event) {
        $scope.status.toDateOpened = true;
    };

    $scope.setDate = function(year, month, day) {
        $scope.fromDate = new Date(year, month, day);
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.status = {
        fromDateOpened: false,
        toDateOpened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
        [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];

    $scope.getDayClass = function(date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };
    /* ----------------------------------------- Date Picker Section end -------------------------------------------- */

    /**
     * description: get today's billing history
     * @return {[type]} [description]
     */
    $scope.showBillingHistory = function() {
        $scope.showErrorMsg = false;
        var teamname = usersService.getUserObject().teamname;
        var fromDay = new Date();
        var fromMonth = fromDay.getMonth() + 1; // getMonth() range from 0 ~ 11
        var fromDate = fromDay.getFullYear() + "-" + fromMonth + "-" + fromDay.getDate();
        var url = httpServerService.getServerPath() + "ws/billingHistory?teamName=" + teamname + "&startDate=" + fromDate + "&endDate=" + fromDate;
        var request = $http({
            method: "get",
            url: url,
        });

        request.then(function(response) {
            // console.log(response);
            // this callback will be called asynchronously
            // when the response is available
            console.log("balance fetch response" + response);
            var balanceResponseData = response;
            if ((typeof(balanceResponseData) !== 'undefined' && balanceResponseData !== null)) {
                var resObj = balanceResponseData.data;
                console.log(resObj);

                $scope.Data = resObj;
                // setChartData(resObj);
                if (resObj.length === 0) {
                    $scope.noRecords = true;
                    $scope.noRecordsText = "You don't have any billing history within selected date range.";
                } else {
                    $scope.noRecords = false;
                    $scope.noRecordsText = "";
                    //  render the amchart
                    var chartData = [];
                    var chartObj = {};
                    for (var i = 0; i < resObj.length; i++) {
                        var project_name = resObj[i].projectname;
                        var name = '';
                        if (project_name) {
                            if (resObj[i].projectname.length > 10) {
                                name = project_name.substring(0, 10) + "...";
                            } else {
                                name = project_name
                            }
                        }
                        chartData[i] = {
                            "projectName": name,
                            "projectCost": resObj[i].projectcost,
                            "color": "#337AB7"
                        };
                        chartObj = {
                            "type": "serial",
                            "theme": "light",
                            "marginRight": 70,
                            "dataProvider": chartData,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "title": "Project Cost ($)"
                            }],
                            "startDuration": 1,
                            "graphs": [{
                                "balloonText": "<b>[[category]]: [[value]]</b>",
                                "fillColorsField": "color",
                                "fillAlphas": 0.9,
                                "lineAlpha": 0.2,
                                "type": "column",
                                "valueField": "projectCost",
                            }],
                            "chartCursor": {
                                "categoryBalloonEnabled": false,
                                "cursorAlpha": 0,
                                "zoomable": false
                            },
                            "categoryField": "projectName",
                            "categoryAxis": {
                                "gridPosition": "start",
                                "labelRotation": 45
                            },
                            "export": {
                                "enabled": true
                            }
                        }
                        if (resObj.length < 3) {
                            chartObj.graphs[0]["fixedColumnWidth"] = 100;
                        } else if (resObj.length < 6) {
                            chartObj.graphs[0]["fixedColumnWidth"] = 70;
                        }
                    }
                    var chart = AmCharts.makeChart("chartdiv", chartObj);
                }
            } else {
                $scope.showErrorMsg = true;
                $scope.dataFetchMsg = "cannot process user's balance data";
            }
        }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.])
            $scope.showErrorMsg = true;
            $scope.dataFetchMsg = "cannot fetch user's balance data";
        });
    };

    /**
     * description: get the filtered results based on the specified time period
     * @return {[type]} [description]
     */
    $scope.fetchBillingHistoryByDates = function() {
        $scope.showErrorMsg = false;
        var fromdate, todate;
        if ($scope.fromDate > $scope.toDate) { // reverse the from date and to date if the from date is behide the to date
            fromdate = $scope.toDate;
            todate = $scope.fromDate;
        } else {
            fromdate = $scope.fromDate;
            todate = $scope.toDate;
        }
        var fromMonth = fromdate.getMonth() + 1;
        var toMonth = todate.getMonth() + 1;
        fromdate = fromdate.getFullYear() + "-" + fromMonth + "-" + fromdate.getDate();
        todate = todate.getFullYear() + "-" + toMonth + "-" + todate.getDate();

        var teamname = usersService.getUserObject().teamname;

        var url = "billingHistory?teamName=" + teamname + "&startDate=" + fromdate + "&endDate=" + todate;
        httpServerService.makeHttpRequest(url, "GET")
            .then(function(response) {
                console.log("Edit user response" + response.status);
                var statusCode = response.status;
                if (statusCode === 200) {
                    console.log("Fetch Billing History successfully");

                    $scope.Data = response.data;
                    var resObj = response.data;
                    // setChartData(response.data);
                    if (response.data.length === 0) {
                        $scope.noRecords = true;
                        $scope.noRecordsText = "No billing history found within selected date range.";
                    } else {
                        $scope.noRecords = false;
                        $scope.noRecordsText = "";

                        //  render the amchart
                        var chartData = [];
                        var chartObj = {};
                        for (var i = 0; i < resObj.length; i++) {
                            chartData[i] = {
                                "projectName": resObj[i].projectname,
                                "projectCost": resObj[i].projectcost,
                                "color": "#337AB7"
                            };
                            chartObj = {
                                "type": "serial",
                                "theme": "light",
                                "marginRight": 70,
                                "dataProvider": chartData,
                                "valueAxes": [{
                                    "axisAlpha": 0,
                                    "position": "left",
                                    "title": "Project Cost",
                                    "labelFunction": function (value) {
                                                        return '$' + value.toLocaleString();
                                                    }
                                }],
                                "startDuration": 1,
                                "graphs": [{
                                    "balloonText": "<b>[[category]]<br />$ [[value]]</b>",
                                    "fillColorsField": "color",
                                    "fillAlphas": 0.9,
                                    "lineAlpha": 0.2,
                                    "type": "column",
                                    "valueField": "projectCost",
                                }],
                                "chartCursor": {
                                    "categoryBalloonEnabled": false,
                                    "cursorAlpha": 0,
                                    "zoomable": false
                                },
                                "categoryField": "projectName",
                                "categoryAxis": {
                                    "gridPosition": "start",
                                    "labelRotation": 45,
                                    "labelFunction": function (value) {
                                                        if (value) {
                                                            if (value.length > 10) {
                                                                return value.substring(0, 10) + "...";
                                                            } else {
                                                                return value;
                                                            }
                                                        }
                                                    }
                                },
                                "export": {
                                    "enabled": true
                                }
                            }
                            if (resObj.length < 3) {
                                chartObj.graphs[0]["fixedColumnWidth"] = 100;
                            } else if (resObj.length < 6) {
                                chartObj.graphs[0]["fixedColumnWidth"] = 70;
                            }
                        }
                        var chart = AmCharts.makeChart("chartdiv", chartObj);
                    }
                } else {
                    $scope.showErrorMsg = true;
                    $scope.dataFetchMsg = "cannot fetch user's balance data";
                    console.log("Fetch Billing History failed");
                }
            }, function(response) {
                $scope.showErrorMsg = true;
                $scope.dataFetchMsg = "cannot fetch user's balance data";
                console.log("Fetch Billing History failed");
            });
    };
}]);


/**
 * description: construct the data for the google-chart
 * @param {[Object]} resObj [description: the response data array of the web service]
 */
// function setChartData(resObj) {
//     var dates = [];
//     var projectCost = [];
//     var chartWidth = 0;

//     dates.push('Project Cost');
//     projectCost.push('Projects');
//     for (var i = 0; i < resObj.length; i++) {
//         var date = new Date(resObj[i].transactiondate);
//         var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); //ISO 8601 syntax (YYYY-MM-DD) 
//         dates.push(time); //ISO 8601 syntax (YYYY-MM-DD) 
//         projectCost.push(resObj[i].projectcost);
//     }

//     var wrapperWidth = document.getElementById("billingChart").offsetWidth; // get the width of the wrapper div

//     if (projectCost.length < 4) { // no more than 2 projects
//         chartWidth = 0.3 * wrapperWidth;
//     } else if (projectCost.length < 7) { // no more than 5 projects
//         chartWidth = 0.6 * wrapperWidth;
//     } else {
//         chartWidth = wrapperWidth;
//     }

//     console.log(dates);
//     console.log(projectCost);

// var arrayLength = resObj.length;
// var chartData = new Array(arrayLength);
// for (var i = 0; i < arrayLength; i++) {
//     var project = resObj[i];
//     chartData[i] = {
//         c: [{
//             v: resObj[i].projectname
//         }, {
//             v: resObj[i].projectcost
//         }, ]
//     };
// }

// $scope.chartObject = {};
// $scope.chartObject.type = "ColumnChart";

// $scope.onions = [
//     {v: "Onions"},
//     {v: 3}
// ];

// $scope.chartObject.data = {
//     "cols": [{
//         id: "t",
//         label: "Projects",
//         type: "string"
//     }, {
//         id: "s",
//         label: "Project Cost ($)",
//         type: "number"
//     }],
//     "rows": chartData
// };

// $scope.chartObject.options = {
//     // 'title': 'Answers Statistics',
//     'colors': ['#337AB7'],
//     'backgroundColor': '#F3F3F4',
//     'hAxis': {
//         'title': 'Projects',
//     },
//     'vAxis': {
//         'title': 'Project Cost ($)'
//     },
//     'legend': 'none'
// };
// Scope data for C3js bar chart
// $scope.myData = {
//     // bar: {
//     //     width: {
//     //         ratio: 0.5 // this makes bar width 50% of length between ticks
//     //     }
//     //     //or
//     //     width: 100 // this makes bar width 100px
//     // },
//     data: {
//         labels: true,
//         columns: [projectCost],
//         type: 'bar',
//     },
//     axis: {
//         y: {
//             label: 'Project Cost ($)',
//         },
//     },
//     size: {
//         width: chartWidth,
//     },
// }       
// }

// $scope.addCredits = function() {}; // to be completed