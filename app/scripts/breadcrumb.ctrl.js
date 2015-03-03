'use strict';


module.exports = BreadcrumbController;

/* @ngInject */
function BreadcrumbController(assets) {
  var vm = this;
  vm.paths = []; // TODO: parent is null exception if not empty
  if (assets[0].parentPath) {
    vm.paths = [{label: 'Home', href: '/'}, {label: 'Back', href: assets[0].parentPath}];
  }
}
