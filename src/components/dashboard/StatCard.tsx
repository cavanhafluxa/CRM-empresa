'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/UI'

interface StatCardProps {
  title: string
  value: string
  change?: number
  icon: React.ElementType
  color: string
  loading?: boolean
}

export function StatCard({ title, value, change, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br ${color} relative overflow-hidden group hover:border-white/[0.12] transition-all`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Icon size={16} className="text-white" />
          </div>
          {change !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {change >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-24 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
        )}
        <p className="text-xs text-white/60">{title}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/[0.04]" />
    </div>
  )
}
