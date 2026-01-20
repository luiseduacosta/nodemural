topMenu = `
 <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">Mural de estágios</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item active">
            <a class="nav-link" href="mural.html">Mural</a>
          </li>          
          <li class="nav-item">
            <a class="nav-link" href="alunos.html">Alunos(as)</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="estagiarios.html">Estagiários</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="docentes.html">Docentes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="estagio.html">Instituições</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="supervisores.html">Supervisores(as)</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="view-configuracoes.html">Configurações</a>
          </li>
        </ul>
    </div>
</nav>
`;

const container = document.getElementById('menu-container');

if (container) {
  container.innerHTML = topMenu;
} else {
  console.error('Elemento de menu não encontrado.');
}
