# Institutional Management APIs

<cite>
**Referenced Files in This Document**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js)
- [src/models/docente.js](file://src/models/docente.js)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js)
- [src/models/supervisor.js](file://src/models/supervisor.js)
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js)
- [src/models/areaInstituicao.js](file://src/models/areaInstituicao.js)
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js)
- [src/models/estagiario.js](file://src/models/estagiario.js)
- [src/middleware/auth.js](file://src/middleware/auth.js)
- [src/database/db.js](file://src/database/db.js)
</cite>

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

## Introduction
This document provides comprehensive API documentation for institutional management endpoints focused on professors, supervisors, and institutional areas. It covers:
- Professor endpoints for listing and retrieving faculty members, including relationship endpoints for student supervision.
- Supervisor endpoints for external supervisor management and N-to-N relationships with institutions.
- Institutional area endpoints for managing departments and divisions.
- Role-based access patterns, ownership checks, and hierarchical relationship management among entities.

## Project Structure
The backend follows a layered architecture:
- Routers define HTTP endpoints and apply middleware.
- Controllers implement request handling and orchestrate model operations.
- Models encapsulate database queries and relationships.
- Middleware enforces authentication, roles, and ownership.
- Database configuration connects to MariaDB via a connection pool.

```mermaid
graph TB
subgraph "HTTP Layer"
DR["docenteRoutes.js"]
SR["supervisorRoutes.js"]
AIR["areaInstituicaoRoutes.js"]
ER["estagiarioRoutes.js"]
end
subgraph "Controllers"
DC["docenteController.js"]
SC["supervisorController.js"]
AIC["areaInstituicaoController.js"]
EC["estagiarioController.js"]
end
subgraph "Models"
DM["docente.js"]
SM["supervisor.js"]
AIM["areaInstituicao.js"]
EM["estagiario.js"]
end
subgraph "Middleware"
AM["auth.js"]
end
subgraph "Database"
DB["db.js"]
end
DR --> DC
SR --> SC
AIR --> AIC
ER --> EC
DC --> DM
SC --> SM
AIC --> AIM
EC --> EM
DR --> AM
SR --> AM
AIR --> AM
ER --> AM
DM --> DB
SM --> DB
AIM --> DB
EM --> DB
```

**Diagram sources**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L1-L20)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L1-L27)
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js#L1-L13)
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js#L1-L21)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L1-L85)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L1-L112)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L1-L77)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js#L1-L133)
- [src/models/docente.js](file://src/models/docente.js#L1-L72)
- [src/models/supervisor.js](file://src/models/supervisor.js#L1-L77)
- [src/models/areaInstituicao.js](file://src/models/areaInstituicao.js#L1-L45)
- [src/models/estagiario.js](file://src/models/estagiario.js#L1-L187)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/database/db.js](file://src/database/db.js#L1-L15)

**Section sources**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L1-L20)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L1-L27)
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js#L1-L13)
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js#L1-L21)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/database/db.js](file://src/database/db.js#L1-L15)

## Core Components
- Authentication and Authorization Middleware
  - Token verification and role enforcement.
  - Ownership checks for entity-specific updates and retrievals.
- Professor Management
  - Listing, retrieval, creation, update, deletion.
  - Relationship endpoint to fetch students supervised by a professor.
- Supervisor Management
  - Listing, retrieval, creation, update, deletion.
  - N-to-N relationship endpoints with institutions.
- Institutional Areas
  - CRUD for departments/divisions.
- Student Internship Records
  - CRUD for internships with filters and relationship queries.

**Section sources**
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L1-L85)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L1-L112)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L1-L77)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js#L1-L133)

## Architecture Overview
The system enforces role-based access control (RBAC) and ownership checks at the router level. Controllers delegate to models for persistence and complex joins. Models query the MariaDB pool configured centrally.

```mermaid
sequenceDiagram
participant C as "Client"
participant R as "Router"
participant M as "Middleware"
participant Ctrl as "Controller"
participant Model as "Model"
participant DB as "MariaDB Pool"
C->>R : HTTP Request
R->>M : verifyToken()
M-->>R : Decoded user
R->>M : checkRole([...])
M-->>R : Authorized or 403
R->>Ctrl : Invoke handler
Ctrl->>Model : Perform operation
Model->>DB : Execute SQL
DB-->>Model : Result set
Model-->>Ctrl : Domain response
Ctrl-->>R : JSON or status
R-->>C : HTTP Response
```

**Diagram sources**
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L12-L17)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L13-L24)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L17-L41)
- [src/models/docente.js](file://src/models/docente.js#L13-L42)
- [src/database/db.js](file://src/database/db.js#L5-L13)

## Detailed Component Analysis

### Professor Endpoints
- Base path: /docentes
- List professors with optional search query parameter.
- Retrieve a professor by ID.
- Relationship endpoint to list students (internships) under a professor.
- Create, update, and delete professors with admin role.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "docenteRoutes.js"
participant Auth as "auth.js"
participant Ctrl as "docenteController.js"
participant Model as "docente.js"
participant DB as "db.js"
Client->>Router : GET /docentes?search=...
Router->>Auth : verifyToken(), checkRole(["admin","docente"])
Auth-->>Router : OK
Router->>Ctrl : getAllDocentes()
Ctrl->>Model : findAll(search)
Model->>DB : SELECT ... FROM docentes
DB-->>Model : Rows
Model-->>Ctrl : Array
Ctrl-->>Router : 200 JSON
Router-->>Client : 200 OK
Client->>Router : GET /docentes/ : id
Router->>Auth : verifyToken(), checkRole(["admin","docente"]), checkOwnership
Auth-->>Router : OK
Router->>Ctrl : getDocenteById()
Ctrl->>Model : findById(id)
Model->>DB : SELECT ... FROM docentes WHERE id=?
DB-->>Model : Row
Model-->>Ctrl : Object
Ctrl-->>Router : 200 JSON
Router-->>Client : 200 OK
```

**Diagram sources**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L12-L14)
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L17-L41)
- [src/models/docente.js](file://src/models/docente.js#L13-L42)
- [src/database/db.js](file://src/database/db.js#L5-L13)

**Section sources**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L12-L17)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L17-L84)
- [src/models/docente.js](file://src/models/docente.js#L13-L68)

### Supervisor Endpoints
- Base path: /supervisores
- List supervisors.
- Retrieve, update, and optionally create/delete supervisors.
- Relationship endpoints:
  - List institutions linked to a supervisor.
  - Add an institution to a supervisor.
  - Remove an institution from a supervisor.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "supervisorRoutes.js"
participant Auth as "auth.js"
participant Ctrl as "supervisorController.js"
participant Model as "supervisor.js"
participant DB as "db.js"
Client->>Router : GET /supervisores/ : id/instituicoes
Router->>Auth : verifyToken(), checkRole(["admin","supervisor"]), checkOwnership
Auth-->>Router : OK
Router->>Ctrl : getInstituicoesBySupervisor()
Ctrl->>Model : findInstituicoesBySupervisorId(id)
Model->>DB : SELECT ... FROM inst_super JOIN estagio
DB-->>Model : Rows
Model-->>Ctrl : Institutions
Ctrl-->>Router : 200 JSON
Router-->>Client : 200 OK
Client->>Router : POST /supervisores/ : id/instituicoes
Router->>Auth : verifyToken(), checkRole(["admin","supervisor"]), checkOwnership
Auth-->>Router : OK
Router->>Ctrl : addInstituicaoToSupervisor()
Ctrl->>Model : addInstituicao(supervisor_id, instituicao_id)
Model->>DB : INSERT INTO inst_super
DB-->>Model : OK
Model-->>Ctrl : {supervisor_id, instituicao_id}
Ctrl-->>Router : 201 JSON
Router-->>Client : 201 Created
```

**Diagram sources**
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L18-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L74-L96)
- [src/models/supervisor.js](file://src/models/supervisor.js#L47-L64)
- [src/database/db.js](file://src/database/db.js#L5-L13)

**Section sources**
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L13-L24)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L74-L111)
- [src/models/supervisor.js](file://src/models/supervisor.js#L47-L73)

### Institutional Area Endpoints
- Base path: /area-instituicoes
- Manage departments/divisions with full CRUD.

```mermaid
flowchart TD
Start(["Request Received"]) --> Validate["Validate request body"]
Validate --> Valid{"Valid?"}
Valid --> |No| Err400["Return 400 Bad Request"]
Valid --> |Yes| Create["Model.create(area)"]
Create --> Persist["INSERT INTO area_instituicoes"]
Persist --> Success["Return 201 Created with new area"]
Err400 --> End(["Exit"])
Success --> End
```

**Diagram sources**
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js#L6-L10)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L30-L42)
- [src/models/areaInstituicao.js](file://src/models/areaInstituicao.js#L19-L25)

**Section sources**
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js#L6-L10)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L3-L77)
- [src/models/areaInstituicao.js](file://src/models/areaInstituicao.js#L3-L42)

### Student Internship Relationship Endpoints
- Base path: /estagiarios
- Retrieve students by professor ID (relationship endpoint).
- Retrieve students by supervisor ID (relationship endpoint).
- Compute next internship level for a student.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "estagiarioRoutes.js"
participant Ctrl as "estagiarioController.js"
participant Model as "estagiario.js"
participant DB as "db.js"
Client->>Router : GET /estagiarios/professor/ : id
Router->>Ctrl : getEstagiariosByProfessorId()
Ctrl->>Model : findByProfessorId(professor_id)
Model->>DB : SELECT ... FROM estagiarios JOIN alunos/supervisores
DB-->>Model : Rows
Model-->>Ctrl : Array
Ctrl-->>Router : 200 JSON
Router-->>Client : 200 OK
Client->>Router : GET /estagiarios/ : id/next-nivel
Router->>Ctrl : getNextNivel()
Ctrl->>Model : getNextNivel(aluno_id)
Model->>DB : SELECT latest records and compute next level
DB-->>Model : Aggregated result
Model-->>Ctrl : {next_nivel,...}
Ctrl-->>Router : 200 JSON
Router-->>Client : 200 OK
```

**Diagram sources**
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js#L14-L15)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js#L110-L132)
- [src/models/estagiario.js](file://src/models/estagiario.js#L111-L183)

**Section sources**
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js#L14-L15)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js#L110-L132)
- [src/models/estagiario.js](file://src/models/estagiario.js#L111-L183)

## Dependency Analysis
- Router-to-Controller coupling is loose; each route maps to a single controller method.
- Controller-to-Model coupling is tight; controllers call model methods for persistence and joins.
- Middleware dependency is centralized; all routes import and apply authentication and authorization.
- Database dependency is centralized via a shared pool.

```mermaid
graph LR
DR["docenteRoutes.js"] --> DC["docenteController.js"]
SR["supervisorRoutes.js"] --> SC["supervisorController.js"]
AIR["areaInstituicaoRoutes.js"] --> AIC["areaInstituicaoController.js"]
ER["estagiarioRoutes.js"] --> EC["estagiarioController.js"]
DC --> DM["docente.js"]
SC --> SM["supervisor.js"]
AIC --> AIM["areaInstituicao.js"]
EC --> EM["estagiario.js"]
DR --- AM["auth.js"]
SR --- AM
AIR --- AM
ER --- AM
DM --> DB["db.js"]
SM --> DB
AIM --> DB
EM --> DB
```

**Diagram sources**
- [src/routers/docenteRoutes.js](file://src/routers/docenteRoutes.js#L1-L20)
- [src/routers/supervisorRoutes.js](file://src/routers/supervisorRoutes.js#L1-L27)
- [src/routers/areaInstituicaoRoutes.js](file://src/routers/areaInstituicaoRoutes.js#L1-L13)
- [src/routers/estagiarioRoutes.js](file://src/routers/estagiarioRoutes.js#L1-L21)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L1-L85)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L1-L112)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L1-L77)
- [src/controllers/estagiarioController.js](file://src/controllers/estagiarioController.js#L1-L133)
- [src/models/docente.js](file://src/models/docente.js#L1-L72)
- [src/models/supervisor.js](file://src/models/supervisor.js#L1-L77)
- [src/models/areaInstituicao.js](file://src/models/areaInstituicao.js#L1-L45)
- [src/models/estagiario.js](file://src/models/estagiario.js#L1-L187)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/database/db.js](file://src/database/db.js#L1-L15)

**Section sources**
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/database/db.js](file://src/database/db.js#L5-L13)

## Performance Considerations
- Token verification and role checks occur per request; keep JWT secret secure and rotate tokens regularly.
- Queries use indexed columns where possible (IDs and search term indexing for professors).
- Joins in models (e.g., professors-students, supervisors-institutions) should leverage appropriate indexes on join keys.
- Pagination is not implemented; for large datasets, consider adding limit/offset or cursor-based pagination.

## Troubleshooting Guide
Common issues and resolutions:
- Authentication failures
  - Missing or invalid Authorization header.
  - Expired token.
  - Resolution: Ensure a valid bearer token is sent; verify server-side JWT secret configuration.
- Authorization failures
  - Insufficient role for endpoint.
  - Non-admin user attempting to modify another’s record without ownership.
  - Resolution: Confirm user role and entitlement; admin can bypass ownership checks.
- Entity not found
  - Attempting to update or delete a non-existent professor/supervisor/area.
  - Resolution: Validate IDs before invoking endpoints.
- Relationship errors
  - Adding/removing institution-supervisor relationships.
  - Resolution: Ensure both IDs exist and the relationship payload is correct.

**Section sources**
- [src/middleware/auth.js](file://src/middleware/auth.js#L6-L98)
- [src/controllers/docenteController.js](file://src/controllers/docenteController.js#L33-L51)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L19-L71)
- [src/controllers/areaInstituicaoController.js](file://src/controllers/areaInstituicaoController.js#L19-L56)
- [src/controllers/supervisorController.js](file://src/controllers/supervisorController.js#L86-L111)

## Conclusion
The institutional management APIs provide a clear, role-aware interface for managing professors, supervisors, and institutional areas, with robust relationship endpoints for student supervision and institutional associations. Adhering to the documented RBAC and ownership patterns ensures secure and predictable access to resources.