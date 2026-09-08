const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'oly.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Banco de dados SQLite (oly.db) conectado com sucesso.');
  }
});

function inicializarBanco() {
  db.serialize(() => {
    // Tabela de Clientes
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT,
        data_nascimento TEXT,
        gasto_total REAL DEFAULT 0,
        quantidade_pedidos INTEGER DEFAULT 0,
        ultima_compra TEXT,
        segmento TEXT DEFAULT 'novo',
        criado_em TEXT DEFAULT (datetime('now'))
      )
    `);

    // Tabela de Automações
    db.run(`
      CREATE TABLE IF NOT EXISTS automacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        gatilho TEXT NOT NULL,
        espera INTEGER DEFAULT 0,
        acao TEXT NOT NULL,
        mensagem TEXT,
        segmento_alvo TEXT,
        criado_em TEXT DEFAULT (datetime('now'))
      )
    `);
  });
}

inicializarBanco();

module.exports = db;