// file: ast-constructor.js

/**
 * SKYLINE AA-1 - WEEK 14 (LOOP SUPPORT ADDED)
 * The ASTConstructor: Builds Abstract Syntax Trees (AST) for guaranteed syntax correctness.
 * 
 * HISTORY PRESERVED (100% INTACT):
 * - Week 11: Program, Function, If, Binary, Identifier, Literal, Return, Object, Property, Logical
 * - Week 14: ForStatement, WhileStatement, VariableDeclaration, UpdateExpression [NEW - APPENDED]
 */

const AST_NODES = {
    // --- WEEK 11 NODES (PRESERVED) ---
    
    // 1. Program (The root of any JS file)
    createProgram: (body) => ({
        type: 'Program',
        sourceType: 'module',
        body: body
    }),

    // 2. Function Declaration
    createFunction: (name, params, body) => ({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: name },
        params: params.map(p => ({ type: 'Identifier', name: p })),
        body: {
            type: 'BlockStatement',
            body: body
        },
        expression: false,
        generator: false,
        async: false
    }),

    // 3. If Statement
    createIfStatement: (test, consequent, alternate = null) => ({
        type: 'IfStatement',
        test: test,
        consequent: { type: 'BlockStatement', body: consequent },
        alternate: alternate ? { type: 'BlockStatement', body: alternate } : null
    }),

    // 4. Binary Expression (e.g., age > 18)
    createBinaryExpression: (operator, left, right) => ({
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
    }),
    // 5. Identifier (Variables)
    createIdentifier: (name) => ({
        type: 'Identifier',
        name: name
    }),

    // 6. Literal (Values like 18, "admin", true)
    createLiteral: (value) => ({
        type: 'Literal',
        value: value
    }),

    // 7. Return Statement
    createReturnStatement: (argument) => ({
        type: 'ReturnStatement',
        argument: argument
    }),

    // 8. Object Expression (e.g., { valid: true })
    createObjectExpression: (properties) => ({
        type: 'ObjectExpression',
        properties: properties
    }),

    // 9. Property (Key: Value)
    createProperty: (key, value) => ({
        type: 'Property',
        key: { type: 'Identifier', name: key },
        value: value,
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false
    }),

    // 10. Logical Expression (AND/OR)
    createLogicalExpression: (operator, left, right) => ({
        type: 'LogicalExpression',
        operator: operator,
        left: left,
        right: right
    }),

    // --- WEEK 14 NODES (NEW - APPENDED) ---

    // 11. For Statement (e.g., for (let i = 0; i < 10; i++) { ... })
    createForStatement: (init, test, update, body) => ({
        type: 'ForStatement',
        init: init,        test: test,
        update: update,
        body: { type: 'BlockStatement', body: body }
    }),

    // 12. While Statement (e.g., while (condition) { ... })
    createWhileStatement: (test, body) => ({
        type: 'WhileStatement',
        test: test,
        body: { type: 'BlockStatement', body: body }
    }),

    // 13. Variable Declaration (e.g., let i = 0)
    createVariableDeclaration: (kind, declarations) => ({
        type: 'VariableDeclaration',
        kind: kind, // 'let', 'const', 'var'
        declarations: declarations
    }),

    // 14. Variable Declarator (e.g., i = 0)
    createVariableDeclarator: (id, init) => ({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: id },
        init: init
    }),

    // 15. Update Expression (e.g., i++)
    createUpdateExpression: (operator, argument) => ({
        type: 'UpdateExpression',
        operator: operator, // '++', '--'
        argument: { type: 'Identifier', name: argument },
        prefix: false
    })
};

module.exports = { AST_NODES };
