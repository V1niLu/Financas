// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const db = require('./db'); // importa o banco
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1250,
    height: 800,
    icon: path.join(__dirname, 'img', 'icone_financa.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true // segurança: false quando usa contextBridge
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

// Fecha o app quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Ativa novamente no macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// festa
ipcMain.handle('addFesta', async (event, data) => {
  try {
    const { nome, dataFesta, cidade } = data;

    console.log("Recebido no main:", data);

    console.log("Cadastrando festa:", { nome, dataFesta, cidade });

    await db.run(
      `INSERT INTO Festas (nome, data, cidade) VALUES (?, ?, ?)`,
      [nome, dataFesta, cidade]
    );

    return { status: 'ok', message: 'Festa cadastrada com sucesso!' };
  } catch (error) {
    console.error("Erro ao inserir festa:", error);
    throw new Error("Erro ao cadastrar festa no banco de dados");
  }
});

ipcMain.handle('getFesta', async () => {
  try {
    const festas = await db.all("SELECT * FROM Festas");
    return festas; // retorna a lista de festas para o renderer
  } catch (error) {
    console.error("Erro ao buscar festas:", error);
    throw new Error("Erro ao exibir festas no banco de dados");
  }
});

ipcMain.handle('deleteFesta', async (event, id) => {
  try {
    console.log("Deletando festa com ID:", id);

    await db.run(`DELETE FROM Festas WHERE id = ?`, [id]);

    return { status: 'ok', message: 'Festa deletada com sucesso!' };
  } catch (error) {
    console.error("Erro ao deletar festa:", error);
    throw new Error("Erro ao deletar festa no banco de dados");
  }
});

//funcionario

ipcMain.handle('addFuncionario', async (event, data) => {
  try {
    const { nome, cargo, id_festa } = data;

    console.log("Cadastrando funcionario:", { nome, cargo, id_festa });

    await db.run(
      `INSERT INTO Funcionarios (nome, cargo, id_festa) VALUES (?, ?, ?)`,
      [nome, cargo, id_festa]
    );

    return { status: 'ok', message: 'Funcionário cadastrado com sucesso!' };
  } catch (error) {
    console.error("Erro ao inserir funcionario:", error);
    throw new Error("Erro ao cadastrar funcionário no banco de dados");
  }
});

ipcMain.handle('getFuncionario', async (event, id_festa) => {
  try {
    const funcionario = await db.all("SELECT * FROM Funcionarios WHERE id_festa = ?", [id_festa]);
    return funcionario;
  } catch (error) {
    console.error("Erro ao buscar funcionario:", error);
    throw new Error("Erro ao exibir funcionários no banco de dados");
  }
});


ipcMain.handle('deleteFuncionario', async (event, id) => {
  try {
    console.log("Deletando festa com ID:", id);

    await db.run(`DELETE FROM Funcionarios WHERE id = ?`, [id]);

    return { status: 'ok', message: 'Funcionario deletado com sucesso!' };
  } catch (error) {
    console.error("Erro ao deletar funcionario:", error);
    throw new Error("Erro ao deletar funcionario no banco de dados");
  }
});

ipcMain.handle('salvarPagamentos', async (event, listaPagamentos) => {
  try {
    for (const pagamento of listaPagamentos) {
      const { id_funcionario, id_festa, data_pagamento_dia, pagamento_dia, pagamento_total, pagamento_dinheiro, pagamento_credito, pagamento_debito, pagamento_pix } = pagamento;


      const existente = await db.all(`
        SELECT id FROM Pagamentos WHERE id_funcionario = ? AND data_pagamento_dia = ?
      `, [id_funcionario, data_pagamento_dia]);

      if (existente.length > 0) {
        // Atualiza
        await db.run(`
        UPDATE Pagamentos SET 
          pagamento_dia = ?, 
          pagamento_total = ?, 
          pagamento_dinheiro = ?, 
          pagamento_credito = ?, 
          pagamento_debito = ?, 
          pagamento_pix = ?, 
          id_festa = ?
        WHERE id_funcionario = ? AND data_pagamento_dia = ?
      `, [pagamento_dia, pagamento_total, pagamento_dinheiro, pagamento_credito, pagamento_debito, pagamento_pix, id_festa, id_funcionario, data_pagamento_dia]);

      } else {
        // Insere
        await db.run(`
        INSERT INTO Pagamentos (
          id_funcionario, id_festa, data_pagamento_dia, pagamento_dia, 
          pagamento_total, pagamento_dinheiro, pagamento_credito, 
          pagamento_debito, pagamento_pix
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id_funcionario, id_festa, data_pagamento_dia, pagamento_dia, pagamento_total, pagamento_dinheiro, pagamento_credito, pagamento_debito, pagamento_pix]);
      }
    }

    return { status: 'ok' };
  } catch (error) {
    console.error("Erro ao salvar pagamentos:", error);
    throw error;
  }
});

ipcMain.handle('getPagamentosDoDia', async (event, id_funcionario, id_festa) => {
  try {
    const pagamentos = await db.all(
      `SELECT * FROM Pagamentos WHERE id_funcionario = ? AND id_festa = ?`,
      [id_funcionario, id_festa]
    );
    return pagamentos;
  } catch (error) {
    console.error("Erro ao buscar pagamentos do dia:", error);
    return [];
  }
});

ipcMain.handle('exportar-pdf', async (event) => {
  const win = event.sender.getOwnerBrowserWindow();

  // Abre janela para o usuário escolher onde salvar
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Salvar como PDF',
    defaultPath: 'relatorio.pdf',
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (!filePath) return;

  try {
    const pdfBuffer = await win.webContents.printToPDF({
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: true
    });

    fs.writeFileSync(filePath, pdfBuffer);
    return { sucesso: true, caminho: filePath };
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    return { sucesso: false, erro: err.message };
  }
});
