/**
 * Created by pijus on 2016-01-11.
 */

/*
 *	to use this directive, rewrite the modal-dialog inside the directive
 */
'use strict';

var app = angular.module('validateItUserPortalApp');

app.directive('communityBox', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/community_selection_box.html'
    };
});

app.directive('newCommunityForm', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/np_community_add_template.html'
    };
});

app.directive('addNewCommunityForm', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/add_new_community_form.html'
    };
});

app.directive('communityDetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/community_details.html'
    };
});