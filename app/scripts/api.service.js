'use strict';

module.exports = AssetAPIProvider;

/* @ngInject */
function AssetAPIProvider($http, $state) {

  var entryUrl = 'http://localhost:9000/api.json';
  var supportedActions = ['add-asset', 'add-folder', 'delete'];

  var actions = {
    'delete': {
      message: 'Do you really want to delete this asset/folder?'
    }
  };

  var siren = require('./siren/siren')({
    url: entryUrl,
    http: {
      get: $http.get
    }
  });

  return {
    getBreadcrumb: getBreadcrumb,
    getChildAssets: getChildAssets,
    getActions: getActions
  };

  function getActions(path) {
    return siren.entity(path)
      .then(function getActions(entity) {
        return supportedActions.map(function getAction(name) {
          var action = entity.action(name);
          if (!!actions[name] && !!actions[name].message) {
            action.message = actions[name].message;
          }
          return action;
        });
      })
      .catch(failLoadEntity);
  }

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
      })
      .catch(failLoadEntity);
  }

  function getChildAssets(path) {
    return siren.entity(path)
      .then(function successGetChildAssets(entity) {
        return entity.children();
      })
      .then(function transformChildren(children) {
        return children.map(entity2Asset);
      })
      .catch(failLoadEntity);
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
      contentUrl: linkContent && linkContent.href(),
      actions: entity.actions()
    };
  }

  function failLoadEntity(err) {
    if (err.parentPath) {
      $state.go('browser', { path : err.parentPath.substring(1) });
      return {};
    }
    return {
      type: 'danger',
      msg: 'Failed to load data. The API at ' + entryUrl + ' returned "' + err.status + ' ' + err.statusText + '".'
    };
  }
}
