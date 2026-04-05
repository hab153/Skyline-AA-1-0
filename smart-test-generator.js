// file: smart-test-generator.js

/**
 * SKYLINE AA-1 - WEEK 32 (BUG FIXING SPRINT 1)
 * The Smart Test Generator: Creates precise test cases + Chaos Tests for edge cases.
 */

const { EdgeCaseHandler } = require('./edge-case-handler'); // <-- New Import

class SmartTestGenerator {
    static generate(rules) {
        if (!rules || rules.length === 0) return [];

        const testCases = [];
        const baseData = {};

        // Initialize base data with neutral values
        rules.forEach(rule => {
            baseData[rule.subject] = this.getNeutralValue(rule.dataType);
        });

        // 1. CREATE THE "HAPPY PATH"
        const passData = { ...baseData };
        rules.forEach(rule => {
            passData[rule.subject] = this.getPassingValue(rule);
        });
        testCases.push({
            input: passData,
            expectedValid: true,
            name: '✅ Valid Input (Happy Path)'
        });

        // 2. CREATE THE "SAD PATH" (One condition failed)
        rules.forEach((rule, index) => {
            const failData = { ...baseData };
            rules.forEach((otherRule, otherIndex) => {
                if (index !== otherIndex) {
                    failData[otherRule.subject] = this.getPassingValue(otherRule);
                }
            });
            failData[rule.subject] = this.getFailingValue(rule);
            testCases.push({
                input: failData,
                expectedValid: false,
                name: `❌ Invalid Input (Failed: ${rule.subject} ${rule.operator})`
            });
        });

        // 🆕 WEEK 32: ADD CHAOS TESTS (Edge Cases)
        const chaosTests = this.generateChaosTests(rules, baseData);        testCases.push(...chaosTests);

        return testCases;
    }

    // 🆕 WEEK 32: Generate Chaos/Edge Case Tests
    static generateChaosTests(rules, baseData) {
        const tests = [];

        // Test 1: Empty Object
        tests.push({
            input: {},
            expectedValid: false,
            name: '🌪️ Chaos: Empty Object {}'
        });

        // Test 2: Null Values for all fields
        const nullData = {};
        rules.forEach(r => { nullData[r.subject] = null; });
        tests.push({
            input: nullData,
            expectedValid: false,
            name: '🌪️ Chaos: All Null Values'
        });

        // Test 3: Wrong Types (String instead of Number)
        const wrongTypeData = { ...baseData };
        rules.forEach(rule => {
            if (rule.dataType === 'NUMBER') {
                wrongTypeData[rule.subject] = "not_a_number";
            } else if (rule.dataType === 'STRING') {
                wrongTypeData[rule.subject] = 12345;
            }
        });
        // Only add if we actually changed something
        if (Object.keys(wrongTypeData).length > 0) {
            tests.push({
                input: wrongTypeData,
                expectedValid: false, // Should fail validation or type check
                name: '🌪️ Chaos: Wrong Data Types'
            });
        }

        return tests;
    }

    // --- HELPERS (Existing Logic Preserved) ---
    static getNeutralValue(dataType) {
        if (dataType === 'NUMBER') return 0;
        if (dataType === 'BOOLEAN') return false;        return '';
    }

    static getPassingValue(rule) {
        const { operator, value, dataType } = rule;
        if (operator === 'EXISTS') return dataType === 'BOOLEAN' ? true : (dataType === 'NUMBER' ? 1 : 'test');
        if (operator === 'EQUALS') return value;
        if (operator === 'NOT_EQUALS') return value + (dataType === 'NUMBER' ? 1 : '_diff');
        if (operator === 'GREATER_THAN') return typeof value === 'number' ? value + 1 : 'z';
        if (operator === 'GTE') return value;
        if (operator === 'LESS_THAN') return typeof value === 'number' ? value - 1 : 'a';
        if (operator === 'LTE') return value;
        if (operator === 'CONTAINS') return `prefix_${value}_suffix`;
        return dataType === 'NUMBER' ? 0 : 'test';
    }

    static getFailingValue(rule) {
        const { operator, value, dataType } = rule;
        if (operator === 'EXISTS') return undefined;
        if (operator === 'EQUALS') return value + (dataType === 'NUMBER' ? 1 : '_wrong');
        if (operator === 'NOT_EQUALS') return value;
        if (operator === 'GREATER_THAN') return typeof value === 'number' ? value : '';
        if (operator === 'GTE') return typeof value === 'number' ? value - 1 : '';
        if (operator === 'LESS_THAN') return typeof value === 'number' ? value : 'z';
        if (operator === 'LTE') return typeof value === 'number' ? value + 1 : 'z';
        if (operator === 'CONTAINS') return 'no_match_here';
        return dataType === 'NUMBER' ? -1 : 'fail';
    }
}

module.exports = { SmartTestGenerator };
