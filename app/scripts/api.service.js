'use strict';

module.exports = AssetAPIProvider;

/* @ngInject */
function AssetAPIProvider($http, $state) {

  var entryUrl = 'http://localhost:9000/api.json';

  var actionConfigs = {
    'delete': {
      icon: 'glyphicon-trash',
      message: 'Do you really want to delete this asset/folder?'
    },
    'preview': {
      isSynthetic: true,
      name: 'preview',
      title: 'Preview',
      icon: 'glyphicon-eye-open'
    },
    'select': {
      isSynthetic: true,
      disabled: !(window.opener && window.opener.insertImage),
      name: 'select',
      title: 'Select',
      icon: 'glyphicon-check'
    }
  };

  var supportedActions = {
    'assets/asset': ['preview', 'select', 'delete'],
    'assets/folder': ['add-asset', 'add-folder', 'delete']
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
    searchAssets: searchAssets,
    getActions: getActions
  };

  function getActions(path) {
    return siren.entity(path)
      .then(prepareActions)
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
      .then(transformEntities)
      .catch(failLoadEntity);
  }

  function searchAssets(query) {
    return siren.entity('assets')
      .then(function search(entity) {
        return entity.search(query);
      })
      .then(transformEntities)
      .catch(failLoadEntity);
  }

  function transformEntities(children) {
    return children.map(entity2Asset);
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
      actions: prepareActions(entity)
    };
  }

  function prepareActions(entity) {
    var preparedActions = createSyntheticActions(entity);

    var supported = [];
    for (var cls in supportedActions) {
      if (supportedActions.hasOwnProperty(cls) && entity.hasClass(cls)) {
        supported = supportedActions[cls];
      }
    }

    supported.forEach(function(name) {
      var action = entity.action(name);
      if (!!action) {
        if (!!actionConfigs[name]) {
          action.message = actionConfigs[name].message;
          action.icon = actionConfigs[name].icon;
        }
        preparedActions.push(action);
      }
    });

    return preparedActions;
  }

  function createSyntheticActions(entity) {
    var actions = [];
    for (var key in actionConfigs) {
      if (actionConfigs.hasOwnProperty(key) && actionConfigs[key].isSynthetic) {
        var cfg = actionConfigs[key];
        if (!cfg.disabled && isSupportedAction(entity, cfg.name)) {
          actions.push({
            name: cfg.name,
            title: cfg.title,
            message: cfg.message,
            icon: cfg.icon,
            entity: entity
          })
        }
      }
    }
    return actions;
  }

  function isSupportedAction(entity, action) {
    for (var cls in supportedActions) {
      if (supportedActions.hasOwnProperty(cls) && entity.hasClass(cls)) {
        return supportedActions[cls].indexOf(action) != -1;
      }
    }
    return false;
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
