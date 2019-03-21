/*
 *	to use this directive, rewrite the modal-dialog inside the directive
 */
'use strict';

var app = angular.module('validateItUserPortalApp');


app.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog" ng-transclude>' + 
            '<div class="modal-content">' + 
              '<div class="modal-header" style="background-color:#337ab7">' + 
                '<button type="button" class="close" ng-click="resetModal()" data-dismiss="modal" aria-hidden="true" style="color:#ffffff">&times;</button>' +
                // '<h4 class="modal-title">{{ title }}</h4>' + 
              '</div>' + 
              '<div class="modal-body" style="background-color:#e7e7e7"></div>' + 
              // '<div class="modal-footer" style="background-color:#e7e7e7"></div>' +
          '</div>' + 
        '</div>' +
       '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {

        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        // Modal On Open
        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;

          });
        });

        // Modal On Close
        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
            // check for functions defined in controller which will be triggered on closing the modal
            if(scope.$parent.hasOwnProperty('modalOnClose')){
              if(scope.$parent.modalOnClose.callingFunc!=''){
                scope.$parent.$eval(scope.$parent.modalOnClose.callingFunc+"()");
              }
            }
          });
        });
      }
    };
  });