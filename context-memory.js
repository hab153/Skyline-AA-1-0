// file: context-memory.js

/**
 * SKYLINE AA-1 - WEEK 24
 * The Context Memory: Remembers user preferences, tech stack choices, and previous steps.
 * Persists in RAM for the duration of the server session.
 */

class ContextMemory {
    constructor() {
        this.preferences = {}; // e.g., { database: 'postgresql', auth: 'jwt' }
        this.history = [];     // List of previous requests/responses
        this.generatedFiles = []; // List of files created in this session
    }

    /**
     * Store a specific preference (e.g., "Use MongoDB")
     */
    setPreference(key, value) {
        this.preferences[key] = value;
        console.log(`🧠 [MEMORY] Remembered: ${key} = ${value}`);
    }

    /**
     * Get a specific preference
     */
    getPreference(key) {
        return this.preferences[key] || null;
    }

    /**
     * Add a user request to history
     */
    addToHistory(request, responseSummary) {
        this.history.push({
            timestamp: new Date().toISOString(),
            request,
            summary: responseSummary
        });
        // Keep only last 10 items to save memory
        if (this.history.length > 10) this.history.shift();
    }

    /**
     * Register a generated file
     */
    addFile(filename, type) {
        this.generatedFiles.push({ filename, type, timestamp: new Date() });
    }
    /**
     * Get a summary string to inject into AI prompts
     */
    getPromptContext() {
        let context = "CURRENT SESSION CONTEXT:\n";
        
        if (Object.keys(this.preferences).length > 0) {
            context += "- User Preferences: " + JSON.stringify(this.preferences) + "\n";
        } else {
            context += "- No specific preferences set yet.\n";
        }

        if (this.generatedFiles.length > 0) {
            const files = this.generatedFiles.map(f => f.filename).join(', ');
            context += `- Files already created: ${files}\n`;
        }

        if (this.history.length > 0) {
            const lastReq = this.history[this.history.length - 1];
            context += `- Last Request: "${lastReq.request}" -> ${lastReq.summary}\n`;
        }

        context += "INSTRUCTION: When generating new code, respect these preferences and ensure consistency with existing files.";
        return context;
    }

    /**
     * Clear all memory
     */
    clear() {
        this.preferences = {};
        this.history = [];
        this.generatedFiles = [];
        console.log("🧠 [MEMORY] Context cleared.");
    }

    /**
     * Export state for UI
     */
    getState() {
        return {
            preferences: this.preferences,
            fileCount: this.generatedFiles.length,
            historyCount: this.history.length
        };
    }
}

// Create a global singleton instance
const globalMemory = new ContextMemory();
module.exports = { ContextMemory, globalMemory };
