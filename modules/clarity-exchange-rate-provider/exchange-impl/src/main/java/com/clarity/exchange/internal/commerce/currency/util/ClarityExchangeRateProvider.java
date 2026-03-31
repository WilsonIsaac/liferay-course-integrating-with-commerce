package com.clarity.exchange.internal.commerce.currency.util;

import com.liferay.commerce.currency.model.CommerceCurrency;
import com.liferay.commerce.currency.util.ExchangeRateProvider;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.StringUtil;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.osgi.service.component.annotations.Component;

/**
 * Custom Exchange Rate Provider for Liferay Commerce.
 * This provider connects to the Frankfurter API to fetch real-time exchange rates.
 * * Features:
 * - Real-time API integration with the Frankfurter service.
 * - 5-second connection timeout to prevent UI hanging.
 * - Automatic fallback to 1.0 if the API is unavailable or the currency pair is not found.
 */
@Component(
    property = "commerce.exchange.provider.key=Clarity Exchange Rate Provider",
    service = ExchangeRateProvider.class
)
public class ClarityExchangeRateProvider implements ExchangeRateProvider {

    @Override
    public BigDecimal getExchangeRate(
            CommerceCurrency primaryCommerceCurrency,
            CommerceCurrency secondaryCommerceCurrency)
        throws Exception {

        String baseCurrencyCode = StringUtil.toUpperCase(primaryCommerceCurrency.getCode());
        String targetCurrencyCode = StringUtil.toUpperCase(secondaryCommerceCurrency.getCode());

        // If currencies are the same, rate is 1.0
        if (baseCurrencyCode.equals(targetCurrencyCode)) {
            return BigDecimal.ONE;
        }

        try {
            // We use the Frankfurter API (free, no key required for basic usage)
            // Endpoint: https://api.frankfurter.app/latest?from=USD&to=EUR
            String url = String.format(
                "https://api.frankfurter.app/latest?from=%s&to=%s",
                baseCurrencyCode,
                targetCurrencyCode
            );

            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                if (_log.isDebugEnabled()) {
                    _log.debug("Received API response: " + response.body());
                }

                JSONObject jsonObject = JSONFactoryUtil.createJSONObject(response.body());
                JSONObject rates = jsonObject.getJSONObject("rates");
                
                if (rates != null && rates.has(targetCurrencyCode)) {
                    double rateValue = rates.getDouble(targetCurrencyCode);
                    
                    if (_log.isDebugEnabled()) {
                        _log.debug(String.format("Conversion: 1 %s = %f %s", baseCurrencyCode, rateValue, targetCurrencyCode));
                    }
                    
                    return new BigDecimal(rateValue);
                }
            } else {
                if (_log.isWarnEnabled()) {
                    _log.warn("API returned non-200 status: " + response.statusCode());
                }
            }

        } catch (Exception e) {
            if (_log.isErrorEnabled()) {
                _log.error("Error fetching exchange rate from external API", e);
            }
            throw new Exception("Error fetching exchange rate from external API", e);
        }

        // Default fallback to ensure system continuity
        return BigDecimal.ONE;
    }

    private static final Log _log = LogFactoryUtil.getLog(ClarityExchangeRateProvider.class);

}