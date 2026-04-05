// file: server.js

/**
 * SKYLINE AA-1 - WEEK 41 (DEPLOYMENT READY)
 * The Web Server: Now serves BOTH the API (Backend) and the UI (Frontend).
 * Ready for Render, Railway, and Docker.
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path'); // 🆕 Critical for finding index.html

const { GraphContainer } = require('./graph-container');
const { batchCreateAtoms } = require('./factory');
const { connectAtoms } = require('./linker');
const { SandboxRunner } = require('./sandbox-runner');
const { ProjectExporter } = require('./project-exporter');
const { NLParser } = require('./nl-parser');
const { PlanDecomposer } = require('./plan-decomposer');
const { TaskExecutor } = require('./task-executor');
const { globalMemory } = require('./context-memory');
const { GraphVisualizer } = require('./graph-visualizer');
const { AutoTestRunner } = require('./auto-test-runner');
const { MilestoneReporter } = require('./milestone-reporter');
const { DocGenerator } = require('./doc-generator');
const { MultiFileGenerator } = require('./multi-file-generator');

const PORT = process.env.PORT || 5001; // 🆕 Use env var for cloud deployment

const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } 
            catch (e) { reject(new Error('Invalid JSON')); }
        });
        req.on('error', reject);
    });
};

const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
};
// 🆕 WEEK 40: HELPER TO INJECT UNIVERSAL LAUNCHER
function injectUniversalLauncher(projectPath) {
    console.log(`\n🔧 [LAUNCHER] Injecting Universal Server & Routes into ${projectPath}...`);
    const appServerCode = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database.config');
const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs');
const path = require('path');
const controllersDir = path.join(__dirname, 'controllers');
if (fs.existsSync(controllersDir)) {
    fs.readdirSync(controllersDir).forEach(file => {
        if (file.endsWith('.controller.js')) {
            const entity = file.replace('.controller.js', '');
            const controller = require(\`./controllers/\${file}\`);
            const router = require('express').Router();
            const methods = Object.keys(controller);
            const createMethod = methods.find(m => m.startsWith('create') || m === 'register' || m === 'login');
            if (createMethod) {
                if (createMethod === 'login') router.post('/login', controller[createMethod]);
                else if (createMethod === 'register') router.post('/register', controller[createMethod]);
                else router.post('/', controller[createMethod]);
            }
            const getAllMethod = methods.find(m => m.startsWith('getAll'));
            if (getAllMethod) router.get('/', controller[getAllMethod]);
            const getByIdMethod = methods.find(m => m.includes('ById'));
            if (getByIdMethod) router.get('/:id', controller[getByIdMethod]);
            const updateMethod = methods.find(m => m.startsWith('update'));
            if (updateMethod) router.put('/:id', controller[updateMethod]);
            const deleteMethod = methods.find(m => m.startsWith('delete'));
            if (deleteMethod) router.delete('/:id', controller[deleteMethod]);
            app.use(\`/api/\${entity}s\`, router);
            console.log(\`✅ Loaded: /api/\${entity}s\`);
        }
    });
}
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(\`🚀 App running on http://localhost:\${PORT}\`));
}).catch(err => console.error("❌ DB Connection Failed:", err));
`;
    const serverPath = path.join(projectPath, 'server.js');
    fs.writeFileSync(serverPath, appServerCode);
    console.log(`   ✅ Created generated project's server.js`);
    const pkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));        pkg.scripts = pkg.scripts || {};
        pkg.scripts.start = "node server.js";
        pkg.scripts.dev = "nodemon server.js";
        if (!pkg.dependencies.cors) pkg.dependencies.cors = "^latest";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(`   ✅ Updated package.json (Added start script & cors)`);
    }
    console.log(`🎉 [LAUNCHER] Injection Complete! Project is ready to run.`);
}

const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 🆕 DEPLOYMENT CRITICAL: SERVE STATIC FILES (FRONTEND)
    // If the request is for the root URL or a static file, serve it from disk.
    if (req.method === 'GET') {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        // Security: Prevent directory traversal
        if (filePath.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        const fullPath = path.join(__dirname, filePath);
        
        // Check if file exists and serve it
        if (fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath);
            let contentType = 'text/html';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.json') contentType = 'application/json';
            
            res.writeHead(200, { 'Content-Type': contentType });
            const fileStream = fs.createReadStream(fullPath);
            fileStream.pipe(res);
            return;
        }
    }

    // --- API ROUTES ---
    // 🆕 WEEK 26: ROUTE: VISUALIZE GRAPH
    if (req.method === 'POST' && req.url === '/api/visualize') {
        try {
            const data = await parseBody(req);
            const { rules } = data;
            if (!rules || !Array.isArray(rules)) {
                return sendJSON(res, 400, { error: 'Missing "rules" array.' });
            }
            const atoms = batchCreateAtoms(rules);
            const links = [];
            for (let i = 0; i < atoms.length - 1; i++) {
                connectAtoms(atoms[i], atoms[i+1], 'AND');
                links.push({ source: atoms[i].id, target: atoms[i+1].id, type: 'AND' });
            }
            const svg = GraphVisualizer.generateSVG(atoms, links);
            const mermaid = GraphVisualizer.generateMermaid(atoms, links);
            return sendJSON(res, 200, { success: true, svg, mermaid, atomCount: atoms.length });
        } catch (error) {
            console.error(`❌ [VISUALIZER] Error:`, error.message);
            return sendJSON(res, 500, { error: error.message });
        }
    }

    // 🆕 WEEK 24: ROUTE: GET MEMORY STATUS
    if (req.method === 'GET' && req.url === '/api/memory') {
        return sendJSON(res, 200, { success: true, memory: globalMemory.getState() });
    }

    // 🆕 WEEK 24: ROUTE: CLEAR MEMORY
    if (req.method === 'POST' && req.url === '/api/clear-memory') {
        globalMemory.clear();
        return sendJSON(res, 200, { success: true, message: 'Memory cleared' });
    }

    // --- ROUTE: GENERATE CODE (UPGRADED FOR WEEK 40) ---
    if (req.method === 'POST' && req.url === '/api/generate') {
        try {
            const data = await parseBody(req);
            let { rules, text, language = 'javascript' } = data;
            let finalRules = rules;
            let atoms = [];
            let graph = null;
            let generatedCode = '';
            let files = [];
            let isMultiFile = false;
            let projectPath = '';
            let securityReport = { score: 100, issues: [] };
            let contradictionReport = { hasContradictions: false, details: [] };
            let testResults = null;
            if (text && (!rules || !Array.isArray(rules))) {
                console.log(`\n💬 [SMART GENERATE] Received: "${text}"`);
                
                const lowerText = text.toLowerCase();
                if (lowerText.includes('postgresql') || lowerText.includes('postgres')) globalMemory.setPreference('database', 'postgresql');
                if (lowerText.includes('mongodb') || lowerText.includes('mongo')) globalMemory.setPreference('database', 'mongodb');
                if (lowerText.includes('mysql')) globalMemory.setPreference('database', 'mysql');
                if (lowerText.includes('jwt')) globalMemory.setPreference('auth', 'jwt');
                if (lowerText.includes('session')) globalMemory.setPreference('auth', 'session');

                const complexKeywords = ['build', 'create system', 'complete', 'full stack', 'app', 'website', 'api'];
                const isComplex = complexKeywords.some(k => text.toLowerCase().includes(k));

                if (isComplex) {
                    console.log(`🏗️ [COMPLEX] Detected complex request. Triggering Multi-File Generator...`);
                    
                    const projectName = text.split(' ').slice(0, 3).join('_').replace(/[^a-z0-9_]/gi, '') || 'skyline-app';
                    const result = await MultiFileGenerator.generate(text, projectName);
                    
                    isMultiFile = true;
                    projectPath = result.path;
                    files = result.files;
                    generatedCode = files.length > 0 ? files[0].code : '';
                    
                    console.log(`✅ [MULTI-FILE] Generation complete at: ${projectPath}`);
                    injectUniversalLauncher(projectPath);

                } else {
                    try {
                        finalRules = await NLParser.parse(text);
                        if (!finalRules) throw new Error("Parser returned no rules.");
                        console.log(`✅ [SMART GENERATE] Converted via GPT-4o.`);
                    } catch (aiError) {
                        return sendJSON(res, 500, { error: aiError.message });
                    }
                }
            }

            if (!isMultiFile) {
                if (!finalRules || !Array.isArray(finalRules)) {
                    return sendJSON(res, 400, { error: 'Missing "rules" or "text".' });
                }

                console.log(`\n🌐 [API] Generating ${language.toUpperCase()}...`);
                console.log(`   Rules: ${JSON.stringify(finalRules)}`);

                atoms = batchCreateAtoms(finalRules);
                for (let i = 0; i < atoms.length - 1; i++) {
                    connectAtoms(atoms[i], atoms[i+1], 'AND');                }

                graph = new GraphContainer(atoms);
                contradictionReport = graph.scanContradictions();
                if (contradictionReport.hasContradictions) {
                    console.warn(`⚠️ Contradictions found! Proceeding with caution.`);
                }

                if (language === 'python') {
                    generatedCode = graph.generatePythonCode();
                } else {
                    generatedCode = graph.generateFormattedCode();
                }

                testResults = await AutoTestRunner.runAllTests(generatedCode, finalRules, atoms);
                files.push({ filename: 'validateUser.js', code: generatedCode, language: 'javascript', dependencies: [], path: 'src/validateUser.js' });
            }

            if (!isMultiFile || !files.find(f => f.filename === 'README.md')) {
                console.log(`\n📄 [DOCS] Generating Documentation...`);
                const readmeFile = await TaskExecutor.generateDocumentation(
                    files.map(f => ({ filename: f.filename, code: f.code, dependencies: f.dependencies })), 
                    finalRules, 
                    text
                );
                if (!files.find(f => f.filename === 'README.md')) {
                    files.push(readmeFile);
                }
                console.log(`✅ [DOCS] README.md generated.`);
            }

            console.log(`✅ [API] Generation Complete.`);
            
            globalMemory.addToHistory(text, `Generated ${files.length} files`);
            if (!isMultiFile) globalMemory.addFile(`validate_${Date.now()}.js`, language);

            const report = MilestoneReporter.generateReport(
                testResults,
                securityReport, 
                contradictionReport, 
                files.length
            );
            
            MilestoneReporter.printReport(report);

            return sendJSON(res, 200, { 
                success: true, 
                code: generatedCode,
                files: files,
                projectPath: projectPath,                readme: files.find(f => f.filename === 'README.md')?.code || '',
                language: language,
                atomCount: atoms.length,
                usedAI: !!text,
                model: 'gpt-4o',
                isMultiFile: isMultiFile,
                memory: globalMemory.getState(),
                rules: finalRules,
                securityReport: securityReport,
                contradictionReport: contradictionReport,
                testResults: testResults,
                milestoneReport: report
            });

        } catch (error) {
            console.error(`❌ [API] Error:`, error.message);
            return sendJSON(res, 500, { error: error.message });
        }
    }

    // --- ROUTE: TEST CODE ---
    if (req.method === 'POST' && req.url === '/api/test') {
        try {
            const data = await parseBody(req);
            const { code, testData, atoms } = data;
            if (!code || typeof code !== 'string') return sendJSON(res, 400, { error: 'Missing "code".' });
            if (!testData || typeof testData !== 'object') return sendJSON(res, 400, { error: 'Missing "testData".' });
            const result = await SandboxRunner.run(code, testData, 2000, atoms || []);
            if (result.success) {
                return sendJSON(res, 200, { success: true, output: result.result });
            } else {
                return sendJSON(res, 200, { success: false, error: result.error });
            }
        } catch (error) {
            return sendJSON(res, 500, { error: error.message });
        }
    }

    // --- ROUTE: TEST WITH AUTO-CORRECT ---
    if (req.method === 'POST' && req.url === '/api/test-auto') {
        try {
            const data = await parseBody(req);
            const { code, testData, atoms } = data;
            if (!code || typeof code !== 'string') return sendJSON(res, 400, { error: 'Missing "code".' });
            if (!testData || typeof testData !== 'object') return sendJSON(res, 400, { error: 'Missing "testData".' });
            const result = await SandboxRunner.runWithAutoCorrect(code, testData, 2000, atoms || []);
            if (result.success) {
                return sendJSON(res, 200, { success: true, output: result.result, correctionLog: result.correctionLog });
            } else {
                return sendJSON(res, 200, { success: false, error: result.lastError || result.error, correctionLog: result.correctionLog });            }
        } catch (error) {
            return sendJSON(res, 500, { error: error.message });
        }
    }

    // --- ROUTE: DOWNLOAD PROJECT ---
    if (req.method === 'POST' && req.url === '/api/download') {
        try {
            const data = await parseBody(req);
            const { rules } = data;
            if (!rules || !Array.isArray(rules)) return sendJSON(res, 400, { error: 'Missing "rules".' });
            const atoms = batchCreateAtoms(rules);
            for (let i = 0; i < atoms.length - 1; i++) connectAtoms(atoms[i], atoms[i+1], 'AND');
            const graph = new GraphContainer(atoms);
            const jsCode = graph.generateFormattedCode();
            const pyCode = graph.generatePythonCode();
            const zipBuffer = ProjectExporter.createZip(jsCode, pyCode, rules);
            if (res.headersSent) return;
            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="skyline-project.zip"',
                'Content-Length': zipBuffer.length
            });
            res.end(zipBuffer);
        } catch (error) {
            if (!res.headersSent) return sendJSON(res, 500, { error: error.message });
        }
    }

    // 404 for anything else
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found.');
});

server.listen(PORT, () => {
    console.log(`\n🚀 SKYLINE AA-1 SERVER RUNNING!`);
    console.log(`   🌐 Localhost: http://localhost:${PORT}`);
    console.log(`   🧠 AI Model: OpenAI GPT-4o`);
    console.log(`   🏗️ Status: FULL STACK (Backend + Frontend)`);
    console.log(`   ☁️ Ready for Deployment: Render/Railway/Docker`);
    console.log(`   ⚡ Waiting for requests...\n`);
});
