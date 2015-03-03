'use strict';

module.exports = BrowserController;

/* @ngInject */
function BrowserController(assets) {
  var vm = this;
  vm.assets = assets;
  vm.alerts = [];
  vm.select = select;

  function select(assetUrl) {
    console.log('select', assetUrl);
    if (window.opener.insertImage) {
      window.opener.insertImage(assetUrl);
      window.close();
    } else {
      alert('Error: asset-select only works if the opener window defines an insertImage callback.');
    }
  }

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
