# CLAUDE.md — Flüxa CRM

> Contexto completo do projeto para o Claude Code e Squad Agents.
> Leia este arquivo inteiro antes de qualquer tarefa.

---

## Quem somos

**Flüxa** é uma infraestrutura de vendas para negócios locais — SaaS + automação + IA.
Fundador: **Eliezer Cavanha** (Blumenau, SC). Me chame de **Cavanha**.
Tagline: *"Do primeiro contato ao caixa — a gente cuida do meio."*

Três nichos:
- **Flüxa Sales** — Vidraçarias (ativo, em produção)
- **Flüxa Food's** — Restaurantes (em desenvolvimento)
- **Flüxa Care** — Clínicas (planejado)

---

## Este repositório — Flüxa CRM

Frontend do CRM multi-tenant usado por vidraçarias clientes da Flüxa.

- **Stack:** Next.js 14 + TypeScript + Tailwind CSS
- **Deploy:** Vercel → `app.fluxa.com`
- **Repo:** `cavanhafluxa/CRM-empresa`
- **Branch principal:** `main`

### Comandos
```bash
npm run dev      # localhost:3000
npm run build    # build de produção
npm run start    # servidor de produção
```

### Arquitetura
- Toda a UI vive em `src/app/page.tsx` (~4.300 linhas)
- Navegação por estado `activeTab` — não há rotas separadas
- Tema via objeto `T` — dark/light mode com classes Tailwind
- Realtime via Supabase — pipeline, meetings, messages atualizam sem F5

---

## Banco de Dados — Supabase

**Project ID:** `uzttjedryajsmngvpaqu`
**URL:** `https://uzttjedryajsmngvpaqu.supabase.co`
**Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dHRqZWRyeWFqc21uZ3ZwYXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTIwMDIsImV4cCI6MjA4ODU2ODAwMn0.Z965K_V6FRceBL1jP7zMls4QVYbpjPP9JcoRHUkAwUg`

### Tabelas — CRM Sales (vidraçarias)

| Tabela | Descrição |
|---|---|
| `companies` | Empresas clientes (multi-tenant) |
| `company_auth` | Autenticação por empresa |
| `users` | Usuários do CRM (founder/gestor/colaborador) |
| `leads` | Leads de cada empresa |
| `lead_notes` | Notas dos leads |
| `meetings` | Reuniões/visitas agendadas |
| `messages` | Chat ao vivo (tabela existe, falta frontend) |
| `pipeline_columns` | Colunas customizadas do Kanban |
| `funnels` | Funil ToFu/MoFu/BoFu |
| `quotes` | Orçamentos |
| `fornecedores` | Fornecedores da vidraçaria |
| `fornecedor_produtos` | Produtos por fornecedor (preços) |
| `followup_jobs` | Follow-up automático pós-orçamento (pendente) |
| `activity_logs` | Log de atividades |
| `support_tickets` | Tickets de suporte |
| `eli_bloqueados` | Números bloqueados para o Eli |

### Tabelas — Flüxa Hub (visão founder)

| Tabela | Descrição |
|---|---|
| `fluxa_prospects` | Leads da LP da Flüxa (vidraçarias prospectadas) |
| `fluxa_meetings` | Meetings do hub Flüxa |
| `fluxa_prospect_notas` | Notas dos prospects |
| `fluxa_empresas_config` | Configuração do Eli por empresa |

### Tabelas — Flüxa Food's

| Tabela | Descrição |
|---|---|
| `food_companies` | Restaurantes cadastrados |
| `food_menu_items` | Cardápio de cada restaurante |
| `food_orders` | Pedidos (chegam via Eli/WhatsApp) |
| `food_order_items` | Itens de cada pedido |

### Empresas no CRM

| Empresa | ID | Slug |
|---|---|---|
| Flüxa (hub founder) | `00000000-0000-0000-0000-000000000001` | `fluxa` |
| Dzarte Vidros | `17fe8a73-5b0e-4a7e-adcf-b61e06ead856` | `dzarte` |
| Shimitd Haus | `1fe7cb85-e6a5-4ea3-a5e0-779766916d05` | `shimitd-haus` |

### Pipeline Stages (Dzarte)

```
tofu_contato → qualificando → proposta → negociacao → ganho → perdido
```

### Realtime habilitado em:
`leads`, `meetings`, `messages`, `funnels`, `users`, `food_orders`, `food_menu_items`

---

## Automação — N8N

**URL:** `https://n8n-n8n.uhcnbw.easypanel.host`

### Eli SDR (AI WhatsApp Sales Agent)
- Workflow: `Flüxa - Eli SDR v8` (versão estável)
- Webhook WhatsApp: `whatsapp-fluxa`
- Webhook LP: `fluxa-lp-lead`
- Evolution API: `https://n8n-evolution-api.uhcnbw.easypanel.host`
- Instância Dzarte: `"Teste"` / apikey `FA0D644CBA16-40E7-A3FC-2F9E82B20C25`
- Instância Flüxa SDR: `"eliezer"` / apikey `07FC12640595-4B0C-84FA-A360A2785E28`

### Eli qualifica via:
`BANT + SPIN + Sandler + Split`

Output JSON do Eli:
- `tipo_atendimento`: em_analise | demo | humano | desqualificado
- `resposta_parte1` / `resposta_parte2`
- `nivel_interesse`: baixo | medio | alto
- `bant_budget/authority/need/timeline`
- `data_demo` / `hora_demo`

---

## Design System Atual

Tema via objeto `T` em `page.tsx`:
```typescript
const T = {
  bg: dark ? 'bg-[#0f1117]' : 'bg-white',
  card: dark ? 'bg-[#13171f] border border-white/[0.07]' : 'bg-white border border-slate-200',
  // ...
}
```

**Paleta atual:** sky (accent), slate (base), dark mode como padrão.

### Redesign proposto pelo @design-chief (implementar em fases):

**Fase 1 — Design System (sem quebrar nada):**
- Criar `src/lib/ds.ts` com tokens DS completos
- Adicionar radius, elevation, transitions, focus ring, typography scale
- Componente `Empty` padronizado
- Animações de modal com `animate-in fade-in zoom-in-95`

**Fase 2 — Componentes independentes:**
- `src/components/ui/` → Empty, AnimatedModal, LeadCard
- `src/components/pipeline/`
- `src/components/leads/`

**Fase 3 — Páginas separadas** (futuro)

**Quick Wins imediatos (baixo risco):**
1. `transition-all duration-150` em botões/cards via `T.tr`
2. `animate-in fade-in` nos modais
3. Componente Empty nos 6 lugares vazios
4. Tempo na etapa no card do Pipeline (`Date.now() - updated_at`)
5. Separar Hub/CRM na Sidebar visualmente

---

## Regras de Desenvolvimento

1. **Nunca alterar `.env.local`** — contém chaves reais de produção
2. **Nunca fazer deploy sem testar localmente** com `npm run dev`
3. **Supabase Realtime** já está configurado — não remover subscriptions
4. **Multi-tenancy** — sempre filtrar por `company_id` nas queries
5. **RLS ativo** — políticas existem em todas as tabelas sensíveis
6. **Não refatorar tudo de uma vez** — o `page.tsx` monolítico é intencional por ora
7. **Manter o objeto `T`** como fonte de verdade do tema
8. **Commits em português** com prefixo: `feat:`, `fix:`, `refactor:`
9. **Branch:** sempre trabalhar na `main` (projeto solo)
10. **Números do Sales/Dzarte são simulados** — não tratar como dados reais

---

## Contexto Estratégico

- Dzarte Vidros é o **laboratório vivo** — tudo é validado ali primeiro
- Flüxa ainda está em **fase pré-receita** — foco em produto e primeira venda
- **Fase atual:** testar Sales na Dzarte + desenvolver Food's em paralelo
- **Próximo marco:** prospectar Quiosque Lanches como piloto do Food's
- **Casamento Alexia:** 21/11/2026 — contexto pessoal importante para priorização

---

## Squad Agents disponíveis em `.claude/squads/`

| Squad | Uso |
|---|---|
| `@design-chief` | Redesign UI/UX do CRM |
| `@hormozi-chief` | Estratégia de vendas e oferta |
| `@copy-chief` | Copy da LP e materiais de venda |
| `@brand-chief` | Posicionamento e identidade |
| `@traffic-chief` | Tráfego pago (futuro) |
| `@data-chief` | Métricas e analytics |
