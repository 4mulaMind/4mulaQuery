package com.formulaquery.api;

import java.io.BufferedReader;                     // Input/Output streams ke liye
import java.io.BufferedWriter;  // REST API annotations
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController                      // Ye class REST API controller hai
@RequestMapping("/api")              // Sab endpoints ka base URL /api hoga
public class ApiController {

    // Engine ka path jaha C++ database engine compiled hai
    // Render ya server environment ke liye relative path use kiya gaya hai
    private static final String ENGINE_PATH = "./core/4mulaQuery";

    // ---------------------------------------------
    // INSERT API
    // Example: /api/insert?id=1&name=Abdul&email=test@test.com
    // ---------------------------------------------
    @GetMapping("/insert")
    public String insertData(@RequestParam int id,
                             @RequestParam String name,
                             @RequestParam String email) {

        // Engine ko command format bhej rahe hain
        // insert,1,Abdul,test@test.com
        return executeCommand("insert," + id + "," + name + "," + email);
    }

    // ---------------------------------------------
    // GET ALL DATA API
    // Example: /api/all
    // ---------------------------------------------
    @GetMapping("/all")
    public String getAllData() {

        // Engine command jo sab rows return karega
        return executeCommand("all,");
    }

    // ---------------------------------------------
    // SEARCH BY ID API
    // Example: /api/search?id=5
    // ---------------------------------------------
    @GetMapping("/search")
    public String search(@RequestParam int id) {

        // Engine ko search command bhej rahe hain
        return executeCommand("search," + id);
    }
    // ---------------------------------------------
    // DELETE BY ID API
    // Example: /api/delete?id=5
    // --------------------------------------------- 
    @GetMapping("/delete")
    public String deleteData(@RequestParam int id) {
        // Abhi ke liye engine ko sirf message bhej rahe hain
        return executeCommand("delete," + id + ",");
    }

    // ---------------------------------------------
    // CORE METHOD
    // Ye function C++ database engine ko run karta hai
    // aur usko command send karta hai
    // ---------------------------------------------
    private String executeCommand(String cmd) {

        StringBuilder output = new StringBuilder();

        try {

            // ProcessBuilder C++ executable run karega
            ProcessBuilder pb = new ProcessBuilder(ENGINE_PATH);

            // Engine ke errors bhi output stream me merge ho jayenge
            pb.redirectErrorStream(true);

            // Engine process start
            Process process = pb.start();

            // Engine ko command bhejna
            BufferedWriter writer =
                    new BufferedWriter(
                            new OutputStreamWriter(process.getOutputStream()));

            // Command send
            writer.write(cmd + "\nexit\n");
            writer.flush();
            writer.close();

            // Engine ka output read karna
            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(process.getInputStream()));

            String line;

            // Engine ke response ko line by line read karna
            while ((line = reader.readLine()) != null) {

                // Debug ke liye console me print
                System.out.println("Engine Say: " + line);

                // Empty lines ignore
                if (!line.trim().isEmpty()) {
                    output.append(line).append("\n");
                }
            }

            // Process finish hone ka wait
            int exitCode = process.waitFor();

            // Agar process error code ke saath exit hua
            if (exitCode != 0) {
                return "Engine Error: Process exited with code "
                        + exitCode + "\n" + output.toString();
            }

        } catch (Exception e) {

            // Java side error handling
            return "Java Side Error: " + e.getMessage();
        }

        // Agar output mila to return karo
        return output.length() > 0
                ? output.toString()
                : "No response from engine.";
    }
}