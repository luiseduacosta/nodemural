// Top Menu
import { isLoggedIn, getCurrentUser, logout } from './auth-utils.js';

$(document).ready(function () {
  // Função para carregar o menu
  async function loadMenu() {
    try {
      const response = await fetch('menu.html');
      const html = await response.text();
      document.getElementById('menu-container').innerHTML = html;

      // Add auth status and user info
      updateAuthUI();
    } catch (error) {
      console.error('Erro ao carregar o menu:', error);
    }
  }

  // Update UI based on login status
  function updateAuthUI() {
    const navbarNav = document.querySelector('#navbarMenu');
    if (!navbarNav) return;

    const user = getCurrentUser();
    const isLogged = isLoggedIn();

    if (isLogged && user) {
      // Remove login/register links if already logged in
      const loginLinks = navbarNav.querySelectorAll('a[href="login.html"], a[href="register.html"]');
      loginLinks.forEach(link => link.parentElement.remove());

      // Add user info and logout
      const li = document.createElement('li');
      li.className = 'nav-item dropdown ms-auto';
      li.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          👤 ${user.nome}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" onclick="window.location.href='/auth-profile.html'">Perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logoutBtn">Sair</a></li>
        </ul>
      `;
      navbarNav.appendChild(li);

      // Logout handler
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout('/login.html');
      });
    } else {
      // Only show login/register links if not logged in
      const loginLinks = navbarNav.querySelectorAll('a[href="#"], a[href="mural.html"], a[href="alunos.html"], a[href="estagiarios.html"], a[href="turmas.html"], a[href="docentes.html"], a[href="atividades.html"], a[href="questionario.html"], a[href="estagio.html"], a[href="areainstituicoes.html"], a[href="visitas.html"], a[href="supervisores.html"], a[href="view-configuracoes.html"], a[href="register.html"]');
      loginLinks.forEach(link => link.parentElement.remove());
    }
  }

  // Carregar o menu ao iniciar a página
  loadMenu();
});
