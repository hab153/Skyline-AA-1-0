// file: plan-decomposer.js

/**
 * SKYLINE AA-1 - WEEK 40 (SENIOR ARCHITECT TEMPLATE)
 * Ensures 100% File Completeness: Model + Controller + Route for EVERY entity.
 */

require('dotenv').config();
const OpenAI = require('openai');
const { globalMemory } = require('./context-memory');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Universal Dictionary (Extensible for any future project)
const FIELD_DICTIONARY = {
    'user': ['id', 'email', 'password_hash', 'role', 'created_at'],
    'post': ['id', 'title', 'content', 'author_id', 'published', 'created_at'],
    'comment': ['id', 'text', 'post_id', 'user_id', 'created_at'],
    'product': ['id', 'name', 'description', 'price', 'stock', 'category_id', 'created_at'],
    'order': ['id', 'user_id', 'total_amount', 'status', 'shipping_address', 'created_at'],
    'category': ['id', 'name', 'parent_id'],
    'ticket': ['id', 'subject', 'message', 'status', 'user_id', 'created_at'],
    'invoice': ['id', 'amount', 'due_date', 'status', 'client_id', 'created_at']
};

class PlanDecomposer {
    static async decompose(text) {
        console.log(`\n🧠 [DECOMPOSER] Breaking down task: "${text}"...`);
        const dbType = globalMemory.getPreference('database') || 'PostgreSQL';
        const authType = globalMemory.getPreference('auth') || 'JWT';
        const lowerText = text.toLowerCase();
        
        let fieldInstructions = "\n⚠️ CRITICAL FIELD & CONTROLLER ALIGNMENT (UNIVERSAL):\n";
        let foundEntity = false;
        
        Object.keys(FIELD_DICTIONARY).forEach(entity => {
            if (lowerText.includes(entity)) {
                const fields = FIELD_DICTIONARY[entity].join(', ');
                fieldInstructions += `- For '${entity}': Model MUST have fields: ${fields}.\n`;
                fieldInstructions += `- Controller for '${entity}' MUST use EXACTLY these fields in req.body.\n`;
                foundEntity = true;
            }
        });

        if (!foundEntity) {
            fieldInstructions += "- Analyze the entity name and assign logical fields. Ensure Controller matches Model fields exactly.\n";
        }

        // 🆕 SENIOR ARCHITECT TEMPLATE: ENFORCES FILE COMPLETENESS
        const systemPrompt = `You are a Senior Software Architect. Break request into JSON tasks.        CONTEXT: Database: ${dbType}, Auth: ${authType}
        ${fieldInstructions}
        
        🚨 MANDATORY FILE TRIAD RULE (NON-NEGOTIABLE):
        For EVERY entity mentioned (e.g., User, Post, Comment), you MUST generate exactly THESE 3 files:
        1. MODEL (e.g., "User.model.js")
        2. CONTROLLER (e.g., "user.controller.js")
        3. ROUTE (e.g., "user.routes.js") -> CRITICAL: Do not forget routes!
        
        UNIVERSAL RULES:
        1. First task: DATABASE_CONFIG.
        2. Include API_ENHANCER (Pagination, RateLimit) and API_DOCS.
        3. Model Tasks: Explicitly list fields.
        4. Controller Tasks: Explicitly state "Use fields: [list]".
        5. Route Tasks: Must import the controller and define endpoints (GET, POST, PUT, DELETE).
        
        EXAMPLE OUTPUT STRUCTURE:
        [
          {"type": "DATABASE_CONFIG", "filename": "database.config.js"},
          {"type": "MODEL", "description": "Create User model with fields: id, email...", "filename": "User.model.js"},
          {"type": "CONTROLLER", "description": "Create User controller...", "filename": "user.controller.js"},
          {"type": "API_ROUTE", "description": "Create User routes importing user.controller...", "filename": "user.routes.js"},
          {"type": "API_ENHANCER", "filename": "rateLimiter.middleware.js"},
          {"type": "API_DOCS", "filename": "swagger.json"}
        ]`;

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Tasks: ${text}` }],
                model: 'gpt-4o',
                temperature: 0.2,
                max_tokens: 2000 // Increased tokens to accommodate full route lists
            });
            let content = completion.choices[0]?.message?.content || "";
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const tasks = JSON.parse(content.match(/\[.*\]/s)[0]);
            
            // 🛡️ SAFETY CHECK: Ensure Routes exist for every Controller
            const controllers = tasks.filter(t => t.type === 'CONTROLLER');
            const routes = tasks.filter(t => t.type === 'API_ROUTE');
            
            if (controllers.length > 0 && routes.length === 0) {
                console.warn(`⚠️ [DECOMPOSER] Safety Trigger: Routes missing! Auto-generating placeholder tasks.`);
                // Fallback: If AI fails, we manually inject a generic route task (rare but safe)
                controllers.forEach(ctrl => {
                    const routeName = ctrl.filename.replace('controller', 'routes');
                    tasks.push({
                        type: 'API_ROUTE',
                        description: `Create routes for ${ctrl.filename.split('.')[0]} importing the controller.`,
                        filename: routeName                    });
                });
            }

            console.log(`✅ [DECOMPOSER] Generated ${tasks.length} aligned tasks (Including ${routes.length} Routes).`);
            return tasks;
        } catch (error) {
            throw new Error(`Decomposer failed: ${error.message}`);
        }
    }
}

module.exports = { PlanDecomposer };
