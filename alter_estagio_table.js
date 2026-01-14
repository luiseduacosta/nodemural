const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess'
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
