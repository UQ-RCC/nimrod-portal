'use strict';

angular.module('nimrod-portal.experiment-viewer', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment-viewer', {
            templateUrl: 'experiment-viewer/experiment-viewer.html',
            controller: 'ExperimentViewerCtrl'
        });
    }])

    .controller('ExperimentViewerCtrl', ['$scope', '$rootScope', '$interval', '$location', 
        'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler',
        function ($scope, $rootScope, $interval, $location, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler) {
            

            // Gets the session data and redirects to the login screen if the user is not logged in
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
		        if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                }            
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("faq-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("expviewermgr").style.display="block";
                document.getElementById("expviewermgr").className="menu__link active";
                document.getElementById("expmanagermgr").style.display="block";
                document.getElementById("expmanagermgr").className="menu__link";
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    //get the jobs for the first time
                    
                });
                 
            });

            
            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                
            });
            
            
            

        }]);




