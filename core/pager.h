#ifndef PAGER_H
#define PAGER_H

#include <fstream>
#include <iostream>
#include "common.h"

class Pager {
    std::fstream file;
    std::string filename;

public:
    Pager(std::string db_file) : filename(db_file) {
        // Open file in binary mode for reading and writing
        file.open(filename, std::ios::in | std::ios::out | std::ios::binary);
        if (!file.is_open()) {
            // Agar file nahi hai, toh nayi banao
            file.open(filename, std::ios::in | std::ios::out | std::ios::binary | std::ios::trunc);
        }
    }

    void write_row(Row* row, uint32_t row_num) {
        uint32_t offset = row_num * sizeof(Row);
        file.seekp(offset);
        file.write(reinterpret_cast<char*>(row), sizeof(Row));
        file.flush();
    }

    bool read_row(Row* row, uint32_t row_num) {
        uint32_t offset = row_num * sizeof(Row);
        file.seekg(0, std::ios::end);
        if (offset >= file.tellg()) return false; // File khatam

        file.seekg(offset);
        file.read(reinterpret_cast<char*>(row), sizeof(Row));
        return true;
    }

    ~Pager() { if (file.is_open()) file.close(); }
};

#endif