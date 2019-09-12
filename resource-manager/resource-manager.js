'use strict';

angular.module('nimrod-portal.resource-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/resource-manager', {
            templateUrl: 'resource-manager/resource-manager.html',
            controller: 'ResourceManagerCtrl'
        });
    }])


    .controller('ResourceManagerCtrl', ['$scope', '$location', '$mdDialog',
        'ResourcesFactory', 'MiscFactory',
        function ($scope, $location, $mdDialog,
            ResourcesFactory, MiscFactory) {
            $scope.loading = false;
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
                listResources();
            });


            $scope.resGridOptions = {
                enableSorting: true,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                showGridFooter: false,
                data: [],
                columnDefs: [
                  { field: 'name', displayName: 'Name', width: '30%', headerTooltip: 'Resource Name' },
                  { field: 'machine', displayName: 'Machine', width: '25%', headerTooltip: 'HPC Machine'},
                  { field: 'ncpu', displayName: 'Ncpu', width: '15%', headerTooltip: 'Number of CPUs'},
                  { field: 'mem', displayName: 'Memory', width: '15%', headerTooltip: 'Memory (in Gbs)'},
                  { field: 'walltime', displayName: 'Walltime', width: '15%', headerTooltip: 'Walltime (in hours)'}
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
            * List all the resources
            */
            var listResources = function(){
                $scope.loading = true;
                ResourcesFactory.getResources.query().$promise.then(
                    function(returnData) {
                        if(returnData.commandResult.length > 0){
                            $scope.resGridOptions.data = [];
                            returnData.commandResult.forEach(function (item){
                                // parse string to a json
                                var resourceConfig = item.jsonconfig
                                                    .replace(/\"\"/g, "\"")
                                                    .replace(/\"{/g, "{")
                                                    .replace(/}\"/g, "}");
                                var resJson = JSON.parse(resourceConfig);
                                item.machine = MiscFactory.getMachineName(resJson.hpcargs[1]);
                                item.ncpu = resJson.ncpus;
                                item.mem = resJson.mem/(1024*1024*1024); // to Gbs
                                item.walltime = resJson.walltime/3600.0;
                                item.account = resJson.account;
                                $scope.resGridOptions.data.push(item);                                
                            });
                        }
                        $scope.loading = false;
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log("Error:" + error);
                        $scope.broadcastMessage("Could not get resource list");
                    }
                );
            }


            /**
            * delete selected res
            */
            $scope.deleteSelectedRes = function(ev){
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                      .title('Are you sure to delete this resource?')
                      .textContent('Resource to be deleted: ' + $scope.selectedItem.name + ' of type:' + $scope.selectedItem.type)
                      .ariaLabel('delete')
                      .targetEvent(ev)
                      .ok('Yes')
                      .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    $scope.loading = true;
                    ResourcesFactory.deleteResource.delete({'resname': $scope.selectedItem.name}).$promise.then(
                        function() {
                            $scope.broadcastMessage("Resource deleted");
                            listResources();
                        },
                        function (error) {
                            $scope.loading = false;
                            console.log("Error:" + error);
                            $scope.broadcastMessage("Could not delete resource!");
                        }
                    );
                }, function() {
                    console.log("You cancelled it");
                });
                
            }

           
        

}]);




