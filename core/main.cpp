#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <cstdio>
#include <algorithm>
#include "pager.h"
#include "common.h"

int main() {

    // Database pager initialize
    Pager db("4mulaQuery.db");

    uint32_t row_count = 0;
    Row temp;

    // Existing rows count load karo
    while (db.read_row(&temp, row_count))
        row_count++;


    std::string line;

    // Command line input loop
    while (std::getline(std::cin, line)) {

        // Line ke end se extra spaces aur \r remove karo
        line.erase(line.find_last_not_of(" \n\r\t") + 1);

        // Empty line ya exit command par program stop
        if (line.empty() || line == "exit")
            break;

        std::stringstream ss(line);
        std::string command;

        // Command parsing
        // Agar comma present hai to comma se split karo
        if (line.find(',') != std::string::npos) {
            std::getline(ss, command, ',');
        }
        else {
            ss >> command;
        }


        // INSERT COMMAND
        if (command == "insert") {

            Row row;
            std::string id_str, name, email;

            // ID, name aur email ko comma se parse karo
            if (std::getline(ss, id_str, ',') &&
                std::getline(ss, name, ',') &&
                std::getline(ss, email, ',')) {

                try {

                    // String ID ko integer mein convert
                    row.id = std::stoi(id_str);

                    // Username copy into fixed char array
                    snprintf(row.username, USERNAME_SIZE, "%s", name.c_str());

                    // Email copy into fixed char array
                    snprintf(row.email, EMAIL_SIZE, "%s", email.c_str());

                    // Row ko disk par write karo
                    db.write_row(&row, row_count++);

                    // Java API ko success signal
                    std::cout << "Executed.\n" << std::flush;

                }
                catch (...) {

                    std::cout << "Error: Invalid ID format\n" << std::flush;
                }
            }
        }


        // SELECT / ALL COMMAND
        else if (command == "select" || command == "all") {

            Row r;

            // Agar database empty ho
            if (row_count == 0) {

                std::cout << "Database is empty.\n" << std::flush;
            }
            else {

                // Har row read karke print karo
                for (uint32_t i = 0; i < row_count; i++) {

                    if (db.read_row(&r, i)) {

                        std::cout << r.id << "," 
                                  << r.username << "," 
                                  << r.email << "\n"
                                  << std::flush;
                    }
                }
            }
        }


        // SEARCH COMMAND
        else if (command == "search") {

            std::string s_id;

            if (std::getline(ss, s_id, ',')) {

                try {

                    uint32_t search_id = std::stoi(s_id);

                    Row r;
                    bool found = false;

                    // Row by row search
                    for (uint32_t i = 0; i < row_count; i++) {

                        if (db.read_row(&r, i) && r.id == search_id) {

                            std::cout << r.id << ","
                                      << r.username << ","
                                      << r.email << "\n"
                                      << std::flush;

                            found = true;
                            break;
                        }
                    }

                    // Agar record na mile
                    if (!found)

                        std::cout << "ID "
                                  << search_id
                                  << " Not Found.\n"
                                  << std::flush;
                }
                catch (...) {

                    std::cout << "Error: Search ID format\n"
                              << std::flush;
                }
            }
        }
    }

    return 0;
}