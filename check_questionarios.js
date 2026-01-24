
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess'
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
