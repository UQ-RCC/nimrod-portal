'use strict';

angular.module('nimrod-portal.partials', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/error', {templateUrl: 'partials/404.html', controller: 'ErrorCtrl'});
            $routeProvider.when('/contact', {templateUrl: 'partials/contact.html', controller: 'TextCtrl'});
    }])

    .controller('ErrorCtrl', ['$scope', '$rootScope', '$mdMedia',
        function ($scope, $rootScope, $mdMedia) {


        }])

    .controller('TextCtrl',['$scope', '$rootScope', '$mdMedia', '$location',
        function ($scope, $rootScope, $mdMedia, $location) {
            //document.getElementById("myFooter").style.visibility="hidden";
            var path = $location.path().replace(/\//g,'') + "-btn";
            ["home-btn", "contact-btn"].forEach(function(item){
                document.getElementById("expmanager").className="menu__link";
                document.getElementById("resmanager").className="menu__link";
                document.getElementById("filesmanagermgr").className="menu__link";
                if(item == path){
                    document.getElementById(item).className="menu__link active";
                }
                else{
                    document.getElementById(item).className="menu__link";
                }
            });
        }])

    