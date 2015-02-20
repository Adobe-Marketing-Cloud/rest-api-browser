'use strict';

/**
 * @ngdoc overview
 * @name yeomanApproachApp
 * @description
 * # yeomanApproachApp
 *
 * Main module of the application.
 */
angular
  .module('assetBrowser', ['ui.router', 'ui.bootstrap']);


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
