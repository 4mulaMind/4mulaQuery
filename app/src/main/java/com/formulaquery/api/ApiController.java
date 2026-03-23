package com.formulaquery.api; 

import java.io.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    // Engine ka binary path
    private static final String ENGINE_PATH = "core/4mulaQuery";

    @GetMapping("/all")
    public String getAllData() {
        // C++ engine ab getline(ss, cmd, ',') use kar raha hai
        // Isliye 'all,' bhej rahe hain (comma zaroori hai)
        return executeCommand("all,"); 
    }

    @GetMapping("/insert")
    public String insertData(@RequestParam int id, @RequestParam String name, @RequestParam String email) {
        // ⭐ BIG FIX: Spaces ko Comma (,) se replace kiya
        // Format: insert,1,Abdul Qadir,email@test.com
        String cmd = "insert," + id + "," + name + "," + email;
        return executeCommand(cmd);
    }

    @GetMapping("/delete")
    public String delete(@RequestParam int id) {
        // Delete ke liye bhi comma format: delete,1
        return executeCommand("delete," + id);
    }

    @GetMapping("/search")
    public String search(@RequestParam int id) {
        // Search ke liye: search,1
        return executeCommand("search," + id);
    }

    // ⭐ MAIN function: Java ko C++ se jod raha hai
    private String executeCommand(String cmd) {
        StringBuilder output = new StringBuilder();
        try {
            // C++ Engine process start karna
            ProcessBuilder pb = new ProcessBuilder(ENGINE_PATH);
            pb.redirectErrorStream(true); 
            Process process = pb.start();
            
            // Engine ke 'stdin' mein command likhna
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            
            // Command ke baad 'exit' bhej rahe hain taaki engine kaam karke band ho jaye
            writer.write(cmd + "\nexit\n"); 
            writer.flush();
            writer.close();

            // Engine ka 'cout' (output) read karna
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // Faltu ki empty lines ya "Executed" message ko filter karna
                if (!line.trim().isEmpty() && !line.contains("Executed")) {
                    output.append(line).append("\n");
                }
            }
            process.waitFor(); 
        } catch (Exception e) {
            return "Error calling C++ engine: " + e.getMessage();
        }
        
        // Output clean karke frontend ko dena
        return output.length() > 0 ? output.toString() : "Success (Database updated)";
    }
}