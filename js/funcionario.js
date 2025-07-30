const db = require('./db');

function cadastrarFuncionario({ nome, cargo }) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO funcionario (nome, cargo) VALUES (?, ?)", [nome, cargo], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function listarFuncionarios() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM funcionario", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function atualizarFuncionario({ id, nome, cargo }) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE funcionario SET nome=?, cargo=? WHERE id=?", [nome, cargo, id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { cadastrarFuncionario, listarFuncionarios, atualizarFuncionario };
