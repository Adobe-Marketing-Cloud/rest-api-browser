# REST API Asset Browser

An asset browser based on the REST API at /api.json

## Getting started

Start an AEM 6.1 instance at `http://localhost:4502`

**Optional:** Browsing content will work out of the box. However, content modifications
require the following re-configuration. Login and change the configuration of AEM's
[CSRFFilter][csrf-filter] to allow all methods. This can be achieved by setting the
Filter Methods field (`filter-methods`) to the string `NONE`. Note that removing all
filters methods will cause the default to be activated and thus filter out `POST`,
`PUT` and `DELETE` methods.

Run the following commands:

    # install all required dependencies
    npm install
    
    # run the app on gulp's built-in server
    npm run server
    
A browser should automatically open, showing `http://localhost:9000/#/browser/assets`

The grunt server proxies the requests to the AEM instance and automatically logs in using
the default credentials `admin:admin`.

## Asset Select

The browser implements a mechanism to inject content urls into other applications. In
order to use this feature, the browser needs to be opened in a new window from another
app and a callback named `insertImage(url)` needs to be defined in the `opener` window.
Take a look at `apps/asset-select.html` and `http://localhost:9000/asset-select.html`
for a basic working example.

[csrf-filter]: http://localhost:4502/system/console/configMgr/com.adobe.granite.csrf.impl.CSRFFilter
