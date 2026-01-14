const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess'
});

async function createTable() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`
      CREATE TABLE IF NOT EXISTS estagio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        instituicao VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) NOT NULL,
        beneficio VARCHAR(255)
      )
    `);
        console.log('Table estagio created successfully or already exists.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        if (conn) conn.end();
        pool.end();
    }
}

createTable();
