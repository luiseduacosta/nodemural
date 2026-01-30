// public/login.js
import { isLoggedIn } from './auth-utils.js';

// If already logged in, redirect to home
if (isLoggedIn()) {
  window.location.href = '/';
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
    const redirect = params.get('redirect') || '/';
    
    setTimeout(() => window.location.href = redirect, 800);
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
});