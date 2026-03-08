'use client'

import { useState, useEffect } from 'react'
import { Star, Plus, MessageSquare, User, Phone, Mail, DollarSign, Briefcase, Trash2 } from 'lucide-react'
import { Modal, ConfirmModal, Input, Select, Textarea } from '@/components/ui/UI'
import { Lead, PipelineStage, LeadStatus } from '@/types'
import { PIPELINE_STAGES } from '@/lib/utils'

interface LeadNote {
  id: number
  text: string
  user: string
  created_at: string
}

interface LeadModalProps {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onSave: (lead: Lead) => void
  onDelete: (id: string) => void
  role: string
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'ativo',   label: 'Ativo' },
  { value: 'ganho',   label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'inativo', label: 'Inativo' },
]

export default function LeadModal({
  lead, open, onClose, onSave, onDelete, role, addToast,
}: LeadModalProps) {
  const [form, setForm] = useState<Lead | null>(lead)
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<LeadNote[]>([
    { id: 1, text: 'Cliente tem urgência para fechar até o final do mês.', user: 'Matheus', created_at: '2025-01-20' },
  ])
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { if (lead) setForm(lead) }, [lead])

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) =>
    setForm(f => f ? { ...f, [k]: v } : f)

  const canDelete = ['founder', 'gestor'].includes(role)

  const handleSave = () => {
    if (!form) return
    onSave(form)
    addToast('Lead atualizado com sucesso!', 'success')
    onClose()
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    setNotes(n => [...n, {
      id: Date.now(), text: note, user: 'Você',
      created_at: new Date().toISOString().split('T')[0],
    }])
    setNote('')
    addToast('Anotação adicionada!', 'success')
  }

  if (!lead || !form) return null

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Lead · ${lead.nome}`} size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required icon={User} />
              <Input label="Telefone" value={form.telefone} onChange={v => set('telefone', v)} icon={Phone} />
            </div>
            <Input label="E-mail" value={form.email} onChange={v => set('email', v)} icon={Mail} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Serviço" value={form.servico} onChange={v => set('servico', v)} icon={Briefcase} />
              <Input label="Valor" value={form.valor_estimado} onChange={v => set('valor_estimado', Number(v))} type="number" icon={DollarSign} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Etapa"
                value={form.pipeline_stage}
                onChange={v => set('pipeline_stage', v as PipelineStage)}
                options={PIPELINE_STAGES.map(s => ({ value: s, label: s }))}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={v => set('status', v as LeadStatus)}
                options={STATUS_OPTIONS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Nível de Interesse</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => set('nivel_interesse', n)} className="transition-transform hover:scale-110">
                    <Star
                      size={20}
                      fill={n <= (form.nivel_interesse || 0) ? '#FBBF24' : 'none'}
                      stroke={n <= (form.nivel_interesse || 0) ? '#FBBF24' : '#475569'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Resumo do Gestor"
              value={form.resumo_gestor}
              onChange={v => set('resumo_gestor', v)}
              placeholder="Observações sobre o lead..."
            />
          </div>

          {/* Right - Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare size={14} /> Anotações Internas
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {notes.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-300">{n.user}</span>
                    <span className="text-[10px] text-slate-600">{n.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-400">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea value={note} onChange={setNote} placeholder="Adicionar anotação interna..." rows={3} />
              <button
                onClick={handleAddNote}
                className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/8 text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Adicionar anotação
              </button>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Origem</span>
                <span className="text-slate-300">{lead.origem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Área</span>
                <span className="text-slate-300">{lead.area}m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Criado em</span>
                <span className="text-slate-300">{lead.created_at}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-5 border-t border-white/[0.06]">
          {canDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-all"
            >
              <Trash2 size={14} /> Excluir
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete(lead.id)
          setConfirmDelete(false)
          onClose()
          addToast('Lead excluído.', 'error')
        }}
        title="Excluir Lead"
        message={`Tem certeza que deseja excluir o lead "${lead.nome}"? Esta ação não pode ser desfeita.`}
      />
    </>
  )
}
