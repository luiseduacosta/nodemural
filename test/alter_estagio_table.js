import mariadb from 'mariadb';
import 'dotenv/config.js';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tccess'
});

async function alterTable() {
    let conn;
    try {
        conn = await pool.getConnection();

        // List of columns to make nullable
        const queries = [
            "ALTER TABLE estagio MODIFY COLUMN email varchar(90) NULL",
            "ALTER TABLE estagio MODIFY COLUMN bairro varchar(30) NULL",
            "ALTER TABLE estagio MODIFY COLUMN municipio varchar(30) NULL",
            "ALTER TABLE estagio MODIFY COLUMN convenio int(4) NULL",
            "ALTER TABLE estagio MODIFY COLUMN seguro char(1) NULL"
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await conn.query(query);
        }

        console.log('Table estagio altered successfully.');
    } catch (err) {
        console.error('Error altering table:', err);
    } finally {
        if (conn) conn.end();
        pool.end();
    }
}

alterTable();
