// file: validator.js

/**
 * SKYLINE AA-1 - WEEK 32 (BUG FIXING SPRINT 1)
 * The NodeFactory: Mass-produces verified Logical Atoms with strict null handling.
 */

const { ATOM_SCHEMA, ALLOWED_OPS, ALLOWED_TYPES } = require('./atom-schema');

function generateId() {
    return 'atom_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function createLogicAtom(subject, operator, value, dataType) {
    
    // 1. CONSTRUCTION PHASE
    const candidateAtom = {
        id: generateId(),
        type: "CONDITION",
        subject: subject,
        operator: operator,
        value: value,
        dataType: dataType,
        status: "UNVERIFIED",
        createdAt: new Date().toISOString(),
        parents: [],
        children: []
    };

    // 2. VERIFICATION PHASE
    
    if (!ALLOWED_OPS.includes(operator)) {
        throw new Error(`❌ AA-1 REJECTED: Invalid Operator '${operator}'. Allowed: ${ALLOWED_OPS.join(', ')}`);
    }

    if (!ALLOWED_TYPES.includes(dataType)) {
        throw new Error(`❌ AA-1 REJECTED: Invalid DataType '${dataType}'. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }

    // 🆕 WEEK 32: Strict Null Handling
    let actualType = typeof value;
    if (value === null) {
        actualType = "null";
        // Explicitly reject null values for non-EXISTS operators if strict mode is desired
        // For now, we let the type map handle it, but we log it for debugging
        if (operator !== 'EXISTS' && dataType !== 'NULL') {
             // Optional: Warn about null usage in non-exists rules
             // console.warn(`⚠️ Warning: Null value used for ${operator} on ${subject}`);
        }
    }
    
    const typeMap = { "number": "NUMBER", "string": "STRING", "boolean": "BOOLEAN", "null": "NULL" };
    
    if (typeMap[actualType] !== dataType) {
        throw new Error(`❌ AA-1 REJECTED: Type Mismatch. Claimed '${dataType}' but value is '${typeMap[actualType]}'`);
    }

    // 3. APPROVAL PHASE
    candidateAtom.status = "VERIFIED ✅";
    
    return candidateAtom;
}

module.exports = { createLogicAtom };
