/**
 * Created by pijus on 2016-01-20.
 */
var app = angular.module('validateItUserPortalApp');

app.directive('actionBar', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/admin/action_bar.html'
    };
});