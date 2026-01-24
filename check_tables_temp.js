
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
        const rows = await conn.query("SHOW TABLES");
        console.log("Tables:");
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });

        // Check specifically for questoes and show columns if it exists
        const tableExists = rows.some(row => Object.values(row)[0] === 'questoes');
        if (tableExists) {
            console.log("\nColumns in 'questoes':");
            const columns = await conn.query("SHOW COLUMNS FROM questoes");
            console.log(columns);
        } else {
            console.log("\nTable 'questoes' does not exist.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

inspect();
