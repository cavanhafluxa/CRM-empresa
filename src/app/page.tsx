'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard, GitBranch, Users, Calendar, Settings, LogOut,
  Search, Plus, ChevronRight, ChevronLeft, TrendingUp, DollarSign,
  Target, X, Edit2, Trash2, Phone, Mail, MessageSquare, AlertCircle,
  ChevronDown, Download, FileText, Star, Zap, CheckCircle, RefreshCw,
  Upload, User, Building2, Move, Briefcase, ChevronUp, Camera, Shield,
  UserPlus, PenLine, HeadphonesIcon, Send, Menu, Eye, EyeOff, Hash, Bell
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const N8N = process.env.NEXT_PUBLIC_N8N_WEBHOOK || ''
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

// ── Theme helpers ────────────────────────────────────────────────
const T = {
  bg:     (d:boolean) => d ? 'bg-[#070C18]'      : 'bg-slate-100',
  card:   (d:boolean) => d ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-white border-slate-200',
  sidebar:(d:boolean) => d ? 'bg-slate-950 border-white/[0.06]'    : 'bg-white border-slate-200',
  header: (d:boolean) => d ? 'bg-slate-950/80 border-white/[0.06]' : 'bg-white/90 border-slate-200',
  input:  (d:boolean) => d ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400',
  text:   (d:boolean) => d ? 'text-white'    : 'text-slate-900',
  sub:    (d:boolean) => d ? 'text-slate-400' : 'text-slate-600',
  muted:  (d:boolean) => d ? 'text-slate-500' : 'text-slate-500',
  nav:    (d:boolean) => d ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  navA:   (d:boolean) => d ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
  modal:  (d:boolean) => d ? 'bg-slate-900 border-white/10'       : 'bg-white border-slate-200',
  row:    (d:boolean) => d ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50',
  tbl:    (d:boolean) => d ? 'bg-white/[0.01] border-white/[0.07]' : 'bg-white border-slate-200',
  tblH:   (d:boolean) => d ? 'bg-white/[0.02] border-white/[0.07] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500',
  tblB:   (d:boolean) => d ? 'border-white/[0.04]' : 'border-slate-100',
  sel:    (d:boolean) => d ? 'bg-slate-900 text-white'             : 'bg-white text-slate-900',
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
          <button onClick={()=>rm(t.id)}><X size={12}/></button>
        </div>
      ))}
    </div>
  )
}
function useToast(){
  const [toasts,setToasts]=useState<any[]>([])
  const add=useCallback((message:string,type='info')=>{
    const id=Date.now(); setToasts(t=>[...t,{id,message,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500)
  },[])
  const rm=(id:number)=>setToasts(t=>t.filter(x=>x.id!==id))
  return {toasts,add,rm}
}

// ── Primitives ───────────────────────────────────────────────────
function Sk({className}:{className?:string}){ return <div className={cx('animate-pulse rounded-lg bg-white/5',className)}/> }

function Av({name,url,size='md'}:{name:string,url?:string,size?:string}){
  const s:any={xs:'w-6 h-6 text-[10px]',sm:'w-8 h-8 text-xs',md:'w-9 h-9 text-sm',lg:'w-11 h-11 text-base',xl:'w-14 h-14 text-xl'}
  const init=(name||'?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()
  const bg=`hsl(${(init.charCodeAt(0)*43)%360},55%,40%)`
  if(url) return <img src={url} className={cx(s[size],'rounded-xl object-cover shrink-0')} alt={name}/>
  return <div className={cx(s[size],'rounded-xl flex items-center justify-center font-bold shrink-0 text-white')} style={{background:bg}}>{init}</div>
}

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

function Modal({open,onClose,title,children,size='md',dark=true}:any){
  if(!open) return null
  const s:any={sm:'max-w-sm',md:'max-w-lg',lg:'max-w-2xl'}
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className={cx('relative w-full shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col border',s[size],T.modal(dark))}>
        <div className={cx('flex items-center justify-between px-5 py-4 border-b shrink-0',dark?'border-white/[0.08]':'border-slate-200')}>
          <h2 className={cx('text-sm font-semibold',T.text(dark))}>{title}</h2>
          <button onClick={onClose} className={cx('w-7 h-7 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-500')}><X size={15}/></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function Confirm({open,onClose,onOk,title,msg,dark=true}:any){
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" dark={dark}>
      <p className={cx('text-sm mb-5',T.sub(dark))}>{msg}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400 hover:bg-white/5':'border-slate-200 text-slate-600 hover:bg-slate-50')}>Cancelar</button>
        <button onClick={onOk} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium">Confirmar</button>
      </div>
    </Modal>
  )
}

function Field({label,value,onChange,type='text',placeholder,required,icon:Icon,disabled,dark=true}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className={cx('text-xs font-medium',T.sub(dark))}>{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
      <div className="relative">
        {Icon&&<Icon size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>}
        <input type={type} value={value??''} onChange={e=>onChange&&onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-emerald-500/50 transition-all py-2.5',
            Icon?'pl-9 pr-3':'px-3', T.input(dark), disabled&&'opacity-50 cursor-not-allowed')}/>
      </div>
    </div>
  )
}
function Sel({label,value,onChange,options,required,dark=true}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className={cx('text-xs font-medium',T.sub(dark))}>{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>}
      <select value={value??''} onChange={e=>onChange(e.target.value)}
        className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 appearance-none cursor-pointer',T.input(dark))}>
        {options.map((o:any)=><option key={o.value} value={o.value} className={T.sel(dark)}>{o.label}</option>)}
      </select>
    </div>
  )
}
function Textarea({label,value,onChange,placeholder,rows=3,dark=true}:any){
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className={cx('text-xs font-medium',T.sub(dark))}>{label}</label>}
      <textarea value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-emerald-500/50 px-3 py-2.5 resize-none',T.input(dark))}/>
    </div>
  )
}

function Header({title,subtitle,actions,onMenu,dark=true}:any){
  return (
    <div className={cx('h-14 px-4 flex items-center justify-between border-b backdrop-blur-xl shrink-0',T.header(dark))}>
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className={cx('sm:hidden w-8 h-8 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-500')}><Menu size={18}/></button>
        <div>
          <h1 className={cx('text-sm font-semibold leading-tight',T.text(dark))}>{title}</h1>
          {subtitle&&<p className={cx('text-[11px]',T.muted(dark))}>{subtitle}</p>}
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
      const {data:co}=await sb.from('companies').select('*').eq('company_slug',slug.trim().toLowerCase()).eq('crm_active',true).single()
      if(!co){setErr('Empresa não encontrada.');setLoading(false);return}
      const {data:usr}=await sb.from('users').select('*').eq('company_id',co.id).eq('username',user.trim()).eq('password_hash',pass).eq('active',true).single()
      if(usr){onLogin({company:co,user:usr});setLoading(false);return}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"><Zap size={18} className="text-white"/></div>
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
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60 active:scale-95 transition-all">
              {loading?<span className="flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin"/>Entrando...</span>:'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SIDEBAR — Config e Suporte na parte de baixo
// ══════════════════════════════════════════════════════════════════
function Sidebar({active,setActive,company,user,onLogout,open,setOpen,dark,setDark}:any){
  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RC:any={founder:'text-amber-400',gestor:'text-violet-400',colaborador:'text-blue-400'}
  const topNav=[
    {id:'dashboard',    label:'Dashboard',     icon:LayoutDashboard},
    {id:'pipeline',     label:'Pipeline',      icon:GitBranch},
    {id:'leads',        label:'Leads',         icon:Users},
    {id:'calendar',     label:'Calendário',    icon:Calendar},
    {id:'colaboradores',label:'Colaboradores', icon:Shield},
  ]
  const bottomNav=[
    {id:'settings', label:'Configurações', icon:Settings},
    {id:'suporte',  label:'Suporte',       icon:HeadphonesIcon},
  ]

  const NavBtn=({id,label,icon:Icon}:any)=>(
    <button onClick={()=>{setActive(id);setOpen(false)}}
      className={cx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
        active===id ? T.navA(dark) : T.nav(dark))}>
      <Icon size={16} className="shrink-0"/>
      <span className="font-medium">{label}</span>
      {active===id&&<div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"/>}
    </button>
  )

  const inner=(
    <div className={cx('flex flex-col h-full border-r',T.sidebar(dark))}>
      {/* Logo */}
      <div className={cx('flex items-center gap-2.5 px-4 h-14 border-b shrink-0',dark?'border-white/[0.06]':'border-slate-200')}>
        {company.company_logo_url
          ?<img src={company.company_logo_url} className="w-8 h-8 rounded-lg object-contain" alt="logo"/>
          :<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0"><Zap size={14} className="text-white"/></div>
        }
        <div className="min-w-0 flex-1">
          <p className={cx('text-xs font-bold truncate',T.text(dark))}>{company.company_name}</p>
          <p className={cx('text-[10px]',T.muted(dark))}>@{company.company_slug}</p>
        </div>
        <button onClick={()=>setOpen(false)} className={cx('sm:hidden',dark?'text-slate-500':'text-slate-400')}><X size={16}/></button>
      </div>
      {/* Top nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {topNav.map(n=><NavBtn key={n.id} {...n}/>)}
      </nav>
      {/* Bottom nav — config + suporte */}
      <div className={cx('px-2 py-2 border-t space-y-0.5',dark?'border-white/[0.06]':'border-slate-200')}>
        {bottomNav.map(n=><NavBtn key={n.id} {...n}/>)}
      </div>
      {/* User + dark toggle */}
      <div className={cx('p-2 border-t',dark?'border-white/[0.06]':'border-slate-200')}>
        <button onClick={()=>setDark((d:boolean)=>!d)}
          className={cx('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm mb-1',T.nav(dark))}>
          <span className="text-base">{dark?'☀️':'🌙'}</span>
          <span className={cx('font-medium text-sm',T.sub(dark))}>{dark?'Modo Claro':'Modo Escuro'}</span>
        </button>
        <div className={cx('flex items-center gap-2.5 px-3 py-2 rounded-xl',dark?'bg-white/[0.02]':'bg-slate-50')}>
          <Av name={user.display_name||user.full_name} size="sm" url={user.avatar_url}/>
          <div className="flex-1 min-w-0">
            <p className={cx('text-xs font-semibold truncate',T.text(dark))}>{user.display_name||user.full_name}</p>
            <p className={cx('text-[10px] font-medium',RC[user.role])}>{RL[user.role]}</p>
          </div>
          <button onClick={onLogout} className={cx('transition-colors',dark?'text-slate-600 hover:text-red-400':'text-slate-400 hover:text-red-500')}><LogOut size={14}/></button>
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
function Dashboard({leads,company,addToast,dark}:any){
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setTimeout(()=>setLoading(false),500)},[])

  const total=leads.length
  const fechados=leads.filter((l:any)=>l.pipeline_stage==='Fechado')
  const conv=total?Math.round((fechados.length/total)*100):0
  const ticket=fechados.length?Math.round(fechados.reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)/fechados.length):0
  const negoc=leads.filter((l:any)=>!['Fechado','Perdido'].includes(l.pipeline_stage)).reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)

  const chartData=Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-5+i)
    const y=d.getFullYear(),m=d.getMonth()
    const ml=leads.filter((l:any)=>{const ld=new Date(l.created_at);return ld.getFullYear()===y&&ld.getMonth()===m})
    const lbl=d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')
    return {month:lbl.charAt(0).toUpperCase()+lbl.slice(1),leads:ml.length,conversoes:ml.filter((l:any)=>l.pipeline_stage==='Fechado').length}
  })
  const stageData=STAGES.map(s=>({name:s,value:leads.filter((l:any)=>l.pipeline_stage===s).length,color:SM[s]?.dot||'#888'})).filter(d=>d.value>0)

  const exportCSV=()=>{
    const rows=[['Nome','Tel','Serviço','Valor','Etapa','Status','Criado'],...leads.map((l:any)=>[l.nome,l.telefone||'',l.servico||'',l.valor_estimado||0,l.pipeline_stage,l.status,l.created_at?.split('T')[0]||''])]
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download='leads.csv';a.click()
    addToast('CSV exportado!','success')
  }

  const CT=({active,payload,label}:any)=>{
    if(!active||!payload?.length) return null
    return <div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl"><p className="text-slate-400 mb-1">{label}</p>{payload.map((p:any,i:number)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}</div>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} title="Dashboard" subtitle={company.company_name} actions={
        <div className="flex gap-1.5">
          <button onClick={exportCSV} className={cx('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs',dark?'border-white/10 text-slate-400 hover:text-white':'border-slate-200 text-slate-600 hover:text-slate-900')}><Download size={12}/>CSV</button>
        </div>
      }/>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            {label:'Total Leads',val:String(total),icon:Users,       color:dark?'from-blue-600/20 to-blue-900/10':'from-blue-50 to-blue-100/50',border:dark?'border-white/[0.07]':'border-blue-200/50'},
            {label:'Conversão',  val:`${conv}%`,   icon:Target,      color:dark?'from-emerald-600/20 to-emerald-900/10':'from-emerald-50 to-emerald-100/50',border:dark?'border-white/[0.07]':'border-emerald-200/50'},
            {label:'Ticket Médio',val:`R$${ticket.toLocaleString()}`,icon:DollarSign,color:dark?'from-violet-600/20 to-violet-900/10':'from-violet-50 to-violet-100/50',border:dark?'border-white/[0.07]':'border-violet-200/50'},
            {label:'Negociação', val:`R$${(negoc/1000).toFixed(0)}k`,icon:TrendingUp,color:dark?'from-amber-600/20 to-amber-900/10':'from-amber-50 to-amber-100/50',border:dark?'border-white/[0.07]':'border-amber-200/50'},
          ].map(({label,val,icon:Icon,color,border})=>(
            <div key={label} className={cx('p-4 rounded-2xl border bg-gradient-to-br',color,border)}>
              <div className={cx('w-8 h-8 rounded-xl flex items-center justify-center mb-2',dark?'bg-white/10':'bg-white shadow-sm')}><Icon size={14} className={dark?'text-white':'text-slate-700'}/></div>
              {loading?<Sk className="h-6 w-16 mb-1"/>:<p className={cx('text-lg font-bold',T.text(dark))}>{val}</p>}
              <p className={cx('text-[10px]',T.sub(dark))}>{label}</p>
            </div>
          ))}
        </div>

        <div className={cx('p-4 rounded-2xl border overflow-hidden',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-1',T.text(dark))}>Evolução de Leads</p>
          <p className={cx('text-[10px] mb-3',T.muted(dark))}>Últimos 6 meses — dados reais</p>
          {loading?<Sk className="h-36"/>:(
            <div style={{height:140}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/><stop offset="95%" stopColor="#34D399" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.06)"}/>
                  <XAxis dataKey="month" tick={{fill:dark?'#64748B':'#94a3b8',fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:dark?'#64748B':'#94a3b8',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="#34D399" strokeWidth={2} fill="url(#g1)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {leads.length===0&&!loading&&<p className={cx('text-center text-xs mt-2',T.muted(dark))}>Nenhum lead ainda.</p>}
        </div>

        {stageData.length>0&&(
          <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
            <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Pipeline por Etapa</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart><Pie data={stageData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">{stageData.map((e:any,i:number)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {stageData.map((s:any,i:number)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/><span className={cx('text-[11px] truncate',T.sub(dark))}>{s.name}</span></div>
                    <span className={cx('font-semibold',T.text(dark))}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Leads Recentes</p>
          <div className="space-y-2">
            {leads.slice(0,5).map((l:any)=>{
              const m=SM[l.pipeline_stage]||SM['Novo Lead']
              return (
                <div key={l.id} className={cx('flex items-center gap-3 p-2.5 rounded-xl',T.row(dark))}>
                  <Av name={l.nome} size="sm"/>
                  <div className="flex-1 min-w-0"><p className={cx('text-xs font-medium truncate',T.text(dark))}>{l.nome}</p><p className={cx('text-[10px] truncate',T.muted(dark))}>{l.servico||'—'}</p></div>
                  <div className="text-right shrink-0">
                    <p className={cx('text-xs font-bold',T.text(dark))}>R${(l.valor_estimado||0).toLocaleString()}</p>
                    <span className={cx('text-[9px] font-medium px-1.5 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span>
                  </div>
                </div>
              )
            })}
            {leads.length===0&&<p className={cx('text-xs text-center py-4',T.muted(dark))}>Nenhum lead ainda</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEAD MODAL
// ══════════════════════════════════════════════════════════════════
function LeadModal({lead,open,onClose,onSave,onDelete,role,addToast,funnels,companyId,dark=true}:any){
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
    onSave({...lead,...form});addToast('Lead salvo!','success');onClose()
  }

  const deleteLead=async()=>{
    const {error}=await sb.from('leads').delete().eq('id',lead.id)
    if(error){addToast('Erro ao excluir.','error');return}
    onDelete(lead.id);addToast('Lead excluído.','success');setDelConfirm(false);onClose()
  }

  const addNote=async()=>{
    if(!note.trim()) return
    const {data,error}=await sb.from('lead_notes').insert({company_id:companyId,lead_id:lead.id,note:note.trim(),user_name:'Você'}).select().single()
    if(!error&&data){setNotes(n=>[data,...n]);setNote('');addToast('Nota adicionada!','success')}
  }

  if(!lead) return null
  return (
    <>
      <Modal open={open} onClose={onClose} title={lead.nome} size="lg" dark={dark}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Nome" value={form.nome} onChange={(v:string)=>set('nome',v)} required icon={User}/>
            <Field dark={dark} label="Telefone" value={form.telefone} onChange={(v:string)=>set('telefone',v)} icon={Phone}/>
          </div>
          <Field dark={dark} label="E-mail" value={form.email} onChange={(v:string)=>set('email',v)} icon={Mail}/>
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Serviço" value={form.servico} onChange={(v:string)=>set('servico',v)} icon={Briefcase}/>
            <Field dark={dark} label="Valor (R$)" value={form.valor_estimado} onChange={(v:string)=>set('valor_estimado',v)} type="number" icon={DollarSign}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel dark={dark} label="Etapa" value={form.pipeline_stage} onChange={(v:string)=>set('pipeline_stage',v)} options={STAGES.map(s=>({value:s,label:s}))}/>
            <Sel dark={dark} label="Status" value={form.status} onChange={(v:string)=>set('status',v)} options={[{value:'ativo',label:'Ativo'},{value:'ganho',label:'Ganho'},{value:'perdido',label:'Perdido'},{value:'inativo',label:'Inativo'}]}/>
          </div>
          {funnels?.length>0&&<Sel dark={dark} label="Funil" value={form.funnel_id||''} onChange={(v:string)=>set('funnel_id',v)} options={[{value:'',label:'Sem funil'},...funnels.map((f:any)=>({value:f.id,label:f.name}))]}/>}
          <div className="flex flex-col gap-1.5">
            <label className={cx('text-xs font-medium',T.sub(dark))}>Nível de Interesse</label>
            <div className="flex gap-1">{[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>set('nivel_interesse',n)} className="p-1">
                <Star size={22} fill={n<=(form.nivel_interesse||0)?'#FBBF24':'none'} stroke={n<=(form.nivel_interesse||0)?'#FBBF24':dark?'#475569':'#cbd5e1'}/>
              </button>
            ))}</div>
          </div>
          <Textarea dark={dark} label="Observações do gestor" value={form.resumo_gestor} onChange={(v:string)=>set('resumo_gestor',v)} placeholder="Notas internas..."/>
          <div className={cx('border-t pt-4',dark?'border-white/[0.06]':'border-slate-200')}>
            <p className={cx('text-xs font-semibold mb-3 flex items-center gap-1.5',T.text(dark))}><MessageSquare size={13}/>Anotações</p>
            <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
              {notes.map((n:any)=>(
                <div key={n.id} className={cx('p-2.5 rounded-xl border',dark?'bg-white/[0.03] border-white/[0.05]':'bg-slate-50 border-slate-200')}>
                  <div className="flex justify-between mb-1">
                    <span className={cx('text-[10px] font-medium',T.text(dark))}>{n.user_name||'Sistema'}</span>
                    <span className={cx('text-[10px]',T.muted(dark))}>{n.created_at?.split('T')[0]}</span>
                  </div>
                  <p className={cx('text-xs',T.sub(dark))}>{n.note}</p>
                </div>
              ))}
              {notes.length===0&&<p className={cx('text-xs text-center py-2',T.muted(dark))}>Sem anotações</p>}
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Nova anotação..." onKeyDown={e=>e.key==='Enter'&&addNote()}
                className={cx('flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none focus:border-emerald-500/50',T.input(dark))}/>
              <button onClick={addNote} className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"><Send size={13}/></button>
            </div>
          </div>
        </div>
        <div className={cx('flex justify-between mt-5 pt-4 border-t',dark?'border-white/[0.06]':'border-slate-200')}>
          {canDel?<button onClick={()=>setDelConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm"><Trash2 size={13}/>Excluir</button>:<div/>}
          <div className="flex gap-2">
            <button onClick={onClose} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400 hover:bg-white/5':'border-slate-200 text-slate-600 hover:bg-slate-50')}>Cancelar</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60">{saving?'Salvando...':'Salvar'}</button>
          </div>
        </div>
      </Modal>
      <Confirm dark={dark} open={delConfirm} onClose={()=>setDelConfirm(false)} onOk={deleteLead} title="Excluir Lead" msg={`Excluir "${lead.nome}"? Esta ação não pode ser desfeita.`}/>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// PIPELINE
// ══════════════════════════════════════════════════════════════════
function Pipeline({leads,setLeads,role,addToast,company,funnels,users,dark}:any){
  const [selected,setSelected]=useState<any>(null)
  const [showNew,setShowNew]=useState(false)
  const [newLead,setNewLead]=useState<any>({pipeline_stage:'Novo Lead',nivel_interesse:3})
  const [dragId,setDragId]=useState<string|null>(null)
  const [dragOver,setDragOver]=useState<string|null>(null)
  const [filterColab,setFilterColab]=useState('all')
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

  const filtered=filterColab==='all'?leads:filterColab==='none'?leads.filter((l:any)=>!l.assigned_to):leads.filter((l:any)=>l.assigned_to===filterColab)

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
      assigned_to:newLead.assigned_to||null,status:'ativo',
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro ao criar: '+error.message,'error');return}
    setLeads((ls:any)=>[data,...ls]);setNewLead({pipeline_stage:'Novo Lead',nivel_interesse:3});setShowNew(false);addToast('Lead criado!','success')
  }

  const getUser=(id:string)=>users?.find((u:any)=>u.id===id)
  const cardBg=dark?'bg-slate-900/80 border-white/[0.07] hover:border-white/[0.15]':'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
  const colBg=(over:boolean)=>dark?(over?'border-white/20 bg-white/[0.05]':'border-white/[0.06] bg-white/[0.015]'):(over?'border-emerald-300 bg-emerald-50/30':'border-slate-200 bg-slate-50/50')

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} title="Pipeline" subtitle={`${filtered.length} leads`} actions={
        <div className="flex gap-2 items-center">
          <select value={filterColab} onChange={e=>setFilterColab(e.target.value)}
            className={cx('text-xs rounded-lg px-2 py-1.5 border focus:outline-none max-w-[130px]',T.input(dark))}>
            <option value="all" className={T.sel(dark)}>Todos</option>
            <option value="none" className={T.sel(dark)}>Sem responsável</option>
            {users?.map((u:any)=><option key={u.id} value={u.id} className={T.sel(dark)}>{u.display_name||u.full_name}</option>)}
          </select>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"><Plus size={13}/>Lead</button>
        </div>
      }/>
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex gap-2.5 h-full" style={{minWidth:`${STAGES.length*185}px`}}>
          {STAGES.map(stage=>{
            const sl=filtered.filter((l:any)=>l.pipeline_stage===stage)
            const sv=sl.reduce((s:number,l:any)=>s+(l.valor_estimado||0),0)
            const m=SM[stage]; const isOver=dragOver===stage
            return (
              <div key={stage} className={cx('flex flex-col rounded-2xl border transition-all flex-1 min-w-[170px]',colBg(isOver))}
                onDragOver={e=>{e.preventDefault();setDragOver(stage)}} onDrop={()=>drop(stage)} onDragLeave={()=>setDragOver(null)}>
                <div className={cx('p-3 border-b',dark?'border-white/[0.06]':'border-slate-200')}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{background:m.dot}}/>
                    {editCol===stage&&canEdit?(
                      <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                        onBlur={()=>saveCol(stage,editVal)} onKeyDown={e=>{if(e.key==='Enter')saveCol(stage,editVal);if(e.key==='Escape')setEditCol(null)}}
                        className={cx('flex-1 bg-transparent text-xs font-semibold focus:outline-none border-b border-emerald-500/60 min-w-0',T.text(dark))}/>
                    ):(
                      <span className={cx('text-xs font-semibold truncate flex-1',T.text(dark))}>{lbl(stage)}</span>
                    )}
                    {canEdit&&<button onClick={()=>{setEditCol(stage);setEditVal(lbl(stage))}} className={cx('shrink-0',T.muted(dark))}><PenLine size={10}/></button>}
                    <span className={cx('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0',m.bg,m.text)}>{sl.length}</span>
                  </div>
                  <p className={cx('text-[10px]',T.muted(dark))}>R${sv.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {sl.map((lead:any)=>{
                    const assignee=lead.assigned_to?getUser(lead.assigned_to):null
                    return (
                      <div key={lead.id} draggable onDragStart={()=>setDragId(lead.id)} onClick={()=>setSelected(lead)}
                        className={cx('p-3 rounded-xl border cursor-pointer transition-all active:scale-95',cardBg)}>
                        <p className={cx('text-xs font-semibold mb-1 leading-tight',T.text(dark))}>{lead.nome}</p>
                        <p className={cx('text-[10px] mb-2',T.muted(dark))}>{lead.servico||'—'}</p>
                        <div className="flex items-center justify-between">
                          <span className={cx('text-xs font-bold',T.text(dark))}>R${(lead.valor_estimado||0).toLocaleString()}</span>
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(n=><Star key={n} size={9} fill={n<=(lead.nivel_interesse||0)?'#FBBF24':'none'} stroke={n<=(lead.nivel_interesse||0)?'#FBBF24':dark?'#334155':'#cbd5e1'}/>)}</div>
                        </div>
                        {assignee&&(
                          <div className={cx('flex items-center gap-1.5 mt-2 pt-2 border-t',dark?'border-white/[0.06]':'border-slate-100')}>
                            <Av name={assignee.display_name||assignee.full_name} size="xs" url={assignee.avatar_url}/>
                            <span className={cx('text-[10px] truncate',T.muted(dark))}>{assignee.display_name||assignee.full_name}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {sl.length===0&&(
                    <div className={cx('flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed',isOver?'border-emerald-400/40':'border-white/[0.04]')}>
                      <Move size={14} className={T.muted(dark)}/><p className={cx('text-[10px] mt-1',T.muted(dark))}>Arraste aqui</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal dark={dark} open={showNew} onClose={()=>setShowNew(false)} title="Novo Lead" size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Nome" value={newLead.nome} onChange={(v:string)=>setNewLead((f:any)=>({...f,nome:v}))} required icon={User}/>
            <Field dark={dark} label="Telefone" value={newLead.telefone} onChange={(v:string)=>setNewLead((f:any)=>({...f,telefone:v}))} icon={Phone}/>
          </div>
          <Field dark={dark} label="Serviço" value={newLead.servico} onChange={(v:string)=>setNewLead((f:any)=>({...f,servico:v}))} icon={Briefcase}/>
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Valor (R$)" value={newLead.valor_estimado} onChange={(v:string)=>setNewLead((f:any)=>({...f,valor_estimado:v}))} type="number" icon={DollarSign}/>
            <Sel dark={dark} label="Etapa" value={newLead.pipeline_stage} onChange={(v:string)=>setNewLead((f:any)=>({...f,pipeline_stage:v}))} options={STAGES.map(s=>({value:s,label:s}))}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel dark={dark} label="Origem" value={newLead.origem||''} onChange={(v:string)=>setNewLead((f:any)=>({...f,origem:v}))} options={[{value:'',label:'Selecione'},{value:'Instagram',label:'Instagram'},{value:'Google Ads',label:'Google Ads'},{value:'WhatsApp',label:'WhatsApp'},{value:'Indicação',label:'Indicação'},{value:'Site',label:'Site'},{value:'Facebook',label:'Facebook'}]}/>
            <Sel dark={dark} label="Responsável" value={newLead.assigned_to||''} onChange={(v:string)=>setNewLead((f:any)=>({...f,assigned_to:v||null}))} options={[{value:'',label:'Sem responsável'},...(users||[]).map((u:any)=>({value:u.id,label:u.display_name||u.full_name}))]}/>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>setShowNew(false)} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">{creating?'Criando...':'Criar Lead'}</button>
          </div>
        </div>
      </Modal>
      <LeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEADS TABLE
// ══════════════════════════════════════════════════════════════════
function LeadsTable({leads,setLeads,role,addToast,company,funnels,dark}:any){
  const [search,setSearch]=useState('')
  const [filterStage,setFilterStage]=useState('all')
  const [sortBy,setSortBy]=useState('created_at')
  const [sortDir,setSortDir]=useState('desc')
  const [page,setPage]=useState(1)
  const [selected,setSelected]=useState<any>(null)
  const PER=8

  const filtered=leads
    .filter((l:any)=>(filterStage==='all'||l.pipeline_stage===filterStage)&&(l.nome?.toLowerCase().includes(search.toLowerCase())||l.servico?.toLowerCase().includes(search.toLowerCase())))
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
      <Header dark={dark} title="Leads" subtitle={`${filtered.length} registros`} actions={
        <button onClick={exportCSV} className={cx('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs',dark?'border-white/10 text-slate-400 hover:text-white':'border-slate-200 text-slate-600 hover:text-slate-900')}><Download size={12}/>CSV</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar leads..."
              className={cx('w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-emerald-500/40',T.input(dark))}/>
          </div>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            className={cx('px-3 py-2 rounded-xl border text-sm focus:outline-none',T.input(dark))}>
            <option value="all" className={T.sel(dark)}>Todas etapas</option>
            {STAGES.map(s=><option key={s} value={s} className={T.sel(dark)}>{s}</option>)}
          </select>
        </div>

        {/* Desktop */}
        <div className={cx('hidden sm:block rounded-2xl border overflow-hidden',T.tbl(dark))}>
          <table className="w-full">
            <thead>
              <tr className={cx('border-b',T.tblH(dark))}>
                {[{k:'nome',l:'Nome'},{k:'servico',l:'Serviço'},{k:'pipeline_stage',l:'Etapa'},{k:'valor_estimado',l:'Valor'},{k:'status',l:'Status'},{k:'created_at',l:'Criado'}].map(c=>(
                  <th key={c.k} onClick={()=>ts(c.k)} className={cx('text-left px-4 py-3 text-xs font-medium cursor-pointer',T.muted(dark))}>
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
                  <tr key={l.id} className={cx('border-b transition-colors',T.tblB(dark),T.row(dark))}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Av name={l.nome} size="sm"/><div><p className={cx('text-xs font-medium',T.text(dark))}>{l.nome}</p><p className={cx('text-[10px]',T.muted(dark))}>{l.telefone}</p></div></div></td>
                    <td className={cx('px-4 py-3 text-xs',T.sub(dark))}>{l.servico}</td>
                    <td className="px-4 py-3"><span className={cx('text-[10px] font-medium px-2 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span></td>
                    <td className={cx('px-4 py-3 text-xs font-semibold',T.text(dark))}>R${(l.valor_estimado||0).toLocaleString()}</td>
                    <td className="px-4 py-3"><Bdg v={sv[l.status]}>{l.status}</Bdg></td>
                    <td className={cx('px-4 py-3 text-[10px]',T.muted(dark))}>{l.created_at?.split('T')[0]}</td>
                    <td className="px-4 py-3"><button onClick={()=>setSelected(l)} className={cx('w-7 h-7 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-500 hover:text-white':'hover:bg-slate-100 text-slate-400 hover:text-slate-900')}><Edit2 size={13}/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paged.length===0&&<div className="py-12 text-center"><p className={cx('text-sm',T.muted(dark))}>Nenhum lead encontrado</p></div>}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {paged.map((l:any)=>{
            const m=SM[l.pipeline_stage]||SM['Novo Lead']
            return (
              <button key={l.id} onClick={()=>setSelected(l)} className={cx('w-full text-left p-4 rounded-2xl border active:scale-95 transition-all',T.card(dark))}>
                <div className="flex items-center gap-3 mb-2">
                  <Av name={l.nome} size="sm"/>
                  <div className="flex-1 min-w-0"><p className={cx('text-sm font-medium truncate',T.text(dark))}>{l.nome}</p><p className={cx('text-xs',T.muted(dark))}>{l.telefone}</p></div>
                  <span className={cx('text-sm font-bold',T.text(dark))}>R${(l.valor_estimado||0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cx('text-[10px] font-medium px-2 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span>
                  <Bdg v={sv[l.status]}>{l.status}</Bdg>
                  <span className={cx('ml-auto text-[10px]',T.muted(dark))}>{l.created_at?.split('T')[0]}</span>
                </div>
              </button>
            )
          })}
          {paged.length===0&&<div className="py-12 text-center"><p className={cx('text-sm',T.muted(dark))}>Nenhum lead</p></div>}
        </div>

        {pages>1&&(
          <div className="flex items-center justify-between mt-4">
            <p className={cx('text-xs',T.muted(dark))}>{filtered.length} resultados</p>
            <div className="flex items-center gap-1">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className={cx('w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-30',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}><ChevronLeft size={13}/></button>
              {Array.from({length:Math.min(pages,5)},(_,i)=>(
                <button key={i} onClick={()=>setPage(i+1)} className={cx('w-8 h-8 rounded-lg text-xs font-medium',page===i+1?'bg-emerald-500 text-white':dark?'text-slate-500 hover:bg-white/10':'text-slate-600 hover:bg-slate-100')}>{i+1}</button>
              ))}
              <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className={cx('w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-30',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>
      <LeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════
function CalendarView({company,addToast,user,dark}:any){
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
    if(data) setMeetings(data);setLoading(false)
  }

  const y=date.getFullYear(),m=date.getMonth()
  const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const DAYS=['D','S','T','Q','Q','S','S']
  const fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate()
  const cells=[...Array(fd).fill(null),...Array.from({length:dim},(_,i)=>i+1)]
  while(cells.length%7!==0) cells.push(null)
  const weeks=Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,(i+1)*7))
  const today=new Date()
  const getMeetings=(day:number)=>{const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return meetings.filter(mt=>mt.start_at?.startsWith(ds))}

  const create=async()=>{
    if(!form.title?.trim()){addToast('Título obrigatório.','error');return}
    const {data,error}=await sb.from('meetings').insert({company_id:company.id,...form,created_by:user.id}).select().single()
    if(error){addToast('Erro ao criar.','error');return}
    setMeetings(ms=>[...ms,data]);setForm({event_type:'reuniao',status:'pendente'});setShowNew(false);addToast('Evento criado!','success')
  }

  const updateStatus=async(id:string,status:string)=>{
    await sb.from('meetings').update({status,updated_at:new Date().toISOString()}).eq('id',id)
    setMeetings(ms=>ms.map(mt=>mt.id===id?{...mt,status}:mt));setSel(null)
    addToast(status==='confirmado'?'Confirmado!':'Cancelado.',status==='confirmado'?'success':'error')
  }

  const TC:any={reuniao:dark?'bg-violet-500/20 text-violet-300 border-violet-500/30':'bg-violet-100 text-violet-700 border-violet-300',visita:dark?'bg-blue-500/20 text-blue-300 border-blue-500/30':'bg-blue-100 text-blue-700 border-blue-300',instalacao:dark?'bg-emerald-500/20 text-emerald-300 border-emerald-500/30':'bg-emerald-100 text-emerald-700 border-emerald-300'}
  const TL:any={reuniao:'Reunião',visita:'Visita',instalacao:'Instalação'}
  const SC:any={confirmado:'text-emerald-400',pendente:'text-amber-400',cancelado:'text-red-400'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} title="Calendário" subtitle="Agendamentos" actions={
        <button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold transition-all"><Plus size={13}/>Evento</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={cx('rounded-2xl border overflow-hidden',T.card(dark))}>
          <div className={cx('flex items-center justify-between p-4 border-b',dark?'border-white/[0.06]':'border-slate-200')}>
            <button onClick={()=>setDate(new Date(y,m-1))} className={cx('w-9 h-9 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronLeft size={16}/></button>
            <p className={cx('text-sm font-semibold',T.text(dark))}>{MONTHS[m]} {y}</p>
            <button onClick={()=>setDate(new Date(y,m+1))} className={cx('w-9 h-9 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronRight size={16}/></button>
          </div>
          <div className={cx('grid grid-cols-7 border-b',dark?'border-white/[0.05]':'border-slate-200')}>
            {DAYS.map((d,i)=><div key={i} className={cx('py-2 text-center text-[10px] font-medium',T.muted(dark))}>{d}</div>)}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} className={cx('grid grid-cols-7 border-b last:border-0',dark?'border-white/[0.04]':'border-slate-100')}>
              {week.map((day:any,di:number)=>{
                const dm=day?getMeetings(day):[]
                const isToday=day&&today.getDate()===day&&today.getMonth()===m&&today.getFullYear()===y
                return (
                  <div key={di} className={cx('min-h-[52px] p-1 border-r last:border-0',dark?'border-white/[0.04]':'border-slate-100',!day&&'opacity-0')}>
                    {day&&<>
                      <span className={cx('text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full mb-0.5',isToday?'bg-emerald-500 text-white':T.muted(dark))}>{day}</span>
                      {dm.slice(0,2).map((mt:any)=><button key={mt.id} onClick={()=>setSel(mt)} className={cx('w-full text-left text-[8px] font-medium px-1 py-0.5 rounded border truncate mb-0.5',TC[mt.event_type])}>{mt.title}</button>)}
                      {dm.length>2&&<p className={cx('text-[8px] px-1',T.muted(dark))}>+{dm.length-2}</p>}
                    </>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Próximos Eventos</p>
          <div className="space-y-2">
            {[...meetings].sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime()).slice(0,5).map(mt=>(
              <button key={mt.id} onClick={()=>setSel(mt)} className={cx('w-full text-left p-3 rounded-xl border transition-all active:scale-95',T.card(dark))}>
                <div className="flex items-start gap-2.5">
                  <div className="w-1 rounded-full mt-1 shrink-0 self-stretch" style={{background:mt.event_type==='visita'?'#60A5FA':mt.event_type==='reuniao'?'#A78BFA':'#34D399'}}/>
                  <div className="flex-1 min-w-0">
                    <p className={cx('text-xs font-medium truncate',T.text(dark))}>{mt.title}</p>
                    <p className={cx('text-[10px]',T.muted(dark))}>{TL[mt.event_type]} · {mt.start_at?.split('T')[0]}</p>
                    <span className={cx('text-[10px] font-medium',SC[mt.status])}>{mt.status}</span>
                  </div>
                </div>
              </button>
            ))}
            {meetings.length===0&&<p className={cx('text-xs text-center py-4',T.muted(dark))}>Sem eventos</p>}
          </div>
        </div>
      </div>

      <Modal dark={dark} open={showNew} onClose={()=>setShowNew(false)} title="Novo Evento" size="md">
        <div className="space-y-3">
          <Field dark={dark} label="Título" value={form.title} onChange={(v:string)=>setForm((f:any)=>({...f,title:v}))} required/>
          <div className="grid grid-cols-2 gap-3">
            <Sel dark={dark} label="Tipo" value={form.event_type} onChange={(v:string)=>setForm((f:any)=>({...f,event_type:v}))} options={[{value:'reuniao',label:'Reunião'},{value:'visita',label:'Visita'},{value:'instalacao',label:'Instalação'}]}/>
            <Sel dark={dark} label="Status" value={form.status} onChange={(v:string)=>setForm((f:any)=>({...f,status:v}))} options={[{value:'pendente',label:'Pendente'},{value:'confirmado',label:'Confirmado'},{value:'cancelado',label:'Cancelado'}]}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Início" value={form.start_at} onChange={(v:string)=>setForm((f:any)=>({...f,start_at:v}))} type="datetime-local"/>
            <Field dark={dark} label="Fim" value={form.end_at} onChange={(v:string)=>setForm((f:any)=>({...f,end_at:v}))} type="datetime-local"/>
          </div>
          <Textarea dark={dark} label="Descrição" value={form.description} onChange={(v:string)=>setForm((f:any)=>({...f,description:v}))} placeholder="Detalhes..."/>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setShowNew(false)} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
            <button onClick={create} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium transition-all">Criar</button>
          </div>
        </div>
      </Modal>

      <Modal dark={dark} open={!!sel} onClose={()=>setSel(null)} title="Detalhes do Evento" size="sm">
        {sel&&<div className="space-y-3">
          <div className={cx('px-2.5 py-1.5 rounded-xl border text-xs font-medium inline-block',TC[sel.event_type])}>{TL[sel.event_type]}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className={T.muted(dark)}>Título</span><span className={cx('font-medium',T.text(dark))}>{sel.title}</span></div>
            <div className="flex justify-between text-xs"><span className={T.muted(dark)}>Início</span><span className={T.text(dark)}>{sel.start_at?.replace('T',' ').slice(0,16)}</span></div>
            <div className="flex justify-between text-xs"><span className={T.muted(dark)}>Status</span><span className={cx('font-medium',SC[sel.status])}>{sel.status}</span></div>
            {sel.description&&<p className={cx('text-xs pt-2 border-t',dark?'border-white/[0.06] text-slate-400':'border-slate-200 text-slate-600')}>{sel.description}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>updateStatus(sel.id,'cancelado')} className="flex-1 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 active:scale-95 transition-all">Cancelar</button>
            <button onClick={()=>updateStatus(sel.id,'confirmado')} className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm transition-all">Confirmar</button>
          </div>
        </div>}
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// COLABORADORES
// ══════════════════════════════════════════════════════════════════
function Colaboradores({company,user,addToast,dark}:any){
  const [colabs,setColabs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showNew,setShowNew]=useState(false)
  const [form,setForm]=useState<any>({role:'colaborador'})
  const [creating,setCreating]=useState(false)
  const [editRole,setEditRole]=useState<any>(null)
  const [delConfirm,setDelConfirm]=useState<any>(null)
  // Gestor não pode mexer em founder
  const canManage=['founder','gestor'].includes(user.role)

  useEffect(()=>{load()},[])
  const load=async()=>{
    setLoading(true)
    const {data}=await sb.from('users').select('*').eq('company_id',company.id).eq('active',true).order('created_at')
    if(data) setColabs(data);setLoading(false)
  }

  const create=async()=>{
    if(!form.full_name?.trim()||!form.username?.trim()||!form.password_hash?.trim()){addToast('Nome, usuário e senha são obrigatórios.','error');return}
    setCreating(true)
    const {data,error}=await sb.from('users').insert({
      company_id:company.id,full_name:form.full_name.trim(),
      display_name:form.display_name?.trim()||form.full_name.trim(),
      email:form.email?.trim()||null,username:form.username.trim().toLowerCase(),
      password_hash:form.password_hash,role:form.role||'colaborador',active:true,
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro: '+error.message,'error');return}
    setColabs(c=>[...c,data]);setForm({role:'colaborador'});setShowNew(false);addToast('Colaborador cadastrado!','success')
  }

  const updateRole=async()=>{
    if(!editRole) return
    // Gestor não pode mudar role de founder
    if(user.role==='gestor'&&editRole.originalRole==='founder'){addToast('Sem permissão para alterar o Founder.','error');return}
    const {error}=await sb.from('users').update({role:editRole.role,updated_at:new Date().toISOString()}).eq('id',editRole.id)
    if(error){addToast('Erro ao atualizar.','error');return}
    setColabs(cs=>cs.map(c=>c.id===editRole.id?{...c,role:editRole.role}:c));setEditRole(null);addToast('Cargo atualizado!','success')
  }

  const remove=async()=>{
    if(!delConfirm) return
    // Gestor não pode remover founder
    if(user.role==='gestor'&&delConfirm.role==='founder'){addToast('Sem permissão para remover o Founder.','error');setDelConfirm(null);return}
    const {error}=await sb.from('users').update({active:false,updated_at:new Date().toISOString()}).eq('id',delConfirm.id)
    if(error){addToast('Erro ao remover.','error');return}
    setColabs(cs=>cs.filter(c=>c.id!==delConfirm.id));setDelConfirm(null);addToast('Colaborador removido.','success')
  }

  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RV:any={founder:'violet',gestor:'info',colaborador:'default'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} title="Colaboradores" subtitle={`${colabs.length} membros`} actions={
        canManage&&<button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold transition-all"><UserPlus size={13}/>Cadastrar</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        {loading
          ?<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3].map(i=><Sk key={i} className="h-24 rounded-2xl"/>)}</div>
          :<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colabs.map(c=>{
              const isMe=c.id===user.id
              // Gestor não pode editar/remover founder
              const canEditThis=canManage&&!isMe&&!(user.role==='gestor'&&c.role==='founder')
              return (
                <div key={c.id} className={cx('p-4 rounded-2xl border',T.card(dark))}>
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Av name={c.display_name||c.full_name} size="lg" url={c.avatar_url}/>
                      {isMe&&<div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center"><User size={8} className="text-white"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cx('text-sm font-semibold',T.text(dark))}>{isMe?'Você':c.display_name||c.full_name}</p>
                      {isMe&&<p className={cx('text-xs truncate',T.muted(dark))}>{c.full_name}</p>}
                      <p className={cx('text-[10px] font-mono mt-0.5',T.muted(dark))}>@{c.username||'—'}</p>
                      <div className="mt-1.5"><Bdg v={RV[c.role]}>{RL[c.role]}</Bdg></div>
                    </div>
                    {canEditThis&&(
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={()=>setEditRole({...c,originalRole:c.role})} className={cx('w-8 h-8 rounded-lg flex items-center justify-center transition-colors',dark?'hover:bg-white/10 text-slate-500 hover:text-violet-400':'hover:bg-violet-50 text-slate-400 hover:text-violet-600')}><Shield size={13}/></button>
                        <button onClick={()=>setDelConfirm(c)} className={cx('w-8 h-8 rounded-lg flex items-center justify-center transition-colors',dark?'hover:bg-red-500/10 text-slate-500 hover:text-red-400':'hover:bg-red-50 text-slate-400 hover:text-red-500')}><Trash2 size={13}/></button>
                      </div>
                    )}
                  </div>
                  {c.email&&<p className={cx('text-[10px] mt-2 flex items-center gap-1.5',T.muted(dark))}><Mail size={10}/>{c.email}</p>}
                </div>
              )
            })}
          </div>
        }
      </div>

      <Modal dark={dark} open={showNew} onClose={()=>{setShowNew(false);setForm({role:'colaborador'})}} title="Cadastrar Colaborador" size="md">
        <div className="space-y-3">
          <Field dark={dark} label="Nome completo" value={form.full_name} onChange={(v:string)=>setForm((f:any)=>({...f,full_name:v}))} required icon={User}/>
          <Field dark={dark} label="Nome de exibição" value={form.display_name} onChange={(v:string)=>setForm((f:any)=>({...f,display_name:v}))} placeholder="Apelido (opcional)"/>
          <Field dark={dark} label="E-mail" value={form.email} onChange={(v:string)=>setForm((f:any)=>({...f,email:v}))} icon={Mail} type="email"/>
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Login (usuário)" value={form.username} onChange={(v:string)=>setForm((f:any)=>({...f,username:v}))} required icon={Hash}/>
            <Field dark={dark} label="Senha" value={form.password_hash} onChange={(v:string)=>setForm((f:any)=>({...f,password_hash:v}))} required type="password"/>
          </div>
          <Sel dark={dark} label="Cargo" value={form.role} onChange={(v:string)=>setForm((f:any)=>({...f,role:v}))} options={[{value:'colaborador',label:'Colaborador'},{value:'gestor',label:'Gestor'},...(user.role==='founder'?[{value:'founder',label:'Founder'}]:[])]}/>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>{setShowNew(false);setForm({role:'colaborador'})}} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">{creating?'Cadastrando...':'Cadastrar'}</button>
          </div>
        </div>
      </Modal>

      <Modal dark={dark} open={!!editRole} onClose={()=>setEditRole(null)} title={`Cargo — ${editRole?.full_name}`} size="sm">
        {editRole&&<div className="space-y-4">
          <Sel dark={dark} label="Novo cargo" value={editRole.role} onChange={(v:string)=>setEditRole((e:any)=>({...e,role:v}))} options={[{value:'colaborador',label:'Colaborador'},{value:'gestor',label:'Gestor'},...(user.role==='founder'?[{value:'founder',label:'Founder'}]:[])]}/>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setEditRole(null)} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
            <button onClick={updateRole} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium active:scale-95 transition-all">Salvar</button>
          </div>
        </div>}
      </Modal>
      <Confirm dark={dark} open={!!delConfirm} onClose={()=>setDelConfirm(null)} onOk={remove} title="Remover Colaborador" msg={`Remover "${delConfirm?.full_name}"? O acesso será revogado.`}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SETTINGS — apagar foto, sem aviso de bucket
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
    const {error}=await sb.from('users').update({display_name:dn,full_name:dn,email:uForm.email.trim()||null,updated_at:new Date().toISOString()}).eq('id',user.id)
    setSaving(false)
    if(error){addToast('Erro: '+error.message,'error');return}
    setUser((u:any)=>({...u,display_name:dn,full_name:dn,email:uForm.email}));addToast('Perfil salvo!','success')
  }

  const saveCompany=async()=>{
    if(!cForm.company_name.trim()){addToast('Nome obrigatório.','error');return}
    setSavingC(true)
    const {error}=await sb.from('companies').update({company_name:cForm.company_name.trim(),updated_at:new Date().toISOString()}).eq('id',company.id)
    setSavingC(false)
    if(error){addToast('Erro: '+error.message,'error');return}
    setCompany((c:any)=>({...c,company_name:cForm.company_name.trim()}));addToast('Empresa salva!','success')
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
      const ext=file.name.split('.').pop()
      const url=await upload(file,'avatars',`${user.id}/avatar_${Date.now()}.${ext}`)
      const urlC=`${url}?t=${Date.now()}`
      await sb.from('users').update({avatar_url:urlC}).eq('id',user.id)
      setUser((u:any)=>({...u,avatar_url:urlC}));addToast('Foto atualizada!','success')
    }catch{addToast('Erro no upload.','error')}
    setUpAvatar(false)
  }

  const deleteAvatar=async()=>{
    await sb.from('users').update({avatar_url:null}).eq('id',user.id)
    setUser((u:any)=>({...u,avatar_url:null}));addToast('Foto removida.','success')
  }

  const handleLogo=async(e:any)=>{
    const file=e.target.files?.[0];if(!file) return
    setUpLogo(true)
    try{
      const ext=file.name.split('.').pop()
      const url=await upload(file,'logos',`${company.id}/logo_${Date.now()}.${ext}`)
      const urlC=`${url}?t=${Date.now()}`
      await sb.from('companies').update({company_logo_url:urlC}).eq('id',company.id)
      setCompany((c:any)=>({...c,company_logo_url:urlC}));addToast('Logo atualizada!','success')
    }catch{addToast('Erro no upload.','error')}
    setUpLogo(false)
  }

  const cardCls=cx('p-4 rounded-2xl border',T.card(dark))

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} title="Configurações"/>
      <div className="p-4 space-y-4 max-w-lg">
        {/* Perfil */}
        <div className={cardCls}>
          <p className={cx('text-xs font-semibold mb-4',T.text(dark))}>Meu Perfil</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Av name={user.display_name||user.full_name} size="xl" url={user.avatar_url}/>
              <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-md',upAvatar&&'opacity-50')}>
                {upAvatar?<RefreshCw size={10} className="text-white animate-spin"/>:<Camera size={10} className="text-white"/>}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={upAvatar}/>
              </label>
            </div>
            <div className="flex-1">
              <p className={cx('text-sm font-semibold',T.text(dark))}>{user.full_name}</p>
              <span className={cx('text-xs font-medium px-2 py-0.5 rounded-full border mt-1 inline-block',RC[user.role])}>{RL[user.role]}</span>
              {user.avatar_url&&(
                <button onClick={deleteAvatar} className="ml-2 text-xs text-red-400 hover:text-red-500 underline">Remover foto</button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <Field dark={dark} label="Nome de exibição" value={uForm.display_name} onChange={(v:string)=>setUForm(f=>({...f,display_name:v}))} icon={User} required/>
            <Field dark={dark} label="E-mail" value={uForm.email} onChange={(v:string)=>setUForm(f=>({...f,email:v}))} icon={Mail} type="email"/>
            <Field dark={dark} label="Cargo" value={RL[user.role]} disabled/>
          </div>
          <button onClick={saveUser} disabled={saving}
            className="mt-4 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">
            {saving?'Salvando...':'Salvar perfil'}
          </button>
        </div>

        {/* Empresa */}
        {canEditCompany&&(
          <div className={cardCls}>
            <p className={cx('text-xs font-semibold mb-4',T.text(dark))}>Empresa</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {company.company_logo_url
                  ?<img src={company.company_logo_url} className={cx('w-14 h-14 rounded-xl object-contain p-1 border',dark?'bg-white/5 border-white/10':'bg-slate-50 border-slate-200')} alt="logo"/>
                  :<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center"><Zap size={22} className="text-white"/></div>
                }
                <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-md',upLogo&&'opacity-50')}>
                  {upLogo?<RefreshCw size={10} className="text-white animate-spin"/>:<Upload size={10} className="text-white"/>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} disabled={upLogo}/>
                </label>
              </div>
              <div>
                <p className={cx('text-sm font-semibold',T.text(dark))}>{company.company_name}</p>
                <p className={cx('text-xs font-mono',T.muted(dark))}>@{company.company_slug}</p>
              </div>
            </div>
            <Field dark={dark} label="Nome da empresa" value={cForm.company_name} onChange={(v:string)=>setCForm(f=>({...f,company_name:v}))} icon={Building2}/>
            <button onClick={saveCompany} disabled={savingC}
              className="mt-3 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">
              {savingC?'Salvando...':'Salvar empresa'}
            </button>
          </div>
        )}

        {/* Tema */}
        <div className={cardCls}>
          <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Aparência</p>
          <div className="flex items-center justify-between">
            <div>
              <p className={cx('text-sm font-medium',T.text(dark))}>Modo {dark?'Escuro':'Claro'}</p>
              <p className={cx('text-xs',T.muted(dark))}>Altera o tema do CRM</p>
            </div>
            <button onClick={()=>setDark((d:boolean)=>!d)}
              className={cx('relative w-12 h-6 rounded-full transition-colors duration-300',dark?'bg-emerald-500':'bg-slate-300')}>
              <div className={cx('absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',dark?'left-7':'left-1')}/>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className={cx('p-4 rounded-2xl border',dark?'border-red-500/10 bg-red-500/[0.02]':'border-red-200 bg-red-50/50')}>
          <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm transition-all w-full active:scale-95">
            <LogOut size={14}/>Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SUPORTE
// ══════════════════════════════════════════════════════════════════
function Suporte({company,user,addToast,dark}:any){
  const [msg,setMsg]=useState('')
  const [sending,setSending]=useState(false)
  const [tickets,setTickets]=useState<any[]>([])

  useEffect(()=>{
    sb.from('support_tickets').select('*').eq('company_id',company.id).order('created_at',{ascending:false}).then(({data})=>{if(data)setTickets(data)})
  },[])

  const send=async()=>{
    if(!msg.trim()){addToast('Digite uma mensagem.','error');return}
    setSending(true)
    const {data}=await sb.from('support_tickets').insert({company_id:company.id,user_id:user.id,user_name:user.display_name||user.full_name,message:msg.trim(),status:'aberto'}).select().single()
    try{await fetch(N8N,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'suporte',empresa:company.company_name,empresa_slug:company.company_slug,usuario:user.display_name||user.full_name,cargo:user.role,mensagem:msg.trim(),timestamp:new Date().toISOString()})})}catch{}
    if(data) setTickets(t=>[data,...t])
    setMsg('');setSending(false);addToast('Mensagem enviada!','success')
  }

  const SC:any={aberto:'warning',respondido:'success',fechado:'default'}
  const cardCls=cx('p-4 rounded-2xl border',T.card(dark))

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} title="Suporte" subtitle="Fale com a equipe Flüxa"/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={cardCls}>
          <p className={cx('text-xs font-semibold mb-3 flex items-center gap-2',T.text(dark))}><HeadphonesIcon size={13}/>Nova mensagem</p>
          <Textarea dark={dark} value={msg} onChange={setMsg} placeholder="Descreva sua dúvida ou problema..." rows={4}/>
          <button onClick={send} disabled={sending}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 w-full justify-center transition-all">
            {sending?<><RefreshCw size={13} className="animate-spin"/>Enviando...</>:<><Send size={13}/>Enviar ao Suporte</>}
          </button>
        </div>
        <p className={cx('text-xs text-center',T.muted(dark))}>Respondemos em até 24h úteis via WhatsApp.</p>
        {tickets.length>0&&(
          <div className={cardCls}>
            <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Histórico</p>
            <div className="space-y-2">
              {tickets.map(t=>(
                <div key={t.id} className={cx('p-3 rounded-xl border',dark?'bg-white/[0.02] border-white/[0.05]':'bg-slate-50 border-slate-200')}>
                  <div className="flex justify-between items-center mb-1.5">
                    <Bdg v={SC[t.status]}>{t.status}</Bdg>
                    <span className={cx('text-[10px]',T.muted(dark))}>{t.created_at?.split('T')[0]}</span>
                  </div>
                  <p className={cx('text-xs',T.sub(dark))}>{t.message}</p>
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

  const login=({company,user}:any)=>{setSession({company,user});loadData(company.id);addToast(`Bem-vindo, ${user.display_name||user.full_name}! 👋`,'success')}
  const logout=()=>{setSession(null);setLeads([]);setFunnels([]);setUsers([]);setTab('dashboard')}
  const setUser=(fn:any)=>setSession((s:any)=>({...s,user:typeof fn==='function'?fn(s.user):fn}))
  const setCompany=(fn:any)=>setSession((s:any)=>({...s,company:typeof fn==='function'?fn(s.company):fn}))

  if(!session) return <Login onLogin={login}/>

  const {company,user}=session
  const p={company,user,addToast,leads,setLeads,funnels,users,role:user.role,dark}

  const pages:any={
    dashboard:     <Dashboard {...p}/>,
    pipeline:      <Pipeline {...p}/>,
    leads:         <LeadsTable {...p}/>,
    calendar:      <CalendarView {...p}/>,
    colaboradores: <Colaboradores company={company} user={user} addToast={addToast} dark={dark}/>,
    settings:      <SettingsPage user={user} company={company} dark={dark} setDark={setDark} onLogout={logout} addToast={addToast} setUser={setUser} setCompany={setCompany}/>,
    suporte:       <Suporte company={company} user={user} addToast={addToast} dark={dark}/>,
  }

  return (
    <div className={cx('flex h-screen w-screen overflow-hidden',T.bg(dark))} style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <Sidebar active={tab} setActive={setTab} company={company} user={user} onLogout={logout} open={sideOpen} setOpen={setSideOpen} dark={dark} setDark={setDark}/>
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {pages[tab]||pages.dashboard}
      </main>
      <Toast toasts={toasts} rm={rmToast}/>
    </div>
  )
}
