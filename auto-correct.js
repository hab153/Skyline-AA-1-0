// file: auto-correct.js

/**
 * SKYLINE AA-1 - WEEK 19
 * The AutoCorrect Engine: Analyzes execution errors and suggests/apply data fixes.
 * 
 * STRATEGY:
 * - If variable is missing -> Add it with a default valid value.
 * - If type is wrong -> Convert it.
 * - If logic fails (e.g., age > 18 but age=10) -> Suggest a value that passes.
 */

class AutoCorrect {
    /**
     * Analyzes an error and the original rules to fix the testData.
     * @param {string} errorMessage - The error from the sandbox.
     * @param {object} testData - The original input data that failed.
     * @param {array} atoms - The list of rules (to understand requirements).
     * @returns {object} { correctedData: {...}, log: ["Fixed X"], success: boolean }
     */
    static fixData(errorMessage, testData, atoms) {
        const correctedData = { ...testData }; // Copy original data
        const log = [];
        let fixed = false;

        // 1. Handle "is not defined" or "Cannot read property" (Missing Variables)
        // Regex looks for: 'age' is not defined OR Cannot read properties of undefined (reading 'age')
        const missingMatch = errorMessage.match(/(['"`]?)(\w+)\1(?: is not defined|Cannot read properties of undefined)/);
        
        if (missingMatch) {
            const missingVar = missingMatch[2];
            
            // Find the rule for this variable to determine a good default value
            const rule = atoms.find(a => a.subject === missingVar);
            
            let defaultValue = null;
            if (rule) {
                // Smart Default: Pick a value that satisfies the rule
                if (rule.operator === 'GREATER_THAN') defaultValue = rule.value + 1;
                else if (rule.operator === 'GTE') defaultValue = rule.value;
                else if (rule.operator === 'LESS_THAN') defaultValue = rule.value - 1;
                else if (rule.operator === 'LTE') defaultValue = rule.value;
                else if (rule.operator === 'EQUALS') defaultValue = rule.value;
                else if (rule.dataType === 'NUMBER') defaultValue = 1;
                else if (rule.dataType === 'STRING') defaultValue = "test";
                else if (rule.dataType === 'BOOLEAN') defaultValue = true;
                else defaultValue = 1; // Fallback
            } else {
                // Fallback if no rule found
                defaultValue = 1; 
            }

            correctedData[missingVar] = defaultValue;
            log.push(`✅ Added missing field '${missingVar}' with value ${defaultValue}`);
            fixed = true;
        }

        // 2. Handle Logic Failures (Optional Heuristic for Week 19)
        // If the error message indicates a validation failure (not a syntax error),
        // we can try to adjust values to meet the criteria.
        // Example: "Error in Rule: [age GREATER_THAN 18]"
        if (!fixed && errorMessage.includes("Error in Rule:")) {
            const ruleMatch = errorMessage.match(/\[(\w+)\s+(\w+)\s+([^\]]+)\]/);
            if (ruleMatch) {
                const subject = ruleMatch[1];
                const operator = ruleMatch[2];
                const valStr = ruleMatch[3].trim();
                const ruleValue = parseFloat(valStr) || valStr;

                const currentValue = correctedData[subject];

                // Calculate a passing value
                let newValue = currentValue;
                if (operator === 'GREATER_THAN' && (currentValue === undefined || currentValue <= ruleValue)) {
                    newValue = ruleValue + 1;
                } else if (operator === 'GTE' && (currentValue === undefined || currentValue < ruleValue)) {
                    newValue = ruleValue;
                } else if (operator === 'LESS_THAN' && (currentValue === undefined || currentValue >= ruleValue)) {
                    newValue = ruleValue - 1;
                } else if (operator === 'EQUALS' && currentValue !== ruleValue) {
                    newValue = ruleValue;
                }

                if (newValue !== currentValue) {
                    correctedData[subject] = newValue;
                    log.push(`✅ Adjusted '${subject}' from ${currentValue} to ${newValue} to satisfy ${operator} ${ruleValue}`);
                    fixed = true;
                }
            }
        }

        return {
            correctedData,
            log,
            success: fixed
        };
    }
}

module.exports = { AutoCorrect };
