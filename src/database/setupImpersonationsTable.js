#!/usr/bin/env node
// Script to create the impersonations table

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createImpersonationsTable() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'create_impersonations_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await connection.query(sql);
        
        console.log('✓ Impersonations table created successfully!');
        console.log('\nTable structure:');
        console.log('- id: Primary key');
        console.log('- admin_id: ID of the admin user');
        console.log('- impersonated_user_id: ID of the user being impersonated');
        console.log('- started_at: When impersonation started');
        console.log('- ended_at: When impersonation ended (NULL if active)');
        console.log('- is_active: Whether this session is currently active');

    } catch (error) {
        console.error('Error creating impersonations table:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

// Run the script
createImpersonationsTable();
