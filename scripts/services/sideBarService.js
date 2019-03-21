/**
 * Created by Kanthi on 2015-11-27.
 */
var app = angular.module('validateItUserPortalApp');
app.service('sideBarService', ['usersService', function(usersService) {
    this.showSideBar = false;

    this.setShowSideBar = function(visibility) {
        this.showSideBar = visibility;
    }
    this.getShowSideBar = function() {
        return this.showSideBar;
    }

    this.getSideBarItems = function() {
        if(usersService.getUserObject().teamrole == "A" || usersService.getUserObject().teamrole == "M"){
            return this.sidebar_admin_items;
        }else if(usersService.getUserObject().teamrole == "Reviewer"){
            return this.sidebar_reviewer_items;
        }else {
            return this.sidebar_items;
        }
    }

    this.setSelectedIndex = function(index) {

        if(usersService.getUserObject().teamrole == "A" || usersService.getUserObject().teamrole == "M") {
            for (var i = 0; i < this.sidebar_admin_items.length; i++) {
                if(i == index) {
                    this.sidebar_admin_items[i].selected = true;
                } else {
                    this.sidebar_admin_items[i].selected = false;
                }
            }
        }else if(usersService.getUserObject().teamrole == "Reviewer"){
           // this.sidebar_reviewer_items
            for (var i = 0; i < this.sidebar_reviewer_items.length; i++) {
                if(i == index) {
                    this.sidebar_reviewer_items[i].selected = true;
                } else {
                    this.sidebar_reviewer_items[i].selected = false;
                }
            }
        }
        else {
            for (var i = 0; i < this.sidebar_items.length; i++) {
                if(i == index) {
                    this.sidebar_items[i].selected = true;
                } else {
                    this.sidebar_items[i].selected = false;
                }
            }
        }
    }

    this.setSelectedByRoute = function(route){
        var sideBarItems = this.sidebar_items;
        if(usersService.getUserObject().teamrole == "A" || usersService.getUserObject().teamrole == "M") {
            sideBarItems = this.sidebar_admin_items;
        }
        else if(usersService.getUserObject().teamrole == "Reviewer"){
            sideBarItems = this.sidebar_reviewer_items;
        }

        if(usersService.getUserObject().teamrole == "Manager"){
            sideBarItems[0].path = "/#/employee_overview";
            for(var i = 0; i < sideBarItems.length; i++) {
                sideBarItems[i].selected = false;
            }
            sideBarItems[0].selected = true;
        }
        for(var i = 0; i < sideBarItems.length; i++) {
            if(sideBarItems[i].path=='/#'+route){
                sideBarItems[i].selected = true;
            }else{
                sideBarItems[i].selected = false;
            }
        }
    }

    this.sidebar_admin_items = [
        {
            name:"Home",
            icon: "fa-home",
            path: "/#/employee_overview",
            selected: true
        },
        {
            name:"Users",
            icon: "fa-user",
            path: "/#/team_overview",
            selected: false
        },
        {
            name: "Billing",
            icon: "fa-dollar",
            path: "/#/balance_overview",
            selected: false
        },
        {
            name: "Projects",
            icon: "fa-book",
            path: "/#/project_overview",
            selected: false
        },
        /*{
         name: "Question Templates",
         icon: "fa-file-text",
         path: "views/admin/team_question_templates.html"
         },*/
        {
            name: "Communities",
            icon: "fa-bullseye",
            path: "/#/communities",
            selected: false
        },
        {
            name: "New Project",
            icon: "fa-plus",
            path: "/#/new_project_wizard",
            selected: false
        },
        {
            name: "Activity",
            icon: "fa-calendar",
            path: "/#/activity",
            selected: false
        }

        /* {
         name: "Import",
         icon: "fa-database",
         path: "views/admin/import_wizard.html"
         }*/
    ];
    this.sidebar_items = [
        {
            name:"Home",
            icon: "fa-home",
            path: "/#/employee_overview",
            selected: true
        },
        /*{
            name:"Users",
            icon: "fa-user",
            path: "/#/team_overview",
            selected: false
        },
        {
            name: "Billing",
            icon: "fa-dollar",
            path: "/#/balance_overview",
            selected: false
        },*/
        {
            name: "Projects",
            icon: "fa-book",
            path: "/#/project_overview",
            selected: false
        },
        /*{
         name: "Question Templates",
         icon: "fa-file-text",
         path: "views/admin/team_question_templates.html"
         },*/
        {
            name: "Communities",
            icon: "fa-bullseye",
            path: "/#/communities",
            selected: false
        },
        {
            name: "New Project",
            icon: "fa-plus",
            path: "/#/new_project_wizard",
            selected: false
        },
        /*
         {
         name: "Import",
         icon: "fa-database",
         path: "views/admin/import_wizard.html"
         }*/
    ];

    this.sidebar_reviewer_items = [
        {
            name:"Home",
            icon: "fa-home",
            path: "/#/employee_overview",
            selected: true
        },
        {
            name: "Projects",
            icon: "fa-book",
            path: "/#/project_overview",
            selected: false
        },
        {
            name: "Communities",
            icon: "fa-bullseye",
            path: "/#/communities",
            selected: false
        },
    ];
}]);