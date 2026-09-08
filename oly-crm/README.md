# OLY CRM — Plataforma de Automação e Relacionamento para Restaurantes

Sistema modular (CRM + Segmentação + Automações + Dashboard) construído a partir do documento
"Projeto OLY", pronto para rodar localmente no VS Code.

## 🧱 Estrutura do projeto (módulo por módulo)

```
oly-crm/
├── server.js              # Servidor principal (Express) — une todos os módulos
├── database.js             # Banco de dados SQLite + dados de exemplo (seed)
├── routes/
│   ├── clientes.js         # Módulo: cadastro de clientes + segmentação automática
│   ├── segmentos.js        # Módulo: segmentação (VIP, novo, frequente, inativo, risco)
│   ├── automacoes.js       # Módulo: automações (gatilho + espera + ação) e disparo
│   └── dashboard.js        # Módulo: indicadores financeiros e agenda
├── public/
│   ├── index.html           # Frontend (SPA com sidebar por módulo)
│   ├── css/style.css        # Estilo visual (paleta oficial Oly)
│   └── js/app.js            # Integração do frontend com a API
├── package.json
└── README.md
```

Isso corresponde à estrutura descrita no documento do projeto (item 12): Dashboard, Clientes,
Segmentos, Automações, Agenda — os 6 pilares do MVP (item 14) já estão implementados:
cadastro de clientes, segmentação, criador de automações, agendamento, disparo (simulado) e
dashboard de resultados.

## ▶️ Como rodar no VS Code

1. **Instale o Node.js** (versão 18 ou superior) caso ainda não tenha: https://nodejs.org
2. Abra a pasta `oly-crm` no VS Code.
3. Abra o terminal integrado (menu **Terminal → New Terminal**).
4. Instale as dependências:
   ```bash
   npm install
   ```
5. Inicie o servidor:
   ```bash
   npm start
   ```
6. Acesse no navegador: **http://localhost:3000**

O banco de dados (`oly.db`) é criado automaticamente na primeira execução, já com 3 clientes de
exemplo, 3 automações e 4 campanhas na agenda — os mesmos exemplos do documento original.

> Dica: use `npm run dev` (requer `nodemon`, já incluso no `package.json`) para o servidor
> reiniciar automaticamente a cada alteração de código.

## 🧩 Como cada módulo funciona

- **Clientes**: cadastro manual pela tela, e o botão "+ Compra" simula uma nova compra —
  isso atualiza gasto total, quantidade de pedidos e recalcula o segmento automaticamente,
  exatamente como descrito no fluxo do projeto (compra → identificação → segmentação).
- **Segmentos**: visão agregada de quantos clientes existem em cada segmento e quanto já
  gastaram.
- **Automações**: você monta gatilho + segmento alvo + ação + mensagem. O botão
  "Rodar automações agora" (no Dashboard) simula o motor de automação: varre a base de
  clientes, verifica quem é elegível para cada automação ativa e registra o disparo.
- **Dashboard**: soma os resultados (clientes impactados, recuperados, disparos, taxa de
  recompra) a partir do histórico de execuções.
- **Agenda**: mostra as campanhas programadas por dia da semana (exemplo do documento:
  segunda = inativos, terça = VIP, quarta = recompra, sexta = fim de semana).

## 🔌 Próximos módulos (evolução recomendada)

O sistema já está estruturado para receber, sem precisar reescrever nada:

1. **Integração real com WhatsApp** (WhatsApp Business API / Twilio / Z-API) — hoje o disparo é
   simulado e só grava no banco; basta plugar a chamada de envio dentro de
   `routes/automacoes.js`, na rota `/executar`.
2. **Autenticação e multi-restaurante** (login, cada conta vendo só os próprios dados).
3. **Programa de fidelidade** (pontos, cupons) — já existe espaço no schema para a ação `pontos`
   e `cupom`.
4. **IA para sugestão de campanhas** (item 10 do documento) — endpoint novo que recebe um texto
   do gestor e devolve uma automação pré-preenchida.
5. Trocar o SQLite por **PostgreSQL/MySQL** quando o volume de dados crescer (a troca é só no
   `database.js`, o resto do sistema não muda porque as rotas já usam consultas SQL padrão).

## 🎨 Identidade visual

Paleta usada em todo o sistema, igual ao mockup que você enviou:
- Rosa (`#FF3D8B`) — cor primária
- Verde-lima (`#C7F04A`) — cor secundária
- Laranja (`#FFB020`) — destaque
- Fundo escuro (`#121214`)
