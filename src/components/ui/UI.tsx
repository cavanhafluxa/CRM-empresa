'use client'

import { X, CheckCircle, AlertCircle, Bell } from 'lucide-react'
import { Toast } from '@/types'
import { cn } from '@/lib/utils'

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-white/5', className)} />
}

// ── Avatar ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const AVATAR_SIZES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
}

export function Avatar({
  name,
  size = 'md',
  color,
}: {
  name: string
  size?: AvatarSize
  color?: string
}) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const bg =
    color ||
    `hsl(${(initials.charCodeAt(0) * 37) % 360}, 60%, 45%)`

  return (
    <div
      className={cn(
        AVATAR_SIZES[size],
        'rounded-xl flex items-center justify-center font-bold shrink-0',
      )}
      style={{ background: bg, color: '#fff' }}
    >
      {initials}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet'

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger:  'bg-red-500/15 text-red-400 border-red-500/30',
  info:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  violet:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        BADGE_VARIANTS[variant],
      )}
    >
      {children}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: keyof typeof MODAL_SIZES
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden',
          MODAL_SIZES[size],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
        >
          Excluir
        </button>
      </div>
    </Modal>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: number) => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl border animate-slide-in-right',
            t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : t.type === 'error'
              ? 'bg-red-950/90 border-red-500/30 text-red-300'
              : 'bg-slate-900/90 border-slate-700/50 text-slate-300',
          )}
        >
          {t.type === 'success' ? (
            <CheckCircle size={16} />
          ) : t.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <Bell size={16} />
          )}
          {t.message}
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Form Fields ───────────────────────────────────────────────────────────────

interface InputProps {
  label?: string
  value: string | number | undefined
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  icon?: React.ElementType
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon: Icon,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600',
            'focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all',
            Icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5',
          )}
        />
      </div>
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string | undefined
  onChange: (v: string) => void
  options: SelectOption[]
  required?: boolean
}

export function Select({ label, value, onChange, options, required }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 transition-all appearance-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface TextareaProps {
  label?: string
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400">{label}</label>
      )}
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 resize-none transition-all"
      />
    </div>
  )
}
