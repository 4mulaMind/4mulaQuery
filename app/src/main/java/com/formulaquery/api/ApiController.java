package com.formulaquery.api;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Ye Spring Boot REST Controller hai jo 4mulaQuery engine ko HTTP API se connect karta hai
@RestController
@RequestMapping("/api")
public class ApiController {

    private static final String ENGINE_PATH = "core/4mulaQuery";
    // Ye path hai jahan C++ database engine executable located hai

    
    @GetMapping("/insert")
    public String insertData(@RequestParam int id, @RequestParam String name, @RequestParam String email) {

        // Client se id, name aur email receive kiya jata hai
        // Command ko engine ke expected format mein convert kiya jata hai
        // Example command: insert,1,Abdul Qadir,email@test.com

        return executeCommand("insert," + id + "," + name + "," + email);
    }


    @GetMapping("/all")
    public String getAllData() {

        // Ye API database ki saari rows fetch karegi
        // Engine ko "all," command send kiya jata hai

        return executeCommand("all,");
    }


    @GetMapping("/search")
    public String search(@RequestParam int id) {

        // Ye API specific ID ke record ko search karegi
        // Example command: search,1

        return executeCommand("search," + id);
    }


    private String executeCommand(String cmd) {

        // Ye method C++ database engine ko command execute karne ke liye call karta hai

        StringBuilder output = new StringBuilder();

        try {

            Process process = new ProcessBuilder(ENGINE_PATH).start();
            // Engine executable ko start kiya jata hai

            BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream()));

            writer.write(cmd + "\nexit\n");
            // Command engine ko send ki jati hai
            // exit command engine ko terminate karne ke liye

            writer.flush();
            writer.close();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));

            String line;

            // Engine se output read kiya jata hai
            while ((line = reader.readLine()) != null) {

                if (!line.trim().isEmpty() && !line.contains("Executed")) {

                    output.append(line).append("\n");
                    // Useful output ko response mein add kiya jata hai
                }
            }

            process.waitFor();
            // Process ke complete hone ka wait

        } catch (Exception e) {

            return "Error: " + e.getMessage();
            // Agar koi error aaye to error message return
        }

        // Agar output empty hai to default message return
        return output.length() > 0 ? output.toString() : "No response from engine.";
    }
}