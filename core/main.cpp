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
        else if (command == "select" || command == "all") {
            Row r;
            for (uint32_t i = 0; i < row_count; i++) {
                if (db.read_row(&r, i)) {
                    // Seedha format rakho taaki HTML table parse kar sake
                    std::cout << r.id << " | " << r.username << " | " << r.email << "\n";
                }
            }
        }
        else {
            // Agar kuch aur type kiya
            std::cout << "Unknown: " << command << "\n";
        }
    }
    return 0;
}