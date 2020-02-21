'use strict';

angular.module('nimrod-portal.experiment-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment-manager', {
            templateUrl: 'experiment-manager/experiment-manager.html',
            controller: 'ExperimentManagerCtrl'
        });
    }])


    .controller('ExperimentManagerCtrl', ['$scope', '$location', '$interval', '$mdDialog', 'ExperimentsFactory', 'ExperimentFactory',
                                function ($scope, $location, $interval, $mdDialog, ExperimentsFactory, ExperimentFactory) { 
            $scope.loading = false;
            var expRefreshTimer;
            $scope.checkSession(function(){
                console.log("Checking session at experiment manager");
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
		        listExperiments();
                expRefreshTimer=$interval(listExperiments,30000);
            });

            $scope.expGridOptions = {
                enableSorting: true,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                showGridFooter: false,
                data: [],
                columnDefs: [
                  { field: 'name', displayName: 'Name', width: '16%', headerTooltip: 'Experiment Name' },
                  { field: 'state', displayName: 'State', width: '11%', headerTooltip: 'Experiment State'},
                  { field: 'completed_jobs', displayName: 'Completed', width:'11%', headerTooltip: 'Number of completed jobs'},
                  { field: 'failed_jobs', displayName: 'Failed', width:'10%', headerTooltip: 'Number of failed jobs'},
                  { field: 'running_jobs', displayName: 'Running', width:'10%', headerTooltip: 'Number of pending jobs'},
                  { field: 'pending_jobs', displayName: 'Pending', width:'10%', headerTooltip: 'Number of pending jobs'},
                  { field: 'total_jobs', displayName: 'Total', width:'10%', headerTooltip: 'Number of total jobs'},
                  { field: 'creationtimeformatted', width: '22%', displayName: 'Created'}
                ],
                onRegisterApi: function( gridApi ) {
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope,function(row){
                        console.log("row selection changed");
                        if(row.isSelected){
                            $scope.selectedItem = row.entity;
                        }
                    });
                }
            };

            /**
            * List all the eperiments
            */
            var listExperiments = function(){
		// if there is a request, return
                if($scope.loading){
                    return;
		}
                $scope.loading = true;
                ExperimentsFactory.getExperiments.query().$promise.then(
                    function(returnData) {
                        console.log(returnData);
                        if(returnData.length > 0){
                            $scope.expGridOptions.data = [];
                            returnData.forEach(function (item){
                                var options = { weekday: 'short', year: 'numeric', 
                                                month: 'short', day: 'numeric', hour: '2-digit', 
                                                minute: '2-digit'};
                                // item.creationtimeformatted = new Date(parseInt(item.creation_time)*1000)
                                //                                     .toLocaleDateString("en-US", options);
                                item.creationtimeformatted = new Date(item.creation_time)
                                                                    .toLocaleDateString("en-US", options);
                                // check job state
                                var totalJobs = parseInt(item.total_jobs);
                                var completeJobs = parseInt(item.completed_jobs);
                                var failedJobs = parseInt(item.failed_jobs);
                                var pendingJobs = parseInt(item.pending_jobs);
                                var runningJobs = parseInt(item.running_jobs);
                                if(totalJobs == completeJobs)
                                        item.state = 'COMPLETED';   
                                $scope.expGridOptions.data.push(item);                                
                            });
                        }
                        $scope.loading = false;
                    },
                    function (error) {
                        $scope.loading = false;
                        // console.log("Error @ listExperiments");
                        // console.log(error);
                        if(error.status==401)
                            $scope.checkSession();
                        else
                            $scope.broadcastMessage("Could not get experiment list");
                    }
                );
            }


            /**
            * delete selected exp
            */
            $scope.deleteSelectedExp = function(ev){
                var confirm = $mdDialog.confirm()
                      .title('Are you sure to delete this experiment?')
                      .textContent('Experiment to be deleted: ' + $scope.selectedItem.name)
                      .ariaLabel('delete')
                      .targetEvent(ev)
                      .ok('Yes')
                      .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    $scope.loading = true;
                    ExperimentFactory.delete ({'name': $scope.selectedItem.name}).$promise.then(
                        function() {
                            $scope.broadcastMessage("Experiment deleted");
                            listExperiments();
                        },
                        function (error) {
                            $scope.loading = false;
                            console.log("Error:" + error);
                            $scope.broadcastMessage("Could not delete experiment");
                        }
                    );
                }, function() {
                    console.log("You cancelled it");
                });
            }

            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                if (expRefreshTimer) {
                    $interval.cancel(expRefreshTimer);
                }
            });
            

}]);




