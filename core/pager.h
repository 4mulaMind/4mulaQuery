#ifndef PAGER_H
#define PAGER_H

#include <iostream>
#include <fstream>
#include "common.h" // Zaroori: Taaki Pager ko Row structure pata chale

class Pager {
private:
    std::fstream file;
    std::string filename;

public:
    Pager(std::string fname) : filename(fname) {
        // File ko binary mode mein open karo (Read + Write)
        file.open(filename, std::ios::in | std::ios::out | std::ios::binary);
        if (!file.is_open()) {
            // Agar file nahi hai, toh nayi banao
            file.open(filename, std::ios::out | std::ios::binary);
            file.close();
            file.open(filename, std::ios::in | std::ios::out | std::ios::binary);
        }
    }

    ~Pager() {
        if (file.is_open()) file.close();
    }

    // Disk par row likhne ke liye
    void write_row(Row* row, uint32_t row_num) {
        file.seekp(row_num * sizeof(Row));
        file.write(reinterpret_cast<char*>(row), sizeof(Row));
        file.flush(); // Turant save karo
    }

    // Disk se row read karne ke liye
    bool read_row(Row* row, uint32_t row_num) {
        file.seekg(row_num * sizeof(Row));
        file.read(reinterpret_cast<char*>(row), sizeof(Row));
        return file.gcount() > 0; // Agar data mila toh true
    }
};

#endif