#ifndef PAGER_H
#define PAGER_H

#include <iostream>
#include <fstream>
#include "common.h" 

// Header guard ensure karta hai ki ye file multiple times include na ho

class Pager {

private:

    std::fstream file;
    // File stream object jo database file ko read aur write karega

    std::string filename;
    // Database file ka naam store karta hai


public:

        // Constructor: jab Pager object create hota hai tab call hota hai
        // Pager constructor with error handling
    Pager(std::string fname) : filename(fname) {

        // File ko read + write + binary mode mein open karne ki koshish
        file.open(filename, std::ios::in | std::ios::out | std::ios::binary);

        if (!file.is_open()) {

            // Agar file exist nahi karti to nayi file create karo
            file.open(filename, std::ios::out | std::ios::binary);

            // File create hone ke baad close karo
            file.close();

            // Phir dubara read + write mode mein open karo
            file.open(filename, std::ios::in | std::ios::out | std::ios::binary);
        }

        // Agar phir bhi file open na ho paaye
        if (!file.is_open()) {

            std::cerr << "CRITICAL ERROR: Could not open database file: "
                    << fname << std::endl;
        }
    }


    // Destructor: jab Pager object destroy hota hai
    ~Pager() {

        // Agar file open hai to close kar do
        if (file.is_open())
            file.close();
    }



    // Disk par row likhne ke liye function
    void write_row(Row* row, uint32_t row_num) {

        // File pointer ko correct position par le jao
        // row_num * sizeof(Row) se offset calculate hota hai
        file.seekp(row_num * sizeof(Row));

        // Row structure ko binary format mein file mein write karo
        file.write(reinterpret_cast<char*>(row), sizeof(Row));

        // Data turant disk par save ho jaye
        file.flush();
    }



    // Disk se row read karne ke liye function
    bool read_row(Row* row, uint32_t row_num) {

        // File pointer ko correct row position par le jao
        file.seekg(row_num * sizeof(Row));

        // File se binary data read karo aur Row structure mein store karo
        file.read(reinterpret_cast<char*>(row), sizeof(Row));

        // Agar data successfully read hua to true return karo
        return file.gcount() > 0;
    }
};

#endif