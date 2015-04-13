'use strict';

module.exports = routes;

/* @ngInject */
function routes($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/browser/assets');
  $stateProvider
    .state('search', {
      url: '/search/{query:any}',
      resolve: {
        breadcrumb: function resolveBreadcrumb(assetAPI) {
          return assetAPI.getBreadcrumb('assets');
        },
        actions: function resolveActions() {
          return [];
        },
        assets: function resolveAssets(assetAPI, $stateParams) {
          return assetAPI.searchAssets($stateParams.query);
        }
      },
      views: {
        'breadcrumb': {
          controller: 'BreadcrumbController',
          controllerAs: 'breadcrumb'
        },
        'actionbar': {
          controller: 'ActionController',
          controllerAs: 'actionbar'
        },
        'browser': {
          controller: 'BrowserController',
          controllerAs: 'browser'
        }
      }
    })
    .state('browser', {
      url: '/browser/{path:any}',
      resolve: {
        breadcrumb: function resolveBreadcrumb(assetAPI, $stateParams) {
          return assetAPI.getBreadcrumb($stateParams.path);
        },
        actions: function resolveActions(assetAPI, $stateParams) {
          return assetAPI.getActions($stateParams.path);
        },
        assets: function resolveAssets(assetAPI, $stateParams) {
          return assetAPI.getChildAssets($stateParams.path);
        }
      },
      views: {
        'breadcrumb': {
          controller: 'BreadcrumbController',
          controllerAs: 'breadcrumb'
        },
        'actionbar': {
          controller: 'ActionController',
          controllerAs: 'actionbar'
        },
        'browser': {
          controller: 'BrowserController',
          controllerAs: 'browser'
        }
      }
    });
}
