'use strict';

module.exports = ActionController;

var fieldTitles = {
  'name': 'Name',
  'file': ''

};

/* @ngInject */
function ActionController(actions, $modal) {
  var vm = this;
  vm.actions = actions;
  vm.perform = function performAction(action) {

    function actionResolver() {
      return action;
    };

    var genericActionConfig = {
      templateUrl: "generic-form.html",
      controller: GenericFormController,
      controllerAs: 'action',
      resolve: {
        action: actionResolver
      }
    };

    var actionConfigs = {
      'add-asset': {
        templateUrl: "add-asset-form.html",
        controller: AddAssetController,
        controllerAs: 'action',
        resolve: {
          action: actionResolver
        }
      }
    };

    $modal.open(actionConfigs[action.name] || genericActionConfig);
  }
}

/* @ngInject */
function AddAssetController(action, $upload, $modalInstance, $scope) {
  var vm = this;
  vm.title = action.title;

  vm.upload = function upload(files) {
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        $upload.upload({
          headers: { 'Content-Type': file.type },
          method: action.method,
          url: action.href,
          fields: {'name': file.name},
          file: file
        })
        //.progress(function (evt) {
        //  var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //  console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        .success(function (data, status, headers, config) {
            // TODO: generate event to trigger reload of browser
            // $scope.$emit('');
        });
      }
    }
  };

  vm.done = function done() {
    $modalInstance.dismiss();
  }
}

/* @ngInject */
function GenericFormController(action, $http, $modalInstance) {
  var vm = this;
  vm.title = action.title;
  vm.action = action;
  vm.fields = !action.fields ? [] : action.fields.map(function(field) {
    field.title = fieldTitles.hasOwnProperty(field.name) ? fieldTitles[field.name] : field.name;
    return field
  });
  vm.form = {};

  vm.submit = function submit(actionForm) {
    actionForm.$setSubmitted(true);
    if (!actionForm.$valid) {
      return;
    }

    var req = {
      method: action.method,
      url: action.href,
      headers: {
        'Content-Type': "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: jsonToFormData(vm.form)
    };

    $http(req)
      .success(function actionSuccess() {
        // TODO: generate event to trigger reload of browser
        $modalInstance.close();
      })
      .error(function actionFailed() {
        // TODO: handle error
      });
  };

  vm.cancel = function cancel() {
    $modalInstance.dismiss();
  };
}


function jsonToFormData(object) {
  var result = [];
  for (var key in object) {
    if(object.hasOwnProperty(key)) {
      var value = object[key];
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value ? value : ''));
    }
  }
  return result.join('&');
}
