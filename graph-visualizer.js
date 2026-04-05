// file: graph-visualizer.js

/**
 * SKYLINE AA-1 - WEEK 26
 * The Graph Visualizer: Converts logic atoms and links into an SVG diagram.
 */

class GraphVisualizer {
    /**
     * Generates an SVG string representing the logic graph.
     * @param {Array} atoms - Array of atom objects { id, subject, operator, value }
     * @param {Array} links - Array of link objects { source, target, type }
     * @returns {string} SVG XML string
     */
    static generateSVG(atoms, links) {
        const width = 800;
        const height = 400;
        const nodeRadius = 45;
        const startX = 100;
        const startY = height / 2;
        const stepX = 150;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b; border-radius:8px;">`;
        
        // Define Styles
        svg += `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
                <style>
                    .node-circle { fill: #1e293b; stroke: #3b82f6; stroke-width: 2px; }
                    .node-text { fill: #f8fafc; font-family: sans-serif; font-size: 12px; text-anchor: middle; dominant-baseline: middle; }
                    .link-line { stroke: #94a3b8; stroke-width: 2px; marker-end: url(#arrowhead); }
                    .label-text { fill: #f59e0b; font-family: sans-serif; font-size: 10px; text-anchor: middle; background: #1e293b; }
                </style>
            </defs>
        `;

        // Draw Links first (so they appear behind nodes)
        links.forEach((link, index) => {
            const sourceAtom = atoms.find(a => a.id === link.source);
            const targetAtom = atoms.find(a => a.id === link.target);
            
            if (!sourceAtom || !targetAtom) return;

            const x1 = startX + (atoms.indexOf(sourceAtom) * stepX);
            const y1 = startY;
            const x2 = startX + (atoms.indexOf(targetAtom) * stepX);
            const y2 = startY;

            svg += `<line x1="${x1 + nodeRadius}" y1="${y1}" x2="${x2 - nodeRadius}" y2="${y2}" class="link-line" />`;
            
            // Add Link Label (AND/OR)
            const midX = (x1 + x2) / 2;
            svg += `<text x="${midX}" y="${y1 - 15}" class="label-text">${link.type}</text>`;
        });

        // Draw Nodes
        atoms.forEach((atom, index) => {
            const x = startX + (index * stepX);
            const y = startY;

            // Circle
            svg += `<circle cx="${x}" cy="${y}" r="${nodeRadius}" class="node-circle" />`;
            
            // Subject Text (Top)
            svg += `<text x="${x}" y="${y - 15}" class="node-text" style="font-weight:bold; fill:#3b82f6;">${atom.subject}</text>`;
            
            // Operator Text (Middle)
            svg += `<text x="${x}" y="${y}" class="node-text" style="fill:#f59e0b;">${atom.operator}</text>`;
            
            // Value Text (Bottom)
            svg += `<text x="${x}" y="${y + 15}" class="node-text">${atom.value}</text>`;
        });

        svg += `</svg>`;
        return svg;
    }

    /**
     * Generates Mermaid.js syntax for the graph (alternative format).
     */
    static generateMermaid(atoms, links) {
        let mermaid = "graph LR\n";
        atoms.forEach(atom => {
            const label = `${atom.subject}[${atom.subject} ${atom.operator} ${atom.value}]`;
            mermaid += `    ${atom.id}(${label})\n`;
        });

        links.forEach(link => {
            mermaid += `    ${link.source} -->|${link.type}| ${link.target}\n`;
        });

        return mermaid;
    }
}

module.exports = { GraphVisualizer };
