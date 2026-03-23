package com.formulaquery

import java.io.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")

public class ApiController {

    private static final String ENGINE_PATH = "../4mulaQuery";

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
            Process process = new ProcessBuilder(ENGINE_PATH).start();
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            writer.write(cmd + "\nexit\n");
            writer.flush();
            writer.close();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // User-friendly output ke liye tags
                if (line.startsWith("ID:") || line.startsWith("Success:") || line.startsWith("Result:")) {
                    output.append(line).append("<br>");
                }
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
        return output.toString();
    }
}