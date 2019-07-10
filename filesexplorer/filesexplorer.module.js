'use strict';

angular
	.module('nimrod-portal.filesexplorer', ['nimrod-portal.services'])
	.controller('ModalInstanceCtrl', ['$scope', '$rootScope', 
    	'$uibModalInstance', 'modalContents', 'ListFolderFactory', 'UserPreferenceFactory',
    function ($scope, $rootScope, 
      	$uibModalInstance, modalContents, ListFolderFactory, UserPreferenceFactory) {
      var $ctrl = this; 
      $ctrl.modalContents = modalContents;
      $ctrl.modalContents.loading = false;
      $ctrl.modalContents.filesFolderList = [];
      if($ctrl.modalContents.initialPath == null || $ctrl.modalContents.initialPath.trim()=="")
        $ctrl.modalContents.currentpath = "/afm01"; //"/afm01/Q0703"; 
      else
        $ctrl.modalContents.currentpath = $ctrl.modalContents.initialPath;    
      $ctrl.modalContents.selectAll = false;
      $ctrl.modalContents.extensions = ["tif", "nd2", "ims", "sld"];
      $ctrl.modalContents.extension = "";
      $ctrl.modalContents.newItem = "";
      if($ctrl.modalContents.initialNewItem != null && $ctrl.modalContents.initialNewItem.trim()!="")
        $ctrl.modalContents.newItem =  $ctrl.modalContents.initialNewItem;    
      $ctrl.modalContents.selectedItems = [];
      $ctrl.selected = {};
      $ctrl.bookmarkEdit = false;

      /**
      * list dir
      */
      var ls = function(newPath, oldPath){
        if(newPath == null)
            return;
        if(!newPath.endsWith("/"))
            newPath = newPath + "/";
        $ctrl.modalContents.loading = true;
		ListFolderFactory.query({
	        'folderpath': btoa(newPath)
	    }).$promise.then(
	         function(returnData){
	            //for some reason 500 is considered success :-s
	            if(returnData.status == 500){
	                $ctrl.modalContents.loading = false;
	                $ctrl.modalContents.currentpath = oldPath;
	                $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
	                return;
	            }
	            var data = returnData.commandResult;
	            if(data == null){
	                $ctrl.modalContents.loading = false;
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
	            $ctrl.modalContents.filesFolderList = data;
	            $ctrl.modalContents.loading = false;
	            $ctrl.modalContents.currentpath = newPath;
	            // save to currentpath
	            var lastPath = {'lastPath': newPath};
      			UserPreferenceFactory.update({}, JSON.stringify(lastPath));
	        }
	    ),
	    function (error) {
	        console.log("Error: failed to load:" + newPath);
	        $ctrl.modalContents.loading = false;
	        $ctrl.modalContents.currentpath = oldPath;
	        $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
	    }                 
      };

      $ctrl.copyCurrentPathToClipboard = function(){
      	var copyElement = document.createElement("textarea");
		copyElement.style.position = 'fixed';
		copyElement.style.opacity = '0';
		copyElement.textContent = $ctrl.modalContents.currentpath;
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(copyElement);
		copyElement.select();
		try{
			var successful = document.execCommand('copy');
			if (!successful) throw successful;
			$rootScope.$broadcast("notify", "Copied to clipboard");

		}
		catch (err) {
			$rootScope.$broadcast("notify", "Error: cannot copy to clipboard");
		}
		body.removeChild(copyElement);
      }

      var createQuickNavs = function(folderPath){
        // splitting path into paths
        var paths = folderPath.split("/");
        var path = "/";
        $ctrl.modalContents.paths = [path];
        paths.forEach(function(item){
            if(item !=""){
                path = path + item + "/";
                $ctrl.modalContents.paths.push(path);
            }
        });
      }

      /*
      * when change the path
      */
      $ctrl.onPathChange = function(newPath){
        //console.log("path change:" + newPath);
        ls($ctrl.modalContents.currentpath, "");
      };


      /*
      * init the file explorer
      */
      $ctrl.init = function(){
        // now move into shotcuts
        var home = "/clusterdata/";
        if($scope.session != undefined && $scope.session != null){
            home = home + $scope.session.uname;
        }
        // query the list of bookmarks
        UserPreferenceFactory.get().$promise.then(
            function (data) {
            	// bookmarks
            	if(data.hasOwnProperty("bookmarks"))
        			$ctrl.modalContents.shortcuts = JSON.parse(data["bookmarks"]);
        		else
        		    $ctrl.modalContents.shortcuts = []; 
        		// home   
        		var hasHome = false;
        		$ctrl.modalContents.shortcuts.forEach(function(item){
		            if(item.label == 'home'){
		                hasHome = true;
		            }
		        });
		        if(!hasHome){
		        	$ctrl.modalContents.shortcuts.unshift({'label': 'home', 'path':home})
		        }
		        // last path
		        var lastPath = "";
		        if(data.hasOwnProperty("lastPath"))
        			lastPath = data["lastPath"];
        		// only set to last path if initialPath is not empty
        		if(lastPath && ($ctrl.modalContents.initialPath == null || $ctrl.modalContents.initialPath.trim()=="") ){
        			$ctrl.modalContents.currentpath = lastPath;
        		} 
        		// load it
        		//default path
		        createQuickNavs($ctrl.modalContents.currentpath);
		        if(['loadtemplate', 'newtemplate'].includes($ctrl.modalContents.mode)){
		            createQuickNavs(home + "/.microvolution");
		            ls(home + "/.microvolution", "");
		        }
		        else
		            ls($ctrl.modalContents.currentpath, "");
            }
        );
      };    

      $ctrl.refresh = function () {
        ls($ctrl.modalContents.currentpath);
      };

      $ctrl.addShortcut = function (shortcutPath) {
      	shortcutPath = shortcutPath.replace(/\/$/, "");
      	var shortcutName = shortcutPath.substring(shortcutPath.lastIndexOf('/')+1);
      	// add it to the existing paths
      	$ctrl.modalContents.shortcuts.push({'label': shortcutName, 'path': shortcutPath});
      	// save it to preference
      	var bookmarks = {'bookmarks':  angular.toJson( $ctrl.modalContents.shortcuts )};
      	UserPreferenceFactory.update({}, JSON.stringify(bookmarks));
      };

      $ctrl.removeShortcut = function(shortcut){
      	for(var i = $ctrl.modalContents.shortcuts.length - 1; i >= 0; i--) {
      		var item = $ctrl.modalContents.shortcuts[i];
		    if(item.label == shortcut.label && item.path == shortcut.path) {
		       $ctrl.modalContents.shortcuts.splice(i, 1);
		       break;
		    }
		}
      	var bookmarks = {'bookmarks':  angular.toJson( $ctrl.modalContents.shortcuts )};
      	UserPreferenceFactory.update({}, JSON.stringify(bookmarks));
      }

      $ctrl.isLoading = function () {
        return $ctrl.modalContents.loading;
      };

      $ctrl.shortcut = function(shortcutPath){
        createQuickNavs(shortcutPath);
        ls(shortcutPath, $ctrl.modalContents.currentpath);
      };

      /**
      * only available for files
      */
      $ctrl.selectAll = function(){
        $ctrl.modalContents.selectedItems = [];
        $ctrl.modalContents.filesFolderList.forEach(function(item){
        	if(item.permission.startsWith('-')){
            	item.selected = $ctrl.modalContents.selectAll;        		
        	}
            if(item.selected){
                $ctrl.modalContents.selectedItems.push(item);
            }
        });
      };


      $ctrl.selectItem = function(item){
        if(item.selected){
            $ctrl.modalContents.selectedItems.push(item);
        }
        else{
            $ctrl.modalContents.selectedItems.pop(item);
        }
      };


      /**
      * check whether itemSelect should be enabled
      */
      $ctrl.itemSelectDisabled = function(item){
        if(['selectoutput', 'selectfolders'].includes($ctrl.modalContents.mode))
            return true;
        else if(['selectfiles', 'loadpsf'].includes($ctrl.modalContents.mode)){
            return (item.permission.startsWith('d') || item.permission.startsWith('l'));
        }
        else
            return false;
      };

      /**
      * check whether to hide the table item
      */
      $ctrl.itemHidden = function(item){
        return ($ctrl.modalContents.mode=='selectfolders' 
                && item.permission.startsWith('-') 
                && !item.name.endsWith($ctrl.modalContents.extension)) ||
                (['newtemplate', 'loadtemplate'].includes($ctrl.modalContents.mode) 
                    && !item.name.endsWith("template")
                    );
      };

      
      
      /**
      * dive into afolder
      */
      $ctrl.navigate = function(item){
        // do not bother navigating into a file
        if(item.permission.startsWith('-'))
            return;
        var oldPath = $ctrl.modalContents.currentpath;
        var newPath = $ctrl.modalContents.currentpath + item.name;
        createQuickNavs(newPath);
        ls(newPath, oldPath);
      };

      $ctrl.ok = function () {
        if($ctrl.modalContents.mode === 'selectoutput'){
            $ctrl.selected = $ctrl.modalContents.currentpath + $ctrl.modalContents.newItem;
        }
        else if($ctrl.modalContents.mode === 'selectfiles'){
            $ctrl.selected = $ctrl.modalContents.selectedItems;
        }
        else if($ctrl.modalContents.mode === 'selectfolders'){
            $ctrl.selected = $ctrl.modalContents.currentpath + "*." +$ctrl.modalContents.extension; //folder + exensions
        }
        else if($ctrl.modalContents.mode === 'newtemplate'){
            $ctrl.selected = $ctrl.modalContents.newItem; //new template
        }
        else if($ctrl.modalContents.mode === 'loadtemplate'){
            if($ctrl.modalContents.selectedItems.length == 0){
                $ctrl.selected = null;
            }
            else
                $ctrl.selected = $ctrl.modalContents.selectedItems[0].name;//template path
        }
        else if($ctrl.modalContents.mode === 'loadpsf'){
            if($ctrl.modalContents.selectedItems.length == 0){
                $ctrl.selected = null;
            }
            else
                $ctrl.selected = $ctrl.modalContents.selectedItems[0].path;//template path
        }
        $uibModalInstance.close($ctrl.selected);
      };

      $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }])

