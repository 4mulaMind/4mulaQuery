#include <iostream>
#include <string>
#include "pager.h"

void print_prompt() { std::cout << "4mula > "; }

int main() {
    Pager db("4mula.db");
    uint32_t row_count = 0;
    
    // Check current row count from file size
    Row temp;
    while(db.read_row(&temp, row_count)) row_count++;

    std::cout << "Welcome to 4mulaQuery v1.0\n";
    std::cout << "Connected to 4mula.db (" << row_count << " rows found)\n";

    std::string input;
    while (true) {
        print_prompt();
        std::getline(std::cin, input);

        if (input == "exit") {
            break;
        } else if (input == "insert") {
            Row row;
            std::cout << "ID: "; std::cin >> row.id;
            std::cin.ignore(USERNAME_SIZE, '\n'); 
            std::cout << "User: "; std::cin.getline(row.username, USERNAME_SIZE);
            std::cout << "Email: "; std::cin.getline(row.email, EMAIL_SIZE);
            
            db.write_row(&row, row_count++);
            std::cout << "Executed.\n";
        } else if (input == "select") {
            Row r;
            for (uint32_t i = 0; i < row_count; i++) {
                if (db.read_row(&r, i)) {
                    std::cout << "(" << r.id << ", " << r.username << ", " << r.email << ")\n";
                }
            }
        } else {
            std::cout << "Unrecognized command: " << input << "\n";
        }
    }
    return 0;
}