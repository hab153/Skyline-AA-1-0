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
                severity: 'CRITICAL',
                fix: (code, match) => {
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
                    });                    return unused;
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
     */
    analyze(code, imports = []) {
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
                    message: `${this.rules.UNUSED_IMPORT.message}: ${item.name}`,                    severity: 'LOW',
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

        return {
            safe: isSafe,
            issues: issues,
            fixedCode: fixedCode,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }
}

module.exports = { SecurityScanner };
