'use strict';

angular.module('nimrod-portal.services')
  .factory('TokenHandler', function () {
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
  })
  .factory('MiscFactory', function () {
    var methods = {};

    methods.availableMachines = function () {
      return [
        // { 'label': 'Awoonga', 'value': 'awonmgr2' },
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
  })
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
  .factory('UserFactory', ['$resource', 'settings', 'TokenHandler', function($resource, settings, tokenHandler) {
    var resources = {};

    resources.provision = $resource(settings.URLs.serverApiBase + 'provision/:username', {'username':'@username'}, {
     put: tokenHandler.wrapConfig({ method: 'PUT', isArray: false})
    });

    return resources;
  }])
  .factory('UserPreferenceFactory', ['$resource', 'settings', function ($resource, settings) {
    return $resource(settings.URLs.apiBase + 'preference/nimrod', {}, {
      get: { method: 'GET', isArray: false },
      update: { method: 'PUT', isArray: false }
    })
  }])
  .factory('FilesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resources = {};

    // list folder
    resources.listFolder = $resource(settings.URLs.resourceApiBase + settings.URLs.listFolderBase64, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    // delete files
    resources.deleteFiles = $resource(settings.URLs.resourceApiBase + settings.URLs.deleteBase64, {}, {
      delete: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    //copy files
    resources.copyFiles = $resource(settings.URLs.resourceApiBase + settings.URLs.copyBase64, {}, {
      copy: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    // move files
    resources.moveFiles = $resource(settings.URLs.resourceApiBase + settings.URLs.moveBase64, {}, {
      move: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    // list copying process
    resources.listCopyingProcess = $resource(settings.URLs.resourceApiBase + settings.URLs.listCopyingProcess, {}, {
      list: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    // accessible locations
    resources.accessibleLocations = $resource(settings.URLs.resourceApiBase + settings.URLs.accessibleLocations, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    // create resource
    resources.addResource = $resource(settings.URLs.resourceApiBase + settings.URLs.addResource, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });


    return resources;
  }])
  .factory('GetProjectsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.getProjects, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('ExperimentsFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resources = {};

    // list experiments
    resources.getExperiments = $resource(settings.URLs.serverApiBase + settings.URLs.experiments, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: true }),
    });

    //add experiment
    resources.addExperiment = $resource(settings.URLs.serverApiBase + settings.URLs.experiments, {}, {
      add: tokenHandler.wrapConfig({ method: 'POST', isArray: false }),
    });

    //start experiment
    resources.startExperiment = $resource(settings.URLs.resourceApiBase + settings.URLs.startExperiment, {}, {
      start: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    // stop experiment
    resources.stopExperiment = $resource(settings.URLs.resourceApiBase + settings.URLs.stopExperiment, {}, {
      stop: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    //validate plan file
    resources.validatePlanFile = $resource(settings.URLs.serverApiBase + settings.URLs.compilePlanfile, {}, {
      verify: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    //check process
    resources.checkProcess = $resource(settings.URLs.resourceApiBase + settings.URLs.checkProcess, {}, {
      check: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });

    return resources;
  }])
  .factory('ExperimentFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
      return $resource(settings.URLs.serverApiBase + settings.URLs.experiments + '/:name', {}, {
          show: tokenHandler.wrapConfig({ method: 'GET' }),
          delete: tokenHandler.wrapConfig( { method: 'DELETE', params: {name: '@name'} })
      });
  }])
  .factory('AssignmentFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    return $resource(settings.URLs.serverApiBase + settings.URLs.experiments + '/:name' + '/resources', {}, {
        show: tokenHandler.wrapConfig({ method: 'GET', isArray: true }),
        assign: tokenHandler.wrapConfig({ method: 'PUT', params: {name: '@name'} })
    });
  }])
  .factory('ResourcesFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    return $resource(settings.URLs.serverApiBase + settings.URLs.resources , {}, {
      show: tokenHandler.wrapConfig({ method: 'GET', isArray: true }),
      create: tokenHandler.wrapConfig({ method: 'POST'})
    });
  }])
  .factory('SshResourceFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    return $resource(settings.URLs.resourceApiBase + settings.URLs.checkProcess , {}, {
      create: tokenHandler.wrapConfig({ method: 'GET', isArray: false })
    });
  }])
  .factory('ResourceFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    return $resource(settings.URLs.serverApiBase + settings.URLs.resources + '/:name', {}, {
        show: tokenHandler.wrapConfig({ method: 'GET' }),
        delete: tokenHandler.wrapConfig({ method: 'DELETE', params: {name: '@name'} })
    });
}])
  ;
