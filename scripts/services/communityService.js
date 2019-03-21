/**
 * Created by pijus on 2015-12-01.
 */
var app = angular.module('validateItUserPortalApp');

app.service('communityService', ['httpServerService', 'sharedService', 'usersService', '$q', 'growl', function(httpServerService, sharedService, usersService, $q, growl) {
    // Make an http call to httpServerService to get community Records.
    // Response data will be stored in a local variable.
    // One function will parse the response data and prepare an variable with formated information

    // Create get and set methods to get formated data and set selected data

    this.httpResponseData = {
        communityList: {},
        communityDetails: {},
        newProjectPricing: {
            orgData: [],
            parsedData: {}
        },
        respondentSet:[]
    };

    // store parsed data
    this.parsedData = {
        communityList: [],
        countries: [],
        ageRanges: [],
        gender: [],
        respondents: []
    };

    this.newProject = {};
    this.setNewProject = function(setData){
        this.newProject = new Object();
        for (var prop in setData) {
            if (setData.hasOwnProperty(prop)) {
                this.newProject[prop] = setData[prop];
            }
        }
        this.newProject['entryDate'] = this.formatCurrentDate();
    }
    this.getNewProject = function(){
        return this.newProject;
    }
    this.lockageselection = false;
    this.lockgenders = false;
    // Set Parsed Community List
    this.setCommunityList = function(setData){
        this.parsedData.communityList = setData;
    }
    // Get Parsed community list
    this.getCommunityList = function(){
        return this.parsedData.communityList;
    }

    // Set Parsed Countries
    this.setCountries = function(setData){
        this.parsedData.countries = setData;
    }
    // Get parsed Countries
    this.getCountries = function(){
        return this.parsedData.countries;
    }

    // Set Parsed Age Ranges
    this.setAgeRanges = function(setData){
        this.parsedData.ageRanges = setData;
    }
    // Get parsed Age Ranges
    this.getAgeRanges = function(){
        return this.parsedData.ageRanges;
    }

    // Set parsed Respondents
    this.setRespondents = function (setData) {
        this.parsedData.respondents = setData;
    }
    // Get parsed Respondents
    this.getRespondents = function(){
        return this.parsedData.respondents;
    }
    this.setGender = function(setData){
        this.parsedData.gender = setData;
    }
    this.getGender = function(){
        return this.parsedData.gender;
    }
    // Set Community Details
    this.setCommunityDetails = function(setData, communityName){
        this.httpResponseData.communityDetails[communityName.toLowerCase()] = [];
        this.httpResponseData.communityDetails[communityName.toLowerCase()] = setData;
        console.log(this.parsedData);
    }
    // Get parsed Community Details
    this.getCommunityDetails = function(communityName){

        if((typeof(communityName) != 'undefined' && communityName != null)){
            communityName = communityName.toLowerCase();
            if(this.httpResponseData.communityDetails.hasOwnProperty(communityName)){
                return this.httpResponseData.communityDetails[communityName];
            }else{
                return null;
            }

        }else{
            return this.httpResponseData.communityDetails;  // return all community details
        }

    }
    this.removeCommunityDetails = function(communityName){
        if(communityName==='all'){
            this.httpResponseData.communityDetails = {};
        }else{
            if(this.httpResponseData.communityDetails.hasOwnProperty(communityName)){
                delete this.httpResponseData.communityDetails.communityName;
            }
        }

    }

    this.saveHttpResponseData = function(queryName, data, communityName){

        switch(queryName){
            case "CommunityList":
                this.httpResponseData.communityList = data;
                break;
            case "CommunityDetails":
                if((typeof(communityName) != 'undefined' && communityName != null)){
                    communityName = communityName.toLowerCase();
                    this.httpResponseData.communityDetails[communityName] = [];
                    this.httpResponseData.communityDetails[communityName] = data;
                }
                break;
        }
    };

    this.getHttpResponseData = function(queryName, subQuery){
        switch(queryName){
            case "CommunityList":
                return this.httpResponseData.communityList;
                break;
            case "CommunityDetails":
                if((typeof(subQuery) != 'undefined' && subQuery != null)){
                    subQuery = subQuery.toLowerCase();
                    if(this.httpResponseData.communityDetails.hasOwnProperty(subQuery)){
                        return this.httpResponseData.communityDetails[subQuery];
                    }else{
                        return null;
                    }
                }else{
                    return null;
                }
                break;

        }
    }
    this.getParsedData = function(){
        return this.parsedData;
    }
    this.setHttpResponseData = function(setData){
        this.httpResponseData = setData;
    }
    this.setParsedData = function(setData){
        this.parsedData = setData;
    }

    this.getLockedAgeRangeFlag = function(){
        return this.lockageselection;
    }

    this.getLockedGenderFlag = function(){
        return this.lockgenders;
    }
    this.setLockedGenderFlag = function(setData){
        if(typeof (setData)=== 'undefined' || setData === null || setData === '' || setData === false){
            this.lockgenders = false;
        }else{
            this.lockgenders = setData;
        }
    }
    /* *
     * Method: getCommunityListFromDataSource
     * Params: User Team Name
     * Description: Make a web service call to get the list of communities and subcommunity details of the first community in the list
     * Return: Object {first_community_index: Array, communities: Array}
     * */
    this.getCommunityListFromDataSource = function(teamName){
        //console.log("--------- getCommunityRecordsFromDataSource -----------");
        var response = false;
        if(typeof(teamName) != 'undefined' && teamName != null){
            response = httpServerService.makeHttpRequest("communityOverview?teamName="+teamName,"get",[]).then(function(responseData){
                //console.log("----- Response From Server -----");
                //console.log("--> Success");
                if(responseData.status===200){
                    return responseData.data;
                }else{
                    growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                    return false;
                }

            }, function(responseData){
                //console.log("----- Response From Server -----");
                //console.log("--> Failed");
                growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                console.log(responseData);
            });
        }

        return response;
    }

    /* *
     * Method: getCommunityDetailsFromDataSource
     * Params: User Team Name, Selected Community Name
     * Description: Make a web service call to get the list of communities and subcommunity details of the first community in the list
     * Return: Object {first_community_index: Array, communities: Array}
     * */
    this.getCommunityDetailsFromDataSource = function (teamName, communityName) {
        var response = false;
        if(typeof(teamName) != 'undefined' && teamName != null && typeof(communityName) != 'undefined' && communityName != null){
            response = httpServerService.makeHttpRequest("subCommunityList?teamName="+teamName+"&communityName="+communityName,"get",[]).then(function(responseData){
                console.log("----- Response From Server -----");
                console.log("--> Success");
                console.log(responseData);
                return responseData.data;
            }, function(responseData){
                console.log("----- Response From Server -----");
                console.log("--> Failed");
                console.log(responseData);
            });
        }

        return response;
    }



    /* *
     * Method: getCommunityByCountry
     * Params: { Type: Array, Desc: list of selected countries }
     * Description: Parse the community list data that received for web service and filter the communities for selected countries.
     * Return: Object {community lists and also save the filtered data in this.parsedData.communityList}
     * */
    this.getCommunityByCountry = function(countries){
        var communityList = [], communitySet = [];
        for(var i=0; i<this.httpResponseData.communityList.communities.length; i++){
            //country
            if(this.httpResponseData.communityList.communities[i].country != null && typeof(this.httpResponseData.communityList.communities[i].country) != 'undefined'){
                for(var j=0; j<this.httpResponseData.communityList.communities[i].country.length; j++){
                    if(countries.indexOf(this.httpResponseData.communityList.communities[i].country[j])>-1){
                        // duplicate check
                        if(communityList.length>0){
                            if(communitySet.indexOf(this.httpResponseData.communityList.communities[i].communityname)<0){
                                communitySet.push(this.httpResponseData.communityList.communities[i].communityname);
                                communityList.push({
                                    returnDataListID: i,
                                    name: this.httpResponseData.communityList.communities[i].communityname,
                                    description: this.httpResponseData.communityList.communities[i].communitydescription,
                                    selected: false
                                });
                            }
                        }else{
                            communitySet.push(this.httpResponseData.communityList.communities[i].communityname);
                            communityList.push({
                                returnDataListID: i,
                                name: this.httpResponseData.communityList.communities[i].communityname,
                                description: this.httpResponseData.communityList.communities[i].communitydescription,
                                selected: false
                            });
                        }
                    }
                }
            }

        }

        this.setCommunityList(communityList);
        return communityList;

    }

    /* *
     * Method: parseDataGetCommunityList
     * Params: { Type: Array, Desc: list of communities received form web service }
     * Description: Parse the input community list and format it according to the uses
     * Return: Object {first_community_index: Array, communities: Array}
     * */
    this.parseDataGetCommunityList = function(dataToParse){
        console.log(" ----- Parse Data Get Communities -----");
        console.log(dataToParse);
        var communityList = [];
        var countries = [], countrySet = [];
        for(var i=0; i < dataToParse.length; i++){
            communityList.push({
                returnDataListID: i,
                name: dataToParse[i].communityname,
                description: dataToParse[i].communitydescription,
                selected: false
            });

            if(dataToParse[i].country !== null && typeof(dataToParse[i].country) != 'undefined'){
                for(var j =0; j<dataToParse[i].country.length; j++){
                    if(countrySet.length==0){
                        countrySet.push(dataToParse[i].country[j]);
                        countries.push({
                            name: dataToParse[i].country[j],
                            flagCode: this.getCountryFlagCode(dataToParse[i].country[j]),
                            checked: false
                        });
                    }else{
                        if(countrySet.indexOf(dataToParse[i].country[j])<0){
                            countrySet.push(dataToParse[i].country[j]);
                            countries.push({
                                name: dataToParse[i].country[j],
                                flagCode: this.getCountryFlagCode(dataToParse[i].country[j]),
                                checked: false
                            });
                        }
                    }
                }
            }
        }
        this.setCommunityList(communityList);
        this.setCountries(countries);
        console.log(" ----- ----- ----- ----- X ----- ----- ----- -----");
    }

    /* *
     * Method: parseDataGetCommunityDetails
     * Params:
     * Description: Parse the input community details(sub community information) and format it according to the uses
     * Return:
     * */
    this.parseDataGetCommunityDetails = function(communityName){
        console.log(" -- parseDataGetCommunityDetails --  "+communityName);
        if((typeof(communityName) != 'undefined' && communityName != null)){
            communityName = communityName.toLowerCase();
            if(this.httpResponseData.communityDetails.hasOwnProperty(communityName)){
                //return this.httpResponseData.communityDetails[communityName];
                var keySplit = [];
                var ageRanges = [], ageSet = [], ageIndex= 0, lockageselection = false, lockCounter = 0;
                var respondents = [], respondentSet = [], respSum = 0;

                for(var i=0; i < this.httpResponseData.communityDetails[communityName].length; i++){
                    // unique age range
                    if(Object.keys(this.httpResponseData.communityDetails[communityName][i].ageselection).length>0){
                        lockageselection = this.httpResponseData.communityDetails[communityName][i].lockageselection;
                        if(lockageselection === true){
                            lockCounter++;
                        }
                        for(var key in this.httpResponseData.communityDetails[communityName][i].ageselection){
                            if(this.httpResponseData.communityDetails[communityName][i].ageselection[key] === true){
                                if(ageRanges.length>0){
                                    if(ageSet.indexOf(key)<0){
                                        keySplit = key.split("_");
                                        if(keySplit[1]!='' && keySplit[2]!=''){
                                            ageRanges.push({
                                                id: ageIndex++,
                                                ageRange: keySplit[1] + (keySplit[2]==='plus' ? '+':( "-" + keySplit[2] )),
                                                sortKey: keySplit[1],
                                                checked: (lockageselection===true ? true: false),
                                                locked: lockageselection
                                            });
                                            ageSet.push(key);
                                        }
                                    }
                                }else{
                                    keySplit = key.split("_");
                                    if(keySplit[1]!='' && keySplit[2]!=''){
                                        ageRanges.push({
                                            id: ageIndex++,
                                            ageRange: keySplit[1] + (keySplit[2]==='plus' ? '+':( "-" + keySplit[2] )),
                                            sortKey: keySplit[1],
                                            checked: (lockageselection===true ? true: false),
                                            locked: lockageselection
                                        });
                                        ageSet.push(key);
                                    }
                                }
                            }
                        }
                    }
                    // unique respondents
                    respSum += this.httpResponseData.communityDetails[communityName][i].respondents;
                    // format and set gender info genders
                }
                if(lockCounter>0){
                    this.lockageselection = true;
                }else{
                    this.lockageselection = false;
                }
                ageRanges.sort(sharedService.sort_by('sortKey', true, parseInt));
                this.setAgeRanges(ageRanges);
                this.setRespondents(this.getRespondentFormat(respSum));
                this.setLockedGenderFlag(false);
                //console.log(ageRanges);
                //console.log(this.getRespondentFormat(respSum));
            }
        }else{
            console.log(" Nothing to Parse. Community Name not found");
        }
    }

    this.setRespondentSet = function(setData){
        if(setData !=undefined && setData !=''){
            this.httpResponseData.respondentSet = setData;
        }
    }
    this.getRespondentFormat = function(rSum){
        var ranges = this.httpResponseData.respondentSet, i= 0, respObj = [];
        if(rSum<ranges[i]){
            respObj.push({ uid: i, number: ranges[i], selected:false });
        }else{
            for(i=0; i< ranges.length; i++){
                if(rSum > ranges[i]){
                    respObj.push({uid: i, number: ranges[i], selected:false });
                }else{
                    //respObj.push({uid: i, number: ranges[i], selected:false });
                    break;
                }
            }
        }
        return respObj;
    }

    this.getCountryFlagCode = function (country) {
        country = country.toLowerCase();
        switch(country){
            case "us":
            case "usa":
                return "us";
                break;
            case "canada":
                return "ca";
                break;
        }
    }

    this.filterRespondentByAge = function(ages, communityName){
        var ageRange=[], ageRange2 = [], i, temp=[];
        for(i=0; i< ages.length; i++){
            if(ages[i].ageRange=='65+'){
                temp = ['65','plus'];
            }else{
                temp = ages[i].ageRange.split("-");
            }

            ageRange.push("age_"+temp[0]+"_"+temp[1]);
        }
        if(ages.length>0){
            communityName = communityName.toLowerCase();
            if(this.httpResponseData.communityDetails.hasOwnProperty(communityName)){
                var respSum = 0;//respSum = 0;
                for(i=0; i < this.httpResponseData.communityDetails[communityName].length; i++){
                    ageRange2=[];
                    if(Object.keys(this.httpResponseData.communityDetails[communityName][i].ageselection).length>0){
                        for(var key in this.httpResponseData.communityDetails[communityName][i].ageselection){
                            if(this.httpResponseData.communityDetails[communityName][i].ageselection[key] === true){
                                if(ageRange2.length>0){
                                    if(ageRange2.indexOf(key) < 0){
                                        ageRange2.push(key);
                                    }
                                }else{
                                    ageRange2.push(key);
                                }
                            }
                        }
                        temp = ageRange.filter(function(n) {
                            return ageRange2.indexOf(n) != -1
                        })
                        if(temp.length>0){
                            respSum += this.httpResponseData.communityDetails[communityName][i].respondents;
                        }
                    }
                }
            }else{

            }

            this.setRespondents(this.getRespondentFormat(respSum));
            this.setLockedGenderFlag(false);
        }else{
            this.setRespondents([]);
        }

    }

    this.filterGender = function(ages, respondents, communityName){
        console.log(ages);
        console.log(respondents+" - "+communityName);

        var ageRange=[], ageRange2 = [], i, temp=[], gender = {male: 0, female: 0};
        for(i=0; i< ages.length; i++){
            if(ages[i].ageRange=='65+'){
                temp = ['65','plus'];
            }else{
                temp = ages[i].ageRange.split("-");
            }
            ageRange.push("age_"+temp[0]+"_"+temp[1]);
        }
        if(ages.length>0 && Number(respondents)>0){
            communityName = communityName.toLowerCase();
            console.log(communityName);
            console.log(this.httpResponseData.communityDetails);

            if(this.httpResponseData.communityDetails.hasOwnProperty(communityName)){
                console.log(this.httpResponseData.communityDetails[communityName]);
                for(i=0; i < this.httpResponseData.communityDetails[communityName].length; i++){
                    if(Object.keys(this.httpResponseData.communityDetails[communityName][i].ageselection).length>0){
                        ageRange2 = [];
                        for(var key in this.httpResponseData.communityDetails[communityName][i].ageselection){
                            if(this.httpResponseData.communityDetails[communityName][i].ageselection[key] === true){
                                if(ageRange2.length>0){
                                    if(ageRange2.indexOf(key) < 0){
                                        ageRange2.push(key);
                                    }
                                }else{
                                    ageRange2.push(key);
                                }
                            }
                        }
                    }
                    console.log(ageRange2);
                    temp = ageRange.filter(function(n) {
                        return ageRange2.indexOf(n) != -1
                    })
                    if(temp.length>0){
                        gender.male += this.httpResponseData.communityDetails[communityName][i].gender.male;
                        gender.female += this.httpResponseData.communityDetails[communityName][i].gender.female;
                    }
                }
                temp = [];
                if(gender.male>0){
                    temp.push({name:"Male", value:gender.male, selected: false, isLocked: false});
                }
                if(gender.female>0){
                    temp.push({name:"Female", value:gender.female, selected: false, isLocked: false});
                }
                // check male
                var mIndex = temp.map(function(item){ return item.name;}).indexOf("Male");
                // check female
                var fIndex = temp.map(function(item){ return item.name;}).indexOf("Female"), locked = false;

                if(mIndex >-1 && fIndex > -1){
                    if(respondents > temp[mIndex].value || respondents > temp[fIndex].value){
                        // locked
                        temp[mIndex].isLocked = true;
                        temp[fIndex].isLocked = true;
                        temp[mIndex].selected = true;
                        temp[fIndex].selected = true;
                        locked = true;
                    }
                }
                console.log(temp);
                this.setLockedGenderFlag(locked);
                this.setGender(temp);
            }
        }
        console.log(" ------------------------------------------ ");
    }

    this.getPricingTable = function(){
        return this.httpResponseData.newProjectPricing.parsedData;
    }

    this.formatCurrentDate = function(){
        var d = new Date();
        var month = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        //var n = month[d.getMonth()];
        return month[d.getMonth()] + " " + d.getDay() + ", " + d.getFullYear();
    }
    /* --------------------------------------------------------------------------------------------------------------------- */
    /* --------------------------------------------------------------------------------------------------------------------- */

    this.getCommunityDetailsObject = function(){
        var communityObject = new Object();
        communityObject.recordID = sharedService.generateUniqueID();
        communityObject.communities = [];
        communityObject.countries = [];
        communityObject.ages = [];
        communityObject.gender = [];
        communityObject.respondents = [];
        communityObject.cost = 0;
        communityObject.selected = new Object();
        communityObject.selected.community = [];
        communityObject.selected.countries = [];
        communityObject.selected.ages = [];
        communityObject.selected.gender = [];
        communityObject.selected.countries_text = "";
        communityObject.selected.age_text = "";
        communityObject.selected.respondents = {};
        communityObject.selected.gender_text = "";
        communityObject.showErrorFlag = false;
        communityObject.errorMessage = '';
        communityObject.showSuccessMessage = false;
        communityObject.showContainerFlag = true;
        communityObject.communityFlag = false;
        communityObject.ageRangeFlag = false;
        communityObject.respondentFlag = false;
        communityObject.genderFlag = false;
        communityObject.animationClass = '';
        communityObject.showSubmitBtn = true;
        communityObject.disableSubmitBtn = 'disabled';
        communityObject.editEnabled = false;
        communityObject.showEditBtn = true;
        communityObject.disableEditBtn = 'disabled';
        communityObject.showDeleteBtn = true;
        communityObject.disableDeleteBtn = 'disabled';

        communityObject.popup = new Object();
        communityObject.popup.open = false;
        communityObject.popup.type = '';
        communityObject.popup.message = '';
        communityObject.data = new Object();
        communityObject.data.httpResponseData = new Object();
        communityObject.data.httpResponseData.communityList = [];
        communityObject.data.httpResponseData.communityDetails = [];
        communityObject.data.parsedData = new Object();
        communityObject.data.parsedData.communityList = [];
        communityObject.data.parsedData.countries = [];
        communityObject.data.parsedData.ageRanges = [];
        communityObject.data.parsedData.gender = [];
        communityObject.data.parsedData.respondents = [];
        communityObject.validated = false;
        communityObject.isSaved = false;
        communityObject.progress = new Object();
        communityObject.progress.country = ''; // verified || ''
        communityObject.progress.age = '';
        communityObject.progress.respondents = '';
        communityObject.progress.gender = '';

        return communityObject;
    }

    this.createProjectObject = function(){
        var projectObject = new Object();

        projectObject.projectName = "";
        projectObject.projectDescription = "";
        projectObject.questions = 0;
        projectObject.totalRespondents = 0;
        projectObject.cost = 0;
        projectObject.communityDetails = [];
        projectObject.communityDetails.push(this.getCommunityDetailsObject());
        projectObject.notes = '';
        projectObject.communitiesAdded = 0;
        projectObject.uploadedDocs = [];
        projectObject.uploadDocumentFlag = true;
        projectObject.uploadedImages = [];
        projectObject.agreedTerms = false;
        return projectObject;
    }
    this.createNewCommunityFormObject = function(){
        var communityObject = new Object();
        communityObject.communities = [];
                // selectedCountry: "Canada",
        communityObject.countries = []; // get countries by community
        communityObject.ages = []; // get ages by community
        communityObject.gender = {};
        communityObject.respondents = []; // get respondents by community
        communityObject.selected = new Object();
        communityObject.selected.community = {};
        communityObject.selected.countries = [];
        communityObject.selected.countries_text = "";
        communityObject.selected.ages = [];
        communityObject.selected.age_text = '';
        communityObject.selected.respondents = {};
        communityObject.selected.gender = {};
        communityObject.selected.gender_text = '';

        communityObject.cost = 0;
        communityObject.validated = false;
        communityObject.isSaved = false;
        communityObject.progress = new Object();
        communityObject.progress.country = '';
        communityObject.progress.age = '';
        communityObject.progress.respondents = '';
        communityObject.progress.gender = '';

        communityObject.showErrorFlag = false;
        communityObject.errorMessage = "";
        communityObject.showSuccessMessage = false;
        communityObject.communityFlag = false;
        communityObject.ageRangeFlag = false;
        communityObject.respondentFlag = false;
        communityObject.genderFlag = false;
        communityObject.animationClass = '';
        communityObject.showSubmitBtn = false;
        communityObject.disableSubmitBtn = 'disabled';
        communityObject.showDeleteBtn = true;
        communityObject.disableDeleteBtn = '';

        return communityObject;
    }
    this.formatSelectedAgeRanges = function(ageObject){
        var ageText = '', ageArray = [], formattedAgeArray = [], ageIndex=0, keySplit=[];

        if(Object.keys(ageObject).length>0){
            for(var key in ageObject){
                if(ageObject[key] === true){
                    keySplit = [];
                    keySplit = key.split("_");
                    if(keySplit[1]!='' && keySplit[2]!='') {
                        if(keySplit[2]==='plus'){
                            keySplit[2] = '+';
                        }else{
                            keySplit[2] = '-'+keySplit[2];
                        }
                        formattedAgeArray.push({
                            id: ageIndex++,
                            ageRange: keySplit[1] + keySplit[2],
                            checked: false
                        });
                        ageArray.push(keySplit[1] + keySplit[2]);
                        ageText += keySplit[1] + keySplit[2] + ', ';
                    }
                }
            }
            ageText = ageText.substring(0, ageText.length - 2);
        }
        return {
            'text': ageText,
            'formattedArray': formattedAgeArray,
            'array': ageArray,
        };
    }

    this.formatCountry = function(country){
        var country_text = '', countryAr = [];
        if(country.length>0){
            for(var i=0; i<country.length; i++){
                country_text += country[i]+', ';
                countryAr.push({
                    name: country[i],
                    flagCode: this.getCountryFlagCode(country[i]),
                    checked: true,
                });
            }
            country_text = country_text.substring(0, country_text.length - 2);
        }
        return {
            'text': country_text,
            'array': countryAr
        };
    }

    this.formatGender = function(genderObject){
        var genderText = '', genderArray = [];

        if(Object.keys(genderObject).length>0){
            for(var key in genderObject){
                if(genderObject[key] == 100){
                    genderText += key.charAt(0).toUpperCase() + key.slice(1)+', ';
                    genderArray.push({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        selected: true,
                        value: 100
                    });
                }
            }
            genderText = genderText.substring(0, genderText.length - 2);
        }
        return {
            'text': genderText,
            'array': genderArray
        };
    }

    this.prepareProjectDataToSave = function(project){
        console.log(project);
        var insertData = {
            teamname: usersService.getUserObject().teamname,
            projectname: project.projectName,
            projectdescription: project.projectDescription,
            numquestions: project.questions,
            projectcost: project.cost,
            communities: []
        }, i, j;
        for (i = 0; i < project.communityDetails.length; i++) {
            var countries = [],
                age = {},
                gender = {};
            for (j = 0; j < project.communityDetails[i].selected.countries.length; j++) {
                countries.push(project.communityDetails[i].selected.countries[j].name);
            }
            for (j = 0; j < project.communityDetails[i].ages.length; j++) {
                var temp = "age_" + project.communityDetails[i].ages[j].ageRange.replace("-", "_");
                if(temp=='age_65+'){
                    temp = 'age_65_plus';
                }
                if (project.communityDetails[i].ages[j].checked === true) {
                    age[temp] = true;
                } else {
                    age[temp] = false;
                }
            }
            for (j = 0; j < project.communityDetails[i].gender.length; j++) {
                if (project.communityDetails[i].gender[j].selected === true) {
                    gender[project.communityDetails[i].gender[j].name.toLowerCase()] = 100;
                } else {
                    gender[project.communityDetails[i].gender[j].name.toLowerCase()] = 0;
                }
            }
            insertData.communities.push({
                communityname: project.communityDetails[i].selected.community.name,
                communitydescription: project.communityDetails[i].selected.community.description,
                ageselection: age,
                respondents: project.communityDetails[i].selected.respondents.number,
                country: countries,
                province: [],
                region: [],
                gender: gender
            });
        }
        return insertData;
    }

}]);