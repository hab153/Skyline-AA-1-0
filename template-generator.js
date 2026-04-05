// file: template-generator.js

/**
 * SKYLINE AA-1 - WEEK 10
 * The TemplateGenerator: Wraps raw logic into structured JavaScript (Functions, Loops).
 * 
 * DESIGN:
 * - Separates structure (functions/loops) from logic (if/else).
 * - Allows easy addition of new patterns (Classes, Modules) later.
 */

const TEMPLATES = {
    // 1. Function Wrapper
    // Usage: wrapFunction('validateUser', 'data', bodyCode)
    wrapFunction: (funcName, params, bodyCode) => {
        const indentedBody = bodyCode.split('\n').map(line => `    ${line}`).join('\n');
        return `function ${funcName}(${params}) {\n${indentedBody}\n}`;
    },

    // 2. Loop Template (For Arrays)
    // Usage: wrapForEach('item', 'list', loopBody)
    wrapForEach: (itemName, arrayName, loopBody) => {
        const indentedBody = loopBody.split('\n').map(line => `    ${line}`).join('\n');
        return `${arrayName}.forEach((${itemName}) => {\n${indentedBody}\n});`;
    },

    // 3. Return Statement
    createReturn: (value) => {
        return `return ${value};`;
    },

    // 4. Export Statement
    createExport: (names) => {
        return `module.exports = { ${names.join(', ')} };`;
    },

    // 5. Indentation Helper
    indent: (code, levels = 1) => {
        const spaces = '    '.repeat(levels);
        return code.split('\n').map(line => spaces + line).join('\n');
    }
};

module.exports = { TEMPLATES };
