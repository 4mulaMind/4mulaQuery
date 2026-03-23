#ifndef COMMON_H
#define COMMON_H

#include <iostream>
#include <stdint.h>

// 4mulaQuery: Data constants
const uint32_t USERNAME_SIZE = 32;
const uint32_t EMAIL_SIZE = 255;
const uint32_t PAGE_SIZE = 4096; // 4KB standard database page size

struct Row {
    uint32_t id;
    char username[USERNAME_SIZE];
    char email[EMAIL_SIZE];
};

#endif