const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { prototype } = require('pg/lib/type-overrides');
const { query } = require('./db/index');
const linksRouter = require('./routes/links');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/healthz', (req,res) => {
    res.status(200).json({ ok:true, version:'1.0' })
});

app.get('/test-db', async (req, res) => {
    try{
        const result = await query('SELECT NOW()');
        res.json({now: result.rows[0].now});
    } catch {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Database error' })
    }
});

app.use('/api/links', linksRouter);

app.get('/:code', async (req,res) => {
    try{
        const { code } = req.params;
        const result = await query(
            'SELECT url FROM links WHERE code = $1',
            [code]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Not found');
        }

        const originalUrl = result.rows[0].url;

        await query(
            'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
            [code]
        );

        return res.redirect(originalUrl);
    } catch (err) {
        console.error('GET /:code redirect error:', err);
        return res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
});