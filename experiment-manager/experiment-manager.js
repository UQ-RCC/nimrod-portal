'use strict';

angular.module('nimrod-portal.experiment-manager', ['ngRoute', 'ngResource', 'ui.grid', 'ui.grid.selection', 
                                            'nimrod-portal.filesexplorer', 'nimrod-portal.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment-manager', {
            templateUrl: 'experiment-manager/experiment-manager.html',
            controller: 'ExperimentManagerCtrl'
        });
    }])

    .controller('ExperimentManagerCtrl', ['$scope', '$rootScope', '$location', '$uibModal', '$timeout',
            'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler', 'UserPreferenceFactory',

        function ($scope, $rootScope, $location, $uibModal, $timeout, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler, UserPreferenceFactory) 
        {
            
            //loading
            $scope.loading = false;
            
            // Gets the session data and redirects to the login screen if the user is not logged in
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/langingpage");
                    return;
                }
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("expviewermgr").style.display="block";
                document.getElementById("expviewermgr").className="menu__link";
                document.getElementById("expmanagermgr").style.display="block";
                document.getElementById("expmanagermgr").className="menu__link active";
                $scope.session = sessionData;
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    console.log(tokenData.access_token);
                    TokenHandler.set(tokenData.access_token);
                });
            });

}]);




