import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const API_TOKEN = process.env.LEADS_API_TOKEN || 'fluxa-leads-2025'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('x-api-token')
    if (auth !== API_TOKEN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { nome, telefone, servico, origem, instancia, resumo, atualizar } = body

    if (!telefone) return NextResponse.json({ ok: false, error: 'telefone obrigatório' }, { status: 400 })
    if (!instancia) return NextResponse.json({ ok: false, error: 'instancia obrigatória' }, { status: 400 })

    // 1. Buscar empresa via instancia_evolution
    const { data: config } = await sb
      .from('fluxa_empresas_config')
      .select('nome_empresa')
      .eq('instancia_evolution', instancia)
      .single()

    if (!config) return NextResponse.json({ ok: false, error: `Instância "${instancia}" não encontrada` }, { status: 404 })

    // 2. Buscar company_id pelo nome da empresa
    const { data: company } = await sb
      .from('companies')
      .select('id, company_name')
      .ilike('company_name', `%${config.nome_empresa}%`)
      .single()

    if (!company) return NextResponse.json({ ok: false, error: `Empresa "${config.nome_empresa}" não encontrada no CRM` }, { status: 404 })

    const company_id = company.id
    const nota_texto = resumo ? `🤖 Eli: ${resumo}` : `📱 Contato via ${origem || 'whatsapp'}`

    // 3. Verificar se lead já existe nessa empresa
    const { data: existing } = await sb
      .from('leads')
      .select('id, nome, pipeline_stage')
      .eq('company_id', company_id)
      .eq('telefone', telefone)
      .single()

    if (existing) {
      // Atualizar stage se solicitado
      if (atualizar?.pipeline_stage) {
        await sb.from('leads')
          .update({ pipeline_stage: atualizar.pipeline_stage, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      }
      // Adicionar nota com resumo da conversa
      await sb.from('lead_notes').insert({
        company_id,
        lead_id: existing.id,
        note: nota_texto,
        user_name: 'Eli (IA)'
      })
      return NextResponse.json({
        ok: true, action: 'lead_atualizado', lead_id: existing.id,
        company: company.company_name,
        message: `Lead "${existing.nome}" atualizado`
      })
    }

    // 4. Criar novo lead na empresa correta
    const { data: lead, error: leadErr } = await sb.from('leads').insert({
      company_id,
      nome: nome || `Lead ${telefone}`,
      telefone,
      origem: origem || 'whatsapp',
      pipeline_stage: 'Novo Lead',
      nivel_interesse: 3,
      status: 'ativo',
      valor_estimado: 0,
      observacoes: servico ? `Serviço de interesse: ${servico}` : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select().single()

    if (leadErr) return NextResponse.json({ ok: false, error: leadErr.message }, { status: 500 })

    // 5. Nota inicial com resumo da Eli
    await sb.from('lead_notes').insert({
      company_id,
      lead_id: lead.id,
      note: nota_texto,
      user_name: 'Eli (IA)'
    })

    return NextResponse.json({
      ok: true, action: 'lead_criado', lead_id: lead.id,
      company: company.company_name,
      message: `Lead criado: ${lead.nome} → ${company.company_name}`
    })

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
