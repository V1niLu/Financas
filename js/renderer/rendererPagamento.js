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

    // 🔹 Acumuladores gerais
    let totalReceita = 0;
    let geral = { dinheiro: 0, debito: 0, credito: 0, pix: 0 };

    // 🔹 Acumuladores por cargo
    let garcom = { dinheiro: 0, debito: 0, credito: 0, pix: 0, total: 0 };
    let caixa  = { dinheiro: 0, debito: 0, credito: 0, pix: 0, total: 0 };
    let totem  = { dinheiro: 0, debito: 0, credito: 0, pix: 0, total: 0 };

    for (const funcionario of listaFuncionario) {
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

      // Cabeçalho da tabela (ordem invertida)
      const thead = document.createElement("thead");
      const trHeader = document.createElement("tr");
      const headers = ["Data", "Dinheiro", "Débito", "Crédito", "Pix", "Total", "8%", "2%"];
      headers.forEach(text => {
        const th = document.createElement("th");
        th.innerText = text;
        trHeader.appendChild(th);
      });
      thead.appendChild(trHeader);

      const tbody = document.createElement("tbody");

      let somaDinheiro = 0, somaDebito = 0, somaCredito = 0, somaPix = 0, somaTotal = 0;

      if (Array.isArray(listaPagamentos) && listaPagamentos.length > 0) {
        for (const pagamento of listaPagamentos) {
          const trBody = document.createElement("tr");

          const tdData = document.createElement("td");
          tdData.innerText = pagamento.data_pagamento_dia ? formatarDataBR(pagamento.data_pagamento_dia) : "-";

          const tdDinheiro = document.createElement("td");
          tdDinheiro.innerText = formatarMoedaEN(pagamento.pagamento_dinheiro);
          somaDinheiro += Number(pagamento.pagamento_dinheiro) || 0;

          const tdDebito = document.createElement("td");
          tdDebito.innerText = formatarMoedaEN(pagamento.pagamento_debito);
          somaDebito += Number(pagamento.pagamento_debito) || 0;

          const tdCredito = document.createElement("td");
          tdCredito.innerText = formatarMoedaEN(pagamento.pagamento_credito);
          somaCredito += Number(pagamento.pagamento_credito) || 0;

          const tdPix = document.createElement("td");
          tdPix.innerText = formatarMoedaEN(pagamento.pagamento_pix);
          somaPix += Number(pagamento.pagamento_pix) || 0;

          const tdTotal = document.createElement("td");
          tdTotal.innerText = formatarMoedaEN(pagamento.pagamento_total);
          somaTotal += Number(pagamento.pagamento_total) || 0;

          const td8 = document.createElement("td");
          td8.innerText = formatarMoedaEN(pagamento.pagamento_dia);

          const td2 = document.createElement("td");
          td2.innerText = funcionario.cargo.toLowerCase() === "garçom" ? formatarMoedaEN((pagamento.pagamento_total || 0) * 0.02) : "-";

          trBody.append(tdData, tdDinheiro, tdDebito, tdCredito, tdPix, tdTotal, td8, td2);
          tbody.appendChild(trBody);
        }
      }

      // Atualiza acumuladores gerais
      totalReceita += somaTotal;
      geral.dinheiro += somaDinheiro;
      geral.debito   += somaDebito;
      geral.credito  += somaCredito;
      geral.pix      += somaPix;

      const cargo = funcionario.cargo.toLowerCase();
      if (cargo === "garçom") {
        garcom.dinheiro += somaDinheiro;
        garcom.debito   += somaDebito;
        garcom.credito  += somaCredito;
        garcom.pix      += somaPix;
        garcom.total    += somaTotal;
      } else if (cargo.includes("caixa")) {
        caixa.dinheiro += somaDinheiro;
        caixa.debito   += somaDebito;
        caixa.credito  += somaCredito;
        caixa.pix      += somaPix;
        caixa.total    += somaTotal;
      } else if (cargo.includes("totem")) {
        totem.dinheiro += somaDinheiro;
        totem.debito   += somaDebito;
        totem.credito  += somaCredito;
        totem.pix      += somaPix;
        totem.total    += somaTotal;
      }

      // Rodapé tabela do funcionário
      const tfoot = document.createElement("tfoot");
      const trFooter = document.createElement("tr");

      const tdLabel = document.createElement("td"); tdLabel.colSpan = 1; tdLabel.innerText = "Totais:";
      const tdDinheiroTotal = document.createElement("td"); tdDinheiroTotal.innerText = formatarMoedaEN(somaDinheiro);
      const tdDebitoTotal = document.createElement("td"); tdDebitoTotal.innerText = formatarMoedaEN(somaDebito);
      const tdCreditoTotal = document.createElement("td"); tdCreditoTotal.innerText = formatarMoedaEN(somaCredito);
      const tdPixTotal = document.createElement("td"); tdPixTotal.innerText = formatarMoedaEN(somaPix);
      const tdTotalGeral = document.createElement("td"); tdTotalGeral.innerText = formatarMoedaEN(somaTotal);
      const td8Vazio = document.createElement("td"); td8Vazio.innerText = "-";
      const td2Vazio = document.createElement("td"); td2Vazio.innerText = "-";

      trFooter.append(tdLabel, tdDinheiroTotal, tdDebitoTotal, tdCreditoTotal, tdPixTotal, tdTotalGeral, td8Vazio, td2Vazio);
      tfoot.appendChild(trFooter);

      table.append(thead, tbody, tfoot);
      pagamentos.appendChild(table);
      funcPagamentos.appendChild(funcionarios);
      funcPagamentos.appendChild(pagamentos);
      container.appendChild(funcPagamentos);
    }

    // 🔹 Atualiza os elementos do front pelo ID
    document.getElementById("totalReceita").innerText = formatarMoedaEN(totalReceita);

    // Garçom
    document.getElementById("dinheiroGarcom").innerText = formatarMoedaEN(garcom.dinheiro);
    document.getElementById("debitoGarcom").innerText   = formatarMoedaEN(garcom.debito);
    document.getElementById("creditoGarcom").innerText  = formatarMoedaEN(garcom.credito);
    document.getElementById("pixGarcom").innerText      = formatarMoedaEN(garcom.pix);
    document.getElementById("8Garcom").innerText        = formatarMoedaEN(garcom.total * 0.08);
    document.getElementById("2Garcom").innerText        = formatarMoedaEN(garcom.total * 0.02);
    document.getElementById("receitaGarcom").innerText  = formatarMoedaEN(garcom.total);

    // Caixa
    document.getElementById("dinheiroCaixa").innerText  = formatarMoedaEN(caixa.dinheiro);
    document.getElementById("debitoCaixa").innerText    = formatarMoedaEN(caixa.debito);
    document.getElementById("creditoCaixa").innerText   = formatarMoedaEN(caixa.credito);
    document.getElementById("pixCaixa").innerText       = formatarMoedaEN(caixa.pix);
    document.getElementById("receitaCaixa").innerText   = formatarMoedaEN(caixa.total);

    // Totem
    document.getElementById("dinheiroTotem").innerText  = formatarMoedaEN(totem.dinheiro);
    document.getElementById("debitoTotem").innerText    = formatarMoedaEN(totem.debito);
    document.getElementById("creditoTotem").innerText   = formatarMoedaEN(totem.credito);
    document.getElementById("pixTotem").innerText       = formatarMoedaEN(totem.pix);
    document.getElementById("receitaTotem").innerText   = formatarMoedaEN(totem.total);

    // Totais gerais
    document.getElementById("dinheiroGeral").innerText = formatarMoedaEN(geral.dinheiro);
    document.getElementById("debitoGeral").innerText   = formatarMoedaEN(geral.debito);
    document.getElementById("creditoGeral").innerText  = formatarMoedaEN(geral.credito);
    document.getElementById("pixGeral").innerText      = formatarMoedaEN(geral.pix);

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