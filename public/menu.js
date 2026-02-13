// Top Menu
import { isLoggedIn, getCurrentUser, logout } from './auth-utils.js';

$(document).ready(async function () {
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
      switch (user.role) {
        case 'admin':
          const loginLinksAdmin = navbarNav.querySelectorAll('a[href="login.html"], a[href="register.html"]');
          loginLinksAdmin.forEach(link => link.parentElement.remove());
          break;
        case 'aluno':
          const loginLinksAluno = navbarNav.querySelectorAll('a[href="#"], a[href="login.html"], a[href="register.html"], a[href="estagiarios.html"], a[href="turmas.html"], a[href="docentes.html"], a[href="atividades.html"], a[href="questionarios.html"], a[href="estagios.html"], a[href="areainstituicoes.html"], a[href="visitas.html"], a[href="supervisores.html"], a[href="view-configuracoes.html"]');
          loginLinksAluno.forEach(link => link.parentElement.remove());
          // Change the label of the alunos.html link
          const muralLink = navbarNav.querySelector('a[href="alunos.html"]');
          if (muralLink) {
            muralLink.textContent = 'Meus dados';
            muralLink.href = '/view-aluno.html?id=' + user.entidade_id;
          }
          break;
        case 'docente':
          const loginLinksDocente = navbarNav.querySelectorAll('a[href="#"], a[href="login.html"], a[href="register.html"], a[href="alunos.html"], a[href="estagiarios.html"], a[href="turmas.html"], a[href="atividades.html"], a[href="questionarios.html"], a[href="estagios.html"], a[href="areainstituicoes.html"], a[href="visitas.html"], a[href="supervisores.html"], a[href="view-configuracoes.html"]');
          loginLinksDocente.forEach(link => link.parentElement.remove());
          // Change the label of the docentes.html link
          const docentesLink = navbarNav.querySelector('a[href="docentes.html"]');
          if (docentesLink) {
            docentesLink.textContent = 'Meus alunos';
            docentesLink.href = '/view-docente.html?id=' + user.entidade_id;
          }
          break;
        case 'supervisor':
          const loginLinksSupervisor = navbarNav.querySelectorAll('a[href="#"], a[href="login.html"], a[href="register.html"], a[href="alunos.html"], a[href="estagiarios.html"], a[href="turmas.html"], a[href="docentes.html"], a[href="atividades.html"], a[href="questionarios.html"], a[href="estagios.html"], a[href="areainstituicoes.html"], a[href="visitas.html"], a[href="view-configuracoes.html"]');
          loginLinksSupervisor.forEach(link => link.parentElement.remove());
          // Change the label of the supervisores.html link
          const supervisoresLink = navbarNav.querySelector('a[href="supervisores.html"]');
          if (supervisoresLink) {
            supervisoresLink.textContent = 'Meus estagiarios';
            supervisoresLink.href = '/view-supervisor.html?id=' + user.entidade_id;
          }
          break;
        default:
          break;
      }

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
      const loginLinks = navbarNav.querySelectorAll('a[href="#"], a[href="mural.html"], a[href="alunos.html"], a[href="estagiarios.html"], a[href="turmas.html"], a[href="docentes.html"], a[href="atividades.html"], a[href="questionarios.html"], a[href="estagios.html"], a[href="areainstituicoes.html"], a[href="visitas.html"], a[href="supervisores.html"], a[href="view-configuracoes.html"], a[href="register.html"]');
      // Put the login link on the right side of the navbar
      const loginLink = navbarNav.querySelector('a[href="login.html"]');
      if (loginLink) {
        navbarNav.appendChild(loginLink.parentElement);
      }
      loginLinks.forEach(link => link.parentElement.remove());
    }
  }

  // Carregar o menu ao iniciar a página
  loadMenu();
});
