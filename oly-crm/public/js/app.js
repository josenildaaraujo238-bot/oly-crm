// =========================================================
// OLY CRM - FRONTEND (app.js)
// Navegação entre módulos + integração com a API REST
// =========================================================

const API = '/api';

// ---------------------------------------------------------
// NAVEGAÇÃO ENTRE VIEWS (MÓDULOS)
// ---------------------------------------------------------
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));

    item.classList.add('active');
    const viewId = 'view-' + item.dataset.view;
    document.getElementById(viewId).classList.add('active');

    carregarView(item.dataset.view);
  });
});

function carregarView(nome) {
  if (nome === 'dashboard') carregarDashboard();
  if (nome === 'clientes') carregarClientes();
  if (nome === 'segmentos') carregarSegmentos();
  if (nome === 'automacoes') { carregarAutomacoes(); carregarExecucoes(); }
  if (nome === 'agenda') carregarAgenda();
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('active');
}
function abrirModal(id) {
  document.getElementById(id).classList.add('active');
}

const TAGS_SEGMENTO = {
  vip: 'tag-vip', novo: 'tag-novo', risco: 'tag-risco',
  inativo: 'tag-inativo', frequente: 'tag-frequente'
};
const LABEL_SEGMENTO = {
  vip: 'VIP', novo: 'Novo', risco: 'Em risco',
  inativo: 'Inativo', frequente: 'Frequente'
};

function formatarMoeda(valor) {
  return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
function formatarData(dataISO) {
  if (!dataISO) return '-';
  return new Date(dataISO).toLocaleDateString('pt-BR');
}

// ---------------------------------------------------------
// MÓDULO: DASHBOARD
// ---------------------------------------------------------
async function carregarDashboard() {
  const res = await fetch(`${API}/dashboard`);
  const dados = await res.json();

  document.getElementById('dashboard-metrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-title">Faturamento Gerado</div>
      <div class="metric-value">${formatarMoeda(dados.faturamento_gerado)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Clientes Impactados</div>
      <div class="metric-value accent">${dados.clientes_impactados}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Clientes Recuperados</div>
      <div class="metric-value primary">${dados.clientes_recuperados}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Pedidos Gerados (disparos)</div>
      <div class="metric-value">${dados.pedidos_gerados}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Taxa de Recompra</div>
      <div class="metric-value accent">${dados.taxa_recompra}%</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Automações Ativas</div>
      <div class="metric-value">${dados.automacoes_ativas}</div>
    </div>
  `;

  const corpo = document.getElementById('tabela-segmentos-dashboard').querySelector('tbody');
  corpo.innerHTML = dados.clientes_por_segmento.map((s) => `
    <tr>
      <td><span class="tag ${TAGS_SEGMENTO[s.segmento] || ''}">${LABEL_SEGMENTO[s.segmento] || s.segmento}</span></td>
      <td>${s.total}</td>
      <td>${formatarMoeda(0)}</td>
    </tr>
  `).join('') || '<tr><td colspan="3" class="empty-state">Sem dados ainda</td></tr>';
}

document.getElementById('btn-rodar-automacoes').addEventListener('click', async () => {
  const res = await fetch(`${API}/automacoes/executar`, { method: 'POST' });
  const dados = await res.json();
  alert(`${dados.disparos_gerados} disparo(s) gerado(s) a partir de ${dados.automacoes_processadas} automação(ões) ativa(s).`);
  carregarDashboard();
});

// ---------------------------------------------------------
// MÓDULO: CLIENTES
// ---------------------------------------------------------
async function carregarClientes() {
  const segmento = document.getElementById('filtro-segmento').value;
  const url = segmento === 'todos' ? `${API}/clientes` : `${API}/clientes?segmento=${segmento}`;
  const res = await fetch(url);
  const clientes = await res.json();

  const corpo = document.getElementById('tabela-clientes');
  corpo.innerHTML = clientes.map((c) => `
    <tr>
      <td>${c.nome}</td>
      <td>${c.telefone}</td>
      <td>${formatarData(c.ultima_compra)}</td>
      <td>${formatarMoeda(c.gasto_total)}</td>
      <td>${c.quantidade_pedidos}</td>
      <td><span class="tag ${TAGS_SEGMENTO[c.segmento] || ''}">${LABEL_SEGMENTO[c.segmento] || c.segmento}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="abrirModalCompra(${c.id})">+ Compra</button>
        <button class="btn btn-danger btn-sm" onclick="excluirCliente(${c.id})">Excluir</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-state">Nenhum cliente neste segmento</td></tr>';
}

document.getElementById('filtro-segmento').addEventListener('change', carregarClientes);

document.getElementById('btn-novo-cliente').addEventListener('click', () => abrirModal('modal-cliente'));

document.getElementById('form-cliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const corpo = {
    nome: document.getElementById('cliente-nome').value,
    telefone: document.getElementById('cliente-telefone').value,
    email: document.getElementById('cliente-email').value,
    data_nascimento: document.getElementById('cliente-nascimento').value
  };

  await fetch(`${API}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
  });

  e.target.reset();
  fecharModal('modal-cliente');
  carregarClientes();
});

function abrirModalCompra(id) {
  document.getElementById('compra-cliente-id').value = id;
  abrirModal('modal-compra');
}

document.getElementById('form-compra').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('compra-cliente-id').value;
  const valor = document.getElementById('compra-valor').value;

  await fetch(`${API}/clientes/${id}/registrar-compra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor: Number(valor) })
  });

  e.target.reset();
  fecharModal('modal-compra');
  carregarClientes();
});

async function excluirCliente(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  await fetch(`${API}/clientes/${id}`, { method: 'DELETE' });
  carregarClientes();
}

// ---------------------------------------------------------
// MÓDULO: SEGMENTOS
// ---------------------------------------------------------
async function carregarSegmentos() {
  const res = await fetch(`${API}/segmentos`);
  const dados = await res.json();

  document.getElementById('segmentos-metrics').innerHTML = dados.map((s) => `
    <div class="metric-card">
      <div class="metric-title"><span class="tag ${TAGS_SEGMENTO[s.segmento] || ''}">${LABEL_SEGMENTO[s.segmento] || s.segmento}</span></div>
      <div class="metric-value">${s.total_clientes} clientes</div>
      <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">${formatarMoeda(s.gasto_total)} em gasto acumulado</div>
    </div>
  `).join('');
}

// ---------------------------------------------------------
// MÓDULO: AUTOMAÇÕES
// ---------------------------------------------------------
const LABEL_GATILHO = {
  primeira_compra: 'Primeira compra',
  inativo_15_dias: '15 dias sem comprar',
  inativo_30_dias: '30 dias sem comprar',
  aniversario: 'Aniversário',
  valor_gasto: 'Valor gasto'
};
const LABEL_ACAO = {
  whatsapp: 'Enviar WhatsApp', email: 'Enviar e-mail',
  cupom: 'Criar cupom', pontos: 'Adicionar pontos'
};

async function carregarAutomacoes() {
  const res = await fetch(`${API}/automacoes`);
  const automacoes = await res.json();

  document.getElementById('tabela-automacoes').innerHTML = automacoes.map((a) => `
    <tr>
      <td>${a.nome}</td>
      <td>${LABEL_GATILHO[a.gatilho] || a.gatilho}</td>
      <td>${LABEL_ACAO[a.acao] || a.acao}</td>
      <td>${LABEL_SEGMENTO[a.segmento_alvo] || 'Todos'}</td>
      <td><span class="status-dot ${a.ativa ? 'status-ativa' : 'status-pausada'}"></span>${a.ativa ? 'Ativa' : 'Pausada'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="alternarStatusAutomacao(${a.id})">${a.ativa ? 'Pausar' : 'Ativar'}</button>
        <button class="btn btn-danger btn-sm" onclick="excluirAutomacao(${a.id})">Excluir</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="empty-state">Nenhuma automação cadastrada</td></tr>';
}

document.getElementById('btn-nova-automacao').addEventListener('click', () => abrirModal('modal-automacao'));

document.getElementById('form-automacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  const corpo = {
    nome: document.getElementById('auto-nome').value,
    gatilho: document.getElementById('auto-gatilho').value,
    acao: document.getElementById('auto-acao').value,
    segmento_alvo: document.getElementById('auto-segmento').value,
    mensagem: document.getElementById('auto-mensagem').value
  };

  await fetch(`${API}/automacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
  });

  e.target.reset();
  fecharModal('modal-automacao');
  carregarAutomacoes();
});

async function alternarStatusAutomacao(id) {
  await fetch(`${API}/automacoes/${id}/status`, { method: 'PUT' });
  carregarAutomacoes();
}

async function excluirAutomacao(id) {
  if (!confirm('Excluir esta automação?')) return;
  await fetch(`${API}/automacoes/${id}`, { method: 'DELETE' });
  carregarAutomacoes();
}

async function carregarExecucoes() {
  const res = await fetch(`${API}/automacoes/execucoes/historico`);
  const historico = await res.json();

  document.getElementById('tabela-execucoes').innerHTML = historico.map((h) => `
    <tr>
      <td>${h.automacao_nome}</td>
      <td>${h.cliente_nome}</td>
      <td>${h.status}</td>
      <td>${formatarData(h.criado_em)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty-state">Nenhum disparo registrado ainda. Clique em "Rodar automações agora" no Dashboard.</td></tr>';
}

// ---------------------------------------------------------
// MÓDULO: AGENDA
// ---------------------------------------------------------
const LABEL_DIA = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
  quinta: 'Quinta-feira', sexta: 'Sexta-feira', sabado: 'Sábado', domingo: 'Domingo'
};

async function carregarAgenda() {
  const res = await fetch(`${API}/dashboard/calendario`);
  const campanhas = await res.json();

  document.getElementById('tabela-agenda').innerHTML = campanhas.map((c) => `
    <tr>
      <td>${c.nome}</td>
      <td>${LABEL_DIA[c.dia_semana] || c.dia_semana}</td>
      <td>${c.horario}</td>
      <td>${LABEL_SEGMENTO[c.segmento_alvo] || 'Todos'}</td>
      <td>${c.status}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="empty-state">Nenhuma campanha agendada</td></tr>';
}

// ---------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------
carregarDashboard();
