package com.formulaquery.api; // Agar aapka package name alag hai toh wahi likhna

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "🚀 4mulaQuery Engine is Live and Running!";
    }
}