const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao banco SQLite.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Festas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      data DATE,
      cidade TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_festa INTEGER,
      nome TEXT,
      cargo TEXT,
      FOREIGN KEY (id_festa) REFERENCES Festas(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_funcionario INTEGER,
      id_festa INTEGER,
      data_pagamento_dia DATE,
      pagamento_dia REAL,
      pagamento_total REAL,
      pagamento_dinheiro REAL,
      pagamento_credito REAL,
      pagamento_debito REAL,
      pagamento_pix REAL,
      FOREIGN KEY (id_funcionario) REFERENCES Funcionarios(id),
      FOREIGN KEY (id_festa) REFERENCES Festas(id)
    )
  `);
});

// Função que executa comandos SQL com Promise para facilitar uso async/await
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this); // 'this' contém informações como lastID
    });
  });
}

// Função para consultar dados com Promise
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  run,
  all,
  db // exporta também o objeto db caso queira usar diretamente
};
