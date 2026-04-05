// file: linker.js

const { ALLOWED_LINK_TYPES } = require('./atom-schema');

/**
 * SKYLINE AA-1 - WEEK 3
 * The Linker: Connects two verified atoms into a logical flow.
 * 
 * RULES:
 * 1. Both atoms must exist and have valid IDs.
 * 2. Link Type must be 'AND' or 'OR'.
 * 3. Creates a bidirectional link (Parent <-> Child).
 */

function connectAtoms(parentAtom, childAtom, linkType) {
    // 1. Validate Inputs
    if (!parentAtom || !parentAtom.id) {
        throw new Error("❌ LINKER ERROR: Invalid Parent Atom.");
    }
    if (!childAtom || !childAtom.id) {
        throw new Error("❌ LINKER ERROR: Invalid Child Atom.");
    }
    if (parentAtom.id === childAtom.id) {
        throw new Error("❌ LINKER ERROR: Cannot link an atom to itself.");
    }
    if (!ALLOWED_LINK_TYPES.includes(linkType)) {
        throw new Error(`❌ LINKER ERROR: Invalid Link Type '${linkType}'. Allowed: ${ALLOWED_LINK_TYPES.join(', ')}`);
    }

    // 2. Create The Link Object
    const link = {
        targetId: childAtom.id,
        type: linkType,
        createdAt: new Date().toISOString()
    };

    const reverseLink = {
        targetId: parentAtom.id,
        type: linkType,
        createdAt: link.createdAt
    };

    // 3. Apply Bidirectional Connection
    // Check for duplicates first
    const alreadyLinked = parentAtom.children.some(c => c.targetId === childAtom.id);
    
    if (!alreadyLinked) {
        parentAtom.children.push(link);
        childAtom.parents.push(reverseLink);
        console.log(`🔗 LINKED: [${parentAtom.subject}] --(${linkType})--> [${childAtom.subject}]`);
    } else {
        console.log(`⚠️ SKIP: Link already exists between these atoms.`);
    }

    return true;
}

module.exports = { connectAtoms };
