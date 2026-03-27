package com.formulaquery.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API Controller for 4mulaQuery
 * Base URL: /api
 * 
 * Provides endpoints to:
 * - Insert data
 * - Fetch all records
 * - Search by ID
 * - Delete by ID
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    // EngineService bean inject kiya ja raha hai
    @Autowired
    private EngineService engineService;

    /**
     * Insert data into database
     * Example: /api/insert?id=1&name=Abdul&email=test@test.com
     */
    @GetMapping("/insert")
    public String insertData(
            @RequestParam int id,
            @RequestParam String name,
            @RequestParam String email) {

        String command = String.format("insert,%d,%s,%s", id, name, email);
        return engineService.executeCommand(command);
    }

    /**
     * Get all data from database
     * Example: /api/all
     */
    @GetMapping("/all")
    public String getAllData() {
        return engineService.executeCommand("all");
    }

    /**
     * Search data by ID
     * Example: /api/search?id=5
     */
    @GetMapping("/search")
    public String search(@RequestParam int id) {
        return engineService.executeCommand("search," + id);
    }

    /**
     * Delete data by ID
     * Example: /api/delete?id=5
     */
    @GetMapping("/delete")
    public String deleteData(@RequestParam int id) {
        return engineService.executeCommand("delete," + id);
    }
}