'use strict';

angular.module('assetBrowser')
  .controller('BrowserController', BrowserController);

function BrowserController(assets) {
  var vm = this;
  vm.assets = assets;
  vm.alerts = [];

  //activate();
  //
  //function activate() {
  //  assetAPI.getChildAssets('assets').then(function(data) {
  //    vm.assets = data;
  //  });
  //}
  //
  //function activate() {
  //  $http.get('http://localhost:9000/api.json').
  //    success(function(data) {
  //      $http.get(findAssetLink(data)).
  //        success(function(assets) {
  //          vm.assets = entitiesToAssets(assets.entities);
  //        })
  //        .error(function() {
  //          addAlert('Failed to retrieve data', 'danger');
  //        });
  //    }).
  //    error(function() {
  //      addAlert('Failed to retrieve data', 'danger');
  //    });
  //
  //}
  //
  //function addAlert(msg, type) {
  //  var idx = vm.alerts.length;
  //  vm.alerts.push({
  //    msg: msg,
  //    type: type,
  //    close: function() { vm.alerts.splice(idx, 1); }
  //  });
  //}
}
