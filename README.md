# Flüxa CRM

CRM SaaS multiempresa premium para equipes de alta performance.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **Supabase** (banco de dados)

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Demo (sem Supabase):**
- Empresa: `fluxa` / Senha: `fluxa123`
- Empresa: `vidramax` / Senha: `vidra123`

## Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o arquivo `supabase/migration.sql`
3. Copie a URL e a Anon Key do projeto
4. Cole no arquivo `.env.local`

## Deploy no Vercel

1. Suba o projeto para o GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Estrutura

```
src/
├── app/
│   ├── layout.tsx        # Layout raiz
│   ├── globals.css       # Estilos globais
│   └── page.tsx          # App principal (CRM completo)
├── components/
│   ├── ui/               # Componentes base (Avatar, Badge, Modal...)
│   ├── dashboard/        # StatCard
│   ├── pipeline/         # PipelineCard
│   ├── leads/            # LeadModal
│   └── settings/
├── hooks/
│   ├── useToast.ts
│   └── useSession.ts
├── lib/
│   ├── supabase.ts       # Cliente e queries do Supabase
│   ├── utils.ts          # Utilitários e constantes
│   └── mock-data.ts      # Dados de seed para demo
├── types/
│   └── index.ts          # Tipos TypeScript
└── supabase/
    └── migration.sql     # Schema do banco de dados
```

## Módulos

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs, gráficos de evolução, pipeline e valor |
| **Pipeline** | Kanban arrastável com 6 etapas |
| **Leads** | Tabela com busca, filtro, paginação |
| **Calendário** | Agendamento de visitas, reuniões e instalações |
| **Configurações** | Perfil, tema e logout |

## Roles

| Role | Permissões |
|------|-----------|
| `founder` | Acesso total, pode excluir leads |
| `gestor` | Pode gerenciar e excluir leads |
| `colaborador` | Pode visualizar e editar, não pode excluir |

## Integração com automações (n8n / Eli SDR)

Para criar leads automaticamente via automação, faça um `POST` direto na tabela `leads` do Supabase usando a Service Role Key:

```json
POST https://seu-projeto.supabase.co/rest/v1/leads
Authorization: Bearer SERVICE_ROLE_KEY
Content-Type: application/json

{
  "company_id": "uuid-da-empresa",
  "nome": "Nome do Lead",
  "telefone": "(11) 99999-9999",
  "origem": "WhatsApp",
  "pipeline_stage": "Novo Lead",
  "status": "ativo"
}
```

O lead aparecerá automaticamente no CRM da empresa correspondente.
