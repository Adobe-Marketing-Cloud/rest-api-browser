# OAuth API Proxy for Asset Browser

## Getting started

Start an AEM 6.1 instance at `http://localhost:4502`

Once startup completes, add `/content/dam` to the allowed scopes of the
[OAuth Resource Server][resource-server].

Also [Adobe Granite OAuth Server Authentication Handler][oauth-login-module] needs to
be configured. In AEM 6.1 its rank collides with another LoginModule. Setting the rank
to 1100 works.

Then the Oauth API Proxy application needs to be registered with AEM. This is
achieved by [creating a new OAuth client][oauth-clients]. Enter the Client ID
`OAuth API Proxy` and the redirect URL `http://localhost:9000/api/oauth/callback`.

After registering the new client, update the client ID and secret in the `web.xml`
file (`src/main/webapp/WEB-INF/web.xml`) with the values from your client details
screen.

The webapp can be deployed on an application server. Or for testing and simplicity
it can be run with from the maven build via the Jetty plugin.

    mvn jetty:run-war

or from the parent module

    mvn jetty:run-war -pl java-api-proxy

Note that the port number `9000` is currently hard-coded in the webapp. Therefore
any deployment of the webapp needs to run on this port.

[resource-server]: http://localhost:4502/system/console/configMgr/com.adobe.granite.oauth.server.impl.OAuth2ResourceServerImpl
[oauth-clients]: http://localhost:4502/libs/granite/oauth/content/clients.html

