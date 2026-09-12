# Nodemural - Rename turma_estagios → turmas, column area → turma

## Overview
- **Summary**: Rename the database table `turma_estagios` to `turmas` and its sole data column `area` to `turma`. Then propagate both renames consistently through every layer of the application: SQL setup script, model, controller, server route mount, and all frontend pages (list, new, edit, view).
- **Purpose**: Align schema naming with app conventions. The table was originally `turma_estagios` with a misleading column name `area` (it stores a turma/class label like "2025-1 - Nível I", not an institutional area). Renaming to `turmas` / `turma` disambiguates from the separate `areas` table (institution grouping, used via `instituicoes.area_id`). Also aligns the REST API mount path from the nonstandard `/turmaestagios` to the plural noun form `/turmas` — matching sibling routes `/alunos`, `/professores`, `/areas`, `/turnos`.
- **Target Users**: Admins who manage turmas via the UI; any system integrator calling the turma REST API.

## Goals
- Schema in `setupFullDatabase.js` creates a table called `turmas` with a column `turma VARCHAR(30)`.
- Model layer in `src/models/turma.js` issues SQL against the `turmas` table with the `turma` column and returns objects with a `turma` property.
- Controller layer accepts `{ turma }` in `req.body` (not `{ area }`) on create/update.
- Express mounts the collection at `/turmas` (plural noun) instead of `/turmaestagios`.
- All frontend CRUD pages for turmas (list, new, edit, view) use:
  - Input id `turma` (not `area`).
  - Display id `view-turma` (not `view-area`).
  - Label text "Turma" (not "Área").
  - DataTables column data property `turma` (not `area`).
  - API URL prefix `/turmas` (not `/turmaestagios`).
- Full-stack consistency: zero leftover references to `turma_estagios` (as a table) or the old field name `area` in the *context of turmas* anywhere under `src/` or `public/`. The `areas` entity (separate table, institution grouping) remains UNCHANGED.

## Non-Goals
- Do NOT rename or alter the separate `areas` table, its `area` column, the `/areas` API route, or any frontend pages for areas. That entity is distinct and unrelated.
- Do NOT migrate or modify data stored in the existing live MariaDB database. This is a code/schema-update; any existing DDL rename for pre-populated rows is out of scope (only the setup script changes).
- Do NOT add/remove columns or change `VARCHAR(30)` length; `id` auto-increment PK stays exactly as today.
- Do NOT create a `turmaestagio_id` FK in `estagiarios`; that FK is referenced in wiki docs but was never implemented in the current schema/code.
- Do NOT touch `.qoder/repowiki/` documentation files; they are generated/archival markdown, not application code.

## Background & Context
- Canonical schema source: `src/database/setupFullDatabase.js`.
- Current codebase already has DataTables core `1.13.7` and all pages follow Bootstrap 5 card/layout conventions.
- Project-wide hard constraint from earlier work: controller must cast `req.body` strings to INT/BOOLEAN for numeric/bool columns; this refactor only touches a VARCHAR(30) column so no additional INT/BOOLEAN coercion applies here.
- The column already carries the comment `COMMENT 'Change area to turma'` in the current setup script — confirming this rename has been planned in the schema author's intent.
- Inventory of files with direct references (confirmed via grep, 2026-09-12):
  - Schema: `src/database/setupFullDatabase.js` — `CREATE TABLE turma_estagios ... area VARCHAR(30)`
  - Model: `src/models/turma.js` — 5 queries (`INSERT/SELECT/UPDATE/DELETE + SELECT *`) using `turma_estagios` and `area`
  - Controller: `src/controllers/turmaController.js` — destructures `{ area }` from body; creates/passes `area` to model
  - Server mount: `src/server.js` line 58 — `app.use("/turmaestagios", turmaRoutes)`
  - Frontend list: `public/turmas.html` (thead "Área"), `public/turmas.js` (ajax.url `/turmaestagios`, `data: 'area'`, `row.area`)
  - Frontend new: `public/new-turma.html` (label "Área", input `#area`), `public/new-turma.js` (POST `/turmaestagios`, body `{ area }`, input `#area`)
  - Frontend edit: `public/edit-turma.html` (label "Área", input `#area`), `public/edit-turma.js` (GET/PUT `/turmaestagios/:id`, body `{ area }`, input `#area`)
  - Frontend view: `public/view-turma.html` (label "Área", display `#view-area`), `public/view-turma.js` (GET/DELETE `/turmaestagios/:id`, `$('#view-area')`, `turma.area`)
  - Router file `src/routers/turmaRoutes.js` has NO hardcoded table/field names (uses controller exports only) — no change required inside router itself beyond confirmation.
- Confirmed no FK `turmaestagio_id` / `turma_id` is actually used in any current schema DDL, model, controller, or frontend JS under `src/` and `public/`. The wiki docs reference it but it is not in the active codebase.

## Functional Requirements
- **FR-1**: `setupFullDatabase.js` must declare `CREATE TABLE IF NOT EXISTS turmas (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, turma VARCHAR(30) NOT NULL)`. The old `turma_estagios` identifier and old `area` identifier must not appear in that CREATE block.
- **FR-2**: `Turma.create(turma)` in model must INSERT INTO `turmas(turma)` VALUES (?) and return `{ id: Number(insertId), turma }`.
- **FR-3**: `Turma.findById(id)` / `Turma.findAll()` must SELECT FROM `turmas`; findAll must ORDER BY `turma` ASC (not `area` ASC).
- **FR-4**: `Turma.update(id, turma)` must `UPDATE turmas SET turma = ? WHERE id = ?`.
- **FR-5**: `Turma.delete(id)` must `DELETE FROM turmas WHERE id = ?`.
- **FR-6**: `createTurma` controller destructures `{ turma }` from req.body (NOT `{ area }`), passes it to model, returns 201 JSON with the new `{id, turma}`.
- **FR-7**: `updateTurma` controller destructures `{ turma }` from req.body, passes to model.
- **FR-8**: Express mounts `turmaRoutes` collection at path prefix `/turmas` (NOT `/turmaestagios`).
- **FR-9**: `public/turmas.js` DataTables: `ajax.url = '/turmas'`; `columns[1].data = 'turma'`; render reads `row.turma`; delete button calls `/turmas/${id}`.
- **FR-10**: `public/new-turma.html` has a text input with id `turma`; label text is "Turma *"; maxlength matches schema (30). `public/new-turma.js` reads `getElementById('turma')`, sends body `{ turma }` to `POST /turmas`.
- **FR-11**: `public/edit-turma.html` has a text input with id `turma`; label text is "Turma *"; maxlength 30. `public/edit-turma.js`: load via `GET /turmas/${id}`, populate `#turma` with `turma.turma`, submit via `PUT /turmas/${id}` body `{ turma }`.
- **FR-12**: `public/view-turma.html` label = "Turma" and display element id = `view-turma`. `public/view-turma.js`: load `GET /turmas/${id}`, write `turma.turma` into `#view-turma`; delete via `DELETE /turmas/${id}`.
- **FR-13**: `public/turmas.html` thead column 2 (index 1) header label = "Turma" (not "Área").
- **FR-14**: No stray `turma_estagios` table references remain in any `src/**/*.js` or `public/**/*` file; only the `/areas` entity and its legitimate `area` field usage remain.

## Non-Functional Requirements
- **NFR-1**: `node --check` must pass on every modified JS file.
- **NFR-2**: `GetDiagnostics` (VS Code IDE linter) must return empty array after all edits applied.
- **NFR-3**: No internal single quotes inside SQL comments in `setupFullDatabase.js` (a documented project-wide pitfall from previous work). The existing turma DDL block has none; keep it that way.
- **NFR-4**: All GET/PUT/POST/DELETE endpoints for turmas must remain fully protected by `verifyToken` + `checkRole(['admin'])` as they are today — no auth regression.

## Constraints
- **Technical**: MariaDB connector returns VARCHARs as JS strings; no INT/BOOLEAN coercion needed for the single `turma` VARCHAR column.
- **Technical**: All static public pages already import `auth-utils.js` with `hasRole(['admin'])` gate on page load; keep it.
- **Business**: Existing `areas` entity (table `areas`, column `area`, route `/areas`, pages `areas.html`/`areas.js`/`new-area.html`/`edit-area.html`/`view-area.html` etc.) MUST stay unchanged; they serve a completely different concept (institution grouping area). Confusing the two is exactly the failure mode this rename is meant to prevent.
- **Dependencies**: No new npm packages; no Bootstrap/DataTables version changes.

## Assumptions
- If/when user runs `setupFullDatabase.js` against a fresh database, the CREATE runs with the new table name. For an existing populated DB the user is responsible for issuing `RENAME TABLE turma_estagios TO turmas; ALTER TABLE turmas CHANGE area turma VARCHAR(30) NOT NULL;` themselves; setup script is the schema source of truth, not a live data migration tool.
- User's browser has working localStorage JWT token for admin so UI pages work after refactor (no need to relax auth during repro — list page uses standard role guards).

## Acceptance Criteria

### AC-1: Schema CREATE uses new identifiers
- **Type**: `rule`
- **Given**: File `src/database/setupFullDatabase.js`
- **When**: The turmas table CREATE TABLE block (around line 215-219) is inspected
- **Then**: It contains literal `CREATE TABLE IF NOT EXISTS turmas`, column `turma VARCHAR(30)`, no literal `turma_estagios` in that block, no literal `area VARCHAR` in that block
- **Pass Condition**: grep for `turma_estagios` in setupFullDatabase.js returns 0 hits; grep for `CREATE TABLE IF NOT EXISTS turmas` returns 1 hit; grep within the new block confirms `turma VARCHAR(30)`
- **Evidence**: `grep -n` command outputs posted in task completion

### AC-2: Model SQL + return shape updated
- **Type**: `rule`
- **Given**: File `src/models/turma.js`
- **When**: Searched for old identifiers and executed a synthetic node import
- **Then**: No literal string `"turma_estagios"` or `"area"` (as column name) appears anywhere in turma.js SQL; `Turma.create('foo')` returns object with key `turma` (not `area`); findAll SQL contains `ORDER BY turma ASC`
- **Pass Condition**: grep for `/turma_estagios|\.area|, area|area = |INTO turma_estagios|FROM turma_estagios|UPDATE turma_estagios|DELETE FROM turma_estagios/` → 0 matches inside `turma.js`; dynamic node import `await Turma.create('X')` and `await Turma.findAll()` mock returns show `turma` key
- **Evidence**: grep + node --check + inline dynamic import output

### AC-3: Controller accepts/passes turma key
- **Type**: `rule`
- **Given**: File `src/controllers/turmaController.js`
- **When**: Read createTurma and updateTurma handler bodies
- **Then**: `const { turma } = req.body` (not `area`); await Turma.create/update receive identifier `turma`; 201 JSON body has shape `{id, turma}`
- **Pass Condition**: grep `area` in turmaController.js returns 0 hits; `node --check` passes
- **Evidence**: grep output + node --check OK

### AC-4: REST API mount at /turmas
- **Type**: `rule`
- **Given**: File `src/server.js` lines 45-65
- **When**: The app.use line for turma routes is inspected
- **Then**: `app.use("/turmas", turmaRoutes)` exists; line with "/turmaestagios" does NOT
- **Pass Condition**: grep `/turmaestagios` in `src/server.js` → 0 hits; grep `"/turmas"` in server.js → 1 hit next to `turmaRoutes`
- **Evidence**: grep -n output

### AC-5: Frontend turmas.js list page uses new route + new field
- **Type**: `rule`
- **Given**: Files `public/turmas.html`, `public/turmas.js`
- **When**: Rendered page + JS config inspected
- **Then**: thead `<th>` says "Turma"; ajax.url = `/turmas`; `columns[1].data` = `'turma'`; render function uses `row.turma`; delete URL = `/turmas/${id}`
- **Pass Condition**: grep `turmaestagios` in turmas.js → 0; grep `data: 'area'` in turmas.js → 0; grep `row.area` in turmas.js → 0; thead shows Turma
- **Evidence**: grep outputs

### AC-6: Frontend new/edit/view pages use turma input ids + labels + API paths
- **Type**: `rule`
- **Given**: Files new-turma.{html,js}, edit-turma.{html,js}, view-turma.{html,js}
- **When**: Each form/view pair searched for old ids/labels/URLs
- **Then**: Label text = "Turma"; HTML input id `turma` (not `area`); view display id `view-turma` (not `view-area`); API URLs start `/turmas/` (not `/turmaestagios/`); request bodies key is `turma`
- **Pass Condition**: grep `turmaestagios` across those 6 files → 0 matches; grep `id="area"` or `getElementById('area')` or `#view-area` or `.area` field reads → 0 matches inside those 6 files
- **Evidence**: grep outputs

### AC-7: No cross-contamination of areas entity
- **Type**: `rule`
- **Given**: Entire `src/` and `public/` trees
- **When**: Searched for `turma_estagios` OR for turma-context `area` identifiers that should have been renamed
- **Then**: Zero occurrences of SQL table `turma_estagios` anywhere in src/ + public/; zero occurrences of REST path `/turmaestagios` anywhere in public/; legitimate area-table code (areas.html, areas.js, instituicao's `area_nome` join, etc.) remains unmodified and still uses `area`/`areas` correctly
- **Pass Condition**: `grep -rn "turma_estagios" src/ public/` returns 0; `grep -rn "/turmaestagios" src/ public/` returns 0; `grep -rn "INTO areas\|FROM areas\|UPDATE areas" src/models/area.js` still returns hits (proving we didn't break the separate areas entity)
- **Evidence**: grep outputs

### AC-8: Syntax + diagnostics clean
- **Type**: `rule`
- **Given**: All modified JS files after edit
- **When**: `node --check` run on each, `GetDiagnostics` queried
- **Then**: Every file exits 0 from node --check; diagnostics length 0
- **Pass Condition**: Exit codes all 0; GetDiagnostics = []
- **Evidence**: Shell for-loop output + diagnostics screenshot/JSON

### AC-9: Live end-to-end CRUD roundtrip (mock model + endpoint sanity)
- **Type**: `rubric`
- **Dimension**: Full-stack naming consistency under simulated live load
- **Scale**: 1-5
- **Anchors**: 1 = old names still used end-to-end; 3 = some files renamed but others reference old names, would 404; 5 = create, update, findAll paths all pass the NEW identifier `turma` through controller→model→table with no 404s and correct JSON keys, API mount responds on `/turmas` path prefix with curl
- **Pass Threshold**: >= 4
- **Evidence**: curl + python3 scan of `/turmas` endpoint against running server (temporarily remove verifyToken for 1 call, then restore) OR inline mock controller call that exercises the full model return shape + Turma.findAll SQL ORDER BY clause

## Open Questions
- [ ] User: Do you want us to also issue a one-shot live MariaDB migration (`RENAME TABLE turma_estagios TO turmas; ALTER TABLE turmas CHANGE area turma VARCHAR(30) NOT NULL`) against the running `ess_apps` database, or only update the setupFullDatabase schema script + code as specified? (Default = code/setup only, no live data mutation; answer at Approval step or after.)
