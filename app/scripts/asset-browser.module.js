'use strict';

require('angular');
require('angular-ui-router');
require('angular-bootstrap-npm');

var BreadcrumbController = require('./breadcrumb.ctrl.js');
var BrowserController = require('./browser.ctrl.js');
var RoutingConfig = require('./routing.js');
var AssetAPIProvider = require('./api.service.js');

angular
  .module('assetBrowser', ['ui.router', 'ui.bootstrap'])
  .config(RoutingConfig)
  .controller('BreadcrumbController', BreadcrumbController)
  .controller('BrowserController', BrowserController)
  .factory('assetAPI', AssetAPIProvider)
;




  //.config(function($httpProvider) {
  //  //Enable cross domain calls
  //  $httpProvider.defaults.useXDomain = true;
  //  //$httpProvider.defaults.headers.common.Authorization = 'Basic YWRtaW46YWRtaW4=';
  //
  //  //Remove the header used to identify ajax call  that would prevent CORS from working
  //  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  //})

//require('./apiService');
//require('./routing');
//require('./BreadcrumbController');
//require('./BrowserController');

/*

TODO:
* custom type for url param path ui-router #1119
* leverage rel attributes of links
* implement paging (use properties/srn:paging)
* support actions
* entities of type assets/asset show the original rendition instead of a thumbnail


"rel" attribute mapping:
  * links
    - self: self
    - parent: back, breadcrumb
    - content: download
    - thumbnail: overview
  * entities
    - child: child
    * links
      - self
      - content (only class assets/asset)


 */
