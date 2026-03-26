#include <iostream>
#include <string>
#include <sstream>
#include <cstdio>
#include <vector>

#include "pager.h"
#include "common.h"

/*
    DatabaseEngine
    ----------------
    Ye class poore database operations handle karti hai.

    Supported commands:
    1. insert  -> new row add
    2. select  -> sab data show
    3. search  -> ID se record find
    4. delete  -> ID se record remove
*/
class DatabaseEngine {
private:
    Pager db;           // Pager object disk read/write handle karta hai
    uint32_t row_count; // Total rows database me

public:
    /*
        Constructor
        ----------
        Program start hone par database file load hoti hai
        aur existing rows count ki jati hain
    */
    DatabaseEngine() : db("./4mulaQuery.db"), row_count(0) {
        Row temp;
        while (db.read_row(&temp, row_count))
            row_count++;
    }

    /*
        INSERT COMMAND
        Format: insert,id,name,email
    */
    void handleInsert(std::stringstream &ss) {
        Row row;
        std::string id_str, name, email;

        if (std::getline(ss, id_str, ',') &&
            std::getline(ss, name, ',') &&
            std::getline(ss, email, ',')) {

            try {
                row.id = std::stoi(id_str);
                snprintf(row.username, USERNAME_SIZE, "%s", name.c_str());
                snprintf(row.email, EMAIL_SIZE, "%s", email.c_str());

                db.write_row(&row, row_count++);
                std::cout << "Executed.\n" << std::flush;
            } catch (...) {
                std::cout << "Error: Invalid ID format\n" << std::flush;
            }
        }
    }

    /*
        SELECT ALL COMMAND
        ------------------
        Poora database print karta hai
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

    /*
        SEARCH COMMAND
        --------------
        Format: search,id
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

                if (!found)
                    std::cout << "ID " << search_id << " Not Found.\n" << std::flush;

            } catch (...) {
                std::cout << "Error: Search ID format\n" << std::flush;
            }
        }
    }

    /*
        DELETE COMMAND
        --------------
        Format: delete,id
        Logic:
        - Saari rows read karo
        - Jo delete nahi karni, usse vector me store karo
        - Phir file dobara rewrite karo
    */
    void handleDelete(std::stringstream &ss) {
        std::string s_id;
        if (std::getline(ss, s_id, ',')) {
            try {
                uint32_t delete_id = std::stoi(s_id);
                std::vector<Row> remaining_rows;
                Row r;
                bool found = false;

                for (uint32_t i = 0; i < row_count; i++) {
                    if (db.read_row(&r, i)) {
                        if (r.id != delete_id)
                            remaining_rows.push_back(r);
                        else
                            found = true;
                    }
                }

                if (found) {
                    // File reset karke remaining rows dobara write kar rahe hain
                    for (uint32_t i = 0; i < remaining_rows.size(); i++)
                        db.write_row(&remaining_rows[i], i);

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

    /*
        MAIN ENGINE LOOP
        ----------------
        User command read karta hai
        aur correct function call karta hai
    */
    void run() {
        std::string line;
        while (std::getline(std::cin, line)) {
            line.erase(line.find_last_not_of(" \n\r\t") + 1); // trim trailing spaces

            if (line.empty() || line == "exit")
                break;

            std::stringstream ss(line);
            std::string command;

            if (line.find(',') != std::string::npos)
                std::getline(ss, command, ',');
            else
                ss >> command;

            // COMMAND DISPATCH
            if (command == "insert")
                handleInsert(ss);
            else if (command == "select" || command == "all")
                handleSelect();
            else if (command == "search")
                handleSearch(ss);
            else if (command == "delete")
                handleDelete(ss);

            break; // Render / Java compatibility: ek command ke baad exit
        }
    }
};

/*
    PROGRAM ENTRY POINT
*/
int main() {
    DatabaseEngine engine;
    engine.run();
    return 0;
}