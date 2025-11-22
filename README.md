TinyLink Backend
Express + PostgreSQL URL shortener service.

Features:
	•	Create short links
	•	Auto-generate codes when not provided
	•	Redirect endpoint with click tracking
	•	List, get, delete links
	•	Health endpoints (/healthz and /health)

Environment Variables:
DATABASE_URL
PORT (default 4000)

Development:
	1.	Install dependencies
	2.	Set up .env with DATABASE_URL
	3.	Run server on port 4000
	4.	Ensure links table exists in the database

Key Endpoints:
POST /api/links
GET /api/links
GET /api/links/:code
DELETE /api/links/:code
GET /:code (302 redirect)
GET /healthz
GET /health

Notes:
	•	Redirect increments clicks and updates last_clicked
	•	Code must be 6–8 alphanumeric characters
	•	/Both http and https URLs are supported
