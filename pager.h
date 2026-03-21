#ifndef PAGER_H
#define PAGER_H

#include <fstream>
#include <vector>
#include "common.h"

class Pager {
    std::fstream file;
    std::string filename;
    uint32_t file_length;

public:
    Pager(std::string db_file) : filename(db_file) {
        file.open(filename, std::ios::in | std::ios::out | std::ios::binary);
        if (!file.is_open()) {
            file.open(filename, std::ios::in | std::ios::out | std::ios::binary | std::ios::trunc);
        }
        
        // File ka total size check karo
        file.seekg(0, std::ios::end);
        file_length = file.tellg();
    }

    // Function: Pata lagao ki Row kaunse Page aur kaunse Offset par hai
    void write_row(Row* row, uint32_t row_num) {
        // Ek row ka size 291 bytes hai, toh row_num ke hisab se cursor move karo
        uint32_t offset = row_num * sizeof(Row);
        file.seekp(offset);
        file.write(reinterpret_cast<char*>(row), sizeof(Row));
        file.flush();
    }

    bool read_row(Row* row, uint32_t row_num) {
        uint32_t offset = row_num * sizeof(Row);
        
        // Agar offset file ke size se bada hai, matlab data khatam
        if (offset >= get_file_size()) return false;

        file.seekg(offset);
        return (bool)file.read(reinterpret_cast<char*>(row), sizeof(Row));
    }

    uint32_t get_file_size() {
        file.seekg(0, std::ios::end);
        return file.tellg();
    }

    ~Pager() { if (file.is_open()) file.close(); }
};

#endif