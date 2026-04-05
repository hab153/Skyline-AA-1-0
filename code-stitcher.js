// file: code-stitcher.js

/**
 * SKYLINE AA-1 - WEEK 31 (CALL EXPRESSION SUPPORT ADDED)
 * Fixed double-incrementing of indentation levels in Blocks and IfStatements.
 * Fixed extra parentheses in ForLoop test conditions.
 * Added MemberExpression support for 'data.subject' syntax.
 * Added Atom Tracking Comments for Error Mapping.
 * 🆕 WEEK 31: Added CallExpression support for .includes()
 * 
 * HISTORY PRESERVED (100% INTACT):
 * - Week 12/13: Program, Function, Block, If, Return, Binary, Logical, Identifier, Literal, Object, Property
 * - Week 14: ForStatement, WhileStatement, VariableDeclaration, UpdateExpression
 * - Week 15: Multi-language support (JS/Python)
 * - Week 17: MemberExpression Support
 * - Week 18: Atom Tracking
 * - Week 31: CallExpression Support
 */

class CodeStitcher {
    constructor(language = 'javascript') {
        this.language = language;
        this.indentSize = 4;
    }

    stitch(node, level = 0) {
        if (!node) return '';
        
        const indent = ' '.repeat(this.indentSize * level);
        const isPython = this.language === 'python';

        // --- WEEK 18 FEATURE: INJECT ATOM TRACKING COMMENT ---
        let trackingComment = '';
        if (!isPython && node.atomId) {
            trackingComment = `/* @atom:${node.atomId} */ `;
        }
        // -----------------------------------------------------

        switch (node.type) {
            // --- WEEK 12/13 CASES (PRESERVED & UPDATED) ---
            case 'Program':
                return node.body.map(n => this.stitch(n, level)).join('\n\n');
            
            case 'FunctionDeclaration':
                const params = node.params.map(p => p.name).join(', ');
                const body = this.stitch(node.body, level + 1);
                
                if (isPython) {
                    return `${indent}def ${node.id.name}(${params}):\n${body}`;
                } else {                    return `${indent}function ${node.id.name}(${params}) {\n${body}\n${indent}}`;
                }

            case 'BlockStatement':
                if (!node.body || node.body.length === 0) {
                    if (isPython) return `${indent}pass`;
                    return `${indent}// empty`;
                }
                return node.body.map(n => this.stitch(n, level)).join('\n');

            case 'IfStatement':
                const test = this.stitch(node.test, 0); 
                const consequent = this.stitch(node.consequent, level + 1);
                
                let result = '';
                if (isPython) {
                    result = `${indent}if ${test}:\n${consequent}`;
                } else {
                    const ifLine = `${indent}if (${test}) {`;
                    result = (!isPython && node.atomId) ? `${indent}/* @atom:${node.atomId} */ if (${test}) {` : ifLine;
                    result += `\n${consequent}\n${indent}}`;
                }
                
                if (node.alternate) {
                    const altBody = this.stitch(node.alternate, level + 1);
                    if (isPython) {
                        result += `\n${indent}else:\n${altBody}`;
                    } else {
                        result += `\n${indent}else {\n${altBody}\n${indent}}`;
                    }
                }
                return result;

            case 'ReturnStatement':
                const arg = node.argument ? this.stitch(node.argument, level) : ''; 
                if (isPython) {
                    return arg ? `${indent}return ${arg}` : `${indent}return`;
                } else {
                    return `${indent}return ${arg};`;
                }

            case 'BinaryExpression':
                const left = this.stitch(node.left, 0);
                const right = this.stitch(node.right, 0);
                if (isPython && node.operator === '===') return `${left} == ${right}`;
                if (isPython && node.operator === '!==') return `${left} != ${right}`;
                
                const expr = `(${left} ${node.operator} ${right})`;
                return (!isPython && node.atomId) ? `/* @atom:${node.atomId} */ ${expr}` : expr;
            case 'LogicalExpression':
                const lLeft = this.stitch(node.left, 0);
                const lRight = this.stitch(node.right, 0);
                if (isPython) {
                    const pyOp = node.operator === '&&' ? 'and' : 'or';
                    return `${lLeft} ${pyOp} ${lRight}`;
                }
                return `(${lLeft} ${node.operator} ${lRight})`;

            case 'Identifier':
                return node.name;

            case 'MemberExpression':
                const objectPart = this.stitch(node.object, 0);
                const propertyPart = node.property.name;
                return `${objectPart}.${propertyPart}`;

            // 🆕 WEEK 31 FIX: Support CallExpression (for .includes())
            case 'CallExpression':
                const calleeObj = this.stitch(node.callee.object, 0);
                const calleeProp = this.stitch(node.callee.property, 0);
                const args = node.arguments.map(arg => this.stitch(arg, 0)).join(', ');
                return `${calleeObj}.${calleeProp}(${args})`;

            case 'Literal':
                if (isPython) {
                    if (node.value === true) return 'True';
                    if (node.value === false) return 'False';
                    if (node.value === null) return 'None';
                }
                return JSON.stringify(node.value);

            case 'ObjectExpression':
                if (!node.properties || node.properties.length === 0) {
                    return isPython ? '{}' : '{}';
                }
                const props = node.properties.map(p => this.stitch(p, level + 1)).join(',\n');
                if (isPython) {
                    return `{\n${props}\n${indent}}`;
                }
                return `{\n${props}\n${indent}}`;

            case 'Property':
                const key = node.key.name;
                const val = this.stitch(node.value, 0);
                return `${indent}${key}: ${val}`;

            // --- WEEK 14 CASES (PRESERVED & UPDATED) ---
            
            case 'ForStatement':                let initCode = '';
                let testCode = '';
                let updateCode = '';
                
                if (node.init) {
                    const rawInit = this.stitch(node.init, 0);
                    initCode = rawInit.replace(/;$/, '');
                }
                
                if (node.test) {
                    const rawTest = this.stitch(node.test, 0);
                    testCode = rawTest.replace(/^\(|\)$/g, ''); 
                }
                
                if (node.update) {
                    updateCode = this.stitch(node.update, 0);
                }
                
                const loopBody = this.stitch(node.body, level + 1);
                
                if (isPython) {
                    const initLine = initCode ? `${indent}${initCode}\n` : '';
                    const whileLine = `${indent}while ${testCode}:\n${loopBody}${indent}    ${updateCode}\n`;
                    return initLine + whileLine;
                }

                return `${indent}for (${initCode}; ${testCode}; ${updateCode}) {\n${loopBody}\n${indent}}`;

            case 'WhileStatement':
                const whileTest = this.stitch(node.test, 0);
                const whileBody = this.stitch(node.body, level + 1);
                
                if (isPython) {
                    return `${indent}while ${whileTest}:\n${whileBody}`;
                }
                return `${indent}while (${whileTest}) {\n${whileBody}\n${indent}}`;

            case 'VariableDeclaration':
                const decls = node.declarations.map(d => this.stitch(d, 0)).join(', ');
                if (isPython) {
                    return `${indent}${decls}`; 
                }
                return `${indent}${node.kind} ${decls};`;

            case 'VariableDeclarator':
                const idName = node.id.name;
                const initVal = node.init ? this.stitch(node.init, 0) : undefined;
                if (isPython) {
                     return initVal !== undefined ? `${idName} = ${initVal}` : idName;
                }                return initVal !== undefined ? `${idName} = ${initVal}` : idName;

            case 'UpdateExpression':
                const argName = node.argument.name;
                const op = node.operator;
                return node.prefix ? `${op}${argName}` : `${argName}${op}`;

            default:
                return `${indent}// Unsupported node type: ${node.type}`;
        }
    }
}

module.exports = { CodeStitcher };
