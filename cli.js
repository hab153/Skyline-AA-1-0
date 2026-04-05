#!/usr/bin/env node
// file: cli.js

/**
 * SKYLINE AA-1 - WEEK 28 (SECURITY SCANNER ADDED)
 * Command Line Interface for generating code directly from the terminal.
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { NLParser } = require('./nl-parser');
const { PlanDecomposer } = require('./plan-decomposer');
const { TaskExecutor } = require('./task-executor');
const { globalMemory } = require('./context-memory');

program
    .name('skyline')
    .description('🏙️ Skyline AA-1: AI-Powered Code Generator CLI')
    .version('1.0.0');

program
    .command('generate <prompt>')
    .alias('g')
    .description('Generate code from a natural language prompt')
    .option('-v, --visualize', 'Open graph visualization in browser')
    .action(async (prompt, options) => {
        console.log(chalk.blue('\n🏙️  Skyline AA-1 CLI Starting...'));
        console.log(chalk.gray(`Processing: "${prompt}"\n`));

        try {
            const complexKeywords = ['build', 'create system', 'complete', 'full stack', 'app', 'website'];
            const isComplex = complexKeywords.some(k => prompt.toLowerCase().includes(k));
            let files = [];
            let rules = [];
            let totalIssues = 0;

            if (isComplex) {
                console.log(chalk.yellow('🏗️  Detected complex request. Decomposing plan...'));
                const tasks = await PlanDecomposer.decompose(prompt);
                for (const task of tasks) {
                    try {
                        const result = await TaskExecutor.execute(task);
                        files.push(result);
                        await TaskExecutor.saveToFile(result);
                        if (result.securityReport) totalIssues += result.securityReport.issues.length;
                    } catch (err) {
                        console.error(chalk.red(`❌ Failed task ${task.type}: ${err.message}`));
                    }                }
            } else {
                console.log(chalk.green('✨ Generating single file logic...'));
                rules = await NLParser.parse(prompt);
                if (!rules) throw new Error("No rules generated.");
                
                const { GraphContainer } = require('./graph-container');
                const { batchCreateAtoms } = require('./factory');
                const { connectAtoms } = require('./linker');
                const { LibraryImporter } = require('./library-importer');
                const { SecurityScanner } = require('./security-scanner');
                
                const atoms = batchCreateAtoms(rules);
                for (let i = 0; i < atoms.length - 1; i++) connectAtoms(atoms[i], atoms[i+1], 'AND');
                const graph = new GraphContainer(atoms);
                let code = graph.generateFormattedCode();

                const libImporter = new LibraryImporter();
                const { imports, packages } = libImporter.detectLibraries(code, prompt);
                if (imports.length > 0) {
                    code = libImporter.injectImports(code, imports);
                }

                // 🆕 WEEK 28: Scan Simple Requests
                const scanner = new SecurityScanner();
                const scanResult = scanner.analyze(code, imports);
                if (scanResult.issues.length > 0) {
                    code = scanResult.fixedCode;
                    totalIssues += scanResult.issues.length;
                }
                
                const result = { filename: 'validateUser.js', code, language: 'javascript', dependencies: packages, securityReport: scanResult };
                files.push(result);
                await TaskExecutor.saveToFile(result);
            }

            console.log(chalk.green('\n✅ SUCCESS! Files generated:'));
            files.forEach(f => console.log(chalk.gray(`   - ${f.filename}`)));
            console.log(chalk.green(`   📂 Saved to: ${path.resolve('./skyline-output')}\n`));

            // 🆕 WEEK 28: Security Report
            if (totalIssues > 0) {
                console.log(chalk.yellow(`🛡️  Security Report: ${totalIssues} issues found (Auto-fixed where possible).`));
                console.log(chalk.gray(`   Check skyline-output/security-report.json for details.\n`));
            } else {
                console.log(chalk.green(`🛡️  Security Report: Code is clean! No issues detected.\n`));
            }

            // 🆕 WEEK 27: Prompt for Dependencies
            const depsPath = path.join(process.cwd(), 'skyline-output', 'dependencies.txt');            if (fs.existsSync(depsPath)) {
                const deps = fs.readFileSync(depsPath, 'utf8').trim().split('\n').filter(d => d);
                if (deps.length > 0) {
                    console.log(chalk.yellow('📦 Detected Dependencies:'));
                    deps.forEach(d => console.log(chalk.gray(`   - ${d}`)));
                    console.log(chalk.cyan(`\nRun this command to install them:`));
                    console.log(chalk.bold(`   cd skyline-output && npm install ${deps.join(' ')}\n`));
                }
            }

            if (options.visualize && rules.length > 0) {
                console.log(chalk.cyan('👁️  To view the graph, start the server and open: http://localhost:5001'));
                console.log(chalk.cyan('   (Paste your rules in JSON mode to see the visualization)\n'));
            }

        } catch (error) {
            console.error(chalk.red(`\n❌ ERROR: ${error.message}\n`));
            process.exit(1);
        }**UNDERSTOOD.** 🫡🔒
**SECURITY PROTOCOL MAXIMUM:** I will **NOT** remove, delete, or change a single letter of your existing logic in `task-executor.js`, `cli.js`, or `index.html`.
*   **Strategy:** I will provide the **FULL FILES** with the new Week 28 features **appended/integrated** safely.
*   **New File:** I will create `security-scanner.js` (The "Guardian").
*   **Upgrades:**
    *   `task-executor.js`: Run code through the scanner before returning.
    *   `cli.js`: Display security report.
    *   `index.html`: Show security status panel.

Here is the complete package for **Week 28: SecurityScanner**.

---

### 1️⃣ ➕ NEW FILE: `security-scanner.js`
*Create this file. This is the "Guardian" that scans for vulnerabilities and unused imports.*

```javascript
// file: security-scanner.js

/**
 * SKYLINE AA-1 - WEEK 28
 * The Security Scanner: Detects vulnerabilities, hardcoded secrets, and unused imports.
 */

class SecurityScanner {
    constructor() {
        // Rules for detecting issues
        this.rules = {
            HARDCODED_SECRET: {
                pattern: /(password|secret|key|token|api_key)\s*[:=]\s*['"][^'"]{4,}['"]/gi,
                message: "Hardcoded secret detected!",
                severity: 'CRITICAL',                fix: (code, match) => {
                    // Replace hardcoded value with process.env.VAR
                    const varName = match.split('=')[0].trim().replace(/[:=]/g, '').trim();
                    const envVar = varName.toUpperCase().replace(/\s+/g, '_');
                    return code.replace(match, `${varName} = process.env.${envVar}`);
                }
            },
            EVAL_USAGE: {
                pattern: /\beval\s*\(/gi,
                message: "Use of eval() is dangerous!",
                severity: 'HIGH',
                fix: null // Cannot auto-fix safely
            },
            SQL_INJECTION: {
                pattern: /query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`\s*\)/gi,
                message: "Potential SQL Injection risk (Template literals in query)",
                severity: 'HIGH',
                fix: null
            },
            UNUSED_IMPORT: {
                // Checks if an imported variable is never used in the rest of the code
                check: (code, imports) => {
                    const unused = [];
                    imports.forEach(imp => {
                        // Extract variable name from import string (e.g., "const _ = require('lodash')" -> "_")
                        const match = imp.match(/const\s+([a-zA-Z_$][\w$]*)\s*=/);
                        if (match) {
                            const varName = match[1];
                            // Count occurrences in code (excluding the import line itself)
                            const codeWithoutImport = code.replace(imp, '');
                            const regex = new RegExp(`\\b${varName}\\b`, 'g');
                            const count = (codeWithoutImport.match(regex) || []).length;
                            if (count === 0) unused.push({ name: varName, import: imp });
                        }
                    });
                    return unused;
                },
                message: "Unused import detected",
                severity: 'LOW',
                fix: (code, unusedItem) => code.replace(unusedItem.import + '\n', '')
            }
        };
    }

    /**
     * Analyzes code for security issues.
     * @param {string} code - The code to scan.
     * @param {string[]} imports - Array of import strings to check for unused libs.
     * @returns {Object} { safe: boolean, issues: [], fixedCode: string }
     */    analyze(code, imports = []) {
        const issues = [];
        let fixedCode = code;

        // 1. Check Regex Rules
        for (const [ruleName, rule] of Object.entries(this.rules)) {
            if (rule.pattern) {
                let match;
                // Reset regex lastIndex
                rule.pattern.lastIndex = 0; 
                while ((match = rule.pattern.exec(fixedCode)) !== null) {
                    issues.push({
                        rule: ruleName,
                        message: rule.message,
                        severity: rule.severity,
                        line: fixedCode.substring(0, match.index).split('\n').length,
                        context: match[0]
                    });

                    // Auto-fix if available
                    if (rule.fix && ruleName !== 'UNUSED_IMPORT') {
                        fixedCode = rule.fix(fixedCode, match[0]);
                        console.log(`🛡️ [SCANNER] Auto-fixed ${ruleName}`);
                    }
                }
            }
        }

        // 2. Check Unused Imports
        if (imports.length > 0 && this.rules.UNUSED_IMPORT.check) {
            const unusedList = this.rules.UNUSED_IMPORT.check(fixedCode, imports);
            unusedList.forEach(item => {
                issues.push({
                    rule: 'UNUSED_IMPORT',
                    message: `${this.rules.UNUSED_IMPORT.message}: ${item.name}`,
                    severity: 'LOW',
                    line: 1,
                    context: item.import
                });
                // Auto-remove unused import
                if (this.rules.UNUSED_IMPORT.fix) {
                    fixedCode = this.rules.UNUSED_IMPORT.fix(fixedCode, item);
                    console.log(`🛡️ [SCANNER] Removed unused import: ${item.name}`);
                }
            });
        }

        const isSafe = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length === 0;

        return {            safe: isSafe,
            issues: issues,
            fixedCode: fixedCode,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }
}

module.exports = { SecurityScanner };
