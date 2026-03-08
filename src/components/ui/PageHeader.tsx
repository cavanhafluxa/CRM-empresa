'use client'

import { Bell } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.06] bg-slate-950/60 backdrop-blur-xl shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="relative w-9 h-9 rounded-xl border border-white/8 bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </button>
      </div>
    </div>
  )
}
