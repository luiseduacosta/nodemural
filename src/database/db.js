// src/database/db.js
import mariadb from 'mariadb';
import 'dotenv/config.js';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tccess',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
    queueLimit: 0
});

export default pool;