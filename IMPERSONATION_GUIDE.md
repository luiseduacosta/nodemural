# Impersonation Feature Documentation

## Overview
The impersonation feature allows administrators to temporarily act as another user to see exactly what they see, troubleshoot issues, and provide better support.

## Setup

### 1. Create the Database Table

Run the setup script:
```bash
node src/database/setupImpersonationsTable.js
```

Or manually execute the SQL:
```bash
mysql -u your_user -p your_database < src/database/create_impersonations_table.sql
```

### 2. Feature is Ready!

The impersonation feature is now integrated into your application.

---

## How It Works

### For Administrators

#### Starting Impersonation

**Option 1: From User Management Page**
1. Navigate to the user list
2. Find the user you want to impersonate
3. Click the "👤 Impersonar" button
4. Confirm the action
5. You'll be redirected with a warning banner at the top

**Option 2: Programmatically**
```javascript
import { impersonateUser } from './impersonation-utils.js';

// Impersonate user with ID 123
await impersonateUser(123);
```

#### During Impersonation

- A **red warning banner** appears at the top of every page
- Banner shows: "MODO IMPERSONAÇÃO - Você está vendo o sistema como: [User Name] ([role])"
- You see exactly what the user sees
- All permissions and restrictions apply as if you were that user
- A "← Voltar para Admin" button is always visible

#### Stopping Impersonation

**Option 1: Click the Banner Button**
- Click "← Voltar para Admin" in the warning banner
- Confirm the action
- You'll be returned to your admin account

**Option 2: Programmatically**
```javascript
import { stopImpersonation } from './impersonation-utils.js';

await stopImpersonation();
```

---

## API Endpoints

### Start Impersonation
```http
POST /auth/admin/impersonate/:userId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Agora impersonando como User Name",
  "token": "<new_token_for_impersonated_user>",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "nome": "User Name",
    "role": "aluno",
    "entidade_id": 45,
    "isImpersonating": true,
    "originalAdminId": 1
  }
}
```

### Stop Impersonation
```http
POST /auth/admin/stop-impersonate
Authorization: Bearer <impersonation_token>
```

**Response:**
```json
{
  "message": "Retornado à conta de administrador",
  "token": "<new_admin_token>",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "nome": "Admin Name",
    "role": "admin",
    "entidade_id": null
  }
}
```

### Get Impersonation History
```http
GET /auth/admin/impersonations/history?limit=50
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "admin_id": 1,
    "impersonated_user_id": 123,
    "started_at": "2024-01-15T10:30:00.000Z",
    "ended_at": "2024-01-15T10:45:00.000Z",
    "is_active": false,
    "admin_email": "admin@example.com",
    "admin_name": "Admin Name",
    "impersonated_email": "user@example.com",
    "impersonated_name": "User Name",
    "impersonated_role": "aluno",
    "duration_minutes": 15
  }
]
```

### Get Active Impersonations
```http
GET /auth/admin/impersonations/active
Authorization: Bearer <admin_token>
```

---

## Security Features

✅ **Admin Only**: Only users with `role: 'admin'` can impersonate
✅ **Cannot Impersonate Admins**: Prevents privilege escalation
✅ **Cannot Impersonate Self**: Admins cannot impersonate themselves
✅ **Audit Trail**: All impersonation sessions are logged with timestamps
✅ **Visual Indicator**: Red banner always visible during impersonation
✅ **Session Tracking**: Only one active impersonation per admin at a time
✅ **Automatic Session End**: Starting a new impersonation ends the previous one

---

## Database Schema

### impersonations Table
```sql
CREATE TABLE impersonations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    impersonated_user_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    FOREIGN KEY (impersonated_user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    INDEX idx_admin_active (admin_id, is_active),
    INDEX idx_impersonated_active (impersonated_user_id, is_active)
);
```

---

## Usage Examples

### Add Impersonation Button to User List

In your user management page (e.g., `auth-profile.js`):

```javascript
import { getImpersonationButton } from './impersonation-utils.js';

function renderUserList(users) {
    const currentUser = getCurrentUser();
    
    return users.map(user => `
        <div class="user-card">
            <span>${user.nome}</span>
            <span>${user.email}</span>
            <span>${user.role}</span>
            ${getImpersonationButton(currentUser, user)}
        </div>
    `).join('');
}
```

### Check if User is Impersonating

```javascript
const user = getCurrentUser();

if (user && user.isImpersonating) {
    console.log('Admin is impersonating this user');
    console.log('Original admin ID:', user.originalAdminId);
}
```

---

## Best Practices

1. **Use for Support**: Impersonate to understand user issues and provide better support
2. **Keep Sessions Short**: Don't leave impersonation sessions active longer than needed
3. **Document Issues**: If you find problems while impersonating, document them
4. **Review History**: Regularly review impersonation history for accountability
5. **Train Admins**: Ensure all admins understand how to use this feature responsibly

---

## Troubleshooting

### Banner Not Showing
- Make sure `menu.js` is loaded on the page
- Check browser console for errors
- Verify user object has `isImpersonating: true`

### Cannot Stop Impersonation
- Check browser console for errors
- Verify the token is valid
- Try manually clearing localStorage and logging in again

### Permission Errors
- Ensure the user has `role: 'admin'`
- Check that the token is being passed correctly
- Verify the admin is not trying to impersonate another admin

---

## Files Modified/Created

### Backend
- ✅ `src/models/impersonation.js` - Impersonation data model
- ✅ `src/controllers/authController.js` - Added impersonation endpoints
- ✅ `src/routers/authRoutes.js` - Added impersonation routes
- ✅ `src/database/create_impersonations_table.sql` - Database schema
- ✅ `src/database/setupImpersonationsTable.js` - Setup script

### Frontend
- ✅ `public/impersonation-utils.js` - Frontend utilities
- ✅ `public/menu.js` - Added banner display

---

## Support

For issues or questions about the impersonation feature, check:
1. Browser console for frontend errors
2. Server logs for backend errors
3. Database impersonations table for session history
