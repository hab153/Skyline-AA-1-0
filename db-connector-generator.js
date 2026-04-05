// file: db-connector-generator.js

/**
 * SKYLINE AA-1 - WEEK 37
 * The DB Connector Generator: Creates robust database connection files (config/database.js).
 * Supports Sequelize (PostgreSQL) and Mongoose (MongoDB).
 */

const { globalMemory } = require('./context-memory');

class DbConnectorGenerator {
    /**
     * Generates the database connection code based on user preferences.
     */
    static generate() {
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        
        console.log(`🔌 [DB CONNECTOR] Generating connection for ${dbType}...`);

        if (dbType === 'mongodb') {
            return this.generateMongooseConnection();
        } else {
            return this.generateSequelizeConnection();
        }
    }

    static generateMongooseConnection() {
        return `const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
    } catch (error) {
        console.error(\`❌ Database Connection Error: \${error.message}\`);
        process.exit(1);
    }
};

module.exports = connectDB;`;
    }

    static generateSequelizeConnection() {
        return `const { Sequelize } = require('sequelize');
require('dotenv').config();
// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    process.env.DB_NAME || 'skyline_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false, // Disable SQL logging in production
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test the connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connection established successfully.');
        
        // Sync models (Use { alter: true } for dev, false for prod)
        // await sequelize.sync({ alter: true }); 
        // console.log('Database & tables created!');
        
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };`;
    }

    /**
     * Generates the .env.example content with DB variables.
     */
    static getEnvTemplate() {
        const dbType = globalMemory.getPreference('database') || 'postgresql';
        
        if (dbType === 'mongodb') {
            return `# Database
MONGO_URI=mongodb://localhost:27017/skyline_db

# Auth
JWT_SECRET=your_super_secret_jwt_key_change_thisBCRYPT_SALT_ROUNDS=10

# Server
PORT=3000
NODE_ENV=development`;
        } else {
            return `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skyline_db
DB_USER=postgres
DB_PASS=your_secure_password_here

# Auth
JWT_SECRET=your_super_secret_jwt_key_change_this
BCRYPT_SALT_ROUNDS=10

# Server
PORT=3000
NODE_ENV=development`;
        }
    }
}

module.exports = { DbConnectorGenerator };
