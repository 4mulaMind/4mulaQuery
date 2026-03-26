/*
============================================================
4mulaQuery - REST API Command Bridge
============================================================
File: ApiController.java
Author: Abdul Qadir
Purpose: Connects Web UI to C++ B-Tree Engine
============================================================
*/

package com.formulaquery.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct; 

/**
 * ====================================================
 * CLASS: ApiController
 * ====================================================
 * Acts as the communication gateway. It receives HTTP 
 * requests and dispatches formatted instructions to 
 * the underlying C++ Database Kernel.
 * ====================================================
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * Injects the binary path from application.properties.
     * Default Fallback: ./core/4mulaQuery
     */
    @Value("${database.engine.path:./core/4mulaQuery}")
    private String enginePath;

    private EngineService engineService;

    /**
     * INITIALIZATION
     * Triggered automatically after dependency injection.
     */
    @PostConstruct
    public void init() {
        // Ensuring the bridge is ready with the correct path
        this.engineService = new EngineService(enginePath);
    }

    /**
     * ----------------------------------------------------
     * ENDPOINT: /api/insert
     * ----------------------------------------------------
     */
    @GetMapping("/insert")
    public String insertData(
            @RequestParam int id,
            @RequestParam String name,
            @RequestParam String email) {
        
        // Command Structure: insert,id,name,email
        String command = String.format("insert,%d,%s,%s", id, name, email);
        return engineService.executeCommand(command);
    }

    /**
     * ----------------------------------------------------
     * ENDPOINT: /api/all
     * ----------------------------------------------------
     */
    @GetMapping("/all")
    public String getAllData() {
        return engineService.executeCommand("all");
    }

    /**
     * ----------------------------------------------------
     * ENDPOINT: /api/search
     * ----------------------------------------------------
     */
    @GetMapping("/search")
    public String search(@RequestParam int id) {
        return engineService.executeCommand("search," + id);
    }

    /**
     * ----------------------------------------------------
     * ENDPOINT: /api/delete
     * ----------------------------------------------------
     */
    @GetMapping("/delete")
    public String deleteData(@RequestParam int id) {
        // Cleaned the trailing comma for kernel stability
        return engineService.executeCommand("delete," + id);
    }
}