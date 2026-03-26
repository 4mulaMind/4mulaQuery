#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <cstdio>
#include "pager.h"
#include "common.h"

// Main function jahan se program execution start hota hai
int main() {

    Pager db("4mulaQuery.db");
    // Pager object create kiya gaya hai jo database file ko manage karega

    uint32_t row_count = 0;
    // Database mein kitni rows stored hain uska count

    Row temp;
    // Temporary row structure jo existing data read karne ke liye use hoga


    // Database se existing rows count load karna
    while(db.read_row(&temp, row_count))
        row_count++;


    std::string line;

    // User input continuously read karna
    while (std::getline(std::cin, line)) {

        if (line.empty() || line == "exit")
            break;
        // Agar input empty ho ya "exit" ho to program band


        std::stringstream ss(line);
        // Input string ko parse karne ke liye stringstream

        std::string command;

        // Command ko comma ke basis par parse karna
        if (!std::getline(ss, command, ','))
            continue;


        // INSERT COMMAND
        if (command == "insert") {

            Row row;
            // Nayi row create

            std::string id_str, name, email;

            // id, username aur email ko parse karna
            if (std::getline(ss, id_str, ',') &&
                std::getline(ss, name, ',') &&
                std::getline(ss, email, ',')) {

                try {

                    row.id = std::stoi(id_str);
                    // String id ko integer mein convert karna

                    snprintf(row.username, USERNAME_SIZE, "%s", name.c_str());
                    // Username ko fixed size char array mein store karna

                    snprintf(row.email, EMAIL_SIZE, "%s", email.c_str());
                    // Email ko fixed size char array mein store karna

                    db.write_row(&row, row_count++);
                    // Row ko database mein write karna

                    std::cout << "Executed.\n";

                } catch (...) {

                    std::cout << "Error: ID format\n";
                    // Agar ID integer na ho to error
                }
            }
        }


        // SELECT / ALL COMMAND
        else if (command == "select" || command == "all") {

            Row r;

            // Saari rows database se read karke print karna
            for (uint32_t i = 0; i < row_count; i++) {

                if (db.read_row(&r, i)) {

                    std::cout << r.id << "," << r.username << "," << r.email << "\n";
                }
            }
        }


        // SEARCH COMMAND
        else if (command == "search") {

            std::string search_id_str;

            if (std::getline(ss, search_id_str, ',')) {

                uint32_t search_id = std::stoi(search_id_str);
                // Search ID ko integer mein convert

                Row r;
                bool found = false;

                // Har row check karna
                for (uint32_t i = 0; i < row_count; i++) {

                    if (db.read_row(&r, i) && r.id == search_id) {

                        std::cout << r.id << "," << r.username << "," << r.email << "\n";
                        found = true;
                        break;
                    }
                }

                if(!found)
                    std::cout << "ID " << search_id << " Not Found.\n";
                // Agar ID na mile
            }
        }


        // DELETE COMMAND (Future Feature)
        else if (command == "delete") {

            std::cout << "Delete coming soon in B-Tree update.\n";
            // Future mein B-Tree indexing ke saath delete implement hoga
        }
    }

    return 0;
}