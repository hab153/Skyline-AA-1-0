// file: auto-test-runner.js

/**
 * SKYLINE AA-1 - WEEK 31 (COMPREHENSIVE TESTING SUITE)
 * The Auto-Test Runner: Uses SmartTestGenerator to verify code with precise expectations.
 */

const { SandboxRunner } = require('./sandbox-runner');
const { SmartTestGenerator } = require('./smart-test-generator'); // <-- New Import

class AutoTestRunner {
    /**
     * Runs all generated test cases against the code.
     */
    static async runAllTests(code, rules, atoms) {
        console.log(`\n🧪 [AUTO-TEST] Running Comprehensive Test Suite...`);
        
        // 🆕 WEEK 31: Use the Smart Generator
        const testCases = SmartTestGenerator.generate(rules);
        
        if (testCases.length === 0) {
            console.log(`⚠️ No test cases generated.`);
            return { allPassed: true, total: 0, passedCount: 0, results: [] };
        }

        const results = [];
        let allPassed = true;

        for (const testCase of testCases) {
            try {
                // Run the code in the sandbox
                const result = await SandboxRunner.run(code, testCase.input, 2000, atoms || []);
                
                // 🆕 WEEK 31: SMART ASSERTION LOGIC
                // The sandbox returns success: true if code ran without crash.
                // We need to check the RETURN VALUE of the function (result.result.valid).
                
                let actualValid = false;
                let testExecutionSuccess = result.success;

                if (testExecutionSuccess && result.result && typeof result.result === 'object') {
                    actualValid = result.result.valid === true;
                } else {
                    // If code crashed or returned non-object, it's definitely not "valid"
                    actualValid = false;
                }

                // Compare Actual vs Expected
                const passed = (actualValid === testCase.expectedValid);

                results.push({
                    name: testCase.name,
                    input: testCase.input,
                    expected: testCase.expectedValid ? 'valid: true' : 'valid: false',
                    actual: actualValid ? 'valid: true' : 'valid: false',
                    passed: passed,
                    output: result.result || result.error
                });

                if (!passed) {
                    allPassed = false;
                    console.log(`   ❌ ${testCase.name}: Expected ${testCase.expectedValid ? 'valid:true' : 'valid:false'}, Got ${actualValid ? 'valid:true' : 'valid:false'}`);
                } else {
                    console.log(`   ✅ ${testCase.name}: Passed`);
                }

            } catch (error) {
                results.push({
                    name: testCase.name,
                    passed: false,
                    error: error.message
                });
                allPassed = false;
                console.log(`   ❌ ${testCase.name}: CRITICAL ERROR - ${error.message}`);
            }
        }

        return {
            allPassed,
            total: testCases.length,
            passedCount: results.filter(r => r.passed).length,
            results
        };
    }
}

module.exports = { AutoTestRunner };
