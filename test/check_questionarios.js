
import mariadb from 'mariadb';
import 'dotenv/config.js';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tccess'
});

async function inspect() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SHOW COLUMNS FROM questionarios");
        console.log("Columns in 'questionarios':");
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

inspect();
