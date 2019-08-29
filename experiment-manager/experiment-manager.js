'use strict';

angular.module('nimrod-portal.experiment-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/experiment-manager', {
            templateUrl: 'experiment-manager/experiment-manager.html',
            controller: 'ExperimentManagerCtrl'
        });
    }])


    .controller('ExperimentManagerCtrl', ['$scope', '$location', 'GetExperimentsFactory',
        function ($scope, $location, GetExperimentsFactory) {
            
            $scope.loading = false;

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
                  { field: 'name', displayName: 'Name', headerTooltip: 'Experiment Name' },
                  { field: 'state', displayName: 'State', headerTooltip: 'Experiment State'},
                  { field: 'workdir', displayName: 'Workdir', headerTooltip: 'Experiment Work Directory'},
                  { field: 'creationtime', displayName: 'Created'}
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
                $scope.loading = true;
                GetExperimentsFactory.query().$promise.then(
                    function(returnData) {
                        console.log(returnData);
                        if(returnData.commandResult.length > 0){
                            $scope.expGridOptions.data = [];
                            returnData.commandResult.forEach(function (item){
                                $scope.expGridOptions.data.push(item);                                
                            });
                        }
                        $scope.loading = false;
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log("Error:" + error);
                        $scope.broadcastMessage("Could not get experiment list");
                    }
                );
            }
            

}]);




