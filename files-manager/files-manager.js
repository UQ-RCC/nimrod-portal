'use strict';

angular.module('nimrod-portal.files-manager', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/files-manager', {
            templateUrl: 'files-manager/files-manager.html',
            controller: 'FilesManagerCtrl'
        });
    }])

    .controller('FilesManagerCtrl', ['$scope', '$interval', 
        'FilesFactory', 'UserPreferenceFactory', '$mdDialog', '$uibModal', 
        function ($scope, $interval, 
            FilesFactory, UserPreferenceFactory, $mdDialog, $uibModal) {
            
            //refresh experiment
            var filesListRefreshTimer, lastPaths;
            $scope.filesmanagerOptions = {
                'currentpath': "/QRISdata",
                'selectAll': false,
                'selectedItems': [],
                'bookmarkEdit': false,
                'shortcuts': [],
                'loading': false
            };
            $scope.locations = [];
            var userPref = {};
            // call checkSession for the first ime
            $scope.checkSession(function(){
                document.getElementById("home-btn").style.display="none";
                document.getElementById("support-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("expmanager").style.display="block";
                document.getElementById("expmanager").className="menu__link";
                document.getElementById("resmanager").style.display="block";
                document.getElementById("resmanager").className="menu__link";
                document.getElementById("filesmanagermgr").style.display="block";
                document.getElementById("filesmanagermgr").className="menu__link active";
                //get the jobs for the first time
                $scope.init();
                //get accessible folders
                FilesFactory.accessibleLocations.query().$promise.then(
                     function(returnData){
                        var accessibleLocations = returnData.commandResult;
                        accessibleLocations.forEach(function(location){
                            $scope.locations.push(location.path);
                        });
                        
                    }
                )
                //listFolder($scope.filesmanagerOptions.currentpath);
                filesListRefreshTimer=$interval(function(){ls($scope.filesmanagerOptions.currentpath);},60000);
            });
            
            
            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                if (filesListRefreshTimer) {
                    $interval.cancel(filesListRefreshTimer);
                }
            });


            /**
              * list dir
              */
            var ls = function(newPath, oldPath){
                if(newPath == null)
                    return;
                if(!newPath.endsWith("/"))
                    newPath = newPath + "/";
                $scope.filesmanagerOptions.loading = true;
                FilesFactory.listFolder.query({
                    'folderpath': btoa(newPath)
                }).$promise.then(
                     function(returnData){
                        //console.log("Listing:" + newPath);
                        //console.log(returnData);
                        //for some reason 500 is considered success :-s
                        if(returnData.status == 500){
                            $scope.filesmanagerOptions.loading = false;
                            $scope.filesmanagerOptions.currentpath = oldPath;
                            $scope.broadcastMessage("Error loading:" + newPath + ". You probably do not have permission");
                            return;
                        }
                        var data = returnData.commandResult;
                        if(data == null){
                            $scope.filesmanagerOptions.loading = false;
                            return;
                        }                                            
                        data.forEach(function(element) {
                            element.children = [];
                            element.type = 'f';
                            if(['d', 'l'].includes(element.permission.charAt(0))){
                                element.type = element.permission.charAt(0);
                                element.children.push({name: "", children: []})
                                // symlink
                                if(element.type==='l')
                                    element.name = element.name.split("->")[0].trim();
                            }
                            element.path = newPath + element.name;
                            element.selected = false;
                        });
                        $scope.filesmanagerOptions.filesFolderList = data;
                        $scope.filesmanagerOptions.loading = false;
                        $scope.filesmanagerOptions.currentpath = newPath;
                        lastPaths['files-manager'] = $scope.filesmanagerOptions.currentpath;
                        // save to currentpath
                        userPref['lastPaths'] = lastPaths;
                        UserPreferenceFactory.update({}, angular.toJson(userPref));
                    }
                ),
                function (error) {
                    console.log("Error: failed to load:" + newPath);
                    $scope.filesmanagerOptions.loading = false;
                    $scope.filesmanagerOptions.currentpath = oldPath;
                    if(error.status==401)
                        $scope.checkSession();
                    else
                        $scope.broadcastMessage("Error loading:" + newPath + ". You probably do not have permission");
                }                 
            };

            var createQuickNavs = function(folderPath){
                // splitting path into paths
                var paths = folderPath.split("/");
                var path = "/";
                $scope.filesmanagerOptions.paths = [path];
                paths.forEach(function(item){
                    if(item !=""){
                        path = path + item + "/";
                        $scope.filesmanagerOptions.paths.push(path);
                    }
                });
            }

            /*
            * init the file explorer
            */
            $scope.init = function(){
                // query the list of bookmarks
                UserPreferenceFactory.get().$promise.then(
                    function (data) {
                        userPref = data;
                        // bookmarks
                        if(userPref.hasOwnProperty("bookmarks"))
                            $scope.filesmanagerOptions.shortcuts = userPref["bookmarks"];
                        else
                            $scope.filesmanagerOptions.shortcuts = []; 
                        // last path
                        if(userPref.hasOwnProperty("lastPaths"))
                            lastPaths = userPref['lastPaths'];
                        else    
                            lastPaths = {};
                        if(!lastPaths.hasOwnProperty('files-manager'))
                          lastPaths['files-manager'] = '';
                        // only set to last path if initialPath is not empty
                        if(lastPaths['files-manager'] && 
                            ($scope.filesmanagerOptions.initialPath == null 
                                || $scope.filesmanagerOptions.initialPath.trim()=="") ){
                            $scope.filesmanagerOptions.currentpath = lastPaths['files-manager'];
                        } 
                        // load it
                        //default path
                        createQuickNavs($scope.filesmanagerOptions.currentpath);
                        ls($scope.filesmanagerOptions.currentpath, "");
                    }
                );
            };    

            $scope.refresh = function () {
                ls($scope.filesmanagerOptions.currentpath);
            };

            /**
            * copy current path to clipboard
            */
            $scope.copyCurrentPathToClipboard = function(){
                var copyElement = document.createElement("textarea");
                copyElement.style.position = 'fixed';
                copyElement.style.opacity = '0';
                copyElement.textContent = $scope.filesmanagerOptions.currentpath;
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(copyElement);
                copyElement.select();
                try{
                    var successful = document.execCommand('copy');
                    if (!successful) throw successful;
                    $scope.broadcastMessage("Copied to clipboard");

                }
                catch (err) {
                    $scope.broadcastMessage("Error: cannot copy to clipboard");
                }
                body.removeChild(copyElement);
            }

            /**
            *
            */
            $scope.addShortcut = function (shortcutPath) {
                shortcutPath = shortcutPath.replace(/\/$/, "");
                var shortcutName = shortcutPath.substring(shortcutPath.lastIndexOf('/')+1);
                // add it to the existing paths
                $scope.filesmanagerOptions.shortcuts.push({'label': shortcutName, 'path': shortcutPath});
                // save it to preference
                userPref['bookmarks'] = $scope.filesmanagerOptions.shortcuts;
                UserPreferenceFactory.update({}, angular.toJson(userPref));
            };

            $scope.removeShortcut = function(shortcut){
                for(var i = $scope.filesmanagerOptions.shortcuts.length - 1; i >= 0; i--) {
                    var item = $scope.filesmanagerOptions.shortcuts[i];
                    if(item.label == shortcut.label && item.path == shortcut.path) {
                       $scope.filesmanagerOptions.shortcuts.splice(i, 1);
                       break;
                    }
                }
                userPref['bookmarks'] = $scope.filesmanagerOptions.shortcuts;
                UserPreferenceFactory.update({}, angular.toJson(userPref));
            }

            $scope.visitShortcut = function(shortcutPath){
                createQuickNavs(shortcutPath);
                ls(shortcutPath, $scope.filesmanagerOptions.currentpath);
            };


            /**
              * dive into afolder
              */
            $scope.navigate = function(item){
                // do not bother navigating into a file
                if(item.permission.startsWith('-'))
                    return;
                var oldPath = $scope.filesmanagerOptions.currentpath;
                var newPath = $scope.filesmanagerOptions.currentpath + item.name;
                createQuickNavs(newPath);
                ls(newPath, oldPath);
            };
            
            $scope.toggleBookmarkEdit = function(){
                console.log("@bookmarkedit" + $scope.filesmanagerOptions.bookmarkEdit);
                $scope.filesmanagerOptions.bookmarkEdit=!$scope.filesmanagerOptions.bookmarkEdit;
            }

            /*
            * when change the path
            */
            $scope.onPathChange = function(newPath){
                ls($scope.filesmanagerOptions.currentpath, "");
            };


            /**
              * only available for files
              */
            $scope.selectAllItems = function(){
                $scope.filesmanagerOptions.selectedItems = [];
                $scope.filesmanagerOptions.filesFolderList.forEach(function(item){
                    if(item.permission.startsWith('-')){
                        item.selected = $scope.filesmanagerOptions.selectAll;              
                    }
                    if(item.selected){
                        $scope.filesmanagerOptions.selectedItems.push(item);
                    }
                });
            };


            $scope.selectItem = function(item){
                if(item.selected){
                    $scope.filesmanagerOptions.selectedItems.push(item);
                }
                else{
                    $scope.filesmanagerOptions.selectedItems.pop(item);
                }
            };

            /*************************************************************/
            $scope.createFileFolder = function(){

            }

            $scope.deleteFileFolder = function(ev){
                var selectedFilesPaths = [];
                $scope.filesmanagerOptions.selectedItems.forEach(function(file) {
                    selectedFilesPaths.push(file.path);
                });
                $mdDialog.show({
                  controller: DialogController,
                  templateUrl: 'files-manager/confirm-delete.tmpl.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  fullscreen: false
                })
                .then(function(answer) {
                    console.log('your choice "' + answer + '"');
                    if(answer == 'yes'){
                        $scope.filesmanagerOptions.loading = true;
                        doDeleteFileFolder(selectedFilesPaths);
                        $scope.refresh();
                        $scope.filesmanagerOptions.loading = false;
                    }
                }, function() {
                    console.log('You cancelled the dialog.');
                });
            }

            ///// for the dialog
            var currentScope = $scope;
            function DialogController($scope, $mdDialog) {
                $scope.selectedItems = currentScope.filesmanagerOptions.selectedItems;
                $scope.hide = function() {
                  $mdDialog.hide();
                };

                $scope.cancel = function() {
                  $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
                };
            }

            $scope.copyFolder = function(ev, deleteSource){
                // get the selected files
                var selectedFilesPaths = [];
                var numberOfFolders = 0;
                $scope.filesmanagerOptions.selectedItems.forEach(function(file) {
                    selectedFilesPaths.push(file.path);
                    if(file.permission.startsWith('d')){
                        numberOfFolders = numberOfFolders + 1;
                    }
                });
                if(numberOfFolders != 1 && numberOfFolders != $scope.filesmanagerOptions.selectedItems.length){
                    $scope.showAlertDialog("The portal only supports copy one folder at a time");
                    return;
                }
                var sourceDir = selectedFilesPaths[0];
                $scope.filesmanagerOptions.loading = true;
                // check whether there is any copying process going on
                FilesFactory.listCopyingProcess.list().$promise.then(
                    function(returnData) {
                        var copyingProcess = returnData.commandResult;
                        if(copyingProcess.length == 0){
                            $scope.startCopyingFolder(ev, sourceDir, deleteSource);
                        }
                        else {
                            $scope.showAlertDialog("It seems another copying process is going on. Wait for it to finish.");
                            $scope.filesmanagerOptions.loading = false;
                            return;
                        }
                    },
                    function (error) {
                        $scope.filesmanagerOptions.loading = false;
                        $scope.showAlertDialog("Problem accessing file list");
                    }
                );

                

            }


            $scope.startCopyingFolder = function(ev, sourceDir, deleteSource){
                // TODO find a smater way to deal with this
                var parallel = 8;
                // now open the files explorer to get the destination folder
                var $ctrl = this;
                $ctrl.modalContents = {};
                $ctrl.modalContents.mode = 'selectoutput';
                $ctrl.modalContents.title = "Select Destination Folder";
                $ctrl.modalContents.initialPath = $scope.filesmanagerOptions.currentpath;
                var modalInstance = $uibModal.open({
                    animation: false,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'filesexplorer/filesexplorer.tmpl.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'lg',
                    appendTo: null,
                    scope: $scope,
                    preserveScope: true,
                    resolve: {
                      modalContents: function () {
                        return $ctrl.modalContents;
                      }
                    }
                });
                /**** process the answer ****/
                modalInstance.result.then(function (selected) {
                    $ctrl.selected = selected;
                    if($ctrl.selected==null || $ctrl.selected==""){
                        $scope.showAlertDialog("You have not selected anything");
                        return;
                    }
                    doCopyFolder(ev, sourceDir, $ctrl.selected, deleteSource, parallel);
                })
            }

            // delete list of files/folder
            var doDeleteFileFolder = function(fileList){
                var fileListStr = fileList.join(";");
                $scope.filesmanagerOptions.loading = true;
                FilesFactory.deleteFiles.delete({
                    'fileslist': btoa(fileListStr)
                }).$promise.then(
                    function(returnData) {
                        $scope.refresh();
                    },
                    function (error) {
                        $scope.filesmanagerOptions.loading = false;
                        $scope.showAlertDialog("Problem deleting files:" + fileList);
                    }
                );
            }
            // move files/folders
            var doCopyFolder = function(ev, sourceDir, destDir, deleteSource, parallel){
                $scope.filesmanagerOptions.loading = true; 
                if(deleteSource){
                    FilesFactory.moveFiles.move({
                        'sources': btoa(sourceDir),
                        'dest': btoa(destDir),
                        'parallel': parallel,
                        'usermail': $scope.session.email
                    }).$promise.then(
                        function(returnData) {
                            $scope.refresh();
                        },
                        function (error) {
                            $scope.filesmanagerOptions.loading = false;
                            $scope.showAlertDialog("Problem moving files:" + fileList);
                        }
                    );  
                } else {
                    FilesFactory.copyFiles.copy({
                        'sources': btoa(sourceDir),
                        'dest': btoa(destDir),
                        'parallel': parallel,
                        'usermail': $scope.session.email
                    }).$promise.then(
                        function(returnData) {
                            $scope.broadcastMessage("Start copying to :"+destDir);
                            $scope.filesmanagerOptions.loading = false;
                        },
                        function (error) {
                            $scope.filesmanagerOptions.loading = false;
                            $scope.showAlertDialog("Problem copying files:" + fileList);
                        }
                    );
                }
            }

        }]);




