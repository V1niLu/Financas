// main.js
const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const db = require('./db'); // importa o banco

function createWindow() {
  const win = new BrowserWindow({
    width: 1250,
    height: 800,
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
