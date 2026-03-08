export type Role = 'founder' | 'gestor' | 'colaborador'

export type PipelineStage =
  | 'Novo Lead'
  | 'Qualificado'
  | 'Reunião Marcada'
  | 'Proposta'
  | 'Fechado'
  | 'Perdido'

export type LeadStatus = 'ativo' | 'ganho' | 'perdido' | 'inativo'

export type EventType = 'reuniao' | 'visita' | 'instalacao'

export type EventStatus = 'pendente' | 'confirmado' | 'cancelado'

export interface Company {
  id: string
  company_name: string
  company_slug: string
  company_logo_url?: string
  company_phone?: string
  whatsapp_instance?: string
  whatsapp_number?: string
  pricing_config_json?: Record<string, unknown>
  crm_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyAuth {
  id: string
  company_id: string
  company_slug: string
  password_hash: string
  active: boolean
  last_login_at?: string
  created_at: string
}

export interface User {
  id: string
  company_id: string
  full_name: string
  display_name: string
  email: string
  avatar_url?: string
  role: Role
  active: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  company_id: string
  nome: string
  telefone?: string
  email?: string
  origem?: string
  lead_source?: string
  servico?: string
  largura?: number
  altura?: number
  tipo_vidro?: string
  espessura?: number
  area?: number
  valor_estimado?: number
  status: LeadStatus
  pipeline_stage: PipelineStage
  nivel_interesse?: number
  resumo_gestor?: string
  created_at: string
  updated_at: string
}

export interface LeadNote {
  id: string
  company_id: string
  lead_id: string
  user_id: string
  note: string
  created_at: string
}

export interface Meeting {
  id: string
  company_id: string
  lead_id?: string
  event_type: EventType
  title: string
  description?: string
  start_at: string
  end_at?: string
  status: EventStatus
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  company_id: string
  lead_id: string
  servico?: string
  area?: number
  valor?: number
  pdf_url?: string
  sent_at?: string
  created_at: string
}

export interface Message {
  id: string
  company_id: string
  lead_id?: string
  telefone?: string
  direction: 'in' | 'out'
  message_text: string
  message_type?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  company_id: string
  user_id?: string
  lead_id?: string
  action: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Session {
  company: {
    id: string
    name: string
    slug: string
    logo: string
    color: string
    password: string
  }
  user: User & { avatar: string }
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}
