const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || '';

const useSSL = !!process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

module.exports = { query, pool };