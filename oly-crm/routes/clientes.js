const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar todos os clientes
router.get('/', (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Cadastrar novo cliente
router.post('/', (req, res) => {
  const { nome, telefone, email, data_nascimento } = req.body;
  const sql = `INSERT INTO clientes (nome, telefone, email, data_nascimento) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [nome, telefone, email, data_nascimento], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, nome, telefone, email, data_nascimento });
  });
});

module.exports = router;