// file: atom-schema.js

/**
 * SKYLINE AA-1 - WEEK 3 (UPGRADED)
 * The Logical Atom Schema Definition
 * 
 * CHANGES:
 * - Added 'parents' and 'children' arrays for Graph Linking.
 * - Added 'id' as a required unique identifier.
 */

const ALLOWED_OPS = [
    "EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", 
    "GTE", "LTE", "CONTAINS", "EXISTS"
];

const ALLOWED_TYPES = ["NUMBER", "STRING", "BOOLEAN", "NULL"];

// New: Allowed Link Types for connecting atoms
const ALLOWED_LINK_TYPES = ["AND", "OR"];

const ATOM_SCHEMA = {
    requiredFields: [
        "id", "type", "subject", "operator", "value", 
        "dataType", "status", "parents", "children"
    ],
    constraints: {
        type: "CONDITION",
        operator: { enum: ALLOWED_OPS },
        dataType: { enum: ALLOWED_TYPES },
        status: { initial: "UNVERIFIED" },
        // New Link Fields Defaults
        parents: { default: [] }, 
        children: { default: [] }
    }
};

module.exports = { ATOM_SCHEMA, ALLOWED_OPS, ALLOWED_TYPES, ALLOWED_LINK_TYPES };
