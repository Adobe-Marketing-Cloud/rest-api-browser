package com.adobe.example.oauth;

import org.apache.commons.codec.Charsets;
import org.apache.commons.io.IOUtils;
import org.apache.oltu.oauth2.client.OAuthClient;
import org.apache.oltu.oauth2.client.URLConnectionClient;
import org.apache.oltu.oauth2.client.request.OAuthBearerClientRequest;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthJSONAccessTokenResponse;
import org.apache.oltu.oauth2.client.response.OAuthResourceResponse;
import org.apache.oltu.oauth2.common.OAuth;
import org.apache.oltu.oauth2.common.exception.OAuthProblemException;
import org.apache.oltu.oauth2.common.exception.OAuthSystemException;
import org.apache.oltu.oauth2.common.message.types.GrantType;
import org.apache.oltu.oauth2.common.message.types.ResponseType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

public class ApiProxyServlet extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(ApiProxyServlet.class);

    private static final String HOST = "http://localhost:9000";
    private static final String OAUTH_CALLBACK = "/api/oauth/callback";
    private static final String OAUTH_SCOPE = "/content/dam";

    private String accessToken;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        LOG.info("Request suffix: {}", getUrlSuffix(req));
        try {
            if (accessToken == null || isOAuthCallback(req)) {
                if (isOAuthCallback(req)) {
                    handleOAuthCallback(req, resp);
                } else {
                    requestAccessToken(req, resp);
                }
            } else {
                handleProxyRequest(req, resp);
            }

        } catch (OAuthSystemException e) {
            LOG.error("Boom", e);
        } catch (OAuthProblemException e) {
            LOG.error("Boom", e);
        }
    }

    private void handleProxyRequest(HttpServletRequest req, HttpServletResponse resp)
        throws OAuthSystemException, OAuthProblemException, IOException {

        final String apiUrlPrefix = getInitParameter("apiUrlPrefix");
        final String url = apiUrlPrefix + getUrlSuffix(req);
        final OAuthClientRequest bearerClientRequest = new OAuthBearerClientRequest(url)
            .setAccessToken(accessToken)
            .buildHeaderMessage();

        bearerClientRequest.setHeader("Host", "localhost:9000");

        // TODO: support methods other than GET
        final OAuthClient oAuthClient = new OAuthClient(new ApacheHttpCommonsClient());
        final OAuthResourceResponse resourceResponse =
            oAuthClient.resource(bearerClientRequest, req.getMethod(), OAuthResourceResponse.class);


        final int status = resourceResponse.getResponseCode();
        LOG.info("Request for {}: status code {}", url, status);
        resp.setStatus(status);
        resp.setContentType(resourceResponse.getContentType());

        final ServletOutputStream outputStream = resp.getOutputStream();
        // TODO: use InputStream - blocked by https://issues.apache.org/jira/browse/OLTU-174
        // final InputStream inputStream = resourceResponse.getBodyAsInputStream();
        final InputStream inputStream = new ByteArrayInputStream(resourceResponse.getBody().getBytes(Charsets.UTF_8));
        IOUtils.copy(inputStream, outputStream);
        IOUtils.closeQuietly(inputStream);
        IOUtils.closeQuietly(outputStream);
    }

    private boolean isOAuthCallback(HttpServletRequest req) {
        final String suffix = getUrlSuffix(req);
        return "/oauth/callback".equals(suffix);
    }

    private void handleOAuthCallback(HttpServletRequest req, HttpServletResponse resp)
        throws OAuthSystemException, OAuthProblemException, IOException {

        final OAuthClientRequest request = OAuthClientRequest
            .tokenLocation(getInitParameter("tokenLocation"))
            .setGrantType(GrantType.AUTHORIZATION_CODE)
            .setClientId(getInitParameter("clientId"))
            .setClientSecret(getInitParameter("clientSecret"))
            // TODO: retrieve protocol, host and port from request
            .setRedirectURI(HOST + req.getContextPath() + OAUTH_CALLBACK)
            .setCode(req.getParameter("code"))
            .buildQueryMessage();

        final OAuthClient oAuthClient = new OAuthClient(new URLConnectionClient());

        final OAuthJSONAccessTokenResponse oAuthResponse =
            oAuthClient.accessToken(request, OAuthJSONAccessTokenResponse.class);

        LOG.info("response body: {}", oAuthResponse.getBody());
        accessToken = oAuthResponse.getAccessToken();

        final String redirectPath = req.getParameter("state");
        if (redirectPath != null) {
            resp.sendRedirect(HOST + "/api" + redirectPath);
        }
    }

    private void requestAccessToken(HttpServletRequest req, HttpServletResponse resp)
        throws IOException, OAuthSystemException {

        OAuthClientRequest request = OAuthClientRequest
            .authorizationLocation(getInitParameter("authorizationLocation"))
            .setClientId(getInitParameter("clientId"))
            // TODO: retrieve protocol, host and port from request
            .setRedirectURI(HOST + req.getContextPath() + OAUTH_CALLBACK)
            .setScope(OAUTH_SCOPE)
            .setResponseType(ResponseType.CODE.toString())
            .setState(getUrlSuffix(req))
            .buildQueryMessage();

        LOG.info("Redirecting to {}", request.getLocationUri());
        resp.sendRedirect(request.getLocationUri());
    }

    public String getUrlSuffix(HttpServletRequest req) {
        final String pathInfo = req.getPathInfo();
        if (pathInfo == null && req.getRequestURI().endsWith("/api.json")) {
            return ".json";
        } else {
            return pathInfo;
        }
    }

}
