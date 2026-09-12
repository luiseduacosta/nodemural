# Nodemural turmas rename - Implementation Plan

## Task 1: Schema setupFullDatabase.js rename
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In `src/database/setupFullDatabase.js` lines 215-219 block (table #15):
    1. Change `CREATE TABLE IF NOT EXISTS turma_estagios` → `CREATE TABLE IF NOT EXISTS turmas`
    2. Change `area VARCHAR(30) NOT NULL COMMENT 'Change area to turma'` → `turma VARCHAR(30) NOT NULL`
    3. Update the JS line-comment header accordingly (label no longer needs to reference "turma_estagios")
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: `grep -n "turma_estagios" src/database/setupFullDatabase.js` returns 0 lines; `grep -n "CREATE TABLE IF NOT EXISTS turmas"` returns exactly 1 hit; `grep -n "turma VARCHAR(30)"` inside that block returns 1; `node --check src/database/setupFullDatabase.js` exits 0
  - `rubric` TR-1.2: Readability of the surrounding comments; scale 1-5; anchors 1=comment broken syntactically, 3=works but stale labels, 5=comment clearly says `15. turmas (...)` and no stale TODO inside the column comment; threshold >=4; evidence = cat snippet of lines 214-221
- **Notes**: Avoid introducing single quotes inside any SQL COMMENT text (project-wide constraint from earlier setup fixes)

## Task 2: Model src/models/turma.js rewrite SQL + return shapes
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Rename parameter `area` → `turma` on create/update function signatures
  - INSERT: `"INSERT INTO turmas (turma) VALUES (?)"` + param `[turma]`, return `{ id, turma }`
  - findById: `SELECT * FROM turmas WHERE id = ?`
  - findAll: `SELECT * FROM turmas ORDER BY turma ASC`
  - UPDATE: `"UPDATE turmas SET turma = ? WHERE id = ?"` + `[turma, id]`
  - DELETE: `"DELETE FROM turmas WHERE id = ?"`
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-2.1: grep in `turma.js` for regex `turma_estagios|\barea\b` (as SQL identifier) yields 0 matches (but allow "Turma" capital class name); `node --check src/models/turma.js` exit 0
  - `rule` TR-2.2: Dynamic import inline test with `await Turma.create('ENEM 2025')` → returned object has key `turma` (not `area`); `Turma.findAll()` SQL string (extracted via source scan) contains `ORDER BY turma ASC`
- **Notes**: Keep MariaDB pool.query positional `?` style — never concatenate strings.

## Task 3: Controller src/controllers/turmaController.js req.body turma
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - `createTurma` line 7: `const { turma } = req.body`
  - `updateTurma` line 46: `const { turma } = req.body`
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-3.1: `grep -nE "\barea\b" src/controllers/turmaController.js` → 0 hits; `node --check` exit 0
  - `rule` TR-3.2: Inline mock call of createTurma + updateTurma with `req = { body: { turma: 'foo' }, params: { id: 1 } }` → controller calls `Turma.create/update` with arg `turma` (not undefined)
- **Notes**: 404 error-message strings ("Turma de estágio not found") are fine as-is — they are user-facing text, not identifiers.

## Task 4: Server mount path /turmaestagios → /turmas
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - `src/server.js` line 58: change `app.use("/turmaestagios", turmaRoutes)` → `app.use("/turmas", turmaRoutes)`
- **Acceptance Criteria Addressed**: AC-4, AC-7
- **Test Requirements**:
  - `rule` TR-4.1: `grep -n "turmaestagios" src/server.js` → 0; `grep -n '"/turmas"' src/server.js` → exactly 1 hit paired with `turmaRoutes`; `node --check src/server.js` exit 0
- **Notes**: Keep alphabetical order with siblings if possible (currently it's before configuracoes; "/turmas" still fits).

## Task 5: Frontend list (turmas.html + turmas.js) refactor
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - `turmas.html` line 27: `<th>Área</th>` → `<th>Turma</th>`
  - `turmas.js`:
    1. ajax.url line 13: `'/turmaestagios'` → `'/turmas'`
    2. columns[1].data line 24: `'area'` → `'turma'`
    3. render line 26: `row.area` → `row.turma`
    4. delete url line 47: `` `/turmaestagios/${id}` `` → `` `/turmas/${id}` ``
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `rule` TR-5.1: `grep -nE "turmaestagios|data: 'area'|row\.area|<th>Área</th>" public/turmas.html public/turmas.js` → 0 total hits; `node --check public/turmas.js` exit 0
  - `rubric` TR-5.2: DataTables column count/order correctness; scale 1-5; anchors 1=mismatched columns would trigger "unknown parameter" warning, 3=works but sort order wrong, 5=3 columns (ID, Turma, Ações) → order[[1,'asc']] now sorts by turma; threshold >=4; evidence = grep of thead count vs columns array length
- **Notes**: After rename, DataTables order remains `order: [[1, 'asc']]` — column index 1 is still the name column, still correct.

## Task 6: Frontend new-turma.{html,js} refactor
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - `new-turma.html` line 23: `<label>Área *</label>` → `<label>Turma *</label>`
  - `new-turma.html` line 24: `id="area"` → `id="turma"`, `maxlength="255"` → `maxlength="30"` (match schema VARCHAR(30))
  - `new-turma.js` line 17: `getElementById('area')` → `getElementById('turma')`, key `area:` → `turma:`
  - `new-turma.js` line 21: `'/turmaestagios'` → `'/turmas'`
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: `grep -nE "turmaestagios|id=\"area\"|getElementById\('area'\)|key area|area:" public/new-turma.html public/new-turma.js` → 0; `node --check public/new-turma.js` exit 0
- **Notes**: Small text hint (line 25) says "Ex: Saúde, 2025-1 - Nivel I, etc." — still fits turma naming. Leave it.

## Task 7: Frontend edit-turma.{html,js} refactor
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - `edit-turma.html` line 28: `<label>Área *</label>` → `<label>Turma *</label>`
  - `edit-turma.html` line 29: `id="area"` → `id="turma"`, `maxlength="255"` → `maxlength="30"`
  - `edit-turma.js` line 21: `` `/turmaestagios/${id}` `` GET → `` `/turmas/${id}` ``
  - `edit-turma.js` line 29: `turma.area` → `turma.turma`, `getElementById('area')` → `getElementById('turma')`
  - `edit-turma.js` line 43: `area:` key → `turma:`, `getElementById('area')` → `getElementById('turma')`
  - `edit-turma.js` line 47: `` `/turmaestagios/${id}` `` PUT → `` `/turmas/${id}` ``
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-7.1: `grep -nE "turmaestagios|id=\"area\"|\.area|area:|'area'" public/edit-turma.html public/edit-turma.js` → 0; `node --check public/edit-turma.js` exit 0

## Task 8: Frontend view-turma.{html,js} refactor
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - `view-turma.html` line 27: `<label>Área</label>` → `<label>Turma</label>`
  - `view-turma.html` line 28: `id="view-area"` → `id="view-turma"`
  - `view-turma.js` line 21: `` `/turmaestagios/${id}` `` GET → `` `/turmas/${id}` ``
  - `view-turma.js` line 29: `$('#view-area')` → `$('#view-turma')`, `turma.area` → `turma.turma`
  - `view-turma.js` line 47: `` `/turmaestagios/${...}` `` DELETE → `` `/turmas/${...}` ``
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-8.1: `grep -nE "turmaestagios|view-area|turma\.area|label>Área<" public/view-turma.html public/view-turma.js` → 0; `node --check public/view-turma.js` exit 0

## Task 9: Full-repo negative grep + IDE diagnostics + syntax sweep
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1,2,3,4,5,6,7,8
- **Description**:
  - Negative greps across src/ and public/ for old identifiers in turma context.
  - Confirm `areas` entity is untouched.
  - Run node --check on every modified file.
  - Run GetDiagnostics.
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - `rule` TR-9.1: `grep -rn "turma_estagios" src/ public/` → 0 lines; `grep -rn "/turmaestagios" src/ public/` → 0 lines
  - `rule` TR-9.2: `grep -n "FROM areas\|INTO areas\|'/areas'" src/models/area.js src/server.js public/areas.js` still returns hits (verifying we didn't accidentally break the `areas` separate entity)
  - `rule` TR-9.3: `node --check` on each of: setupFullDatabase.js, turma.js, turmaController.js, server.js, turmas.js, new-turma.js, edit-turma.js, view-turma.js — all exit 0
  - `rubric` TR-9.4: End-to-end model/endpoint shape correctness; scale 1-5; anchors 1=wrong field names returned or 404 mount path, 3=works locally but mount path 404 when checked live, 5=inline Turma.findAll mock returns `{turma}` objects AND server.js grep confirms `/turmas` mount path exists; threshold >=4; evidence = inline node output + grep

## Issue I-1 (pending only if Review fails) — reserved
