const mariadb = require('mariadb');

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
        const rows = await conn.query('DESCRIBE instituicao');
        console.log(rows);
    } catch (err) {
        console.error('Error describing table:', err);
    } finally {
        if (conn) conn.end();
        pool.end();
    }
}

inspectTable();
