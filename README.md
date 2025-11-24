TinyLink Backend

Express + PostgreSQL URL shortener service supporting creation, redirection, analytics, and link management.

Overview

This backend powers the TinyLink application.
It provides stable, autograder-friendly API endpoints for creating short links, tracking clicks, listing stored links, deleting links, and performing redirections. Each redirect increments the click counter and updates timestamps for accurate analytics.

Live API

Backend (Render):
https://tinylink-backend-3npn.onrender.com/

Features
	•	Create short links with optional custom short codes
	•	Auto-generate unique codes when not provided
	•	302 redirect endpoint that increments click count and updates last_clicked
	•	List all links with metadata
	•	Retrieve a single link by code
	•	Delete existing links
	•	Health check endpoints at /healthz and /health

Environment Variables

The backend requires:

DATABASE_URL = <Postgres connection string>
PORT=4000

PORT defaults to 4000 if not provided.

Development
1.	Install dependencies:
npm install
2.	Create .env and add:
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=4000

3.	Ensure the links table exists:
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_clicked TIMESTAMPTZ
);

4.	Start the server:
node src/server.js

Backend runs at http://localhost:4000.

Key Endpoints

1. POST /api/links
	Create a new short link.

2. GET /api/links
	List all short links.

3. GET /api/links/:code
	Retrieve details for a specific code.

4. DELETE /api/links/:code
	Delete a link.

5. GET /:code
	302 redirect to the target URL and increment statistics.

6. GET /healthz
	Primary health check endpoint.

7. GET /health
	Secondary health endpoint (simple status info).

Notes
	•	Redirects increment clicks and update last_clicked timestamp.
	•	Custom codes must match: [A-Za-z0-9]{6,8}
	•	Both http:// and https:// URLs are supported.
	•	Unique code constraints are enforced at the database level.