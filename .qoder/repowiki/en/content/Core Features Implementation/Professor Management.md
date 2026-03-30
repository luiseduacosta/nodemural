# Professor Management

<cite>
**Referenced Files in This Document**
- [src/models/professor.js](file://src/models/professor.js)
- [src/controllers/professorController.js](file://src/controllers/professorController.js)
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js)
- [src/middleware/auth.js](file://src/middleware/auth.js)
- [src/database/db.js](file://src/database/db.js)
- [public/professores.html](file://public/professores.html)
- [public/professores.js](file://public/professores.js)
- [public/new-professor.html](file://public/new-professor.html)
- [public/new-professor.js](file://public/new-professor.js)
- [public/edit-professor.html](file://public/edit-professor.html)
- [public/edit-professor.js](file://public/edit-professor.js)
- [public/view-professor.html](file://public/view-professor.html)
- [public/view-professor.js](file://public/view-professor.js)
- [src/models/aluno.js](file://src/models/aluno.js)
- [src/models/instituicao.js](file://src/models/instituicao.js)
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
10. [Appendices](#appendices)

## Introduction
This document describes the Professor Management system, focusing on the complete CRUD lifecycle for professor entities, academic supervision coordination, and oversight management. It explains controller-side validation and ownership enforcement, model-layer database operations and relationships with students and supervisors, and frontend integration via HTML templates and JavaScript. Validation rules for academic credentials, professional qualifications, and department assignments are documented alongside workflows for supervision coordination and performance tracking. Data consistency requirements and integration patterns with the broader academic management system are addressed.

## Project Structure
The Professor Management feature spans three layers:
- Frontend (public): HTML templates and client-side scripts for listing, viewing, creating, and editing professors, and for displaying supervised students.
- Backend (src): Express routes, controllers, models, middleware, and database pool configuration.
- Database: MariaDB configured via a connection pool.

```mermaid
graph TB
subgraph "Frontend"
FE_List["professores.html<br/>professores.js"]
FE_View["view-professor.html<br/>view-professor.js"]
FE_Create["new-professor.html<br/>new-professor.js"]
FE_Edit["edit-professor.html<br/>edit-professor.js"]
end
subgraph "Backend"
R["professorRoutes.js"]
C["professorController.js"]
M["professor.js (Model)"]
MW["auth.js (Middleware)"]
DB["db.js (MariaDB Pool)"]
end
FE_List --> R
FE_View --> R
FE_Create --> R
FE_Edit --> R
R --> MW
R --> C
C --> M
M --> DB
```

**Diagram sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/database/db.js](file://src/database/db.js#L1-L15)
- [public/professores.html](file://public/professores.html#L1-L48)
- [public/view-professor.html](file://public/view-professor.html#L1-L143)
- [public/new-professor.html](file://public/new-professor.html#L1-L82)
- [public/edit-professor.html](file://public/edit-professor.html#L1-L88)

**Section sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/database/db.js](file://src/database/db.js#L1-L15)
- [public/professores.html](file://public/professores.html#L1-L48)
- [public/view-professor.html](file://public/view-professor.html#L1-L143)
- [public/new-professor.html](file://public/new-professor.html#L1-L82)
- [public/edit-professor.html](file://public/edit-professor.html#L1-L88)

## Core Components
- Model: Provides CRUD operations for professors and a specialized query to list supervised students (estagiários) grouped by student and supervisor.
- Controller: Implements endpoints for listing, retrieving, creating, updating, deleting professors, and fetching supervised students by professor ID.
- Routes: Expose REST endpoints with authentication, role-based authorization, and ownership checks.
- Middleware: Enforces JWT verification, role gating, and ownership constraints for record access.
- Frontend: Renders lists, forms, and detail views; integrates with backend APIs for full CRUD and supervision display.

Key responsibilities:
- Validation and normalization occur at the frontend forms and in the controller’s parameter extraction.
- Ownership enforcement ensures only admins or the owning professor can access/update their own records.
- Supervision queries connect professors to students via the estagio table and related entities.

**Section sources**
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [public/professores.js](file://public/professores.js#L1-L59)
- [public/new-professor.js](file://public/new-professor.js#L1-L48)
- [public/edit-professor.js](file://public/edit-professor.js#L1-L84)
- [public/view-professor.js](file://public/view-professor.js#L1-L108)

## Architecture Overview
The system follows a layered architecture:
- Presentation layer: HTML templates and client scripts.
- Application layer: Express routes, controllers, and middleware.
- Domain layer: Models encapsulate business logic and data access.
- Data layer: MariaDB via a pooled connection.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Router as "professorRoutes.js"
participant MW as "auth.js"
participant Ctrl as "professorController.js"
participant Model as "professor.js"
participant DB as "db.js"
Browser->>Router : GET /docentes/ : id
Router->>MW : verifyToken(), checkRole(), checkOwnership()
MW-->>Router : next()
Router->>Ctrl : getDocenteById()
Ctrl->>Model : findById(id)
Model->>DB : pool.query(...)
DB-->>Model : rows
Model-->>Ctrl : docente
Ctrl-->>Browser : 200 OK JSON
Browser->>Router : POST /docentes
Router->>MW : verifyToken(), checkRole(["admin"])
MW-->>Router : next()
Router->>Ctrl : createDocente()
Ctrl->>Model : create(...)
Model->>DB : pool.query(...)
DB-->>Model : insertId
Model-->>Ctrl : new docente
Ctrl-->>Browser : 201 Created JSON
```

**Diagram sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/database/db.js](file://src/database/db.js#L1-L15)

## Detailed Component Analysis

### Model Layer: Professor Entity and Relationships
The professor model supports:
- Full CRUD operations for professor records.
- Search across professor names.
- Fetching supervised students (estagiários) with student and supervisor details.

```mermaid
classDiagram
class DocenteModel {
+create(...)
+findAll(search)
+findById(id)
+update(id, ...)
+delete(id)
+findEstagiariosByDocenteId(docenteId)
}
class AlunoModel {
+findEstagiariosByAlunoId(id)
+findById(id)
}
class EstagioModel {
+findSupervisoresById(id)
+findMuralById(id)
}
DocenteModel --> EstagioModel : "queries estagiarios"
AlunoModel --> EstagioModel : "joins estagio"
```

**Diagram sources**
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/models/aluno.js](file://src/models/aluno.js#L1-L146)
- [src/models/instituicao.js](file://src/models/instituicao.js#L1-L66)

Implementation highlights:
- Data normalization occurs in the model’s SQL statements and returned objects.
- The supervision query joins estagio with alunos and supervisores to present student-level supervision details.
- The model relies on a shared MariaDB pool for all queries.

**Section sources**
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/database/db.js](file://src/database/db.js#L1-L15)

### Controller Layer: Validation, Ownership, and Business Logic
Responsibilities:
- Extract request parameters and forward to the model.
- Return structured JSON responses with appropriate HTTP status codes.
- Centralized error logging and user-friendly messages.

Validation and ownership:
- Controller does not perform field-level validation; validation is enforced by route middleware and frontend forms.
- Ownership checks are applied via middleware to ensure only authorized users can access or modify records.

**Section sources**
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)

### Route Layer: Access Control and Endpoint Contracts
Endpoints:
- GET /docentes: List professors with optional search; requires admin or docente roles.
- GET /docentes/:id: Retrieve a professor by ID; requires admin or docente roles and ownership.
- GET /docentes/:id/estagiarios: Fetch supervised students; requires admin or docente roles and ownership.
- POST /docentes: Create a professor; requires admin role.
- PUT /docentes/:id: Update a professor; requires admin or docente roles and ownership.
- DELETE /docentes/:id: Delete a professor; requires admin role.

Access control:
- verifyToken: Validates JWT presence and signature.
- checkRole: Restricts endpoints to allowed roles.
- checkOwnership: Ensures non-admin users can only access or modify their own records.

**Section sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)

### Frontend Integration: Templates and Scripts
- Listing page: Loads professors via AJAX and renders a searchable table with actions.
- Creation page: Submits new professor data to the backend and navigates to the view page upon success.
- Editing page: Preloads existing data, validates required fields, and updates the record.
- View page: Displays professor details and a tabbed panel for supervised students, linking to student profiles.

```mermaid
sequenceDiagram
participant List as "professores.js"
participant API as "/docentes"
participant Table as "DataTable"
List->>API : GET /docentes
API-->>List : 200 JSON
List->>Table : populate rows
participant Create as "new-professor.js"
participant API2 as "/docentes"
Create->>API2 : POST /docentes
API2-->>Create : 201 JSON {id}
Create->>View : redirect to view-professor.html?id={id}
participant Edit as "edit-professor.js"
participant API3 as "/docentes/ : id"
Edit->>API3 : GET /docentes/ : id
API3-->>Edit : 200 JSON
Edit->>API3 : PUT /docentes/ : id
API3-->>Edit : 204 No Content
Edit->>View : redirect to view-professor.html?id={id}
```

**Diagram sources**
- [public/professores.js](file://public/professores.js#L1-L59)
- [public/new-professor.js](file://public/new-professor.js#L1-L48)
- [public/edit-professor.js](file://public/edit-professor.js#L1-L84)
- [public/view-professor.js](file://public/view-professor.js#L1-L108)

**Section sources**
- [public/professores.html](file://public/professores.html#L1-L48)
- [public/professores.js](file://public/professores.js#L1-L59)
- [public/new-professor.html](file://public/new-professor.html#L1-L82)
- [public/new-professor.js](file://public/new-professor.js#L1-L48)
- [public/edit-professor.html](file://public/edit-professor.html#L1-L88)
- [public/edit-professor.js](file://public/edit-professor.js#L1-L84)
- [public/view-professor.html](file://public/view-professor.html#L1-L143)
- [public/view-professor.js](file://public/view-professor.js#L1-L108)

### Supervision Coordination and Performance Tracking
Supervision data is derived from the professor’s supervised students:
- The model query joins estagio with alunos and supervisores to present student registration, name, supervisor name, level, and period.
- The view page displays this data in a responsive table and handles empty states gracefully.

```mermaid
flowchart TD
Start(["Load Professor Details"]) --> FetchDocente["Fetch professor by ID"]
FetchDocente --> FetchEstagiarios["Fetch supervised students by professor ID"]
FetchEstagiarios --> RenderTable["Render student table with links to student profiles"]
RenderTable --> End(["Done"])
```

**Diagram sources**
- [src/models/professor.js](file://src/models/professor.js#L50-L68)
- [public/view-professor.js](file://public/view-professor.js#L70-L107)

**Section sources**
- [src/models/professor.js](file://src/models/professor.js#L50-L68)
- [public/view-professor.html](file://public/view-professor.html#L105-L131)
- [public/view-professor.js](file://public/view-professor.js#L70-L107)

## Dependency Analysis
- Routes depend on middleware for authentication and authorization.
- Controllers depend on models for data operations.
- Models depend on the database pool for SQL execution.
- Frontend scripts depend on routes for data exchange.

```mermaid
graph LR
FE["Frontend Scripts"] --> R["professorRoutes.js"]
R --> MW["auth.js"]
R --> C["professorController.js"]
C --> M["professor.js"]
M --> DB["db.js"]
```

**Diagram sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/database/db.js](file://src/database/db.js#L1-L15)

**Section sources**
- [src/routers/professorRoutes.js](file://src/routers/professorRoutes.js#L1-L20)
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [src/models/professor.js](file://src/models/professor.js#L1-L72)
- [src/database/db.js](file://src/database/db.js#L1-L15)

## Performance Considerations
- Use of a connection pool reduces connection overhead and improves throughput under concurrent requests.
- Queries are straightforward; ensure indexes exist on frequently filtered columns (e.g., professor ID, student ID) to optimize joins.
- Pagination or server-side filtering should be considered for large datasets in the listing view.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Authentication failures: Ensure a valid JWT is included in the Authorization header and not expired.
- Role-based access denied: Confirm the user’s role is admin or docente; ownership checks apply for GET/PUT/DELETE on individual records.
- Record not found: Verify the professor ID exists and matches the requested resource.
- Frontend navigation errors: Confirm the URL includes the required ID parameter and that the user has proper permissions.

**Section sources**
- [src/middleware/auth.js](file://src/middleware/auth.js#L1-L137)
- [src/controllers/professorController.js](file://src/controllers/professorController.js#L1-L85)
- [public/professores.js](file://public/professores.js#L1-L59)
- [public/view-professor.js](file://public/view-professor.js#L1-L108)

## Conclusion
The Professor Management system provides a robust, secure, and user-friendly solution for managing professors, their academic profiles, and supervision relationships. The layered architecture cleanly separates concerns, while middleware enforces strong access controls. The frontend offers intuitive forms and views, and the model layer efficiently retrieves supervision data. Adhering to the documented validation rules and ownership policies ensures data consistency and alignment with the broader academic management system.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Validation Rules and Field Constraints
- Required fields for creation and editing include name, siape, email, and department.
- Department values are constrained to predefined options.
- Optional fields include CPF, phone, curriculum Lattes, and egress date/motive/observations.
- The system relies on frontend form validation and middleware/role enforcement for access control.

**Section sources**
- [public/new-professor.html](file://public/new-professor.html#L21-L68)
- [public/edit-professor.html](file://public/edit-professor.html#L21-L75)
- [public/new-professor.js](file://public/new-professor.js#L12-L25)
- [public/edit-professor.js](file://public/edit-professor.js#L48-L62)
- [src/middleware/auth.js](file://src/middleware/auth.js#L32-L48)

### Academic Hierarchy and Relationship Management
- Professors supervise students through the estagio table, linking to alunos and supervisores.
- The model exposes a method to fetch supervised students with student and supervisor details.
- Student records include estagiario associations, enabling cross-referencing between professors, supervisors, and institutions.

**Section sources**
- [src/models/professor.js](file://src/models/professor.js#L50-L68)
- [src/models/aluno.js](file://src/models/aluno.js#L74-L95)
- [src/models/instituicao.js](file://src/models/instituicao.js#L43-L62)