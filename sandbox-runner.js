// file: sandbox-runner.js

/**
 * SKYLINE AA-1 - WEEK 19 (AUTO-CORRECT LOOP ADDED)
 * Securely executes generated JavaScript code, maps errors, and auto-corrects test data.
 */

const vm = require('vm');
const { ErrorMapper } = require('./error-mapper');
const { AutoCorrect } = require('./auto-correct'); // <-- New Import for Week 19

class SandboxRunner {
    /**
     * Standard Run (Week 18)
     */
    static async run(code, inputData, timeoutMs = 2000, atoms = []) {
        return new Promise((resolve) => {
            try {
                // --- STEP 1: SMART CLEANING (Preserve @atom comments) ---
                const lines = code.split('\n');
                const cleanLines = lines.filter(line => {
                    const t = line.trim();
                    // KEEP comments that have @atom
                    if (t.startsWith('/*') && t.includes('@atom')) return true;
                    
                    // Remove standard comments
                    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return false;
                    
                    // Remove exports/requires
                    if (t.startsWith('module.exports') || t.startsWith('exports.') || t.includes('require(')) return false;
                    
                    return true; 
                });
                
                const cleanCode = cleanLines.join('\n').trim();

                if (!cleanCode) {
                    return resolve({ success: false, result: null, error: "Code was empty after cleaning." });
                }

                // Debug: Log what we are about to run
                console.log("--- [SANDBOX] CLEAN CODE START ---");
                console.log(cleanCode.substring(0, 200) + "...");
                console.log("--- [SANDBOX] CLEAN CODE END ---");

                // --- STEP 2: SETUP SANDBOX ---
                const sandbox = {
                    inputData: inputData,
                    executionResult: undefined,
                    executionError: null                };

                // --- STEP 3: WRAP IN TRY/CATCH BLOCK ---
                const scriptContent = `
                    ${cleanCode}

                    // Immediate Test Execution
                    (function() {
                        try {
                            if (typeof validateUser === 'function') {
                                executionResult = validateUser(inputData);
                            } else if (typeof processItems === 'function') {
                                executionResult = processItems(inputData);
                            } else {
                                throw new Error("No function 'validateUser' or 'processItems' found.");
                            }
                        } catch (e) {
                            executionError = e.message;
                        }
                    })();
                `;

                // --- STEP 4: EXECUTE ---
                const context = vm.createContext(sandbox);
                const script = new vm.Script(scriptContent);
                script.runInContext(context, { timeout: timeoutMs });

                // --- STEP 5: RETURN & MAP ERRORS ---
                if (sandbox.executionError) {
                    const errObj = new Error(sandbox.executionError);
                    if (atoms && atoms.length > 0) {
                        const lineMap = ErrorMapper.buildLineMap(cleanCode);
                        const mapped = ErrorMapper.translate(errObj, lineMap, atoms);
                        resolve({ 
                            success: false, 
                            result: null, 
                            error: mapped.mappedError,
                            debug: mapped 
                        });
                    } else {
                        resolve({ success: false, result: null, error: sandbox.executionError });
                    }
                } else {
                    resolve({ success: true, result: sandbox.executionResult, error: null });
                }
            } catch (err) {
                console.error("[SANDBOX] CRITICAL FAILURE:", err.message);
                if (atoms && atoms.length > 0) {
                    const lineMap = ErrorMapper.buildLineMap(code);
                    const mapped = ErrorMapper.translate(err, lineMap, atoms);                    resolve({ success: false, result: null, error: mapped.mappedError, debug: mapped });
                } else {
                    resolve({ success: false, result: null, error: `Critical System Error: ${err.message}` });
                }
            }
        });
    }

    /**
     * 🆕 WEEK 19: Run with Auto-Correct Loop
     * Attempts to run, and if it fails, fixes the data and retries (Max 3 attempts).
     */
    static async runWithAutoCorrect(code, inputData, timeoutMs = 2000, atoms = [], maxRetries = 3) {
        let currentData = { ...inputData };
        const correctionLog = [];

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`\n🔄 [AUTO-CORRECT] Attempt ${attempt}/${maxRetries}...`);

            // 1. Run Standard Test
            const result = await SandboxRunner.run(code, currentData, timeoutMs, atoms);

            // 2. If Success, Return Immediately
            if (result.success) {
                if (attempt > 1) {
                    result.message = `Passed after auto-correction!`;
                    result.correctionLog = correctionLog;
                }
                return result;
            }

            // 3. If Failed and Retries Left, Try to Fix Data
            console.log(`❌ [AUTO-CORRECT] Attempt ${attempt} failed: ${result.error}`);
            
            if (attempt < maxRetries) {
                // Use AutoCorrect to suggest fixes
                const fix = AutoCorrect.fixData(result.error, currentData, atoms);
                
                if (fix.success) {
                    currentData = fix.correctedData;
                    correctionLog.push(...fix.log);
                    console.log(`🩹 [AUTO-CORRECT] Applied fixes:`, fix.log);
                    // Loop continues to next attempt with new data
                } else {
                    // Could not fix automatically
                    console.log(`⚠️ [AUTO-CORRECT] Could not automatically fix the error.`);
                    break; 
                }
            }
        }
        // If we exit the loop, it means all retries failed
        return {
            success: false,
            result: null,
            error: "Auto-correction failed after multiple attempts.",
            correctionLog: correctionLog,
            lastError: result.error
        };
    }
}

module.exports = { SandboxRunner };
