package com.liferay.sample;

import com.liferay.client.extension.util.spring.boot3.BaseRestController;
import com.liferay.client.extension.util.spring.boot3.client.LiferayOAuth2AccessTokenManager;
import com.liferay.headless.admin.user.client.dto.v1_0.Site;
import com.liferay.headless.admin.user.client.resource.v1_0.SiteResource;
import com.liferay.headless.delivery.client.dto.v1_0.MessageBoardThread;
import com.liferay.headless.delivery.client.pagination.Page;
import com.liferay.headless.delivery.client.pagination.Pagination;
import com.liferay.headless.delivery.client.resource.v1_0.MessageBoardThreadResource;

import java.io.FileReader;
import java.io.Reader;
import java.net.URI;
import java.net.URL;

import java.util.Collection;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.json.JSONArray;
import org.json.JSONObject;


@Component
public class SampleCommandLineRunner
	extends BaseRestController {

	@Scheduled(initialDelay = 0, fixedDelay = 60000)
	public void run() throws Exception {

		if (_log.isInfoEnabled()) {
            _log.info(">>> Starting Liferay Product Batch Engine Sync...");
        }

		// Note: Ensure this path is correct for your environment. 
        // In Docker/LXC, you might need an absolute path or use ResourceLoader.
        String csvPath = "src/main/resources/products.csv"; 
        JSONArray productsArray = new JSONArray();

        try (Reader reader = new FileReader(csvPath);
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                JSONObject productNode = new JSONObject();

                productNode.put("active", Boolean.parseBoolean(record.get("active")));
				productNode.put("catalogExternalReferenceCode", record.get("catalogExternalReferenceCode"));
                productNode.put("productType", record.get("productType"));
                productNode.put("externalReferenceCode", record.get("externalReferenceCode"));	

                JSONObject nameI18n = new JSONObject();
                nameI18n.put("en_US", record.get("name"));
                productNode.put("name", nameI18n);

				JSONObject descriptionI18n = new JSONObject();
                descriptionI18n.put("en_US", record.get("description"));
                productNode.put("description", descriptionI18n);

                productsArray.put(productNode);
            }

            if (productsArray.length() == 0) {
                if (_log.isWarnEnabled()) {
                    _log.warn("No products found in CSV. Aborting.");
                }
                return;
            }

            URI uri = UriComponentsBuilder.fromPath(
                "/o/headless-batch-engine/v1.0/import-task/com.liferay.headless.commerce.admin.catalog.dto.v1_0.Product"
            ).queryParam("importStrategy", "ON_MISSING_CREATE")
            .build()
            .toUri();

			String authorization = _liferayOAuth2AccessTokenManager.getAuthorization("external-liferay");

            if (_log.isInfoEnabled()) {
                _log.info("Target URI: " + uri.toString());
                _log.info("Payload: " + productsArray.toString());
            }

            String responseBody = post(
                authorization,
                productsArray.toString(),
                uri
            );

            if (_log.isInfoEnabled()) {
                if (responseBody != null) {
                    _log.info("SUCCESS: Batch import task submitted. Response: " + responseBody);
                } else {
                    _log.warn("Batch import task submitted, but response body was null/empty.");
                }
            }


        } catch (Exception e) {
            _log.error("CRITICAL ERROR during batch sync: " + e.getMessage(), e);
        }

        if (_log.isInfoEnabled()) {
            _log.info(">>> Batch Sync Task Completed.");
        }
	}


	private static final Log _log = LogFactory.getLog(
		SampleCommandLineRunner.class);

	@Value("${external.liferay.oauth2.headless.server.home.page.url:#{null}}")
	private URL _externalLiferayHomePageURL;

	@Autowired
	private LiferayOAuth2AccessTokenManager _liferayOAuth2AccessTokenManager;

	@Value("${com.liferay.lxc.dxp.mainDomain}")
	private String _lxcDXPMainDomain;

	@Value("${com.liferay.lxc.dxp.server.protocol}")
	private String _lxcDXPServerProtocol;

}