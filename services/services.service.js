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
  //session info
  //var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
  .factory('SessionInfoFactory', ['$resource', 'settings', function ($resource, settings) {
      return $resource(settings.URLs.apiBase + settings.URLs.sessionInfo, {}, {
          get: { method: 'GET', isArray: false }
      })
  }])
  //var endSessionResource = $resource(settings.URLs.apiBase + settings.URLs.logout);
  .factory('EndSessionFactory', ['$resource', 'settings', function ($resource, settings) {
      return $resource(settings.URLs.apiBase + settings.URLs.logout, {}, {
          get: { method: 'GET', isArray: false }
      })
  }])
  //var accessTokenResource = $resource(settings.URLs.apiBase + settings.URLs.accessToken);
  .factory('AccessTokenFactory', ['$resource', 'settings', function ($resource, settings) {
      return $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
          get: { method: 'GET', isArray: false }
      })
  }])

  .factory('UserPreferenceFactory', ['$resource', 'settings', function ($resource, settings) {
      return $resource(settings.URLs.apiBase + 'preference', {}, {
          get: { method: 'GET', isArray: false},
          update: { method: 'PUT', isArray: false}
      })
  }])
  
;