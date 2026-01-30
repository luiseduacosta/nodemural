import mariadb from 'mariadb';
import 'dotenv/config.js';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tccess'
});

async function checkData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT COUNT(*) as count FROM estagio');
        console.log('Row count:', rows[0].count);
    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        if (conn) conn.end();
        pool.end();
    }
}

checkData();
