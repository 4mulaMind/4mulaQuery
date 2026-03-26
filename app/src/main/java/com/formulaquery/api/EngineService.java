package com.formulaquery.api;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

/*
    EngineService
    ----------------
    Ye C++ database engine ke liye abstraction layer hai
*/
public class EngineService {

    private final String enginePath;

    public EngineService(String enginePath) {
        this.enginePath = enginePath;
    }

    public String executeCommand(String command) {

        StringBuilder output = new StringBuilder();

        try {
            ProcessBuilder pb = new ProcessBuilder(enginePath);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(command + "\nexit\n");
                writer.flush();
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("Engine Say: " + line);
                    if (!line.trim().isEmpty()) output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0)
                return "Engine Error: Process exited with code " + exitCode + "\n" + output.toString();

        } catch (Exception e) {
            return "Java Side Error: " + e.getMessage();
        }

        return output.length() > 0 ? output.toString() : "No response from engine.";
    }
}