#include <iostream>
#include<common.h>
#include "pager.h"

int main() {
    Pager db("4mulaQuery.db");
    uint32_t row_count = 0;
    
    // Count existing rows
    Row temp;
    while(db.read_row(&temp, row_count)) row_count++;

    while (true) {
        int choice;
        std::cout << "\n1. Insert  2. Select All  3. Exit: ";
        std::cin >> choice;

        if (choice == 1) {
            Row row;
            std::cout << "ID: "; std::cin >> row.id;
            std::cin.ignore(1000, '\n'); // Clear buffer
            std::cout << "User: "; std::cin.getline(row.username, USERNAME_SIZE);
            std::cout << "Email: "; std::cin.getline(row.email, EMAIL_SIZE);
            
            db.write_row(&row, row_count++);
            std::cout << "Saved!";
        } else if (choice == 2) {
            Row r;
            for (uint32_t i = 0; i < row_count; i++) {
                if (db.read_row(&r, i)) {
                    std::cout << "ID: " << r.id << " | Name: " << r.username << " | Email: " << r.email << std::endl;
                }
            }
        } else break;
    }
    return 0;
}