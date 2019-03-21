/* *
 * Description: This service will be used to share the common service functions
 * */
var app = angular.module('validateItUserPortalApp');

app.service('sharedService', ['httpServerService', '$q', 'growl', function(httpServerService, $q, growl) {

    this.httpResponseData = {
        communityList: {},
        communityDetails: {},
        newProjectPricing: {
            orgData: [],
            parsedData: {},
            respondentSet: [],
        },
    };

    /* *
     * Object: project
     * Elements: action {'new','draft'} | projectData: object that contains draft project data
     * Description: project variable controls the new project wizard for creating new project and update draft project
     * */
    this.project = {
        action: 'new',
        projectData: {},
        selectedProject: {},
        flags: {
            isCreated: false,
            isUpdated: false,
            isDeleted: false,
            isApproved: false,
            displayProjectList: {
                active: false,
                status: {
                    draft: false,
                    approvalRequired: false,
                    inProgress: false,
                    completed: false,
                }
            }
        },
        redirectedToProjectOverview: false,
        projectID: null,
        pageToShow: '',
    }

    this.redirection = {
        community: {
            flag: false,
            name: '',
        }
    }

    this.uniqueNames = []; // to hold the unique user fullnames in order to set their initials circles's background colors


    this.getProjectAction = function() {
        return this.project.action;
    }
    this.setProjectAction = function(setData) {
        this.project.action = setData;
    }
    this.getProjectData = function() {
        return this.project.projectData;
    }
    this.setProjectData = function(setData) {
        this.project.projectData = {};
        var data = (JSON.parse(JSON.stringify(setData)));
        this.project.projectData = data;
    }
    this.getSelectedProject = function() {
        return this.project.selectedProject;
    }
    this.setSelectedProject = function(setData) {
        this.project.selectedProject = {};
        var data = (JSON.parse(JSON.stringify(setData)));
        this.project.selectedProject = data;
    }

    // only one action can be performed at a time.
    this.setProjectFlag = function(flagName) {
        for (var key in this.project.flags) {
            if ((flagName != undefined || flagName != '') && key === flagName) {
                this.project.flags[key] = true;
            } else {
                if(key === 'displayProjectList'){
                    this.project.flags.displayProjectList.active = false;
                    for(var key2 in this.project.flags.displayProjectList.status){
                        if(this.project.flags.displayProjectList.status.hasOwnProperty(key2)){
                            this.project.flags.displayProjectList.status[key2] = false;
                        }
                    }
                }else{
                    this.project.flags[key] = false;
                }

            }
        }
    }
    this.getProjectFlags = function() {
        return this.project.flags;
    }
    this.setProjectID = function(projectID) {
        this.project.projectID = projectID;
        //this.project.pageToShow = pageToShow;
    }
    this.getProjectID = function() {
        return this.project.projectID;
    }
    this.setProjectRedirectedTo = function(redirected) {
        this.project.redirectedToProjectOverview = redirected;
    }
    this.getProjectRedirectedTo = function() {
        return this.project.redirectedToProjectOverview;
    }
    this.getProjectFlagActions = function() {
            return {
                projectID: this.project.projectID,
                pageToShow: this.project.psetProjectRedirectedToageToShow
            }
        }
        /* */
    this.setDisplayProjectList = function(status) {
        if (typeof(status) == 'undefined' || status === undefined) {
            this.project.flags.displayProjectList.active = false;
            this.project.flags.displayProjectList.status.draft = false;
            this.project.flags.displayProjectList.status.approvalRequired = false;
            this.project.flags.displayProjectList.status.inProgress = false;
            this.project.flags.displayProjectList.status.completed = false;
        } else {
            if (this.project.flags.displayProjectList.status.hasOwnProperty(status)) {
                this.project.flags.displayProjectList.active = true;
                this.project.flags.displayProjectList.status[status] = true;
            }

        }
    }

    this.resetProjectRedirectedFlags = function() {
        this.setProjectFlag();
        this.setProjectRedirectedTo(false);
        this.setProjectID(null);
        //this.setDisplayProjectList();
    }

    this.saveHttpResponseData = function(queryName, data) {
        switch (queryName) {
            case "NewProjectPricing":
                this.httpResponseData.newProjectPricing.orgData = data;
                break;

        }
    };

    this.getPricingTable = function() {
            return this.httpResponseData.newProjectPricing.parsedData;
        }
        /* *
         * Method: getPricingInfoFromDataSource
         * Params: Organization Name, User Team Name
         * Description: Make a web service call to get new project pricing information
         * Return:
         * */
    this.getPricingInfoFromDataSource = function(teamName) {
        var response = false;
        // http://localhost:9000/ws/questionsPricing?organizationname=BMO&teamname=Wealth%20Management
        if (typeof(teamName) != 'undefined' && teamName != null) {
            response = httpServerService.makeHttpRequest("questionsPricing?teamname=" + teamName, "get", []).then(function(responseData) {
                if(responseData.status===200){
                    return responseData.data;
                }else{
                    growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                    return false;
                }

            }, function(responseData) {
                growl.error("Oops! Seems something went wrong. If the issue persists, please contact support@validateit.com.");
                console.log("----- Response From Server -----");
                console.log("--> Failed");
                console.log(responseData);

            });
        }

        return response;
    }

    this.parseDataGetProjectPricing = function(dataToParse) {
        //console.log(" ----------- Parsing ------------- ");
        // prepare question list
        var priceTable = [],
            temp, i, j = 0,
            key, nQmax = 0,
            nQmin = 1000,
            uniqueRespondentSet = [];

        for (i = 0; i < dataToParse.length; i++) {
            if (Object.keys(dataToParse[i].numquestionstoamount).length > 0) {
                j = 0;

                priceTable[dataToParse[i].numberofrespondents] = new Array();
                for (key in dataToParse[i].numquestionstoamount) {
                    temp = key.split("-");
                    priceTable[dataToParse[i].numberofrespondents][j] = {
                        qRange: key,
                        min: Number(temp[0]),
                        max: Number(temp[1]),
                        price: dataToParse[i].numquestionstoamount[key],
                    };
                    if (Number(temp[1]) > nQmax) {
                        nQmax = Number(temp[1]);
                    }
                    if (Number(temp[0]) < nQmin) {
                        nQmin = Number(temp[0]);
                    }
                    j++;
                }

                if (uniqueRespondentSet.length > 0) {
                    uniqueRespondentSet.push(dataToParse[i].numberofrespondents);
                } else {
                    if (uniqueRespondentSet.indexOf(dataToParse[i].numberofrespondents) < 0) {
                        uniqueRespondentSet.push(dataToParse[i].numberofrespondents);
                    }
                }
            }
        }
        this.httpResponseData.newProjectPricing.respondentSet = uniqueRespondentSet;
        this.httpResponseData.newProjectPricing.parsedData = {
            nQmin: nQmin,
            nQmax: nQmax,
            priceChar: priceTable
        };
    }

    this.calculateTotalCost = function(totalRespondents, questions, priceTable) {
        var cost = 0;
        if (totalRespondents > 0) {
            for (var i = 0; i < priceTable.priceChar[totalRespondents].length; i++) {
                if (questions <= priceTable.priceChar[totalRespondents][i].max) {
                    cost = priceTable.priceChar[totalRespondents][i].price;
                    break;
                }
            }
        }
        //$scope.project.cost = cost;
        return cost;
    }
    this.getRespondentSet = function() {
        return this.httpResponseData.newProjectPricing.respondentSet;
    }

    /* *
     * Method: generateUniqueID
     * Parameters:
     * Description: This method will generate unique id for any recently added community
     * */
    this.generateUniqueID = function() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now();; //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    /* *
     * Method: sort_by
     * Parameters:
     * Description: This method will sort array of object based on specific element of the objects
     * */
    this.sort_by = function(field, reverse, primer) {
        var key = function(x) {
            return primer ? primer(x[field]) : x[field]
        };

        return function(a, b) {
            var A = key(a),
                B = key(b);
            return ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!reverse];
        }
    }

    this.allowedMIMETypes = {
        document: [{
            ext: ["doc"],
            mime: "application/msword",
        }, {
            ext: ["docx"],
            mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }, {
            ext: ["docm"],
            mime: "application/vnd.ms-word.document.macroEnabled.12",
        }, {
            ext: ["dotm"],
            mime: "application/vnd.ms-word.template.macroEnabled.12",
        }, {
            ext: ["odt"],
            mime: "application/vnd.oasis.opendocument.text",
        }, {
            ext: ["ott"],
            mime: "application/vnd.oasis.opendocument.text-template",
        }, {
            ext: ["odm"],
            mime: "application/vnd.oasis.opendocument.text-master",
        }, {
            ext: ["text"],
            mime: "text/plain",
        }, {
            ext: ["text"],
            mime: "application/plain",
        }, {
            ext: ["txt"],
            mime: "text/plain",
        }, {
            ext: ["rtf"],
            mime: "application/rtf",
        }, {
            ext: ["rtx"],
            mime: "text/richtext",
        }, {
            ext: ["pdf"],
            mime: "application/pdf",
        }],
        image: [{
            ext: ["jpg"], // shares the same Mimetype
            mime: "image/jpeg",
        }, {
            ext: ["jpeg"], // shares the same Mimetype
            mime: "image/jpeg",
        }, {
            ext: ["png"],
            mime: "image/png",
        }, {
            ext: ["tiff"],
            mime: "image/tiff",
        }, {
            ext: ["gif"],
            mime: "image/gif",
        }, {
            ext: ["bmp"],
            mime: "image/bmp",
        }, ],
        excel: [{
            ext: ["xls"], // shares the same Mimetype
            mime: "application/vnd.ms-excel",
        }, {
            ext: ["xlt"], // shares the same Mimetype
            mime: "application/vnd.ms-excel",
        }, {
            ext: ["xla"],
            mime: "application/vnd.ms-excel",
        }, {
            ext: ["xlsx"],
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }, {
            ext: ["xltx"],
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        }, {
            ext: ["xlsm"],
            mime: "application/vnd.ms-excel.sheet.macroEnabled.12",
        }, {
            ext: ["xltm"],
            mime: "application/vnd.ms-excel.template.macroEnabled.12",
        }, {
            ext: ["xlam"],
            mime: "application/vnd.ms-excel.addin.macroEnabled.12",
        },{
            ext: ["xlsb"],
            mime: "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
        }],
        video: [{
            ext: ["mov"],
            mime: "video/quicktime",
        }, {
            ext: ["mpeg4"],
            mime: "video/mp4",
        }, {
            ext: ["mp4"],
            mime: "video/mp4",
        }, {
            ext: ["avi"],
            mime: "video/avi",
        }, {
            ext: ["wmv"],
            mime: "video/x-ms-wmv",
        }, {
            ext: ["mpegps"],
            mime: "video/mp4",
        }, {
            ext: ["flv"],
            mime: "video/x-flv",
        }, {
            ext: ["3gpp"],
            mime: "video/3gpp",
        }, {
            ext: ["webm"],
            mime: "video/webm",
        }],
    }

    /* *
     * Method: isValidMimeType
     * Parameters: file type(document or image), file mime type
     * Description: This function checks the allowed file by mime type.
     * */
    this.isValidMimeType = function(type, mimeType) {
            var i = 0,
                found = false;
            if(this.allowedMIMETypes.hasOwnProperty(type)){
                for (i = 0; i < this.allowedMIMETypes[type].length; i++) {
                    if (mimeType == this.allowedMIMETypes[type][i].mime) {
                        found = true;
                        break;
                    }
                }
            }
            /*if (type == "document") {
                for (i = 0; i < this.allowedMIMETypes.document.length; i++) {
                    console.log("-->");
                    console.log(mimeType);
                    console.log(this.allowedMIMETypes.document[i].mime);
                    if (mimeType == this.allowedMIMETypes.document[i].mime) {
                        found = true;
                        break;
                    }
                }
            } else {
                for (i = 0; i < this.allowedMIMETypes.image.length; i++) {
                    if (mimeType == this.allowedMIMETypes.image[i].mime) {
                        found = true;
                        break;
                    }
                }
            }*/
            return found;
        }
        /* *
         * Method: isValidExtensionName
         * Parameters: file type(document or image), file extension name
         * Description: This function checks the allowed file by file extension name. 
         *              A complementary of MimeType check is case of the MimeType check doesn't work(the type of MS Office file to be uploaded is "")
         * */
    this.isValidExtensionName = function(type, extensionName) {
        var i = 0,
            found = false;
        if(this.allowedMIMETypes.hasOwnProperty(type)){
            for (i = 0; i < this.allowedMIMETypes[type].length; i++) {
                if (extensionName == this.allowedMIMETypes[type][i].ext) {
                    found = true;
                    break;
                }
            }
        }
        /*if (type == "document") {
            for (i = 0; i < this.allowedMIMETypes.document.length; i++) {
                if (extensionName == this.allowedMIMETypes.document[i].ext) {
                    found = true;
                    break;
                }
            }
        } else {
            for (i = 0; i < this.allowedMIMETypes.image.length; i++) {
                if (extensionName == this.allowedMIMETypes.image[i].ext) {
                    found = true;
                    break;
                }
            }
        }*/
        return found;
    }
    this.getActionObject = function() {
        var actionObject = new Object();
        actionObject.text = ''; // action text or action name

        actionObject.icon = false; // flag to add fort awesome icon before action text
        actionObject.iconClass = ''; // fort awesome class: Ex: 'fa fa-plus-square'
        actionObject.borderRight = ''; // 'brdr' border Class, 'brdr' => border line to right, '' => no border
        actionObject.isShadow = ''; // 'shadow' shadow Class, 'shadow' => to add box-shadow on the action button, '' => no box-shadow
        actionObject.bgColor = false; // flag to determine if action button has any background color
        actionObject.bgColorClass = ''; // {'cgreen', 'cred', 'cblue', 'cgray'} background color class name, '' => for no background color
        actionObject.hasMoreClass = false; // flag to identify if there are more classes for this action button
        actionObject.moreClass = ''; // additional Class names
        actionObject.onClickFunc = ""; // onClick function name
        actionObject.data = []; // data on which the action will perform
        return actionObject;
    }
    this.getActionBarObject = function() {
        var actionBarObject = new Object();

        actionBarObject.display = false;
        actionBarObject.width = ''; // 'full-wd' => full width
        actionBarObject.leftCol = new Object();
        actionBarObject.leftCol.display = true;
        actionBarObject.leftCol.actions = [];
        actionBarObject.rightCol = new Object();
        actionBarObject.rightCol.display = true;
        actionBarObject.rightCol.actions = [];
        return actionBarObject;
    }

    this.colorClasses = ['blue', 'red', 'purple', 'orange', 'dark-green', 'dark-gray', 'green', 'brown', 'light-purple', 'light-green', 'light-cayn', 'light-brown', 'dark-brown', 'light-gray'];
    this.getColorClasses = function() {
        return this.colorClasses;
    }
    this.getRandomColorClass = function(exceptColor) {
        var new_color = "",
            current_color = "";
        current_color = exceptColor;
        new_color = current_color;
        while (current_color === new_color) {
            new_color = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)];
        }
        return new_color;
    }

    /* this.redirection = {
        community: {
            flag: false,
            name: '',
        }
    }*/
    this.setRedirection = function(page, property, value, reset) {
        if (this.redirection.hasOwnProperty(page)) {
            if (this.redirection[page].hasOwnProperty(property)) {
                this.redirection[page][property] = value;
            }
        }
    }

    this.getRedirection = function(page, property) {
        if (this.redirection.hasOwnProperty(page)) {
            if (this.redirection[page].hasOwnProperty(property)) {
                return this.redirection[page][property];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    this.formatActivityList = function(activities) {
        var initials = '',
            colorClass = '';

        for (var i = activities.length - 1; i >= 0; i--) {
            initials = '';

            if (activities[i].username.firstname !== null && activities[i].username.firstname.trim() !== '') {
                initials += activities[i].username.firstname.charAt(0).toUpperCase();
            }
            if (activities[i].username.lastname !== null && activities[i].username.lastname.trim() !== '') {
                initials += activities[i].username.lastname.charAt(0).toUpperCase();
            }
            if (initials == '') {
                initials = '?';
            }
            if (i == (activities[i].length - 1)) {
                colorClass = this.colorClasses[Math.floor(Math.random() * sideBarService.colorClasses.length)];
            } else {
                colorClass = this.getRandomColorClass(colorClass);
            }
            activities[i].colorClass = colorClass + " slideInLeft animated";
            activities[i].initials = initials;
        }
        activities.sort(this.sort_by('activitydate', false, parseInt));
        return activities;
    }

    /**
     * [formatActivityLogs: set inithials background colors of users' activitiy logs, the color should be the same if the logs belongs the same user]
     * @param  {[type]} activities [activity logs list]
     * @param  {[type]} uniqueNames [unique fullname array of users from the activity logs list]
     * @return {[type]}            [description]
     */
    this.formatActivityLogs = function(activities) {

        for (var i = 0; i < activities.length; i++) {
            var initials = '';
            var fullname = '';
            var isNameFound = false;

            if (activities[i].username.firstname !== null && activities[i].username.firstname.trim() !== '') {
                initials += activities[i].username.firstname.charAt(0).toUpperCase();
                fullname += activities[i].username.firstname + ' ';
            }
            if (activities[i].username.lastname !== null && activities[i].username.lastname.trim() !== '') {
                initials += activities[i].username.lastname.charAt(0).toUpperCase();
                fullname += activities[i].username.lastname;
            }
            if (initials == '') {
                initials = '?';
                fullname = '?';
            }
            activities[i].initials = initials;
            activities[i].fullName = fullname;
            if (this.uniqueNames.length == 0) {
                // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)] + " slideInLeft animated"; // randomly select a color
                var colorClass = this.colorClasses[0]; // select the first color in colorClasses array
                this.uniqueNames.push({
                    'fullName': fullname,
                    'color': colorClass
                });
            } else {
                for (var j = 0; j < this.uniqueNames.length; j++) {
                    if (this.uniqueNames[j].fullName === fullname) {
                        isNameFound = true;
                        break;
                    }
                }
                if (!isNameFound) {
                    // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)] + " slideInLeft animated"; // randomly select a color
                    var colorClass = this.colorClasses[(this.uniqueNames.length) % this.colorClasses.length]; // select the color next color in the colorClasses array
                    this.uniqueNames.push({
                        'fullName': fullname,
                        'color': colorClass
                    });
                }
            }
        }
        for (var i = 0; i < activities.length; i++) {
            for (var j = 0; j < this.uniqueNames.length; j++) {
                if (activities[i].fullName === this.uniqueNames[j].fullName) {
                    activities[i].colorClass = this.uniqueNames[j].color + " slideInLeft animated";
                }
            }
        }
        activities.sort(this.sort_by('activitydate', false, parseInt));
        return activities;
    }

/**
 * [formatProjectNotes: set inithials background colors of users' project notes, the color should be the same if the notes belongs the same user]
 * @param  {[type]} notes [description]
 * @return {[type]}       [description]
 */
    this.formatProjectNotes = function(notes) {
        for (var i = 0; i < notes.length; i++) {
            var isNameFound = false;
            if (this.uniqueNames.length == 0) {
                // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)]; // randomly select a color
                var colorClass = this.colorClasses[0]; // select the first color in colorClasses array
                this.uniqueNames.push({
                    'fullName': notes[i].name,
                    'color': colorClass
                });
            } else {
                for (var j = 0; j < this.uniqueNames.length; j++) {
                    if (this.uniqueNames[j].fullName === notes[i].name) {
                        isNameFound = true;
                        break;
                    }
                }
                if (!isNameFound) {
                    // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)]; // randomly select a color
                    var colorClass = this.colorClasses[(this.uniqueNames.length) % this.colorClasses.length]; // select the color next color in the colorClasses array
                    this.uniqueNames.push({
                        'fullName': notes[i].name,
                        'color': colorClass
                    });
                }
            }
        }
        for (var i = 0; i < notes.length; i++) {
            for (var j = 0; j < this.uniqueNames.length; j++) {
                if (notes[i].name === this.uniqueNames[j].fullName) {
                    notes[i].colorClass = this.uniqueNames[j].color + ' slideInRight animated';
                }
            }
        }
        return notes;
    }

/**
 * [setNewProjectNoteColor: set inithials background color of user's new project note, the color should be the selected color for the user(if already selected)]
 * @param {[type]} newProjectNote [description]
 */
    this.setNewProjectNoteColor = function(newProjectNote) {
        var isNameFound = false;
        if (this.uniqueNames.length == 0) {
            // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)]; // randomly select a color
            var colorClass = this.colorClasses[0]; // select the first color in colorClasses array
            this.uniqueNames.push({
                'fullName': newProjectNote.name,
                'color': colorClass
            })
        } else {
            for (var j = 0; j < this.uniqueNames.length; j++) {
                if (this.uniqueNames[j].fullName === newProjectNote.name) {
                    isNameFound = true;
                    break;
                }
            }
            if (!isNameFound) {
                // var colorClass = this.colorClasses[Math.floor(Math.random() * this.colorClasses.length)]; // randomly select a color
                var colorClass = this.colorClasses[(this.uniqueNames.length) % this.colorClasses.length]; // select the color next color in the colorClasses array
                this.uniqueNames.push({
                    'fullName': newProjectNote.name,
                    'color': colorClass
                });
            }
        }
        for (var j = 0; j < this.uniqueNames.length; j++) {
            if (newProjectNote.name === this.uniqueNames[j].fullName) {
                newProjectNote.colorClass = this.uniqueNames[j].color + ' slideInRight animated';
            }
        }
        return newProjectNote;
    }

    this.textEllipsis = function(text, maxLen){
        if(typeof(text) != 'undefined' && text != null){
            if(typeof(maxLen) == 'undefined' || maxLen==null || maxLen==''){
                maxLen = 0;
            }
            if(text.length>maxLen && maxLen>0){
                text = text.substring(0,maxLen);
                text += "...";
            }
        }
        return text;
    }

}]);