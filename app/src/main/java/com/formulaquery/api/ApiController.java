package com.formulaquery.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ========================================================================
 * 4mulaQuery — REST API Controller
 * ========================================================================
 *
 * This controller exposes HTTP endpoints for interacting with the
 * 4mulaQuery database engine. It acts as the public interface between
 * client applications (browser / frontend UI) and the backend
 * EngineService that communicates with the C++ database core.
 *
 * ------------------------------------------------------------------------
 * ARCHITECTURE ROLE
 * ------------------------------------------------------------------------
 * Browser / Client
 *        │
 *        ▼
 * ApiController (this class)
 *        │
 *        ▼
 * EngineService
 *        │
 *        ▼
 * ProcessManager → C++ Database Engine
 *
 * The controller is responsible for:
 *
 * 1. Accepting HTTP requests
 * 2. Extracting query parameters
 * 3. Formatting commands for the database engine
 * 4. Returning execution results to the client
 *
 * ------------------------------------------------------------------------
 * BASE URL
 * ------------------------------------------------------------------------
 * /api
 *
 * Example:
 * http://localhost:8080/api/all
 *
 * ------------------------------------------------------------------------
 * AVAILABLE ENDPOINTS
 * ------------------------------------------------------------------------
 *
 * GET /api/insert
 *      Inserts a new record into the database.
 *
 * GET /api/all
 *      Returns all records currently stored.
 *
 * GET /api/search
 *      Searches for a record by ID.
 *
 * GET /api/delete
 *      Deletes a record by ID.
 *
 * GET /api/logs
 *      Returns query analytics data used by the dashboard.
 *
 * ------------------------------------------------------------------------
 * DESIGN PRINCIPLE
 * ------------------------------------------------------------------------
 * This controller follows the Single Responsibility Principle:
 *
 * ApiController → handles HTTP layer only
 * EngineService → handles execution logic
 *
 * The controller does NOT interact with the database engine directly.
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * EngineService dependency injection.
     *
     * Spring automatically provides the EngineService instance
     * which is responsible for communicating with the C++ engine
     * through process management and stream I/O.
     */
    @Autowired
    private EngineService engineService;


    /**
     * --------------------------------------------------------------------
     * INSERT RECORD ENDPOINT
     * --------------------------------------------------------------------
     *
     * Endpoint:
     *      GET /api/insert?id=1&name=Abdul&email=test@test.com
     *
     * Description:
     *      Inserts a new record into the database.
     *
     * Request Parameters:
     *      id    → unique integer identifier
     *      name  → username string
     *      email → email address
     *
     * Engine Command Format:
     *      insert,id,name,email
     *
     * Example Command Sent to Engine:
     *      insert,1,Abdul,test@test.com
     *
     * Returns:
     *      Raw response returned by the C++ database engine.
     */
    @GetMapping("/insert")
    public String insertData(
            @RequestParam int id,
            @RequestParam String name,
            @RequestParam String email) {

        return engineService.executeCommand(
            String.format("insert,%d,%s,%s", id, name, email));
    }


    /**
     * --------------------------------------------------------------------
     * FETCH ALL RECORDS ENDPOINT
     * --------------------------------------------------------------------
     *
     * Endpoint:
     *      GET /api/all
     *
     * Description:
     *      Retrieves all records currently stored in the database.
     *
     * Engine Command:
     *      all
     *
     * Returns:
     *      Raw list of records formatted by the C++ engine.
     */
    @GetMapping("/all")
    public String getAllData() {
        return engineService.executeCommand("all");
    }


    /**
     * --------------------------------------------------------------------
     * SEARCH RECORD ENDPOINT
     * --------------------------------------------------------------------
     *
     * Endpoint:
     *      GET /api/search?id=1
     *
     * Description:
     *      Searches for a record using its unique ID.
     *
     * Request Parameters:
     *      id → record identifier
     *
     * Engine Command Format:
     *      search,id
     *
     * Example:
     *      search,1
     *
     * Returns:
     *      Record details if found, otherwise an error/empty response.
     */
    @GetMapping("/search")
    public String search(@RequestParam int id) {
        return engineService.executeCommand("search," + id);
    }


    /**
     * --------------------------------------------------------------------
     * DELETE RECORD ENDPOINT
     * --------------------------------------------------------------------
     *
     * Endpoint:
     *      GET /api/delete?id=1
     *
     * Description:
     *      Deletes a record from the database by ID.
     *
     * Request Parameters:
     *      id → record identifier
     *
     * Engine Command Format:
     *      delete,id
     *
     * Example:
     *      delete,1
     *
     * Returns:
     *      Execution result from the database engine.
     */
    @GetMapping("/delete")
    public String deleteData(@RequestParam int id) {
        return engineService.executeCommand("delete," + id);
    }


    /**
     * --------------------------------------------------------------------
     * QUERY ANALYTICS ENDPOINT
     * --------------------------------------------------------------------
     *
     * Endpoint:
     *      GET /api/logs
     *
     * Description:
     *      Provides analytics data about executed queries.
     *      This endpoint is used by the Analytics Dashboard
     *      to display performance insights.
     *
     * Data Provided:
     *
     * 1. totalQueries
     *      Total number of queries executed in the session.
     *
     * 2. successRate
     *      Percentage of successful queries.
     *
     * 3. avgExecTime
     *      Average execution time in milliseconds.
     *
     * 4. typeCounts
     *      Count of each query type:
     *          INSERT
     *          SEARCH
     *          DELETE
     *          ALL
     *
     * 5. recentLogs
     *      Last 20 executed queries used for timeline graphs.
     *
     * Response Format:
     *
     * {
     *   totalQueries: 25,
     *   successRate: 96.0,
     *   avgExecTime: 213.4,
     *   typeCounts: { INSERT:10, SEARCH:8, DELETE:4, ALL:3 },
     *   recentLogs: [...]
     * }
     *
     * Returns:
     *      JSON response containing aggregated query statistics.
     */
    @GetMapping("/logs")
    public Map<String, Object> getLogs() {

        // Retrieve in-memory query logs from the QueryLogger component
        List<QueryLog> logs = engineService.getQueryLogger().getSessionLogs();

        // Map to store count of each query type
        Map<String, Integer> typeCounts = new HashMap<>();
        typeCounts.put("INSERT", 0);
        typeCounts.put("SEARCH", 0);
        typeCounts.put("DELETE", 0);
        typeCounts.put("ALL",    0);

        long totalTime  = 0;      // Total execution time of all queries
        int  successful = 0;      // Number of successful queries

        // Iterate through logs and compute statistics
        for (QueryLog log : logs) {
            String type = log.getType().toString();

            typeCounts.put(type, typeCounts.getOrDefault(type, 0) + 1);

            totalTime += log.getExecutionTimeMs();

            if (log.isSuccess()) successful++;
        }

        // Construct JSON response
        Map<String, Object> response = new HashMap<>();

        response.put("totalQueries", logs.size());

        response.put("successRate",
                logs.isEmpty() ? 0 :
                (successful * 100.0 / logs.size()));

        response.put("avgExecTime",
                logs.isEmpty() ? 0 :
                (totalTime * 1.0 / logs.size()));

        response.put("typeCounts", typeCounts);

        // Extract last 20 logs for timeline visualization
        List<QueryLog> recent =
                logs.size() > 20
                ? logs.subList(logs.size() - 20, logs.size())
                : logs;

        // Convert logs into simplified JSON objects
        response.put("recentLogs", recent.stream().map(l -> {

            Map<String, Object> m = new HashMap<>();

            m.put("type",    l.getType().toString());
            m.put("ms",      l.getExecutionTimeMs());
            m.put("success", l.isSuccess());

            return m;

        }).toList());

        return response;
    }
}