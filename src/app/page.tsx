'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard, GitBranch, Users, Calendar, Settings, LogOut,
  Search, Plus, ChevronRight, ChevronLeft, TrendingUp, DollarSign,
  Target, X, Edit2, Trash2, Phone, Mail, MessageSquare, AlertCircle,
  ChevronDown, Download, FileText, ArrowUp, ArrowDown, Star, Zap,
  CheckCircle, RefreshCw, Upload, User, Building2, Move, Briefcase,
  ChevronUp, Camera, Shield, UserPlus, PenLine, HeadphonesIcon,
  Send, Menu, Eye, EyeOff, Hash, Info, Bell
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// ── Supabase ────────────────────────────────────────────────────
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const N8N = process.env.NEXT_PUBLIC_N8N_WEBHOOK || ''

// ── Helpers ─────────────────────────────────────────────────────
const cx = (...a: any[]) => a.filter(Boolean).join(' ')

const STAGES = ['Novo Lead','Qualificado','Reunião Marcada','Proposta','Fechado','Perdido']
const SM: Record<string,{dot:string,bg:string,text:string,border:string}> = {
  'Novo Lead':       {dot:'#60A5FA',bg:'bg-blue-500/15',   text:'text-blue-400',   border:'border-blue-500/30'},
  'Qualificado':     {dot:'#A78BFA',bg:'bg-violet-500/15', text:'text-violet-400', border:'border-violet-500/30'},
  'Reunião Marcada': {dot:'#FBBF24',bg:'bg-amber-500/15',  text:'text-amber-400',  border:'border-amber-500/30'},
  'Proposta':        {dot:'#FB923C',bg:'bg-orange-500/15', text:'text-orange-400', border:'border-orange-500/30'},
  'Fechado':         {dot:'#34D399',bg:'bg-emerald-500/15',text:'text-emerald-400',border:'border-emerald-500/30'},
  'Perdido':         {dot:'#F87171',bg:'bg-red-500/15',    text:'text-red-400',    border:'border-red-500/30'},
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({toasts,rm}:any){
  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t:any)=>(
        <div key={t.id} className={cx('pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border',
          t.type==='success'?'bg-emerald-950/95 border-emerald-500/30 text-emerald-300':
          t.type==='error'  ?'bg-red-950/95 border-red-500/30 text-red-300':
                             'bg-slate-900/95 border-slate-700 text-slate-300')}>
          {t.type==='success'?<CheckCircle size={14}/>:t.type==='error'?<AlertCircle size={14}/>:<Bell size={14}/>}
          <span className="flex-1 text-xs">{t.message}</span>
          <button onClick={()=>rm(t.id)} className="pointer-events-auto"><X size={12}/></button>
        </div>
      ))}
    </div>
  )
}

function useToast(){
  const [toasts,setToasts]=useState<any[]>([])
  const add=useCallback((message:string,type='info')=>{
    const id=Date.now()
    setToasts(t=>[...t,{id,message,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500)
  },[])
  const rm=(id:number)=>setToasts(t=>t.filter(x=>x.id!==id))
  return {toasts,add,rm}
}

// ── Skeleton ─────────────────────────────────────────────────────
function Sk({className}:{className?:string}){
  return <div className={cx('animate-pulse rounded-lg bg-white/5',className)}/>
}

// ── Avatar ────────────────────────────────────────────────────────
function Av({name,url,size='md'}:{name:string,url?:string,size?:string}){
  const s:any={xs:'w-6 h-6 text-[10px]',sm:'w-8 h-8 text-xs',md:'w-9 h-9 text-sm',lg:'w-11 h-11 text-base',xl:'w-14 h-14 text-xl'}
  const init=(name||'?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()
  const bg=`hsl(${(init.charCodeAt(0)*43)%360},55%,40%)`
  if(url) return <img src={url} className={cx(s[size],'rounded-xl object-cover shrink-0')} alt={name}/>
  return <div className={cx(s[size],'rounded-xl flex items-center justify-center font-bold shrink-0 text-white')} style={{background:bg}}>{init}</div>
}

// ── Badge ─────────────────────────────────────────────────────────
function Bdg({children,v='default'}:any){
  const vs:any={
    default:'bg-slate-500/20 text-slate-400 border-slate-500/30',
    success:'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning:'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    info:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  }
  return <span className={cx('inline-flex items-center gap-1 border rounded-full font-medium px-2 py-0.5 text-xs',vs[v])}>{children}</span>
}

// ── Modal ─────────────────────────────────────────────────────────
function Modal({open,onClose,title,children,size='md'}:any){
  if(!open) return null
  const s:any={sm:'max-w-sm',md:'max-w-lg',lg:'max-w-2xl'}
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className={cx('relative w-full bg-slate-900 border border-white/10 shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col',s[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"><X size={15}/></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm ────────────────────────────────────────────────────────
function Confirm({open,onClose,onOk,title,msg}:any){
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-400 text-sm mb-5">{msg}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
        <button onClick={onOk} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium">Confirmar</button>
      </div>
    </Modal>
  )
}

// ── Field / Select / Textarea ─────────────────────────────────────
function Field({label,value,onChange,type='text',placeholder,required,icon:Icon,disabled}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-xs font-medium text-slate-400">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
      <div className="relative">
        {Icon&&<Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>}
        <input type={type} value={value??''} onChange={e=>onChange&&onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          className={cx('w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all py-2.5',
            Icon?'pl-9 pr-3':'px-3',disabled&&'opacity-50 cursor-not-allowed')}/>
      </div>
    </div>
  )
}
function Sel({label,value,onChange,options,required}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-xs font-medium text-slate-400">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
      <select value={value??''} onChange={e=>onChange(e.target.value)}
        className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 appearance-none cursor-pointer">
        {options.map((o:any)=><option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>)}
      </select>
    </div>
  )
}
function Textarea({label,value,onChange,placeholder,rows=3}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-xs font-medium text-slate-400">{label}</label>}
      <textarea value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 resize-none"/>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────
function Header({title,subtitle,actions,onMenu}:any){
  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="sm:hidden w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400"><Menu size={18}/></button>
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">{title}</h1>
          {subtitle&&<p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════
function Login({onLogin}:any){
  const [slug,setSlug]=useState('')
  const [user,setUser]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const [show,setShow]=useState(false)

  const handle=async()=>{
    setErr('');setLoading(true)
    try{
      const {data:co,error:ce}=await sb.from('companies').select('*').eq('company_slug',slug.trim().toLowerCase()).eq('crm_active',true).single()
      if(ce||!co){setErr('Empresa não encontrada.');setLoading(false);return}
      // Try user credentials
      const {data:usr}=await sb.from('users').select('*').eq('company_id',co.id).eq('username',user.trim()).eq('password_hash',pass).eq('active',true).single()
      if(usr){onLogin({company:co,user:usr});setLoading(false);return}
      // Try company-level auth
      const {data:auth}=await sb.from('company_auth').select('*').eq('company_slug',slug.trim().toLowerCase()).eq('active',true).single()
      if(auth&&auth.password_hash===pass){
        const {data:fu}=await sb.from('users').select('*').eq('company_id',co.id).in('role',['founder','gestor']).eq('active',true).order('created_at').limit(1).single()
        if(fu){onLogin({company:co,user:fu});setLoading(false);return}
      }
      setErr('Usuário ou senha inválidos.')
    }catch{setErr('Erro de conexão.')}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl pointer-events-none"/>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Zap size={18} className="text-white"/>
            </div>
            <span className="text-xl font-bold text-white">Flüxa <span className="text-emerald-400">CRM</span></span>
          </div>
          <p className="text-slate-500 text-xs">Acesse o painel da sua empresa</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl">
          <div className="space-y-3">
            <Field label="Empresa" value={slug} onChange={setSlug} placeholder="company-slug" required icon={Building2}/>
            <Field label="Usuário" value={user} onChange={setUser} placeholder="seu-usuario" required icon={User}/>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Senha <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handle()}
                  className="w-full pl-3 pr-9 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
            {err&&<div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle size={13}/>{err}</div>}
            <button onClick={handle} disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60">
              {loading?<span className="flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin"/>Entrando...</span>:'Entrar'}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-700 mt-4">Demo: <span className="text-slate-500">fluxa</span> · <span className="text-slate-500">eliezer</span> · <span className="text-slate-500">fluxa123</span></p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════
function Sidebar({active,setActive,company,user,onLogout,open,setOpen,dark,setDark}:any){
  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RC:any={founder:'text-amber-400',gestor:'text-violet-400',colaborador:'text-blue-400'}
  const nav=[
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
    {id:'pipeline', label:'Pipeline',  icon:GitBranch},
    {id:'leads',    label:'Leads',     icon:Users},
    {id:'calendar', label:'Calendário',icon:Calendar},
    {id:'colaboradores',label:'Colaboradores',icon:Shield},
    {id:'settings', label:'Configurações',icon:Settings},
    {id:'suporte',  label:'Suporte',   icon:HeadphonesIcon},
  ]
  const inner=(
    <div className="flex flex-col h-full bg-slate-950 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.06] shrink-0">
        {company.company_logo_url
          ?<img src={company.company_logo_url} className="w-8 h-8 rounded-lg object-contain" alt="logo"/>
          :<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0"><Zap size={14} className="text-white"/></div>
        }
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{company.company_name}</p>
          <p className="text-[10px] text-slate-600">@{company.company_slug}</p>
        </div>
        <button onClick={()=>setOpen(false)} className="sm:hidden text-slate-500 hover:text-white"><X size={16}/></button>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>{setActive(id);setOpen(false)}}
            className={cx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              active===id?'bg-emerald-500/15 text-emerald-400':'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]')}>
            <Icon size={16} className="shrink-0"/>
            <span className="font-medium">{label}</span>
            {active===id&&<div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"/>}
          </button>
        ))}
      </nav>
      {/* Bottom */}
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        <button onClick={()=>setDark((d:boolean)=>!d)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] text-sm">
          <span className="text-base">{dark?'☀️':'🌙'}</span>
          <span className="font-medium text-sm">{dark?'Modo Claro':'Modo Escuro'}</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02]">
          <Av name={user.display_name||user.full_name} size="sm" url={user.avatar_url}/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.display_name||user.full_name}</p>
            <p className={cx('text-[10px] font-medium',RC[user.role])}>{RL[user.role]}</p>
          </div>
          <button onClick={onLogout} className="text-slate-600 hover:text-red-400 transition-colors"><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  )
  return (
    <>
      <aside className="hidden sm:flex w-56 shrink-0 h-screen flex-col">{inner}</aside>
      {open&&(
        <div className="sm:hidden fixed inset-0 z-[150]">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64">{inner}</div>
        </div>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════
function Dashboard({leads,company,addToast}:any){
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setTimeout(()=>setLoading(false),500)},[])

  const total=leads.length
  const fechados=leads.filter((l:any)=>l.pipeline_stage==='Fechado')
  const conv=total?Math.round((fechados.length/total)*100):0
  const ticket=fechados.length?Math.round(fechados.reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)/fechados.length):0
  const negoc=leads.filter((l:any)=>!['Fechado','Perdido'].includes(l.pipeline_stage)).reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)

  // REAL chart data from actual leads
  const chartData=Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-5+i)
    const y=d.getFullYear(),m=d.getMonth()
    const ml=leads.filter((l:any)=>{const ld=new Date(l.created_at);return ld.getFullYear()===y&&ld.getMonth()===m})
    const lbl=d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')
    return {
      month:lbl.charAt(0).toUpperCase()+lbl.slice(1),
      leads:ml.length,
      conversoes:ml.filter((l:any)=>l.pipeline_stage==='Fechado').length,
    }
  })

  const stageData=STAGES.map(s=>({name:s,value:leads.filter((l:any)=>l.pipeline_stage===s).length,color:SM[s]?.dot||'#888'})).filter(d=>d.value>0)

  const exportCSV=()=>{
    const rows=[['Nome','Telefone','Serviço','Valor','Etapa','Status','Criado'],
      ...leads.map((l:any)=>[l.nome,l.telefone||'',l.servico||'',l.valor_estimado||0,l.pipeline_stage,l.status,l.created_at?.split('T')[0]||''])]
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download='leads.csv';a.click()
    addToast('CSV exportado!','success')
  }

  const exportReport=()=>{
    const txt=`RELATÓRIO FLÜXA CRM\nEmpresa: ${company.company_name}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nTotal Leads: ${total}\nConversão: ${conv}%\nTicket Médio: R$${ticket.toLocaleString('pt-BR')}\nEm Negociação: R$${negoc.toLocaleString('pt-BR')}\n\nLEADS:\n${leads.map((l:any)=>`- ${l.nome} | ${l.pipeline_stage} | R$${l.valor_estimado||0}`).join('\n')}`
    const a=document.createElement('a');a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(txt);a.download='relatorio-fluxa.txt';a.click()
    addToast('Relatório exportado!','success')
  }

  const CT=({active,payload,label}:any)=>{
    if(!active||!payload?.length) return null
    return <div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl"><p className="text-slate-400 mb-1">{label}</p>{payload.map((p:any,i:number)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}</div>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" subtitle={company.company_name} actions={
        <div className="flex gap-1.5">
          <button onClick={exportCSV} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs"><Download size={12}/>CSV</button>
          <button onClick={exportReport} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs"><FileText size={12}/>Report</button>
        </div>
      }/>
      <div className="p-4 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {label:'Total Leads',val:loading?'—':String(total),      icon:Users,       color:'from-blue-600/20 to-blue-900/10',   change:'+real'},
            {label:'Conversão',  val:loading?'—':`${conv}%`,         icon:Target,      color:'from-emerald-600/20 to-emerald-900/10',change:'+real'},
            {label:'Ticket Médio',val:loading?'—':`R$${ticket.toLocaleString()}`,icon:DollarSign,color:'from-violet-600/20 to-violet-900/10',change:'+real'},
            {label:'Negociação', val:loading?'—':`R$${(negoc/1000).toFixed(0)}k`,icon:TrendingUp,color:'from-amber-600/20 to-amber-900/10',  change:'+real'},
          ].map(({label,val,icon:Icon,color})=>(
            <div key={label} className={cx('p-4 rounded-2xl border border-white/[0.07] bg-gradient-to-br',color)}>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2"><Icon size={14} className="text-white"/></div>
              {loading?<Sk className="h-6 w-16 mb-1"/>:<p className="text-lg font-bold text-white">{val}</p>}
              <p className="text-[10px] text-white/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Real chart */}
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-1">Evolução de Leads</p>
          <p className="text-[10px] text-slate-600 mb-3">Últimos 6 meses — dados reais</p>
          {loading?<Sk className="h-36"/>:(
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="month" tick={{fill:'#64748B',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748B',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CT/>}/>
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#34D399" strokeWidth={2} fill="url(#g1)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
          {leads.length===0&&!loading&&<p className="text-center text-xs text-slate-600 -mt-20 relative">Nenhum lead ainda. Crie leads na Pipeline!</p>}
        </div>

        {/* Donut */}
        {stageData.length>0&&(
          <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-xs font-semibold text-white mb-3">Pipeline por Etapa</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart><Pie data={stageData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">
                  {stageData.map((e:any,i:number)=><Cell key={i} fill={e.color}/>)}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {stageData.map((s:any,i:number)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/><span className="text-slate-400 text-[11px] truncate">{s.name}</span></div>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent */}
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-3">Leads Recentes</p>
          <div className="space-y-2">
            {leads.slice(0,5).map((l:any)=>{
              const m=SM[l.pipeline_stage]||SM['Novo Lead']
              return (
                <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03]">
                  <Av name={l.nome} size="sm"/>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-white truncate">{l.nome}</p><p className="text-[10px] text-slate-500 truncate">{l.servico||'—'}</p></div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white">R${(l.valor_estimado||0).toLocaleString()}</p>
                    <span className={cx('text-[9px] font-medium px-1.5 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span>
                  </div>
                </div>
              )
            })}
            {leads.length===0&&<p className="text-xs text-slate-600 text-center py-4">Nenhum lead ainda</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEAD MODAL
// ══════════════════════════════════════════════════════════════════
function LeadModal({lead,open,onClose,onSave,onDelete,role,addToast,funnels,companyId}:any){
  const [form,setForm]=useState<any>({})
  const [notes,setNotes]=useState<any[]>([])
  const [note,setNote]=useState('')
  const [delConfirm,setDelConfirm]=useState(false)
  const [saving,setSaving]=useState(false)
  const canDel=['founder','gestor'].includes(role)

  useEffect(()=>{if(lead){setForm({...lead});loadNotes(lead.id)}},[lead?.id])

  const loadNotes=async(lid:string)=>{
    const {data}=await sb.from('lead_notes').select('*').eq('lead_id',lid).order('created_at',{ascending:false})
    if(data) setNotes(data)
  }

  const set=(k:string,v:any)=>setForm((f:any)=>({...f,[k]:v}))

  const save=async()=>{
    if(!form.nome?.trim()){addToast('Nome é obrigatório.','error');return}
    setSaving(true)
    const {error}=await sb.from('leads').update({
      nome:form.nome,telefone:form.telefone,email:form.email,
      servico:form.servico,valor_estimado:Number(form.valor_estimado)||0,
      pipeline_stage:form.pipeline_stage,status:form.status,
      nivel_interesse:form.nivel_interesse,resumo_gestor:form.resumo_gestor,
      funnel_id:form.funnel_id||null,updated_at:new Date().toISOString()
    }).eq('id',lead.id)
    setSaving(false)
    if(error){addToast('Erro ao salvar: '+error.message,'error');return}
    onSave({...lead,...form})
    addToast('Lead salvo!','success')
    onClose()
  }

  const deleteLead=async()=>{
    const {error}=await sb.from('leads').delete().eq('id',lead.id)
    if(error){addToast('Erro ao excluir: '+error.message,'error');return}
    onDelete(lead.id)
    addToast('Lead excluído.','success')
    setDelConfirm(false)
    onClose()
  }

  const addNote=async()=>{
    if(!note.trim()) return
    const {data,error}=await sb.from('lead_notes').insert({company_id:companyId,lead_id:lead.id,note:note.trim(),user_name:'Você'}).select().single()
    if(!error&&data){setNotes(n=>[data,...n]);setNote('');addToast('Nota adicionada!','success')}
  }

  if(!lead) return null
  return (
    <>
      <Modal open={open} onClose={onClose} title={lead.nome} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" value={form.nome} onChange={(v:string)=>set('nome',v)} required icon={User}/>
            <Field label="Telefone" value={form.telefone} onChange={(v:string)=>set('telefone',v)} icon={Phone}/>
          </div>
          <Field label="E-mail" value={form.email} onChange={(v:string)=>set('email',v)} icon={Mail}/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Serviço" value={form.servico} onChange={(v:string)=>set('servico',v)} icon={Briefcase}/>
            <Field label="Valor (R$)" value={form.valor_estimado} onChange={(v:string)=>set('valor_estimado',v)} type="number" icon={DollarSign}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Etapa" value={form.pipeline_stage} onChange={(v:string)=>set('pipeline_stage',v)} options={STAGES.map(s=>({value:s,label:s}))}/>
            <Sel label="Status" value={form.status} onChange={(v:string)=>set('status',v)} options={[{value:'ativo',label:'Ativo'},{value:'ganho',label:'Ganho'},{value:'perdido',label:'Perdido'},{value:'inativo',label:'Inativo'}]}/>
          </div>
          {funnels?.length>0&&(
            <Sel label="Funil" value={form.funnel_id||''} onChange={(v:string)=>set('funnel_id',v)} options={[{value:'',label:'Sem funil'},...funnels.map((f:any)=>({value:f.id,label:f.name}))]}/>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Nível de Interesse</label>
            <div className="flex gap-1">{[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>set('nivel_interesse',n)}>
                <Star size={22} fill={n<=(form.nivel_interesse||0)?'#FBBF24':'none'} stroke={n<=(form.nivel_interesse||0)?'#FBBF24':'#475569'}/>
              </button>
            ))}</div>
          </div>
          <Textarea label="Observações do gestor" value={form.resumo_gestor} onChange={(v:string)=>set('resumo_gestor',v)} placeholder="Notas internas..."/>
          {/* Notes */}
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5"><MessageSquare size={13}/>Anotações</p>
            <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
              {notes.map((n:any)=>(
                <div key={n.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-medium text-slate-300">{n.user_name||'Sistema'}</span>
                    <span className="text-[10px] text-slate-600">{n.created_at?.split('T')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-400">{n.note}</p>
                </div>
              ))}
              {notes.length===0&&<p className="text-xs text-slate-600 text-center py-2">Sem anotações</p>}
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Nova anotação..." onKeyDown={e=>e.key==='Enter'&&addNote()}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              <button onClick={addNote} className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"><Send size={13}/></button>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-5 pt-4 border-t border-white/[0.06]">
          {canDel
            ?<button onClick={()=>setDelConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm"><Trash2 size={13}/>Excluir</button>
            :<div/>
          }
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">
              {saving?'Salvando...':'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
      <Confirm open={delConfirm} onClose={()=>setDelConfirm(false)} onOk={deleteLead} title="Excluir Lead" msg={`Excluir "${lead.nome}"? Esta ação não pode ser desfeita.`}/>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// PIPELINE
// ══════════════════════════════════════════════════════════════════
function Pipeline({leads,setLeads,role,addToast,company,funnels}:any){
  const [selected,setSelected]=useState<any>(null)
  const [showNew,setShowNew]=useState(false)
  const [newLead,setNewLead]=useState<any>({pipeline_stage:'Novo Lead',nivel_interesse:3})
  const [dragId,setDragId]=useState<string|null>(null)
  const [dragOver,setDragOver]=useState<string|null>(null)
  const [filterFunnel,setFilterFunnel]=useState('all')
  const [colLabels,setColLabels]=useState<Record<string,string>>({})
  const [editCol,setEditCol]=useState<string|null>(null)
  const [editVal,setEditVal]=useState('')
  const [creating,setCreating]=useState(false)
  const canEdit=['founder','gestor'].includes(role)

  useEffect(()=>{
    sb.from('pipeline_columns').select('*').eq('company_id',company.id).then(({data})=>{
      if(data){const m:any={};data.forEach((r:any)=>{m[r.stage_key]=r.label});setColLabels(m)}
    })
  },[company.id])

  const lbl=(s:string)=>colLabels[s]||s
  const saveCol=async(stage:string,label:string)=>{
    if(!canEdit||!label.trim()) return setEditCol(null)
    await sb.from('pipeline_columns').upsert({company_id:company.id,stage_key:stage,label:label.trim()},{onConflict:'company_id,stage_key'})
    setColLabels(p=>({...p,[stage]:label.trim()}));setEditCol(null);addToast('Coluna renomeada!','success')
  }

  const filtered=filterFunnel==='all'?leads:leads.filter((l:any)=>l.funnel_id===filterFunnel)

  const drop=async(stage:string)=>{
    if(!dragId) return
    const {error}=await sb.from('leads').update({pipeline_stage:stage,updated_at:new Date().toISOString()}).eq('id',dragId)
    if(!error) setLeads((ls:any)=>ls.map((l:any)=>l.id===dragId?{...l,pipeline_stage:stage}:l))
    setDragId(null);setDragOver(null)
  }

  const create=async()=>{
    if(!newLead.nome?.trim()){addToast('Nome é obrigatório.','error');return}
    setCreating(true)
    const {data,error}=await sb.from('leads').insert({
      company_id:company.id,...newLead,
      valor_estimado:Number(newLead.valor_estimado)||0,
      status:'ativo',
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro ao criar: '+error.message,'error');return}
    setLeads((ls:any)=>[data,...ls])
    setNewLead({pipeline_stage:'Novo Lead',nivel_interesse:3})
    setShowNew(false);addToast('Lead criado!','success')
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Pipeline" subtitle={`${filtered.length} leads`} actions={
        <div className="flex gap-2 items-center">
          {funnels?.length>0&&(
            <select value={filterFunnel} onChange={e=>setFilterFunnel(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none">
              <option value="all" className="bg-slate-900">Todos funis</option>
              {funnels.map((f:any)=><option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>)}
            </select>
          )}
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"><Plus size={13}/>Lead</button>
        </div>
      }/>
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex gap-2.5 h-full" style={{minWidth:`${STAGES.length*185}px`}}>
          {STAGES.map(stage=>{
            const sl=filtered.filter((l:any)=>l.pipeline_stage===stage)
            const sv=sl.reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)
            const m=SM[stage]
            const isOver=dragOver===stage
            return (
              <div key={stage}
                className={cx('flex flex-col rounded-2xl border transition-all flex-1 min-w-[170px]',isOver?'border-white/20 bg-white/[0.05]':'border-white/[0.06] bg-white/[0.015]')}
                onDragOver={e=>{e.preventDefault();setDragOver(stage)}}
                onDrop={()=>drop(stage)}
                onDragLeave={()=>setDragOver(null)}>
                <div className="p-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{background:m.dot}}/>
                    {editCol===stage&&canEdit?(
                      <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                        onBlur={()=>saveCol(stage,editVal)} onKeyDown={e=>{if(e.key==='Enter')saveCol(stage,editVal);if(e.key==='Escape')setEditCol(null)}}
                        className="flex-1 bg-transparent text-white text-xs font-semibold focus:outline-none border-b border-emerald-500/60 min-w-0"/>
                    ):(
                      <span className="text-xs font-semibold text-white truncate flex-1">{lbl(stage)}</span>
                    )}
                    {canEdit&&<button onClick={()=>{setEditCol(stage);setEditVal(lbl(stage))}} className="text-slate-600 hover:text-slate-300 shrink-0"><PenLine size={10}/></button>}
                    <span className={cx('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0',m.bg,m.text)}>{sl.length}</span>
                  </div>
                  <p className="text-[10px] text-slate-600">R${sv.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {sl.map((lead:any)=>(
                    <div key={lead.id} draggable onDragStart={()=>setDragId(lead.id)} onClick={()=>setSelected(lead)}
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.07] hover:border-white/[0.15] cursor-pointer transition-all active:scale-95">
                      <p className="text-xs font-semibold text-white mb-1 leading-tight">{lead.nome}</p>
                      <p className="text-[10px] text-slate-500 mb-2">{lead.servico||'—'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">R${(lead.valor_estimado||0).toLocaleString()}</span>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(n=><Star key={n} size={9} fill={n<=(lead.nivel_interesse||0)?'#FBBF24':'none'} stroke={n<=(lead.nivel_interesse||0)?'#FBBF24':'#334155'}/>)}</div>
                      </div>
                    </div>
                  ))}
                  {sl.length===0&&(
                    <div className={cx('flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed',isOver?'border-white/20':'border-white/[0.04]')}>
                      <Move size={14} className="text-slate-700 mb-1"/><p className="text-[10px] text-slate-700">Arraste aqui</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Novo Lead" size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" value={newLead.nome} onChange={(v:string)=>setNewLead((f:any)=>({...f,nome:v}))} required icon={User}/>
            <Field label="Telefone" value={newLead.telefone} onChange={(v:string)=>setNewLead((f:any)=>({...f,telefone:v}))} icon={Phone}/>
          </div>
          <Field label="Serviço" value={newLead.servico} onChange={(v:string)=>setNewLead((f:any)=>({...f,servico:v}))} icon={Briefcase}/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" value={newLead.valor_estimado} onChange={(v:string)=>setNewLead((f:any)=>({...f,valor_estimado:v}))} type="number" icon={DollarSign}/>
            <Sel label="Etapa" value={newLead.pipeline_stage} onChange={(v:string)=>setNewLead((f:any)=>({...f,pipeline_stage:v}))} options={STAGES.map(s=>({value:s,label:s}))}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Origem" value={newLead.origem||''} onChange={(v:string)=>setNewLead((f:any)=>({...f,origem:v}))} options={[{value:'',label:'Selecione'},{value:'Instagram',label:'Instagram'},{value:'Google Ads',label:'Google Ads'},{value:'WhatsApp',label:'WhatsApp'},{value:'Indicação',label:'Indicação'},{value:'Site',label:'Site'},{value:'Facebook',label:'Facebook'}]}/>
            {funnels?.length>0&&<Sel label="Funil" value={newLead.funnel_id||''} onChange={(v:string)=>setNewLead((f:any)=>({...f,funnel_id:v}))} options={[{value:'',label:'Sem funil'},...funnels.map((f:any)=>({value:f.id,label:f.name}))]}/>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">{creating?'Criando...':'Criar Lead'}</button>
          </div>
        </div>
      </Modal>

      <LeadModal lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEADS TABLE
// ══════════════════════════════════════════════════════════════════
function LeadsTable({leads,setLeads,role,addToast,company,funnels}:any){
  const [search,setSearch]=useState('')
  const [filterStage,setFilterStage]=useState('all')
  const [sortBy,setSortBy]=useState('created_at')
  const [sortDir,setSortDir]=useState('desc')
  const [page,setPage]=useState(1)
  const [selected,setSelected]=useState<any>(null)
  const PER=8

  const filtered=leads
    .filter((l:any)=>(filterStage==='all'||l.pipeline_stage===filterStage)&&
      (l.nome?.toLowerCase().includes(search.toLowerCase())||l.servico?.toLowerCase().includes(search.toLowerCase())))
    .sort((a:any,b:any)=>sortDir==='asc'?(a[sortBy]>b[sortBy]?1:-1):(a[sortBy]<b[sortBy]?1:-1))

  const pages=Math.ceil(filtered.length/PER)
  const paged=filtered.slice((page-1)*PER,page*PER)
  const ts=(col:string)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('asc')}}
  const Si=({col}:any)=>sortBy===col?(sortDir==='asc'?<ChevronUp size={10}/>:<ChevronDown size={10}/>):<ChevronDown size={10} className="opacity-30"/>
  const sv:any={ativo:'info',ganho:'success',perdido:'danger',inativo:'default'}

  const exportCSV=()=>{
    const rows=[['Nome','Tel','Serviço','Valor','Etapa','Status','Criado'],...filtered.map((l:any)=>[l.nome,l.telefone||'',l.servico||'',l.valor_estimado||0,l.pipeline_stage,l.status,l.created_at?.split('T')[0]||''])]
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download='leads.csv';a.click()
    addToast('CSV exportado!','success')
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Leads" subtitle={`${filtered.length} registros`} actions={
        <button onClick={exportCSV} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-white"><Download size={12}/>CSV</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar leads..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40"/>
          </div>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-300 focus:outline-none">
            <option value="all" className="bg-slate-900">Todas etapas</option>
            {STAGES.map(s=><option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-2xl border border-white/[0.07] overflow-hidden bg-white/[0.01]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {[{k:'nome',l:'Nome'},{k:'servico',l:'Serviço'},{k:'pipeline_stage',l:'Etapa'},{k:'valor_estimado',l:'Valor'},{k:'status',l:'Status'},{k:'created_at',l:'Criado'}].map(c=>(
                  <th key={c.k} onClick={()=>ts(c.k)} className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300">
                    <span className="flex items-center gap-1">{c.l}<Si col={c.k}/></span>
                  </th>
                ))}
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {paged.map((l:any,i:number)=>{
                const m=SM[l.pipeline_stage]||SM['Novo Lead']
                return (
                  <tr key={l.id} className={cx('border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',i%2===0?'':'bg-white/[0.01]')}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Av name={l.nome} size="sm"/><div><p className="text-xs font-medium text-white">{l.nome}</p><p className="text-[10px] text-slate-600">{l.telefone}</p></div></div></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{l.servico}</td>
                    <td className="px-4 py-3"><span className={cx('text-[10px] font-medium px-2 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold text-white">R${(l.valor_estimado||0).toLocaleString()}</td>
                    <td className="px-4 py-3"><Bdg v={sv[l.status]}>{l.status}</Bdg></td>
                    <td className="px-4 py-3 text-[10px] text-slate-600">{l.created_at?.split('T')[0]}</td>
                    <td className="px-4 py-3"><button onClick={()=>setSelected(l)} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white"><Edit2 size={13}/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paged.length===0&&<div className="py-12 text-center"><p className="text-sm text-slate-600">Nenhum lead encontrado</p></div>}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {paged.map((l:any)=>{
            const m=SM[l.pipeline_stage]||SM['Novo Lead']
            return (
              <div key={l.id} onClick={()=>setSelected(l)} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] active:bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-2">
                  <Av name={l.nome} size="sm"/>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{l.nome}</p><p className="text-xs text-slate-500">{l.telefone}</p></div>
                  <span className="text-sm font-bold text-white">R${(l.valor_estimado||0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cx('text-[10px] font-medium px-2 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span>
                  <Bdg v={sv[l.status]}>{l.status}</Bdg>
                  <span className="ml-auto text-[10px] text-slate-600">{l.created_at?.split('T')[0]}</span>
                </div>
              </div>
            )
          })}
          {paged.length===0&&<div className="py-12 text-center"><p className="text-sm text-slate-600">Nenhum lead</p></div>}
        </div>

        {pages>1&&(
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-600">{filtered.length} resultados</p>
            <div className="flex items-center gap-1">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30"><ChevronLeft size={13}/></button>
              {Array.from({length:Math.min(pages,5)},(_,i)=>(
                <button key={i} onClick={()=>setPage(i+1)} className={cx('w-7 h-7 rounded-lg text-xs font-medium',page===i+1?'bg-emerald-500 text-white':'text-slate-500 hover:bg-white/10')}>{i+1}</button>
              ))}
              <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30"><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>
      <LeadModal lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════
function CalendarView({company,addToast,user}:any){
  const [meetings,setMeetings]=useState<any[]>([])
  const [date,setDate]=useState(new Date())
  const [showNew,setShowNew]=useState(false)
  const [sel,setSel]=useState<any>(null)
  const [form,setForm]=useState<any>({event_type:'reuniao',status:'pendente'})
  const [loading,setLoading]=useState(true)

  useEffect(()=>{load()},[])
  const load=async()=>{
    setLoading(true)
    const {data}=await sb.from('meetings').select('*').eq('company_id',company.id).order('start_at')
    if(data) setMeetings(data)
    setLoading(false)
  }

  const y=date.getFullYear(),m=date.getMonth()
  const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const DAYS=['D','S','T','Q','Q','S','S']
  const fd=new Date(y,m,1).getDay()
  const dim=new Date(y,m+1,0).getDate()
  const cells=[...Array(fd).fill(null),...Array.from({length:dim},(_,i)=>i+1)]
  while(cells.length%7!==0) cells.push(null)
  const weeks=Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,(i+1)*7))
  const today=new Date()

  const getMeetings=(day:number)=>{
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return meetings.filter(mt=>mt.start_at?.startsWith(ds))
  }

  const create=async()=>{
    if(!form.title?.trim()){addToast('Título obrigatório.','error');return}
    const {data,error}=await sb.from('meetings').insert({company_id:company.id,...form,created_by:user.id}).select().single()
    if(error){addToast('Erro ao criar: '+error.message,'error');return}
    setMeetings(ms=>[...ms,data]);setForm({event_type:'reuniao',status:'pendente'});setShowNew(false);addToast('Evento criado!','success')
  }

  const updateStatus=async(id:string,status:string)=>{
    await sb.from('meetings').update({status,updated_at:new Date().toISOString()}).eq('id',id)
    setMeetings(ms=>ms.map(mt=>mt.id===id?{...mt,status}:mt))
    setSel(null);addToast(status==='confirmado'?'Confirmado!':'Cancelado.',status==='confirmado'?'success':'error')
  }

  const TC:any={reuniao:'bg-violet-500/20 text-violet-300 border-violet-500/30',visita:'bg-blue-500/20 text-blue-300 border-blue-500/30',instalacao:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}
  const TL:any={reuniao:'Reunião',visita:'Visita',instalacao:'Instalação'}
  const SC:any={confirmado:'text-emerald-400',pendente:'text-amber-400',cancelado:'text-red-400'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Calendário" subtitle="Agendamentos" actions={
        <button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold"><Plus size={13}/>Evento</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.01] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <button onClick={()=>setDate(new Date(y,m-1))} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400"><ChevronLeft size={16}/></button>
            <p className="text-sm font-semibold text-white">{MONTHS[m]} {y}</p>
            <button onClick={()=>setDate(new Date(y,m+1))} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400"><ChevronRight size={16}/></button>
          </div>
          <div className="grid grid-cols-7 border-b border-white/[0.05]">
            {DAYS.map((d,i)=><div key={i} className="py-2 text-center text-[10px] font-medium text-slate-600">{d}</div>)}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} className="grid grid-cols-7 border-b border-white/[0.04] last:border-0">
              {week.map((day:any,di:number)=>{
                const dm=day?getMeetings(day):[]
                const isToday=day&&today.getDate()===day&&today.getMonth()===m&&today.getFullYear()===y
                return (
                  <div key={di} className={cx('min-h-[52px] p-1 border-r border-white/[0.04] last:border-0',!day&&'opacity-0')}>
                    {day&&<>
                      <span className={cx('text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full mb-0.5',isToday?'bg-emerald-500 text-white':'text-slate-500')}>{day}</span>
                      {dm.slice(0,2).map((mt:any)=><button key={mt.id} onClick={()=>setSel(mt)} className={cx('w-full text-left text-[8px] font-medium px-1 py-0.5 rounded border truncate mb-0.5',TC[mt.event_type]||'bg-white/5 text-white border-white/10')}>{mt.title}</button>)}
                      {dm.length>2&&<p className="text-[8px] text-slate-600 px-1">+{dm.length-2}</p>}
                    </>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          <p className="text-xs font-semibold text-white mb-3">Próximos Eventos</p>
          <div className="space-y-2">
            {[...meetings].sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime()).slice(0,5).map(mt=>(
              <button key={mt.id} onClick={()=>setSel(mt)} className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]">
                <div className="flex items-start gap-2.5">
                  <div className="w-1 rounded-full mt-1 shrink-0 self-stretch" style={{background:mt.event_type==='visita'?'#60A5FA':mt.event_type==='reuniao'?'#A78BFA':'#34D399'}}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{mt.title}</p>
                    <p className="text-[10px] text-slate-500">{TL[mt.event_type]} · {mt.start_at?.split('T')[0]}</p>
                    <span className={cx('text-[10px] font-medium',SC[mt.status])}>{mt.status}</span>
                  </div>
                </div>
              </button>
            ))}
            {meetings.length===0&&<p className="text-xs text-slate-600 text-center py-4">Sem eventos</p>}
          </div>
        </div>
      </div>

      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Novo Evento" size="md">
        <div className="space-y-3">
          <Field label="Título" value={form.title} onChange={(v:string)=>setForm((f:any)=>({...f,title:v}))} required/>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Tipo" value={form.event_type} onChange={(v:string)=>setForm((f:any)=>({...f,event_type:v}))} options={[{value:'reuniao',label:'Reunião'},{value:'visita',label:'Visita'},{value:'instalacao',label:'Instalação'}]}/>
            <Sel label="Status" value={form.status} onChange={(v:string)=>setForm((f:any)=>({...f,status:v}))} options={[{value:'pendente',label:'Pendente'},{value:'confirmado',label:'Confirmado'},{value:'cancelado',label:'Cancelado'}]}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início" value={form.start_at} onChange={(v:string)=>setForm((f:any)=>({...f,start_at:v}))} type="datetime-local"/>
            <Field label="Fim" value={form.end_at} onChange={(v:string)=>setForm((f:any)=>({...f,end_at:v}))} type="datetime-local"/>
          </div>
          <Textarea label="Descrição" value={form.description} onChange={(v:string)=>setForm((f:any)=>({...f,description:v}))} placeholder="Detalhes..."/>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
            <button onClick={create} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Criar</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!sel} onClose={()=>setSel(null)} title="Detalhes do Evento" size="sm">
        {sel&&<div className="space-y-3">
          <div className={cx('px-2.5 py-1.5 rounded-xl border text-xs font-medium inline-block',TC[sel.event_type])}>{TL[sel.event_type]}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Título</span><span className="text-white font-medium">{sel.title}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Início</span><span className="text-white">{sel.start_at?.replace('T',' ').slice(0,16)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className={cx('font-medium',SC[sel.status])}>{sel.status}</span></div>
            {sel.description&&<p className="text-xs text-slate-400 pt-2 border-t border-white/[0.06]">{sel.description}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>updateStatus(sel.id,'cancelado')} className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10">Cancelar</button>
            <button onClick={()=>updateStatus(sel.id,'confirmado')} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm">Confirmar</button>
          </div>
        </div>}
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// COLABORADORES — "Você" no próprio card, delete real, save real
// ══════════════════════════════════════════════════════════════════
function Colaboradores({company,user,addToast}:any){
  const [colabs,setColabs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showNew,setShowNew]=useState(false)
  const [form,setForm]=useState<any>({role:'colaborador'})
  const [creating,setCreating]=useState(false)
  const [editRole,setEditRole]=useState<any>(null)
  const [delConfirm,setDelConfirm]=useState<any>(null)
  const canManage=['founder','gestor'].includes(user.role)

  useEffect(()=>{load()},[])
  const load=async()=>{
    setLoading(true)
    const {data,error}=await sb.from('users').select('*').eq('company_id',company.id).eq('active',true).order('created_at')
    if(error) addToast('Erro ao carregar colaboradores: '+error.message,'error')
    if(data) setColabs(data)
    setLoading(false)
  }

  const create=async()=>{
    if(!form.full_name?.trim()){addToast('Nome é obrigatório.','error');return}
    if(!form.username?.trim()){addToast('Usuário é obrigatório.','error');return}
    if(!form.password_hash?.trim()){addToast('Senha é obrigatória.','error');return}
    setCreating(true)
    const payload={
      company_id:company.id,
      full_name:form.full_name.trim(),
      display_name:(form.display_name?.trim()||form.full_name.trim()),
      email:(form.email?.trim()||null),
      username:form.username.trim().toLowerCase(),
      password_hash:form.password_hash,
      role:(form.role||'colaborador'),
      active:true,
    }
    const {data,error}=await sb.from('users').insert(payload).select().single()
    setCreating(false)
    if(error){addToast('Erro ao cadastrar: '+error.message,'error');return}
    setColabs(c=>[...c,data])
    setForm({role:'colaborador'})
    setShowNew(false)
    addToast('Colaborador cadastrado com sucesso!','success')
  }

  const updateRole=async()=>{
    if(!editRole) return
    const {error}=await sb.from('users').update({role:editRole.role,updated_at:new Date().toISOString()}).eq('id',editRole.id)
    if(error){addToast('Erro ao atualizar cargo.','error');return}
    setColabs(cs=>cs.map(c=>c.id===editRole.id?{...c,role:editRole.role}:c))
    setEditRole(null)
    addToast('Cargo atualizado!','success')
  }

  const remove=async()=>{
    if(!delConfirm) return
    const {error}=await sb.from('users').update({active:false,updated_at:new Date().toISOString()}).eq('id',delConfirm.id)
    if(error){addToast('Erro ao remover.','error');return}
    setColabs(cs=>cs.filter(c=>c.id!==delConfirm.id))
    setDelConfirm(null)
    addToast('Colaborador removido.','success')
  }

  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RV:any={founder:'violet',gestor:'info',colaborador:'default'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Colaboradores" subtitle={`${colabs.length} membros`} actions={
        canManage&&<button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold"><UserPlus size={13}/>Cadastrar</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        {loading
          ?<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3].map(i=><Sk key={i} className="h-24 rounded-2xl"/>)}</div>
          :<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colabs.map(c=>{
              const isMe=c.id===user.id
              return (
                <div key={c.id} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Av name={c.display_name||c.full_name} size="lg" url={c.avatar_url}/>
                      {isMe&&<div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center"><User size={8} className="text-white"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* "Você" in place of your own name */}
                      <p className="text-sm font-semibold text-white">{isMe?'Você':c.display_name||c.full_name}</p>
                      {isMe&&<p className="text-xs text-slate-500 truncate">{c.full_name}</p>}
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">@{c.username||'—'}</p>
                      <div className="mt-1.5"><Bdg v={RV[c.role]}>{RL[c.role]}</Bdg></div>
                    </div>
                    {/* Only show controls for others, and only if canManage */}
                    {canManage&&!isMe&&(
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={()=>setEditRole({...c})} title="Alterar cargo" className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-violet-400"><Shield size={12}/></button>
                        <button onClick={()=>setDelConfirm(c)} title="Remover acesso" className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-500 hover:text-red-400"><Trash2 size={12}/></button>
                      </div>
                    )}
                  </div>
                  {c.email&&<p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1.5"><Mail size={10}/>{c.email}</p>}
                </div>
              )
            })}
          </div>
        }
      </div>

      {/* Cadastrar */}
      <Modal open={showNew} onClose={()=>{setShowNew(false);setForm({role:'colaborador'})}} title="Cadastrar Colaborador" size="md">
        <div className="space-y-3">
          <Field label="Nome completo" value={form.full_name} onChange={(v:string)=>setForm((f:any)=>({...f,full_name:v}))} required icon={User}/>
          <Field label="Nome de exibição" value={form.display_name} onChange={(v:string)=>setForm((f:any)=>({...f,display_name:v}))} placeholder="Apelido ou nome curto (opcional)"/>
          <Field label="E-mail" value={form.email} onChange={(v:string)=>setForm((f:any)=>({...f,email:v}))} icon={Mail} type="email"/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Login (usuário)" value={form.username} onChange={(v:string)=>setForm((f:any)=>({...f,username:v}))} required icon={Hash}/>
            <Field label="Senha" value={form.password_hash} onChange={(v:string)=>setForm((f:any)=>({...f,password_hash:v}))} required type="password"/>
          </div>
          <Sel label="Cargo" value={form.role} onChange={(v:string)=>setForm((f:any)=>({...f,role:v}))} options={[{value:'colaborador',label:'Colaborador'},{value:'gestor',label:'Gestor'},{value:'founder',label:'Founder'}]}/>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>{setShowNew(false);setForm({role:'colaborador'})}} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">{creating?'Cadastrando...':'Cadastrar'}</button>
          </div>
        </div>
      </Modal>

      {/* Alterar cargo */}
      <Modal open={!!editRole} onClose={()=>setEditRole(null)} title={`Alterar cargo — ${editRole?.full_name}`} size="sm">
        {editRole&&<div className="space-y-4">
          <Sel label="Novo cargo" value={editRole.role} onChange={(v:string)=>setEditRole((e:any)=>({...e,role:v}))} options={[{value:'colaborador',label:'Colaborador'},{value:'gestor',label:'Gestor'},{value:'founder',label:'Founder'}]}/>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setEditRole(null)} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancelar</button>
            <button onClick={updateRole} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Salvar</button>
          </div>
        </div>}
      </Modal>

      {/* Confirmar remoção */}
      <Confirm open={!!delConfirm} onClose={()=>setDelConfirm(null)} onOk={remove}
        title="Remover Colaborador"
        msg={`Remover "${delConfirm?.full_name}"? O acesso ao CRM será revogado imediatamente.`}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SETTINGS — save real, update full_name too, dark mode real
// ══════════════════════════════════════════════════════════════════
function SettingsPage({user,company,dark,setDark,onLogout,addToast,setUser,setCompany}:any){
  const [uForm,setUForm]=useState({display_name:user.display_name||'',email:user.email||''})
  const [cForm,setCForm]=useState({company_name:company.company_name||''})
  const [saving,setSaving]=useState(false)
  const [savingC,setSavingC]=useState(false)
  const [upAvatar,setUpAvatar]=useState(false)
  const [upLogo,setUpLogo]=useState(false)
  const canEditCompany=['founder','gestor'].includes(user.role)
  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RC:any={founder:'bg-amber-500/15 text-amber-400 border-amber-500/30',gestor:'bg-violet-500/15 text-violet-400 border-violet-500/30',colaborador:'bg-blue-500/15 text-blue-400 border-blue-500/30'}

  const saveUser=async()=>{
    const dn=uForm.display_name.trim()
    if(!dn){addToast('Nome de exibição é obrigatório.','error');return}
    setSaving(true)
    // Update BOTH display_name AND full_name so collaborators card stays consistent
    const {error}=await sb.from('users').update({
      display_name:dn,
      full_name:dn,
      email:uForm.email.trim()||null,
      updated_at:new Date().toISOString()
    }).eq('id',user.id)
    setSaving(false)
    if(error){addToast('Erro ao salvar: '+error.message,'error');return}
    setUser((u:any)=>({...u,display_name:dn,full_name:dn,email:uForm.email}))
    addToast('Perfil salvo!','success')
  }

  const saveCompany=async()=>{
    if(!cForm.company_name.trim()){addToast('Nome obrigatório.','error');return}
    setSavingC(true)
    const {error}=await sb.from('companies').update({company_name:cForm.company_name.trim(),updated_at:new Date().toISOString()}).eq('id',company.id)
    setSavingC(false)
    if(error){addToast('Erro ao salvar: '+error.message,'error');return}
    setCompany((c:any)=>({...c,company_name:cForm.company_name.trim()}))
    addToast('Empresa salva!','success')
  }

  const upload=async(file:File,bucket:string,path:string)=>{
    const {error}=await sb.storage.from(bucket).upload(path,file,{upsert:true})
    if(error) throw error
    const {data}=sb.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleAvatar=async(e:any)=>{
    const file=e.target.files?.[0];if(!file) return
    setUpAvatar(true)
    try{
      const url=await upload(file,'avatars',`${user.id}/avatar.${file.name.split('.').pop()}`)
      await sb.from('users').update({avatar_url:url}).eq('id',user.id)
      setUser((u:any)=>({...u,avatar_url:url}))
      addToast('Foto atualizada!','success')
    }catch(err:any){addToast('Erro no upload. Crie o bucket "avatars" como público no Supabase Storage.','error')}
    setUpAvatar(false)
  }

  const handleLogo=async(e:any)=>{
    const file=e.target.files?.[0];if(!file) return
    setUpLogo(true)
    try{
      const url=await upload(file,'logos',`${company.id}/logo.${file.name.split('.').pop()}`)
      await sb.from('companies').update({company_logo_url:url}).eq('id',company.id)
      setCompany((c:any)=>({...c,company_logo_url:url}))
      addToast('Logo atualizada!','success')
    }catch(err:any){addToast('Erro no upload. Crie o bucket "logos" como público no Supabase Storage.','error')}
    setUpLogo(false)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Configurações"/>
      <div className="p-4 space-y-4 max-w-lg">
        {/* Perfil */}
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-4">Meu Perfil</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Av name={user.display_name||user.full_name} size="xl" url={user.avatar_url}/>
              <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-md',upAvatar&&'opacity-50')}>
                {upAvatar?<RefreshCw size={10} className="text-white animate-spin"/>:<Camera size={10} className="text-white"/>}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={upAvatar}/>
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.full_name}</p>
              <span className={cx('text-xs font-medium px-2 py-0.5 rounded-full border mt-1 inline-block',RC[user.role])}>{RL[user.role]}</span>
            </div>
          </div>
          <div className="space-y-3">
            <Field label="Nome de exibição" value={uForm.display_name} onChange={(v:string)=>setUForm(f=>({...f,display_name:v}))} icon={User} required/>
            <Field label="E-mail" value={uForm.email} onChange={(v:string)=>setUForm(f=>({...f,email:v}))} icon={Mail} type="email"/>
            <Field label="Cargo" value={RL[user.role]} disabled/>
          </div>
          <button onClick={saveUser} disabled={saving}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">
            {saving?'Salvando...':'Salvar perfil'}
          </button>
        </div>

        {/* Empresa */}
        {canEditCompany&&(
          <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-xs font-semibold text-white mb-4">Empresa</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {company.company_logo_url
                  ?<img src={company.company_logo_url} className="w-14 h-14 rounded-xl object-contain bg-white/5 border border-white/10 p-1" alt="logo"/>
                  :<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center"><Zap size={22} className="text-white"/></div>
                }
                <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-md',upLogo&&'opacity-50')}>
                  {upLogo?<RefreshCw size={10} className="text-white animate-spin"/>:<Upload size={10} className="text-white"/>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} disabled={upLogo}/>
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{company.company_name}</p>
                <p className="text-xs text-slate-500 font-mono">@{company.company_slug}</p>
              </div>
            </div>
            <Field label="Nome da empresa" value={cForm.company_name} onChange={(v:string)=>setCForm(f=>({...f,company_name:v}))} icon={Building2}/>
            <button onClick={saveCompany} disabled={savingC}
              className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">
              {savingC?'Salvando...':'Salvar empresa'}
            </button>
          </div>
        )}

        {/* Tema */}
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-3">Aparência</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Modo {dark?'Escuro':'Claro'}</p>
              <p className="text-xs text-slate-500">Altera o tema visual do CRM</p>
            </div>
            <button onClick={()=>setDark((d:boolean)=>!d)}
              className={cx('relative w-12 h-6 rounded-full transition-colors duration-300',dark?'bg-emerald-500':'bg-slate-600')}>
              <div className={cx('absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',dark?'left-7':'left-1')}/>
            </button>
          </div>
        </div>

        {/* Upload nota */}
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex gap-2.5">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5"/>
          <p className="text-[11px] text-slate-400 leading-relaxed">Para upload de fotos funcionar: crie os buckets <span className="text-white font-mono text-[10px]">avatars</span> e <span className="text-white font-mono text-[10px]">logos</span> no Supabase Storage com acesso <strong>público</strong>.</p>
        </div>

        {/* Logout */}
        <div className="p-4 rounded-2xl border border-red-500/10 bg-red-500/[0.02]">
          <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm transition-all w-full">
            <LogOut size={14}/>Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SUPORTE — N8N webhook
// ══════════════════════════════════════════════════════════════════
function Suporte({company,user,addToast}:any){
  const [msg,setMsg]=useState('')
  const [sending,setSending]=useState(false)
  const [tickets,setTickets]=useState<any[]>([])

  useEffect(()=>{
    sb.from('support_tickets').select('*').eq('company_id',company.id).order('created_at',{ascending:false}).then(({data})=>{if(data)setTickets(data)})
  },[])

  const send=async()=>{
    if(!msg.trim()){addToast('Digite uma mensagem.','error');return}
    setSending(true)
    const {data}=await sb.from('support_tickets').insert({
      company_id:company.id,user_id:user.id,
      user_name:user.display_name||user.full_name,
      message:msg.trim(),status:'aberto'
    }).select().single()
    try{
      await fetch(N8N,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:'suporte',
          empresa:company.company_name,
          empresa_slug:company.company_slug,
          usuario:user.display_name||user.full_name,
          cargo:user.role,
          mensagem:msg.trim(),
          timestamp:new Date().toISOString()
        })
      })
    }catch{}
    if(data) setTickets(t=>[data,...t])
    setMsg('');setSending(false)
    addToast('Mensagem enviada ao suporte!','success')
  }

  const SC:any={aberto:'warning',respondido:'success',fechado:'default'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Suporte" subtitle="Fale com a equipe Flüxa"/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2"><HeadphonesIcon size={13}/>Nova mensagem</p>
          <Textarea value={msg} onChange={setMsg} placeholder="Descreva sua dúvida ou problema em detalhes..." rows={4}/>
          <button onClick={send} disabled={sending}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60 w-full justify-center">
            {sending?<><RefreshCw size={13} className="animate-spin"/>Enviando...</>:<><Send size={13}/>Enviar ao Suporte</>}
          </button>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex gap-2.5">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5"/>
          <p className="text-xs text-slate-400">Sua mensagem chega via WhatsApp à equipe Flüxa. Respondemos em até 24h úteis.</p>
        </div>
        {tickets.length>0&&(
          <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-xs font-semibold text-white mb-3">Histórico</p>
            <div className="space-y-2">
              {tickets.map(t=>(
                <div key={t.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex justify-between items-center mb-1.5">
                    <Bdg v={SC[t.status]}>{t.status}</Bdg>
                    <span className="text-[10px] text-slate-600">{t.created_at?.split('T')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [session,setSession]=useState<any>(null)
  const [tab,setTab]=useState('dashboard')
  const [dark,setDark]=useState(true)
  const [sideOpen,setSideOpen]=useState(false)
  const [leads,setLeads]=useState<any[]>([])
  const [funnels,setFunnels]=useState<any[]>([])
  const [users,setUsers]=useState<any[]>([])
  const {toasts,add:addToast,rm:rmToast}=useToast()

  const loadData=async(companyId:string)=>{
    const [lr,fr,ur]=await Promise.all([
      sb.from('leads').select('*').eq('company_id',companyId).order('created_at',{ascending:false}),
      sb.from('funnels').select('*').eq('company_id',companyId).order('created_at'),
      sb.from('users').select('*').eq('company_id',companyId).eq('active',true).order('created_at'),
    ])
    if(lr.data) setLeads(lr.data)
    if(fr.data) setFunnels(fr.data)
    if(ur.data) setUsers(ur.data)
  }

  const login=({company,user}:any)=>{
    setSession({company,user})
    loadData(company.id)
    addToast(`Bem-vindo, ${user.display_name||user.full_name}! 👋`,'success')
  }

  const logout=()=>{
    setSession(null);setLeads([]);setFunnels([]);setUsers([]);setTab('dashboard')
  }

  const setUser=(fn:any)=>setSession((s:any)=>({...s,user:typeof fn==='function'?fn(s.user):fn}))
  const setCompany=(fn:any)=>setSession((s:any)=>({...s,company:typeof fn==='function'?fn(s.company):fn}))

  if(!session) return <Login onLogin={login}/>

  const {company,user}=session

  // Apply dark/light to html body
  const bgMain=dark?'bg-[#070C18]':'bg-slate-100'
  const props={company,user,addToast,leads,setLeads,funnels,users,role:user.role}

  const pages:any={
    dashboard: <Dashboard {...props}/>,
    pipeline:  <Pipeline {...props}/>,
    leads:     <LeadsTable {...props}/>,
    calendar:  <CalendarView {...props}/>,
    colaboradores: <Colaboradores company={company} user={user} addToast={addToast}/>,
    settings:  <SettingsPage user={user} company={company} dark={dark} setDark={setDark} onLogout={logout} addToast={addToast} setUser={setUser} setCompany={setCompany}/>,
    suporte:   <Suporte company={company} user={user} addToast={addToast}/>,
  }

  return (
    <div className={cx('flex h-screen w-screen overflow-hidden',bgMain)} style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <Sidebar active={tab} setActive={setTab} company={company} user={user} onLogout={logout}
        open={sideOpen} setOpen={setSideOpen} dark={dark} setDark={setDark}/>
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {pages[tab]||pages.dashboard}
      </main>
      <Toast toasts={toasts} rm={rmToast}/>
    </div>
  )
}
