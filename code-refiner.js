// file: code-refiner.js

/**
 * SKYLINE AA-1 - WEEK 39 (STABILITY SPRINT)
 * The Code Refiner: Reviews generated code for logical consistency, syntax errors, and field mismatches.
 * It acts as a "Senior Developer" reviewing a "Junior's" code before commit.
 */

const { globalMemory } = require('./context-memory');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class CodeRefiner {
    /**
     * Refines code based on context (Entity Name, Task Type, DB Type).
     */
    static async refine(code, task) {
        // Skip refinement for non-code files or if code is empty
        if (!code || task.language === 'json' || task.language === 'sql' || task.language === 'markdown') {
            return code;
        }

        const dbType = globalMemory.getPreference('database') || 'postgresql';
        const isMongo = dbType === 'mongodb';
        
        // Extract Entity Name (e.g., "Post.model.js" -> "Post")
        const entityName = task.filename.split('.')[0];
        const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

        console.log(`🧐 [REFINER] Reviewing ${task.filename} for logical consistency...`);

        const systemPrompt = `You are a Senior Software Architect reviewing code for bugs and inconsistencies.
        CONTEXT:
        - Database: ${isMongo ? 'MongoDB (Mongoose)' : 'SQL (Sequelize)'}
        - Entity: ${capitalizedEntity}
        - Task Type: ${task.type}
        
        YOUR JOB:
        1. FIX IMPORTS: Ensure ALL files use CommonJS ('require', 'module.exports'). NO 'import/export'.
        2. FIX LOGIC: 
           - If Entity is 'Post', 'Comment', 'Product': REMOVE 'email', 'password', 'username' fields. These belong ONLY to 'User'.
           - Ensure Controllers use fields that exist in the Model (e.g., if Model has 'title', Controller must use 'req.body.title').
        3. FIX SYNTAX: 
           - If Sequelize: Use '.findAll()', '.findByPk()', '.create()'. NEVER '.find()'.
           - If Mongoose: Use '.find()', '.findById()', '.create()'.
        4. OUTPUT: Return ONLY the corrected raw code. No explanations.`;

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Review and fix this code:\n\n${code}` }
                ],
                model: 'gpt-4o',
                temperature: 0.1 // Low temperature for deterministic fixes
            });

            let refinedCode = completion.choices[0]?.message?.content || "";
            refinedCode = refinedCode.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();

            // Fallback: If AI returns nothing, return original
            if (!refinedCode) return code;

            console.log(`✅ [REFINER] ${task.filename} refined successfully.`);
            return refinedCode;

        } catch (error) {
            console.error(`❌ [REFINER] Failed to refine ${task.filename}:`, error.message);
            return code; // Return original if refinement fails
        }
    }
}

module.exports = { CodeRefiner };
