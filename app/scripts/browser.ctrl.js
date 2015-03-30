'use strict';

module.exports = BrowserController;

/* @ngInject */
function BrowserController(assets, $scope) {
  var vm = this;
  if (Array.isArray(assets)) {
    vm.assets = assets;
    vm.alerts = [];
  } else {
    vm.assets = {};
    vm.alerts = [assets];
  }

  vm.closeAlert = function closeAlert(idx) {
    vm.alerts.splice(idx, 1);
  };
}
