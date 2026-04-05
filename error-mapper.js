// file: error-mapper.js

/**
 * SKYLINE AA-1 - WEEK 18
 * The ErrorMapper: Translates raw JavaScript errors into meaningful Graph/Rule errors.
 * 
 * FEATURES:
 * - Parses stack traces to find line numbers.
 * - Maps line numbers back to specific Atoms (Rules) via tracking comments.
 * - Provides user-friendly error messages.
 */

class ErrorMapper {
    /**
     * Creates a map of Line Number -> Atom ID based on the generated code.
     * We look for hidden comments like: /* @atom:ID * /
     * @param {string} code - The full generated code string.
     * @returns {Object} Map like { 5: "atom_123", 8: "atom_456" }
     */
    static buildLineMap(code) {
        const lineMap = {};
        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            // Look for our tracking comment: /* @atom:ID */
            const match = line.match(/\/\*\s*@atom:(.*?)\s*\*\//);
            if (match && match[1]) {
                lineMap[lineNumber] = match[1];
            }
        });

        return lineMap;
    }

    /**
     * Translates a raw error into a mapped Graph error.
     * @param {Error} error - The caught error object.
     * @param {Object} lineMap - The map from buildLineMap().
     * @param {Array} atoms - The original list of atoms (to fetch details).
     * @returns {Object} Enhanced error object.
     */
    static translate(error, lineMap, atoms) {
        const rawMessage = error.message;
        let lineNumber = null;
        let failedAtomId = null;
        let failedAtomDetails = null;

        // 1. Extract Line Number from Stack Trace
        // Format usually: "at evalmachine.<anonymous>:5:10"
        const stackMatch = error.stack ? error.stack.match(/<anonymous>:(\d+):/) : null;
        if (stackMatch) {
            lineNumber = parseInt(stackMatch[1], 10);
        }

        // 2. Map Line Number to Atom ID
        if (lineNumber && lineMap[lineNumber]) {
            failedAtomId = lineMap[lineNumber];
            
            // 3. Find Atom Details
            const atom = atoms.find(a => a.id === failedAtomId);
            if (atom) {
                failedAtomDetails = {
                    id: atom.id,
                    subject: atom.subject,
                    operator: atom.operator,
                    value: atom.value
                };
            }
        }

        // 4. Construct User-Friendly Message
        let friendlyMessage = rawMessage;
        if (failedAtomDetails) {
            friendlyMessage = `Error in Rule: [${failedAtomDetails.subject} ${failedAtomDetails.operator} ${failedAtomDetails.value}]. Detail: ${rawMessage}`;
        } else if (lineNumber) {
            friendlyMessage = `Error at line ${lineNumber}: ${rawMessage}`;
        }

        return {
            originalError: rawMessage,
            mappedError: friendlyMessage,
            lineNumber: lineNumber,
            failedAtomId: failedAtomId,
            failedAtomDetails: failedAtomDetails,
            stack: error.stack
        };
    }
}

module.exports = { ErrorMapper };
