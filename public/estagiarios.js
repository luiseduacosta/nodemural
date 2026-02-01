// src/controllers/estagiarioController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

  if (!getToken() || !hasRole(['admin'])) {
    window.location.href = 'login.html';
    return;
  }

  // Setup - add a text input to each footer cell
  $("#estagiariosTable thead tr")
    .clone(true)
    .appendTo("#estagiariosTable thead");
  $("#estagiariosTable thead tr:eq(1) th").each(function (i) {
    var title = $(this).text();
    if (title === "Ações") {
      $(this).html("");
      return;
    }
    $(this).html('<input type="text" placeholder="Pesquisar ' + title + '" />');

    $("input", this).on("keyup change", function () {
      if (table.column(i).search() !== this.value) {
        table.column(i).search(this.value).draw();
      }
    });
  });

  let table;
  // Initialize DataTable
  table = $("#estagiariosTable").DataTable({
    order: [
      [3, "desc"],
      [1, "asc"],
    ],
    orderCellsTop: true,
    ajax: {
      url: "/estagiarios",
      data: function (d) {
        const periodo = $("#periodoFilter").val();
        if (periodo && periodo !== 'Todos') {
          d.periodo = periodo;
        }
      },
      dataSrc: "",
    },
    columns: [
      { data: "aluno_registro" },
      {
        data: "aluno_nome",
        render: function (data, type, row) {
          return `<a href="view-estagiario.html?id=${row.id}">${row.aluno_nome || "-"}</a>`;
        },
      },
      { data: "professor_nome", defaultContent: "-" },
      { data: "instituicao_nome", defaultContent: "-" },
      { data: "supervisor_nome", defaultContent: "-" },
      { data: "periodo", defaultContent: "-" },
      { data: "nivel", defaultContent: "-" },
      {
        data: null,
        render: function (data, type, row) {
          return `
                        <button onclick="window.location.href='edit-estagiario.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
                        <button onclick="deleteEstagiario(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
        },
      },
    ],
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json",
    },
  });

  async function loadFilters() {
    try {
      // 1. Get Distinct Periods
      const periodosRes = await fetch("/estagiarios/periodos");
      const periodos = await periodosRes.json();
      const select = $("#periodoFilter");
      select.empty();

      // Add 'Todos' option
      const option = document.createElement("option");
      option.value = 'Todos';
      option.text = 'Todos';
      select.append(option);

      // Add periods from DB
      periodos.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.periodo;
        option.text = p.periodo;
        select.append(option);
      });

      // 2. Get Default Config
      const configRes = await fetch("/configuracoes");
      if (configRes.ok) {
        const config = await configRes.json();
        if (config.termo_compromisso_periodo) {
          select.val(config.termo_compromisso_periodo);
        }
      }

      // Reload table with the new default filter
      table.ajax.reload();
    } catch (error) {
      console.error("Error loading filters:", error);
      $("#periodoFilter").html('<option value="">Erro ao carregar</option>');
    }
  }

  // Load Periodos and Config
  loadFilters();

  // Handle Change
  $("#periodoFilter").on("change", function () {
    table.ajax.reload();
  });

  window.deleteEstagiario = async (id) => {
    if (
      confirm("Tem certeza que deseja excluir este registro de estagiário?")
    ) {
      try {
        const response = await fetch(`/estagiarios/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Erro ao excluir");
        }
        table.ajax.reload();
      } catch (error) {
        console.error("Error deleting estagiario:", error);
        alert("Erro ao excluir estagiário");
      }
    }
  };
});
