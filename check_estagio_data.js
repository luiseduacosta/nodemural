const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess'
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
