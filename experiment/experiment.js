'use strict';

angular.module('nimrod-portal.experiment', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment/', {
            templateUrl: 'experiment/experiment.html',
            controller: 'ExperimentCtrl'
        });
    }])

    .controller('ExperimentCtrl', ['$scope', '$location', 'GetProjectsFactory',
            'ExperimentsFactory', 'ExperimentFactory', 'ResourcesFactory', 'MiscFactory', 'AssignmentFactory',
        function ($scope, $location, GetProjectsFactory,
            ExperimentsFactory, ExperimentFactory, ResourcesFactory, MiscFactory, AssignmentFactory) {
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
                // get expriment
                getOrCreateExperiment($location.search().experimentname);
                // list resources
                if($location.search().experimentname)
                    listResourcesAndAssignedResources(false);
                else
                    listResourcesAndAssignedResources(true);
                // is the master running    
                checkMasterProcessRunning();
                // get the projects
                GetProjectsFactory.query().$promise.then(
                    function(returnData){
                        $scope.accounts = returnData.commandResult;
                    },
                    function (error) {
                        console.log("Error:" + error);
                    }
                );

            });

            // experiment
            $scope.experiment = {};
            $scope.newExperiment = true;
            $scope.experiment.validated = false;
            //list of nimrod resources
            $scope.resources = [];
            // accounts this user belong to
            $scope.accounts = [];
            // list of assigned resources
            $scope.assignedResources = [];
            // an extra loadign variable
            $scope.resourceLoading = false;
            // is master running
            $scope.isMasterRunning = true;
            // is assignmen saved
            $scope.assignmentSaved = true;
            /**
            * List all the eperiments
            */
            var getOrCreateExperiment = function(experimentname){
                var found = false;
                if(experimentname){
                    $scope.loading = true;
                    ExperimentFactory.show({'name': experimentname}).$promise.then(
                        function(exp) {
                            if(exp.name === experimentname){
                                found = true;
                                $scope.newExperiment = false;
                                $scope.experiment = exp;
                                $scope.experiment.expname = exp.name;
                                $scope.experiment.validated = true;
                                $scope.experiment.planfile = exp.planfile;
                                // list resources
                                if(!$scope.resourceLoading)
                                    $scope.loading = false;
                            }
                            
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
                ExperimentsFactory.validatePlanFile.verify({'planfile': $scope.experiment.planfile}).$promise.then(
                    function(returnData) {
                        $scope.loading = false;
                        console.log(returnData);
                        if (returnData.errors.length > 0){
                            $scope.experiment.validated = false;
                            // var Range = ace.require('ace/range').Range;
                            returnData.errors.forEach(function(errr){
                                if($scope.aceSession){
                                    // $scope.aceSession.addMarker(
                                    //     new Range(errr.line-1, 0, errr.line-1, 1), "editor_error", "fullLine"
                                    // );
                                    $scope.aceSession.setAnnotations([{
                                        row: errr.line-1,
                                        column: 0,
                                        text: errr.message,
                                        type: "error"
                                    }]);
                                }    
                            });
                            $scope.broadcastMessage("Error! Hover the mouse over error icons to show error.");
                        }
                        else{
                            $scope.experiment.validated = true;
                            $scope.broadcastMessage("Valid plan file. Go ahead create new experiment now.");
                        }
                    });
            }


            $scope.createExperiment = function(){
                $scope.loading = true;
                var exp = {'name': $scope.experiment.expname, 
                            'planfile': $scope.experiment.planfile};
                ExperimentsFactory.addExperiment.add(exp).$promise.then(
                    function(returnData) {
                        $scope.loading = false;
                        $scope.newExperiment = false;
                        listResourcesAndAssignedResources(true);
                        $scope.broadcastMessage("Experiment created!");
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
            $scope.saveSelectResources = function(){
                var queryParam = $scope.assignedResources;
                queryParam.name = $location.search().experimentname || $scope.experiment.expname;
                AssignmentFactory.assign(queryParam).$promise.then(
                    function(returnData) {
                        var _msg = "Resource assignment saved! ";
                        if ($scope.assignedResources.length>0)
                            _msg = _msg + " You can start the experiment now."
                        else
                        _msg = _msg + " You need at least one resource to run an experiment."
                        $scope.broadcastMessage(_msg);
                        $scope.assignmentSaved = true;
                    },
                    function (error) {
                        $scope.broadcastMessage(error);
                    }
                );
            }

            $scope.selectItem = function(resource){
                var foundPosition = $scope.assignedResources.indexOf(resource.name);
                // found --> unassign 
                if (foundPosition >= 0){
                    resource.selected = false;
                    $scope.assignedResources.splice(foundPosition,1);
                } // not found --> assign
                else{
                    $scope.assignedResources.push(resource.name);
                    resource.selected = true;
                }
                $scope.assignmentSaved = false;
            }

            /**
            * List all the resources and assigned ones
            */
            var listResourcesAndAssignedResources = function(newlyCreated){
                if(!newlyCreated){
                    $scope.loading = true;
                }
                $scope.resourceLoading = true;
                ResourcesFactory.show().$promise.then(
                    function(returnData) {
                        if(returnData.length > 0){
                            $scope.resources = [];
                            for(var i=0; i< returnData.length; i++){
                                var resource = {};
                                if(returnData[i].type==="hpc"){
                                    resource.name = returnData[i].name;
                                    resource.machine = MiscFactory.getMachineName(returnData[i].config.server);
                                    resource.ncpu = returnData[i].config.ncpus;
                                    resource.mem = returnData[i].config.mem/(1024*1024*1024); // to Gbs
                                    resource.walltime = returnData[i].config.walltime/3600.0;
                                    resource.account = returnData[i].config.account;
                                    resource.limit = returnData[i].config.limit;
                                    resource.batchsize = returnData[i].config.max_batch_size;
                                    resource.nbatch = Math.ceil(returnData[i].config.limit/returnData[i].config.max_batch_size);
                                }
                                $scope.resources.push(resource);
                            }
                            // only list assigned one for the old experiments
                            if(!newlyCreated && $location.search().experimentname.trim()!==''){
                                AssignmentFactory.show({"name": $location.search().experimentname}).$promise.then(
                                    function(returnData) {
                                        $scope.assignedResources = [];
                                        returnData.forEach(function(resname){
                                            $scope.assignedResources.push(resname);
                                            $scope.resources.forEach(function(resource){
                                                if(resource.name == resname)
                                                    resource.selected = true;
                                            });
                                        });
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
                        else{
                            $scope.resourceLoading = false;
                            $scope.loading = false;
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
                ExperimentsFactory.startExperiment.start(
                        {"exp_name": $scope.experiment.expname, 
                        "account": $scope.accounts[0].group}
                    ).$promise.then(
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
                $scope.aceSession = _editor.getSession();
                // Options
                _editor.setReadOnly(false);
                ace.config.set("modePath", "customModes");
                // set default plan file
                $scope.experiment.planfile = '\
// More information at https://github.com/UQ-RCC/nimrodg/wiki/Planfile \n\
// parameter with int range \n\
parameter airspeed integer range from 50 to 600 step 50 \n\
// parameter with float range and label \n\
parameter AoA label "Angle of attack" float range from -45 to 45 step 2.5 \n\
// parameer with files \n\
parameter aircraft_model files select anyof "A3??.dat" "737-*.dat" \n\
// parametre with select \n\
parameter winglets text select anyof "none" "fence" "blended" "raked" \n\
// parameter with random \n\
parameter turbulence label "Normalized Reynolds" float random from 1 to 2 \n\
// main task \n\
task main \n\
    // copy files from root to compute node \n\
    copy root:${aircraft_model} node:. \n\
    copy root:wing_test.zip node:. \n\
    // exec a command	\n\
    exec unzip wing_test.zip \n\
    // shell exec: execute a command line on the system\'s default shell \n\
    shexec "./run_wing_test.sh ${aircraft_model} ${winglets} ${AoA} ${airspeed} ${turbulence} >> output.${jobindex}" \n\
    shexec "zip results.${jobindex} *" \n\
    // copy files from node back to root \n\
    copy node:results.${jobindex}.zip root:. \n\
endtask \n'};
             
            $scope.aceChanged = function(e) {
                $scope.experiment.validated = false;
            };

            /******************************************/
            /* check master process **/
            /*******************************************/
            var checkMasterProcessRunning = function(){
                ExperimentsFactory.checkProcess.check().$promise.then(
                        function(returnData) {
                            var cmdResult = returnData.commandResult[0];
                            if(cmdResult && cmdResult['status'] != 'F')
                                $scope.isMasterRunning = true;
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




