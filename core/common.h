/*
============================================================
4mulaQuery — common.h (B+ Tree version)
============================================================
*/
#ifndef COMMON_H
#define COMMON_H

#include <stdint.h>

/* ── ROW SCHEMA ─────────────────────────────────────── */
const uint32_t USERNAME_SIZE = 32;
const uint32_t EMAIL_SIZE    = 255;
const uint32_t PAGE_SIZE     = 4096;
const uint32_t INVALID_PAGE  = 0xFFFFFFFF;
const uint32_t TABLE_MAX_PAGES = 400;

struct Row {
    uint32_t id;
    char username[USERNAME_SIZE]; // 32 bytes
    char email[EMAIL_SIZE];       // 255 bytes
};
// sizeof(Row) = 291 bytes

/* ── NODE TYPE ──────────────────────────────────────── */
enum NodeType : uint8_t { LEAF_NODE = 0, INTERNAL_NODE = 1 };

/* ── LEAF NODE LAYOUT ───────────────────────────────── */
// Offset  0 : node_type  (1 byte)
// Offset  1 : is_root    (1 byte)
// Offset  2 : parent     (4 bytes)
// Offset  6 : num_cells  (4 bytes)
// Offset 10 : next_leaf  (4 bytes)  — linked list of leaves
// Offset 14 : cells...
//             cell = key(4) + Row(291) = 295 bytes
//             max cells = (4096 - 14) / 295 = 13

const uint32_t LEAF_HDR_SIZE      = 14;
const uint32_t LEAF_KEY_SIZE      = 4;
const uint32_t LEAF_VALUE_SIZE    = sizeof(Row);
const uint32_t LEAF_CELL_SIZE     = LEAF_KEY_SIZE + LEAF_VALUE_SIZE; // 295
const uint32_t LEAF_MAX_CELLS     = (PAGE_SIZE - LEAF_HDR_SIZE) / LEAF_CELL_SIZE; // 13
const uint32_t LEAF_R_SPLIT       = (LEAF_MAX_CELLS + 1) / 2;
const uint32_t LEAF_L_SPLIT       = (LEAF_MAX_CELLS + 1) - LEAF_R_SPLIT;

/* ── INTERNAL NODE LAYOUT ───────────────────────────── */
// Offset  0 : node_type   (1 byte)
// Offset  1 : is_root     (1 byte)
// Offset  2 : parent      (4 bytes)
// Offset  6 : num_keys    (4 bytes)
// Offset 10 : right_child (4 bytes)
// Offset 14 : cells...
//             cell = child(4) + key(4) = 8 bytes
//             max keys = (4096 - 14 - 4) / 8 = 509

const uint32_t INT_HDR_SIZE    = 14;
const uint32_t INT_KEY_SIZE    = 4;
const uint32_t INT_CHILD_SIZE  = 4;
const uint32_t INT_CELL_SIZE   = INT_KEY_SIZE + INT_CHILD_SIZE; // 8
const uint32_t INT_MAX_KEYS    = (PAGE_SIZE - INT_HDR_SIZE - INT_CHILD_SIZE) / INT_CELL_SIZE; // 509

#endif