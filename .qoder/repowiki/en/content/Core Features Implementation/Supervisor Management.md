# Supervisor Management

<cite>
**Referenced Files in This Document**
- [supervisor.js](file://src/models/supervisor.js)
- [supervisorController.js](file://src/controllers/supervisorController.js)
- [supervisorRoutes.js](file://src/routers/supervisorRoutes.js)
- [db.js](file://src/database/db.js)
- [auth.js](file://src/middleware/auth.js)
- [supervisores.html](file://public/supervisores.html)
- [new-supervisor.html](file://public/new-supervisor.html)
- [edit-supervisor.html](file://public/edit-supervisor.html)
- [view-supervisor.html](file://public/view-supervisor.html)
- [supervisores.js](file://public/supervisores.js)
- [new-supervisor.js](file://public/new-supervisor.js)
- [edit-supervisor.js](file://public/edit-supervisor.js)
- [view-supervisor.js](file://public/view-supervisor.js)
- [estagio.js](file://src/models/estagio.js)
</cite>

## Update Summary
**Changes Made**
- Updated field naming consistency documentation to reflect the correction from 'celular' to 'telefone' throughout controller and model implementations
- Updated validation rules and data integrity sections to reflect the standardized phone field naming
- Revised frontend integration examples to show consistent field naming across the application
- Updated workflow documentation to reflect the corrected parameter order in Supervisor.create and Supervisor.update methods

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
This document describes the Supervisor Management system, covering the complete CRUD lifecycle for supervisor entities, professional profile management, institutional affiliation tracking, and integration with the internship management system. The system has been updated to address field naming inconsistencies, specifically correcting 'celular' field names to 'telefone' throughout controller and model implementations for improved data validation and consistency.

## Project Structure
The Supervisor Management system follows a layered architecture with consistent field naming:
- Frontend: Static HTML pages and client-side scripts for listing, creating, editing, and viewing supervisors, plus managing institutional affiliations and student supervision views.
- Backend: Express routes, controllers, and models implementing CRUD and specialized operations for supervisors and their relationships with standardized field naming.
- Database: MariaDB via a connection pool abstraction.
- Security: JWT-based authentication and authorization middleware enforcing roles and ownership checks.

```mermaid
graph TB
subgraph "Frontend"
FE_List["supervisores.html<br/>supervisores.js"]
FE_New["new-supervisor.html<br/>new-supervisor.js"]
FE_Edit["edit-supervisor.html<br/>edit-supervisor.js"]
FE_View["view-supervisor.html<br/>view-supervisor.js"]
end
subgraph "Backend"
Routes["supervisorRoutes.js"]
Controller["supervisorController.js"]
Model["supervisor.js"]
DB["db.js"]
Auth["auth.js"]
end
FE_List --> Routes
FE_New --> Routes
FE_Edit --> Routes
FE_View --> Routes
Routes --> Controller
Controller --> Model
Model --> DB
Routes --> Auth
```

**Diagram sources**
- [supervisores.html:1-49](file://public/supervisores.html#L1-L49)
- [supervisores.js:1-47](file://public/supervisores.js#L1-L47)
- [new-supervisor.html:1-57](file://public/new-supervisor.html#L1-L57)
- [new-supervisor.js:1-45](file://public/new-supervisor.js#L1-L45)
- [edit-supervisor.html:1-58](file://public/edit-supervisor.html#L1-L58)
- [edit-supervisor.js:1-78](file://public/edit-supervisor.js#L1-L78)
- [view-supervisor.html:1-137](file://public/view-supervisor.html#L1-L137)
- [view-supervisor.js:1-225](file://public/view-supervisor.js#L1-L225)
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)
- [db.js:1-15](file://src/database/db.js#L1-L15)
- [auth.js:1-137](file://src/middleware/auth.js#L1-L137)

**Section sources**
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)
- [db.js:1-15](file://src/database/db.js#L1-L15)
- [auth.js:1-137](file://src/middleware/auth.js#L1-L137)
- [supervisores.html:1-49](file://public/supervisores.html#L1-L49)
- [new-supervisor.html:1-57](file://public/new-supervisor.html#L1-L57)
- [edit-supervisor.html:1-58](file://public/edit-supervisor.html#L1-L58)
- [view-supervisor.html:1-137](file://public/view-supervisor.html#L1-L137)

## Core Components
- Supervisor Model: Implements CRUD operations for supervisors with standardized field naming and manages many-to-many relationships with institutions via an associative table.
- Supervisor Controller: Exposes REST endpoints for supervisors and institutional relationships, with robust error handling and consistent parameter ordering.
- Supervisor Routes: Defines protected endpoints with role-based access and ownership checks.
- Authentication & Authorization Middleware: Validates tokens, enforces roles (admin, supervisor), and restricts access to owned records.
- Frontend Pages: Provide listing, creation, editing, and detailed views for supervisors, including institutional associations and student supervision tabs.

Key responsibilities:
- Professional profile management: Create, read, update supervisor details (name, email, phone, CRESS) with consistent field naming.
- Institutional affiliation tracking: Associate supervisors with institutions and manage those associations.
- Relationship management: Integrate with the internship system to support supervisor-student assignment and oversight.

**Section sources**
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [auth.js:1-137](file://src/middleware/auth.js#L1-L137)

## Architecture Overview
The system uses a clean separation of concerns with standardized field naming:
- Routes define the API surface and apply middleware for authentication and authorization.
- Controllers orchestrate model operations and respond with appropriate HTTP statuses.
- Models encapsulate database interactions and maintain referential integrity with consistent parameter ordering.
- Frontend pages consume the API to present data and collect user input.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Router as "supervisorRoutes.js"
participant Auth as "auth.js"
participant Controller as "supervisorController.js"
participant Model as "supervisor.js"
participant DB as "db.js"
Browser->>Router : GET /supervisores
Router->>Auth : verifyToken()
Auth-->>Router : decoded user
Router->>Auth : checkRole(["admin","supervisor"])
Auth-->>Router : allowed
Router->>Controller : getAllSupervisores()
Controller->>Model : findAll()
Model->>DB : pool.query(...)
DB-->>Model : rows
Model-->>Controller : supervisores[]
Controller-->>Browser : 200 OK JSON
Browser->>Router : POST /supervisores (admin)
Router->>Auth : verifyToken(), checkRole("admin")
Auth-->>Router : allowed
Router->>Controller : createSupervisor()
Controller->>Model : create(nome, cress, regiao, cpf, email, telefone, celular, escola, ano_formacao, cargo, observacoes)
Model->>DB : INSERT supervisores
DB-->>Model : insertId
Model-->>Controller : {id,...}
Controller-->>Browser : 201 Created JSON
```

**Diagram sources**
- [supervisorRoutes.js:12-24](file://src/routers/supervisorRoutes.js#L12-L24)
- [auth.js:6-29](file://src/middleware/auth.js#L6-L29)
- [supervisorController.js:4-40](file://src/controllers/supervisorController.js#L4-L40)
- [supervisor.js:5-26](file://src/models/supervisor.js#L5-L26)
- [db.js:5-13](file://src/database/db.js#L5-L13)

## Detailed Component Analysis

### Supervisor Model
The model encapsulates:
- Listing supervisors with ordered results.
- Retrieving a single supervisor by ID.
- Creating supervisors with required fields using standardized parameter order.
- Updating supervisors with partial updates using consistent parameter ordering.
- Deleting supervisors with cascading removal of institutional relationships.
- Managing many-to-many relationships with institutions via an associative table.

**Updated** Field naming has been standardized throughout the model implementation, with consistent use of 'telefone' for phone numbers and 'celular' for cellular numbers.

```mermaid
classDiagram
class SupervisorModel {
+findAll() Array
+findById(id) Object
+create(nome, cress, regiao, cpf, email, telefone, celular, escola, ano_formacao, cargo, observacoes) Object
+update(id, nome, cress, regiao, cpf, email, telefone, celular, escola, ano_formacao, cargo, observacoes) Boolean
+delete(id) Boolean
+findInstituicoesBySupervisorId(supervisor_id) Array
+addInstituicao(supervisor_id, instituicao_id) Object
+removeInstituicao(supervisor_id, instituicao_id) Boolean
}
class DatabasePool {
+query(sql, params) ResultSet
}
SupervisorModel --> DatabasePool : "uses"
```

**Diagram sources**
- [supervisor.js:4-76](file://src/models/supervisor.js#L4-L76)
- [db.js:5-13](file://src/database/db.js#L5-L13)

**Section sources**
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)

### Supervisor Controller
Endpoints:
- GET /supervisores: List all supervisors.
- GET /supervisores/:id: Retrieve a supervisor by ID.
- POST /supervisores: Create a supervisor (admin only) with standardized parameter extraction.
- PUT /supervisores/:id: Update a supervisor (admin or supervisor owner) with consistent parameter ordering.
- DELETE /supervisores/:id: Delete a supervisor (admin only).
- GET /supervisores/:id/instituicoes: List associated institutions.
- POST /supervisores/:id/instituicoes: Add an institution association.
- DELETE /supervisores/:id/instituicoes/:instituicaoId: Remove an institution association.

Error handling ensures appropriate HTTP status codes and meaningful messages.

**Updated** Parameter extraction and ordering have been standardized to improve data validation consistency throughout the controller implementation.

**Section sources**
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)

### Supervisor Routes
Security and routing:
- All endpoints require a valid JWT token.
- Role-based access:
  - admin: full CRUD on supervisors and institutional associations.
  - supervisor: read/update access to their own records.
- Ownership enforcement prevents cross-entity access for non-admin users.

**Section sources**
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [auth.js:32-98](file://src/middleware/auth.js#L32-L98)

### Frontend Integration
- supervisores.html: Lists supervisors with action buttons to edit or delete; requires admin role.
- new-supervisor.html: Form to create a new supervisor; submits to backend and redirects to view.
- edit-supervisor.html: Edit form pre-populated from API; supports PUT updates.
- view-supervisor.html: Detailed view with tabs for supervisor data and supervised students; manages institutional associations via modal.

Client-side scripts:
- supervisores.js: DataTables-driven listing, role checks, and deletion flow.
- new-supervisor.js: Submits new supervisor data and navigates to view.
- edit-supervisor.js: Loads supervisor data, validates presence, and performs updates with standardized field handling.
- view-supervisor.js: Loads supervisor details, institutional associations, and supervised students; handles adding/removing institutions and navigation.

**Updated** Field naming consistency has been maintained across frontend scripts, with 'celular' used for phone input fields in HTML forms while the backend maintains standardized parameter ordering.

```mermaid
sequenceDiagram
participant User as "User"
participant FE_View as "view-supervisor.html"
participant JS as "view-supervisor.js"
participant API as "supervisorRoutes.js/controller"
participant Model as "supervisor.js"
User->>FE_View : Open view page with ?id
FE_View->>JS : Initialize
JS->>API : GET /supervisores/ : id
API->>Model : findById(id)
Model-->>API : supervisor
API-->>JS : supervisor JSON
JS-->>FE_View : Populate supervisor fields
User->>JS : Click "Add Institution"
JS->>API : POST /supervisores/ : id/instituicoes
API->>Model : addInstituicao(id, instituicao_id)
Model-->>API : {supervisor_id, instituicao_id}
API-->>JS : 201 Created
JS-->>FE_View : Refresh institution list
```

**Diagram sources**
- [view-supervisor.html:1-137](file://public/view-supervisor.html#L1-L137)
- [view-supervisor.js:1-225](file://public/view-supervisor.js#L1-L225)
- [supervisorRoutes.js:17-20](file://src/routers/supervisorRoutes.js#L17-L20)
- [supervisorController.js:73-96](file://src/controllers/supervisorController.js#L73-L96)
- [supervisor.js:47-65](file://src/models/supervisor.js#L47-L65)

**Section sources**
- [supervisores.html:1-49](file://public/supervisores.html#L1-L49)
- [supervisores.js:1-47](file://public/supervisores.js#L1-L47)
- [new-supervisor.html:1-57](file://public/new-supervisor.html#L1-L57)
- [new-supervisor.js:1-45](file://public/new-supervisor.js#L1-L45)
- [edit-supervisor.html:1-58](file://public/edit-supervisor.html#L1-L58)
- [edit-supervisor.js:1-78](file://public/edit-supervisor.js#L1-L78)
- [view-supervisor.html:1-137](file://public/view-supervisor.html#L1-L137)
- [view-supervisor.js:1-225](file://public/view-supervisor.js#L1-L225)

### Validation Rules and Data Integrity
- Required fields for supervisor creation and updates:
  - Name: required.
  - CRESS: required.
  - Email: optional but validated by browser/form.
  - Phone: standardized as 'telefone' field name with consistent validation.
  - Cellular: maintained as 'celular' field name for cellular numbers.
- Institutional affiliation management:
  - Adding an institution requires a valid institution ID.
  - Removing an institution requires a valid relationship exists.
- Ownership and roles:
  - Non-admin users can only access or modify their own records.
  - Admin users bypass ownership checks.
- Cascading deletes:
  - Deleting a supervisor removes all associated institutional relationships before deleting the supervisor record.

**Updated** Field naming has been standardized throughout the validation rules, with 'telefone' consistently used for phone numbers and 'celular' for cellular numbers across all components.

**Section sources**
- [supervisorController.js:30-71](file://src/controllers/supervisorController.js#L30-L71)
- [supervisor.js:36-44](file://src/models/supervisor.js#L36-L44)
- [auth.js:77-98](file://src/middleware/auth.js#L77-L98)

### Workflow: Supervisor-Student Assignment and Internship Oversight
- Supervisors can oversee students through institutional affiliations:
  - Institutions are managed via the supervisor view modal.
  - Students are linked to supervisors through the institution-supervisor relationship.
- The system integrates with the internship management system by:
  - Using institution IDs to resolve supervisors for a given institution.
  - Presenting supervised students in the supervisor view for evaluation and oversight.

```mermaid
flowchart TD
Start(["Load Supervisor View"]) --> LoadSupervisor["Fetch Supervisor Details"]
LoadSupervisor --> LoadInst["Fetch Associated Institutions"]
LoadInst --> LoadStudents["Fetch Supervised Students"]
LoadStudents --> ShowTabs["Show Student and Institution Tabs"]
ShowTabs --> AddInst["Add Institution Modal"]
AddInst --> PostInst["POST /supervisores/:id/instituicoes"]
PostInst --> RefreshInst["Refresh Institution List"]
ShowTabs --> RemoveInst["Remove Institution"]
RemoveInst --> DeleteInst["DELETE /supervisores/:id/instituicoes/:instituicaoId"]
DeleteInst --> RefreshInst
RefreshInst --> End(["Done"])
```

**Diagram sources**
- [view-supervisor.js:55-156](file://public/view-supervisor.js#L55-L156)
- [supervisorRoutes.js:17-20](file://src/routers/supervisorRoutes.js#L17-L20)
- [supervisorController.js:73-111](file://src/controllers/supervisorController.js#L73-L111)
- [supervisor.js:47-73](file://src/models/supervisor.js#L47-L73)

**Section sources**
- [view-supervisor.js:163-206](file://public/view-supervisor.js#L163-L206)
- [estagio.js:43-51](file://src/models/estagio.js#L43-L51)

## Dependency Analysis
- Route-layer dependencies:
  - supervisorRoutes.js depends on supervisorController.js.
  - supervisorController.js depends on supervisor.js.
  - supervisor.js depends on db.js.
  - supervisorRoutes.js depends on auth.js for middleware.
- Frontend dependencies:
  - All supervisor pages depend on menu.js and auth-utils.js for navigation and authentication checks.
  - view-supervisor.js additionally depends on Bootstrap and jQuery for UI and modals.

```mermaid
graph LR
FE_List["supervisores.js"] --> Routes["supervisorRoutes.js"]
FE_New["new-supervisor.js"] --> Routes
FE_Edit["edit-supervisor.js"] --> Routes
FE_View["view-supervisor.js"] --> Routes
Routes --> Controller["supervisorController.js"]
Controller --> Model["supervisor.js"]
Model --> DB["db.js"]
Routes --> Auth["auth.js"]
```

**Diagram sources**
- [supervisores.js:1-47](file://public/supervisores.js#L1-L47)
- [new-supervisor.js:1-45](file://public/new-supervisor.js#L1-L45)
- [edit-supervisor.js:1-78](file://public/edit-supervisor.js#L1-L78)
- [view-supervisor.js:1-225](file://public/view-supervisor.js#L1-L225)
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)
- [db.js:1-15](file://src/database/db.js#L1-L15)
- [auth.js:1-137](file://src/middleware/auth.js#L1-L137)

**Section sources**
- [supervisorRoutes.js:1-27](file://src/routers/supervisorRoutes.js#L1-L27)
- [supervisorController.js:1-112](file://src/controllers/supervisorController.js#L1-L112)
- [supervisor.js:1-77](file://src/models/supervisor.js#L1-L77)
- [db.js:1-15](file://src/database/db.js#L1-L15)
- [auth.js:1-137](file://src/middleware/auth.js#L1-L137)

## Performance Considerations
- Database pooling: Connection limits and queue behavior are configured centrally to handle concurrent requests efficiently.
- Query optimization: Sorting and filtering are applied at the SQL level for supervisor listings and institution associations.
- Frontend pagination: DataTables handles client-side pagination for supervisor lists, reducing payload sizes.

## Troubleshooting Guide
Common issues and resolutions:
- Token errors: Ensure a valid JWT is included in the Authorization header; expired or malformed tokens will be rejected.
- Role/access denied: Non-admin users can only access or modify their own records; verify the user's role and entidade_id.
- Supervisor not found: Requests for non-existent supervisors return 404; confirm the ID exists.
- Relationship not found: Attempting to remove a non-existent institution association returns 404; verify the relationship exists.
- Network failures: All endpoints log errors and return generic messages; inspect browser network tab and server logs.
- Field naming inconsistencies: Ensure frontend forms use 'celular' for phone inputs while backend maintains standardized parameter ordering for improved validation.

**Section sources**
- [auth.js:6-29](file://src/middleware/auth.js#L6-L29)
- [supervisorController.js:16-28](file://src/controllers/supervisorController.js#L16-L28)
- [supervisorController.js:98-111](file://src/controllers/supervisorController.js#L98-L111)

## Conclusion
The Supervisor Management system provides a secure, role-aware, and integrated solution for managing supervisors, their institutional affiliations, and their relationships with students. The recent field naming corrections have improved data validation consistency throughout the system, with standardized 'telefone' usage for phone numbers and 'celular' for cellular numbers. The backend offers robust CRUD and relationship operations, while the frontend delivers intuitive workflows for data entry, editing, and oversight. The design supports future extensions such as supervision capacity limits and deeper integration with the internship management system.