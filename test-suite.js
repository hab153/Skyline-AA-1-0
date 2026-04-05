// file: test-suite.js

const { createLogicAtom } = require('./validator');

console.log("🚀 STARTING SKYLINE AA-1 WEEK 1 TEST SUITE...\n");

// --- TEST 1: THE PERFECT ATOM (Should Pass) ---
try {
    console.log("Test 1: Creating valid rule (Age > 18)...");
    const atom1 = createLogicAtom("age", "GREATER_THAN", 18, "NUMBER");
    console.log("✅ SUCCESS:", JSON.stringify(atom1, null, 2));
} catch (error) {
    console.log("❌ UNEXPECTED FAILURE:", error.message);
}

console.log("\n" + "=".repeat(50) + "\n");

// --- TEST 2: INVALID OPERATOR (Should Fail) ---
try {
    console.log("Test 2: Attempting invalid operator ('MAYBE_GREATER')...");
    const atom2 = createLogicAtom("age", "MAYBE_GREATER", 18, "NUMBER");
    console.log("❌ CRITICAL FAILURE: System accepted an invalid operator!");
} catch (error) {
    console.log("✅ EXPECTED REJECTION:", error.message);
}

console.log("\n" + "=".repeat(50) + "\n");

// --- TEST 3: TYPE MISMATCH (Should Fail) ---
try {
    console.log("Test 3: Attempting type mismatch (Claiming Number, passing String)...");
    const atom3 = createLogicAtom("age", "GREATER_THAN", "eighteen", "NUMBER");
    console.log("❌ CRITICAL FAILURE: System accepted a type mismatch!");
} catch (error) {
    console.log("✅ EXPECTED REJECTION:", error.message);
}

console.log("\n🏁 TEST SUITE COMPLETE.");
