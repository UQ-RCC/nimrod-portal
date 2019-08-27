'use strict';

angular.module('nimrod-portal.experiment-viewer', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment-viewer', {
            templateUrl: 'experiment-viewer/experiment-viewer.html',
            controller: 'ExperimentViewerCtrl'
        });
    }])

    .controller('ExperimentViewerCtrl', ['$scope', 
        function ($scope) {
            
            // call checkSession for the first ime
            $scope.checkSession(function(){
                document.getElementById("home-btn").style.display="none";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("expmanager").style.display="block";
                document.getElementById("expmanager").className="menu__link active";
                document.getElementById("resmanager").style.display="block";
                document.getElementById("resmanager").className="menu__link";
                document.getElementById("filesmanagermgr").style.display="block";
                document.getElementById("filesmanagermgr").className="menu__link";
                getExperiment();
            });


            /**
            * List all the eperiments
            */
            var getExperiment = function(){

            }
            
           
            
            

        }]);




