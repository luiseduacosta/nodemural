// src/database/setupUsers.js
// This script creates the users table if it doesn't exist
// Run this once to initialize the users table
import pool from './db.js';

async function setupUsersTable() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                role ENUM('admin', 'supervisor', 'docente', 'aluno') DEFAULT 'aluno',
                ativo BOOLEAN DEFAULT TRUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await conn.query(query);
        console.log('✅ Users table created or already exists');
        
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    } finally {
        if (conn) {
            await conn.release();
            await pool.end();
        }
    }
}

setupUsersTable();
