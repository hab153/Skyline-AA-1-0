// file: library-importer.js

/**
 * SKYLINE AA-1 - WEEK 27
 * The Library Importer: Detects needed external modules and injects require() statements.
 */

class LibraryImporter {
    constructor() {
        // Database of common libraries and their import patterns
        this.libraries = {
            'moment': {
                keywords: ['date', 'time', 'format', 'parse', 'duration', 'calendar'],
                import: "const moment = require('moment');",
                package: 'moment'
            },
            'uuid': {
                keywords: ['uuid', 'unique id', 'random id', 'guid'],
                import: "const { v4: uuidv4 } = require('uuid');",
                package: 'uuid'
            },
            'lodash': {
                keywords: ['clone', 'merge', 'debounce', 'throttle', 'shuffle', 'random', 'array', 'object'],
                import: "const _ = require('lodash');",
                package: 'lodash'
            },
            'axios': {
                keywords: ['http request', 'api call', 'fetch', 'get', 'post', 'external api'],
                import: "const axios = require('axios');",
                package: 'axios'
            },
            'bcryptjs': {
                keywords: ['hash', 'password', 'encrypt', 'salt', 'compare'],
                import: "const bcrypt = require('bcryptjs');",
                package: 'bcryptjs'
            },
            'jsonwebtoken': {
                keywords: ['jwt', 'token', 'sign', 'verify', 'auth'],
                import: "const jwt = require('jsonwebtoken');",
                package: 'jsonwebtoken'
            },
            'dotenv': {
                keywords: ['env', 'environment', 'config', 'secret'],
                import: "require('dotenv').config();",
                package: 'dotenv'
            },
            'express': {
                keywords: ['express', 'router', 'app', 'middleware'],
                import: "const express = require('express');",
                package: 'express'            }
        };
    }

    /**
     * Analyzes code and description to detect needed libraries.
     * @param {string} code - The generated code.
     * @param {string} description - The user's request description.
     * @returns {Object} { imports: string[], packages: string[] }
     */
    detectLibraries(code, description) {
        const text = (code + ' ' + description).toLowerCase();
        const detectedImports = [];
        const detectedPackages = new Set();

        for (const [libName, libData] of Object.entries(this.libraries)) {
            // Check if any keyword matches
            const hasKeyword = libData.keywords.some(keyword => text.includes(keyword));
            
            // Avoid duplicate imports if already present in code
            const alreadyImported = code.includes(libData.import);

            if (hasKeyword && !alreadyImported) {
                detectedImports.push(libData.import);
                detectedPackages.add(libData.package);
                console.log(`📦 [LIBRARY] Detected need for: ${libName}`);
            }
        }

        return {
            imports: detectedImports,
            packages: Array.from(detectedPackages)
        };
    }

    /**
     * Injects import statements at the top of the code.
     * @param {string} code - Original code.
     * @param {string[]} imports - Array of import strings.
     * @returns {string} Code with imports injected.
     */
    injectImports(code, imports) {
        if (imports.length === 0) return code;

        // Join all imports with newlines
        const importBlock = imports.join('\n') + '\n\n';
        
        // Inject at the very top
        return importBlock + code;
    }}

module.exports = { LibraryImporter };
