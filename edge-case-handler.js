// file: edge-case-handler.js

/**
 * SKYLINE AA-1 - WEEK 32
 * The Edge Case Handler: Sanitizes input data to prevent crashes from null, undefined, or wrong types.
 */

class EdgeCaseHandler {
    /**
     * Sanitizes input data before validation.
     * - Converts null to undefined (for consistent EXISTS checks).
     * - Trims strings.
     * - Ensures objects are not empty.
     */
    static sanitizeInput(data) {
        if (!data || typeof data !== 'object') {
            return {};
        }

        const sanitized = {};
        for (const key in data) {
            let value = data[key];

            // Convert null to undefined so EXISTS checks work consistently
            if (value === null) {
                value = undefined;
            }

            // Trim strings to avoid " " passing as valid
            if (typeof value === 'string') {
                value = value.trim();
            }

            sanitized[key] = value;
        }
        return sanitized;
    }

    /**
     * Attempts to coerce types based on rules (Optional Safety Net).
     * E.g., If rule expects NUMBER but gets "18", convert to 18.
     */
    static coerceTypes(data, rules) {
        const coerced = { ...data };
        
        rules.forEach(rule => {
            const value = coerced[rule.subject];
            if (value === undefined) return;

            if (rule.dataType === 'NUMBER' && typeof value === 'string') {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    coerced[rule.subject] = num;
                }
            }
            
            if (rule.dataType === 'BOOLEAN' && typeof value === 'string') {
                if (value.toLowerCase() === 'true') coerced[rule.subject] = true;
                if (value.toLowerCase() === 'false') coerced[rule.subject] = false;
            }
        });

        return coerced;
    }
}

module.exports = { EdgeCaseHandler };
