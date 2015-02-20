'use strict';

/**
 * @ngdoc function
 * @name yeomanApproachApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yeomanApproachApp
 */
(function(ng) {
  ng.module('assetBrowser')
    .factory('assetAPI', AssetAPIProvider);

  function AssetAPIProvider($http, $q) {

    // TODO: use API traversal instead of making assumptions on URL structure
    var apiBaseUrl = 'http://localhost:9000/api/';

    // TODO: chain calls to match path incl. path lookup
    // instead of relying on a predictable URL structure
    // TODO: consider entity caching to reduce number of
    // roundtrips - maybe browser caching is good enough?

    return {
      remoteCall: remoteCall,
      getChildAssets: getChildAssets,
      filterLinksByRel: filterLinksByRel
    };

    function remoteCall(path) {
      // TODO: use API traversal instead of making assumptions on URL structure
      return $http.get(apiBaseUrl + path + '.json');
    }

    function getChildAssets(path) {
      var deferred = $q.defer();
      remoteCall(path)
        .success(function(data) {
          dataToAssets(data).then(function(assets) {
            deferred.resolve(assets);
          });
        });
      return deferred.promise;
    }

    function dataToAssets(data) {
      var entities = data.entities;
      var assets = [];
      var promises = [];
      var parentPath = hashLink(data.links[1].href);
      for (var i = 0; i < entities.length; i++) {
        var href = entities[i].links[0].href;
        assets.push({
          name: entities[i].properties.name,
          isFolder: entities[i].class[0] === 'assets/folder',
          path: hashLink(href),
          parentPath: parentPath,
          url: href,
          thumbnailUrl: null
        });
        promises.push(resolveThumbnail(assets[i]));
      }

      return $q.all(promises).then(function() {
        return assets;
      });
    }

    function resolveThumbnail(asset) {
      return $http.get(asset.url)
        .success(function(data) {
          if (data.links.length > 2) {
            asset.thumbnailUrl = data.links[2].href;
          } else {
            asset.thumbnailUrl = null;
          }
        });
    }

    function hashLink(url) {
      // TODO: use API traversal instead of making assumptions on URL structure
      var idx = url.indexOf('/api/') + '/api/'.length;
      return '#/browser/' + url.substring(idx).replace('.json', '');
    }

    function filterLinksByRel(data, rel) {
      var assetsLink = data.links.find(function(el) { return el.rel.contains(rel); });
      return assetsLink.href;
    }
  }
})(angular);
