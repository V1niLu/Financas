function testeExibir() {
  console.log("Teste Exibir Executado");
}

//const { contextBridge, ipcRenderer } = require('electron');
const db = require('./../db.js');

function cadastrarFesta({ nome, data, cidade }) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO festa (nome, data, cidade) VALUES (?, ?, ?)", [nome, data, cidade], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function listarFestas() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM festa", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


function atualizarFesta({ id, nome, data, cidade }) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE festa SET nome=?, data=?, cidade=? WHERE id=?", [nome, data, cidade, id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { cadastrarFesta, listarFestas, atualizarFesta, testeExibir };
