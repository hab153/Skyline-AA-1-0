// file: code-formatter.js

/**
 * SKYLINE AA-1 - WEEK 13
 * The CodeFormatter: Takes raw generated code and fixes indentation/spacing.
 * 
 * BENEFIT:
 * - Ensures consistent 4-space indentation.
 * - Fixes messy object formatting.
 * - Makes code look human-written.
 */

class CodeFormatter {
    constructor(indentSize = 4) {
        this.indentSize = indentSize;
    }

    format(code) {
        const lines = code.split('\n');
        let indentLevel = 0;
        const formattedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines but preserve them
            if (trimmed === '') {
                formattedLines.push('');
                continue;
            }

            // Decrease indent for closing brackets BEFORE printing
            if (trimmed.startsWith('}') || trimmed.startsWith('];') || trimmed.startsWith('),')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indent = ' '.repeat(this.indentSize * indentLevel);
            formattedLines.push(`${indent}${trimmed}`);

            // Increase indent for opening brackets AFTER printing
            if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(') || trimmed.endsWith(',')) {
                // Special case: if line ends with }, { (like else {), don't increase yet
                if (!trimmed.includes('}')) {
                     indentLevel++;
                }
            }
            
            // Handle specific cases like "else {" on same line
            if (trimmed.match(/}\s*else\s*{/)) {
                // No change in level effectively, handled by logic above mostly
            }
        }

        return formattedLines.join('\n');
    }
}

module.exports = { CodeFormatter };
