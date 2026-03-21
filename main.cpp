#include <iostream>
#include "pager.h"

void print_row(Row* row) {
    std::cout << "(" << row->id << ", " << row->username << ", " << row->email << ")" << std::endl;
}

int main() {
    Pager db("4mula.db");
    int choice;
    uint32_t current_row_count = 0;

    // Startup check: Purana data kitna hai, wahan se ginti shuru karo
    Row temp_check;
    while(db.read_row(&temp_check, current_row_count)) {
        current_row_count++;
    }

    while (true) {
        std::cout << "\n4mulaQuery > 1.Insert  2.SelectAll  3.Exit: ";
        if (!(std::cin >> choice)) break;

        if (choice == 1) {
            Row row;
            std::cout << "Enter ID: "; 
            if (!(std::cin >> row.id)) {
                std::cout << "Invalid ID!";
                std::cin.clear(); 
                std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                continue;
            }

            // Sab kuch saaf kar do!
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); 

            std::cout << "Enter Name: "; 
            std::cin.getline(row.username, USERNAME_SIZE); 

            std::cout << "Enter Email: "; 
            std::cin.getline(row.email, EMAIL_SIZE);
            
            db.write_row(&row, current_row_count++);
            std::cout << "Saved successfully!\n";
        }
        else if (choice == 2) {
            Row temp;
            uint32_t i = 0;
            std::cout << "\n--- Database Records ---\n";
            while (db.read_row(&temp, i++)) {
                print_row(&temp);
            }
        } 
        else break;
    }
    return 0;
}