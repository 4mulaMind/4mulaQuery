/*
============================================================
4mulaQuery - Main Application Entry Point
============================================================

File Location: 
/src/main/java/com/formulaquery/api/ApiApplication.java

Purpose:
This class serves as the primary gateway for the 4mulaQuery 
Spring Boot application. It initializes the execution context 
and starts the embedded web server (Tomcat).

Features:
• Auto-Configuration Enablement
• Component Scanning for Controllers
• Embedded Server Initialization

============================================================
*/

package com.formulaquery.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ====================================================
 * CLASS: ApiApplication
 * ====================================================
 * @SpringBootApplication is a convenience annotation that adds:
 * 1. @Configuration: Tags the class as a source of bean definitions.
 * 2. @EnableAutoConfiguration: Tells Spring Boot to start adding beans.
 * 3. @ComponentScan: Tells Spring to look for other components/controllers.
 * ====================================================
 */
@SpringBootApplication
public class ApiApplication {

    /**
     * ----------------------------------------------------
     * METHOD: main()
     * ----------------------------------------------------
     * The standard Java entry point for the application.
     * It delegates to Spring Boot's SpringApplication class 
     * by calling run().
     * * @param args Command line arguments passed during startup.
     * ----------------------------------------------------
     */
    public static void main(String[] args) {

        /* SpringApplication.run() initializes the Spring context, 
           starts the Tomcat server, and maps all REST endpoints.
        */
        SpringApplication.run(ApiApplication.class, args);

        // Success log to indicate the bridge is online
        System.out.println("==========================================");
        System.out.println("  4mulaQuery API Bridge: ONLINE & READY   ");
        System.out.println("==========================================");
    }
}