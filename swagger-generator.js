// file: swagger-generator.js

/**
 * SKYLINE AA-1 - WEEK 38
 * The Swagger Generator: Creates OpenAPI (Swagger) documentation automatically.
 */

class SwaggerGenerator {
    /**
     * Generates a basic swagger.json structure.
     */
    static generate(projectName, routes) {
        return JSON.stringify({
            "openapi": "3.0.0",
            "info": {
                "title": `${projectName} API`,
                "version": "1.0.0",
                "description": `Auto-generated API documentation for ${projectName} by Skyline AA-1`,
                "contact": {
                    "name": "Skyline AA-1",
                    "url": "https://skyline-ai.com"
                }
            },
            "servers": [
                {
                    "url": "http://localhost:3000/api",
                    "description": "Development Server"
                }
            ],
            "components": {
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            },
            "paths": this.generatePaths(routes),
            "tags": [
                { "name": "Auth", "description": "Authentication endpoints" },
                { "name": "Users", "description": "User management endpoints" }
            ]
        }, null, 2);
    }

    /**
     * Helper to generate paths based on common patterns (simplified for Week 38).
     * In future weeks, this will parse the actual route files.
     */    static generatePaths(routes) {
        // Default template paths since we can't easily parse JS files at generation time without eval
        return {
            "/auth/register": {
                "post": {
                    "tags": ["Auth"],
                    "summary": "Register a new user",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": { "type": "string", "example": "user@example.com" },
                                        "password": { "type": "string", "example": "securePassword123" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": { "description": "User registered successfully" },
                        "400": { "description": "Invalid input" }
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "tags": ["Auth"],
                    "summary": "Login user",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": { "type": "string" },
                                        "password": { "type": "string" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": { "description": "Login successful, returns JWT" },
                        "401": { "description": "Invalid credentials" }
                    }
                }            }
        };
    }
}

module.exports = { SwaggerGenerator };
