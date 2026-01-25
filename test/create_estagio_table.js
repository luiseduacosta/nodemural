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
        beneficio VARCHAR(255) NULL,
        email VARCHAR(90) NULL,
        telefone VARCHAR(15) NULL,
        celular VARCHAR(15) NULL,
        cep VARCHAR(8) NULL,
        endereco VARCHAR(255) NULL,
        bairro VARCHAR(30) NULL,
        municipio VARCHAR(30) NULL,
        observacao VARCHAR(255) NULL
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
