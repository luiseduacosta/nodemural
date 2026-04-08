# NodeMural workspace instructions

## What this project is

NodeMural is a Node.js + Express web application with a MariaDB backend and a static frontend served from `public/`.

- Backend entrypoint: `src/server.js`
- API routes: `src/routers/*.js`
- Business logic: `src/controllers/*.js`
- Data models: `src/models/*.js`
- Database setup: `src/database/db.js`, `src/database/setupFullDatabase.js`
- Frontend: `public/` HTML + JS files

## How to run

1. `npm install`
2. Create a `.env` file in the repository root with at least:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_POOL_LIMIT`
   - `JWT_SECRET`
   - `JWT_EXPIRY`
   - `PORT`
3. Start the app:
   - `npm start`
   - development with reload: `npm run dev`

## Key conventions

- Uses ES modules (`import` / `export`) and `type: module` in `package.json`.
- `src/server.js` configures Express, static assets, and mounts all route modules.
- Route modules live in `src/routers/` and delegate to controller functions.
- Controllers live in `src/controllers/` and handle request logic.
- Models live in `src/models/` and represent data entities.
- Database access uses MariaDB via `src/database/db.js`.
- Frontend is a static single-page-like collection of HTML/JS files in `public/`.

## Best support for tasks

- For backend changes, keep the existing route/controller/model separation.
- For frontend changes, update `public/` HTML and corresponding JS files, preserving the current static page structure.
- New features should use Express routing patterns already present in `src/server.js`.
- Do not assume an existing test suite; the current `package.json` has a placeholder `test` script.
- Prefer small, incremental changes and preserve the app’s existing CRUD naming style.

## Useful files

- `src/server.js` – application startup and route mounting
- `src/database/db.js` – MariaDB connection helper
- `src/database/setupFullDatabase.js` – database initialization script
- `src/routers/*.js` – route definitions
- `src/controllers/*.js` – request handlers
- `public/` – frontend views and page scripts
- `README.md` – project setup and runtime instructions

## Notes for Copilot

- If a request involves code generation, keep it aligned with the current Express + MariaDB architecture.
- Avoid introducing unrelated frameworks or build systems.
- Keep the solution compatible with a static frontend served from `public/`.
- If asked about tests, mention that no test framework is configured yet.

## Suggested example prompts

- `Add a new endpoint to create and list alunos using the existing routes/controllers pattern.`
- `Update the public/new-aluno.html page so it validates the form before submit.`
- `Fix the MariaDB connection handling in src/database/db.js for better error reporting.`
- `Describe how the route modules and controller functions are organized in this project.`
