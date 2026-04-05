// file: factory.js

const { createLogicAtom } = require('./validator');
const { GraphOptimizer } = require('./graph-optimizer'); // <-- New Import

/**
 * SKYLINE AA-1 - WEEK 29 (OPTIMIZED)
 * The NodeFactory: Mass-produces verified Logical Atoms using Batch Processing.
 * 
 * RULE: ALL OR NOTHING.
 * If ONE atom fails validation, the ENTIRE batch is rejected.
 */

function batchCreateAtoms(rawRules) {
    // 1. Input Validation
    if (!Array.isArray(rawRules)) {
        throw new Error("❌ AA-1 FACTORY ERROR: Input must be an array of rules.");
    }

    // 🆕 WEEK 29: Use Optimized Batch Creation
    // This replaces the manual loop with a high-performance batch processor
    try {
        const verifiedBatch = GraphOptimizer.createAtomsBatch(rawRules);
        
        // Log individual success for consistency with old logs
        verifiedBatch.forEach((atom, i) => {
            console.log(`   ✅ Atom #${i + 1} [${atom.subject}] VERIFIED.`);
        });
        console.log(`✅ FACTORY COMPLETE: ${verifiedBatch.length} atoms produced.`);
        
        return verifiedBatch;
    } catch (error) {
        // Re-throw the optimized error message
        throw error;
    }
}

module.exports = { batchCreateAtoms };
