'use strict';

module.exports = BreadcrumbController;

/* @ngInject */
function BreadcrumbController(breadcrumb) {
  var vm = this;
  vm.crumbs = breadcrumb;
}
