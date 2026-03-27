
/*
============================================================
4mulaQuery - Engine Process Service (The Bridge)
============================================================

File Location: 
/src/main/java/com/formulaquery/api/EngineService.java

Purpose:
The low-level execution bridge that spawns the C++ Kernel 
as a sub-process, manages I/O streams, and captures 
database responses.

Features:
• Native Process Management
• Stream Redirection (Input/Output)
• Automatic Resource Cleanup

Developed by: Abdul Qadir
============================================================
*/

package com.formulaquery.api;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

/**
 * ====================================================
 * CLASS: EngineService
 * ====================================================
 * Acts as the 'Nervous System' of the application. 
 * It takes high-level commands and pipes them into 
 * the C++ binary for execution.
 * ====================================================
 */
public class EngineService {

    private final String enginePath;

    public EngineService(String enginePath) {
        this.enginePath = enginePath;
    }

    /**
     * ----------------------------------------------------
     * METHOD: executeCommand()
     * ----------------------------------------------------
     * Spawns a new C++ process, sends the command, 
     * and reads the result.
     * ----------------------------------------------------
     * @param command The CSV formatted instruction
     * @return String output from the C++ Kernel
     */
    /**
 * Executes a command on the C++ engine via ProcessBuilder.
 * 
 * @param command The command string (e.g., insert, search, delete)
 * @return The output from the C++ engine or error message if failed
 */
    public String executeCommand(String command) {
        StringBuilder output = new StringBuilder();

        try {
            // ProcessBuilder: C++ engine ko run karne ke liye
            // enginePath = path to the compiled C++ binary
            ProcessBuilder pb = new ProcessBuilder(enginePath);

            // Redirect error stream to standard output
            // Taaki C++ errors bhi output me dikh sake
            pb.redirectErrorStream(true);

            // Start the C++ engine process
            Process process = pb.start();

            // -------------------------
            // 1️⃣ Write command to engine
            // -------------------------
            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(command);
                writer.newLine();
                writer.flush();
            }

            // -------------------------
            // 2️⃣ Read output from engine
            // -------------------------
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // Wait for the process to finish
            process.waitFor();

        } catch (Exception e) {
            // Agar koi exception aaya to return kar do error message
            return "> Bridge Error: " + e.getMessage();
        }

        // Return the output from C++ engine
        return output.toString();
    }
};