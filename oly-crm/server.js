const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Desativa o index.html automático para permitir que a Landing Page abra primeiro
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Rotas da API
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/automacoes', require('./routes/automacoes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/segmentos', require('./routes/segmentos'));

// 1. Rota principal: http://localhost:3000 -> Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// 2. Rota do sistema: http://localhost:3000/app -> Painel do CRM
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Landing Page: http://localhost:${PORT}`);
  console.log(`CRM: http://localhost:${PORT}/app`);
});