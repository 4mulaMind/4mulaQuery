/*
============================================================
4mulaQuery - Global Constants & Data Structures
============================================================

File Location: 
/core/common.h

Purpose:
This header defines the core memory layout and data schemas 
used across the database engine. It ensures consistent 
byte-alignment for disk I/O operations.

Features:
• Fixed-size Memory Allocation
• Binary Row Serialization Schema
• Page Size Optimization (4KB Standard)

============================================================
*/

#ifndef COMMON_H
#define COMMON_H

#include <stdint.h>

/* ====================================================
   DATABASE MEMORY CONSTANTS
   (Defined for fixed-length record storage)
   ==================================================== */

/**
 * USERNAME_SIZE: Maximum characters for the user's name.
 * Default: 32 Bytes
 */
const uint32_t USERNAME_SIZE = 32;

/**
 * EMAIL_SIZE: Maximum characters for the email address.
 * Default: 255 Bytes
 */
const uint32_t EMAIL_SIZE = 255;

/**
 * PAGE_SIZE: Standard OS disk page size (4KB).
 * Optimized for efficient Pager I/O operations.
 */
const uint32_t PAGE_SIZE = 4096;


/* ====================================================
   CORE DATA STRUCTURES
   ==================================================== */

/**
 * STRUCT: Row
 * ----------------------------------------------------
 * Represents a single record in the 4mulaQuery database.
 * This structure is designed for flat binary storage on disk.
 * ----------------------------------------------------
 */
struct Row {

    // Primary Key: Unique identifier for each record
    uint32_t id;

    // Fixed-width array for predictable binary offsets
    char username[USERNAME_SIZE];

    // Fixed-width array for predictable binary offsets
    char email[EMAIL_SIZE];

};

#endif // End of COMMON_H Header Guard