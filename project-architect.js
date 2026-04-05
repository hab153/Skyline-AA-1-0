// file: project-architect.js

/**
 * SKYLINE AA-1 - WEEK 35
 * The Project Architect: Defines project structures, manages folder creation, and handles file organization.
 * Separates "Code Generation" from "File System Management".
 */

const fs = require('fs');
const path = require('path');

class ProjectArchitect {
    constructor(projectName = 'skyline-project') {
        this.projectName = projectName;
        this.rootDir = path.join(process.cwd(), 'skyline-output', projectName);
        this.files = [];
    }

    /**
     * Initializes the project directory structure based on type.
     */
    async initialize(type = 'NODE_EXPRESS') {
        console.log(`\n🏗️ [ARCHITECT] Initializing ${type} project: ${this.projectName}`);
        
        // Create root
        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir, { recursive: true });
        }

        // Create standard folders based on type
        const folders = this.getStandardFolders(type);
        folders.forEach(folder => {
            const folderPath = path.join(this.rootDir, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`   📁 Created directory: /${folder}`);
            }
        });

        // Create .gitignore
        this.writeFile('.gitignore', this.getGitIgnoreContent(type), '');
        
        console.log(`✅ [ARCHITECT] Project structure ready at: ${this.rootDir}`);
    }

    getStandardFolders(type) {
        switch (type) {
            case 'NODE_EXPRESS':
                return ['controllers', 'models', 'routes', 'middleware', 'config', 'tests'];
            case 'PYTHON_FASTAPI':                return ['app', 'app/routers', 'app/models', 'app/schemas', 'tests'];
            case 'REACT_FRONTEND':
                return ['src', 'src/components', 'src/pages', 'src/hooks', 'public'];
            default:
                return ['src'];
        }
    }

    getGitIgnoreContent(type) {
        return `node_modules\n.env\n*.log\n.DS_Store\ndist\nbuild\ncoverage`;
    }

    /**
     * Adds a file to the project queue.
     * @param {string} filePath - Relative path (e.g., 'routes/auth.js')
     * @param {string} content - File content
     * @param {string} folder - Optional folder override
     */
    addFile(filePath, content, folder = '') {
        const finalPath = folder ? path.join(folder, filePath) : filePath;
        this.files.push({ path: finalPath, content });
        console.log(`   📄 Queued: ${finalPath}`);
    }

    /**
     * Writes all queued files to the disk.
     */
    async commit() {
        console.log(`\n💾 [ARCHITECT] Committing ${this.files.length} files...`);
        
        for (const file of this.files) {
            const fullPath = path.join(this.rootDir, file.path);
            const dir = path.dirname(fullPath);

            // Ensure directory exists
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, file.content);
        }

        console.log(`✅ [ARCHITECT] All files committed successfully!`);
        return this.rootDir;
    }

    /**
     * Helper to write a single file immediately (for simple scripts).
     */
    writeFile(filename, content, subFolder = '') {        const targetDir = subFolder ? path.join(this.rootDir, subFolder) : this.rootDir;
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, content);
        console.log(`   💾 Saved: ${filename}`);
        return filePath;
    }
}

module.exports = { ProjectArchitect };
