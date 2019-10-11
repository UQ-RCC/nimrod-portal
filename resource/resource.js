'use strict';

angular.module('nimrod-portal.resource', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/resource/', {
            templateUrl: 'resource/resource.html',
            controller: 'ResourceCtrl'
        });
    }])

    .controller('ResourceCtrl', ['$scope', '$location', 
        'ResourcesFactory', 'GetProjectsFactory', 'MiscFactory', 
        function ($scope, $location, 
            ResourcesFactory, GetProjectsFactory, MiscFactory) {
            /*********************************************/
            $scope.accounts = [];
            $scope.availableMachines = MiscFactory.availableMachines();

            // experiment
            $scope.resource = {};
            $scope.newRes = false;
            // loading
            $scope.loading = false;
            // call checkSession for the first ime
            $scope.checkSession(function(){
                document.getElementById("home-btn").style.display="none";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("expmanager").style.display="block";
                document.getElementById("expmanager").className="menu__link";
                document.getElementById("resmanager").style.display="block";
                document.getElementById("resmanager").className="menu__link active";
                document.getElementById("filesmanagermgr").style.display="block";
                document.getElementById("filesmanagermgr").className="menu__link";
                GetProjectsFactory.query().$promise.then(
                    function(returnData){
                        $scope.accounts = returnData.commandResult;
                        // in case this loads later than assign default resource
                        if($scope.newRes)
                            $scope.resource.account = $scope.accounts[0].group;
                        
                    },
                    function (error) {
                        console.log("Error:" + error);
                        $scope.broadcastMessage("Could not load account strings!");
                    }
                );
                getOrCreateResource($location.search().resourcename);

            });


            /**
            * List all the eperiments
            */
            var getOrCreateResource = function(resourcename){
                var found = false;
                if(resourcename){
                    $scope.loading = true;
                    ResourcesFactory.getResources.query().$promise.then(
                        function(returnData) {
                            returnData.commandResult.forEach(function(resource){
                                if(resource.name === resourcename){
                                    found = true;
                                    var resourceConfig = resource.jsonconfig
                                                    .replace(/\"\"/g, "\"")
                                                    .replace(/\"{/g, "{")
                                                    .replace(/}\"/g, "}");
                                    var resJson = JSON.parse(resourceConfig);
                                    if(resource.type==="hpc"){
                                        //console.log(resJson);
                                        $scope.resource = {
                                            'resname': resourcename,
                                            'machine': resJson.server,
                                            'ncpu': resJson.ncpus,
                                            'mem': resJson.mem/(1024*1024*1024), // to Gbs
                                            'hour': resJson.walltime/3600.0,
                                            'limit': resJson.limit,
                                            'maxbatch': resJson.max_batch_size,
                                            'account': resJson.account
                                        };
                                        $scope.resource.nbatch = Math.ceil($scope.resource.limit/$scope.resource.maxbatch);
                                    }
                                    
                                    $scope.newRes = false;
                                }
                            });
                            $scope.loading = false;
                        },
                        function (error) {
                            $scope.loading = false;
                            console.log("Error:" + error);
                            $scope.broadcastMessage("Could not query resource. Create new one!");
                        }
                    );

                     
                }
                // check again
                if(!found) {
                    $scope.newRes = true;
                    var account = "";
                    if($scope.accounts && $scope.accounts.length > 0)
                        account = $scope.accounts[0].group;
                    $scope.resource = {
                        'resname': '',
                        'machine': $scope.availableMachines[0].value,
                        'ncpu':2 ,
                        'mem': 2,
                        'hour': 2,
                        'nbatch':2,
                        'limit': 4,
                        'maxbatch': 2,
                        'account': account
                    };
                }

            }


            /*******************************************/
            /* create resource*/
            /*******************************************/
            $scope.createResource = function(){
                // for some reasons, empty select box still allows form to be submmited
                if($scope.resource.account.trim() === ""){
                    $scope.broadcastMessage("You must select an account");
                    return;
                }
                $scope.loading = true;
                // change limit accorindlgy
                $scope.resource.limit = $scope.resource.nbatch * $scope.resource.maxbatch;
                ResourcesFactory.addResource.add($scope.resource).$promise.then(
                    function() {
                        $location.path("/resource-manager");
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log("Error:");
                        console.log(error);
                        $scope.broadcastMessage("Fail to add resource. Error:" + error);
                    }
                );
            }

        }]);




