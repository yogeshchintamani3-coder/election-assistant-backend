package com.election.assistant.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GoogleCivicConfig {

    @Value("${google.civic.base-url}")
    private String baseUrl;

    @Value("${google.civic.api-key}")
    private String apiKey;

    @Bean
    public WebClient googleCivicWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultUriVariables(java.util.Map.of("key", apiKey))
                .build();
    }

    public String getApiKey() {
        return apiKey;
    }
}
