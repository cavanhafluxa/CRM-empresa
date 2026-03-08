import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PipelineStage } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'Novo Lead',
  'Qualificado',
  'Reunião Marcada',
  'Proposta',
  'Fechado',
  'Perdido',
]

export const STAGE_COLORS: Record<PipelineStage, {
  bg: string; text: string; border: string; dot: string
}> = {
  'Novo Lead':       { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: '#60A5FA' },
  'Qualificado':     { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30',  dot: '#A78BFA' },
  'Reunião Marcada': { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: '#FBBF24' },
  'Proposta':        { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30',  dot: '#FB923C' },
  'Fechado':         { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: '#34D399' },
  'Perdido':         { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30',     dot: '#F87171' },
}

export const MOCK_COMPANIES: Record<string, {
  id: string; name: string; slug: string; logo: string; color: string; password: string
}> = {
  fluxa: {
    id: 'comp_1', name: 'Flüxa Solar', slug: 'fluxa',
    logo: 'FS', color: '#6EE7B7', password: 'fluxa123',
  },
  vidramax: {
    id: 'comp_2', name: 'VidraMax', slug: 'vidramax',
    logo: 'VM', color: '#93C5FD', password: 'vidra123',
  },
}

export const CHART_DATA = [
  { month: 'Set', leads: 18, conversoes: 4, valor: 42000 },
  { month: 'Out', leads: 24, conversoes: 6, valor: 67000 },
  { month: 'Nov', leads: 19, conversoes: 5, valor: 51000 },
  { month: 'Dez', leads: 31, conversoes: 9, valor: 98000 },
  { month: 'Jan', leads: 28, conversoes: 7, valor: 84000 },
  { month: 'Fev', leads: 35, conversoes: 11, valor: 127000 },
]
