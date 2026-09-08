const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/métricas', (req, res) => {
  db.get('SELECT COUNT(*) AS total_clientes FROM clientes', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ totalClientes: row ? row.total_clientes : 0 });
  });
});

module.exports = router;