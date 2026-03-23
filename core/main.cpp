#include <iostream>
#include <string>
#include <sstream> 
#include <vector>
#include <cstdio>  // snprintf ke liye zaroori hai
#include "pager.h"
#include "common.h" // Row structure aur sizes ke liye (USERNAME_SIZE etc.)

int main() {
    // 1. Database file initialize kar rahe hain
    Pager db("4mulaQuery.db");
    uint32_t row_count = 0;
    Row temp;

    // 2. Database mein kitni rows pehle se hain, wo ginn lo
    // Ye isliye zaroori hai taaki naya data file ke end mein jud sake
    while(db.read_row(&temp, row_count)) row_count++;

    std::string line;
    // 3. Loop: Jab tak user/Java se commands aa rahi hain
    while (std::getline(std::cin, line)) {
        if (line.empty() || line == "exit") break;

        std::stringstream ss(line);
        std::string command;
        
        // Pehla word nikal rahe hain (comma tak) e.g., "insert"
        std::getline(ss, command, ','); 

        // --- INSERT LOGIC: format -> insert,1,Abdul Qadir,email@test.com ---
        if (command == "insert") {
            Row row;
            std::string id_str, name, email;

            // Comma separator use karke data split kar rahe hain
            // Isse name mein space hone par bhi wo pura 'name' variable mein aayega
            if (std::getline(ss, id_str, ',') && 
                std::getline(ss, name, ',') && 
                std::getline(ss, email, ',')) {
                
                try {
                    row.id = std::stoi(id_str); // ID string ko number mein badla
                    
                    // common.h ke sizes (USERNAME_SIZE, EMAIL_SIZE) use karke safe copy
                    // snprintf se buffer overflow ka khatra nahi rehta
                    snprintf(row.username, USERNAME_SIZE, "%s", name.c_str());
                    snprintf(row.email, EMAIL_SIZE, "%s", email.c_str());

                    // Disk par data write kar diya
                    db.write_row(&row, row_count++);
                    std::cout << "Executed.\n"; 
                } catch (...) {
                    std::cout << "Error: ID must be a number.\n";
                }
            } else {
                std::cout << "Error: Invalid Format. Use: insert,id,name,email\n";
            }
        } 

        // --- SELECT/ALL LOGIC: Poora data UI ko dikhane ke liye ---
        else if (command == "select" || command == "all") {
            Row r;
            for (uint32_t i = 0; i < row_count; i++) {
                if (db.read_row(&r, i)) {
                    // Output bhi comma mein de rahe hain taaki HTML isey split kar sake
                    std::cout << r.id << "," << r.username << "," << r.email << "\n";
                }
            }
        }

        // --- SEARCH LOGIC: search,1 ---
        else if (command == "search") {
            std::string search_id_str;
            if(std::getline(ss, search_id_str, ',')) {
                uint32_t search_id = std::stoi(search_id_str);
                Row r;
                bool found = false;
                for (uint32_t i = 0; i < row_count; i++) {
                    if (db.read_row(&r, i) && r.id == search_id) {
                        std::cout << r.id << "," << r.username << "," << r.email << "\n";
                        found = true;
                        break;
                    }
                }
                if(!found) std::cout << "ID " << search_id << " Not Found.\n";
            }
        }

        // --- DELETE LOGIC: Abhi sirf message placeholder hai ---
        else if (command == "delete") {
            std::cout << "Delete command received. Logic implementation pending.\n";
        }

        // --- AGAR COMMAND GALAT HAI ---
        else {
            if(!command.empty()) std::cout << "Unknown Command: " << command << "\n";
        }
    }
    return 0;
}