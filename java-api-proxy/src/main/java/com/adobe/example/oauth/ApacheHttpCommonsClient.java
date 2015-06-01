package com.adobe.example.oauth;

import org.apache.commons.codec.Charsets;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.oltu.oauth2.client.HttpClient;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthClientResponse;
import org.apache.oltu.oauth2.client.response.OAuthClientResponseFactory;
import org.apache.oltu.oauth2.common.OAuth;
import org.apache.oltu.oauth2.common.exception.OAuthProblemException;
import org.apache.oltu.oauth2.common.exception.OAuthSystemException;
import org.apache.oltu.oauth2.common.utils.OAuthUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * Oltu's UrlClientConnection is based on {@link java.net.HttpURLConnection}, which
 * does not allow setting the {@code Host} HTTP header. This is required however, in
 * order for AEM to correctly render the URLs in its JSON responses.
 * <br/>
 * Using Apache HTTPCommons Client works around this issue.
 */
public class ApacheHttpCommonsClient implements HttpClient {

    private static final Logger LOG = LoggerFactory.getLogger(ApacheHttpCommonsClient.class);

    private CloseableHttpClient httpClient = HttpClients.createDefault();

    public <T extends OAuthClientResponse> T execute(OAuthClientRequest request, Map<String, String> headers, String requestMethod, Class<T> responseClass)
        throws OAuthSystemException, OAuthProblemException {

        final int responseCode;
        final String contentType;
        final InputStream responseBody;
        try {

            final String method = OAuthUtils.isEmpty(requestMethod) ? OAuth.HttpMethod.GET : requestMethod;
            final RequestBuilder requestBuilder = RequestBuilder.create(method);
            requestBuilder.setUri(request.getLocationUri());

            if (headers != null && !headers.isEmpty()) {
                for (Map.Entry<String, String> header : headers.entrySet()) {
                    requestBuilder.setHeader(header.getKey(), header.getValue());
                }
            }

            if (request.getHeaders() != null) {
                for (Map.Entry<String, String> header : request.getHeaders().entrySet()) {
                    requestBuilder.setHeader(header.getKey(), header.getValue());
                }
            }

            if (method.equals(OAuth.HttpMethod.POST)) {
                final HttpEntity entity = new StringEntity(request.getBody(), Charsets.UTF_8);
                requestBuilder.setEntity(entity);
            }

            final CloseableHttpResponse httpResponse = httpClient.execute(requestBuilder.build());

            responseCode = httpResponse.getStatusLine().getStatusCode();
            final HttpEntity entity = httpResponse.getEntity();
            contentType = entity.getContentType() != null ? entity.getContentType().getValue() : null;
            responseBody = entity.getContent();
        } catch (ClientProtocolException e) {
            throw new OAuthSystemException(e);
        } catch (IOException e) {
            throw new OAuthSystemException(e);
        }

        // TODO: use InputStream - blocked by https://issues.apache.org/jira/browse/OLTU-174
        final String body;
        try {
            body = OAuthUtils.saveStreamAsString(responseBody);
        } catch (IOException e) {
            throw OAuthProblemException.error(e.getMessage());
        }

        return OAuthClientResponseFactory.createCustomResponse(body, contentType, responseCode, responseClass);
    }

    public void shutdown() {
        if (httpClient != null) {
            try {
                httpClient.close();
                httpClient = null;
            } catch (IOException e) {
                LOG.warn("Problem closing HttpClient", e);
            }
        }
    }
}
