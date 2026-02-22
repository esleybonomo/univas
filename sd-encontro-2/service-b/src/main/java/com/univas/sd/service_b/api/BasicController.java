package com.univas.sd.service_b.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BasicController {

    @GetMapping("/ping")
    public String ping() {
        return "pong-b";
    }

    @GetMapping("/slow")
    public String slow(@RequestParam(defaultValue = "1000") long ms) throws InterruptedException {
        Thread.sleep(ms);
        return "ok (slept " + ms + "ms)";
    }
}