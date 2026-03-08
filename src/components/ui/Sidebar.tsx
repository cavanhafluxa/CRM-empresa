'use client'

import {
  LayoutDashboard, GitBranch, Users, Calendar, Settings,
  Sun, Moon, LogOut, ChevronRight, ChevronLeft, Zap,
} from 'lucide-react'
import { Avatar } from './UI'

interface SidebarProps {
  active: string
  setActive: (tab: string) => void
  company: { name: string; slug: string; logo: string; color: string }
  user: { display_name: string; role: string }
  onLogout: () => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline',  label: 'Pipeline',  icon: GitBranch },
  { id: 'leads',     label: 'Leads',     icon: Users },
  { id: 'calendar',  label: 'Calendário', icon: Calendar },
  { id: 'settings',  label: 'Configurações', icon: Settings },
]

const ROLE_COLORS: Record<string, string> = {
  founder:      'text-amber-400',
  gestor:       'text-violet-400',
  colaborador:  'text-blue-400',
}
const ROLE_LABELS: Record<string, string> = {
  founder:     'Founder',
  gestor:      'Gestor',
  colaborador: 'Colaborador',
}

export default function Sidebar({
  active, setActive, company, user, onLogout,
  collapsed, setCollapsed, darkMode, setDarkMode,
}: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-[68px]' : 'w-60'
      } shrink-0 h-screen bg-slate-950/95 border-r border-white/[0.06] flex flex-col transition-all duration-300 relative z-10`}
    >
      {/* Logo */}
      <div
        className={`flex items-center ${
          collapsed ? 'justify-center px-0' : 'px-5'
        } h-16 border-b border-white/[0.06] shrink-0`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="ml-2.5 text-base font-bold text-white tracking-tight">
            Flüxa <span className="text-emerald-400 font-normal text-sm">CRM</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`${
            collapsed ? 'absolute -right-3 top-5' : 'ml-auto'
          } w-6 h-6 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors`}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Company badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: company.color + '33' }}
          >
            <span style={{ color: company.color }}>{company.logo}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{company.name}</p>
            <p className="text-[10px] text-slate-500 truncate">@{company.slug}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            title={collapsed ? label : undefined}
            className={`w-full flex items-center gap-3 ${
              collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
            } rounded-xl text-sm transition-all ${
              active === id
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span className="font-medium">{label}</span>}
            {active === id && !collapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center gap-3 ${
            collapsed ? 'justify-center px-0' : 'px-3'
          } py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] text-sm transition-all`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (
            <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          )}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02]">
            <Avatar name={user.display_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.display_name}</p>
              <p className={`text-[10px] font-medium ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-600 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {collapsed && (
          <button
            onClick={onLogout}
            className="w-full flex justify-center py-2.5 text-slate-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
