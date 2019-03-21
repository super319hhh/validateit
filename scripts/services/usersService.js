/**
 * Service that stores the data for users.
 * @type {*|module|String}
 */
var app = angular.module('validateItUserPortalApp');
app.service('usersService',['$cookies', function($cookies) {

    var userObjectKey = "userObjectKey";

    this.timedOut = false;   // flag to indicate if the user is logged out due to idle. This flag is used is the LoginCtrl

    this.userObject = {
        email: "",
        isactive: false,
        isadmin: false,
        organizationname: null,
        teamname: "",
        teamrole: null,
        isnewuser: false,
        teamshortname: "",
        name: "",
        firstname: "",
        lastname: "",
        companiesList: null,      
        isTeamSelected: false
    }

    function resetUserObject() {
        this.email = "";
        this.isactive = false;
        this.isadmin = false;
        this.organizationname = null;
        this.teamname = "";
        this.teamrole = null;
        this.isnewuser = false;
        this.teamshortname = "";
        this.name = "";
        this.firstname = "";
        this.lastname = "";
        this.companiesList = null;
        this.isTeamSelected = false;
    }

    this.clearUserObjectFields = function() {
        this.userObject = new resetUserObject();
    }

    this.setUserObject = function(responseObject) {
        this.userObject = new resetUserObject();    // need this because this.userObject got undefined after redirect to login page due to unauthorized access

        this.userObject.email = responseObject.email;
        this.userObject.isactive = responseObject.isactive;
        this.userObject.isadmin = responseObject.isadmin;
        this.userObject.organizationname = responseObject.organizationname;
        this.userObject.teamname = responseObject.teamname;
        this.userObject.teamshortname = responseObject.teamshortname;
        this.userObject.teamrole = responseObject.teamrole;
        this.userObject.companiesList = responseObject.companiesList;

        if(responseObject.name.firstname !== null && responseObject.name.firstname.trim() !== ''){
            this.userObject.firstname = responseObject.name.firstname.trim();
        }else{
            this.userObject.firstname = "blank";
        }

        if(responseObject.name.lastname !== null && responseObject.name.lastname.trim() !== ''){
            this.userObject.lastname = responseObject.name.lastname.trim();
        }else{
            this.userObject.lastname = "blank";
        }

        this.userObject.name = (this.userObject.firstname =="blank" ? "":this.userObject.firstname) + " " + (this.userObject.lastname =="blank" ? "":this.userObject.lastname);

        this.userObject.isnewuser = responseObject.isnewuser;
        console.log("User object" + this.userObject);

         this.setCookies();
    }

    this.setUserObjectTeamname = function(teamname) {
        this.userObject.teamname = teamname;
        this.userObject.isTeamSelected = true;
    }

    this.getUserObject = function() {
        if(this.userObject.email == undefined || this.userObject.email.length == 0) {
            //Check if there is anything in the cookie.
            this.userObject = $cookies.getObject(userObjectKey);
        }
        return this.userObject;
    }

    this.isAdmin = function(){
        return ((this.userObject.teamrole==='A') ? true: false);
    }
    this.isManager = function(){
        return ((this.userObject.teamrole==='M') ? true: false);
    }
    this.isReviewer = function(){
        return ((this.userObject.teamrole==='R') ? true: false);
    }
    // this.isEmployee = function(){
    //     return ((this.userObject.teamrole==='Employee') ? true: false);
    // }    
    this.isUser = function(){
        return ((this.userObject.teamrole==='U') ? true: false);
    }

    this.setCookies = function() {
        $cookies.putObject(userObjectKey, this.userObject);
    }

    this.getCookies = function() {
        return $cookies.getObject(userObjectKey);
    }
    /**
     * Function to clear the session cookies.
     */
    this.clearCookies = function() {
        $cookies.remove(userObjectKey);
    }

    /**
     * Function to retrieve the redirect path
     * based on the user role.
     */
    this.getUserRedirectPath = function() {
        var redirectTo = '';
        switch(this.userObject.teamrole){
            case "A":
                redirectTo = '/employee_overview';
                break;
            case "U":
                redirectTo = '/employee_overview';
                break;
            default :
                redirectTo = '/employee_overview';
                break;
        }
        return redirectTo;
    }

    this.getUserRoleTagClass = function () {
        switch (this.userObject.teamrole){
            case "U":
                return "box-default";
                break;
            case "R":
                return "box-info";
                break;
            case "A":
                return "box-primary";
                break;
            case "M":
                return "box-success";
                break;
        }
    }

    // Employee Recent Activity
    this.userActivity = [
        {
            date: '21 November 2015',
            activityType: 'Create',
            description: 'RRSP Policy Project was added by you.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '20 November 2015',
            activityType: 'Reject',
            description: 'Mortgage Test Project was rejected by BMO Admin.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '19 November 2015',
            activityType: 'Approve',
            description: 'Young Couples Creative Test Project was approved by BMO Admin',
            ipAddress: "209.29.345.765"
        },
        {
            date: '18 November 2015',
            activityType: 'Edit',
            description: 'Young Couples Creative Test Project was updated by BMO Admin.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '16 November 2015',
            activityType: 'Create',
            description: 'Young Couples Creative Test Project was added by you.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '14 November 2015',
            activityType: 'Approve',
            description: 'Critical Insurance Test Project was approved by BMO Admin.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '12 November 2015',
            activityType: 'Approve',
            description: 'General Insurance Test Project was added by BMO Admin.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '11 November 2015',
            activityType: 'Approve',
            description: 'High Net Worth Online Brokerage Messaging Project was approved by BMO Admin.',
            ipAddress: "209.29.345.765"
        },
        {
            date: '8 November 2015',
            activityType: 'Create',
            description: 'High Net Worth Online Brokerage Messaging Project was added by you.',
            ipAddress: "209.29.345.765"
        }
    ];
    this.getUserActivity = function(){
        return this.userActivity;
    }

    this.adminOverviewHeaderLinks = [
        {
            page:'New Project',
            url: '/#/new_project_wizard',
            icon: 'fa-plus'
        },
        {
            page:'View Project',
            url: '/#/overview',
            icon: 'fa-book'
        }
    ];
    this.employeeOverviewHeaderLinks = [
        {
            page:'View Project',
            url: '/#/overview',
            icon: 'fa-book'
        }
    ];

    this.getOverviewHeaderLinks = function(userType){
        if(userType=="A" && this.userObject.teamrole==userType){
            return this.adminOverviewHeaderLinks;
        }
        else if(userType=="U" && this.userObject.teamrole==userType){
            return this.employeeOverviewHeaderLinks;
        }else{
            return;
        }
    }

    // Overview Page
    this.getOverviewPageLink = function(){
        switch (this.userObject.teamrole){
            case "U":
                return '/#/employee_overview';
                break;
            case "R":
                return '/#/overview';
                break;
            case "A":
                return '/#/overview';
                break;
        }
    }
    // getUserTimeZone will return user timezone in hours
    this.getUserTimeZone = function(){
        var x = new Date();
        return x.getTimezoneOffset()/60;
    }
}]);