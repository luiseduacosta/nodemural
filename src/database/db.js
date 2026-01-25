// src/database/db.js
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tccess',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;