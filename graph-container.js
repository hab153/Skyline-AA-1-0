// file: graph-container.js

/**
 * SKYLINE AA-1 - WEEK 35 (REFACTORED FOR SCALE)
 * The Graph Container: PURE Logic Engine.
 * Input: Rules/Atoms -> Output: Code String.
 * No file system operations here.
 * 
 * HISTORY PRESERVED (100% INTACT):
 * - Week 3: visualize()
 * - Week 4: traverse()
 * - Week 6: evaluate()
 * - Week 7: scanContradictions()
 * - Week 9: translateToCode()
 * - Week 10: translateToCodeV2()
 * - Week 11: generateAST()
 * - Week 12: generateFinalCode()
 * - Week 13: generateFormattedCode()
 * - Week 14: generateLoopAST()
 * - Week 15: generatePythonCode()
 * - Week 16: generateProjectMap()
 * - Week 18: Atom ID Tracking in AST
 * - Week 29: Optimized Traversal & Linking
 * - Week 31: Fixed CONTAINS Operator in AST
 */

const { JS_SYNTAX_MAP } = require('./syntax-map');
const { TEMPLATES } = require('./template-generator');
const { AST_NODES } = require('./ast-constructor');
const { CodeStitcher } = require('./code-stitcher');
const { CodeFormatter } = require('./code-formatter');
const { PY_SYNTAX_MAP } = require('./python-syntax-map');
const { GraphOptimizer } = require('./graph-optimizer');
const { connectAtoms } = require('./linker');

class GraphContainer {
    constructor(atoms) {
        this.id = 'graph_' + Date.now();
        this.atoms = atoms;
        this.atomCount = atoms.length;
        this.status = "INITIALIZED";
        this.createdAt = new Date().toISOString();
        
        // Create a Map for fast ID lookup
        this.atomMap = new Map();
        atoms.forEach(atom => this.atomMap.set(atom.id, atom));

        // 🆕 WEEK 29: Auto-link if not already linked (Optimized Chain)
        if (atoms.length > 1 && !atoms[0].children.length) {
            GraphOptimizer.linkChain(atoms, 'AND');        }
    }

    // --- WEEK 2/3 FEATURE: STATUS REPORT ---
    getStatusReport() {
        return {
            graphId: this.id,
            count: this.atomCount,
            status: this.status,
            preview: this.atoms.map(a => `${a.subject} ${a.operator} ${a.value}`)
        };
    }

    // --- WEEK 3 FEATURE: VISUALIZATION ---
    visualize() {
        console.log(`\n🕸️ GRAPH VISUALIZATION: ${this.id}`);
        console.log("=".repeat(40));
        if (this.atoms.length === 0) {
            console.log("(Empty Graph)");
            return;
        }
        this.atoms.forEach(atom => {
            let line = `[${atom.subject}]`;
            if (atom.children && atom.children.length > 0) {
                const connections = atom.children.map(c => 
                    `--(${c.type})--> [${c.targetId.substr(0,8)}...]`
                ).join(" & ");
                line += ` ${connections}`;
            } else {
                line += ` (END NODE)`;
            }
            console.log(line);
        });
        console.log("=".repeat(40) + "\n");
    }

    // --- WEEK 4 FEATURE: TRAVERSAL (OPTIMIZED WITH CACHE) ---
    traverse(startAtom) {
        console.log(`⚡ [OPTIMIZER] Starting cached traversal from: [${startAtom.subject}]`);
        const startTime = Date.now();
        const visitedPath = GraphOptimizer.traverseCached(this.atoms, startAtom, this.atomMap);
        const endTime = Date.now();
        console.log(`🏁 TRAVERSAL COMPLETE. Visited ${visitedPath.length} atoms in ${endTime - startTime}ms.`);
        return visitedPath;
    }

    // --- WEEK 6 FEATURE: TRUTH VERIFICATION ---
    evaluate(inputData) {
        if (!this.atoms.length) {
            return {                result: false,
                reason: "No atoms in graph",
                details: [],
                timestamp: new Date().toISOString()
            };
        }

        const result = {
            result: true,
            reason: "All conditions met",
            details: [],
            timestamp: new Date().toISOString()
        };

        console.log(`⚖️ VERIFYING TRUTH against `, inputData);

        const evalNode = (atom, visitedIds = new Set()) => {
            if (visitedIds.has(atom.id)) return true;
            visitedIds.add(atom.id);

            const userValue = inputData[atom.subject];
            let isTrue = false;
            let logEntry = {
                subject: atom.subject,
                operator: atom.operator,
                expected: atom.value,
                actual: userValue,
                result: null
            };

            if (userValue === undefined) {
                isTrue = false;
                logEntry.result = "FAIL (Missing Input)";
            } else {
                switch (atom.operator) {
                    case 'EQUALS': isTrue = (userValue === atom.value); break;
                    case 'NOT_EQUALS': isTrue = (userValue !== atom.value); break;
                    case 'GREATER_THAN': isTrue = (userValue > atom.value); break;
                    case 'LESS_THAN': isTrue = (userValue < atom.value); break;
                    case 'GTE': isTrue = (userValue >= atom.value); break;
                    case 'LTE': isTrue = (userValue <= atom.value); break;
                    case 'CONTAINS': isTrue = (String(userValue).includes(atom.value)); break;
                    case 'EXISTS': isTrue = (userValue !== null && userValue !== undefined); break;
                    default: isTrue = false;
                }
                logEntry.result = isTrue ? "PASS" : "FAIL";
            }
            result.details.push(logEntry);
            console.log(`   🧐 [${atom.subject} ${atom.operator} ${atom.value}] -> ${logEntry.result}`);
            if (!atom.children || atom.children.length === 0) {
                return isTrue;
            }

            const linkType = atom.children[0].type;
            if (linkType === 'AND') {
                if (!isTrue) {
                    result.reason = `Failed at '${atom.subject}': Condition not met (AND Short-Circuit)`;
                    return false;
                }
                for (const link of atom.children) {
                    const child = this.atomMap.get(link.targetId);
                    if (child && !evalNode(child, visitedIds)) {
                        if (!result.reason.includes(child.subject)) {
                            result.reason = `Failed at '${child.subject}': Condition not met`;
                        }
                        return false;
                    }
                }
                return true;
            } 
            else if (linkType === 'OR') {
                if (isTrue) return true;
                for (const link of atom.children) {
                    const child = this.atomMap.get(link.targetId);
                    if (child && evalNode(child, visitedIds)) return true;
                }
                result.reason = `All OR conditions failed for '${atom.subject}'`;
                return false;
            }

            return isTrue;
        };

        const startAtom = this.atoms[0];
        const finalResult = evalNode(startAtom);
        result.result = finalResult;
        
        if (!finalResult && !result.reason) {
            result.reason = "Verification failed";
        }

        console.log(`🏁 FINAL VERDICT: ${finalResult ? '✅ TRUE' : '❌ FALSE'} - ${result.reason}\n`);
        return result;
    }

    // --- WEEK 7 FEATURE: CONTRADICTION DETECTION (STATIC ANALYSIS) ---
    scanContradictions() {
        console.log(`\n🔍 SCANNING FOR LOGICAL CONTRADICTIONS...`);
        const contradictions = [];                const subjects = {};
        this.atoms.forEach(atom => {
            if (!subjects[atom.subject]) {
                subjects[atom.subject] = [];
            }
            subjects[atom.subject].push(atom);
        });

        for (const [subject, atoms] of Object.entries(subjects)) {
            if (atoms.length < 2) continue;
            for (let i = 0; i < atoms.length; i++) {
                for (let j = i + 1; j < atoms.length; j++) {
                    const atomA = atoms[i];
                    const atomB = atoms[j];
                    const conflict = this._checkConflict(atomA, atomB);
                    if (conflict) {
                        const msg = `Contradiction on '${subject}': [${atomA.operator} ${atomA.value}] vs [${atomB.operator} ${atomB.value}]`;
                        contradictions.push(msg);
                        console.log(`   ❌ ${msg}`);
                    }
                }
            }
        }

        if (contradictions.length === 0) {
            console.log(`   ✅ No contradictions found. Logic is consistent.`);
            return { hasContradictions: false, details: [] };
        } else {
            console.log(`   🛑 FOUND ${contradictions.length} CONTRADICTION(S)!`);
            return { hasContradictions: true, details: contradictions };
        }
    }

    // Helper: Define what constitutes a mathematical conflict
    _checkConflict(a, b) {
        const valA = a.value;
        const valB = b.value;
        const opA = a.operator;
        const opB = b.operator;

        if ((opA === 'GREATER_THAN' && opB === 'LESS_THAN' && valA >= valB) ||
            (opA === 'LESS_THAN' && opB === 'GREATER_THAN' && valB >= valA)) {
            return true;
        }
        if ((opA === 'GTE' && opB === 'LTE' && valA > valB) ||
            (opA === 'LTE' && opB === 'GTE' && valB > valA)) {
            return true;
        }
        if (opA === 'EQUALS') {
            if (opB === 'GREATER_THAN' && valA <= valB) return true;            if (opB === 'GTE' && valA < valB) return true;
            if (opB === 'LESS_THAN' && valA >= valB) return true;
            if (opB === 'LTE' && valA > valB) return true;
            if (opB === 'NOT_EQUALS' && valA === valB) return true;
            if (opB === 'EQUALS' && valA !== valB) return true;
        }
        if (opB === 'EQUALS') {
            if (opA === 'GREATER_THAN' && valB <= valA) return true;
            if (opA === 'GTE' && valB < valA) return true;
            if (opA === 'LESS_THAN' && valB >= valA) return true;
            if (opA === 'LTE' && valB > valA) return true;
        }
        return false;
    }

    // ---------------------------------------------------------
    // --- WEEK 9 FEATURE: CODE TRANSLATION ---
    // ---------------------------------------------------------
    translateToCode() {
        console.log(`\n💻 TRANSLATING GRAPH TO JAVASCRIPT CODE...`);
        if (!this.atoms.length) return "// Empty Graph";

        let codeLines = [];
        codeLines.push(`// Auto-generated by Skyline AA-1`);
        codeLines.push(`// Generated at: ${new Date().toISOString()}`);
        codeLines.push(`\nfunction validateInput(data) {`);
        
        const startAtom = this.atoms[0];
        const fullCondition = this._buildConditionString(startAtom, new Set());
        
        codeLines.push(`    if (${fullCondition}) {`);
        codeLines.push(`        return { valid: true, message: "All checks passed" };`);
        codeLines.push(`    } else {`);
        codeLines.push(`        return { valid: false, message: "Validation failed" };`);
        codeLines.push(`    }`);
        codeLines.push(`}`);
        codeLines.push(`\nmodule.exports = { validateInput };`);

        const finalCode = codeLines.join('\n');
        console.log(finalCode);
        return finalCode;
    }

    // Helper: Recursively build condition string using SyntaxMap
    _buildConditionString(atom, visitedIds) {
        if (visitedIds.has(atom.id)) return "";
        visitedIds.add(atom.id);
        const subject = atom.subject;
        const jsOperator = JS_SYNTAX_MAP.operators[atom.operator] || '==';
        const jsValue = JS_SYNTAX_MAP.formatValue(atom.value, atom.dataType);        
        let condition = "";
        if (atom.operator === 'CONTAINS') {
            condition = `${subject}.includes(${jsValue})`;
        } else if (atom.operator === 'EXISTS') {
            condition = `${subject} ${jsOperator}`;
        } else {
            condition = `${subject} ${jsOperator} ${jsValue}`;
        }

        if (atom.children && atom.children.length > 0) {
            const connector = JS_SYNTAX_MAP.connectors[atom.children[0].type] || '&&';
            for (const link of atom.children) {
                const child = this.atomMap.get(link.targetId);
                if (child) {
                    const childCondition = this._buildConditionString(child, visitedIds);
                    if (childCondition) {
                        condition = `(${condition} ${connector} ${childCondition})`;
                    }
                }
            }
        }
        return condition;
    }

    // ---------------------------------------------------------
    // --- WEEK 10 FEATURE: TEMPLATE-BASED GENERATION ---
    // ---------------------------------------------------------
    translateToCodeV2() {
        console.log(`\n🏗️ GENERATING CODE WITH TEMPLATES (WEEK 10)...`);
        if (!this.atoms.length) return "// Empty Graph";

        const startAtom = this.atoms[0];
        const conditionLogic = this._buildConditionString(startAtom, new Set());
        const ifBlock = `    if (${conditionLogic}) {\n        return { valid: true, message: "All checks passed" };\n    }\n    return { valid: false, message: "Validation failed" };`;
        const finalFunction = TEMPLATES.wrapFunction('validateUser', 'data', ifBlock);
        const exportLine = TEMPLATES.createExport(['validateUser']);
        const fullCode = `// Auto-generated by Skyline AA-1 (Week 10)\n// Generated at: ${new Date().toISOString()}\n\n${finalFunction}\n\n${exportLine}`;

        console.log(fullCode);
        return fullCode;
    }

    // ---------------------------------------------------------
    // --- WEEK 11 FEATURE: AST CONSTRUCTION ---
    // ---------------------------------------------------------    
    generateAST() {
        if (!this.atoms || this.atoms.length === 0) {
            return null;
        }
        const startAtom = this.atoms[0];
        const testTree = this._buildASTCondition(startAtom, new Set());

        const returnTrue = AST_NODES.createReturnStatement(
            AST_NODES.createObjectExpression([
                AST_NODES.createProperty('valid', AST_NODES.createLiteral(true)),
                AST_NODES.createProperty('message', AST_NODES.createLiteral("All checks passed"))
            ])
        );

        const returnFalse = AST_NODES.createReturnStatement(
            AST_NODES.createObjectExpression([
                AST_NODES.createProperty('valid', AST_NODES.createLiteral(false)),
                AST_NODES.createProperty('message', AST_NODES.createLiteral("Validation failed"))
            ])
        );

        const ifStatement = AST_NODES.createIfStatement(testTree, [returnTrue], [returnFalse]);
        const validateFunction = AST_NODES.createFunction('validateUser', ['data'], [ifStatement]);
        
        const program = {
            type: 'Program',
            sourceType: 'module',
            body: [validateFunction] 
        };

        return program;
    }

    // 🆕 WEEK 31 FIX: Explicitly handle CONTAINS in AST
    _buildASTCondition(atom, visitedIds) {
        if (!atom || visitedIds.has(atom.id)) {
            return AST_NODES.createLiteral(true);
        }
        visitedIds.add(atom.id);

        const left = {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'data' },
            property: { type: 'Identifier', name: atom.subject },
            computed: false
        };

        const right = AST_NODES.createLiteral(atom.value);

        let testNode;
        // 🆕 WEEK 31 FIX: Explicitly handle CONTAINS
        if (atom.operator === 'CONTAINS') {
            testNode = {                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: left,
                    property: { type: 'Identifier', name: 'includes' },
                    computed: false
                },
                arguments: [right]
            };
        } else {
            // Default mapping for other operators
            let operator = '==';
            if (atom.operator === 'EQUALS') operator = '===';
            if (atom.operator === 'NOT_EQUALS') operator = '!==';
            if (atom.operator === 'GREATER_THAN') operator = '>';
            if (atom.operator === 'LESS_THAN') operator = '<';
            if (atom.operator === 'GTE') operator = '>=';
            if (atom.operator === 'LTE') operator = '<=';
            
            testNode = AST_NODES.createBinaryExpression(operator, left, right);
        }
        
        testNode.atomId = atom.id; 

        // Handle Children (AND/OR)
        if (atom.children && atom.children.length > 0) {
            const linkType = atom.children[0].type;
            const astOperator = (linkType === 'AND') ? '&&' : '||';
            
            for (const link of atom.children) {
                const child = this.atomMap.get(link.targetId);
                if (child) {
                    const rightSide = this._buildASTCondition(child, new Set(visitedIds));
                    testNode = AST_NODES.createLogicalExpression(astOperator, testNode, rightSide);
                }
            }
        }

        return testNode;
    }

    // ---------------------------------------------------------
    // --- WEEK 12 FEATURE: FINAL CODE STITCHING ---
    // ---------------------------------------------------------
    generateFinalCode() {
        console.log(`\n🧵 STITCHING AST TO FINAL CODE (WEEK 12)...`);
        const ast = this.generateAST();
        if (!ast) {
            console.log("⚠️ Warning: Could not generate AST. Returning empty.");
            return "// Empty Graph";        }
        const stitcher = new CodeStitcher();
        let finalCode = "";
        try {
            finalCode = stitcher.stitch(ast);
        } catch (e) {
            console.error("❌ Stitching Error:", e.message);
            return "// Error stitching code";
        }
        const header = `// Auto-generated by Skyline AA-1 (Week 12)\n// Generated at: ${new Date().toISOString()}\n\n`;
        const footer = `\nmodule.exports = { validateUser };`;
        const completeCode = header + finalCode + footer;
        console.log(completeCode);
        return completeCode;
    }

    // ---------------------------------------------------------
    // --- WEEK 13 FEATURE: FORMATTED CODE GENERATION ---
    // ---------------------------------------------------------
    generateFormattedCode() {
        console.log(`\n✨ GENERATING FORMATTED CODE (WEEK 13)...`);
        const rawCode = this.generateFinalCode();
        if (rawCode.startsWith("//")) return rawCode;
        const formatter = new CodeFormatter(4);
        const formattedCode = formatter.format(rawCode);
        console.log(formattedCode);
        return formattedCode;
    }

    // ---------------------------------------------------------
    // --- WEEK 14 FEATURE: LOOP AST GENERATION ---
    // ---------------------------------------------------------
    generateLoopAST() {
        console.log(`\n🔄 GENERATING LOOP AST (WEEK 14)...`);        
        if (!this.atoms || this.atoms.length === 0) return null;

        const startAtom = this.atoms[0];
        const initDeclarator = AST_NODES.createVariableDeclarator('i', AST_NODES.createLiteral(0));
        const init = AST_NODES.createVariableDeclaration('let', [initDeclarator]);
        const limit = startAtom.value; 
        const test = AST_NODES.createBinaryExpression('<', AST_NODES.createIdentifier('i'), AST_NODES.createLiteral(limit));
        const update = AST_NODES.createUpdateExpression('++', 'i');
        const loopBodyContent = [AST_NODES.createReturnStatement(AST_NODES.createLiteral(true))];
        const forLoop = AST_NODES.createForStatement(init, test, update, loopBodyContent);
        const loopFunction = AST_NODES.createFunction('processItems', ['items'], [forLoop]);
        const program = AST_NODES.createProgram([loopFunction]);
        console.log("✅ Loop AST Generated.");
        return program;
    }
    // ---------------------------------------------------------
    // --- WEEK 15 FEATURE: PYTHON CODE GENERATION ---
    // ---------------------------------------------------------    
    generatePythonCode() {
        console.log(`\n🐍 GENERATING PYTHON CODE (WEEK 15)...`);
        const ast = this.generateAST();
        if (!ast) return "# Empty Graph";
        const stitcher = new CodeStitcher('python');
        let pyCode = "";
        try {
            pyCode = stitcher.stitch(ast);
        } catch (e) {
            console.error("❌ Python Stitching Error:", e.message);
            return "# Error stitching code";
        }
        const header = `# Auto-generated by Skyline AA-1 (Week 15)\n# Generated at: ${new Date().toISOString()}\n\n`;
        const footer = `\n# End of generated code`;
        const completeCode = header + pyCode + footer;
        console.log(completeCode);
        return completeCode;
    }

    // ---------------------------------------------------------
    // --- WEEK 16 FEATURE: PROJECT MAP GENERATION ---
    // ---------------------------------------------------------
    generateProjectMap(language = 'javascript') {
        let code = '';
        let filename = '';
        if (language === 'python') {
            code = this.generatePythonCode();
            filename = 'logic.py';
        } else {
            code = this.generateFormattedCode();
            filename = 'logic.js';
        }
        return {
            [filename]: code
        };
    }
}

module.exports = { GraphContainer };
