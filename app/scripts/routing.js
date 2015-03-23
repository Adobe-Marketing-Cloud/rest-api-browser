'use strict';

module.exports = routes;

/* @ngInject */
function routes($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/browser/assets');
  $stateProvider
    .state('browser', {
      url: '/browser/{path:any}',
      resolve: {
        breadcrumb: function resolveBreadcrumb(assetAPI, $stateParams) {
          return assetAPI.getBreadcrumb($stateParams.path);
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
        'browser': {
          controller: 'BrowserController',
          controllerAs: 'browser'
        }
      }
    });
}
