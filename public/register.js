// public/register.js
const form = document.getElementById('registerForm');
const msg = document.getElementById('message');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password, passwordConfirm })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
    msg.style.color = 'green';
    msg.textContent = 'Registrado com sucesso. Faça login.';
    setTimeout(() => window.location.href = '/login.html', 1000);
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
});