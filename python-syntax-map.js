// file: python-syntax-map.js

/**
 * SKYLINE AA-1 - WEEK 15
 * The Python Syntax Map: Defines operators, keywords, and formatting rules for Python.
 */

const PY_SYNTAX_MAP = {
    // 1. Operators Mapping (Logical & Comparison)
    operators: {
        'EQUALS': '==',
        'NOT_EQUALS': '!=',
        'GREATER_THAN': '>',
        'LESS_THAN': '<',
        'GTE': '>=',
        'LTE': '<=',
        'CONTAINS': 'in',      // Python uses 'in' for contains
        'EXISTS': 'is not None' // Pythonic check
    },

    // 2. Logical Connectors
    connectors: {
        'AND': 'and',
        'OR': 'or'
    },

    // 3. Keywords
    keywords: {
        'FUNCTION_DEF': 'def',
        'RETURN': 'return',
        'IF': 'if',
        'ELSE': 'else',
        'ELIF': 'elif',
        'WHILE': 'while',
        'FOR': 'for',
        'IN': 'in',
        'TRUE': 'True',
        'FALSE': 'False',
        'NONE': 'None'
    },

    // 4. Value Formatting Helper
    formatValue: (value, dataType) => {
        if (dataType === 'NUMBER') return value;
        if (dataType === 'BOOLEAN') return value ? 'True' : 'False';
        if (dataType === 'STRING') return `"${value}"`;
        if (value === null) return 'None';
        return `"${value}"`; // Default to string
    }
};

module.exports = { PY_SYNTAX_MAP };
