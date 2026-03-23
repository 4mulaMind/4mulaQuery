package com.formulaquery.api; // FIX 1: '.api' add kar diya kyunki file api folder mein hai

import java.io.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    // FIX 2: Docker ke hisab se engine path. Dockerfile mein 'core' copy kiya tha na?
    private static final String ENGINE_PATH = "./core/4mulaQuery"; 

    @GetMapping("/all")
    public String getAllData() {
        return executeCommand("select");
    }

    @GetMapping("/insert")
    public String insertData(@RequestParam int id, @RequestParam String name, @RequestParam String email) {
        String cmd = "insert " + id + " " + name + " " + email;
        return executeCommand(cmd);
    }

    private String executeCommand(String cmd) {
        StringBuilder output = new StringBuilder();
        try {
            // Path check: Kya 'core' folder bahar hai? Agar haan toh ye sahi hai.
            ProcessBuilder pb = new ProcessBuilder(ENGINE_PATH);
            pb.redirectErrorStream(true); // Isse error logs bhi dikhenge
            Process process = pb.start();
            
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            writer.write(cmd + "\nexit\n");
            writer.flush();
            writer.close();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // Thoda zyada output lete hain taaki debugging asaan ho
                if (!line.trim().isEmpty()) {
                    output.append(line).append("<br>");
                }
            }
        } catch (Exception e) {
            return "Error calling C++ engine: " + e.getMessage();
        }
        return output.length() > 0 ? output.toString() : "No response from engine.";
    }
}