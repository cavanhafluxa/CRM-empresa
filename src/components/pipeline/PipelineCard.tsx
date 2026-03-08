'use client'

import { Star, MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui/UI'
import { Lead } from '@/types'

interface PipelineCardProps {
  lead: Lead
  onClick: (lead: Lead) => void
  onDragStart: (e: React.DragEvent, id: string) => void
}

export default function PipelineCard({ lead, onClick, onDragStart }: PipelineCardProps) {
  const stars = lead.nivel_interesse || 0

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={() => onClick(lead)}
      className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.07] hover:border-white/[0.14] cursor-pointer transition-all hover:shadow-lg hover:shadow-black/30 group active:scale-95 active:opacity-70"
    >
      <div className="flex items-start justify-between mb-2.5">
        <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors leading-tight">
          {lead.nome}
        </p>
        <MoreHorizontal size={14} className="text-slate-600 shrink-0 ml-1" />
      </div>
      <p className="text-xs text-slate-500 mb-2.5">{lead.servico}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">
          R${(lead.valor_estimado || 0).toLocaleString('pt-BR')}
        </span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <Star
              key={n}
              size={10}
              fill={n <= stars ? '#FBBF24' : 'none'}
              stroke={n <= stars ? '#FBBF24' : '#334155'}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.05]">
        <Avatar name={lead.nome} size="xs" />
        <span className="text-[10px] text-slate-600">{lead.origem}</span>
        <span className="ml-auto text-[10px] text-slate-600">
          {lead.created_at?.split('-').reverse().slice(0, 2).join('/')}
        </span>
      </div>
    </div>
  )
}
