'use strict';

angular.module('nimrod-portal.landingpage', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/landingpage', {
            templateUrl: 'landingpage/landingpage.html',
            controller: 'LandingPageCtrl'
        });
    }])

    .controller('LandingPageCtrl', ['$scope', '$location','SessionInfoFactory',
        function ($scope, $location, SessionInfoFactory) {
            $scope.checkSession(function(){
                $location.path("/files-manager");
            })
        }

    ]);
