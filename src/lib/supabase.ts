import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function loginWithSlug(slug: string, password: string) {
  const { data, error } = await supabase
    .from('company_auth')
    .select('*, companies(*)')
    .eq('company_slug', slug)
    .eq('active', true)
    .single()

  if (error || !data) throw new Error('Empresa não encontrada.')

  // Em produção, use bcrypt no backend. Aqui comparamos hash simples.
  const valid = data.password_hash === password
  if (!valid) throw new Error('Senha incorreta.')

  // Update last_login_at
  await supabase
    .from('company_auth')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.id)

  return data.companies
}

export async function getCompanyUser(companyId: string, email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId)
    .eq('email', email)
    .eq('active', true)
    .single()

  if (error) throw error
  return data
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchLeads(companyId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createLead(lead: Partial<import('@/types').Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLead(id: string, updates: Partial<import('@/types').Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

// ── Lead Notes ────────────────────────────────────────────────────────────────

export async function fetchLeadNotes(leadId: string) {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createLeadNote(note: Partial<import('@/types').LeadNote>) {
  const { data, error } = await supabase
    .from('lead_notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Meetings ──────────────────────────────────────────────────────────────────

export async function fetchMeetings(companyId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('company_id', companyId)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createMeeting(meeting: Partial<import('@/types').Meeting>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMeeting(id: string, updates: Partial<import('@/types').Meeting>) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Activity Logs ─────────────────────────────────────────────────────────────

export async function logActivity(log: Partial<import('@/types').ActivityLog>) {
  await supabase.from('activity_logs').insert(log)
}
