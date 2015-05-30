'use strict';

module.exports = ActionDirective;


var fieldTitles = {
  'name': 'Name',
  'file': ''
};

/* @ngInject */
function ActionDirective() {
  return {
    restrict: 'E',
    controller: DirectiveController,
    controllerAs: 'ctrl',
    scope: {
      action: '=',
      compact: '='
    },
    template:
    '<button class="btn btn-default" title="{{action.title}}" ng-click="ctrl.perform(action)">' +
    '<span ng-show="action.icon" class="glyphicon {{action.icon}}"></span>' +
    '<span ng-hide="compact && action.icon"><span ng-show="action.icon"> </span>{{action.title}}</span>' +
    '</button>\n'
  }
}

/* @ngInject */
function DirectiveController($modal) {
  var vm = this;
  vm.perform = function performAction(action) {

    function actionResolver() {
      return action;
    }

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
      },
      'preview': {
        templateUrl: "preview.html",
        controller: PreviewController,
        controllerAs: 'action',
        windowClass: 'modal-preview',
        resolve: {
          action: actionResolver
        }
      },
      'select': {
        template: "<span></span>",
        controller: SelectController,
        controllerAs: 'action',
        resolve: {
          action: actionResolver
        }
      }
    };

    $modal.open(actionConfigs[action.name] || genericActionConfig);
  };
}

/* @ngInject */
function AddAssetController(action, $upload, $modalInstance, $state) {
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
          .success(function reload() {
            $state.reload();
          });
      }
    }
  };

  vm.done = $modalInstance.dismiss;
}

/* @ngInject */
function GenericFormController(action, $http, $modalInstance, $state) {
  var vm = this;
  vm.title = action.title;
  vm.message = action.message;
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
        $state.reload();
        $modalInstance.close();
      })
      .error(function actionFailed() {
        // TODO: handle error
      });
  };

  vm.cancel = $modalInstance.dismiss;
}

function PreviewController(action, $modalInstance) {
  var url = action.entity.link('content').href();
  var vm = this;
  vm.previewUrl = url;
  vm.close = $modalInstance.close;
}

function SelectController(action) {
  var url = action.entity.link('content').href();
  window.opener.insertImage(url);
  window.close();
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
