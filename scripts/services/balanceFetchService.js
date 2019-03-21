/**
 * Service that fetch balance of users.
 * @type {*|module|String}
 */
var app = angular.module('validateItUserPortalApp');
app.service('balanceFetchService', function() {

        // this.userObject = {
        //     dates: [],
        //     balance: []
        // }
        this.balanceObject = new Array();

        var dates = [];
        var balance = [];

        dates.push('date');
        balance.push('balance');


    this.setBalanceObject = function(balanceResponseData) {

        // process the JSON data to C3.js compatible
        // var resObj = JSON.parse(balanceResponseData.data);
        var resObj = balanceResponseData.data
        console.log(resObj);

        for(var i = 0; i < resObj.length; i++) {
            var date = new Date(resObj[i].submitteddate);
            var time = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();   //ISO 8601 syntax (YYYY-MM-DD) 
            dates.push(time);  //ISO 8601 syntax (YYYY-MM-DD) 
            balance.push(resObj[i].amount)
        }


        this.balanceObject.push(dates);
        this.balanceObject.push(balance);

        console.log("Balance Array " + this.balanceObject);

        // this.userObject.email = responseObject.email;
        // this.userObject.isactive = responseObject.isactive;
        // this.userObject.isadmin = responseObject.isadmin;
        // this.userObject.organizationname = responseObject.organizationname;
        // this.userObject.teamname = responseObject.teamname;
        // this.userObject.teamrole = responseObject.teamrole;
        // this.userObject.name = responseObject.name.firstname;
        // this.userObject.isnewuser = responseObject.isnewuser;
        // console.log("User object" + this.userObject);
    }

    this.getBalanceObject = function() {
        return this.banlanceObject;
    }
});