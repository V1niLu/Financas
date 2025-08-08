function getParamentros() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = decodeURIComponent(params.get("nome") || "");
  const data = decodeURIComponent(params.get("data") || "");
  const cidade = decodeURIComponent(params.get("cidade") || "");

  console.log("Parâmetros da URL:", { id, nome, data, cidade });

  return { id, nome, data, cidade };
}

// Função para listar bancos e popular select
async function listarBancos() {
  const selectBanco = document.getElementById("nomeBanco");
  try {
    const bancos = await window.api.getFesta();

    if (!bancos || bancos.length === 0) {
      console.log("Nenhum banco encontrado");
      return;
    }

    selectBanco.innerHTML = "";

    bancos.forEach(banco => {
      const option = document.createElement("option");
      option.value = banco.id;
      option.textContent = banco.nome;
      selectBanco.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar bancos:", error);
  }
}

// Chame listarBancos no carregamento da página
window.addEventListener("DOMContentLoaded", () => {
  listarBancos();
});

function formatarDataBR(dataISO) {
  if (!dataISO) return "-";
  
  // Trata apenas a parte da data (aaaa-mm-dd)
  const [ano, mes, dia] = dataISO.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

// Função para formatar valores monetários com vírgula nos milhares
function formatarMoedaEN(valor) {
  return Number(valor || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function listarPagamentos() {
  const container = document.getElementById("containerRelatorio");
  
  try {
    const selectBanco = document.getElementById("nomeBanco");
    const id_festa = Number(selectBanco.value);
    if (!id_festa) {
      console.log("Selecione uma festa válida.");
      return;
    }
    
    const listaFuncionario = await window.api.getFuncionario(id_festa);

    if (!listaFuncionario || listaFuncionario.length === 0) {
      console.log("Nenhum funcionário encontrado");
      return;
    }

    container.innerHTML = ""; // limpa antes de preencher

    for (const funcionario of listaFuncionario) {
      // Pega a lista (array) de pagamentos do funcionário
      const listaPagamentos = await window.api.getPagamentosDoDia(funcionario.id, id_festa);

      const funcPagamentos = document.createElement("div");
      funcPagamentos.className = "Funcpagamentos";

      const funcionarios = document.createElement("div");
      funcionarios.className = "funcionarios";

      const h2Nome = document.createElement("h2");
      h2Nome.innerText = funcionario.nome;

      const h2Cargo = document.createElement("h2");
      h2Cargo.innerText = funcionario.cargo;

      funcionarios.appendChild(h2Nome);
      funcionarios.appendChild(h2Cargo);

      const pagamentos = document.createElement("div");
      pagamentos.className = "pagamentos";

      const table = document.createElement("table");

      // Cabeçalho da tabela
      const thead = document.createElement("thead");
      const trHeader = document.createElement("tr");

      const headers = ["Data", "Crédito", "Débito", "Dinheiro", "Pix", "Total", "7%"];
      headers.forEach(text => {
        const th = document.createElement("th");
        th.innerText = text;
        trHeader.appendChild(th);
      });
      thead.appendChild(trHeader);

      // Corpo da tabela
      const tbody = document.createElement("tbody");

      // Se listaPagamentos for um array, percorra e crie linhas
      if (Array.isArray(listaPagamentos) && listaPagamentos.length > 0) {
        for (const pagamento of listaPagamentos) {
          const trBody = document.createElement("tr");

          const tdData = document.createElement("td");
          tdData.innerText = pagamento.data_pagamento_dia ? formatarDataBR(pagamento.data_pagamento_dia) : "-";

          const tdCredito = document.createElement("td");
          tdCredito.innerText = formatarMoedaEN(pagamento.pagamento_credito);

          const tdDebito = document.createElement("td");
          tdDebito.innerText = formatarMoedaEN(pagamento.pagamento_debito);

          const tdDinheiro = document.createElement("td");
          tdDinheiro.innerText = formatarMoedaEN(pagamento.pagamento_dinheiro);

          const tdPix = document.createElement("td");
          tdPix.innerText = formatarMoedaEN(pagamento.pagamento_pix);

          const tdTotal = document.createElement("td");
          tdTotal.innerText = formatarMoedaEN(pagamento.pagamento_total);

          const td7 = document.createElement("td");
          td7.innerText = formatarMoedaEN(pagamento.pagamento_dia);

          trBody.appendChild(tdData);
          trBody.appendChild(tdCredito);
          trBody.appendChild(tdDebito);
          trBody.appendChild(tdDinheiro);
          trBody.appendChild(tdPix);
          trBody.appendChild(tdTotal);
          trBody.appendChild(td7);

          tbody.appendChild(trBody);
        }
      } else {
        // Caso não tenha pagamentos, mostra linha dizendo "Nenhum pagamento"
        const trBody = document.createElement("tr");
        const tdVazio = document.createElement("td");
        tdVazio.colSpan = headers.length;
        tdVazio.innerText = "Nenhum pagamento encontrado.";
        trBody.appendChild(tdVazio);
        tbody.appendChild(trBody);
      }

      table.appendChild(thead);
      table.appendChild(tbody);

      pagamentos.appendChild(table);
      funcPagamentos.appendChild(funcionarios);
      funcPagamentos.appendChild(pagamentos);
      container.appendChild(funcPagamentos);

      getTotalPagamentos();
    }
  } catch (error) {
    console.log("Erro ao listar pagamentos", error);
  }
}

async function salvarComoPDF() {
  const resultado = await window.api.exportarPDF();
  
  if (resultado?.sucesso) {
    console.log("PDF salvo em:", resultado.caminho);
  } else {
    console.error("Falha ao exportar PDF:", resultado?.erro);
  }
}

async function calcularSomaTotalPagamentos() {
  try {
    const selectBanco = document.getElementById("nomeBanco");
    const id_festa = Number(selectBanco.value);

    if (!id_festa) {
      console.log("Selecione uma festa válida.");
      return 0;
    }

    let somaTotal = 0;

    // Pega todos os funcionários da festa selecionada
    const funcionarios = await window.api.getFuncionario(id_festa);
    if (!funcionarios || funcionarios.length === 0) {
      console.log("Nenhum funcionário encontrado para essa festa.");
      return 0;
    }

    // Para cada funcionário, pega todos os pagamentos e soma
    for (const funcionario of funcionarios) {
      const pagamentos = await window.api.getPagamentosDoDia(funcionario.id, id_festa);

      if (Array.isArray(pagamentos) && pagamentos.length > 0) {
        for (const pagamento of pagamentos) {
          somaTotal += Number(pagamento.pagamento_total) || 0;
        }
      }
    }

    console.log(`💰 Soma total da festa ${id_festa}: R$ ${formatarMoedaEN(somaTotal)}`);
    return somaTotal;

  } catch (error) {
    console.error("Erro ao calcular soma total da festa selecionada:", error);
    return 0;
  }
}

function getTotalPagamentos() {
  calcularSomaTotalPagamentos().then(soma => {
    const somaElement = document.getElementById("soma");
    const soma2Element = document.getElementById("soma2");

    if (somaElement && soma2Element) {
      somaElement.innerText = `R$ ${formatarMoedaEN(soma)}`;
      soma2Element.innerText = `R$ ${formatarMoedaEN(soma * 0.02)}`;
    } else {
      console.error("Elementos de soma não encontrados no DOM.");
    }
  }).catch(error => {
    console.error("Erro ao obter total de pagamentos:", error);
  });
}
