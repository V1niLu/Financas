const db = require('./db');

function cadastrarPagamento({ pagamentoDia, pagamentoData }) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO pagamento (pagamentoDia, pagamentoData) VALUES (?, ?)", [pagamentoDia, pagamentoData], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function atualizarPagamento({ id, pagamentoDia, pagamentoData }) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE pagamento SET pagamentoDia=?, pagamentoData=? WHERE id=?", [pagamentoDia, pagamentoData, id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { cadastrarPagamento, atualizarPagamento };
