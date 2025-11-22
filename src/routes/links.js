const express = require('express');
const router = express.Router();
const { query } = require('../db/index');

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function isValidCode(code) {
  const pattern = /^[A-Za-z0-9]{6,8}$/;
  return pattern.test(code);
}

function generateRandomCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}

router.post('/', async (req, res) => {
  try {
    // Guard: ensure body exists and is an object (protects against missing Content-Type or invalid JSON)
    if (!req.body || typeof req.body !== 'object') {
      console.warn('POST /api/links - invalid or missing JSON body', { body: req.body });
      return res.status(400).json({ error: 'Invalid request body - expected JSON' });
    }

    // safe destructure after the guard
    const { url, code: customCode } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }
    if (!isValidHttpUrl(url) || !url.includes('.')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let finalCode = customCode;

    if (customCode) {
      if (!isValidCode(customCode)) {
        return res.status(400).json({ error: 'Invalid code format' });
      }

      const existing = await query('SELECT id FROM links WHERE code = $1', [customCode]);

      if (existing.rowCount > 0) {
        return res.status(409).json({ error: 'Code already in use' });
      }
    } else {
      let unique = false;
      let attempts = 0;

      while (!unique && attempts < 5) {
        const generated = generateRandomCode(7);

        const existing = await query('SELECT id FROM links WHERE code = $1', [generated]);

        if (existing.rowCount === 0) {
          finalCode = generated;
          unique = true;
        } else {
          attempts++;
        }
      }

      if (!unique) {
        return res.status(500).json({ error: 'Failed to generate unique code' });
      }
    }

    const insertResult = await query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [finalCode, url]
    );

    const created = insertResult.rows[0];

    return res.status(201).json(created);
  } catch (err) {
    // log stack and helpful context
    console.error('POST /api/links error:', err && (err.stack || err));
    // If Postgres unique-violation, return 409 (safety)
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Code already in use' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT code, url, clicks, created_at, last_clicked FROM links ORDER BY created_at DESC'
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /api/links error:', err && (err.stack || err));
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    const result = await query(
      'SELECT code, url, clicks, created_at, last_clicked FROM links WHERE code = $1',
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Code not found' });
    }

    const link = result.rows[0];
    return res.status(200).json(link);
  } catch (err) {
    console.error('GET /api/links/:code error:', err && (err.stack || err));
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    const deleteResult = await query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Code not found '});
    }

    return res.status(200).json({ message: 'Deleted', deleted: deleteResult.rows[0] });
  } catch (err) {
    console.error('DELETE /api/links/:code error:', err && (err.stack || err));
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;