package com.adobe.example.oauth;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.EntityBuilder;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.oltu.oauth2.client.OAuthClient;
import org.apache.oltu.oauth2.client.URLConnectionClient;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthJSONAccessTokenResponse;
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
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import static java.util.Arrays.asList;

public class ApiProxyServlet extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(ApiProxyServlet.class);

    private static final String HOST = "http://localhost:9000";
    private static final String OAUTH_CALLBACK = "/api/oauth/callback";
    private static final String OAUTH_SCOPE = "/content/dam";
    public static final String ACCESS_TOKEN = "accessToken";

    private CloseableHttpClient httpClient;

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
        LOG.info("Request suffix: {}", getUrlSuffix(req));

        final HttpSession session = req.getSession(true);
        try {
            final String accessToken = (String)session.getAttribute(ACCESS_TOKEN);
            if (accessToken == null || isOAuthCallback(req)) {
                if (isOAuthCallback(req)) {
                    final String token = handleOAuthCallback(req, resp);
                    session.setAttribute(ACCESS_TOKEN, token);
                } else {
                    requestAccessToken(req, resp);
                }
            } else {
                handleProxyRequest(req, resp, accessToken);
            }

        } catch (OAuthSystemException e) {
            LOG.error("Unexpected exception:", e);
        } catch (OAuthProblemException e) {
            LOG.error("Unexpected exception:", e);
        }
    }

    private void handleProxyRequest(HttpServletRequest req, HttpServletResponse resp, String accessToken)
        throws OAuthSystemException, OAuthProblemException, IOException {

        final String apiUrlPrefix = getInitParameter("apiUrlPrefix");
        final String url = apiUrlPrefix + getUrlSuffix(req);

        final RequestBuilder requestBuilder = RequestBuilder
            .create(req.getMethod())
            .setUri(url)
            .addHeader("Authorization", "Bearer " + accessToken)
            .addHeader("Host", "localhost:9000");

        if (!"GET".equals(req.getMethod())) {
            // NOTE: Currently AEM provides only read support via the OAuth Resource Server
            //       Therefore this section of code does not work.
            final Enumeration parameterNames = req.getParameterNames();
            final List<NameValuePair> params = new ArrayList<NameValuePair>();
            while (parameterNames.hasMoreElements()) {
                final String name = (String) parameterNames.nextElement();
                final String value = req.getParameter(name);
                BasicNameValuePair nameValuePair = new BasicNameValuePair(name, value);
                params.add(nameValuePair);
            }

            final HttpEntity entity = EntityBuilder.create()
                .setContentEncoding("UTF-8")
                .setParameters(params)
                .build();
            requestBuilder.setEntity(entity);
        }

        final CloseableHttpResponse response = httpClient.execute(requestBuilder.build());
        resp.setStatus(response.getStatusLine().getStatusCode());

        for (Header header : response.getAllHeaders()) {
            if (asList("Content-Type", "Date", "Expires", "Last-Modified").contains(header.getName())) {
                resp.setHeader(header.getName(), header.getValue());
            }
        }

        final InputStream inputStream = response.getEntity().getContent();
        final ServletOutputStream outputStream = resp.getOutputStream();
        IOUtils.copy(inputStream, outputStream);
        IOUtils.closeQuietly(inputStream);
        IOUtils.closeQuietly(outputStream);
        IOUtils.closeQuietly(response);
    }

    private boolean isOAuthCallback(HttpServletRequest req) {
        final String suffix = getUrlSuffix(req);
        return "/oauth/callback".equals(suffix);
    }

    private String handleOAuthCallback(HttpServletRequest req, HttpServletResponse resp)
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

        final String redirectPath = req.getParameter("state");
        if (redirectPath != null) {
            resp.sendRedirect(HOST + redirectPath);
        }
        return oAuthResponse.getAccessToken();
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
            .setState(req.getContextPath().length() == 0 ? "/" : req.getContextPath())
            .buildQueryMessage();

        LOG.info("Redirecting to {}", request.getLocationUri());
        resp.setStatus(401);
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json");
        resp.getWriter().append("{\"redirect\":\"").append(request.getLocationUri()).append("\"}");
    }

    private String getUrlSuffix(HttpServletRequest req) {
        final String pathInfo = req.getPathInfo();
        if (pathInfo == null && req.getRequestURI().endsWith("/api.json")) {
            return ".json";
        } else {
            return pathInfo;
        }
    }

    @Override
    public void init() throws ServletException {
        super.init();
        httpClient = HttpClients.createDefault();
    }

    @Override
    public void destroy() {
        super.destroy();
        if (httpClient != null) {
            try {
                httpClient.close();
            } catch (IOException e) {
                // ignore
            }
            httpClient = null;
        }
    }
}
