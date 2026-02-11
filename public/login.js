// src/public/login.js
import { isLoggedIn, getCurrentUser } from './auth-utils.js';
import { authenticatedFetch } from './auth-utils.js';

// Redirect helper function
async function redirectUser(user, params) {
  let redirect = '';

  // console.log(user);

  // check if the entidade_id has a real value and if it exists in the tables: alunos, docentes, supervisors
  if (user.role !== 'admin' && (user.entidade_id && user.entidade_id !== 0)) {
    // Redirect to view entity page based on role
    if (user.role === 'aluno') {
      const response = await authenticatedFetch(`/alunos/${user.entidade_id}`);
      if (!response.ok) {
        redirect = '/new-aluno.html';
      } else {
        redirect = `/view-aluno.html?id=${user.entidade_id}`;
      }
    } else if (user.role === 'docente') {
      const response = await authenticatedFetch(`/docentes/${user.entidade_id}`);
      if (!response.ok) {
        redirect = '/new-docente.html';
      } else {
        redirect = `/view-docente.html?id=${user.entidade_id}`;
      }
    } else if (user.role === 'supervisor') {
      const response = await authenticatedFetch(`/supervisores/${user.entidade_id}`);
      if (!response.ok) {
        redirect = '/new-supervisor.html';
      } else {
        redirect = `/view-supervisor.html?id=${user.entidade_id}`;
      }
    }
    window.location.href = redirect;
    return;
  }
}

// If already logged in, redirect to appropriate page
if (isLoggedIn()) {
  const user = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  await redirectUser(user, params);
}

const form = document.getElementById('loginForm');
const msg = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no login');

    // store token and user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    msg.style.color = 'green';
    msg.textContent = 'Login realizado. Redirecionando...';

    // Check for redirect parameter
    const params = new URLSearchParams(window.location.search);

    setTimeout(() => redirectUser(data.user, params), 800);
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
});