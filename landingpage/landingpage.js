'use strict';

angular.module('nimrod-portal.landingpage', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/landingpage', {
            templateUrl: 'landingpage/landingpage.html',
            controller: 'LandingPageCtrl'
        });
    }])

    .controller('LandingPageCtrl', ['SessionInfoFactory',
        function (SessionInfoFactory) {
            document.getElementById("home-btn").className="menu__link active";
            document.getElementById("contact-btn").className="menu__link";
            document.getElementById("filesmanagermgr").className="menu__link";
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    document.getElementById("login").style.display="block";
                    document.getElementById("logout-btn").style.display="none";
                    document.getElementById("filesmanagermgr").style.display="none";
                }else{
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    document.getElementById("filesmanagermgr").style.display="block";
                }
            })
        }

    ]);
