#ifndef COMMON_H
#define COMMON_H

#include <stdint.h>

// Header guard start
// Ye ensure karta hai ki header file program mein multiple
// baar include hone par duplicate definition error na aaye.


// 4mulaQuery ke fixed memory constants

const uint32_t USERNAME_SIZE = 32;
// Username ke liye maximum 32 characters allocate kiye gaye hain.

const uint32_t EMAIL_SIZE = 255;
// Email address ke liye maximum 255 characters allocate kiye gaye hain.

const uint32_t PAGE_SIZE = 4096;
// Database page ka size 4096 bytes (4KB) hai.
// Ye disk aur memory page management mein use hota hai.


// Database table ki ek row ka structure
struct Row {

    uint32_t id;
    // Har record ka unique identifier

    char username[USERNAME_SIZE];
    // Username store karne ke liye fixed size character array

    char email[EMAIL_SIZE];
    // Email store karne ke liye fixed size character array
};

#endif
// Header guard end