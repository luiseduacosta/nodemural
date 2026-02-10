// public/login.js
import { isLoggedIn, getCurrentUser } from './auth-utils.js';

// Redirect helper function
function redirectUser(user, params) {
  let redirect = '';

  console.log(user);

  // Check entidade_id consistency for non-admin users
  if (user.role !== 'admin' && !user.entidade_id) {
    // Redirect to create entity page based on role
    if (user.role === 'aluno') {
      redirect = '/new-aluno.html';
    } else if (user.role === 'docente') {
      redirect = '/new-docente.html';
    } else if (user.role === 'supervisor') {
      redirect = '/new-supervisor.html';
    }
    window.location.href = redirect;
    return;
  }

  if (user.role === 'admin') {
    redirect = params.get('redirect') || '/mural.html';
  } else if (user.role === 'aluno') {
    redirect = params.get('redirect') || `/view-aluno.html?id=${user.entidade_id}`;
  } else if (user.role === 'docente') {
    redirect = params.get('redirect') || `/view-docente.html?id=${user.entidade_id}`;
  } else if (user.role === 'supervisor') {
    redirect = params.get('redirect') || `/view-supervisor.html?id=${user.entidade_id}`;
  } else {
    redirect = params.get('redirect') || '/login.html';
  }
  window.location.href = redirect;
}

// If already logged in, redirect to appropriate page
if (isLoggedIn()) {
  const user = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  redirectUser(user, params);
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
    console.log(data);
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