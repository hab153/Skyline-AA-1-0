// file: nl-parser.js
require('dotenv').config();
const OpenAI = require('openai');
const { IntentDecoder } = require('./intent-decoder');
const { getBlueprint } = require('./blueprints');
const { PlanDecomposer } = require('./plan-decomposer');
const { globalMemory } = require('./context-memory');
const { LibraryImporter } = require('./library-importer');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const libraryImporter = new LibraryImporter();

class NLParser {
    static async parse(text) {
        console.log(`\n🧠 [AI] Analyzing Request: "${text}"...`);

        const complexKeywords = ['build', 'create system', 'complete', 'full stack', 'app', 'website'];
        const isComplex = complexKeywords.some(keyword => text.toLowerCase().includes(keyword));

        if (isComplex) {
            console.log(`🏗️ [COMPLEX] Detected complex request. Delegating to PlanDecomposer...`);
            return null; 
        }

        const { intent, blueprint } = IntentDecoder.decode(text);
        const memoryContext = globalMemory.getPromptContext();

        // 🆕 WEEK 30: STRICT GUARDRAILS ADDED
        let systemPrompt = `You are a logic engine for Skyline AA-1. 
Your job is to convert ANY user request into a JSON array of validation rules.
DO NOT output any text other than the JSON array. No markdown, no explanations.

CRITICAL RULES (VIOLATION WILL CAUSE SYSTEM CRASH):
1. ONLY use these operators: EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, GTE, LTE, CONTAINS, EXISTS.
2. NEVER invent new operators like 'NUMBER', 'STRING', 'TYPE', 'ADD', 'SUBTRACT', 'CALCULATE'.
3. If the user asks for an action (e.g., "Make a calculator", "Add numbers"), interpret it as validating the INPUTS for that action (e.g., "operand1 EXISTS", "operand2 EXISTS").
4. NEVER set "value" to null. If checking existence, use operator "EXISTS" and value true.
5. If the request is impossible to convert to validation rules, return an empty array [].

FORMAT: [{"subject":"variable_name","operator":"OPERATOR_FROM_LIST_ABOVE","value":value,"dataType":"TYPE"}]
Allowed DataTypes: NUMBER, STRING, BOOLEAN.

Example Input: "Make a login page"
Example Output: [{"subject":"email","operator":"EXISTS","value":true,"dataType":"BOOLEAN"},{"subject":"password","operator":"EXISTS","value":true,"dataType":"BOOLEAN"}]

Example Input: "Make a calculator"
Example Output: [{"subject":"operand1","operator":"EXISTS","value":true,"dataType":"BOOLEAN"},{"subject":"operand2","operator":"EXISTS","value":true,"dataType":"BOOLEAN"},{"subject":"operation","operator":"EXISTS","value":true,"dataType":"BOOLEAN"}]
Example Input: "Age must be over 18"
Example Output: [{"subject":"age","operator":"GREATER_THAN","value":18,"dataType":"NUMBER"}]`;

        let userPrompt = `Convert this to rules: ${text}`;

        if (blueprint) {
            console.log(`✅ [INTENT] Detected: ${intent}. Applying Blueprint...`);
            
            systemPrompt += `
            
CONTEXT: The user wants to create a "${intent}" feature.
You MUST include the following standard rules for this feature, AND add any extra rules the user specifically requested:
${JSON.stringify(blueprint.rules)}
IMPORTANT: 
1. Start with the blueprint rules above.
2. If the user added specific constraints (e.g., "password must be 12 chars"), modify the blueprint rules to match.
3. NEVER return an empty array.`;
            
            userPrompt = `Create rules for ${intent}: ${text}`;
        } else {
            systemPrompt += `
            
RULES FOR INTERPRETATION:
1. If the user asks for a specific page, assume standard validation rules.
2. If the user gives specific logic, use that exactly.
3. NEVER return an empty array.`;
        }

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4o',
                temperature: 0.2,
                max_tokens: 500
            });

            let content = completion.choices[0]?.message?.content || "";
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const jsonMatch = content.match(/\[.*\]/s);
            if (!jsonMatch) throw new Error("AI did not return valid JSON");
            
            const rules = JSON.parse(jsonMatch[0]);
            
            if (rules.length === 0) {
                throw new Error("AI returned empty rules.");            }

            // 🆕 WEEK 27: Check for library needs in simple requests
            const dummyCode = "// Validation logic for: " + text;
            const { packages } = libraryImporter.detectLibraries(dummyCode, text);
            if (packages.length > 0) {
                console.log(`📦 [LIBRARY] Simple request may need: ${packages.join(', ')}`);
            }

            console.log(`✅ [AI] Generated Rules:`, JSON.stringify(rules));
            return rules;

        } catch (error) {
            console.error(`❌ [AI] OpenAI Error:`, error.message);
            throw new Error(`GPT-4o failed: ${error.message}`);
        }
    }
}
module.exports = { NLParser };
