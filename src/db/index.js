const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function query(text, params){
    return pool.query(text, params);
}

module.exports = {
    query,
};