'use strict';

// Declare app level module which depends on views, and components
angular.module('nimrod-portal', [
    'ngMaterial',
    'ngMessages',
    'ngRoute',
    'ui.grid', 
    'ui.bootstrap',
    'as.sortable',
    'ui.grid.selection',
    'nimrod-portal.landingpage',
    'nimrod-portal.partials',
    'nimrod-portal.filesexplorer',
    'nimrod-portal.files-manager',
    'nimrod-portal.experiment-manager',
    'nimrod-portal.resource-manager',
    'nimrod-portal.experiment',
    'nimrod-portal.resource',
    'ui.ace' 
]).
    config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider.otherwise({redirectTo: '/landingpage'});
        }])
    .constant('settings', {
        'URLs': {
            'base': '/client/',
            'apiBase': '/client/api/',
            'oauthStart': 'login',
            'logout': 'end_session',
            'sessionInfo': 'session_info?service=nimrod',
            'accessToken': 'access_token?service=nimrod',
            'serverApiBase': 'https://nimrod.rcc.uq.edu.au/nimbackend/api/',
            'listFolderBase64': 'execute/listfolderbase64',
            'deleteBase64': 'execute/deletebase64',
            'copyBase64': 'execute/copybase64',
            'moveBase64': 'execute/moveBase64',
            'listCopyingProcess': 'execute/listcopying',
            'getProjects': 'execute/getprojects',
            'accessibleLocations': 'execute/accessiblelocations',
            'getExperiments': 'execute/getexperiments',
            'addExperiment': 'execute/addexperiment',
            'compilePlanfile': 'execute/compileplanfile',
            'readPlanFile': 'execute/readtextfile',
            'deleteExperiment': 'execute/deleteexperiment', 
            'getResources': 'execute/getresources',
            'addResource': 'execute/addrcchpcresource',
            'deleteResource': 'execute/deleteresource',
            'assignResource': 'execute/assignresource',
            'unassignResource': 'execute/unassignresource',
            'getAssignments': 'execute/getassignments',
            'startExperiment': 'execute/startexperiment',
            'checkProcess': 'execute/checkprocess'    
        },
        'maxRetryOnServerError': 1
    })
    .controller('AppCtrl', ['$mdToast', '$rootScope', '$scope', '$interval', '$window', '$mdDialog',
        'settings','$location', 'SessionFactory', 'TokenHandler', 'UserFactory',
        function ($mdToast, $rootScope, $scope, $interval, $window, $mdDialog, 
        settings, $location, SessionFactory, TokenHandler, UserFactory) {
            $rootScope.$on('notify', function (event, message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position("bottom right")
                    .hideDelay(10000)
            );
        });
        document.getElementById("logout-btn").style.display="none"; 
        document.getElementById("expmanager").style.display="none"; 
        document.getElementById("resmanager").style.display="none"; 
        document.getElementById("filesmanagermgr").style.display="none";
        $scope.toolbarHidden = false;
        $rootScope.$on('makeToolbarVisible', function (event) {
            $scope.toolbarHidden = false;
        });

        $rootScope.$on('makeToolbarInvisible', function (event) {
            $scope.toolbarHidden = true;
        });
        $rootScope.$on('$routeChangeSuccess', function (event) {
            $scope.toolbarHidden = false;
        });
        
        // Starts the login auth flow
        var loginWindow;
        $scope.startLogin = function (service) {
            var width = 800,
                height = 600;
            var left = screen.width/2 - width/2,
                top = screen.height/2 - height/2;

            var url = settings.URLs.base + settings.URLs.oauthStart + "?service="+service;
            loginWindow = $window.open('about:blank', '', 
                "top=" + top + ",left=" + left + ",width="+width+",height="+height);
            // End any existing sessions before starting a new one
            SessionFactory.endSession.get({}, function() {
                loginWindow.location = url;
            });
        };
        // Called any time the login popup closes
        var onLoginWindowClose = function() {
            SessionFactory.sessionInfo.get({}, function(data) {
                if (data.has_oauth_access_token === "true") {
                    // FIXME: Call the provision endpoint. Do properly when
                    // web dev gets back.
                    UserFactory.provision.put({username: data.uname});

                    document.getElementById("home-btn").style.display="none";
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    $location.path("/experiment-manager");
                    document.getElementById("expmanager").style.display="block";
                    document.getElementById("resmanager").style.display="block";
                    document.getElementById("filesmanagermgr").style.display="block";
                } else {
                    $scope.broadcastMessage("Login failed :(");
                    //hide login and register button
                    $("#over").remove(); //added
                }
            });
        };

        // Detects whether the login window is still open
        var loginWindowPreviouslyClosed = true;
        var loginWindowOpen = function() {
            var windowOpen = angular.isDefined(loginWindow) && loginWindow.closed === false;
            if (loginWindowPreviouslyClosed === false && windowOpen === false) {
                loginWindowPreviouslyClosed = true;
                onLoginWindowClose();
            } else if (loginWindowPreviouslyClosed === true && windowOpen === true) {
                loginWindowPreviouslyClosed = false;
            }
            return windowOpen;
        };
        $interval(loginWindowOpen, 500); // Don't rely on the digest cycle - it can be slow.

        $scope.showSpinner = function() {
            return loginWindowOpen();
        };

        // Disables the login button if the service is not selected, or a login is currently in progress
        $scope.loginButtonDisabled = function(service) {
            return !angular.isDefined(service) || loginWindowOpen();
        };

        $scope.sessionRefreshTimer = $interval(function(){
                                                console.log("....Checking session....");
                                                $scope.checkSession();
                                            },300000);// every 5 minutes
        $scope.checkSession = function(onValidAccessTokenCallback){
            SessionFactory.sessionInfo.get({}, function(data) {
                if (data.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                } else {
                    $scope.session = data;
                    SessionFactory.accessToken.get({}).$promise.then(function (tokenData) {
                        TokenHandler.set(tokenData.access_token);
                        if(onValidAccessTokenCallback){
                            onValidAccessTokenCallback();
                        }
                    }),
                    function (error) {
                        $location.path("/landingpage");
                        return;
                    };
                }
            }),
            function (error) {
                $location.path("/landingpage");
                return;
            };
        };
        $scope.$on('$destroy', function () {
            if ($scope.sessionRefreshTimer) {
                $interval.cancel($scope.sessionRefreshTimer );
            }
        });

        // sign out
        $scope.doSignout = function () {
            console.log("Signing out");
            SessionFactory.endSession.get({}, function () {
                if(document.getElementById("login").style.display="none")
                {
                    document.getElementById("home-btn").style.display="block";
                    document.getElementById("login").style.display="inline-block";
                    document.getElementById("logout-btn").style.display="none"; 
                    document.getElementById("expmanager").style.display="none"; 
                    document.getElementById("resmanager").style.display="none"; 
                    document.getElementById("filesmanagermgr").style.display="none";
                }

                $location.path('/landingpage');
            });
        };


        /************************************************************/
        $scope.showAlertDialog = function(message){
            $mdDialog.show(
                $mdDialog.alert({
                    title: 'Alert', 
                    content: message,
                    ok: "Close"
                })
            );
        }

        $scope.broadcastMessage = function(message){
            $rootScope.$broadcast("notify", message);
        }

            
    }]);
