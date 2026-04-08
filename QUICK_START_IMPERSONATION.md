# 🎭 Impersonation Feature - Quick Start Guide

## ✅ Feature Successfully Installed!

The impersonation feature has been fully integrated into your NodeMural application.

---

## 🚀 How to Test It

### 1. Start Your Server
```bash
npm start
# or
node src/server.js
```

### 2. Login as Admin
- Go to: `http://localhost:3333/login.html`
- Login with your admin credentials

### 3. Test the Feature
- Go to: `http://localhost:3333/test-impersonation.html`
- You'll see a list of all users
- Click "👤 Impersonar" next to any user (except admins)
- Confirm the action
- The page will reload with a **RED BANNER** at the top

### 4. During Impersonation
- You'll see the system exactly as that user sees it
- The red banner shows: "MODO IMPERSONAÇÃO - Você está vendo o sistema como: [User Name]"
- You can navigate through all pages
- The banner stays visible on every page

### 5. Stop Impersonation
- Click the "← Voltar para Admin" button in the banner
- Confirm the action
- You'll be returned to your admin account

---

## 📁 Files Created/Modified

### Backend Files:
- ✅ `src/models/impersonation.js` - Database operations
- ✅ `src/controllers/authController.js` - API endpoints (updated)
- ✅ `src/routers/authRoutes.js` - Routes (updated)
- ✅ `src/database/create_impersonations_table.sql` - SQL schema
- ✅ `src/database/setupImpersonationsTable.js` - Setup script

### Frontend Files:
- ✅ `public/impersonation-utils.js` - Frontend utilities
- ✅ `public/menu.js` - Banner display (updated)
- ✅ `public/test-impersonation.html` - Test page
- ✅ `public/test-impersonation.js` - Test page logic

### Documentation:
- ✅ `IMPERSONATION_GUIDE.md` - Complete documentation
- ✅ `QUICK_START_IMPERSONATION.md` - This file

---

## 🔒 Security Features

✅ Only admins can impersonate
✅ Cannot impersonate other admins
✅ Cannot impersonate yourself
✅ All sessions are logged
✅ Visual indicator always visible
✅ One active session per admin

---

## 🎯 How to Add Impersonation to Other Pages

### Example: Add to User Management Page

```javascript
// Import the function
import { getImpersonationButton } from './impersonation-utils.js';

// In your render function
const currentUser = getCurrentUser();

users.forEach(user => {
    // Add this button to your user list/cards
    const button = getImpersonationButton(currentUser, user);
    // button will be empty string if user is not admin or target is admin
});
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/admin/impersonate/:userId` | Start impersonation |
| POST | `/auth/admin/stop-impersonate` | Stop impersonation |
| GET | `/auth/admin/impersonations/history` | Get your history |
| GET | `/auth/admin/impersonations/active` | Get active sessions |

---

## 🔍 View Impersonation History

The test page shows your last 10 impersonation sessions with:
- User name and role
- When it started
- Duration
- Status (Active/Ended)

You can also query the database directly:
```sql
SELECT 
    i.*,
    admin.nome as admin_name,
    imp_user.nome as impersonated_name,
    TIMESTAMPDIFF(MINUTE, i.started_at, COALESCE(i.ended_at, NOW())) as duration_minutes
FROM impersonations i
JOIN auth_users admin ON i.admin_id = admin.id
JOIN auth_users imp_user ON i.impersonated_user_id = imp_user.id
ORDER BY i.started_at DESC
LIMIT 50;
```

---

## ❓ Troubleshooting

### Banner Not Showing?
1. Make sure you're logged in as admin
2. Check browser console for errors
3. Verify `menu.js` is loaded on the page

### Getting Permission Errors?
1. Confirm your role is 'admin' in auth_users table
2. Make sure you're not trying to impersonate another admin
3. Check that your token is valid

### Can't Stop Impersonation?
1. Try clicking the banner button again
2. Check browser console for errors
3. Clear localStorage and login again as a last resort

---

## 🎉 You're Ready!

The impersonation feature is now fully operational. Enjoy providing better support to your users!

For detailed documentation, see: `IMPERSONATION_GUIDE.md`
