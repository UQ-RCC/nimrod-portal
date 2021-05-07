'use strict';

angular.module('nimrod-portal.resource-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/resource-manager', {
            templateUrl: 'resource-manager/resource-manager.html',
            controller: 'ResourceManagerCtrl'
        });
    }])


    .controller('ResourceManagerCtrl', ['$scope', '$location', '$mdDialog',
        'ResourcesFactory', 'MiscFactory', 'ResourceFactory', 
        function ($scope, $location, $mdDialog,
            ResourcesFactory, MiscFactory, ResourceFactory) {
            $scope.loading = false;
            $scope.checkSession(function(){
                document.getElementById("home-btn").style.display="none";
                document.getElementById("support-btn").className="menu__link";
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
                rowTemplate: rowTemplate(),
                data: [],
                columnDefs: [
                  { field: 'name', displayName: 'Name', width: '20%', headerTooltip: 'Resource Name' },
                  { field: 'machine', displayName: 'Machine', width: '20%', headerTooltip: 'HPC Machine'},
                  { field: 'nbatch', displayName: 'Total batches', width: '15%', headerTooltip: 'Total number of job batches'},
                  { field: 'batchsize', displayName: 'Batch size', width: '15%', headerTooltip: 'Number of jobs in a batch'},
                  { field: 'walltime', displayName: 'Walltime', width: '10%', headerTooltip: 'Batch walltime (in hours)'},
                  { field: 'ncpu', displayName: 'Ncpu', width: '10%', headerTooltip: 'Number of CPUs per job'},
                  { field: 'mem', displayName: 'Memory', width: '10%', headerTooltip: 'Memory (in Gbs) per job'}
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

            function rowTemplate() {
                // http://plnkr.co/edit/VJE4G458aOavZAedsjFW?p=preview
                return '<div ng-dblclick="grid.appScope.rowDblClick(row)"' +
                'ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"'+
                'class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"' +
                //'ui-grid-cell context-menu="grid.appScope.contextmenuOptions(row)"' + 
                ' ui-grid-cell ' + 
                'data-target="myMenu" ></div>'
            }

            $scope.rowDblClick = function(row) {
                $location.path("/resource").search({resourcename: row.entity.name});
            };


            /**
            * List all the resources
            */
            var listResources = function(){
                if ($scope.loading)
                    return;
                ResourcesFactory.show().$promise.then(
                    function(returnData) {
                        console.log(returnData);
                        if(returnData.length > 0){
                            $scope.resGridOptions.data = [];
                            returnData.forEach(function (item){
                                console.log(item.server);
                                console.log(item);
                                var resource = {};
                                if(item.type==="hpc"){
                                    resource.name = item.name;
                                    resource.machine = MiscFactory.getMachineName(item.config.server);
                                    resource.ncpu = item.config.ncpus;
                                    resource.mem = item.config.mem/(1024*1024*1024); // to Gbs
                                    resource.walltime = item.config.walltime/3600.0;
                                    resource.account = item.config.account;
                                    resource.limit = item.config.limit;
                                    resource.batchsize = item.config.max_batch_size;
                                    resource.nbatch = Math.ceil(item.config.limit/item.config.max_batch_size);
                                }
                                $scope.resGridOptions.data.push(resource);                                
                            });
                        }
                        $scope.loading = false;
                    },
                    function (error) {
                        $scope.loading = false;
                        console.log(error);
                        if(error.status==401)
                            $scope.checkSession();
                        else
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
                      .textContent('Resource to be deleted: ' + $scope.selectedItem.name)
                      .ariaLabel('delete')
                      .targetEvent(ev)
                      .ok('Yes')
                      .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    $scope.loading = true;
                    ResourceFactory.delete({'name': $scope.selectedItem.name}).$promise.then(
                        function() {
                            $scope.loading = false;
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




