package com.univas.sd.service_a.api;

import com.univas.sd.service_a.client.ServiceBClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
public class CallBController {

    private final ServiceBClient client;

    public CallBController(ServiceBClient client) {
        this.client = client;
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong-a";
    }

    @GetMapping("/call-b/ping")
    public Mono<String> callBPing() {
        return client.ping().map(resp -> "A recebeu de B: " + resp);
    }

    @GetMapping("/call-b/slow")
    public Mono<String> callBSlow(@RequestParam(defaultValue = "500") long ms) {
        return client.slow(ms).map(resp -> "A recebeu de B: " + resp);
    }
}