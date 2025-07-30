function cadastroFesta() {
  document.getElementById("cadastroFestaForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // impede reload do form

    const nome = document.getElementById("nome").value;
    const dataFesta = document.getElementById("data").value; 
    const cidade = document.getElementById("local").value;

    console.log("📦 Enviando do renderer:", { nome, dataFesta, cidade });

    try {
      const resposta = await window.api.addFesta({ nome, dataFesta, cidade });
      exibirFestasLista();
    } catch (err) {
    }
  });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function exibirFestas() {
  const exibirLista = document.getElementById("festaList");

  try {
    const listaFestas = await window.api.getFesta(); 

    if (!listaFestas || listaFestas.length === 0) {
      console.log("Nenhuma festa encontrada");
      return;
    }

    listaFestas.forEach(festa => {
      const div = document.createElement("div");
      const h2 = document.createElement("h2");
      const h4 = document.createElement("h4");
      const p = document.createElement("p");

      div.id = "selectFesta" + festa.id;

      div.addEventListener('click', () => {
        const id = festa.id;
        const nome = encodeURIComponent(festa.nome);
        const data = encodeURIComponent(festa.data);
        const cidade = encodeURIComponent(festa.cidade);

        const url = `../html/financas.html?id=${id}&nome=${nome}&data=${data}&cidade=${cidade}`;
        window.location.href = url;
      });

      div.className = "containerFesta";
      h2.innerText = festa.nome;
      h4.innerText = festa.cidade;
      p.innerText = formatarData(festa.data); // data formatada aqui

      div.appendChild(h2);
      div.appendChild(h4);
      div.appendChild(p);
      exibirLista.appendChild(div);
    });

    console.log("Festas exibidas com sucesso");
  } catch (error) {
    console.error("Erro ao exibir festas:", error);
  }
}


function selectFesta(div) {
  const festaId = div.id;
  console.log("Festa selecionada:", festaId);
  window.location.href = "../../html/financas.html";
}

async function exibirFestasLista() {
  const exibirListaFesta = document.getElementById("festaList");

  try {
    const listaFestas = await window.api.getFesta();

    if (!listaFestas || listaFestas.length === 0) {
      console.log("Nenhuma festa encontrada");
      return;
    }

    festaList.innerHTML = ""; // Limpa a lista antes de exibir

    listaFestas.forEach(festa => {
      const tr = document.createElement("tr");
      const id = document.createElement("td");
      const nome = document.createElement("td");
      const data = document.createElement("td");
      const local = document.createElement("td");
      const excluir = document.createElement("td");
      const btnExcluir = document.createElement("button");

      btnExcluir.innerText = "X";
      btnExcluir.className = "btnExcluir";
      btnExcluir.onclick = function() {
        deleteFesta(festa.id);
      };

      id.innerText = festa.id;
      nome.innerText = festa.nome;
      data.innerText = formatarData(festa.data); // data formatada aqui
      local.innerText = festa.cidade;

      excluir.appendChild(btnExcluir);

      tr.appendChild(id);
      tr.appendChild(nome);
      tr.appendChild(data);
      tr.appendChild(local);
      tr.appendChild(excluir);

      exibirListaFesta.appendChild(tr);
    });

    console.log("Festas exibidas com sucesso");
    selectFesta(); 
  } catch (error) {
    console.error("Erro ao exibir festas:", error);
  }
}


function deleteFesta(id) {
    window.api.deleteFesta(id)
      .then(response => {
        exibirFestasLista(); // Atualiza a lista após deletar
      })
      .catch(error => {
        console.error("Erro ao deletar festa:", error);
      });
}



