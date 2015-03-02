'use strict';

angular.module('assetBrowser')
  .config(routes);

/* @ngInject */
function routes($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/browser/assets');
  $stateProvider
    .state('browser', {
      url: '/browser/{path:any}',
      resolve: {
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