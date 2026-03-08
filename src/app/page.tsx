'use client'

import { useState, useCallback } from 'react'
import {
  LayoutDashboard, GitBranch, Users, Calendar, Settings,
  Sun, Moon, LogOut, Bell, Search, Plus, ChevronRight,
  TrendingUp, DollarSign, Target, Activity, MoreHorizontal,
  X, Edit2, Trash2, Eye, Phone, Mail, MessageSquare,
  Check, AlertCircle, ChevronDown, ChevronLeft, Filter,
  Download, FileText, ArrowUp, ArrowDown, Star, Zap,
  Clock, CheckCircle, XCircle, RefreshCw, Upload, User,
  Building2, Hash, BarChart2, PieChart, Layers, Move,
  SlidersHorizontal, CalendarDays, MapPin, Link2, Send,
  Briefcase, ChevronUp, Circle, Home, Menu, Maximize2
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const COMPANIES: Record<string, any> = {
  fluxa:    { id: 'comp_1', name: 'Flüxa Solar',  slug: 'fluxa',    logo: 'FS', color: '#6EE7B7', password: 'fluxa123' },
  vidramax: { id: 'comp_2', name: 'VidraMax',     slug: 'vidramax', logo: 'VM', color: '#93C5FD', password: 'vidra123' },
}

const USERS_DB: Record<string, any> = {
  fluxa:    { id: 'usr_1', company_id: 'comp_1', full_name: 'Matheus Carvalho', display_name: 'Matheus', email: 'matheus@fluxa.com', role: 'founder', avatar: 'MC' },
  vidramax: { id: 'usr_2', company_id: 'comp_2', full_name: 'Ana Lima',         display_name: 'Ana',     email: 'ana@vidramax.com',   role: 'gestor',  avatar: 'AL' },
}

const generateLeads = (companyId: string) => [
  { id: `l1_${companyId}`, company_id: companyId, nome: 'Rafael Mendonça',  telefone: '(11) 98765-4321', email: 'rafael@email.com',   origem: 'Instagram',  servico: 'Fechamento Varanda',  valor_estimado: 8500,  status: 'ativo',   pipeline_stage: 'Qualificado',     nivel_interesse: 4, created_at: '2025-01-15', area: 12.5 },
  { id: `l2_${companyId}`, company_id: companyId, nome: 'Camila Torres',    telefone: '(11) 91234-5678', email: 'camila@email.com',   origem: 'Google Ads', servico: 'Vidro Box Banheiro',  valor_estimado: 3200,  status: 'ativo',   pipeline_stage: 'Reunião Marcada', nivel_interesse: 5, created_at: '2025-01-18', area: 4.2  },
  { id: `l3_${companyId}`, company_id: companyId, nome: 'Fernanda Oliveira',telefone: '(21) 97654-3210', email: 'fernanda@email.com', origem: 'WhatsApp',   servico: 'Espelho Decorativo',  valor_estimado: 1800,  status: 'ativo',   pipeline_stage: 'Novo Lead',       nivel_interesse: 3, created_at: '2025-01-20', area: 2.0  },
  { id: `l4_${companyId}`, company_id: companyId, nome: 'Bruno Almeida',    telefone: '(31) 99887-6543', email: 'bruno@email.com',    origem: 'Indicação',  servico: 'Fachada ACM',         valor_estimado: 24000, status: 'ativo',   pipeline_stage: 'Proposta',        nivel_interesse: 5, created_at: '2025-01-22', area: 48.0 },
  { id: `l5_${companyId}`, company_id: companyId, nome: 'Juliana Costa',    telefone: '(11) 95555-4444', email: 'juliana@email.com',  origem: 'Site',       servico: 'Fechamento Varanda',  valor_estimado: 9800,  status: 'ganho',   pipeline_stage: 'Fechado',         nivel_interesse: 5, created_at: '2025-01-10', area: 14.0 },
  { id: `l6_${companyId}`, company_id: companyId, nome: 'Pedro Santos',     telefone: '(41) 98888-7777', email: 'pedro@email.com',    origem: 'Instagram',  servico: 'Divisória Escritório', valor_estimado: 5600,  status: 'perdido', pipeline_stage: 'Perdido',         nivel_interesse: 2, created_at: '2025-01-08', area: 8.0  },
  { id: `l7_${companyId}`, company_id: companyId, nome: 'Letícia Ferreira', telefone: '(11) 96666-5555', email: 'leticia@email.com',  origem: 'Facebook',   servico: 'Vidro Box Banheiro',  valor_estimado: 2900,  status: 'ativo',   pipeline_stage: 'Qualificado',     nivel_interesse: 4, created_at: '2025-02-01', area: 3.8  },
  { id: `l8_${companyId}`, company_id: companyId, nome: 'Carlos Souza',     telefone: '(11) 94444-3333', email: 'carlos@email.com',   origem: 'Google Ads', servico: 'Fechamento Varanda',  valor_estimado: 11200, status: 'ativo',   pipeline_stage: 'Reunião Marcada', nivel_interesse: 4, created_at: '2025-02-05', area: 16.0 },
]

const PIPELINE_STAGES = ['Novo Lead','Qualificado','Reunião Marcada','Proposta','Fechado','Perdido']
const STAGE_COLORS: Record<string, any> = {
  'Novo Lead':       { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: '#60A5FA' },
  'Qualificado':     { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30',  dot: '#A78BFA' },
  'Reunião Marcada': { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: '#FBBF24' },
  'Proposta':        { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30',  dot: '#FB923C' },
  'Fechado':         { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: '#34D399' },
  'Perdido':         { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30',     dot: '#F87171' },
}
const CHART_DATA = [
  { month: 'Set', leads: 18, conversoes: 4, valor: 42000 },
  { month: 'Out', leads: 24, conversoes: 6, valor: 67000 },
  { month: 'Nov', leads: 19, conversoes: 5, valor: 51000 },
  { month: 'Dez', leads: 31, conversoes: 9, valor: 98000 },
  { month: 'Jan', leads: 28, conversoes: 7, valor: 84000 },
  { month: 'Fev', leads: 35, conversoes: 11, valor: 127000 },
]
const MEETINGS_SEED = (companyId: string) => [
  { id: `m1_${companyId}`, company_id: companyId, title: 'Visita Técnica - Rafael',   event_type: 'visita',     start_at: '2025-02-10T10:00', end_at: '2025-02-10T11:00', status: 'confirmado', description: 'Medir varanda e apresentar amostras' },
  { id: `m2_${companyId}`, company_id: companyId, title: 'Reunião - Bruno Almeida',    event_type: 'reuniao',    start_at: '2025-02-12T14:00', end_at: '2025-02-12T15:00', status: 'pendente',   description: 'Apresentar proposta fachada ACM' },
  { id: `m3_${companyId}`, company_id: companyId, title: 'Instalação - Juliana Costa', event_type: 'instalacao', start_at: '2025-02-15T08:00', end_at: '2025-02-15T17:00', status: 'confirmado', description: 'Instalação fechamento varanda' },
]

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

const Toast = ({ toasts, removeToast }: any) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
    {toasts.map((t: any) => (
      <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl border animate-slide-in-right ${t.type==='success'?'bg-emerald-950/90 border-emerald-500/30 text-emerald-300':t.type==='error'?'bg-red-950/90 border-red-500/30 text-red-300':'bg-slate-900/90 border-slate-700/50 text-slate-300'}`}>
        {t.type==='success'?<CheckCircle size={16}/>:t.type==='error'?<AlertCircle size={16}/>:<Bell size={16}/>}
        {t.message}
        <button onClick={()=>removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={12}/></button>
      </div>
    ))}
  </div>
)

const Skeleton = ({className}:{className?:string}) => <div className={`animate-pulse rounded-lg bg-white/5 ${className}`}/>

const AvatarComp = ({name,size='md',color}:{name:string,size?:string,color?:string}) => {
  const sizes:any = {xs:'w-6 h-6 text-xs',sm:'w-8 h-8 text-xs',md:'w-9 h-9 text-sm',lg:'w-11 h-11 text-base',xl:'w-14 h-14 text-lg'}
  const initials = name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()||'?'
  return <div className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold shrink-0`} style={{background:color||`hsl(${(initials.charCodeAt(0)*37)%360},60%,45%)`,color:'#fff'}}>{initials}</div>
}

const BadgeComp = ({children,variant='default',size='sm'}:{children:any,variant?:string,size?:string}) => {
  const v:any={default:'bg-slate-500/20 text-slate-400 border-slate-500/30',success:'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',warning:'bg-amber-500/15 text-amber-400 border-amber-500/30',danger:'bg-red-500/15 text-red-400 border-red-500/30',info:'bg-blue-500/15 text-blue-400 border-blue-500/30',violet:'bg-violet-500/15 text-violet-400 border-violet-500/30'}
  return <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${size==='sm'?'px-2 py-0.5 text-xs':'px-3 py-1 text-sm'} ${v[variant]}`}>{children}</span>
}

const Modal = ({open,onClose,title,children,size='md'}:any) => {
  if(!open) return null
  const s:any={sm:'max-w-md',md:'max-w-xl',lg:'max-w-2xl',xl:'max-w-4xl'}
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full ${s[size]} bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}

const ConfirmModal = ({open,onClose,onConfirm,title,message}:any) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Cancelar</button>
      <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Excluir</button>
    </div>
  </Modal>
)

const Input = ({label,value,onChange,type='text',placeholder,required,icon:Icon}:any) => (
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-xs font-medium text-slate-400">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
    <div className="relative">
      {Icon&&<Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>}
      <input type={type} value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all ${Icon?'pl-9 pr-3 py-2.5':'px-3 py-2.5'}`}/>
    </div>
  </div>
)

const Select = ({label,value,onChange,options,required}:any) => (
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-xs font-medium text-slate-400">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
    <select value={value??''} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 transition-all appearance-none cursor-pointer">
      {options.map((o:any)=><option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>)}
    </select>
  </div>
)

const Textarea = ({label,value,onChange,placeholder,rows=3}:any) => (
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-xs font-medium text-slate-400">{label}</label>}
    <textarea value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 resize-none transition-all"/>
  </div>
)

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const LoginPage = ({onLogin}:any) => {
  const [slug,setSlug]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const handleLogin = async () => {
    setError(''); setLoading(true)
    await new Promise(r=>setTimeout(r,900))
    const company = COMPANIES[slug.toLowerCase()]
    if(!company||company.password!==password){setError('Empresa ou senha inválidos. Tente: fluxa / fluxa123');setLoading(false);return}
    const user = USERS_DB[slug.toLowerCase()]
    onLogin({company,user})
  }
  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl"/>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"><Zap size={18} className="text-white"/></div>
            <span className="text-2xl font-bold text-white tracking-tight">Flüxa <span className="text-emerald-400">CRM</span></span>
          </div>
          <p className="text-slate-500 text-sm">Acesse o painel da sua empresa</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <h1 className="text-lg font-semibold text-white mb-6">Entrar</h1>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Empresa <span className="text-red-400">*</span></label>
              <div className="relative"><Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input type="text" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="company-slug" className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Senha <span className="text-red-400">*</span></label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            {error&&<div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle size={13}/>{error}</div>}
            <button onClick={handleLogin} disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading?<span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin"/>Autenticando...</span>:'Entrar'}
            </button>
          </div>
          <div className="mt-6 pt-5 border-t border-white/6 text-center">
            <p className="text-xs text-slate-600">Demo: <span className="text-slate-400 font-mono">fluxa</span> / <span className="text-slate-400 font-mono">fluxa123</span></p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-700 mt-6">© 2025 Flüxa · Todos os direitos reservados</p>
      </div>
    </div>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const Sidebar = ({active,setActive,company,user,onLogout,collapsed,setCollapsed,darkMode,setDarkMode}:any) => {
  const nav=[{id:'dashboard',label:'Dashboard',icon:LayoutDashboard},{id:'pipeline',label:'Pipeline',icon:GitBranch},{id:'leads',label:'Leads',icon:Users},{id:'calendar',label:'Calendário',icon:Calendar},{id:'settings',label:'Configurações',icon:Settings}]
  const rc:any={founder:'text-amber-400',gestor:'text-violet-400',colaborador:'text-blue-400'}
  const rl:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  return (
    <aside className={`${collapsed?'w-[68px]':'w-60'} shrink-0 h-screen bg-slate-950/95 border-r border-white/[0.06] flex flex-col transition-all duration-300 relative z-10`}>
      <div className={`flex items-center ${collapsed?'justify-center px-0':'px-5'} h-16 border-b border-white/[0.06] shrink-0`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0"><Zap size={14} className="text-white"/></div>
        {!collapsed&&<span className="ml-2.5 text-base font-bold text-white tracking-tight">Flüxa <span className="text-emerald-400 font-normal text-sm">CRM</span></span>}
        <button onClick={()=>setCollapsed(!collapsed)} className={`${collapsed?'absolute -right-3 top-5':'ml-auto'} w-6 h-6 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors`}>
          {collapsed?<ChevronRight size={12}/>:<ChevronLeft size={12}/>}
        </button>
      </div>
      {!collapsed&&(
        <div className="mx-3 mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:company.color+'33'}}><span style={{color:company.color}}>{company.logo}</span></div>
          <div className="min-w-0"><p className="text-xs font-semibold text-white truncate">{company.name}</p><p className="text-[10px] text-slate-500 truncate">@{company.slug}</p></div>
        </div>
      )}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setActive(id)} title={collapsed?label:undefined} className={`w-full flex items-center gap-3 ${collapsed?'justify-center px-0 py-2.5':'px-3 py-2.5'} rounded-xl text-sm transition-all ${active===id?'bg-emerald-500/15 text-emerald-400':'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>
            <Icon size={17} className="shrink-0"/>
            {!collapsed&&<span className="font-medium">{label}</span>}
            {active===id&&!collapsed&&<div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"/>}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        <button onClick={()=>setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 ${collapsed?'justify-center px-0':'px-3'} py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] text-sm transition-all`}>
          {darkMode?<Sun size={16}/>:<Moon size={16}/>}
          {!collapsed&&<span className="font-medium">{darkMode?'Modo Claro':'Modo Escuro'}</span>}
        </button>
        {!collapsed&&(
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02]">
            <AvatarComp name={user.display_name} size="sm"/>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{user.display_name}</p><p className={`text-[10px] font-medium ${rc[user.role]}`}>{rl[user.role]}</p></div>
            <button onClick={onLogout} className="text-slate-600 hover:text-red-400 transition-colors" title="Sair"><LogOut size={14}/></button>
          </div>
        )}
        {collapsed&&<button onClick={onLogout} className="w-full flex justify-center py-2.5 text-slate-600 hover:text-red-400 transition-colors"><LogOut size={16}/></button>}
      </div>
    </aside>
  )
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

const Header = ({title,subtitle,actions}:any) => (
  <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.06] bg-slate-950/60 backdrop-blur-xl shrink-0">
    <div><h1 className="text-base font-semibold text-white">{title}</h1>{subtitle&&<p className="text-xs text-slate-500">{subtitle}</p>}</div>
    <div className="flex items-center gap-2">
      {actions}
      <button className="relative w-9 h-9 rounded-xl border border-white/8 bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all">
        <Bell size={15}/><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"/>
      </button>
    </div>
  </div>
)

// ─── STAT CARD ────────────────────────────────────────────────────────────────

const StatCard = ({title,value,change,icon:Icon,color,loading}:any) => (
  <div className={`p-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br ${color} relative overflow-hidden group hover:border-white/[0.12] transition-all`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Icon size={16} className="text-white"/></div>
        {change!==undefined&&<span className={`flex items-center gap-0.5 text-xs font-medium ${change>=0?'text-emerald-400':'text-red-400'}`}>{change>=0?<ArrowUp size={11}/>:<ArrowDown size={11}/>}{Math.abs(change)}%</span>}
      </div>
      {loading?<Skeleton className="h-7 w-24 mb-1"/>:<p className="text-2xl font-bold text-white mb-0.5">{value}</p>}
      <p className="text-xs text-white/60">{title}</p>
    </div>
    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/[0.04]"/>
  </div>
)

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const Dashboard = ({leads,company,addToast}:any) => {
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setTimeout(()=>setLoading(false),800)},[]);
  const totalLeads=leads.length
  const fechados=leads.filter((l:any)=>l.pipeline_stage==='Fechado').length
  const conversao=totalLeads?Math.round((fechados/totalLeads)*100):0
  const fechadosLeads=leads.filter((l:any)=>l.pipeline_stage==='Fechado')
  const ticketMedio=fechados?Math.round(fechadosLeads.reduce((s:number,l:any)=>s+l.valor_estimado,0)/fechados):0
  const valorNeg=leads.filter((l:any)=>!['Fechado','Perdido'].includes(l.pipeline_stage)).reduce((s:number,l:any)=>s+l.valor_estimado,0)
  const stageData=PIPELINE_STAGES.map(stage=>({name:stage,value:leads.filter((l:any)=>l.pipeline_stage===stage).length,color:STAGE_COLORS[stage].dot})).filter((d:any)=>d.value>0)
  const CT=({active,payload,label}:any)=>{if(!active||!payload?.length)return null;return(<div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl"><p className="text-slate-400 mb-1 font-medium">{label}</p>{payload.map((p:any,i:number)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}</div>)}
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" subtitle={`Visão geral · ${company.name}`} actions={
        <div className="flex gap-2">
          <button onClick={()=>addToast('Relatório CSV gerado!','success')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs hover:bg-white/5 transition-all"><Download size={13}/>CSV</button>
          <button onClick={()=>addToast('Relatório PDF gerado!','success')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs transition-all"><FileText size={13}/>Gerar Report</button>
        </div>
      }/>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Leads" value={loading?'—':totalLeads} change={12} icon={Users} color="from-blue-600/20 to-blue-900/10" loading={loading}/>
          <StatCard title="Taxa de Conversão" value={loading?'—':`${conversao}%`} change={3} icon={Target} color="from-emerald-600/20 to-emerald-900/10" loading={loading}/>
          <StatCard title="Ticket Médio" value={loading?'—':`R$${ticketMedio.toLocaleString()}`} change={8} icon={DollarSign} color="from-violet-600/20 to-violet-900/10" loading={loading}/>
          <StatCard title="Em Negociação" value={loading?'—':`R$${(valorNeg/1000).toFixed(0)}k`} change={-2} icon={TrendingUp} color="from-amber-600/20 to-amber-900/10" loading={loading}/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="text-sm font-semibold text-white">Evolução de Leads</h3><p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p></div>
              <BadgeComp variant="success">+{CHART_DATA[CHART_DATA.length-1].leads-CHART_DATA[0].leads} leads</BadgeComp>
            </div>
            {loading?<Skeleton className="h-48 w-full"/>:(
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="cLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/><stop offset="95%" stopColor="#34D399" stopOpacity={0}/></linearGradient>
                    <linearGradient id="cConv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/><stop offset="95%" stopColor="#818CF8" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="month" tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="#34D399" strokeWidth={2} fill="url(#cLeads)"/>
                  <Area type="monotone" dataKey="conversoes" name="Conversões" stroke="#818CF8" strokeWidth={2} fill="url(#cConv)"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="mb-4"><h3 className="text-sm font-semibold text-white">Pipeline</h3><p className="text-xs text-slate-500 mt-0.5">Distribuição por etapa</p></div>
            {loading?<Skeleton className="h-40 w-full rounded-full"/>:(
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <RePieChart>
                    <Pie data={stageData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {stageData.map((entry:any,i:number)=><Cell key={i} fill={entry.color}/>)}
                    </Pie>
                    <Tooltip content={({active,payload}:any)=>active&&payload?.length?(<div className="bg-slate-900/95 border border-white/10 rounded-lg px-2.5 py-2 text-xs"><p style={{color:payload[0].payload.color}}>{payload[0].name}: {payload[0].value}</p></div>):null}/>
                  </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {stageData.slice(0,4).map((s:any,i:number)=>(
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:s.color}}/><span className="text-slate-400 truncate max-w-[110px]">{s.name}</span></div>
                      <span className="text-white font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-5"><div><h3 className="text-sm font-semibold text-white">Valor Gerado por Mês</h3><p className="text-xs text-slate-500">R$ em negociações fechadas</p></div></div>
          {loading?<Skeleton className="h-36 w-full"/>:(
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={CHART_DATA} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="month" tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>`${v/1000}k`}/>
                <Tooltip content={({active,payload,label}:any)=>active&&payload?.length?(<div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2 text-xs"><p className="text-slate-400 mb-1">{label}</p><p className="text-emerald-400 font-bold">R${payload[0].value.toLocaleString()}</p></div>):null}/>
                <Bar dataKey="valor" fill="url(#barGrad)" radius={[5,5,0,0]}/>
                <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34D399" stopOpacity={0.9}/><stop offset="100%" stopColor="#0D9488" stopOpacity={0.5}/></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-white mb-4">Leads Recentes</h3>
          <div className="space-y-2.5">
            {leads.slice(0,4).map((lead:any)=>(
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3"><AvatarComp name={lead.nome} size="sm"/><div><p className="text-sm font-medium text-white">{lead.nome}</p><p className="text-xs text-slate-500">{lead.servico} · {lead.origem}</p></div></div>
                <div className="flex items-center gap-3 text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.pipeline_stage]?.bg} ${STAGE_COLORS[lead.pipeline_stage]?.text} ${STAGE_COLORS[lead.pipeline_stage]?.border}`}>{lead.pipeline_stage}</span>
                  <span className="text-sm font-semibold text-white">R${lead.valor_estimado.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LEAD MODAL ───────────────────────────────────────────────────────────────

const LeadModalComp = ({lead,open,onClose,onSave,onDelete,role,addToast}:any) => {
  const [form,setForm]=useState(lead||{})
  const [note,setNote]=useState('')
  const [notes,setNotes]=useState([{id:1,text:'Cliente tem urgência para fechar até o final do mês.',user:'Matheus',created_at:'2025-01-20'}])
  const [confirmDelete,setConfirmDelete]=useState(false)
  useEffect(()=>{if(lead)setForm(lead)},[lead])
  const set=(k:string,v:any)=>setForm((f:any)=>({...f,[k]:v}))
  const canDelete=['founder','gestor'].includes(role)
  const handleSave=()=>{onSave(form);addToast('Lead atualizado com sucesso!','success');onClose()}
  const handleAddNote=()=>{if(!note.trim())return;setNotes((n:any)=>[...n,{id:Date.now(),text:note,user:'Você',created_at:new Date().toISOString().split('T')[0]}]);setNote('');addToast('Anotação adicionada!','success')}
  if(!lead)return null
  return(
    <>
      <Modal open={open} onClose={onClose} title={`Lead · ${lead.nome}`} size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3"><Input label="Nome" value={form.nome} onChange={(v:string)=>set('nome',v)} required icon={User}/><Input label="Telefone" value={form.telefone} onChange={(v:string)=>set('telefone',v)} icon={Phone}/></div>
            <Input label="E-mail" value={form.email} onChange={(v:string)=>set('email',v)} icon={Mail}/>
            <div className="grid grid-cols-2 gap-3"><Input label="Serviço" value={form.servico} onChange={(v:string)=>set('servico',v)} icon={Briefcase}/><Input label="Valor" value={form.valor_estimado} onChange={(v:string)=>set('valor_estimado',Number(v))} type="number" icon={DollarSign}/></div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Etapa" value={form.pipeline_stage} onChange={(v:string)=>set('pipeline_stage',v)} options={PIPELINE_STAGES.map(s=>({value:s,label:s}))}/>
              <Select label="Status" value={form.status} onChange={(v:string)=>set('status',v)} options={[{value:'ativo',label:'Ativo'},{value:'ganho',label:'Ganho'},{value:'perdido',label:'Perdido'},{value:'inativo',label:'Inativo'}]}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Nível de Interesse</label>
              <div className="flex gap-1">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>set('nivel_interesse',n)} className="transition-transform hover:scale-110"><Star size={20} fill={n<=(form.nivel_interesse||0)?'#FBBF24':'none'} stroke={n<=(form.nivel_interesse||0)?'#FBBF24':'#475569'}/></button>)}</div>
            </div>
            <Textarea label="Resumo do Gestor" value={form.resumo_gestor} onChange={(v:string)=>set('resumo_gestor',v)} placeholder="Observações sobre o lead..."/>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2"><MessageSquare size={14}/>Anotações Internas</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {notes.map((n:any)=>(
                <div key={n.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-1"><span className="text-xs font-medium text-slate-300">{n.user}</span><span className="text-[10px] text-slate-600">{n.created_at}</span></div>
                  <p className="text-xs text-slate-400">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea value={note} onChange={setNote} placeholder="Adicionar anotação interna..." rows={3}/>
              <button onClick={handleAddNote} className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/8 text-xs transition-all flex items-center justify-center gap-1.5"><Plus size={13}/>Adicionar anotação</button>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Origem</span><span className="text-slate-300">{lead.origem}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Área</span><span className="text-slate-300">{lead.area}m²</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Criado em</span><span className="text-slate-300">{lead.created_at}</span></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6 pt-5 border-t border-white/[0.06]">
          {canDelete?<button onClick={()=>setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-all"><Trash2 size={14}/>Excluir</button>:<div/>}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Salvar</button>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={confirmDelete} onClose={()=>setConfirmDelete(false)} onConfirm={()=>{onDelete(lead.id);setConfirmDelete(false);onClose();addToast('Lead excluído.','error')}} title="Excluir Lead" message={`Tem certeza que deseja excluir o lead "${lead.nome}"? Esta ação não pode ser desfeita.`}/>
    </>
  )
}

// ─── PIPELINE ─────────────────────────────────────────────────────────────────

const PipelineCard = ({lead,onClick,onDragStart}:any) => {
  const stars=lead.nivel_interesse||0
  return (
    <div draggable onDragStart={(e:any)=>onDragStart(e,lead.id)} onClick={()=>onClick(lead)} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.07] hover:border-white/[0.14] cursor-pointer transition-all hover:shadow-lg hover:shadow-black/30 group active:scale-95 active:opacity-70">
      <div className="flex items-start justify-between mb-2.5"><p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors leading-tight">{lead.nome}</p><MoreHorizontal size={14} className="text-slate-600 shrink-0 ml-1"/></div>
      <p className="text-xs text-slate-500 mb-2.5">{lead.servico}</p>
      <div className="flex items-center justify-between"><span className="text-sm font-bold text-white">R${lead.valor_estimado.toLocaleString()}</span><div className="flex gap-0.5">{[1,2,3,4,5].map(n=><Star key={n} size={10} fill={n<=stars?'#FBBF24':'none'} stroke={n<=stars?'#FBBF24':'#334155'}/>)}</div></div>
      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.05]"><AvatarComp name={lead.nome} size="xs"/><span className="text-[10px] text-slate-600">{lead.origem}</span><span className="ml-auto text-[10px] text-slate-600">{lead.created_at?.split('-').reverse().slice(0,2).join('/')}</span></div>
    </div>
  )
}

const Pipeline = ({leads,setLeads,role,addToast,company}:any) => {
  const [selectedLead,setSelectedLead]=useState(null)
  const [showNew,setShowNew]=useState(false)
  const [newLead,setNewLead]=useState<any>({})
  const [draggedId,setDraggedId]=useState<string|null>(null)
  const [dragOverStage,setDragOverStage]=useState<string|null>(null)
  const handleDragStart=(e:any,id:string)=>{setDraggedId(id);e.dataTransfer.effectAllowed='move'}
  const handleDragOver=(e:any,stage:string)=>{e.preventDefault();setDragOverStage(stage)}
  const handleDrop=(e:any,stage:string)=>{e.preventDefault();if(!draggedId)return;setLeads((ls:any)=>ls.map((l:any)=>l.id===draggedId?{...l,pipeline_stage:stage}:l));addToast(`Lead movido para ${stage}!`,'success');setDraggedId(null);setDragOverStage(null)}
  const handleCreate=()=>{if(!newLead.nome?.trim())return addToast('Nome é obrigatório.','error');const lead={id:`l_${Date.now()}`,company_id:company.id,...newLead,pipeline_stage:newLead.pipeline_stage||'Novo Lead',status:'ativo',nivel_interesse:3,created_at:new Date().toISOString().split('T')[0]};setLeads((ls:any)=>[lead,...ls]);setNewLead({});setShowNew(false);addToast('Lead criado com sucesso!','success')}
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Pipeline" subtitle={`${leads.length} leads · ${company.name}`} actions={<button onClick={()=>setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-500/20"><Plus size={13}/>Novo Lead</button>}/>
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full" style={{minWidth:`${PIPELINE_STAGES.length*240}px`}}>
          {PIPELINE_STAGES.map(stage=>{
            const stageLeads=leads.filter((l:any)=>l.pipeline_stage===stage)
            const stageVal=stageLeads.reduce((s:number,l:any)=>s+l.valor_estimado,0)
            const colors=STAGE_COLORS[stage]
            const isOver=dragOverStage===stage
            return (
              <div key={stage} className={`flex flex-col rounded-2xl border transition-all duration-200 flex-1 min-w-[220px] ${isOver?'border-white/20 bg-white/[0.04]':'border-white/[0.06] bg-white/[0.015]'}`} onDragOver={e=>handleDragOver(e,stage)} onDrop={e=>handleDrop(e,stage)} onDragLeave={()=>setDragOverStage(null)}>
                <div className="p-3.5 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:colors.dot}}/><span className="text-xs font-semibold text-white">{stage}</span></div><span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${colors.bg} ${colors.text}`}>{stageLeads.length}</span></div>
                  <p className="text-[10px] text-slate-600">R${stageVal.toLocaleString()}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stageLeads.map((lead:any)=><PipelineCard key={lead.id} lead={lead} onClick={setSelectedLead} onDragStart={handleDragStart}/>)}
                  {stageLeads.length===0&&(<div className={`flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed ${isOver?'border-white/20 bg-white/[0.03]':'border-white/[0.04]'} transition-all`}><div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center mb-2"><Move size={14} className="text-slate-600"/></div><p className="text-xs text-slate-600">Arraste leads aqui</p></div>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Criar Novo Lead" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Input label="Nome" value={newLead.nome} onChange={(v:string)=>setNewLead((f:any)=>({...f,nome:v}))} required icon={User}/><Input label="Telefone" value={newLead.telefone} onChange={(v:string)=>setNewLead((f:any)=>({...f,telefone:v}))} icon={Phone}/></div>
          <Input label="Serviço" value={newLead.servico} onChange={(v:string)=>setNewLead((f:any)=>({...f,servico:v}))} icon={Briefcase}/>
          <div className="grid grid-cols-2 gap-3"><Input label="Valor Estimado" value={newLead.valor_estimado} onChange={(v:string)=>setNewLead((f:any)=>({...f,valor_estimado:Number(v)}))} type="number" icon={DollarSign}/><Select label="Etapa Inicial" value={newLead.pipeline_stage||'Novo Lead'} onChange={(v:string)=>setNewLead((f:any)=>({...f,pipeline_stage:v}))} options={PIPELINE_STAGES.map(s=>({value:s,label:s}))}/></div>
          <div className="grid grid-cols-2 gap-3"><Select label="Origem" value={newLead.origem} onChange={(v:string)=>setNewLead((f:any)=>({...f,origem:v}))} options={[{value:'Instagram',label:'Instagram'},{value:'Google Ads',label:'Google Ads'},{value:'WhatsApp',label:'WhatsApp'},{value:'Indicação',label:'Indicação'},{value:'Site',label:'Site'},{value:'Facebook',label:'Facebook'}]}/><Input label="E-mail" value={newLead.email} onChange={(v:string)=>setNewLead((f:any)=>({...f,email:v}))} icon={Mail}/></div>
          <div className="flex gap-2 justify-end pt-2"><button onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm">Cancelar</button><button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Criar Lead</button></div>
        </div>
      </Modal>
      <LeadModalComp lead={selectedLead} open={!!selectedLead} onClose={()=>setSelectedLead(null)} onSave={(u:any)=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))} onDelete={(id:string)=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))} role={role} addToast={addToast}/>
    </div>
  )
}

// ─── LEADS TABLE ──────────────────────────────────────────────────────────────

const Leads = ({leads,setLeads,role,addToast,company}:any) => {
  const [search,setSearch]=useState('')
  const [filterStage,setFilterStage]=useState('all')
  const [sortBy,setSortBy]=useState('created_at')
  const [sortDir,setSortDir]=useState('desc')
  const [page,setPage]=useState(1)
  const [selectedLead,setSelectedLead]=useState(null)
  const PER_PAGE=6
  const filtered=leads.filter((l:any)=>(filterStage==='all'||l.pipeline_stage===filterStage)&&(l.nome.toLowerCase().includes(search.toLowerCase())||l.servico?.toLowerCase().includes(search.toLowerCase()))).sort((a:any,b:any)=>{const va=a[sortBy];const vb=b[sortBy];return sortDir==='asc'?(va>vb?1:-1):(va<vb?1:-1)})
  const totalPages=Math.ceil(filtered.length/PER_PAGE)
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE)
  const toggleSort=(col:string)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('asc')}}
  const SortIcon=({col}:any)=>sortBy===col?(sortDir==='asc'?<ChevronUp size={12}/>:<ChevronDown size={12}/>):<ChevronDown size={12} className="opacity-30"/>
  const sv:any={ativo:'info',ganho:'success',perdido:'danger',inativo:'default'}
  const sl:any={ativo:'Ativo',ganho:'Ganho',perdido:'Perdido',inativo:'Inativo'}
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Leads" subtitle={`${filtered.length} registros · ${company.name}`} actions={<button onClick={()=>addToast('Exportando CSV...','success')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs transition-all"><Download size={13}/>Exportar</button>}/>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-60"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar leads..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all"/></div>
          <div className="flex items-center gap-2"><Filter size={13} className="text-slate-500"/><select value={filterStage} onChange={e=>setFilterStage(e.target.value)} className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-300 focus:outline-none focus:border-emerald-500/40 cursor-pointer appearance-none"><option value="all" className="bg-slate-900">Todas as etapas</option>{PIPELINE_STAGES.map(s=><option key={s} value={s} className="bg-slate-900">{s}</option>)}</select></div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden bg-white/[0.01]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                  {[{key:'nome',label:'Nome'},{key:'servico',label:'Serviço'},{key:'pipeline_stage',label:'Etapa'},{key:'valor_estimado',label:'Valor'},{key:'origem',label:'Origem'},{key:'status',label:'Status'},{key:'created_at',label:'Criado em'}].map(col=>(
                    <th key={col.key} onClick={()=>toggleSort(col.key)} className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap">
                      <span className="flex items-center gap-1">{col.label}<SortIcon col={col.key}/></span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-medium text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((lead:any,i:number)=>(
                  <tr key={lead.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i%2===0?'':'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><AvatarComp name={lead.nome} size="sm"/><div><p className="text-sm font-medium text-white">{lead.nome}</p><p className="text-xs text-slate-600">{lead.telefone}</p></div></div></td>
                    <td className="px-4 py-3 text-sm text-slate-400">{lead.servico}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.pipeline_stage]?.bg} ${STAGE_COLORS[lead.pipeline_stage]?.text} ${STAGE_COLORS[lead.pipeline_stage]?.border}`}>{lead.pipeline_stage}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">R${lead.valor_estimado.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{lead.origem}</td>
                    <td className="px-4 py-3"><BadgeComp variant={sv[lead.status]}>{sl[lead.status]}</BadgeComp></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{lead.created_at}</td>
                    <td className="px-4 py-3"><button onClick={()=>setSelectedLead(lead)} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Edit2 size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginated.length===0&&(<div className="flex flex-col items-center justify-center py-16 text-center"><div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3"><Users size={20} className="text-slate-600"/></div><p className="text-sm font-medium text-slate-500">Nenhum lead encontrado</p><p className="text-xs text-slate-600 mt-1">Tente ajustar os filtros</p></div>)}
          {totalPages>1&&(<div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]"><p className="text-xs text-slate-600">{filtered.length} resultados</p><div className="flex items-center gap-1"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-white/8 transition-all"><ChevronLeft size={13}/></button>{Array.from({length:totalPages},(_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${page===i+1?'bg-emerald-500 text-white':'text-slate-500 hover:bg-white/8'}`}>{i+1}</button>)}<button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-white/8 transition-all"><ChevronRight size={13}/></button></div></div>)}
        </div>
      </div>
      <LeadModalComp lead={selectedLead} open={!!selectedLead} onClose={()=>setSelectedLead(null)} onSave={(u:any)=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))} onDelete={(id:string)=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))} role={role} addToast={addToast}/>
    </div>
  )
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

const CalendarView = ({company,addToast}:any) => {
  const [currentDate,setCurrentDate]=useState(new Date(2025,1,1))
  const [meetings,setMeetings]=useState(MEETINGS_SEED(company.id))
  const [showNew,setShowNew]=useState(false)
  const [newMeeting,setNewMeeting]=useState<any>({})
  const [selectedMeeting,setSelectedMeeting]=useState<any>(null)
  const year=currentDate.getFullYear(),month=currentDate.getMonth()
  const monthNames=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const dayNames=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const getMeetingsForDay=(day:number)=>{const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return meetings.filter((m:any)=>m.start_at.startsWith(ds))}
  const etc:any={reuniao:'bg-violet-500/20 text-violet-300 border-violet-500/30',visita:'bg-blue-500/20 text-blue-300 border-blue-500/30',instalacao:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}
  const etl:any={reuniao:'Reunião',visita:'Visita',instalacao:'Instalação'}
  const sc:any={confirmado:'text-emerald-400',pendente:'text-amber-400',cancelado:'text-red-400'}
  const handleCreate=()=>{if(!newMeeting.title?.trim())return addToast('Título é obrigatório.','error');setMeetings((m:any)=>[...m,{id:`m_${Date.now()}`,company_id:company.id,status:'pendente',...newMeeting}]);setNewMeeting({});setShowNew(false);addToast('Evento criado!','success')}
  const weeks:any[]=[];let cells:any[]=[]
  for(let i=0;i<firstDay;i++)cells.push(null)
  for(let d=1;d<=daysInMonth;d++)cells.push(d)
  while(cells.length%7!==0)cells.push(null)
  for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7))
  const today=new Date()
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Calendário" subtitle="Hub de agendamentos" actions={
        <div className="flex gap-2">
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all"><Plus size={13}/>Evento</button>
        </div>
      }/>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.01] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
              <button onClick={()=>setCurrentDate(new Date(year,month-1))} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white"><ChevronLeft size={16}/></button>
              <h3 className="text-sm font-semibold text-white">{monthNames[month]} {year}</h3>
              <button onClick={()=>setCurrentDate(new Date(year,month+1))} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white"><ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-7 border-b border-white/[0.05]">{dayNames.map(d=><div key={d} className="py-2 text-center text-xs font-medium text-slate-600">{d}</div>)}</div>
            <div>
              {weeks.map((week:any,wi:number)=>(
                <div key={wi} className="grid grid-cols-7 border-b border-white/[0.04] last:border-0">
                  {week.map((day:any,di:number)=>{
                    const dm=day?getMeetingsForDay(day):[]
                    const isToday=day&&today.getDate()===day&&today.getMonth()===month&&today.getFullYear()===year
                    return (
                      <div key={di} className={`min-h-[80px] p-1.5 border-r border-white/[0.04] last:border-0 ${day?'hover:bg-white/[0.02]':'opacity-0'} transition-colors`}>
                        {day&&(<>
                          <span className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday?'bg-emerald-500 text-white':'text-slate-500'}`}>{day}</span>
                          <div className="space-y-0.5">
                            {dm.slice(0,2).map((m:any)=><button key={m.id} onClick={()=>setSelectedMeeting(m)} className={`w-full text-left text-[9px] font-medium px-1 py-0.5 rounded border truncate ${etc[m.event_type]||'bg-white/5 text-white border-white/10'} hover:opacity-80 transition-opacity`}>{m.title}</button>)}
                            {dm.length>2&&<p className="text-[9px] text-slate-600 px-1">+{dm.length-2} mais</p>}
                          </div>
                        </>)}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CalendarDays size={14}/>Próximos Eventos</h3>
              <div className="space-y-2.5">
                {meetings.map((m:any)=>(
                  <button key={m.id} onClick={()=>setSelectedMeeting(m)} className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-full mt-1 shrink-0" style={{background:m.event_type==='visita'?'#60A5FA':m.event_type==='reuniao'?'#A78BFA':'#34D399',width:'3px',minHeight:'36px'}}/>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-white truncate">{m.title}</p><p className="text-[10px] text-slate-500 mt-0.5">{etl[m.event_type]} · {m.start_at.split('T')[0]}</p><span className={`text-[10px] font-medium ${sc[m.status]}`}>{m.status}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Novo Evento" size="md">
        <div className="space-y-4">
          <Input label="Título" value={newMeeting.title} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,title:v}))} required icon={Calendar}/>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={newMeeting.event_type||'reuniao'} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,event_type:v}))} options={[{value:'reuniao',label:'Reunião'},{value:'visita',label:'Visita Técnica'},{value:'instalacao',label:'Instalação'}]}/>
            <Select label="Status" value={newMeeting.status||'pendente'} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,status:v}))} options={[{value:'pendente',label:'Pendente'},{value:'confirmado',label:'Confirmado'},{value:'cancelado',label:'Cancelado'}]}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Início" value={newMeeting.start_at} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,start_at:v}))} type="datetime-local"/>
            <Input label="Fim" value={newMeeting.end_at} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,end_at:v}))} type="datetime-local"/>
          </div>
          <Textarea label="Descrição" value={newMeeting.description} onChange={(v:string)=>setNewMeeting((f:any)=>({...f,description:v}))} placeholder="Detalhes do evento..."/>
          <div className="flex gap-2 justify-end"><button onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm">Cancelar</button><button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">Criar Evento</button></div>
        </div>
      </Modal>
      <Modal open={!!selectedMeeting} onClose={()=>setSelectedMeeting(null)} title="Detalhes do Evento" size="sm">
        {selectedMeeting&&(
          <div className="space-y-3">
            <div className={`p-3 rounded-xl border text-xs font-medium ${etc[selectedMeeting.event_type]}`}>{etl[selectedMeeting.event_type]}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Título</span><span className="text-white font-medium">{selectedMeeting.title}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Início</span><span className="text-white">{selectedMeeting.start_at}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-medium ${sc[selectedMeeting.status]}`}>{selectedMeeting.status}</span></div>
              {selectedMeeting.description&&<div className="pt-2 border-t border-white/[0.06]"><p className="text-xs text-slate-500 mb-1">Descrição</p><p className="text-sm text-slate-300">{selectedMeeting.description}</p></div>}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=>{setMeetings((m:any)=>m.map((e:any)=>e.id===selectedMeeting.id?{...e,status:'cancelado'}:e));setSelectedMeeting(null);addToast('Evento cancelado.','error')}} className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">Cancelar</button>
              <button onClick={()=>{setMeetings((m:any)=>m.map((e:any)=>e.id===selectedMeeting.id?{...e,status:'confirmado'}:e));setSelectedMeeting(null);addToast('Evento confirmado!','success')}} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition-all">Confirmar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

const SettingsPage = ({user,company,darkMode,setDarkMode,onLogout,addToast}:any) => {
  const [form,setForm]=useState({display_name:user.display_name,email:user.email})
  const rl:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const rc:any={founder:'bg-amber-500/15 text-amber-400 border-amber-500/30',gestor:'bg-violet-500/15 text-violet-400 border-violet-500/30',colaborador:'bg-blue-500/15 text-blue-400 border-blue-500/30'}
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Configurações" subtitle="Personalize sua conta"/>
      <div className="p-6 max-w-2xl space-y-6">
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          <h3 className="text-sm font-semibold text-white mb-5">Perfil</h3>
          <div className="flex items-start gap-5 mb-6">
            <div className="relative"><AvatarComp name={user.full_name} size="xl"/><button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md"><Upload size={10} className="text-white"/></button></div>
            <div><p className="text-sm font-semibold text-white">{user.full_name}</p><p className="text-xs text-slate-500 mt-0.5">{user.email}</p><div className="mt-2"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rc[user.role]}`}>{rl[user.role]}</span></div></div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Nome de exibição" value={form.display_name} onChange={(v:string)=>setForm((f:any)=>({...f,display_name:v}))} icon={User}/>
            <Input label="E-mail" value={form.email} onChange={(v:string)=>setForm((f:any)=>({...f,email:v}))} icon={Mail} type="email"/>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-slate-400">Cargo (somente leitura)</label><div className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-slate-500">{rl[user.role]}</div></div>
          </div>
          <button onClick={()=>addToast('Perfil atualizado!','success')} className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Salvar alterações</button>
        </div>
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          <h3 className="text-sm font-semibold text-white mb-5">Empresa</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-500 mb-1">Nome</p><p className="text-white font-medium">{company.name}</p></div>
            <div><p className="text-xs text-slate-500 mb-1">Slug</p><p className="text-white font-mono">@{company.slug}</p></div>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          <h3 className="text-sm font-semibold text-white mb-5">Aparência</h3>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-white font-medium">Modo {darkMode?'Escuro':'Claro'}</p><p className="text-xs text-slate-500 mt-0.5">Alterar tema de cores da interface</p></div>
            <button onClick={()=>setDarkMode(!darkMode)} className={`relative w-12 h-6 rounded-full transition-all ${darkMode?'bg-emerald-500':'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${darkMode?'left-7':'left-1'}`}/>
            </button>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.02]">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Sessão</h3>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all"><LogOut size={14}/>Sair da conta</button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function FluxaCRM() {
  const [session,setSession]=useState<any>(null)
  const [activeTab,setActiveTab]=useState('dashboard')
  const [darkMode,setDarkMode]=useState(true)
  const [collapsed,setCollapsed]=useState(false)
  const [leads,setLeads]=useState<any[]>([])
  const [toasts,setToasts]=useState<any[]>([])

  const addToast=useCallback((message:string,type:'success'|'error'|'info'='info')=>{
    const id=Date.now();setToasts(t=>[...t,{id,message,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500)
  },[])
  const removeToast=(id:number)=>setToasts(t=>t.filter(x=>x.id!==id))

  const handleLogin=({company,user}:any)=>{setSession({company,user});setLeads(generateLeads(company.id));addToast(`Bem-vindo, ${user.display_name}! 👋`,'success')}
  const handleLogout=()=>{setSession(null);setLeads([]);setActiveTab('dashboard')}

  if(!session) return <LoginPage onLogin={handleLogin}/>
  const {company,user}=session
  const pages:any={
    dashboard:<Dashboard leads={leads} company={company} addToast={addToast}/>,
    pipeline:<Pipeline leads={leads} setLeads={setLeads} role={user.role} addToast={addToast} company={company}/>,
    leads:<Leads leads={leads} setLeads={setLeads} role={user.role} addToast={addToast} company={company}/>,
    calendar:<CalendarView company={company} addToast={addToast}/>,
    settings:<SettingsPage user={user} company={company} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} addToast={addToast}/>,
  }

  return (
    <div style={{fontFamily:"'DM Sans','Inter',system-ui,sans-serif"}}>
      <div className="flex h-screen w-screen overflow-hidden bg-[#070C18]">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-3xl"/>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-3xl"/>
        </div>
        <Sidebar active={activeTab} setActive={setActiveTab} company={company} user={user} onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} darkMode={darkMode} setDarkMode={setDarkMode}/>
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">{pages[activeTab]}</main>
        <Toast toasts={toasts} removeToast={removeToast}/>
      </div>
    </div>
  )
}
