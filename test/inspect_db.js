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
        const rows = await conn.query("SHOW COLUMNS FROM estagiarios");
        console.log(JSON.stringify(rows, null, 2));

        // Also check if there is a row
        const data = await conn.query("SELECT * FROM configuracoes");
        console.log("Data count:", data.length);
        if (data.length > 0) console.log("First row:", data[0]);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

inspect();
