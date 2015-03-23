'use strict';

module.exports = AssetAPIProvider;

/* @ngInject */
function AssetAPIProvider($http, $q) {

  var entryUrl = 'http://localhost:9000/api.json';
  var siren = require('./siren/siren')({
    url: entryUrl,
    http: {
      get: $http.get
    }
  });

  return {
    getBreadcrumb: getBreadcrumb,
    getChildAssets: getChildAssets
  };

  function getBreadcrumb(path) {
    return siren.entity(path)
      .then(function createBreadcrumb(entity) {
        var breadcrumb = [];
        var current = entity;
        do {
          breadcrumb.unshift({
            label: current.property('name'),
            href: '#browser' + current.path()
          });
          current = current.parent();
        } while (current.parent());
        return breadcrumb;
      });
  }

  function getChildAssets(path) {
    return siren
      .entity(path)
      .then(function successGetChildAssets(entity) {
        return entity.children();
      })
      .then(function transformChildren(children) {
        return children.map(entity2Asset);
      });
  }

  function entity2Asset (entity) {
    var linkSelf = entity.link('self');
    var linkThumb = entity.link('thumbnail');
    var linkContent = entity.link('content');
    return {
      name: entity.property('name'),
      path: entity.path(),
      href: '#browser' + entity.path(),
      isFolder: entity.hasClass('assets/folder'),
      parentPath: entity.parent() && entity.parent().path(),
      url: linkSelf && linkSelf.href(),
      thumbnailUrl: linkThumb && linkThumb.href(),
      contentUrl: linkContent && linkContent.href()
    };
  }
}
