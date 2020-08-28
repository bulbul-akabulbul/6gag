const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_socialnetwork',
    password: process.env.DBPASS,
    port: 5432,
});

module.exports = pool;