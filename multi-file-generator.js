// file: multi-file-generator.js

/**
 * SKYLINE AA-1 - WEEK 40 (LAUNCH READY)
 * The Multi-File Generator: Now includes Auto-Wired Server.js for instant deployment.
 */

const { PlanDecomposer } = require('./plan-decomposer');
const { TaskExecutor } = require('./task-executor');
const { ProjectArchitect } = require('./project-architect');
const { DocGenerator } = require('./doc-generator');
const { DbConnectorGenerator } = require('./db-connector-generator');
const { globalMemory } = require('./context-memory');
const fs = require('fs');
const path = require('path');

class MultiFileGenerator {
    static async generate(prompt, projectName = 'skyline-app') {
        console.log(`\n🏗️ [MULTI-FILE] Starting generation for: "${prompt}"`);
        
        // 1. Initialize Architect
        const architect = new ProjectArchitect(projectName);
        await architect.initialize('NODE_EXPRESS');

        // 2. Decompose Plan
        const tasks = await PlanDecomposer.decompose(prompt);
        const generatedFiles = [];

        // 3. Execute Tasks & Collect Files
        for (const task of tasks) {
            try {
                console.log(`\n🔨 Executing task: ${task.type} - ${task.filename}`);
                const enrichedDescription = this.enrichTaskDescription(task, prompt);
                const result = await TaskExecutor.execute({ ...task, description: enrichedDescription });
                let filePath = this.getFilePathForTask(task);
                generatedFiles.push({
                    filename: task.filename,
                    path: filePath,
                    code: result.code,
                    language: result.language,
                    dependencies: result.dependencies || []
                });
            } catch (error) {
                console.error(`❌ Failed task ${task.filename}:`, error.message);
            }
        }

        // 4. Generate Dynamic Package.json
        const allDeps = new Set();
        generatedFiles.forEach(f => {            if (f.dependencies) f.dependencies.forEach(d => allDeps.add(d));
        });
        allDeps.add('express');
        allDeps.add('dotenv');
        allDeps.add('cors'); // 🆕 Added for production safety
        if (globalMemory.getPreference('auth') === 'jwt') allDeps.add('jsonwebtoken');
        if (globalMemory.getPreference('database') === 'postgresql') allDeps.add('pg');
        // Remove swagger if not needed to keep it light, or keep it if you want docs
        // allDeps.add('swagger-ui-express'); 
        
        const packageJsonContent = this.generatePackageJson(projectName, Array.from(allDeps));
        generatedFiles.push({ filename: 'package.json', path: 'package.json', code: packageJsonContent, language: 'json', dependencies: [] });

        // 5. Generate .env.example
        const envContent = DbConnectorGenerator.getEnvTemplate();
        generatedFiles.push({ filename: '.env.example', path: '.env.example', code: envContent, language: 'env', dependencies: [] });

        // 🆕 WEEK 40: GENERATE UNIVERSAL SERVER.JS
        console.log(`\n🔌 [LAUNCHER] Generating Universal Server...`);
        const serverCode = this.generateUniversalServer(generatedFiles);
        generatedFiles.push({ filename: 'server.js', path: 'server.js', code: serverCode, language: 'javascript', dependencies: [] });

        // 6. Generate README
        const readmeFile = await TaskExecutor.generateDocumentation(generatedFiles.map(f => ({ filename: f.filename, code: f.code, dependencies: f.dependencies })), [], prompt);
        generatedFiles.push({ filename: 'README.md', path: 'README.md', code: readmeFile.code, language: 'markdown', dependencies: [] });

        // 7. Save All Files
        console.log(`\n💾 [MULTI-FILE] Saving ${generatedFiles.length} files...`);
        for (const file of generatedFiles) {
            architect.writeFile(file.filename, file.code, this.getFolderForPath(file.path));
        }
        
        console.log(`✅ [MULTI-FILE] Project successfully generated at: ${architect.rootDir}`);
        console.log(`🚀 [LAUNCHER] READY TO DEPLOY! Run: cd ${projectName} && npm install && npm start`);
        
        return { success: true, path: architect.rootDir, files: generatedFiles, fileCount: generatedFiles.length };
    }

    // 🆕 HELPER: Generates a ready-to-run server.js
    static generateUniversalServer(files) {
        const routeFiles = files.filter(f => f.filename.endsWith('.routes.js'));
        const modelFiles = files.filter(f => f.filename.endsWith('.model.js'));
        
        let imports = `const express = require('express');\nconst cors = require('cors');\nrequire('dotenv').config();\n\n`;
        let routeImports = ``;
        let routeUsage = ``;
        let modelImports = ``;

        // Import Models (for DB Sync if needed)
        modelFiles.forEach(file => {            const modelName = file.filename.replace('.model.js', '');
            const varName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
            // Adjust path logic based on your folder structure
            const importPath = file.path.includes('/') ? `../${file.path}` : `./${file.path}`;
            modelImports += `const ${varName} = require('${importPath}');\n`;
        });

        // Import Routes
        routeFiles.forEach(file => {
            const routeName = file.filename.replace('.routes.js', '');
            const varName = routeName + 'Routes';
            const importPath = file.path.includes('/') ? `../${file.path}` : `./${file.path}`;
            
            routeImports += `const ${varName} = require('${importPath}');\n`;
            
            // Simple pluralization for URL (user -> /api/users)
            const urlPrefix = `/${routeName}s`; 
            routeUsage += `app.use('/api${urlPrefix}', ${varName});\n`;
        });

        return `${imports}
// Database Models
${modelImports}
// API Routes
${routeImports}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
const { connectDB } = require('./config/database.config');

// Register Routes
${routeUsage}

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Skyline AA-1 API is running!' });
});

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(\`✅ Server running on http://localhost:\${PORT}\`);
        console.log(\`📡 API Endpoints Active\`);
    });}).catch(err => {
    console.error('❌ DB Connection Failed:', err);
});
`;
    }

    static enrichTaskDescription(task, originalPrompt) {
        let desc = task.description;
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        const authType = globalMemory.getPreference('auth') || 'jwt';
        if (task.type === 'DATABASE') desc += ` Use ${dbType} syntax.`;
        if (task.type === 'API_ROUTE') desc += ` Use ${authType} for authentication.`;
        return desc;
    }

    static getFilePathForTask(task) {
        if (task.type === 'DATABASE_CONFIG' || task.type === 'DATABASE') return `config/${task.filename}`;
        if (task.type === 'API_ROUTE') return `routes/${task.filename}`;
        if (task.type === 'VALIDATION' || task.type === 'API_ENHANCER') return `middleware/${task.filename}`;
        if (task.type === 'API_DOCS') return `docs/${task.filename}`;
        if (task.filename.includes('Model') || task.filename.includes('model')) return `models/${task.filename}`;
        if (task.filename.includes('Controller') || task.filename.includes('controller')) return `controllers/${task.filename}`;
        return `${task.filename}`;
    }

    static getFolderForPath(pathStr) {
        if (pathStr.includes('/')) return pathStr.substring(0, pathStr.lastIndexOf('/'));
        return '';
    }

    static generatePackageJson(name, dependencies) {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'skyline-app';
        return JSON.stringify({
            name: cleanName,
            version: "1.0.0",
            description: "Generated by Skyline AA-1",
            main: "server.js",
            scripts: {
                "start": "node server.js",
                "dev": "nodemon server.js",
                "test": "jest"
            },
            keywords: ["skyline", "ai-generated"],
            author: "Skyline AA-1",
            license: "MIT",
            dependencies: dependencies.reduce((acc, dep) => { acc[dep] = "^latest"; return acc; }, {})
        }, null, 2);
    }
}
module.exports = { MultiFileGenerator };
