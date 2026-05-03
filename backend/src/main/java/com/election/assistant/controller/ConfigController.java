package com.election.assistant.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final String googleClientId;

    public ConfigController(@Value("${google.oauth.client-id:}") String googleClientId) {
        this.googleClientId = googleClientId != null ? googleClientId : "";
    }

    @GetMapping("/public")
    public Map<String, String> getPublicConfig() {
        return Map.of("googleClientId", googleClientId);
    }
}
