/**
 * Angular service to set the path of the back-end server.
 */

var app = angular.module('validateItUserPortalApp');


app.service('httpServerService', ['$http','$q', function($http, $q) {
    //this.serverPath="https://clients.validateit.com/";
    //this.serverPath = "http://192.168.1.11:8080/";
    //this.serverPath = "http://172.16.9.33:8080/"
    //this.serverPath = "http://dev3.validateitclients.com/";
    this.serverPath = "http://dev2.validateitclients.com/";
    //this.serverPath = "http://172.16.9.16:8080/";
    //this.serverPath = "http://172.16.9.33:8080/";
    //this.serverPath = "http://192.168.1.3:8080/";

    this.getServerPath = function() {
        return this.serverPath;
    }

    this.setServerPath = function(serverPath) {
        this.serverPath = serverPath;
    }

    this.defaultErrorMessage = "Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.";

    this.getDefaultErrorMessage = function(){
        return this.defaultErrorMessage;
    }
    /* *
     * Method: makeHttpRequest : Common method to make http request
     * @ws_url: web service url
     * @method: get, post, put, delete
     * @params: Data to send with the request
     * */
    this.makeHttpRequest = function(ws_url,method,params){
        if(typeof(ws_url) != 'undefined' && ws_url != null){

            var resp, config = new Object();
            method = method.toUpperCase();
            config.url = this.serverPath+"ws/"+ws_url;
            config.method = method;
            if(method=="POST" && params !== null && typeof(params) === 'object' && Object.keys(params).length > 0){
                config.data = params;
            }
            resp = $http(config).then(function(responseData){
                // On Success
                console.log(" @@@ Request Success @@@");
                if((typeof(responseData) != 'undefined' && responseData != null)) {
                    return responseData;
                }

            }, function(responseData){      // Error is handled here. Error cannot be passed to the function that calls this method
                // On Fail
                console.log(" XXX Request Failed XXX");
                return responseData;
            });
            return resp;
        }

        //return this.communityData;
    }

}]);
