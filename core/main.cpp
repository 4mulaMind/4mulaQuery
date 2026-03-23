#include <iostream>
#include <string>
#include <sstream> // String todne ke liye
#include "pager.h"

int main() {
    Pager db("4mulaQuery.db");
    uint32_t row_count = 0;
    Row temp;
    while(db.read_row(&temp, row_count)) row_count++;

    std::string line;
    // Har line ko read karo jo Java se aa rahi hai
    while (std::getline(std::cin, line)) {
        if (line == "exit") break;

        std::stringstream ss(line);
        std::string command;
        ss >> command; // Pehla word (insert/select/delete)

        if (command == "insert") {
            Row row;
            // ss se baaki ka data nikal lo: ID, User, Email
            if (ss >> row.id >> row.username >> row.email) {
                db.write_row(&row, row_count++);
                std::cout << "Executed.\n"; 
            }
        } 
        // ... purana code (insert aur select wala) ...

        else if (command == "select" || command == "all") {
            // Aapka purana select wala logic yahan rahega
        }
        else if (command == "search") {
            uint32_t search_id;
            ss >> search_id;
            Row r;
            bool found = false;
            for (uint32_t i = 0; i < row_count; i++) {
                if (db.read_row(&r, i) && r.id == search_id) {
                    std::cout << r.id << " | " << r.username << " | " << r.email << "\n";
                    found = true;
                    break;
                }
            }
            if(!found) std::cout << "ID " << search_id << " Not Found.\n";
        }
        else if (command == "delete") {
            // Abhi ke liye sirf message de do (Delete logic database file handle karne par depend karta hai)
            std::cout << "Delete command received. Logic not implemented in B-Tree yet.\n";
        }
        else {
            std::cout << "Unknown: " << command << "\n";
        }
    }
    return 0;
}