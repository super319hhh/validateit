/**
 * Created by pijus on 2016-03-14.
 */
/*
 *
 */
'use strict';

var app = angular.module('validateItUserPortalApp');

app.directive('breadcrumb', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/breadcrumb.html'
    };
});