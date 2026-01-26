// Top Menu
$(document).ready(function () {
  // Função para carregar o menu
  async function loadMenu() {
    try {
      const response = await fetch('menu.html');
      const html = await response.text();
      document.getElementById('menu-container').innerHTML = html;
    } catch (error) {
      console.error('Erro ao carregar o menu:', error);
    }
  }
  // Carregar o menu ao iniciar a página
  loadMenu();
});
