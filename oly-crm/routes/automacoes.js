const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar automações
router.get('/', (req, res) => {
  db.all('SELECT * FROM automacoes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Criar automação
router.post('/', (req, res) => {
  const { nome, gatilho, espera, acao, mensagem, segmento_alvo } = req.body;
  const sql = `INSERT INTO automacoes (nome, gatilho, espera, acao, mensagem, segmento_alvo) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nome, gatilho, espera, acao, mensagem, segmento_alvo], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, nome });
  });
});

module.exports = router;
