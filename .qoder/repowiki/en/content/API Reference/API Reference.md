# API Reference

<cite>
**Referenced Files in This Document**
- [src/server.js](file://src/server.js)
- [src/middleware/auth.js](file://src/middleware/auth.js)
- [AUTH_GUIDE.md](file://AUTH_GUIDE.md)
- [README.md](file://README.md)
- [src/routers/authRoutes.js](file://src/routers/authRoutes.js)
- [src/routers/alunoRoutes.js](file://src/routers/alunoRoutes.js)
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js)
- [src/routers/instituicaoRoutes.js](file://src/routers/instituicaoRoutes.js)
- [src/routers/estagioRoutes.js](file://src/routers/estagioRoutes.js)
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js)
- [src/routers/inscricaoRoutes.js](file://src/routers/inscricaoRoutes.js)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js)
- [src/routers/questionarioRoutes.js](file://src/routers/questionarioRoutes.js)
- [src/routers/questaoRoutes.js](file://src/routers/questaoRoutes.js)
- [src/routers/atividadesRoutes.js](file://src/routers/atividadesRoutes.js)
- [src/routers/visitaRoutes.js](file://src/routers/visitaRoutes.js)
- [src/routers/turmaRoutes.js](file://src/routers/turmaRoutes.js)
- [src/routers/areaRoutes.js](file://src/routers/areaRoutes.js)
- [src/routers/respostaRoutes.js](file://src/routers/respostaRoutes.js)
- [src/routers/configuracaoRoutes.js](file://src/routers/configuracaoRoutes.js)
- [src/routers/turnoRoutes.js](file://src/routers/turnoRoutes.js)
- [src/controllers/authController.js](file://src/controllers/authController.js)
- [src/controllers/professorController.js](file://src/controllers/professorController.js)
- [src/controllers/instituicaoController.js](file://src/controllers/instituicaoController.js)
- [src/controllers/turnoController.js](file://src/controllers/turnoController.js)
- [src/models/user.js](file://src/models/user.js)
- [src/models/professor.js](file://src/models/professor.js)
- [src/models/instituicao.js](file://src/models/instituicao.js)
- [src/models/turno.js](file://src/models/turno.js)
- [src/models/aluno.js](file://src/models/aluno.js)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive Turnos (shifts) management endpoints documentation
- Enhanced Student (alunos) endpoints with improved error handling for turno_id field
- Updated database schema documentation to include turnos table structure
- Added migration script documentation for backward compatibility with legacy turno field

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides a comprehensive API reference for the NodeMural RESTful backend. It catalogs all endpoints, their HTTP methods, URL patterns, request/response characteristics, authentication and authorization requirements, nested and relationship endpoints, and error handling patterns. It also includes practical usage examples, integration guidelines, and notes on rate limiting and CORS considerations.

## Project Structure
The server registers route groups under top-level prefixes and exposes several nested routes for relationships. Middleware enforces JWT-based authentication and role-based access control.

```mermaid
graph TB
Server["src/server.js<br/>Express app"] --> AuthRoutes["/auth<br/>src/routers/authRoutes.js"]
Server --> AlunoRoutes["/alunos<br/>src/routers/alunoRoutes.js"]
Server --> ProfessorRoutes["/professores<br/>src/routers/professorRoutes.js"]
Server --> InstituicaoRoutes["/instituicoes<br/>src/routers/instituicaoRoutes.js"]
Server --> EstagioRoutes["/estagios<br/>src/routers/estagioRoutes.js"]
Server --> EstagiarioRoutes["/estagiarios<br/>src/routers/estagiarioRoutes.js"]
Server --> MuralRoutes["/mural<br/>(not registered in server.js)"]
Server --> InscricaoRoutes["/inscricoes<br/>src/routers/inscricaoRoutes.js"]
Server --> SupervisorRoutes["/supervisores<br/>src/routers/supervisorRoutes.js"]
Server --> QuestionarioRoutes["/questionarios<br/>src/routers/questionarioRoutes.js"]
Server --> QuestaoRoutes["/questoes<br/>src/routers/questaoRoutes.js"]
Server --> AtividadesRoutes["/atividades<br/>src/routers/atividadesRoutes.js"]
Server --> VisitaRoutes["/visitas<br/>src/routers/visitaRoutes.js"]
Server --> TurmaRoutes["/turmaestagios<br/>src/routers/turmaRoutes.js"]
Server --> AreaRoutes["/areas<br/>src/routers/areaRoutes.js"]
Server --> RespostaRoutes["/respostas<br/>src/routers/respostaRoutes.js"]
Server --> ConfiguracaoRoutes["/configuracoes<br/>src/routers/configuracaoRoutes.js"]
Server --> TurnoRoutes["/turnos<br/>src/routers/turnoRoutes.js"]
Server --> Nested["Nested Routes"]
Nested --> NestSup["/supervisores/:id/estagiarios"]
Nested --> NestProf["/professores/:id/estagiarios"]
Nested --> NestAluno["/alunos/:id/estagiarios"]
Nested --> NestMural["/mural/:id/inscricoes"]
Nested --> NestAluno2["/alunos/:id/inscricoes"]
Nested --> NestInst["/instituicoes/:id/supervisores"]
Nested --> NestInst2["/instituicoes/:id/mural"]
```

**Diagram sources**
- [src/server.js:37-61](file://src/server.js#L37-L61)
- [src/routers/authRoutes.js:1-22](file://src/routers/authRoutes.js#L1-L22)
- [src/routers/alunoRoutes.js:1-25](file://src/routers/alunoRoutes.js#L1-L25)
- [src/routers/professorRoutes.js:1-23](file://src/routers/professorRoutes.js#L1-L23)
- [src/routers/instituicaoRoutes.js:1-21](file://src/routers/instituicaoRoutes.js#L1-L21)
- [src/routers/estagioRoutes.js:1-20](file://src/routers/estagioRoutes.js#L1-L20)
- [src/routers/estagiarioRoutes.js:1-21](file://src/routers/estagiarioRoutes.js#L1-L21)
- [src/routers/inscricaoRoutes.js:1-21](file://src/routers/inscricaoRoutes.js#L1-L21)
- [src/routers/supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [src/routers/questionarioRoutes.js:1-16](file://src/routers/questionarioRoutes.js#L1-L16)
- [src/routers/questaoRoutes.js:1-17](file://src/routers/questaoRoutes.js#L1-L17)
- [src/routers/atividadesRoutes.js:1-20](file://src/routers/atividadesRoutes.js#L1-L20)
- [src/routers/visitaRoutes.js:1-18](file://src/routers/visitaRoutes.js#L1-L18)
- [src/routers/turmaRoutes.js:1-18](file://src/routers/turmaRoutes.js#L1-L18)
- [src/routers/areaRoutes.js:1-18](file://src/routers/areaRoutes.js#L1-L18)
- [src/routers/respostaRoutes.js:1-54](file://src/routers/respostaRoutes.js#L1-L54)
- [src/routers/configuracaoRoutes.js:1-18](file://src/routers/configuracaoRoutes.js#L1-L18)
- [src/routers/turnoRoutes.js:1-15](file://src/routers/turnoRoutes.js#L1-L15)

**Section sources**
- [src/server.js:31-70](file://src/server.js#L31-L70)

## Core Components
- Authentication and Authorization
  - JWT-based authentication via Authorization header with Bearer scheme.
  - Role-based access control (RBAC) supports roles: admin, supervisor, professor, aluno.
  - Enhanced ownership checks restrict access to personal records for specific roles.
  - User management endpoints support entity-based updates.
- Request Body Parsing
  - JSON body parsing enabled globally and per-route where applicable.
- Nested Routes
  - Relationship endpoints for supervisors, professors, students, institutions, and mural posts.
- Turno Management System
  - Dedicated turnos table with administrative management capabilities.
  - Backward compatibility with legacy turno field in alunos table.
  - Migration script for automatic data conversion.

Key behaviors:
- Protected endpoints require a valid, non-expired JWT.
- Admin role grants broad access; other roles may be restricted by ownership or role middleware.
- Some endpoints enforce ownership checks for specific resources.
- Entity-based authentication allows users to be associated with specific entities (aluno, professor, supervisor).
- Turno system supports diurno, noturno, ambos, and integral shifts with proper validation.

**Section sources**
- [src/middleware/auth.js:6-29](file://src/middleware/auth.js#L6-L29)
- [src/middleware/auth.js:32-48](file://src/middleware/auth.js#L32-L48)
- [src/middleware/auth.js:77-98](file://src/middleware/auth.js#L77-L98)
- [src/middleware/auth.js:100-136](file://src/middleware/auth.js#L100-L136)
- [AUTH_GUIDE.md:289-300](file://AUTH_GUIDE.md#L289-L300)
- [src/server.js:34-35](file://src/server.js#L34-L35)
- [src/models/turno.js:1-44](file://src/models/turno.js#L1-L44)
- [scripts/backfill_alunos_turno_id.py:67-77](file://scripts/backfill_alunos_turno_id.py#L67-L77)

## Architecture Overview
The API follows a layered architecture:
- Express server initializes middleware and mounts route groups.
- Each route group delegates to a controller function.
- Controllers interact with models and database abstractions.
- Authentication middleware validates tokens and enforces roles.

```mermaid
sequenceDiagram
participant C as "Client"
participant S as "Express Server<br/>src/server.js"
participant R as "Route Group<br/>e.g., src/routers/authRoutes.js"
participant M as "Auth Middleware<br/>src/middleware/auth.js"
participant Ctrl as "Controller<br/>e.g., authController.js"
C->>S : HTTP Request
S->>R : Route match (prefix)
R->>M : verifyToken / checkRole / checkOwnership
alt Unauthorized or insufficient permissions
M-->>C : 401/403 Error
else Authorized
M->>Ctrl : Invoke handler
Ctrl-->>C : 2xx/4xx/5xx Response
end
```

**Diagram sources**
- [src/server.js:37-61](file://src/server.js#L37-L61)
- [src/routers/authRoutes.js:1-22](file://src/routers/authRoutes.js#L1-L22)
- [src/middleware/auth.js:6-29](file://src/middleware/auth.js#L6-L29)
- [src/middleware/auth.js:32-48](file://src/middleware/auth.js#L32-L48)
- [src/middleware/auth.js:77-98](file://src/middleware/auth.js#L77-L98)

## Detailed Component Analysis

### Authentication Endpoints
- Base Path: /auth
- Methods and Paths
  - POST /auth/register
    - Description: Registers a new user account.
    - Auth: Not authenticated.
    - Request: JSON payload with email, password, passwordConfirm, nome, identificacao, role (optional), entidade_id (optional).
    - Response: Created user object with id, email, nome, identificacao, role, entidade_id.
    - Errors: 400 validation errors, 500 server error.
  - POST /auth/login
    - Description: Authenticates user and returns JWT.
    - Auth: Not authenticated.
    - Request: JSON with email and password.
    - Response: Success message, token, and user profile.
    - Errors: 401 invalid credentials, 500 server error.
  - GET /auth/me
    - Description: Returns decoded user info from token.
    - Auth: Requires Bearer token.
    - Response: { user: { id, email, nome, role, entidade_id, iat, exp } }.
    - Errors: 401 missing/expired/invalid token.
  - GET /auth/profile
    - Description: Retrieves authenticated user profile.
    - Auth: Requires Bearer token.
    - Response: User profile fields including identificacao, role, entidade_id, ativo, and criado_em.
    - Errors: 401 unauthorized, 403 forbidden, 500 server error.
  - PUT /auth/users/:id
    - Description: Updates user profile (self or admin).
    - Auth: Requires Bearer token; admin or same user.
    - Request: JSON with nome, email, identificacao, role (admin only), entidade_id (role-dependent).
    - Response: Updated user object and new token with updated claims.
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - PUT /auth/users/entity/:entidade_id
    - Description: Updates user by entity ID (admin or same user).
    - Auth: Requires Bearer token; admin or user with matching entity.
    - Request: JSON with identificacao, nome, email.
    - Response: Updated user object and new token.
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - GET /auth/users
    - Description: Lists all users (admin only).
    - Auth: Requires Bearer token; admin role.
    - Response: Array of users.
    - Errors: 401/403, 500 server error.

Security Notes:
- Use HTTPS in production.
- Store JWT securely on the client (e.g., HttpOnly cookies if using sessions).
- Rotate JWT_SECRET in production.
- Entity-based authentication allows users to be linked to specific entities (aluno, professor, supervisor).

**Updated** Enhanced authentication endpoints now include comprehensive user management with entity-based updates and improved role handling.

**Section sources**
- [src/routers/authRoutes.js:8-21](file://src/routers/authRoutes.js#L8-L21)
- [src/controllers/authController.js:5-260](file://src/controllers/authController.js#L5-L260)
- [src/models/user.js:6-185](file://src/models/user.js#L6-L185)
- [AUTH_GUIDE.md:66-161](file://AUTH_GUIDE.md#L66-L161)
- [AUTH_GUIDE.md:194-202](file://AUTH_GUIDE.md#L194-L202)
- [AUTH_GUIDE.md:289-300](file://AUTH_GUIDE.md#L289-L300)

### Professors (professores)
- Base Path: /professores
- Methods and Paths
  - GET /professores
    - Description: List all professores (admin, aluno, professor).
    - Auth: Bearer token; admin, aluno, or professor.
    - Response: Array of professores.
    - Errors: 401/403, 500 server error.
  - GET /professores/:id
    - Description: Retrieve professor by ID (admin or professor; ownership required).
    - Auth: Bearer token; admin or professor (ownership via entidade_id).
    - Response: Single professor object.
    - Errors: 401/403, 404 not found, 500 server error.
  - GET /professores/siape/:siape
    - Description: Retrieve professor by siape (public).
    - Auth: Not authenticated.
    - Response: Single professor object.
    - Errors: 404 not found, 500 server error.
  - GET /professores/:id/estagiarios
    - Description: Get estagiarios linked to professor (admin or professor; ownership required).
    - Auth: Bearer token; admin or professor (ownership via entidade_id).
    - Response: Array of estagiarios with student details.
    - Errors: 401/403, 500 server error.
  - POST /professores
    - Description: Create professor (admin or professor).
    - Auth: Bearer token; admin or professor.
    - Request: JSON professor data with comprehensive fields.
    - Response: Created professor object.
    - Errors: 400 validation, 401/403, 500 server error.
  - PUT /professores/:id
    - Description: Update professor (admin or professor; ownership required).
    - Auth: Bearer token; admin or professor (ownership via entidade_id).
    - Request: JSON professor data with comprehensive fields.
    - Response: No content (204).
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - DELETE /professores/:id
    - Description: Delete professor (admin only).
    - Auth: Bearer token; admin.
    - Response: No content (204).
    - Errors: 401/403, 404 not found, 500 server error.

Professor Fields:
- nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes

**Updated** Added comprehensive professor management with full CRUD operations and enhanced authentication with ownership checks.

**Section sources**
- [src/routers/professorRoutes.js:11-21](file://src/routers/professorRoutes.js#L11-L21)
- [src/controllers/professorController.js:4-100](file://src/controllers/professorController.js#L4-L100)
- [src/models/professor.js:4-86](file://src/models/professor.js#L4-L86)

### Institutions (instituicoes)
- Base Path: /instituicoes
- Methods and Paths
  - POST /instituicoes
    - Description: Create institution (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON institution data with comprehensive fields.
    - Response: Created institution object.
    - Errors: 400 validation, 401/403, 500 server error.
  - GET /instituicoes
    - Description: List all institutions (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Array of institutions with area information.
    - Errors: 401 unauthorized, 500 server error.
  - GET /instituicoes/:id
    - Description: Retrieve institution by ID (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Single institution object with area information.
    - Errors: 401 unauthorized, 404 not found, 500 server error.
  - GET /instituicoes/:id/supervisores
    - Description: Get supervisores linked to institution (admin, aluno).
    - Auth: Bearer token; admin or aluno.
    - Response: Array of supervisores.
    - Errors: 401/403, 500 server error.
  - GET /instituicoes/:id/mural
    - Description: Get mural entries linked to institution (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Array of mural entries with periodo and vagas.
    - Errors: 401 unauthorized, 500 server error.
  - PUT /instituicoes/:id
    - Description: Update institution (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON institution data with comprehensive fields.
    - Response: No content (204).
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - DELETE /instituicoes/:id
    - Description: Delete institution (admin only).
    - Auth: Bearer token; admin role.
    - Response: No content (204).
    - Errors: 401/403, 404 not found, 500 server error.

Institution Fields:
- instituicao, cnpj, natureza, email, beneficios, area_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes

**New** Added comprehensive institutional management with full CRUD operations and relationship endpoints.

**Section sources**
- [src/routers/instituicaoRoutes.js:11-19](file://src/routers/instituicaoRoutes.js#L11-L19)
- [src/controllers/instituicaoController.js:3-95](file://src/controllers/instituicaoController.js#L3-L95)
- [src/models/instituicao.js:4-66](file://src/models/instituicao.js#L4-L66)

### Students (alunos)
- Base Path: /alunos
- Methods and Paths
  - GET /alunos
    - Description: List all alunos (authenticated).
    - Auth: Bearer token; admin or professor.
    - Response: Array of alunos.
    - Errors: 401/403, 500 server error.
  - GET /alunos/:id
    - Description: Retrieve aluno by numeric ID.
    - Auth: Not authenticated.
    - Response: Single aluno object.
    - Errors: 404 if not found, 500 server error.
  - GET /alunos/registro/:registro
    - Description: Retrieve aluno by registro (string).
    - Auth: Not authenticated.
    - Response: Single aluno object.
    - Errors: 404 if not found, 500 server error.
  - GET /alunos/:id/estagiarios
    - Description: Get estagiarios linked to aluno (authenticated).
    - Auth: Bearer token; admin or professor.
    - Response: Array of estagiarios.
    - Errors: 401/403, 500 server error.
  - GET /alunos/:id/inscricoes
    - Description: Get inscricoes for aluno (authenticated).
    - Auth: Bearer token; admin or aluno.
    - Response: Array of inscricoes.
    - Errors: 401/403, 500 server error.
  - POST /alunos
    - Description: Create aluno (admin or aluno).
    - Auth: Bearer token; admin or aluno (ownership).
    - Request: JSON alumno data with enhanced validation including turno_id field.
    - Response: Created aluno object.
    - Errors: 400 validation (including turno_id validation), 401/403, 500 server error.
  - PUT /alunos/:id
    - Description: Update aluno (admin or aluno; ownership required).
    - Auth: Bearer token; admin or aluno (ownership).
    - Request: JSON alumno data with enhanced validation including turno_id field.
    - Response: Updated aluno object.
    - Errors: 400 validation (including turno_id validation), 401/403, 404 not found, 500 server error.
  - DELETE /alunos/:id
    - Description: Delete aluno (admin only).
    - Auth: Bearer token; admin.
    - Response: Deletion result.
    - Errors: 401/403, 404 not found, 500 server error.

Enhanced Error Handling for turno_id Field:
- Validation ensures turno_id references existing turnos table entries
- Backward compatibility maintained with legacy turno field
- Migration script automatically converts old turno values to new turno_id format

Student Fields:
- nome, nomesocial, ingresso, turno_id (NEW: references turnos table), registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes

**Updated** Enhanced student management with improved error handling for turno_id field and backward compatibility with legacy turno system.

**Section sources**
- [src/routers/alunoRoutes.js:11-24](file://src/routers/alunoRoutes.js#L11-L24)
- [src/server.js](file://src/server.js#L60)
- [src/models/aluno.js:10-20](file://src/models/aluno.js#L10-L20)
- [src/models/aluno.js:107-113](file://src/models/aluno.js#L107-L113)
- [scripts/backfill_alunos_turno_id.py:67-77](file://scripts/backfill_alunos_turno_id.py#L67-L77)

### Internships (estagios)
- Base Path: /estagios
- Methods and Paths
  - POST /estagios
    - Description: Create estagio.
    - Auth: Not authenticated.
    - Request: JSON estagio data.
    - Response: Created estagio object.
    - Errors: 400 validation, 500 server error.
  - GET /estagios
    - Description: List all estagios.
    - Auth: Not authenticated.
    - Response: Array of estagios.
    - Errors: 500 server error.
  - GET /estagios/:id
    - Description: Retrieve estagio by ID.
    - Auth: Not authenticated.
    - Response: Single estagio object.
    - Errors: 404 not found, 500 server error.
  - GET /estagios/:id/supervisores
    - Description: Get supervisores linked to estagio.
    - Auth: Not authenticated.
    - Response: Array of supervisores.
    - Errors: 500 server error.
  - GET /estagios/:id/mural
    - Description: Get mural entries linked to estagio.
    - Auth: Not authenticated.
    - Response: Array of mural entries.
    - Errors: 500 server error.
  - PUT /estagios/:id
    - Description: Update estagio.
    - Auth: Not authenticated.
    - Request: JSON estagio data.
    - Response: Updated estagio object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /estagios/:id
    - Description: Delete estagio.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

Nested Routes
- /estagios/:id/estagiarios → [src/server.js](file://src/server.js#L59)

**Section sources**
- [src/routers/estagioRoutes.js:10-17](file://src/routers/estagioRoutes.js#L10-L17)
- [src/server.js](file://src/server.js#L59)

### Interns (estagiarios)
- Base Path: /estagiarios
- Methods and Paths
  - GET /estagiarios/periodos
    - Description: Get distinct periods.
    - Auth: Not authenticated.
    - Response: Array of period strings.
    - Errors: 500 server error.
  - POST /estagiarios
    - Description: Create estagiario.
    - Auth: Not authenticated.
    - Request: JSON estagiario data.
    - Response: Created estagiario object.
    - Errors: 400 validation, 500 server error.
  - GET /estagiarios
    - Description: List all estagiarios.
    - Auth: Not authenticated.
    - Response: Array of estagiarios.
    - Errors: 500 server error.
  - GET /estagiarios/aluno/:id
    - Description: Get estagiarios by aluno ID.
    - Auth: Not authenticated.
    - Response: Array of estagiarios.
    - Errors: 500 server error.
  - GET /estagiarios/:id
    - Description: Retrieve estagiario by ID.
    - Auth: Not authenticated.
    - Response: Single estagiario object.
    - Errors: 404 not found, 500 server error.
  - GET /estagiarios/:id/next-nivel
    - Description: Get next level for estagiario.
    - Auth: Not authenticated.
    - Response: Level information.
    - Errors: 404 not found, 500 server error.
  - PUT /estagiarios/:id
    - Description: Update estagiario.
    - Auth: Not authenticated.
    - Request: JSON estagiario data.
    - Response: Updated estagiario object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /estagiarios/:id
    - Description: Delete estagiario.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/estagiarioRoutes.js:10-18](file://src/routers/estagiarioRoutes.js#L10-L18)

### Enrollments (inscricoes)
- Base Path: /inscricoes
- Methods and Paths
  - GET /inscricoes/periodos
    - Description: Get distinct periods.
    - Auth: Bearer token; admin or aluno.
    - Response: Array of period strings.
    - Errors: 401/403, 500 server error.
  - POST /inscricoes
    - Description: Create inscricao (admin or aluno).
    - Auth: Bearer token; admin or aluno.
    - Request: JSON inscricao data.
    - Response: Created inscricao object.
    - Errors: 400 validation, 401/403, 500 server error.
  - GET /inscricoes
    - Description: List all inscricoes (admin or aluno).
    - Auth: Bearer token; admin or aluno.
    - Response: Array of inscricoes.
    - Errors: 401/403, 500 server error.
  - GET /inscricoes/:aluno_id/:muralestagio_id
    - Description: Get inscricao by aluno and mural IDs (admin only).
    - Auth: Bearer token; admin.
    - Response: Single inscricao object.
    - Errors: 401/403, 404 not found, 500 server error.
  - GET /inscricoes/:id
    - Description: Get inscricao by ID (admin or aluno; ownership enforced).
    - Auth: Bearer token; admin or aluno; ownership enforced.
    - Response: Single inscricao object.
    - Errors: 401/403, 404 not found, 500 server error.
  - PUT /inscricoes/:id
    - Description: Update inscricao (admin only).
    - Auth: Bearer token; admin.
    - Request: JSON inscricao data.
    - Response: Updated inscricao object.
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - DELETE /inscricoes/:id
    - Description: Delete inscricao (admin or aluno; ownership enforced).
    - Auth: Bearer token; admin or aluno; ownership enforced.
    - Response: Deletion result.
    - Errors: 401/403, 404 not found, 500 server error.

Nested Routes
- /mural/:id/inscricoes → [src/server.js](file://src/server.js#L63)
- /alunos/:id/inscricoes → [src/server.js](file://src/server.js#L64)

**Section sources**
- [src/routers/inscricaoRoutes.js:11-18](file://src/routers/inscricaoRoutes.js#L11-L18)
- [src/server.js:62-64](file://src/server.js#L62-L64)

### Supervisors (supervisores)
- Base Path: /supervisores
- Methods and Paths
  - GET /supervisores
    - Description: List all supervisores (authenticated).
    - Auth: Bearer token; admin or supervisor.
    - Response: Array of supervisores.
    - Errors: 401/403, 500 server error.
  - GET /supervisores/:id
    - Description: Retrieve supervisor by ID (admin or supervisor; ownership).
    - Auth: Bearer token; admin or supervisor (ownership).
    - Response: Single supervisor object.
    - Errors: 401/403, 404 not found, 500 server error.
  - PUT /supervisores/:id
    - Description: Update supervisor (admin or supervisor; ownership).
    - Auth: Bearer token; admin or supervisor (ownership).
    - Request: JSON supervisor data.
    - Response: Updated supervisor object.
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - GET /supervisores/:id/instituicoes
    - Description: Get instituicoes linked to supervisor (admin or supervisor; ownership).
    - Auth: Bearer token; admin or supervisor (ownership).
    - Response: Array of instituicoes.
    - Errors: 401/403, 500 server error.
  - POST /supervisores/:id/instituicoes
    - Description: Add instituicao to supervisor (admin or supervisor; ownership).
    - Auth: Bearer token; admin or supervisor (ownership).
    - Request: JSON institution data.
    - Response: Updated list or confirmation.
    - Errors: 400 validation, 401/403, 500 server error.
  - DELETE /supervisores/:id/instituicoes/:instituicaoId
    - Description: Remove instituicao from supervisor (admin or supervisor; ownership).
    - Auth: Bearer token; admin or supervisor (ownership).
    - Response: Deletion result.
    - Errors: 401/403, 404 not found, 500 server error.
  - POST /supervisores
    - Description: Create supervisor (admin only).
    - Auth: Bearer token; admin.
    - Request: JSON supervisor data.
    - Response: Created supervisor object.
    - Errors: 400 validation, 401/403, 500 server error.
  - DELETE /supervisores/:id
    - Description: Delete supervisor (admin only).
    - Auth: Bearer token; admin.
    - Response: Deletion result.
    - Errors: 401/403, 404 not found, 500 server error.

Nested Routes
- /supervisores/:id/estagiarios → [src/server.js](file://src/server.js#L57)

**Section sources**
- [src/routers/supervisorRoutes.js:12-24](file://src/routers/supervisorRoutes.js#L12-L24)
- [src/server.js](file://src/server.js#L57)

### Questionnaires (questionarios)
- Base Path: /questionarios
- Methods and Paths
  - POST /questionarios
    - Description: Create questionario.
    - Auth: Not authenticated.
    - Request: JSON questionario data.
    - Response: Created questionario object.
    - Errors: 400 validation, 500 server error.
  - GET /questionarios
    - Description: List all questionarios.
    - Auth: Not authenticated.
    - Response: Array of questionarios.
    - Errors: 500 server error.
  - GET /questionarios/:id
    - Description: Retrieve questionario by ID.
    - Auth: Not authenticated.
    - Response: Single questionario object.
    - Errors: 404 not found, 500 server error.
  - PUT /questionarios/:id
    - Description: Update questionario.
    - Auth: Not authenticated.
    - Request: JSON questionario data.
    - Response: Updated questionario object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /questionarios/:id
    - Description: Delete questionario.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/questionarioRoutes.js:9-14](file://src/routers/questionarioRoutes.js#L9-L14)

### Questions (questoes)
- Base Path: /questoes
- Methods and Paths
  - POST /questoes
    - Description: Create questao.
    - Auth: Not authenticated.
    - Request: JSON questao data.
    - Response: Created questao object.
    - Errors: 400 validation, 500 server error.
  - GET /questoes
    - Description: List all questoes.
    - Auth: Not authenticated.
    - Response: Array of questoes.
    - Errors: 500 server error.
  - GET /questoes/:id
    - Description: Retrieve questao by ID.
    - Auth: Not authenticated.
    - Response: Single questao object.
    - Errors: 404 not found, 500 server error.
  - PUT /questoes/:id
    - Description: Update questao.
    - Auth: Not authenticated.
    - Request: JSON questao data.
    - Response: Updated questao object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /questoes/:id
    - Description: Delete questao.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/questaoRoutes.js:10-15](file://src/routers/questaoRoutes.js#L10-L15)

### Activities (atividades)
- Base Path: /atividades
- Methods and Paths
  - GET /atividades
    - Description: List all atividades.
    - Auth: Not authenticated.
    - Response: Array of atividades.
    - Errors: 500 server error.
  - GET /atividades/:id
    - Description: Retrieve atividade by ID.
    - Auth: Not authenticated.
    - Response: Single atividade object.
    - Errors: 404 not found, 500 server error.
  - POST /atividades
    - Description: Create atividade.
    - Auth: Not authenticated.
    - Request: JSON atividade data.
    - Response: Created atividade object.
    - Errors: 400 validation, 500 server error.
  - POST /atividades/:estagiario_id
    - Description: Create atividade for estagiario.
    - Auth: Not authenticated.
    - Request: JSON atividade data.
    - Response: Created atividade object.
    - Errors: 400 validation, 500 server error.
  - PUT /atividades/:id
    - Description: Update atividade.
    - Auth: Not authenticated.
    - Request: JSON atividade data.
    - Response: Updated atividade object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /atividades/:id
    - Description: Delete atividade.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/atividadesRoutes.js:10-17](file://src/routers/atividadesRoutes.js#L10-L17)

### Visits (visitas)
- Base Path: /visitas
- Methods and Paths
  - GET /visitas
    - Description: List all visitas.
    - Auth: Not authenticated.
    - Response: Array of visitas.
    - Errors: 500 server error.
  - GET /visitas/:id
    - Description: Retrieve visita by ID.
    - Auth: Not authenticated.
    - Response: Single visita object.
    - Errors: 404 not found, 500 server error.
  - POST /visitas
    - Description: Create visita.
    - Auth: Not authenticated.
    - Request: JSON visita data.
    - Response: Created visita object.
    - Errors: 400 validation, 500 server error.
  - PUT /visitas/:id
    - Description: Update visita.
    - Auth: Not authenticated.
    - Request: JSON visita data.
    - Response: Updated visita object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /visitas/:id
    - Description: Delete visita.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/visitaRoutes.js:10-15](file://src/routers/visitaRoutes.js#L10-L15)

### Classes (turmas)
- Base Path: /turmaestagios
- Methods and Paths
  - GET /turmaestagios
    - Description: List all turmas.
    - Auth: Not authenticated.
    - Response: Array of turmas.
    - Errors: 500 server error.
  - GET /turmaestagios/:id
    - Description: Retrieve turma by ID.
    - Auth: Not authenticated.
    - Response: Single turma object.
    - Errors: 404 not found, 500 server error.
  - POST /turmaestagios
    - Description: Create turma.
    - Auth: Not authenticated.
    - Request: JSON turma data.
    - Response: Created turma object.
    - Errors: 400 validation, 500 server error.
  - PUT /turmaestagios/:id
    - Description: Update turma.
    - Auth: Not authenticated.
    - Request: JSON turma data.
    - Response: Updated turma object.
    - Errors: 400 validation, 404 not found, 500 server error.
  - DELETE /turmaestagios/:id
    - Description: Delete turma.
    - Auth: Not authenticated.
    - Response: Deletion result.
    - Errors: 404 not found, 500 server error.

**Section sources**
- [src/routers/turmaRoutes.js:10-15](file://src/routers/turmaRoutes.js#L10-L15)

### Areas (areas)
- Base Path: /areas
- Methods and Paths
  - GET /areas
    - Description: List all areas (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Array of areas.
    - Errors: 401 unauthorized, 500 server error.
  - GET /areas/:id
    - Description: Retrieve area by ID (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Single area object.
    - Errors: 401 unauthorized, 404 not found, 500 server error.
  - POST /areas
    - Description: Create area (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON area data.
    - Response: Created area object.
    - Errors: 400 validation, 401/403, 500 server error.
  - PUT /areas/:id
    - Description: Update area (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON area data.
    - Response: No content (204).
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - DELETE /areas/:id
    - Description: Delete area (admin only).
    - Auth: Bearer token; admin role.
    - Response: No content (204).
    - Errors: 401/403, 404 not found, 500 server error.

**New** Added area management functionality for institutional categorization.

**Section sources**
- [src/routers/areaRoutes.js:10-16](file://src/routers/areaRoutes.js#L10-L16)

### Turnos (Shifts) - NEW
- Base Path: /turnos
- Methods and Paths
  - GET /turnos
    - Description: List all turnos (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Array of turnos with id and turno fields.
    - Errors: 401 unauthorized, 500 server error.
  - GET /turnos/:id
    - Description: Retrieve turno by ID (authenticated).
    - Auth: Bearer token; requires authentication.
    - Response: Single turno object with id and turno fields.
    - Errors: 401 unauthorized, 404 not found, 500 server error.
  - POST /turnos
    - Description: Create turno (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON { turno: string } where turno is one of: diurno, noturno, ambos, integral.
    - Response: Created turno object with id and turno fields.
    - Errors: 400 validation (missing turno), 401/403, 500 server error.
  - PUT /turnos/:id
    - Description: Update turno (admin only).
    - Auth: Bearer token; admin role.
    - Request: JSON { turno: string } where turno is one of: diurno, noturno, ambos, integral.
    - Response: Updated turno object with id and turno fields.
    - Errors: 400 validation (missing turno), 401/403, 404 not found, 500 server error.
  - DELETE /turnos/:id
    - Description: Delete turno (admin only).
    - Auth: Bearer token; admin role.
    - Response: Success message with deletion confirmation.
    - Errors: 401/403, 404 not found, 500 server error.

Turno Values:
- diurno: Day shift
- noturno: Night shift  
- ambos: Both shifts
- integral: Full-time program

Integration with Students:
- Students reference turnos via turno_id foreign key
- Legacy turno field maintained for backward compatibility
- Automatic migration script converts old values to new system

**New** Added comprehensive turnos management system with full CRUD operations and integration with student enrollment system.

**Section sources**
- [src/routers/turnoRoutes.js:9-13](file://src/routers/turnoRoutes.js#L9-L13)
- [src/controllers/turnoController.js:3-71](file://src/controllers/turnoController.js#L3-L71)
- [src/models/turno.js:3-44](file://src/models/turno.js#L3-L44)
- [src/database/setupFullDatabase.js:254-258](file://src/database/setupFullDatabase.js#L254-L258)
- [scripts/backfill_alunos_turno_id.py:67-77](file://scripts/backfill_alunos_turno_id.py#L67-L77)

### Responses (respostas)
- Base Path: /respostas
- Methods and Paths
  - GET /respostas
    - Description: List all respostas (admin, supervisor, aluno, professor).
    - Auth: Bearer token; admin, supervisor, aluno, or professor.
    - Response: Array of respostas.
    - Errors: 401/403, 500 server error.
  - GET /respostas/:id
    - Description: Retrieve resposta by ID (admin, supervisor, aluno, professor).
    - Auth: Bearer token; admin, supervisor, aluno, or professor.
    - Response: Single resposta object.
    - Errors: 401/403, 404 not found, 500 server error.
  - GET /respostas/:id/complete
    - Description: Check if resposta is complete (admin, supervisor, aluno).
    - Auth: Bearer token; admin, supervisor, or aluno.
    - Response: Completion status.
    - Errors: 401/403, 404 not found, 500 server error.
  - GET /respostas/questionario/:questionario_id
    - Description: Get all respostas by questionario (admin, supervisor, aluno, professor).
    - Auth: Bearer token; admin, supervisor, aluno, or professor.
    - Response: Array of respostas.
    - Errors: 401/403, 500 server error.
  - GET /respostas/estagiario/:estagiario_id
    - Description: Get all respostas by estagiario (admin, supervisor, aluno, professor).
    - Auth: Bearer token; admin, supervisor, aluno, or professor.
    - Response: Array of respostas.
    - Errors: 401/403, 500 server error.
  - GET /respostas/supervisor/:supervisor_id
    - Description: Get all respostas by supervisor (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Response: Array of respostas.
    - Errors: 401/403, 500 server error.
  - GET /respostas/supervisor/:supervisor_id/estagiarios
    - Description: Get estagiarios by supervisor (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Response: Array of estagiarios.
    - Errors: 401/403, 500 server error.
  - GET /respostas/estagiario/:estagiario_id/questionario/:questionario_id
    - Description: Get resposta by estagiario and questionario (admin, supervisor, aluno, professor).
    - Auth: Bearer token; admin, supervisor, aluno, or professor.
    - Response: Single resposta object.
    - Errors: 401/403, 404 not found, 500 server error.
  - GET /respostas/supervisor/:supervisor_id/question-count
    - Description: Get question count by supervisor (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Response: Question count.
    - Errors: 401/403, 500 server error.
  - POST /respostas
    - Description: Create resposta (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Request: JSON resposta data.
    - Response: Created resposta object.
    - Errors: 400 validation, 401/403, 500 server error.
  - PUT /respostas/:id
    - Description: Update resposta (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Request: JSON resposta data.
    - Response: No content (204).
    - Errors: 400 validation, 401/403, 404 not found, 500 server error.
  - DELETE /respostas/:id
    - Description: Delete resposta (admin, supervisor).
    - Auth: Bearer token; admin or supervisor.
    - Response: No content (204).
    - Errors: 401/403, 404 not found, 500 server error.

**New** Added comprehensive response management for questionnaire completion tracking.

**Section sources**
- [src/routers/respostaRoutes.js:25-52](file://src/routers/respostaRoutes.js#L25-L52)

### Settings (configuracoes)
- Base Path: /configuracoes
- Methods and Paths
  - GET /configuracoes
    - Description: List all configuracoes (authenticated).
    - Auth: Bearer token.
    - Response: Array of configuracoes.
    - Errors: 401 unauthorized, 500 server error.
  - GET /configuracoes/:id
    - Description: Retrieve configuracao by ID (authenticated).
    - Auth: Bearer token.
    - Response: Single configuracao object.
    - Errors: 401 unauthorized, 404 not found, 500 server error.
  - PUT /configuracoes/:id
    - Description: Update configuracao (authenticated).
    - Auth: Bearer token.
    - Request: JSON configuracao data.
    - Response: Updated configuracao object.
    - Errors: 400 validation, 401 unauthorized, 404 not found, 500 server error.

Note: The configuracao routes do not currently apply role middleware in the route definition; ensure appropriate protection in production.

**Section sources**
- [src/routers/configuracaoRoutes.js:11-16](file://src/routers/configuracaoRoutes.js#L11-L16)

### Responses, Errors, and Status Codes
Common patterns:
- Successful responses return 200 with the resource object or array; creation returns 201.
- Validation failures return 400 with an error message.
- Missing/expired/invalid tokens return 401 with a specific message.
- Insufficient permissions return 403.
- Not found returns 404.
- Internal server errors return 500.

Examples of error messages:
- "Token não fornecido"
- "Token inválido"
- "Token expirado"
- "Acesso negado. Permissão insuficiente."
- "Acesso negado. Você só pode acessar ou editar seus próprios dados."
- "Turno is required" (for turnos endpoints)
- "Turno not found" (for turnos endpoints)

**Updated** Enhanced error handling includes specific messages for turnos management operations.

**Section sources**
- [AUTH_GUIDE.md:289-300](file://AUTH_GUIDE.md#L289-L300)
- [src/middleware/auth.js:10-29](file://src/middleware/auth.js#L10-L29)
- [src/middleware/auth.js:38-47](file://src/middleware/auth.js#L38-L47)
- [src/middleware/auth.js:95-98](file://src/middleware/auth.js#L95-L98)
- [src/middleware/auth.js:129-131](file://src/middleware/auth.js#L129-L131)
- [src/controllers/turnoController.js:30-32](file://src/controllers/turnoController.js#L30-L32)

### Authentication and Authorization Flow
```mermaid
sequenceDiagram
participant Client as "Client"
participant Auth as "/auth/login"
participant MW as "verifyToken"
participant RBAC as "checkRole/checkOwnership"
participant API as "Resource Endpoint"
Client->>Auth : POST /auth/login {email,password}
Auth-->>Client : {token,user}
Client->>API : Request with Authorization : Bearer <token>
API->>MW : verifyToken
MW-->>API : Decoded user
API->>RBAC : checkRole / checkOwnership
alt Allowed
RBAC-->>API : next()
API-->>Client : 2xx Response
else Denied
RBAC-->>Client : 401/403 Error
end
```

**Diagram sources**
- [src/routers/authRoutes.js:8-14](file://src/routers/authRoutes.js#L8-L14)
- [src/middleware/auth.js:6-29](file://src/middleware/auth.js#L6-L29)
- [src/middleware/auth.js:32-48](file://src/middleware/auth.js#L32-L48)
- [src/middleware/auth.js:77-98](file://src/middleware/auth.js#L77-L98)

## Dependency Analysis
- Route-to-Middleware Dependencies
  - Many routes depend on verifyToken and/or checkRole.
  - Ownership checks are applied selectively via checkOwnership and checkInscricaoOwnership.
  - Enhanced professor and institution routes use specialized ownership checks.
- Route-to-Controller Dependencies
  - Each route group imports and invokes a controller module.
- Server-to-Route Dependencies
  - The server mounts route groups under their respective prefixes and registers nested routes.
- Turno System Dependencies
  - Students depend on turnos table via turno_id foreign key.
  - Turno routes require admin role for create/update/delete operations.
  - Migration script maintains backward compatibility with legacy turno field.

```mermaid
graph LR
Server["src/server.js"] --> AR["alunoRoutes.js"]
Server --> PR["professorRoutes.js"]
Server --> IR["instituicaoRoutes.js"]
Server --> ER["estagioRoutes.js"]
Server --> ETR["estagiarioRoutes.js"]
Server --> IR["inscricaoRoutes.js"]
Server --> SR["supervisorRoutes.js"]
Server --> QR["questionarioRoutes.js"]
Server --> QAr["questaoRoutes.js"]
Server --> ATR["atividadesRoutes.js"]
Server --> VR["visitaRoutes.js"]
Server --> TR["turmaRoutes.js"]
Server --> AIR["areaRoutes.js"]
Server --> RR["respostaRoutes.js"]
Server --> CR["configuracaoRoutes.js"]
Server --> TUR["turnoRoutes.js"]
AR --> AMW["auth.js (verifyToken, checkRole, checkOwnership)"]
PR --> PMW["auth.js (verifyToken, checkRole, checkOwnership)"]
IR --> IMW["auth.js (verifyToken, checkRole)"]
SR --> SMW["auth.js (verifyToken, checkRole, checkOwnership)"]
IR --> IMW["auth.js (verifyRole, checkInscricaoOwnership)"]
TUR --> TMW["auth.js (verifyToken, checkRole)"]
```

**Diagram sources**
- [src/server.js:37-61](file://src/server.js#L37-L61)
- [src/routers/alunoRoutes.js](file://src/routers/alunoRoutes.js#L4)
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L5)
- [src/routers/instituicaoRoutes.js](file://src/routers/instituicaoRoutes.js#L4)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L5)
- [src/routers/inscricaoRoutes.js](file://src/routers/inscricaoRoutes.js#L4)
- [src/routers/turnoRoutes.js](file://src/routers/turnoRoutes.js#L3)
- [src/middleware/auth.js:6-29](file://src/middleware/auth.js#L6-L29)

**Section sources**
- [src/server.js:37-61](file://src/server.js#L37-L61)
- [src/routers/alunoRoutes.js](file://src/routers/alunoRoutes.js#L4)
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L5)
- [src/routers/instituicaoRoutes.js](file://src/routers/instituicaoRoutes.js#L4)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L5)
- [src/routers/inscricaoRoutes.js](file://src/routers/inscricaoRoutes.js#L4)
- [src/routers/turnoRoutes.js](file://src/routers/turnoRoutes.js#L3)
- [src/middleware/auth.js:6-29](file://src/middleware/auth.js#L6-L29)

## Performance Considerations
- Rate Limiting
  - Implement rate limiting at the Express layer to prevent abuse of authentication and write endpoints.
  - Consider per-endpoint limits and IP-based quotas.
- CORS
  - Configure CORS for trusted origins and methods to avoid preflight overhead.
  - Restrict exposed headers and credentials appropriately.
- Database Pooling
  - Tune MariaDB pool size according to expected concurrency.
- Payload Size
  - Validate and limit JSON payload sizes to mitigate memory pressure.
- Caching
  - Cache read-heavy lists (e.g., questionarios, questoes, instituicoes, turnos) with appropriate invalidation.
- Turno System Optimization
  - Turno table is small and frequently accessed; consider caching for high-traffic scenarios.
  - Index on turno column for efficient lookups.

## Troubleshooting Guide
Common Issues and Fixes
- 401 Token Required
  - Ensure Authorization header is present and formatted as "Bearer <token>".
  - Regenerate token after expiration.
- 401 Invalid or Expired Token
  - Verify JWT_SECRET matches server configuration.
  - Confirm clock synchronization on client and server.
- 403 Access Denied
  - Confirm user role and ownership requirements for the endpoint.
  - Admin privileges override role restrictions.
  - For entity-based endpoints, ensure entidade_id matches user's entity.
  - Turno management requires admin role.
- 404 Resource Not Found
  - Verify IDs and nested route parameters.
  - Check that turno_id references existing turnos table entries.
- 500 Internal Server Error
  - Check server logs and database connectivity.
  - Validate request payloads against model expectations.
  - Verify turnos table exists and is properly populated.
- Turno Migration Issues
  - Ensure migration script has been executed if encountering legacy turno field issues.
  - Verify turnos table contains expected shift values.

**Updated** Added troubleshooting guidance for turnos management and migration issues.

**Section sources**
- [AUTH_GUIDE.md:289-300](file://AUTH_GUIDE.md#L289-L300)
- [src/middleware/auth.js:10-29](file://src/middleware/auth.js#L10-L29)
- [src/middleware/auth.js:38-47](file://src/middleware/auth.js#L38-L47)
- [src/middleware/auth.js:95-98](file://src/middleware/auth.js#L95-L98)
- [scripts/backfill_alunos_turno_id.py:67-77](file://scripts/backfill_alunos_turno_id.py#L67-L77)

## Conclusion
This API reference documents all REST endpoints, their authentication and authorization requirements, nested routes, and error handling patterns. The recent additions include comprehensive institutional management, professor management, enhanced authentication endpoints with entity-based user management, and the new turnos management system. The turnos system provides structured shift management with backward compatibility and automatic migration support. Apply the provided middleware consistently, secure tokens properly, and consider rate limiting and CORS for production readiness.

## Appendices

### Practical Usage Examples
- Authentication
  - POST /auth/register with { email, password, passwordConfirm, nome, identificacao?, role?, entidade_id? }
  - POST /auth/login with { email, password }
  - GET /auth/profile with Authorization: Bearer <token>
  - PUT /auth/users/:id with { nome?, email?, identificacao?, role? (admin only), entidade_id? }
- CRUD Examples
  - POST /alunos with aluno data (admin or aluno)
  - GET /alunos/:id
  - PUT /alunos/:id (admin or aluno; ownership)
  - DELETE /alunos/:id (admin)
  - POST /professores with professor data (admin or professor)
  - GET /professores/:id
  - PUT /professores/:id (admin or professor; ownership)
  - DELETE /professores/:id (admin)
  - POST /instituicoes with institution data (admin)
  - GET /instituicoes/:id
  - PUT /instituicoes/:id (admin)
  - DELETE /instituicoes/:id (admin)
  - POST /turnos with { turno: "diurno" | "noturno" | "ambos" | "integral" } (admin only)
  - GET /turnos
  - GET /turnos/:id
  - PUT /turnos/:id (admin only)
  - DELETE /turnos/:id (admin only)
- Relationship Endpoints
  - GET /alunos/:id/inscricoes
  - GET /supervisores/:id/estagiarios
  - GET /mural/:id/inscricoes
  - GET /professores/:id/estagiarios
  - GET /instituicoes/:id/supervisores
  - GET /instituicoes/:id/mural

### Integration Guidelines
- Frontend
  - Persist JWT securely (avoid localStorage for sensitive APIs).
  - Attach Authorization header to all authenticated requests.
  - Handle token refresh or re-login on 401 responses.
  - Implement entity-based navigation for different user roles.
  - Integrate turnos dropdown in student forms using /turnos endpoint.
- Backend
  - Centralize middleware usage in route definitions.
  - Log and monitor 401/403 occurrences for misuse detection.
  - Validate inputs and sanitize outputs.
  - Implement proper error handling for entity-based operations.
  - Ensure turnos table is properly seeded with shift values.
  - Execute migration script to convert legacy turno data to new system.

### Database Schema Overview
- Turnos Table Structure
  - id: INT AUTO_INCREMENT PRIMARY KEY
  - turno: VARCHAR(10) NOT NULL (values: diurno, noturno, ambos, integral)
- Alunos Table Enhancement
  - turno_id: INT NULL (foreign key to turnos.id)
  - Legacy turno field maintained for backward compatibility
- Migration Process
  - Automatic conversion from legacy turno values to turno_id references
  - Supports diurno, noturno, ambos, integral mappings
  - Preserves existing data integrity during transition

**Section sources**
- [src/database/setupFullDatabase.js:254-258](file://src/database/setupFullDatabase.js#L254-L258)
- [src/models/aluno.js](file://src/models/aluno.js#L32)
- [scripts/backfill_alunos_turno_id.py:67-77](file://scripts/backfill_alunos_turno_id.py#L67-L77)