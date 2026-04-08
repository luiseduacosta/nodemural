import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess'
});

async function inspectTable() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('DESCRIBE visita');
        console.log('visita table structure:');
        console.log(rows);
    } catch (err) {
        console.error('Error describing table:', err);
    } finally {
        if (conn) conn.end();
        pool.end();
    }
}

inspectTable();
