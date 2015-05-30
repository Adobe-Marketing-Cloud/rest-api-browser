'use strict';

module.exports = BreadcrumbController;

/* @ngInject */
function BreadcrumbController(breadcrumb) {
  var vm = this;
  if (Array.isArray(breadcrumb)) {
    vm.crumbs = breadcrumb;
  } else {
    vm.crumbs = [];
  }
}
