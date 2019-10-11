'use strict';

angular.module('nimrod-portal.experiment', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment/', {
            templateUrl: 'experiment/experiment.html',
            controller: 'ExperimentCtrl'
        });
    }])

    .controller('ExperimentCtrl', ['$scope', '$location', 
            'ExperimentsFactory', 'ResourcesFactory', 'MiscFactory',
        function ($scope, $location, 
            ExperimentsFactory, ResourcesFactory, MiscFactory) {
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
                getOrCreateExperiment($location.search().experimentname);
                if($location.search().experimentname)
                    listResourcesAndAssignedResources(false);
                else
                    listResourcesAndAssignedResources(true);    
                checkMasterProcessRunning();
            });

            // experiment
            $scope.experiment = {};
            $scope.newExperiment = true;
            $scope.experiment.validated = false;
            //list of nimrod resources
            $scope.resources = [];
            // list of assigned resources
            $scope.assignedResources = [];
            // an extra loadign variable
            $scope.resourceLoading = false;
            // is master running
            $scope.isMasterRunning = true;
            /**
            * List all the eperiments
            */
            var getOrCreateExperiment = function(experimentname){
                var found = false;
                if(experimentname){
                    $scope.loading = true;
                    ExperimentsFactory.getExperiments.query().$promise.then(
                        function(returnData) {
                            returnData.commandResult.forEach(function(exp){
                                if(exp.name === experimentname){
                                    found = true;
                                    $scope.newExperiment = false;
                                    $scope.experiment = exp;
                                    // to make it consistent when uploading exp name
                                    $scope.experiment.expname = exp.name;
                                    $scope.experiment.validated = true;
                                    // query planfile here
                                    var planfilePath = exp.workdir + "/" + exp.name + ".pln";
                                    ExperimentsFactory.planfile.read({'path': planfilePath}).$promise.then(
                                        function(returnData){
                                            console.log(returnData);
                                            if(returnData.commandResult && returnData.commandResult.length > 0)
                                                $scope.experiment.planfile = atob(returnData.commandResult[0].output);
                                        },
                                        function(error){
                                            console.log("Problem getting plan file!!");
                                            console.log(error);
                                            $scope.broadcastMessage("Failed to read plan file");
                                        }
                                    );
                                    // list resources
                                    if(!$scope.resourceLoading)
                                        $scope.loading = false;
                                }
                            });
                        },
                        function(error){
                            $scope.loading = false;
                            console.log("Problem querying experiments.");
                            console.log(error);
                        }
                    );
                }

                if(!found) {
                    $scope.newExperiment = true;
                    $scope.experiment.expname = '';
                    $scope.experiment.validated = false;
                }

                   
            }
            
            /************************************************************/
            /* Validate the plan file */
            /************************************************************/
            $scope.validatePln = function(){
                $scope.loading = true;
                var planB64 = btoa($scope.experiment.planfile);
                console.log(planB64);
                ExperimentsFactory.validatePlanFile.verify({'pln': planB64}).$promise.then(
                    function(returnData) {
                        console.log(returnData);
                        $scope.loading = false;
                        $scope.experiment.validated = true;
                    },
                    function (error) {
                        $scope.loading = false;
                        $scope.experiment.validated = false;
                        console.log(error);
                        $scope.broadcastMessage("Error in your planfile!!!");
                    });
            }


            $scope.createExperiment = function(){
                $scope.loading = true;
                var exp = {'expname': $scope.experiment.expname, 
                            'pln': btoa($scope.experiment.planfile)};
                ExperimentsFactory.addExperiment.add(exp).$promise.then(
                    function(returnData) {
                        $scope.loading = false;
                        $scope.newExperiment = false;
                        listResourcesAndAssignedResources(true);
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log(error);
                        $scope.broadcastMessage("Could not add the experiment!!!");
                    });
            }

            /********************************************/
            /*resources*/
            /********************************************/
            $scope.selectItem = function(resource){
                for(var i =0; i< $scope.resources.length; i++){
                    if($scope.resources[i].name === resource.name){
                        var index = i;
                        // actually do the assignment or unassignment here
                        if(resource.selected){
                            console.log("Try to unassign resource:" + resource.name 
                                                    + " from experiment:" + $scope.experiment.expname);
                            // unassign
                            $scope.loading = true;
                            var unassignment = {"expname": $scope.experiment.expname, 
                                              "resname": resource.name};
                            ExperimentsFactory.unassignResource.unassign(unassignment).$promise.then(
                                function(returnData) {
                                    $scope.resources[index].selected = !$scope.resources[index].selected;
                                    $scope.loading = false;
                                    $scope.assignedResources.splice( 
                                                        $scope.assignedResources.indexOf(resource.name)
                                                        ,1);
                                },
                                function (error) {
                                    $scope.loading = false;
                                    console.log("error unassign resources");
                                    console.log(error);
                                    $scope.showAlertDialog("Could not unassign resource:" + resource.name 
                                                    + " from experiment:" + $scope.experiment.expname);
                                }
                            );
                        } else {
                            // assign
                            console.log("Try to assign resource:" + resource.name 
                                                    + " to experiment:" + $scope.experiment.expname)
                            var assignment = {"expname": $scope.experiment.expname, 
                                              "resname": resource.name};
                            $scope.loading = true;
                            ExperimentsFactory.assignResource.assign(assignment).$promise.then(
                                function(returnData) {
                                    $scope.loading = false;
                                    $scope.resources[index].selected = !$scope.resources[index].selected;
                                    $scope.assignedResources.push(resource.name);
                                },
                                function (error) {
                                    $scope.loading = false;
                                    console.log("error assign resources");
                                    console.log(error);
                                    $scope.showAlertDialog("Could not assign resource:" + resource.name 
                                                    + " to experiment:" + $scope.experiment.expname);
                                }
                            );
                        }//end else

                        
                    }
                }
            }

            /**
            * List all the resources and assigned ones
            */
            var listResourcesAndAssignedResources = function(newlyCreated){
                if(!newlyCreated){
                    $scope.loading = true;
                }
                $scope.resourceLoading = true;
                ResourcesFactory.getResources.query().$promise.then(
                    function(returnData) {
                        if(returnData.commandResult.length > 0){
                            $scope.resources = [];
                            for(var i=0; i< returnData.commandResult.length; i++){
                                var item = returnData.commandResult[i];
                                // parse string to a json
                                var resourceConfig = item.jsonconfig
                                                    .replace(/\"\"/g, "\"")
                                                    .replace(/\"{/g, "{")
                                                    .replace(/}\"/g, "}");
                                var resJson = JSON.parse(resourceConfig);
                                if(item.type==="hpc"){
                                    item.machine = MiscFactory.getMachineName(resJson.server);
                                    item.ncpu = resJson.ncpus;
                                    item.mem = resJson.mem/(1024*1024*1024); // to Gbs
                                    item.walltime = resJson.walltime/3600.0;
                                    item.account = resJson.account;
                                    item.selected = false;
                                }
                                $scope.resources.push(item);
                            }
                            // only list assigned one for the old experiments
                            if(!newlyCreated && $scope.experiment.expname.trim()!==''){
                                console.log("get assignments");
                                ExperimentsFactory.assignments.query({"expname": $scope.experiment.expname}).$promise.then(
                                    function(returnData) {
                                        $scope.assignedResources = [];
                                        for(var i =0; i < returnData.commandResult.length; i++){
                                            $scope.assignedResources.push(returnData.commandResult[i].name);
                                            for(var j =0; j < $scope.resources.length; j++){
                                                if(returnData.commandResult[i].name == $scope.resources[j].name)
                                                    $scope.resources[j].selected = true;
                                            }    
                                        }
                                        console.log("done resource loading");
                                        $scope.resourceLoading = false;
                                        $scope.loading = false;
                                    },
                                    function (error) {
                                        console.log("Error getting assignments");
                                        console.log(error);
                                    }
                                );
                            }
                            else{
                                $scope.resourceLoading = false;
                                $scope.loading = false;
                            }
                        }
                    },
                    function (error) {
                        console.log("Error getting resources")
                        console.log(error);
                    }
                );
            }

            /******************************************/
            /* start exp**/
            /*******************************************/
            $scope.startExperiment = function(){
                $scope.loading = true;
                ExperimentsFactory.startExperiment.start({"experiment": $scope.experiment.expname}).$promise.then(
                    function(returnData) {
                        $location.path("/experiment-manager");
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log("Error starting experiment");
                        console.log(error);
                        $scope.showAlertDialog("Could not start experiment:" + $scope.experiment.expname);
                    }
                );
            }

            /******************************************/
            /* ace**/
            /*******************************************/
            $scope.aceLoaded = function(_editor) {
                // Options
                _editor.setReadOnly(false);
                ace.config.set("modePath", "./");
            };
             
            $scope.aceChanged = function(e) {
            };



            /******************************************/
            /* check master process **/
            /*******************************************/
            var checkMasterProcessRunning = function(){
                ExperimentsFactory.checkProcess.check().$promise.then(
                        function(returnData) {
                            var cmdResult = returnData.commandResult;
                            if(cmdResult.hasOwnProperty('alive')){
                                var alive = parseInt(cmdResult.alive);
                                $scope.isMasterRunning = (alive===1);
                            }
                            else
                                $scope.isMasterRunning = false;    
                        },
                        function (error) {
                            // is this safe ?
                            $scope.isMasterRunning = false;    
                        }
                    )                
            }
            
            


        }]);




