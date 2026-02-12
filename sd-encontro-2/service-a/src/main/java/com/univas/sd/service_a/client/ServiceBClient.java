package com.univas.sd.service_a.client;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class ServiceBClient {

    private final WebClient webClient;

    public ServiceBClient(WebClient serviceBWebClient) {
        this.webClient = serviceBWebClient;
    }

    public Mono<String> ping() {
        return webClient.get()
                .uri("/ping")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(2))
                .onErrorResume(ex -> Mono.just("fallback: B indisponível ou lento"));
    }

    public Mono<String> slow(long ms) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/slow")
                        .queryParam("ms", ms)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(2))
                .onErrorResume(ex -> Mono.just("fallback: timeout ao chamar /slow"));
    }
}