// public/auth-profile.js
import { isLoggedIn, getCurrentUser, requireLogin } from './auth-utils.js';

// Require login
requireLogin();

// Display user info
const user = getCurrentUser();

if (user) {
  document.getElementById('userName').textContent = user.nome;
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userId').textContent = user.id;
  
  const roleEl = document.getElementById('userRole');
  roleEl.textContent = user.role.toUpperCase();
  
  // Color code by role
  const roleColors = {
    admin: 'danger',
    supervisor: 'warning',
    docente: 'info',
    aluno: 'success'
  };
  roleEl.className = `badge bg-${roleColors[user.role] || 'secondary'}`;
} else {
  window.location.href = '/login.html';
}
