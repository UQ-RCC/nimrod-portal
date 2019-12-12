'use strict';

angular.module('nimrod-portal.services').factory('TokenHandler', function () {
  var tokenHandler = {};
  var token = "none";
  tokenHandler.set = function (newToken) {
    token = newToken;
  };
  tokenHandler.get = function () {
    return token;
  };

  tokenHandler.getHeader = function () {
    return 'Bearer ' + token;
  };

  // Wrap a configuration with an Authorization header
  tokenHandler.wrapConfig = function (config) {
    config.headers = config.headers || {}
    angular.extend(config.headers, config.headers, { Authorization: tokenHandler.getHeader });
    return config;
  };

  return tokenHandler;
}).factory('MiscFactory', function () {
  var methods = {};

  methods.availableMachines = function () {
    return [
      { 'label': 'Awoonga', 'value': 'awonmgr2' },
      { 'label': 'Flashlite', 'value': 'flashmgr2' },
      { 'label': 'Tinaroo', 'value': 'tinmgr2.ib0' }
    ];
  };

  methods.getMachineName = function (managementNode) {
    // this is not needed
    var managementNodeWithoutAt = managementNode.replace(/@/g, "");
    var machines = methods.availableMachines();
    for (var i = 0; i < machines.length; i++) {
      if (machines[i].value === managementNodeWithoutAt)
        return machines[i].label;
    }
  };
  return methods;
}).factory('SessionFactory', ['$resource', 'settings', function ($resource, settings) {
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

}]).factory('UserPreferenceFactory', ['$resource', 'settings', function ($resource, settings) {
  return $resource(settings.URLs.apiBase + 'preference/nimrod', {}, {
    get: { method: 'GET', isArray: false },
    update: { method: 'PUT', isArray: false }
  })
}]).factory('FilesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
  var resources = {};

  // list folder
  resources.listFolder = $resource(settings.URLs.serverApiBase + settings.URLs.listFolderBase64, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  // delete files
  resources.deleteFiles = $resource(settings.URLs.serverApiBase + settings.URLs.deleteBase64, {}, {
    delete: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //copy files
  resources.copyFiles = $resource(settings.URLs.serverApiBase + settings.URLs.copyBase64, {}, {
    copy: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  // move files
  resources.moveFiles = $resource(settings.URLs.serverApiBase + settings.URLs.moveBase64, {}, {
    move: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  // list copying process
  resources.listCopyingProcess = $resource(settings.URLs.serverApiBase + settings.URLs.listCopyingProcess, {}, {
    list: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  // accessible locations
  resources.accessibleLocations = $resource(settings.URLs.serverApiBase + settings.URLs.accessibleLocations, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  return resources;
}]).factory('GetProjectsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
  var resource = $resource(settings.URLs.serverApiBase + settings.URLs.getProjects, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });
  return resource;
}]).factory('ExperimentsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
  var resources = {};

  // list experiments
  resources.getExperiments = $resource(settings.URLs.serverApiBase + settings.URLs.getExperiments, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //delete experiment
  resources.deleteExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.deleteExperiment, {}, {
    delete: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //add experiment
  resources.addExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.addExperiment, {}, {
    add: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //start experiment
  resources.startExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.startExperiment, {}, {
    start: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //validate plan file
  resources.validatePlanFile = $resource(settings.URLs.serverApiBase + settings.URLs.compilePlanfile, {}, {
    verify: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //validate plan file
  resources.planfile = $resource(settings.URLs.serverApiBase + settings.URLs.readPlanFile, {}, {
    read: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //get assignments
  resources.assignments = $resource(settings.URLs.serverApiBase + settings.URLs.getAssignments, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //get assignments
  resources.assignResource = $resource(settings.URLs.serverApiBase + settings.URLs.assignResource, {}, {
    assign: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //get assignments
  resources.unassignResource = $resource(settings.URLs.serverApiBase + settings.URLs.unassignResource, {}, {
    unassign: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //check process
  resources.checkProcess = $resource(settings.URLs.serverApiBase + settings.URLs.checkProcess, {}, {
    check: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  return resources;
}]).factory('ResourcesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
  var resources = {};

  // get all resources
  resources.getResources = $resource(settings.URLs.serverApiBase + settings.URLs.getResources, {}, {
    query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //add resource
  resources.addResource = $resource(settings.URLs.serverApiBase + settings.URLs.addResource, {}, {
    add: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });

  //delete resource
  resources.deleteResource = $resource(settings.URLs.serverApiBase + settings.URLs.deleteResource, {}, {
    delete: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
  });
  return resources;
}]);
