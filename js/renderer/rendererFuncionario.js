function getParamentros() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = decodeURIComponent(params.get("nome"));
  const data = decodeURIComponent(params.get("data"));
  const cidade = decodeURIComponent(params.get("cidade"));

  console.log(id, nome, data, cidade);

  return { id, nome, data, cidade };
}

function financas(){
  const parametrosFesta = getParamentros();

  const id = encodeURIComponent(parametrosFesta.id);
  const nome = encodeURIComponent(parametrosFesta.nome);
  const data = encodeURIComponent(parametrosFesta.data);
  const cidade = encodeURIComponent(parametrosFesta.cidade);

  const url = `../html/financas.html?id=${id}&nome=${nome}&data=${data}&cidade=${cidade}`;
  window.location.href = url;
}

function addFunc(){
  const parametrosFesta = getParamentros();

  const id = encodeURIComponent(parametrosFesta.id);
  const nome = encodeURIComponent(parametrosFesta.nome);
  const data = encodeURIComponent(parametrosFesta.data);
  const cidade = encodeURIComponent(parametrosFesta.cidade);

  const url = `../html/cadastro_usuario.html?id=${id}&nome=${nome}&data=${data}&cidade=${cidade}`;
  window.location.href = url;
}
getParamentros();

function cadastroFuncionario() {
  const parametrosFesta = getParamentros();

  document.getElementById("cadastroFuncionarioForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cargo = document.getElementById("opcaoCargo").value;
    const id_festa = Number(parametrosFesta.id);

    console.log(nome + " " + cargo);

    try {
      const resposta = await window.api.addFuncionario({ nome, cargo, id_festa });

      // Limpa os campos do formulário após o cadastro
      document.getElementById("nome").value = "";
      document.getElementById("opcaoCargo").value = "";

      // Atualiza a lista de funcionários sem redirecionar
      await exibirFuncionarioLista();

    } catch (error) {
      console.log(error);
    }
  });
}


async function exibirFuncionarioLista() {

  const parametrosFesta = getParamentros();

  const exibirListaFuncionario = document.getElementById("funcionarioExibicao");

  const id_festa = Number(parametrosFesta.id);

  try {
    const listaFuncionario = await window.api.getFuncionario(id_festa);

    // Verifica se veio algo
    if (!listaFuncionario || listaFuncionario.length === 0) {
      console.log("Nenhuma funcionario encontrada");
      return;
    }

    exibirListaFuncionario.innerHTML = "";

    listaFuncionario.forEach(funcionario => {

      const tr = document.createElement("tr");
      const id = document.createElement("td");
      const nome = document.createElement("td");
      const cargo = document.createElement("td");
      const festa = document.createElement("td");
      const excluir = document.createElement("td");
      const btnExcluir = document.createElement("button");

      btnExcluir.innerText = "X";
      btnExcluir.className = "btnExcluir";
      btnExcluir.onclick = function() {
        deleteFuncionario(funcionario.id);
      };

      id.innerText = funcionario.id;
      nome.innerText = funcionario.nome;
      cargo.innerText = funcionario.cargo;
      festa.innerText = parametrosFesta.nome;

      excluir.appendChild(btnExcluir);

      tr.appendChild(id);
      tr.appendChild(nome);
      tr.appendChild(cargo);
      tr.appendChild(festa);
      tr.appendChild(excluir);

      exibirListaFuncionario.appendChild(tr);
    });

    console.log("funcionarios exibidos com sucesso");
  } catch (error) {
    console.error("Erro ao exibir funcionario:", error);
  }
}

function deleteFuncionario(id) {
    window.api.deleteFuncionario(id)
      .then(response => {
        exibirFuncionarioLista(); // Atualiza a lista após deletar
      })
      .catch(error => {
        console.error("Erro ao deletar funcionario:", error);
      });
}

async function exibirFinancas() {
  const parametrosFesta = getParamentros();
  const exibirListaFuncionario = document.getElementById("exibirFinanca");
  const id_festa = Number(parametrosFesta.id);

  try {
    const listaFuncionario = await window.api.getFuncionario(id_festa);

    if (!listaFuncionario || listaFuncionario.length === 0) {
      console.log("Nenhum funcionário encontrado");
      return;
    }

    exibirListaFuncionario.innerHTML = "";

    listaFuncionario.forEach(funcionario => {
      // Criação das divs principais
      const divfuncionarios = document.createElement("div");
      divfuncionarios.className = "funcionarios";

      const divInfoFuncionarios = document.createElement("div");
      divInfoFuncionarios.className = "infoFuncionario";

      const divNome = document.createElement("div");
      divNome.className = "nomeFuncionario";

      const divCargo = document.createElement("div");
      divCargo.className = "cargoFuncionario";

      const divFesta = document.createElement("div");
      divFesta.className = "festaFuncionario";

      const divValorTotal = document.createElement("div");
      divValorTotal.className = "valorFuncionario";

      // Textos
      const h3Nome = document.createElement("h3");
      const h3Cargo = document.createElement("h3");
      const h3Festa = document.createElement("h3");
      const h3Total = document.createElement("h3");

      const textNodeTotal = document.createTextNode("R$ 0.00 ");
      h3Total.appendChild(textNodeTotal);

      // Só cria o span se o cargo for garçom
      let span = null;
      if (funcionario.cargo.toLowerCase() === "garçom") {
        span = document.createElement("span");
        span.className = "valor7";
        span.innerText = "R$: 0.00";
        h3Total.appendChild(span);
      }

      // Checkbox
      const inputCheckbox = document.createElement("input");
      inputCheckbox.type = "checkbox";
      inputCheckbox.id = `mostrarValor${funcionario.id}`;

      // Informações de pagamento
      const divInfoPagamento = document.createElement("div");
      divInfoPagamento.className = "infoPagamento"; // começa escondido por CSS

      // Função auxiliar para criar blocos de pagamento
      function criarPagamento(label, inputId) {
        const div = document.createElement("div");
        div.className = "divPagamento";

        const h3 = document.createElement("h3");
        h3.innerText = label;

        const input = document.createElement("input");
        input.type = "number";
        input.id = inputId;

        div.appendChild(h3);
        div.appendChild(input);

        return { div, input };
      }

      // Criando os blocos de pagamento na ordem certa
      const dinheiro = criarPagamento("Dinheiro", `dinheiro_${funcionario.id}`);
      const debito   = criarPagamento("Débito", `debito_${funcionario.id}`);
      const credito  = criarPagamento("Crédito", `credito_${funcionario.id}`);
      const pix      = criarPagamento("Pix", `pix_${funcionario.id}`);

      // Evento para calcular a soma dos valores
      function calcularSoma() {
        const v1 = Number(dinheiro.input.value) || 0;
        const v2 = Number(debito.input.value) || 0;
        const v3 = Number(credito.input.value) || 0;
        const v4 = Number(pix.input.value) || 0;

        const somaMoney = v1 + v2 + v3 + v4;
        const soma7 = somaMoney * 0.08;

        textNodeTotal.nodeValue = "R$ " + somaMoney.toFixed(2) + " ";

        if (span) {
          span.innerText = "R$: " + soma7.toFixed(2);
        }
      }

      // Listeners na nova ordem
      dinheiro.input.addEventListener("input", calcularSoma);
      debito.input.addEventListener("input", calcularSoma);
      credito.input.addEventListener("input", calcularSoma);
      pix.input.addEventListener("input", calcularSoma);

      // Evento para mostrar/ocultar pagamento ao marcar o checkbox
      inputCheckbox.addEventListener("change", () => {
        if (inputCheckbox.checked) {
          divInfoPagamento.className = "infoPagamentoMostrar";
        } else {
          divInfoPagamento.className = "infoPagamento";
        }
      });

      // Preenchendo os textos
      h3Nome.innerText = funcionario.nome;
      h3Cargo.innerText = funcionario.cargo;
      h3Festa.innerText = parametrosFesta.nome;

      // Montando estrutura
      divNome.appendChild(h3Nome);
      divCargo.appendChild(h3Cargo);
      divFesta.appendChild(h3Festa);
      divValorTotal.appendChild(h3Total);

      divInfoFuncionarios.appendChild(divNome);
      divInfoFuncionarios.appendChild(divCargo);
      divInfoFuncionarios.appendChild(divFesta);
      divInfoFuncionarios.appendChild(divValorTotal);
      divInfoFuncionarios.appendChild(inputCheckbox);

      divfuncionarios.appendChild(divInfoFuncionarios);

      // Exibe os pagamentos na ordem correta
      divInfoPagamento.appendChild(dinheiro.div);
      divInfoPagamento.appendChild(debito.div);
      divInfoPagamento.appendChild(credito.div);
      divInfoPagamento.appendChild(pix.div);

      divfuncionarios.appendChild(divInfoPagamento);

      exibirListaFuncionario.appendChild(divfuncionarios);
    });

    console.log("Funcionários exibidos com sucesso");
  } catch (error) {
    console.error("Erro ao exibir funcionário:", error);
  }
}


// function getDataAtualFormatada() {
//   const hoje = new Date();
//   const ano = hoje.getFullYear();
//   const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses começam do 0
//   const dia = String(hoje.getDate()).padStart(2, '0') - 1;
//   return `${ano}-${mes}-${dia}`;
// }

// function atualizarData(){
//   document.getElementById("data").value = getDataAtualFormatada();
// }


async function fecharCaixa() {
  const parametrosFesta = getParamentros();
  const id_festa = Number(parametrosFesta.id);
  const dataAtual = document.getElementById("data").value;

  try {
    const funcionarios = await window.api.getFuncionario(id_festa);
    const listaPagamentos = [];

    funcionarios.forEach(funcionario => {
      const id = funcionario.id;
      const cargo = funcionario.cargo.toLowerCase();

      const dinheiro = parseFloat(document.getElementById(`dinheiro_${id}`)?.value || 0);
      const credito = parseFloat(document.getElementById(`credito_${id}`)?.value || 0);
      const debito  = parseFloat(document.getElementById(`debito_${id}`)?.value || 0);
      const pix     = parseFloat(document.getElementById(`pix_${id}`)?.value || 0);

      const total = dinheiro + credito + debito + pix;
      const pagamentoDia = (cargo === "garçom") ? total * 0.08 : 0;

      listaPagamentos.push({
        id_funcionario: id,
        id_festa: id_festa,                  // <---- Adicionado aqui
        data_pagamento_dia: dataAtual,
        pagamento_dia: pagamentoDia,
        pagamento_total: total,
        pagamento_dinheiro: dinheiro,
        pagamento_credito: credito,
        pagamento_debito: debito,
        pagamento_pix: pix
      });
    });

    // Salvar no banco via preload
    await window.api.salvarPagamentos(listaPagamentos);

    // Redireciona para o relatório
    const id = encodeURIComponent(parametrosFesta.id);
    const nome = encodeURIComponent(parametrosFesta.nome);
    const data = encodeURIComponent(parametrosFesta.data);
    const cidade = encodeURIComponent(parametrosFesta.cidade);

    const url = `../html/relatorio.html?id=${id}&nome=${nome}&data=${data}&cidade=${cidade}`;
    window.location.href = url;

  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
  }
}
