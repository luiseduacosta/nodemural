# 🔐 Authentication & Authorization Implementation Guide

## Overview
Your application now has JWT-based authentication and role-based access control (RBAC).

---

## 📋 What Was Implemented

### 1. **Environment Variables** ✅
- Credentials now stored in `.env` (not in code)
- Database config uses environment variables
- JWT_SECRET for signing tokens

**File:** [.env](.env)

### 2. **Database** ✅
- New `auth_users` table created with:
  - Email (unique)
  - Hashed password (using bcryptjs)
  - Roles: admin, supervisor, docente, aluno
  - Nome
  - Identificacao (a numer: registro from aluno, siape from docente ou cress from supervisor)
  - entidade_id (id from aluno, docente ou supervisor)
  - Soft delete (ativo field)

**Setup file:** [src/database/setupAuthUsers.js](src/database/setupAuthUsers.js)

### 3. **Authentication Model** ✅
- User registration with validation
- Password hashing with bcryptjs
- User lookup by email/ID

**File:** [src/models/user.js](src/models/user.js)

### 4. **Auth Controller** ✅
- `/auth/register` - Create new user
- `/auth/login` - Authenticate and get JWT token
- `/auth/profile` - Get authenticated user profile (protected)
- `/auth/users` - List all users (admin only)

**File:** [src/controllers/authController.js](src/controllers/authController.js)

### 5. **Auth Middleware** ✅
- `verifyToken` - Validates JWT token from Authorization header
- `checkRole` - Ensures user has required role
- `getCurrentUser` - Decodes token info

**File:** [src/middleware/auth.js](src/middleware/auth.js)

### 6. **Auth Routes** ✅
All authentication endpoints at `/auth` prefix

**File:** [src/routers/authRoutes.js](src/routers/authRoutes.js)

### 7. **Protected Routes Example** ✅
Updated `alunos` routes to show how to protect endpoints:
- Public: GET /alunos, GET /alunos/:id
- Protected: GET /alunos/:id/inscricoes
- Admin only: POST, PUT, DELETE

**File:** [src/routers/alunoRoutes.js](src/routers/alunoRoutes.js)

---

## 🚀 API Endpoints

### Public Endpoints

#### Register New User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "nome": "João Silva",
  "role": "aluno"  # optional, defaults to 'aluno'
}

Response:
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nome": "João Silva",
    "role": "aluno"
  }
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nome": "João Silva",
    "role": "aluno"
  }
}
```

#### Get Current User Info (from token)
```bash
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nome": "João Silva",
    "role": "aluno",
    "iat": 1769714078,
    "exp": 1770318878
  }
}
```

### Protected Endpoints

#### Get User Profile
```bash
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "user@example.com",
  "nome": "João Silva",
  "role": "aluno",
  "ativo": 1,
  "criado_em": "2026-01-29T10:00:00.000Z"
}
```

#### Get All Users (Admin Only)
```bash
GET /auth/users
Authorization: Bearer <admin_token>

Response: [array of users]
```

---

## 🔑 How to Use Tokens

### Get a Token
1. Register or login to get a JWT token
2. Store it in your frontend (localStorage, sessionStorage, etc.)

### Use Token in Requests
Include in the `Authorization` header with "Bearer " prefix:

```javascript
// JavaScript/Fetch Example
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

fetch('/api/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

```bash
# cURL Example
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:3333/auth/profile
```

---

## 🛡️ User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all endpoints |
| **supervisor** | Can manage estagiarios, view inscriptions |
| **docente** | Can manage alunos, atividades |
| **aluno** | Can view own data, view mural |

---

## 🔧 How to Protect Routes

### Example: Protecting a Route

**Before:**
```javascript
router.post('/', controller.create);
```

**After (Protected):**
```javascript
import { verifyToken, checkRole } from '../middleware/auth.js';

// Authentication required
router.post('/', verifyToken, controller.create);

// Role-based access (admin or docente only)
router.post('/', verifyToken, checkRole(['admin', 'docente']), controller.create);

// Admin only
router.delete('/:id', verifyToken, checkRole(['admin']), controller.delete);
```

---

## 📋 File Reference

| File | Purpose |
|------|---------|
| [src/models/user.js](src/models/user.js) | User model with password hashing |
| [src/controllers/authController.js](src/controllers/authController.js) | Auth business logic |
| [src/middleware/auth.js](src/middleware/auth.js) | JWT verification & role checking |
| [src/routers/authRoutes.js](src/routers/authRoutes.js) | Auth endpoints |
| [src/database/setupAuthUsers.js](src/database/setupAuthUsers.js) | Create auth_users table |
| [.env](.env) | Configuration (add to .gitignore) |

---

## ⚙️ Configuration

Edit [.env](.env) to change:
```env
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRY=7d
PORT=3333
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` in production!

---

## 🧪 Test Token (Expires in 7 days from 2026-01-29)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5vbWUiOiJBZG1pbmlzdHJhZG9yIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY5NzE0MDc4LCJleXAiOjE3NzAzMTg4Nzh9.TRmBmOVYhFKU2b2E8E228s3URaxm1pKPZnIVaHdbKCk
```

---

## 🚀 Next Steps

### 1. Update All Routes
Apply auth middleware to all your routes following the pattern in [src/routers/alunoRoutes.js](src/routers/alunoRoutes.js)

### 2. Frontend Integration
- Add login/register forms
- Store JWT in localStorage
- Include token in all API requests
- Handle token expiration

### 3. Additional Security
- Implement rate limiting
- Add CORS configuration
- Add input validation
- Setup HTTPS in production

### 4. Testing
Test endpoints with:
- Postman
- cURL
- Your frontend application

---

## ⚠️ Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Validation error | Missing/invalid fields |
| 401 | Token não fornecido | No authorization header |
| 401 | Token inválido | Invalid or malformed token |
| 401 | Token expirado | Token has expired |
| 401 | Email ou senha incorretos | Wrong credentials |
| 403 | Acesso negado | Insufficient permissions |
| 500 | Server error | Database or server issue |

---

## 📚 Resources

- [JWT.io](https://jwt.io) - JWT debugger
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html) - How middleware works

---

**✅ Authentication system is ready!** 🎉
