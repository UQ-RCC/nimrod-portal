'use strict';

angular.
  module('nimrod-portal.services')
  .factory('TokenHandler', function() {
      var tokenHandler = {};
      var token = "none";
      tokenHandler.set = function( newToken ) {
          token = newToken;
      };
      tokenHandler.get = function() {
          return token;
      };
      // wrap given actions of a resource to send auth token with every
      // request
      tokenHandler.wrapActions = function( resource, actions ) {
          // copy original resource
          var wrappedResource = resource;
          for (var i=0; i < actions.length; i++) {
          tokenWrapper( wrappedResource, actions[i] );
          };
          // return modified copy of resource
          return wrappedResource;
      };

      // wraps resource action to send request with auth token
      var tokenWrapper = function( resource, action ) {
          // copy original action
          resource['_' + action]  = resource[action];
          // create new action wrapping the original and sending token
          resource[action] = function( data, success, error){
          return resource['_' + action](
              angular.extend({}, data || {}, {access_token: tokenHandler.get()}),
              success,
              error
          );
          };
      };

      return tokenHandler;
  })
  .factory('MiscFactory', function() {
    var methods = {};
    
    methods.availableMachines = function() {
      return [
          {'label': 'Awoonga', 'value': 'awonmgr2'},
          {'label': 'Flashlite', 'value': 'flashmgr2'},
          {'label': 'Tinaroo', 'value': 'tinmgr2.ib0'}
      ];
    };

    methods.getMachineName = function(managementNode){
      var managementNodeWithoutAt = managementNode.replace(/@/g, "");
      var machines = methods.availableMachines();
      console.log(managementNodeWithoutAt);
      for(var i =0; i< machines.length; i++){
        if (machines[i].value === managementNodeWithoutAt)
          return machines[i].label;
      }
    };
    return methods;
  })
  //session factory
  .factory('SessionFactory', ['$resource', 'settings', function ($resource, settings) {
      var resources = {};
      resources.sessionInfo = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo, {}, {
          get: { method: 'GET', isArray: false }
      });
      resources.endSession = $resource(settings.URLs.apiBase + settings.URLs.logout, {}, {
          get: { method: 'GET', isArray: false }
      });
      resources.accessToken = $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
          get: { method: 'GET', isArray: false }
      });
      return resources;

  }])
  .factory('UserPreferenceFactory', ['$resource', 'settings', function ($resource, settings) {
      return $resource(settings.URLs.apiBase + 'preference/nimrod', {}, {
          get: { method: 'GET', isArray: false},
          update: { method: 'PUT', isArray: false}
      })
  }])
  .factory('FilesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resources = {};

    // list folder
    resources.listFolder = $resource(settings.URLs.serverApiBase + settings.URLs.listFolderBase64, {}, {
        query: { method: 'GET', isArray: false },
    });
    resources.listFolder = tokenHandler.wrapActions( resources.listFolder, ["query"]);
    
    // delete files
    resources.deleteFiles = $resource(settings.URLs.serverApiBase + settings.URLs.deleteBase64, {}, {
        delete: { method: 'GET', isArray: false },
    });
    resources.deleteFiles = tokenHandler.wrapActions( resources.deleteFiles, ["delete"]);
    
    //copy files
    resources.copyFiles = $resource(settings.URLs.serverApiBase + settings.URLs.copyBase64, {}, {
        copy: { method: 'GET', isArray: false },
    });
    resources.copyFiles = tokenHandler.wrapActions( resources.copyFiles, ["copy"]);
    
    // move files
    resources.moveFiles = $resource(settings.URLs.serverApiBase + settings.URLs.moveBase64, {}, {
        move: { method: 'GET', isArray: false },
    });
    resources.moveFiles = tokenHandler.wrapActions( resources.moveFiles, ["move"]);
    
    // list copying process
    resources.listCopyingProcess = $resource(settings.URLs.serverApiBase + settings.URLs.listCopyingProcess, {}, {
        list: { method: 'GET', isArray: false },
    });
    resources.listCopyingProcess = tokenHandler.wrapActions( resources.listCopyingProcess, ["list"]);
    return resources;
  }])


  .factory('GetProjectsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
        var resource = $resource(settings.URLs.serverApiBase + settings.URLs.getProjects, {}, {
            query: { method: 'GET', isArray: false },
        });
        resource = tokenHandler.wrapActions( resource, ["query"]);
        return resource;
    }])

  .factory('ExperimentsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
      var resources = {};

      // list experiments
      resources.getExperiments = $resource(settings.URLs.serverApiBase + settings.URLs.getExperiments, {}, {
          query: { method: 'GET', isArray: false },
      });
      resources.getExperiments = tokenHandler.wrapActions( resources.getExperiments, ["query"]);
      
      //delete experiment
      resources.deleteExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.deleteExperiment, {}, {
          delete: { method: 'GET', isArray: false },
      });
      resources.deleteExperiment = tokenHandler.wrapActions( resources.deleteExperiment, ["delete"]);

      //add experiment
      resources.addExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.addExperiment, {}, {
          add: { method: 'GET', isArray: false },
      });
      resources.addExperiment = tokenHandler.wrapActions( resources.addExperiment, ["add"]);

      //start experiment
      resources.startExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.startExperiment, {}, {
          start: { method: 'GET', isArray: false },
      });
      resources.startExperiment = tokenHandler.wrapActions( resources.startExperiment, ["start"]);

      //validate plan file
      resources.validatePlanFile = $resource(settings.URLs.serverApiBase + settings.URLs.compilePlanfile, {}, {
          verify: { method: 'GET', isArray: false },
      });
      resources.validatePlanFile = tokenHandler.wrapActions( resources.validatePlanFile, ["verify"]);

      //validate plan file
      resources.planfile = $resource(settings.URLs.serverApiBase + settings.URLs.readPlanFile, {}, {
          read: { method: 'GET', isArray: false },
      });
      resources.planfile = tokenHandler.wrapActions( resources.planfile, ["read"]);
      
      //get assignments
      resources.assignments = $resource(settings.URLs.serverApiBase + settings.URLs.getAssignments, {}, {
          query: { method: 'GET', isArray: false },
      });
      resources.assignments = tokenHandler.wrapActions( resources.assignments, ["query"]);

      //get assignments
      resources.assignResource = $resource(settings.URLs.serverApiBase + settings.URLs.assignResource, {}, {
          assign: { method: 'GET', isArray: false },
      });
      resources.assignResource = tokenHandler.wrapActions( resources.assignResource, ["assign"]);

      //get assignments
      resources.unassignResource = $resource(settings.URLs.serverApiBase + settings.URLs.unassignResource, {}, {
          unassign: { method: 'GET', isArray: false },
      });
      resources.unassignResource = tokenHandler.wrapActions( resources.unassignResource, ["unassign"]);

      return resources;
    }])

  .factory('ResourcesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
      var resources = {};

      // get all resources
      resources.getResources = $resource(settings.URLs.serverApiBase + settings.URLs.getResources, {}, {
          query: { method: 'GET', isArray: false },
      });
      resources.getResources = tokenHandler.wrapActions( resources.getResources, ["query"]);
      
      //add resource
      resources.addResource = $resource(settings.URLs.serverApiBase + settings.URLs.addResource, {}, {
          add: { method: 'GET', isArray: false },
      });
      resources.addResource = tokenHandler.wrapActions( resources.addResource, ["add"]);
      
      //delete resource
      resources.deleteResource =  $resource(settings.URLs.serverApiBase + settings.URLs.deleteResource, {}, {
          delete: { method: 'GET', isArray: false },
      });
      resources.deleteResource = tokenHandler.wrapActions( resources.deleteResource, ["delete"]);
      return resources;
    }])
;