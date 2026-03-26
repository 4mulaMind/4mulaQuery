/*
============================================================
4mulaQuery - High-Performance Database Engine
============================================================

File Location: 
/core/main.cpp

Purpose:
Primary execution kernel for 4mulaQuery. Orchestrates 
Input/Output operations, CSV parsing, and record lifecycle 
management (CRUD).

Architecture:
• Command Dispatcher Pattern
• Persistent Disk Storage (via Pager)
• Automated Row Serialization

Developed by: Abdul Qadir
============================================================
*/

#include <iostream>
#include <string>
#include <sstream>
#include <cstdio>
#include <vector>

#include "pager.h"
#include "common.h"

/**
 * ====================================================
 * CLASS: DatabaseEngine
 * ====================================================
 * Manages the high-level logic for data persistence.
 * Acts as the interface between Raw Disk Pages and 
 * the Application Layer.
 * ====================================================
 */
class DatabaseEngine {

private:
    Pager db;             // Disk I/O Handler
    uint32_t row_count;   // Runtime cache of total records

public:
    /**
     * ----------------------------------------------------
     * CONSTRUCTOR: DatabaseEngine()
     * ----------------------------------------------------
     * Automatically syncs with the physical .db file 
     * upon initialization.
     * ----------------------------------------------------
     */
    DatabaseEngine() : db("./4mulaQuery.db"), row_count(0) {
        Row temp;
        // Scan the binary file to recover the row count
        while (db.read_row(&temp, row_count)) {
            row_count++;
        }
    }

    /**
     * ----------------------------------------------------
     * METHOD: handleInsert()
     * ----------------------------------------------------
     * COMMAND: insert,id,name,email
     * Logic: Parses CSV input, converts types, and commits
     * the binary structure to disk.
     * ----------------------------------------------------
     */
    void handleInsert(std::stringstream &ss) {
        Row row;
        std::string id_str, name, email;

        if (std::getline(ss, id_str, ',') && 
            std::getline(ss, name, ',')   && 
            std::getline(ss, email, ',')) {

            try {
                row.id = std::stoi(id_str);
                
                // Safe buffer copying to prevent overflow
                snprintf(row.username, USERNAME_SIZE, "%s", name.c_str());
                snprintf(row.email, EMAIL_SIZE, "%s", email.c_str());

                db.write_row(&row, row_count++);
                std::cout << "Executed.\n" << std::flush;
            } catch (...) {
                std::cout << "Error: Invalid ID format\n" << std::flush;
            }
        }
    }

    /**
     * ----------------------------------------------------
     * METHOD: handleSelect()
     * ----------------------------------------------------
     * Logic: Scans all pages and streams record data
     * back to the console in CSV format.
     * ----------------------------------------------------
     */
    void handleSelect() {
        if (row_count == 0) {
            std::cout << "Database is empty.\n" << std::flush;
            return;
        }

        Row r;
        for (uint32_t i = 0; i < row_count; i++) {
            if (db.read_row(&r, i)) {
                std::cout << r.id << "," << r.username << "," << r.email << "\n" << std::flush;
            }
        }
    }

    /**
     * ----------------------------------------------------
     * METHOD: handleSearch()
     * ----------------------------------------------------
     * COMMAND: search,id
     * Logic: Linear search through the data pages.
     * ----------------------------------------------------
     */
    void handleSearch(std::stringstream &ss) {
        std::string s_id;
        if (std::getline(ss, s_id, ',')) {
            try {
                uint32_t search_id = std::stoi(s_id);
                Row r;
                bool found = false;

                for (uint32_t i = 0; i < row_count; i++) {
                    if (db.read_row(&r, i) && r.id == search_id) {
                        std::cout << r.id << "," << r.username << "," << r.email << "\n" << std::flush;
                        found = true;
                        break;
                    }
                }
                if (!found) std::cout << "ID " << search_id << " Not Found.\n" << std::flush;
            } catch (...) {
                std::cout << "Error: Search ID format\n" << std::flush;
            }
        }
    }

    /**
     * ----------------------------------------------------
     * METHOD: handleDelete()
     * ----------------------------------------------------
     * COMMAND: delete,id
     * Logic: Performs a "Filter & Rebuild" operation to 
     * maintain data integrity on disk.
     * ----------------------------------------------------
     */
    void handleDelete(std::stringstream &ss) {
        std::string s_id;
        if (std::getline(ss, s_id, ',')) {
            try {
                uint32_t delete_id = std::stoi(s_id);
                std::vector<Row> remaining_rows;
                Row r;
                bool found = false;

                // Step 1: Collect survivors
                for (uint32_t i = 0; i < row_count; i++) {
                    if (db.read_row(&r, i)) {
                        if (r.id != delete_id) remaining_rows.push_back(r);
                        else found = true;
                    }
                }

                // Step 2: Rewrite database if ID was found
                if (found) {
                    for (uint32_t i = 0; i < remaining_rows.size(); i++) {
                        db.write_row(&remaining_rows[i], i);
                    }
                    row_count = remaining_rows.size();
                    std::cout << "Deleted ID " << delete_id << ".\n" << std::flush;
                } else {
                    std::cout << "ID " << delete_id << " Not Found.\n" << std::flush;
                }
            } catch (...) {
                std::cout << "Error: Delete ID format\n" << std::flush;
            }
        }
    }

    /**
     * ----------------------------------------------------
     * METHOD: run()
     * ----------------------------------------------------
     * Main Command Dispatcher loop. Interprets signals
     * from the Spring Boot bridge.
     * ----------------------------------------------------
     */
    void run() {
        std::string line;
        while (std::getline(std::cin, line)) {
            // Trim whitespace and escape characters
            line.erase(line.find_last_not_of(" \n\r\t") + 1);

            if (line.empty() || line == "exit") break;

            std::stringstream ss(line);
            std::string command;

            // Resolve CSV or Single-word command
            if (line.find(',') != std::string::npos) std::getline(ss, command, ',');
            else ss >> command;

            /* Router Logic */
            if (command == "insert") handleInsert(ss);
            else if (command == "select" || command == "all") handleSelect();
            else if (command == "search") handleSearch(ss);
            else if (command == "delete") handleDelete(ss);

            // Exit after one cycle for synchronized Java-to-C++ response
            break; 
        }
    }
};

/**
 * ====================================================
 * GLOBAL ENTRY POINT
 * ====================================================
 */
int main() {
    DatabaseEngine engine;
    engine.run();
    return 0;
}