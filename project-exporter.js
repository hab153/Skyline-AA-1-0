// file: project-exporter.js

/**
 * SKYLINE AA-1 - WEEK 20
 * The Project Exporter: Bundles generated code into a downloadable ZIP file.
 * 
 * FEATURES:
 * - Creates a ZIP archive in memory.
 * - Includes JS file, Python file, and a README.md.
 * - Returns a Buffer ready for HTTP transmission.
 */

const AdmZip = require('adm-zip');

class ProjectExporter {
    /**
     * Creates a ZIP buffer containing the project files.
     * @param {string} jsCode - The generated JavaScript code.
     * @param {string} pyCode - The generated Python code.
     * @param {array} rules - The original rules (for documentation).
     * @returns {Buffer} The ZIP file buffer.
     */
    static createZip(jsCode, pyCode, rules) {
        const zip = new AdmZip();

        // 1. Add JavaScript File
        zip.addFile('validateUser.js', Buffer.from(jsCode, 'utf8'));

        // 2. Add Python File
        zip.addFile('validateUser.py', Buffer.from(pyCode, 'utf8'));

        // 3. Add README.md
        const readmeContent = `# Skyline AA-1 Generated Project
Generated at: ${new Date().toISOString()}

## Rules Used:
${JSON.stringify(rules, null, 2)}

## How to Run

### JavaScript
\`\`\`bash
node validateUser.js
\`\`\`

### Python
\`\`\`bash
python validateUser.py
\`\`\`

## Note
This code was generated and verified by Skyline AA-1 (Week 20).
`;
        zip.addFile('README.md', Buffer.from(readmeContent, 'utf8'));

        // 4. Return Buffer
        return zip.toBuffer();
    }
}

module.exports = { ProjectExporter };
