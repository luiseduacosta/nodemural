// public/register.js
const form = document.getElementById('registerForm');
const msg = document.getElementById('message');

// Se role for aluno, identificacao deve ser DRE
// Se role for docente, identificacao deve ser SIAPE
// Se role for supervisor, identificacao deve ser CRESS
const roleSelect = document.getElementById('role');
const identificacaoInput = document.getElementById('identificacao');

roleSelect.addEventListener('change', () => {
  if (roleSelect.value === 'aluno') {
    identificacaoInput.placeholder = 'DRE';
  } else if (roleSelect.value === 'docente') {
    identificacaoInput.placeholder = 'SIAPE';
  } else if (roleSelect.value === 'supervisor') {
    identificacaoInput.placeholder = 'CRESS';
  }
});

identificacaoInput.addEventListener('change', () => {
  console.log("role: " + roleSelect.value + " identificacao: " + identificacaoInput.value);
  if (roleSelect.value === 'aluno') {
    checkAluno(identificacaoInput.value);
  } else if (roleSelect.value === 'docente') {
    checkDocente(identificacaoInput.value);
  } else if (roleSelect.value === 'supervisor') {
    checkSupervisor(identificacaoInput.value);
  }
});

// Verificar se o aluno tem um registro
async function checkAluno(identificacao) {
  try {
    const res = await fetch('/alunos/registro/' + identificacao, {
      method: 'GET',
    })
    const data = await res.json();
    console.log(data.id);
    if (res.ok) {
      msg.style.color = 'red';
      msg.textContent = 'Aluno já registrado.';
      document.getElementById('entidade_id').value = data.id;
    }
    return data;
  } catch (err) {
    msg.style.color = 'green';
    msg.textContent = "Aluno precisa ser cadastrado no sistema de gestão de alunos.";
  }
}

// Verificar se o docente tem um registro
async function checkDocente(identificacao) {
  try {
    const res = await fetch('/docentes/siape/' + identificacao, {
      method: 'GET',
    })
    const data = await res.json();
    if (res.ok) {
      msg.style.color = 'red';
      msg.textContent = 'Docente já registrado.';
      document.getElementById('entidade_id').value = data.id;
    }
    return data;
  } catch (err) {
    msg.style.color = 'green';
    msg.textContent = "Docente precisa ser cadastrado no sistema de gestão de docentes.";
  }
}

// Verificar se o supervisor tem um registro
async function checkSupervisor(identificacao) {
  try {
    const res = await fetch('/supervisores/cress/' + identificacao, {
      method: 'GET',
    })
    const data = await res.json();
    if (res.ok) {
      msg.style.color = 'red';
      msg.textContent = 'Supervisor já registrado.';
      document.getElementById('entidade_id').value = data.id;
    }
    return data;
  } catch (err) {
    msg.style.color = 'green';
    msg.textContent = "Supervisor precisa ser cadastrado no sistema de gestão de supervisores.";
  }
}

// Registrar usuário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const nome = document.getElementById('nome').value.trim();
  const role = document.getElementById('role').value.trim();
  const identificacao = document.getElementById('identificacao').value.trim();
  const entidade_id = document.getElementById('entidade_id').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  console.log(nome, role, identificacao, entidade_id, email, password, passwordConfirm);

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, role, identificacao, entidade_id, email, password, passwordConfirm })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
    msg.style.color = 'green';
    msg.textContent = 'Registrado com sucesso. Redirecionando...';
    setTimeout(() => window.location.href = data.redirectTo || '/login.html', 1000);
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
});