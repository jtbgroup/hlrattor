package com.hlrattor.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class VersionController {

    @Value("${application.version:unknown}")
    private String version;

    /**
     * Public endpoint — no authentication required.
     * Returns the current application version.
     */
    @GetMapping("/version")
    public Map<String, String> getVersion() {
        return Map.of("version", version);
    }
}
