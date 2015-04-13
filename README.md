# REST API Asset Browse

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
    
    # run the app on a gulp's built-in server
    npm run serve
    
A browser should automatically open, showing `http://localhost:9000/#/browser/assets`

The grunt server proxies the requests to the AEM instance and automatically logs in using
the default credentials `admin:admin`.
    
[csrf-filter]: http://localhost:4502/system/console/configMgr/com.adobe.granite.csrf.impl.CSRFFilter
