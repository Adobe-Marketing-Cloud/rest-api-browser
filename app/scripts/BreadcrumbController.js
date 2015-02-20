'use strict';

/**
 * @ngdoc function
 * @name assetBrowser.controller:BrowserController
 * @description
 * # BrowserController
 * Controller of the assetBrowser
 */
(function(ng) {
  ng.module('assetBrowser')
    .controller('BreadcrumbController', BreadcrumbController);

  function BreadcrumbController(assets) {
    var vm = this;
    vm.paths = [{ label: 'Home', href: '/'}, { label: 'Back', href: assets[0].parentPath}];
  }
})(angular);
