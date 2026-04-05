// file: syntax-map.js

/**
 * SKYLINE AA-1 - WEEK 9
 * The SyntaxMap: Translates Logical Atoms into JavaScript Code Strings.
 * 
 * DESIGN:
 * - Keeps logic separate from language syntax.
 * - Easily extendable for Python, Go, etc., by creating new maps.
 */

const JS_SYNTAX_MAP = {
    // 1. Operators (Logic Symbol → JS Symbol)
    operators: {
        'EQUALS': '===',
        'NOT_EQUALS': '!==',
        'GREATER_THAN': '>',
        'LESS_THAN': '<',
        'GTE': '>=',
        'LTE': '<=',
        'CONTAINS': '.includes(', 
        'EXISTS': '!== null'
    },

    // 2. Logical Connectors (Logic Word → JS Operator)
    connectors: {
        'AND': '&&',
        'OR': '||'
    },

    // 3. Code Templates (Sentence Structures)
    templates: {
        // How to write a single condition: age > 18
        condition: '${subject} ${operator} ${value}',
        
        // How to write an IF statement
        ifBlock: 'if (${condition}) {\n    // Action goes here\n}',
        
        // How to write a variable assignment
        variable: 'const ${name} = ${value};',
        
        // Function header
        functionHeader: 'function ${name}(${params}) {',
        
        // Closing brace
        closeBlock: '}'
    },

    // 4. Helper: Format Values based on Data Type
    formatValue: (value, dataType) => {
        if (dataType === 'STRING') {
            return `'${value}'`;
        }
        if (dataType === 'NUMBER' || dataType === 'BOOLEAN') {
            return value;
        }
        return value; // Fallback
    }
};

module.exports = { JS_SYNTAX_MAP };
