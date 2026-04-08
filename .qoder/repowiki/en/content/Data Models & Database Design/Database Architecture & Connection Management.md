# Database Architecture & Connection Management

<cite>
**Referenced Files in This Document**
- [db.js](file://src/database/db.js)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js)
- [user.js](file://src/models/user.js)
- [aluno.js](file://src/models/aluno.js)
- [authController.js](file://src/controllers/authController.js)
- [authRoutes.js](file://src/routers/authRoutes.js)
- [auth.js](file://src/middleware/auth.js)
- [server.js](file://src/server.js)
- [check_tables_temp.js](file://test/check_tables_temp.js)
- [create_instituicao_table.js](file://test/create_instituicao_table.js)
- [check_questionarios.js](file://test/check_questionarios.js)
- [check_instituicao_data.js](file://test/check_instituicao_data.js)
- [alter_instituicao_table.js](file://test/alter_instituicao_table.js)
- [package.json](file://package.json)
- [README.md](file://README.md)
</cite>

## Update Summary
**Changes Made**
- Updated database initialization section to reflect replacement of old setup system with comprehensive setupFullDatabase.js
- Added documentation for the new unified database setup script that creates all tables and initial data
- Updated architecture diagrams to show the new comprehensive setup approach
- Revised troubleshooting section to reference the new setup script
- Enhanced database initialization and schema management section with comprehensive setup details

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
This document describes the database architecture and connection management for NodeMural, focusing on the MariaDB connection pool configuration, connection lifecycle management, database abstraction patterns, and operational practices. It covers connection pooling strategies, timeout configurations, error handling mechanisms, database initialization and schema management, migration strategies, security considerations, performance optimization, monitoring and health checks, transaction management, and backup and disaster recovery procedures.

## Project Structure
The database layer is organized around a shared connection pool module and model abstractions that encapsulate SQL operations. A comprehensive initialization script creates all required tables and initial data structures, while controllers and middleware orchestrate authentication and authorization flows. Test scripts demonstrate schema inspection and migration patterns.

```mermaid
graph TB
subgraph "Application Layer"
SRV["Express Server<br/>src/server.js"]
RT_AUTH["Auth Routes<br/>src/routers/authRoutes.js"]
CTRL_AUTH["Auth Controller<br/>src/controllers/authController.js"]
MW_AUTH["Auth Middleware<br/>src/middleware/auth.js"]
end
subgraph "Data Access Layer"
POOL["MariaDB Pool<br/>src/database/db.js"]
MODEL_USER["User Model<br/>src/models/user.js"]
MODEL_ALUNO["Aluno Model<br/>src/models/aluno.js"]
end
subgraph "Comprehensive Initialization"
FULL_SETUP["Full Database Setup<br/>src/database/setupFullDatabase.js"]
AUTH_SETUP["Auth Users Setup<br/>src/database/setupAuthUsers.js"]
TEST_INSPECT["Inspect Tables<br/>test/check_tables_temp.js"]
TEST_CREATE["Create Table<br/>test/create_instituicao_table.js"]
TEST_ALTER["Alter Table<br/>test/alter_instituicao_table.js"]
TEST_Q["Check Columns<br/>test/check_questionarios.js"]
TEST_COUNT["Count Rows<br/>test/check_instituicao_data.js"]
end
SRV --> RT_AUTH --> CTRL_AUTH --> MODEL_USER
SRV --> RT_AUTH
SRV --> MW_AUTH
MODEL_USER --> POOL
MODEL_ALUNO --> POOL
FULL_SETUP --> POOL
AUTH_SETUP --> POOL
TEST_INSPECT --> POOL
TEST_CREATE --> POOL
TEST_ALTER --> POOL
TEST_Q --> POOL
TEST_COUNT --> POOL
```

**Diagram sources**
- [server.js](file://src/server.js#L1-L62)
- [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- [authController.js](file://src/controllers/authController.js#L1-L157)
- [auth.js](file://src/middleware/auth.js#L1-L137)
- [db.js](file://src/database/db.js#L1-L15)
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)
- [check_tables_temp.js](file://test/check_tables_temp.js#L1-L40)
- [create_instituicao_table.js](file://test/create_instituicao_table.js#L1-L41)
- [alter_instituicao_table.js](file://test/alter_instituicao_table.js#L1-L39)
- [check_questionarios.js](file://test/check_questionarios.js#L1-L28)
- [check_instituicao_data.js](file://test/check_instituicao_data.js#L1-L25)

**Section sources**
- [server.js](file://src/server.js#L1-L62)
- [db.js](file://src/database/db.js#L1-L15)
- [README.md](file://README.md#L1-L61)

## Core Components
- MariaDB connection pool configured via environment variables and exported for reuse across models.
- Models encapsulate CRUD operations against MariaDB tables using the shared pool.
- **Updated**: Comprehensive initialization script creates all required tables and initial data structures in a single operation.
- Controllers and middleware handle authentication and authorization flows, interacting with models.

Key implementation references:
- Pool creation and configuration: [db.js](file://src/database/db.js#L5-L13)
- User model operations: [user.js](file://src/models/user.js#L18-L34)
- Aluno model operations: [aluno.js](file://src/models/aluno.js#L15-L20)
- **Updated**: Full database setup script: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- Legacy auth setup script: [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)
- Server bootstrap and routes: [server.js](file://src/server.js#L31-L62)

**Section sources**
- [db.js](file://src/database/db.js#L1-L15)
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)
- [server.js](file://src/server.js#L1-L62)

## Architecture Overview
The system follows a layered architecture:
- Presentation and routing handled by Express.
- Controllers coordinate requests and responses.
- Models abstract database operations using a shared MariaDB pool.
- **Updated**: Comprehensive initialization script manages complete schema creation and initial data population.
- Middleware enforces authentication and authorization.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Server as "Express Server<br/>server.js"
participant Router as "Auth Router<br/>authRoutes.js"
participant Controller as "Auth Controller<br/>authController.js"
participant Model as "User Model<br/>user.js"
participant Pool as "MariaDB Pool<br/>db.js"
Client->>Server : "POST /auth/login"
Server->>Router : "Route request"
Router->>Controller : "Invoke login()"
Controller->>Model : "findByEmail(email)"
Model->>Pool : "pool.query(SELECT ...)"
Pool-->>Model : "User row"
Model-->>Controller : "User object"
Controller->>Controller : "verifyPassword()"
Controller-->>Client : "{ token, user }"
```

**Diagram sources**
- [server.js](file://src/server.js#L31-L62)
- [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- [authController.js](file://src/controllers/authController.js#L76-L127)
- [user.js](file://src/models/user.js#L36-L46)
- [db.js](file://src/database/db.js#L1-L15)

## Detailed Component Analysis

### MariaDB Connection Pool
- Configuration is centralized in a single pool module, enabling consistent connection behavior across the application.
- Environment-driven configuration supports host, user, password, database name, and pool limits.
- Queue behavior is configured to wait for connections rather than rejecting requests immediately.

Operational characteristics:
- Connection lifecycle: Connections are acquired via getConnection() and released via release() or end() depending on the operation.
- **Updated**: Comprehensive setup script acquires a connection, executes all DDL statements for multiple tables, inserts initial configuration data, and then releases and terminates the pool to avoid lingering connections.

References:
- Pool creation and options: [db.js](file://src/database/db.js#L5-L13)
- **Updated**: Full setup pattern: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L4-L279)
- Legacy setup pattern: [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L6-L35)

```mermaid
flowchart TD
Start(["Process Start"]) --> LoadEnv["Load environment variables"]
LoadEnv --> CreatePool["Create MariaDB Pool<br/>waitForConnections=true,<br/>queueLimit=0"]
CreatePool --> UsePool["Acquire connection via getConnection()"]
UsePool --> ExecuteDDL["Execute Multiple DDL Statements<br/>for all application tables"]
ExecuteDDL --> InsertInitialData["Insert initial configuration data"]
InsertInitialData --> ReleaseConn["Release connection via release()"]
ReleaseConn --> EndPool["Terminate pool via end()"]
EndPool --> Complete(["Setup Complete"])
```

**Diagram sources**
- [db.js](file://src/database/db.js#L5-L13)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L4-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L6-L35)

**Section sources**
- [db.js](file://src/database/db.js#L1-L15)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)

### Database Abstraction Patterns
- Models encapsulate SQL operations, exposing asynchronous methods for create, read, update, and delete.
- Queries leverage parameterized statements to prevent SQL injection.
- Soft-delete and role-based filtering are applied in queries where appropriate.

References:
- User model create/find/update/deactivate: [user.js](file://src/models/user.js#L7-L142)
- Aluno model CRUD and joins: [aluno.js](file://src/models/aluno.js#L6-L143)

```mermaid
classDiagram
class UserModel {
+create(email, password, nome, identificacao, role, entidade_id)
+findByEmail(email)
+findById(id)
+findByIdWithEntidade(id)
+findByEntidadeId(entidade_id)
+findAll()
+deactivate(id)
+updateRole(id, role)
}
class AlunoModel {
+verifyRegistro(registro)
+create(...)
+findByRegistro(registro)
+findAll(req)
+findAlunoById(id)
+findById(id)
+findEstagiariosByAlunoId(id)
+findInscricoesByAlunoId(id)
+update(...)
+delete(id)
}
class Pool {
+getConnection()
+query(sql, params)
+end()
}
UserModel --> Pool : "uses"
AlunoModel --> Pool : "uses"
```

**Diagram sources**
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)
- [db.js](file://src/database/db.js#L1-L15)

**Section sources**
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)

### Authentication and Authorization Flow
- Routes define public and protected endpoints.
- Middleware verifies JWT tokens and enforces role-based access.
- Controllers interact with models to authenticate users and retrieve profiles.

References:
- Auth routes: [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- Auth controller: [authController.js](file://src/controllers/authController.js#L6-L156)
- Auth middleware: [auth.js](file://src/middleware/auth.js#L6-L136)

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Auth Router<br/>authRoutes.js"
participant MW as "Auth Middleware<br/>auth.js"
participant Controller as "Auth Controller<br/>authController.js"
participant Model as "User Model<br/>user.js"
Client->>Router : "GET /auth/profile"
Router->>MW : "verifyToken"
MW-->>Router : "Decoded token"
Router->>Controller : "getProfile()"
Controller->>Model : "findById(userId)"
Model-->>Controller : "User object"
Controller-->>Client : "User profile"
```

**Diagram sources**
- [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- [auth.js](file://src/middleware/auth.js#L6-L29)
- [authController.js](file://src/controllers/authController.js#L129-L145)
- [user.js](file://src/models/user.js#L49-L60)

**Section sources**
- [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- [authController.js](file://src/controllers/authController.js#L1-L157)
- [auth.js](file://src/middleware/auth.js#L1-L137)

### Database Initialization and Schema Management
- **Updated**: Comprehensive initialization script creates all 17 application tables in a single operation, including auth_users, alunos, professores, supervisores, instituicoes, areas, mural_estagios, inscricoes, estagiarios, turma_estagios, folhadeatividades, questionarios, questoes, respostas, visitas, configuracoes, and inst_super.
- **Updated**: The script automatically inserts initial configuration data if the configuracoes table is empty.
- Legacy initialization scripts still exist but are superseded by the comprehensive setup approach.
- Test scripts demonstrate schema inspection, table creation, column alterations, and row counting.

**Updated** The new comprehensive setup script provides a complete database initialization solution that replaces the previous fragmented approach.

References:
- **Updated**: Full database setup: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L10-L257)
- **Updated**: Initial configuration insertion: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L261-L266)
- Legacy auth users setup: [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L6-L35)
- Schema inspection: [check_tables_temp.js](file://test/check_tables_temp.js#L11-L37)
- Table creation: [create_instituicao_table.js](file://test/create_instituicao_table.js#L11-L38)
- Column alteration: [alter_instituicao_table.js](file://test/alter_instituicao_table.js#L11-L37)
- Column metadata: [check_questionarios.js](file://test/check_questionarios.js#L12-L26)
- Row count: [check_instituicao_data.js](file://test/check_instituicao_data.js#L11-L23)

```mermaid
flowchart TD
InitStart(["Run Comprehensive Setup Script"]) --> Connect["pool.getConnection()"]
Connect --> ExecDDL["Execute CREATE TABLE for all 17 application tables"]
ExecDDL --> InsertConfig["Insert initial configuration data"]
InsertConfig --> LogSuccess["Log success message"]
LogSuccess --> Release["conn.release()"]
Release --> EndPool["pool.end()"]
EndPool --> InitEnd(["Complete Setup"])
```

**Diagram sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L4-L279)
- [db.js](file://src/database/db.js#L1-L15)

**Section sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)
- [check_tables_temp.js](file://test/check_tables_temp.js#L1-L40)
- [create_instituicao_table.js](file://test/create_instituicao_table.js#L1-L41)
- [alter_instituicao_table.js](file://test/alter_instituicao_table.js#L1-L39)
- [check_questionarios.js](file://test/check_questionarios.js#L1-L28)
- [check_instituicao_data.js](file://test/check_instituicao_data.js#L1-L25)

### Migration Strategies
- **Updated**: The comprehensive setup script handles all table creation and initial data population in a single operation, eliminating the need for fragmented migration scripts.
- **Updated**: For future schema changes, the setup script can be extended to include conditional migrations that check for existing table structures and apply necessary alterations.
- Legacy DDL change scripts still exist for testing and development scenarios.
- Schema inspection scripts verify presence and structure of tables and columns.

**Updated** The new approach consolidates all database initialization into a single, comprehensive script that handles both table creation and initial data population.

References:
- **Updated**: Comprehensive table creation: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L10-L257)
- **Updated**: Initial configuration handling: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L261-L266)
- Legacy alter table operations: [alter_instituicao_table.js](file://test/alter_instituicao_table.js#L17-L28)
- Inspect tables/columns: [check_tables_temp.js](file://test/check_tables_temp.js#L14-L29), [check_questionarios.js](file://test/check_questionarios.js#L15-L18)

**Section sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [alter_instituicao_table.js](file://test/alter_instituicao_table.js#L1-L39)
- [check_tables_temp.js](file://test/check_tables_temp.js#L1-L40)
- [check_questionarios.js](file://test/check_questionarios.js#L1-L28)

### Connection Security Considerations
- Credentials are loaded from environment variables and injected into the pool configuration.
- JWT secret and expiry are environment-controlled for authentication.
- **Updated**: The comprehensive setup script runs with the same security considerations as the legacy setup scripts, using environment variables for database credentials.
- No explicit TLS/SSL configuration is present in the pool module; production deployments should configure SSL/TLS according to MariaDB client requirements.

References:
- Pool credentials: [db.js](file://src/database/db.js#L5-L9)
- **Updated**: Setup script security: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L2-L2)
- JWT configuration: [authController.js](file://src/controllers/authController.js#L99-L109), [auth.js](file://src/middleware/auth.js#L14-L16)

**Section sources**
- [db.js](file://src/database/db.js#L1-L15)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [authController.js](file://src/controllers/authController.js#L1-L157)
- [auth.js](file://src/middleware/auth.js#L1-L137)

### Transaction Management and Consistency Guarantees
- Current models perform individual statements without explicit transaction blocks.
- **Updated**: The comprehensive setup script executes all table creation statements sequentially within a single connection context, providing atomicity for the entire initialization process.
- For multi-statement consistency in application operations, wrap operations in transaction boundaries using conn.beginTransaction(), conn.commit(), and conn.rollback().

**Updated** The setup script ensures atomic database initialization by executing all DDL statements within a single connection context.

References:
- **Updated**: Setup script connection management: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L4-L279)
- Connection acquisition/release pattern: [user.js](file://src/models/user.js#L18-L21), [aluno.js](file://src/models/aluno.js#L15-L19)

**Section sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)

### Monitoring, Health Checks, and Failover
- No explicit health check endpoint or pool metrics are implemented in the current codebase.
- **Updated**: The comprehensive setup script provides console logging for successful table creation and initial configuration insertion, aiding in monitoring and debugging.
- Recommendations include adding a GET /health endpoint that pings the database and exposes pool statistics.

**Updated** The setup script includes comprehensive logging to aid in monitoring and debugging the database initialization process.

References:
- **Updated**: Setup script logging: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L8-L265)
- Server bootstrap and routes: [server.js](file://src/server.js#L31-L62)

**Section sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [server.js](file://src/server.js#L1-L62)

## Dependency Analysis
The application depends on the MariaDB driver and dotenv for configuration. Models depend on the shared pool module. **Updated**: The comprehensive setup script demonstrates direct pool usage for complete schema operations, while legacy scripts show the previous fragmented approach.

**Updated** The dependency structure now centers around a single comprehensive setup script that handles all database initialization needs.

```mermaid
graph LR
PJSON["package.json"] --> MARIADB["mariadb"]
PJSON --> DOTENV["dotenv"]
SERVER["server.js"] --> ROUTES["authRoutes.js"]
ROUTES --> CTRL["authController.js"]
CTRL --> MODEL_USER["user.js"]
MODEL_USER --> POOL["db.js"]
MODEL_ALUNO["aluno.js"] --> POOL
FULL_SETUP["setupFullDatabase.js"] --> POOL
AUTH_SETUP["setupAuthUsers.js"] --> POOL
TESTS["test/*"] --> POOL
```

**Diagram sources**
- [package.json](file://package.json#L22-L30)
- [server.js](file://src/server.js#L1-L62)
- [authRoutes.js](file://src/routers/authRoutes.js#L1-L20)
- [authController.js](file://src/controllers/authController.js#L1-L157)
- [user.js](file://src/models/user.js#L1-L146)
- [aluno.js](file://src/models/aluno.js#L1-L146)
- [db.js](file://src/database/db.js#L1-L15)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)

**Section sources**
- [package.json](file://package.json#L1-L33)
- [server.js](file://src/server.js#L1-L62)

## Performance Considerations
- Connection pooling: Use waitForConnections and queueLimit to control queue behavior; tune DB_POOL_LIMIT based on workload.
- Query patterns: Prefer parameterized queries and limit result sets with pagination where applicable.
- Connection reuse: Acquire connections only when needed and release them promptly; avoid long-lived connections in request handlers.
- **Updated**: The comprehensive setup script optimizes performance by using a single connection for all table creation operations, reducing connection overhead.
- Indexing: Ensure appropriate indexes on frequently filtered columns (e.g., email, role, identifiers).
- Batch operations: Group related updates to reduce round-trips.

**Updated** The new setup script improves performance by minimizing connection overhead through sequential table creation within a single connection context.

## Troubleshooting Guide
Common issues and resolutions:
- Connection errors: Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_POOL_LIMIT in the environment.
- Authentication failures: Confirm JWT_SECRET and JWT_EXPIRY are set appropriately.
- **Updated**: Setup failures: Use the comprehensive setup script to initialize the complete database structure, which includes logging for successful table creation and initial configuration insertion.
- **Updated**: Legacy setup scripts: The previous setupUsers.js and setupAuthUsers.js scripts are still available but are superseded by the comprehensive approach.
- Schema inconsistencies: Use the comprehensive setup script to recreate the complete database structure if needed.
- Resource leaks: Ensure every acquired connection is released; the setup scripts demonstrate proper release and pool termination.

**Updated** The troubleshooting guide now emphasizes the comprehensive setup script as the primary solution for database initialization issues.

References:
- Environment variables and defaults: [README.md](file://README.md#L18-L28)
- Pool configuration: [db.js](file://src/database/db.js#L5-L13)
- **Updated**: Comprehensive setup script: [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- Legacy setup patterns: [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L6-L35)
- Schema inspection: [check_tables_temp.js](file://test/check_tables_temp.js#L11-L37)

**Section sources**
- [README.md](file://README.md#L1-L61)
- [db.js](file://src/database/db.js#L1-L15)
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L1-L279)
- [setupAuthUsers.js](file://src/database/setupAuthUsers.js#L1-L38)
- [check_tables_temp.js](file://test/check_tables_temp.js#L1-L40)

## Conclusion
NodeMural's database layer centers on a shared MariaDB connection pool and model abstractions that encapsulate SQL operations. **Updated**: The comprehensive setupFullDatabase.js script provides a complete database initialization solution that creates all necessary tables, indexes, and initial data structures in a single operation, replacing the previous fragmented approach. While the current implementation focuses on simplicity and modularity, production deployments should incorporate explicit TLS configuration, transaction boundaries for multi-step operations, health checks, and performance tuning aligned with workload characteristics.

**Updated** The new comprehensive setup script significantly simplifies database initialization and reduces the complexity of managing multiple separate setup scripts.

## Appendices

### Environment Variables Reference
- DB_HOST: MariaDB host address
- DB_USER: Database user
- DB_PASSWORD: Database password
- DB_NAME: Target database
- DB_POOL_LIMIT: Maximum pool size
- JWT_SECRET: Secret for signing JWT tokens
- JWT_EXPIRY: Token expiration period
- PORT: Server listening port

References:
- Defaults and usage: [README.md](file://README.md#L18-L28), [db.js](file://src/database/db.js#L5-L12), [authController.js](file://src/controllers/authController.js#L99-L109), [auth.js](file://src/middleware/auth.js#L14-L16)

**Section sources**
- [README.md](file://README.md#L1-L61)
- [db.js](file://src/database/db.js#L1-L15)
- [authController.js](file://src/controllers/authController.js#L1-L157)
- [auth.js](file://src/middleware/auth.js#L1-L137)

### Comprehensive Database Schema Overview
**Updated** The new setupFullDatabase.js script creates the following 17 application tables:

1. **auth_users** - System users with roles (admin, supervisor, professor, aluno)
2. **alunos** - University students with personal and academic information
3. **professores** - University professors with professional details
4. **supervisores** - External supervisors for internships
5. **instituicoes** - Host institutions for internships
6. **areas** - Institutional areas/fields of study
7. **mural_estagios** - Internship opportunities board
8. **inscricoes** - Student internship registrations
9. **estagiarios** - Students assigned to specific internships
10. **turma_estagios** - Student groups by area and period
11. **folhadeatividades** - Daily activity tracking for interns
12. **questionarios** - Evaluation questionnaires
13. **questoes** - Individual questionnaire questions
14. **respostas** - Supervisor evaluations of students
15. **visitas** - Institution visit records
16. **configuracoes** - System configuration settings
17. **inst_super** - Many-to-many relationship between supervisors and institutions

**Updated** This comprehensive schema provides complete coverage of the internship management system requirements in a single initialization operation.

**Section sources**
- [setupFullDatabase.js](file://src/database/setupFullDatabase.js#L10-L257)