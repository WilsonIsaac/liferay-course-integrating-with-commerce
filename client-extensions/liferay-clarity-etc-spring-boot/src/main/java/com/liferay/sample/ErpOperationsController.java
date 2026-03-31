package com.liferay.sample;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.liferay.client.extension.util.spring.boot3.BaseRestController;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Controller that retrieves order information from Liferay Commerce
 * and validates the total value against the ERP provided value.
 */
@RequestMapping("/erp/operations")
@RestController
public class ErpOperationsController extends BaseRestController {

	/**
	 * Compares the total value of a Liferay order with a provided value.
	 *
	 * @param jwt        The authenticated Liferay user token.
	 * @param orderId    The ID of the order to retrieve.
	 * @param totalValue The expected total value to compare against.
	 * @return "ok" if values match, "error" + details otherwise.
	 */
	@GetMapping("/{orderId}/{totalValue}")
	public ResponseEntity<String> getOrder(
		@AuthenticationPrincipal Jwt jwt,
		@PathVariable("orderId") String orderId,
		@PathVariable("totalValue") String totalValue) {

		log(jwt, _log);

		try {
			// Prepare headers including the Authorization token
			Map<String, String> headers = new HashMap<>();

			headers.put(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

			if (jwt != null) {
				headers.put(
					HttpHeaders.AUTHORIZATION, "Bearer " + jwt.getTokenValue());
			}

			// Call Liferay Headless Commerce API
			String result = get(
				headers,
				UriComponentsBuilder.fromPath(
					"/o/headless-commerce-admin-order/v1.0/orders/" + orderId
				).build().toUri());

			// Print the full result to logs
			if (_log.isInfoEnabled()) {
				_log.info("Full Liferay Order JSON Result: " + result);
			}

			// Parse the JSON response
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode rootNode = objectMapper.readTree(result);

			// Extract the totalWithTaxAmountFormatted attribute
			String liferayTotal = rootNode.path("totalWithTaxAmountFormatted").asText() + 1;

			if (_log.isInfoEnabled()) {
				_log.info("Comparison -> Liferay: [" + liferayTotal + "] vs Provided: [" + totalValue + "]");
			}

			// Compare and return result
			if (liferayTotal.equals(totalValue)) {
				return new ResponseEntity<>("ok", HttpStatus.OK);
			}
			else {
				// Return error and print the details of the mismatch
				String errorDetail = "error. Expected: " + liferayTotal + " but received: " + totalValue;
				return new ResponseEntity<>(errorDetail, HttpStatus.UNPROCESSABLE_ENTITY);
			}

		}
		catch (Exception e) {
			if (_log.isErrorEnabled()) {
				_log.error("Error processing ERP operation: " + e.getMessage(), e);
			}

			return new ResponseEntity<>("error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private static final Log _log = LogFactory.getLog(
		ErpOperationsController.class);

}