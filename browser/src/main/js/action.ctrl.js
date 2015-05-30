'use strict';

module.exports = ActionController;

/* @ngInject */
function ActionController(actions, $state, $stateParams, $modal) {
  var vm = this;
  vm.searchquery = $stateParams.query || '';
  vm.actions = actions;

  vm.search = function search(searchForm) {
    $state.go('search', { query: vm.searchquery });
  }
}
