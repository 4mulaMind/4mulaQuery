
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
import java.io.IOException;
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
    public String executeCommand(String command) {
        StringBuilder output = new StringBuilder();

        try {
            // 1. Spawning the C++ Process
            Process process = Runtime.getRuntime().exec(enginePath);

            // 2. Writing to C++ stdin (Standard Input)
            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(command);
                writer.newLine(); // Simulating 'Enter' key
                writer.flush();
            }

            // 3. Reading from C++ stdout (Standard Output)
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // 4. Waiting for process to finish
            process.waitFor();

        } catch (IOException | InterruptedException e) {
            // Agar process interrupt ho jaye toh status restore karna best practice hai
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return "> Bridge Error: Critical communication failure.\n" + e.getMessage();
        }
        return output.toString();
    }
};