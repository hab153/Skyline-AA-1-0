// file: task-executor.js

/**
 * SKYLINE AA-1 - WEEK 39 (SELF-CORRECTING STABILITY ENGINE)
 * GOAL: Zero-Bug Generation. Every file is reviewed by CodeRefiner before saving.
 */

const { GraphContainer } = require('./graph-container');
const { batchCreateAtoms } = require('./factory');
const { connectAtoms } = require('./linker');
const { NLParser } = require('./nl-parser');
const { globalMemory } = require('./context-memory');
const { LibraryImporter } = require('./library-importer');
const { SecurityScanner } = require('./security-scanner');
const { DocGenerator } = require('./doc-generator');
const { ProjectArchitect } = require('./project-architect');
const { DbConnectorGenerator } = require('./db-connector-generator');
const { ApiEnhancerGenerator } = require('./api-enhancer-generator');
const { SwaggerGenerator } = require('./swagger-generator');
const { CodeRefiner } = require('./code-refiner'); // <-- NEW IMPORT
const fs = require('fs');
const path = require('path');

const libraryImporter = new LibraryImporter();
const securityScanner = new SecurityScanner();

// 🆕 WEEK 39: UNIVERSAL SYNTAX TEMPLATES
const SEQUELIZE_SYNTAX_RULES = `
⚠️ CRITICAL: YOU ARE USING SEQUELIZE (SQL).
- FIND ALL: "await Model.findAll()"
- FIND BY ID: "await Model.findByPk(id)"
- FIND ONE: "await Model.findOne({ where: { key: value } })"
- CREATE: "await Model.create(data)"
- UPDATE: "await instance.update(data)"
- DELETE: "await instance.destroy()"
`;

const MONGOOSE_SYNTAX_RULES = `
⚠️ CRITICAL: YOU ARE USING MONGOOSE (MONGODB).
- FIND ALL: "await Model.find()"
- FIND BY ID: "await Model.findById(id)"
- FIND ONE: "await Model.findOne({ key: value })"
- CREATE: "await Model.create(data)"
- UPDATE: "await Model.findByIdAndUpdate(id, data, { new: true })"
- DELETE: "await Model.findByIdAndDelete(id)"
`;

class TaskExecutor {
    static async execute(task) {
        console.log(`\n🔨 [EXECUTOR] Running task: ${task.type} - ${task.filename}`);        switch (task.type) {
            case 'DATABASE_CONFIG': return await this.executeDatabaseConfig(task);
            case 'VALIDATION': return await this.executeValidation(task);
            case 'DATABASE': return await this.executeDatabase(task);
            case 'API_ROUTE': return await this.executeAPI(task);
            case 'MODEL': return await this.executeModel(task);
            case 'CONTROLLER': return await this.executeController(task);
            case 'API_ENHANCER': return await this.executeApiEnhancer(task);
            case 'API_DOCS': return await this.executeApiDocs(task);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    static async executeDatabaseConfig(task) {
        console.log(`🔌 [DB CONFIG] Generating database connection file...`);
        let code = DbConnectorGenerator.generate();
        // Refine
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'javascript', dependencies: ['dotenv', globalMemory.getPreference('database') === 'mongodb' ? 'mongoose' : 'sequelize', 'pg'], securityReport: { safe: true, issues: [] } };
    }

    static async executeValidation(task) {
        const rules = await NLParser.parse(task.description);
        const atoms = batchCreateAtoms(rules);
        for (let i = 0; i < atoms.length - 1; i++) connectAtoms(atoms[i], atoms[i+1], 'AND');
        const graph = new GraphContainer(atoms);
        let code = graph.generateFormattedCode();
        const { imports, packages } = libraryImporter.detectLibraries(code, task.description);
        if (imports.length > 0) code = libraryImporter.injectImports(code, imports);
        const scanResult = securityScanner.analyze(code, imports);
        if (scanResult.issues.length > 0) code = scanResult.fixedCode;
        // Refine
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'javascript', dependencies: packages, securityReport: scanResult };
    }

    static async executeDatabase(task) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: `Database Expert. Raw ${dbType} SQL only. One single script.` },
                { role: 'user', content: `Schema for: ${task.description}.` }
            ],
            model: 'gpt-4o',
            temperature: 0.1
        });
        let code = completion.choices[0]?.message?.content || "";
        code = code.replace(/```sql/g, '').replace(/```/g, '').trim();        // Refine (SQL logic check)
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'sql', dependencies: [], securityReport: { safe: true, issues: [] } };
    }

    static async executeAPI(task) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: `Node.js Expert. Express Routes. Import controller. Use rate limiters. CommonJS only.` },
                { role: 'user', content: `Routes for: ${task.description}.` }
            ],
            model: 'gpt-4o',
            temperature: 0.1
        });
        let code = completion.choices[0]?.message?.content || "";
        code = code.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();
        const { imports, packages } = libraryImporter.detectLibraries(code, task.description);
        if (imports.length > 0) code = libraryImporter.injectImports(code, imports);
        const scanResult = securityScanner.analyze(code, imports);
        if (scanResult.issues.length > 0) code = scanResult.fixedCode;
        // Refine
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'javascript', dependencies: packages, securityReport: scanResult };
    }

    static async executeModel(task) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        const isMongo = dbType === 'mongodb';
        const syntaxRules = isMongo ? MONGOOSE_SYNTAX_RULES : SEQUELIZE_SYNTAX_RULES;
        const ormName = isMongo ? 'Mongoose' : 'Sequelize';

        const prompt = `You are a Node.js Expert. Create a ${ormName} Model.
        REQUIREMENT: "${task.description}"
        ${syntaxRules}
        UNIVERSAL RULES:
        1. COMMONJS ONLY: "const { Sequelize } = require('sequelize');" & "module.exports = Model;".
        2. Import DB from '../config/database.config'.
        3. Follow fields in description EXACTLY.
        4. Output ONLY raw code.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o',
            temperature: 0.1
        });
                let code = completion.choices[0]?.message?.content || "";
        code = code.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();
        
        // Fallback fixes
        if (!isMongo && code.includes('import {')) {
            code = code.replace(/import \{ (.*) \} from 'sequelize';/g, "const { $1 } = require('sequelize');");
            code = code.replace(/export default /g, "module.exports = ");
        }

        const { imports, packages } = libraryImporter.detectLibraries(code, task.description);
        if (!isMongo && !packages.includes('sequelize')) packages.push('sequelize');
        if (isMongo && !packages.includes('mongoose')) packages.push('mongoose');
        
        const scanResult = securityScanner.analyze(code, imports);
        if (scanResult.issues.length > 0) code = scanResult.fixedCode;
        
        // 🆕 WEEK 39: REFINE (Crucial for Field Logic)
        code = await CodeRefiner.refine(code, task);
        
        return { filename: task.filename, code, language: 'javascript', dependencies: packages, securityReport: scanResult };
    }

    static async executeController(task) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        const isMongo = dbType === 'mongodb';
        const syntaxRules = isMongo ? MONGOOSE_SYNTAX_RULES : SEQUELIZE_SYNTAX_RULES;
        
        const entityName = task.filename.split('.')[0].charAt(0).toUpperCase() + task.filename.split('.')[0].slice(1);
        const modelName = entityName.includes('Model') ? entityName : `${entityName}`;

        const prompt = `You are a Node.js Expert. Create a Controller for ${entityName}.
        REQUIREMENT: "${task.description}"
        DATABASE TYPE: ${isMongo ? 'MONGODB (Mongoose)' : 'SQL (Sequelize)'}
        ${syntaxRules}
        UNIVERSAL RULES:
        1. COMMONJS ONLY: "const Model = require('../models/${modelName}.model');" & "module.exports = {...}".
        2. MATCH FIELDS: If Model has 'email', use 'email' in req.body. NEVER mix 'username' with 'email'.
        3. USE ENV VARS: process.env.JWT_SECRET, BCRYPT_SALT_ROUNDS.
        4. Output ONLY raw code.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o',
            temperature: 0.1
        });
        
        let code = completion.choices[0]?.message?.content || "";
        code = code.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();        
        const { imports, packages } = libraryImporter.detectLibraries(code, task.description);
        if (!packages.includes('jsonwebtoken')) packages.push('jsonwebtoken');
        if (!packages.includes('bcryptjs')) packages.push('bcryptjs');
        
        const scanResult = securityScanner.analyze(code, imports);
        if (scanResult.issues.length > 0) code = scanResult.fixedCode;
        
        // 🆕 WEEK 39: REFINE (Crucial for Field Logic)
        code = await CodeRefiner.refine(code, task);
        
        return { filename: task.filename, code, language: 'javascript', dependencies: packages, securityReport: scanResult };
    }

    static async executeApiEnhancer(task) {
        let code = '';
        if (task.filename.includes('pagination')) code = ApiEnhancerGenerator.generatePagination();
        else if (task.filename.includes('filter')) code = ApiEnhancerGenerator.generateFilterSort();
        else if (task.filename.includes('rateLimiter')) code = ApiEnhancerGenerator.generateRateLimiter();
        // Refine
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'javascript', dependencies: task.filename.includes('rateLimiter') ? ApiEnhancerGenerator.getDependencies() : [], securityReport: { safe: true, issues: [] } };
    }

    static async executeApiDocs(task) {
        const projectName = task.description.split('for')[1]?.trim() || 'Skyline App';
        let code = SwaggerGenerator.generate(projectName, []);
        // Refine
        code = await CodeRefiner.refine(code, task);
        return { filename: task.filename, code, language: 'json', dependencies: ['swagger-ui-express'], securityReport: { safe: true, issues: [] } };
    }

    static async generateDocumentation(files, rules, description) {
        const allDeps = new Set();
        files.forEach(f => { if (f.dependencies) f.dependencies.forEach(d => allDeps.add(d)); });
        return { filename: 'README.md', code: DocGenerator.createREADME(files, rules, description, Array.from(allDeps)), language: 'markdown', dependencies: [] };
    }

    static async saveToFile(fileObj, projectName = 'default-project') {
        const currentArchitect = new ProjectArchitect(projectName);
        await currentArchitect.initialize('NODE_EXPRESS');
        const subFolder = fileObj.language === 'sql' ? 'config' : (fileObj.language === 'markdown' || fileObj.language === 'json' ? '' : 'src');
        currentArchitect.writeFile(fileObj.filename, fileObj.code, subFolder);
        if (fileObj.dependencies && fileObj.dependencies.length > 0) {
            const depsPath = path.join(currentArchitect.rootDir, 'dependencies.txt');
            let depsContent = fs.existsSync(depsPath) ? fs.readFileSync(depsPath, 'utf8') : '';
            fileObj.dependencies.forEach(dep => { if (!depsContent.includes(dep)) depsContent += dep + '\n'; });
            fs.writeFileSync(depsPath, depsContent);
        }
        return path.join(currentArchitect.rootDir, fileObj.filename);    }
}

module.exports = { TaskExecutor };
