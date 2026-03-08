import { Lead, Meeting, User } from '@/types'

export function generateMockLeads(companyId: string): Lead[] {
  return [
    {
      id: `l1_${companyId}`, company_id: companyId,
      nome: 'Rafael Mendonça', telefone: '(11) 98765-4321', email: 'rafael@email.com',
      origem: 'Instagram', servico: 'Fechamento Varanda', valor_estimado: 8500,
      status: 'ativo', pipeline_stage: 'Qualificado', nivel_interesse: 4,
      area: 12.5, created_at: '2025-01-15', updated_at: '2025-01-15',
    },
    {
      id: `l2_${companyId}`, company_id: companyId,
      nome: 'Camila Torres', telefone: '(11) 91234-5678', email: 'camila@email.com',
      origem: 'Google Ads', servico: 'Vidro Box Banheiro', valor_estimado: 3200,
      status: 'ativo', pipeline_stage: 'Reunião Marcada', nivel_interesse: 5,
      area: 4.2, created_at: '2025-01-18', updated_at: '2025-01-18',
    },
    {
      id: `l3_${companyId}`, company_id: companyId,
      nome: 'Fernanda Oliveira', telefone: '(21) 97654-3210', email: 'fernanda@email.com',
      origem: 'WhatsApp', servico: 'Espelho Decorativo', valor_estimado: 1800,
      status: 'ativo', pipeline_stage: 'Novo Lead', nivel_interesse: 3,
      area: 2.0, created_at: '2025-01-20', updated_at: '2025-01-20',
    },
    {
      id: `l4_${companyId}`, company_id: companyId,
      nome: 'Bruno Almeida', telefone: '(31) 99887-6543', email: 'bruno@email.com',
      origem: 'Indicação', servico: 'Fachada ACM', valor_estimado: 24000,
      status: 'ativo', pipeline_stage: 'Proposta', nivel_interesse: 5,
      area: 48.0, created_at: '2025-01-22', updated_at: '2025-01-22',
    },
    {
      id: `l5_${companyId}`, company_id: companyId,
      nome: 'Juliana Costa', telefone: '(11) 95555-4444', email: 'juliana@email.com',
      origem: 'Site', servico: 'Fechamento Varanda', valor_estimado: 9800,
      status: 'ganho', pipeline_stage: 'Fechado', nivel_interesse: 5,
      area: 14.0, created_at: '2025-01-10', updated_at: '2025-01-10',
    },
    {
      id: `l6_${companyId}`, company_id: companyId,
      nome: 'Pedro Santos', telefone: '(41) 98888-7777', email: 'pedro@email.com',
      origem: 'Instagram', servico: 'Divisória Escritório', valor_estimado: 5600,
      status: 'perdido', pipeline_stage: 'Perdido', nivel_interesse: 2,
      area: 8.0, created_at: '2025-01-08', updated_at: '2025-01-08',
    },
    {
      id: `l7_${companyId}`, company_id: companyId,
      nome: 'Letícia Ferreira', telefone: '(11) 96666-5555', email: 'leticia@email.com',
      origem: 'Facebook', servico: 'Vidro Box Banheiro', valor_estimado: 2900,
      status: 'ativo', pipeline_stage: 'Qualificado', nivel_interesse: 4,
      area: 3.8, created_at: '2025-02-01', updated_at: '2025-02-01',
    },
    {
      id: `l8_${companyId}`, company_id: companyId,
      nome: 'Carlos Souza', telefone: '(11) 94444-3333', email: 'carlos@email.com',
      origem: 'Google Ads', servico: 'Fechamento Varanda', valor_estimado: 11200,
      status: 'ativo', pipeline_stage: 'Reunião Marcada', nivel_interesse: 4,
      area: 16.0, created_at: '2025-02-05', updated_at: '2025-02-05',
    },
  ]
}

export function generateMockMeetings(companyId: string): Meeting[] {
  return [
    {
      id: `m1_${companyId}`, company_id: companyId,
      title: 'Visita Técnica - Rafael', event_type: 'visita',
      start_at: '2025-02-10T10:00', end_at: '2025-02-10T11:00',
      status: 'confirmado', description: 'Medir varanda e apresentar amostras',
      created_at: '2025-02-01', updated_at: '2025-02-01',
    },
    {
      id: `m2_${companyId}`, company_id: companyId,
      title: 'Reunião - Bruno Almeida', event_type: 'reuniao',
      start_at: '2025-02-12T14:00', end_at: '2025-02-12T15:00',
      status: 'pendente', description: 'Apresentar proposta fachada ACM',
      created_at: '2025-02-01', updated_at: '2025-02-01',
    },
    {
      id: `m3_${companyId}`, company_id: companyId,
      title: 'Instalação - Juliana Costa', event_type: 'instalacao',
      start_at: '2025-02-15T08:00', end_at: '2025-02-15T17:00',
      status: 'confirmado', description: 'Instalação fechamento varanda',
      created_at: '2025-02-01', updated_at: '2025-02-01',
    },
  ]
}

export const MOCK_USERS: Record<string, User & { avatar: string }> = {
  fluxa: {
    id: 'usr_1', company_id: 'comp_1',
    full_name: 'Matheus Carvalho', display_name: 'Matheus',
    email: 'matheus@fluxa.com', role: 'founder',
    active: true, avatar: 'MC',
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  vidramax: {
    id: 'usr_2', company_id: 'comp_2',
    full_name: 'Ana Lima', display_name: 'Ana',
    email: 'ana@vidramax.com', role: 'gestor',
    active: true, avatar: 'AL',
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
}
