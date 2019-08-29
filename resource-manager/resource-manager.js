'use strict';

angular.module('nimrod-portal.resource-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/resource-manager', {
            templateUrl: 'resource-manager/resource-manager.html',
            controller: 'ResourceManagerCtrl'
        });
    }])


    .controller('ResourceManagerCtrl', ['$scope', '$location', 'GetResourcesFactory',
        function ($scope, $location, GetResourcesFactory) {
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
                  { field: 'name', displayName: 'Name', headerTooltip: 'Resource Name' },
                  { field: 'type', displayName: 'Type', headerTooltip: 'Resource Type'}
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
                GetResourcesFactory.query().$promise.then(
                    function(returnData) {
                        console.log(returnData);
                        if(returnData.commandResult.length > 0){
                            $scope.resGridOptions.data = [];
                            returnData.commandResult.forEach(function (item){
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

           
        

}]);




