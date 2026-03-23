package com.formulaquery.api; 

import java.io.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    // Engine ka path jo Dockerfile mein set kiya hai
    private static final String ENGINE_PATH = "core/4mulaQuery";

    @GetMapping("/all")
    public String getAllData() {
        // 'display' ko badal kar 'select' kar do kyunki C++ 'select' samajhta hai
        return executeCommand("select"); 
    }

    @GetMapping("/insert")
    public String insertData(@RequestParam int id, @RequestParam String name, @RequestParam String email) {
        String cmd = "insert " + id + " " + name + " " + email;
        return executeCommand(cmd);
    }

    // FIX: Yahan pehle 'runEngine' likha tha, maine use 'executeCommand' kar diya hai
    @GetMapping("/delete")
    public String delete(@RequestParam int id) {
        return executeCommand("delete " + id);
    }

    // FIX: Yahan bhi 'runEngine' ki jagah 'executeCommand' kar diya hai
    @GetMapping("/search")
    public String search(@RequestParam int id) {
        return executeCommand("search " + id);
    }

    // ⭐ Ye wo MAIN function hai jise Java dhoond raha tha
    private String executeCommand(String cmd) {
        StringBuilder output = new StringBuilder();
        try {
            // C++ engine binary ko start karna
            ProcessBuilder pb = new ProcessBuilder(ENGINE_PATH);
            pb.redirectErrorStream(true); 
            Process process = pb.start();
            
            // Engine ko command bhejna
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            writer.write(cmd + "\nexit\n"); // Command ke baad engine band karne ke liye exit
            writer.flush();
            writer.close();

            // Engine se output wapas lena
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    output.append(line).append("\n");
                }
            }
            process.waitFor(); 
        } catch (Exception e) {
            // Agar file nahi mili ya engine nahi chala toh yahan error dikhega
            return "Error calling C++ engine: " + e.getMessage();
        }
        return output.length() > 0 ? output.toString() : "No response from engine.";
    }
}