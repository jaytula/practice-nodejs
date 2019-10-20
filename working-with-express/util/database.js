const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'example',
    database: 'node-complete',
    waitForConnection: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();