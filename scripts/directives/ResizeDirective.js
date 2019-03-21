/**
 * Created by pijus on 2016-01-06.
 */

/*
 *	to use this directive, rewrite the modal-dialog inside the directive
 */
'use strict';

var app = angular.module('validateItUserPortalApp');

app.directive('resize', function ($window) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        }, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            // To adjust sidebar height
            scope.resizeSidebarHeight = function () {
                var _h = 0;
                _h =  Math.max.apply(Math, [scope.windowHeight, document.getElementById("page-wrapper").offsetHeight, document.getElementsByTagName("body")[0].offsetHeight]);
                _h +=2;
                return {
                    'height': _h+"px"
                };
            };
            // To adjust project note height
            scope.resizeProjectNote = function(){
                return {
                    'height' : window.innerHeight - document.getElementById("lists").offsetTop - 155
                };
            }
            scope.resizeProjectNoteOnUpdate = function(){
                return {
                    'height' : window.innerHeight - document.getElementById("lists").offsetTop - 180
                }
            }
            scope.resizeCompletedProjectListInNewProject = function(){
                return {
                    'height' : window.innerHeight - 230
                }
            }
            scope.windowOverlayBody = function(){
                var body = document.body,
                    html = document.documentElement;

                var height = Math.max( body.offsetHeight,scope.windowHeight, document.getElementById("page-wrapper").offsetHeight );
                height +=52;
                var width = Math.max( body.offsetWidth, window.innerWidth ) - 17;
                //console.log("H:"+ document.getElementsByTagName("body").offsetHeight+" H:"+document.getElementById("page-wrapper").offsetHeight+" H:"+body.offsetHeight);
                return {
                    'height' : height+"px",
                    'width' : width+"px",

                }

            }
            scope.resizeHeight = function (className) {
                var elem = document.getElementsByClassName(className), i, max_h=0;
                for(i=0; i<elem.length; i++){
                    if(elem[i].offsetHeight>max_h){
                        max_h = elem[i].offsetHeight;
                    }
                }
                return {
                    'height': max_h + 'px'
                }
            }


        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
});