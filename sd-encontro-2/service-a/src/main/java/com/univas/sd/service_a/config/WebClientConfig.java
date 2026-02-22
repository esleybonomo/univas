package com.univas.sd.service_a.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${services.b.base-url}")
    private String serviceBBaseUrl;

    @Bean
    public WebClient serviceBWebClient() {
        return WebClient.builder()
                .baseUrl(serviceBBaseUrl)
                .build();
    }
}
