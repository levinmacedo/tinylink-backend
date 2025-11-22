const express = require('express')
const router = express.Router()
const pkg = require('../../package.json')
const { query } = require('../db/index')

router.get('/health', async (req, res) => {
  const uptimeSeconds = process.uptime()
  const serverTime = new Date().toISOString()

  let dbStatus = { ok: false }
  try {
    await query('SELECT 1')
    dbStatus = { ok: true }
  } catch (err) {
    dbStatus = { ok: false, message: err.message }
  }

  res.json({
    ok: true,
    version: pkg.version || '1.0',
    uptime_seconds: Math.floor(uptimeSeconds),
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
    server_time: serverTime,
    db: dbStatus
  })
})

module.exports = router