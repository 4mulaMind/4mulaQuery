package com.formulaquery.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ye annotation Spring Boot ko batata hai ki ye main configuration class hai
// Isme 3 cheeze automatically enable ho jati hain:
// 1. Configuration
// 2. Component Scan
// 3. Auto Configuration
@SpringBootApplication
public class ApiApplication {

    // Ye main method application ka entry point hai
    // Yahin se Spring Boot server start hota hai
    public static void main(String[] args) {

        // SpringApplication.run() Spring Boot application ko start karta hai
        // Ye embedded server (generally Tomcat) ko launch karta hai
        // Aur saare REST controllers aur configurations load karta hai
        SpringApplication.run(ApiApplication.class, args);

    }
}