'use strict';

module.exports = AssetAPIProvider;

/* @ngInject */
function AssetAPIProvider($http, $q) {

  var entryUrl = 'http://localhost:9000/api.json';
  var siren = require('./siren/siren.js');

  return {
    remoteCall: remoteCall,
    getChildAssets: getChildAssets,
    filterLinksByRel: filterLinksByRel
  };

  function remoteCall(url) {
    return $http.get(url);
  }

  function resolveUrl(startUrl, pathSegments) {
    var deferred = $q.defer();
    console.log('resolveUrl', startUrl, pathSegments);
    remoteCall(startUrl).success(function(data) {
      if (pathSegments.length > 0) {
        var segment = pathSegments.shift();
        var link = (siren.link(data, segment) || siren.link(siren.entity(data, segment), 'self'));
        resolveUrl(link.href, pathSegments)
          .then(function(data) {
            deferred.resolve(data);
          })
        ;
      } else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }

  function getChildAssets(path) {

    var deferred = $q.defer();
    resolveUrl(entryUrl, path.split('/')).then(function(data) {
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
    var parentPath = hashLink(siren.link(data, 'parent').href);
    for (var i = 0; i < entities.length; i++) {
      var href = siren.link(entities[i], 'self').href;
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
    return remoteCall(asset.url)
      .success(function(data) {
        var thumbnail = siren.link(data, 'thumbnail');
        if (thumbnail) {
          asset.thumbnailUrl = thumbnail.href;
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
