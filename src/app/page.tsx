'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import {
  LayoutDashboard, GitBranch, Users, Calendar, Settings, LogOut,
  Search, Plus, ChevronRight, ChevronLeft, TrendingUp, DollarSign,
  Target, X, Edit2, Trash2, Phone, Mail, MessageSquare, AlertCircle,
  ChevronDown, Download, Star, Zap, CheckCircle, RefreshCw,
  Upload, User, Building2, Move, Briefcase, ChevronUp, Camera, Shield, Clock, MessageCircle,
  UserPlus, PenLine, HeadphonesIcon, Send, Menu, Eye, EyeOff, Hash, Bell,
  Lock, Globe, BarChart2
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const N8N = process.env.NEXT_PUBLIC_N8N_WEBHOOK || ''
const cx = (...a: any[]) => a.filter(Boolean).join(' ')
const FLUXA_SLUG = 'fluxa'
const STAGES = ['Novo Lead','Qualificado','Proposta','Negociação','Visita Agendada','Fechado','Perdido']
const SM: Record<string,{dot:string,bg:string,text:string,border:string}> = {
  'Novo Lead':       {dot:'#60A5FA',bg:'bg-blue-500/15',   text:'text-blue-400',   border:'border-blue-500/30'},
  'Qualificado':     {dot:'#A78BFA',bg:'bg-violet-500/15', text:'text-violet-400', border:'border-violet-500/30'},
  'Proposta':        {dot:'#FB923C',bg:'bg-orange-500/15', text:'text-orange-400', border:'border-orange-500/30'},
  'Negociação':      {dot:'#FBBF24',bg:'bg-amber-500/15',  text:'text-amber-400',  border:'border-amber-500/30'},
  'Visita Agendada': {dot:'#38BDF8',bg:'bg-sky-500/15',    text:'text-sky-400',    border:'border-sky-500/30'},
  'Fechado':         {dot:'#34D399',bg:'bg-sky-500/15',text:'text-sky-400',border:'border-sky-500/30'},
  'Perdido':         {dot:'#F87171',bg:'bg-red-500/15',    text:'text-red-400',    border:'border-red-500/30'},
}

// ── Theme ────────────────────────────────────────────────────────
// Paleta Flüxa: Cinza escuro + Branco (#F1F1F1) + Azul Celeste (#38BDF8)
const T = {
  bg:     (d:boolean) => d ? 'bg-[#0f1117]'      : 'bg-[#f1f1f1]',
  card:   (d:boolean) => d ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm',
  sidebar:(d:boolean) => d ? 'bg-[#0a0d14] border-white/[0.06]'    : 'bg-white border-slate-200',
  header: (d:boolean) => d ? 'bg-[#0a0d14]/90 border-white/[0.06]' : 'bg-white/90 border-slate-200',
  input:  (d:boolean) => d ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
  text:   (d:boolean) => d ? 'text-[#f1f1f1]'    : 'text-slate-900',
  sub:    (d:boolean) => d ? 'text-slate-300' : 'text-slate-700',
  muted:  (d:boolean) => d ? 'text-slate-500' : 'text-slate-500',
  nav:    (d:boolean) => d ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  navA:   (d:boolean) => d ? 'bg-sky-500/15 text-sky-400' : 'bg-sky-100 text-sky-800 font-semibold',
  modal:  (d:boolean) => d ? 'bg-[#13171f] border-white/10'       : 'bg-white border-slate-300',
  row:    (d:boolean) => d ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50',
  tbl:    (d:boolean) => d ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-slate-300',
  tblH:   (d:boolean) => d ? 'bg-white/[0.03] border-white/[0.08] text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600',
  tblB:   (d:boolean) => d ? 'border-white/[0.05]' : 'border-slate-200',
  sel:    (d:boolean) => d ? 'bg-[#13171f] text-white'             : 'bg-white text-slate-900',
  statCard:(d:boolean,color:string) => d
    ? `bg-gradient-to-br ${color} border-white/[0.07]`
    : `bg-white border-slate-300 shadow-sm`,
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({toasts,rm}:any){
  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t:any)=>(
        <div key={t.id} className={cx('pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border',
          t.type==='success'?'bg-sky-950/95 border-sky-500/30 text-sky-300':
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
    default:'bg-slate-500/20 text-slate-500 border-slate-400/30',
    success:'bg-sky-500/15 text-sky-600 border-sky-400/40',
    warning:'bg-amber-500/15 text-amber-600 border-amber-400/40',
    danger: 'bg-red-500/15 text-red-600 border-red-400/40',
    info:   'bg-blue-500/15 text-blue-600 border-blue-400/40',
    violet: 'bg-violet-500/15 text-violet-600 border-violet-400/40',
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
        <button onClick={onClose} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400 hover:bg-white/5':'border-slate-300 text-slate-600 hover:bg-slate-50')}>Cancelar</button>
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
          className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 transition-all py-2.5',
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
        className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 px-3 py-2.5 appearance-none cursor-pointer',T.input(dark))}>
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
        className={cx('w-full rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 px-3 py-2.5 resize-none',T.input(dark))}/>
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
  const [forgot,setForgot]=useState(false)
  const [forgotUser,setForgotUser]=useState('')
  const [forgotSlug,setForgotSlug]=useState('')
  const [forgotSent,setForgotSent]=useState(false)
  const [sending,setSending]=useState(false)

  const handle=async()=>{
    setErr('');setLoading(true)
    try{
      const {data:co}=await sb.from('companies').select('*').eq('company_slug',slug.trim().toLowerCase()).eq('crm_active',true).single()
      if(!co){setErr('Empresa não encontrada.');setLoading(false);return}

      // Tentativa normal: usuário da própria empresa
      const {data:usr}=await sb.from('users').select('*').eq('company_id',co.id).eq('username',user.trim().toLowerCase()).eq('active',true).single()
      if(usr){
        const senhaOk=usr.password_hash?.startsWith('$2')
          ?await bcrypt.compare(pass,usr.password_hash)
          :usr.password_hash===pass
        if(senhaOk){onLogin({company:co,user:usr});setLoading(false);return}
      }

      // Superadmin: verifica se é um founder da Flüxa tentando acessar outra empresa
      const {data:fluxaCo}=await sb.from('companies').select('*').eq('company_slug','fluxa').single()
      if(fluxaCo){
        const {data:superUser}=await sb.from('users').select('*').eq('company_id',fluxaCo.id).eq('username',user.trim().toLowerCase()).eq('role','founder').eq('active',true).single()
        if(superUser){
          const senhaOk=superUser.password_hash?.startsWith('$2')
            ?await bcrypt.compare(pass,superUser.password_hash)
            :superUser.password_hash===pass
          if(senhaOk){
            onLogin({company:co,user:{...superUser,_superadmin:true,_superadmin_company:fluxaCo}})
            setLoading(false);return
          }
        }
      }

      setErr('Usuário ou senha inválidos.')
    }catch{setErr('Erro de conexão.')}
    setLoading(false)
  }

  const sendForgot=async()=>{
    if(!forgotSlug.trim()||!forgotUser.trim()){return}
    setSending(true)
    try{
      const {data:co}=await sb.from('companies').select('*').eq('company_slug',forgotSlug.trim().toLowerCase()).single()
      const {data:usr}=co?await sb.from('users').select('*').eq('company_id',co.id).eq('username',forgotUser.trim().toLowerCase()).single():{data:null}
      await fetch('/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        type:'esqueci_senha',empresa:forgotSlug.trim(),usuario:forgotUser.trim(),
        empresa_nome:co?.company_name||forgotSlug,usuario_nome:usr?.full_name||forgotUser,
        timestamp:new Date().toISOString()
      })})
      setForgotSent(true)
    }catch(e){
      console.error('Webhook erro:',e)
      setForgotSent(true)
    }
    setSending(false)
  }

  if(forgot) return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center"><Zap size={18} className="text-white"/></div>
            <span className="text-xl font-bold text-white">Flüxa <span className="text-sky-400">CRM</span></span>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          {forgotSent?(
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto"><CheckCircle size={22} className="text-sky-400"/></div>
              <p className="text-white font-semibold text-sm">Solicitação enviada!</p>
              <p className="text-slate-400 text-xs">Nossa equipe recebeu seu pedido e entrará em contato para redefinir sua senha.</p>
              <button onClick={()=>{setForgot(false);setForgotSent(false)}} className="text-sky-400 text-xs hover:underline">Voltar ao login</button>
            </div>
          ):(
            <div className="space-y-3">
              <p className="text-white font-semibold text-sm mb-1">Esqueci minha senha</p>
              <p className="text-slate-400 text-xs mb-3">Informe seus dados e nossa equipe irá redefinir sua senha.</p>
              <Field label="Empresa" value={forgotSlug} onChange={setForgotSlug} placeholder="company-slug" icon={Building2}/>
              <Field label="Usuário" value={forgotUser} onChange={setForgotUser} placeholder="seu-usuario" icon={User}/>
              <button onClick={sendForgot} disabled={sending||!forgotSlug||!forgotUser}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
                {sending?'Enviando...':'Solicitar redefinição'}
              </button>
              <button onClick={()=>setForgot(false)} className="w-full text-slate-500 text-xs hover:text-slate-300 text-center">Voltar ao login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl pointer-events-none"/>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <img src="/logologin.png" alt="Flüxa" className="w-10 h-10 rounded-xl object-contain" onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
            <span className="text-2xl font-bold text-white">Flüxa <span className="text-sky-400">CRM</span></span>
          </div>
          <p className="text-slate-500 text-xs">Acesse o painel da sua empresa</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl">
          <div className="space-y-3">
            <Field label="Empresa" value={slug} onChange={setSlug} placeholder="Nome da empresa" required icon={Building2}/>
            <Field label="Usuário" value={user} onChange={setUser} placeholder="Seu usuário" required icon={User}/>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Senha <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handle()}
                  className="w-full pl-3 pr-9 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
            {err&&<div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle size={13}/>{err}</div>}
            <button onClick={handle} disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-60 active:scale-95 transition-all">
              {loading?<span className="flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin"/>Entrando...</span>:'Entrar'}
            </button>
            <button onClick={()=>setForgot(true)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-white hover:border-white/20 transition-all">
              <Lock size={11}/>Esqueci minha senha
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════
function Sidebar({active,setActive,company,user,onLogout,open,setOpen,dark,setDark}:any){
  const isHub=company.company_slug===FLUXA_SLUG&&user.role==='founder'
  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RC:any={founder:'text-amber-400',gestor:'text-violet-400',colaborador:'text-blue-400'}

  const canManageEli=['founder','gestor'].includes(user.role)

  const topNav=isHub?[
    {id:'hub_dashboard',  label:'Dashboard',       icon:LayoutDashboard},
    {id:'fluxa_funil',    label:'Funil de Vendas', icon:GitBranch},
    {id:'fluxa_prospects',label:'Prospects',        icon:Users},
    {id:'fluxa_calendario',label:'Calendário',       icon:Calendar},
    {id:'hub_empresas',   label:'Empresas',         icon:Globe},
    {id:'hub_criar',      label:'Criar Empresa',    icon:Plus},
    {id:'colaboradores',  label:'Colaboradores',    icon:Shield},
  ]:[
    {id:'dashboard',      label:'Dashboard',        icon:LayoutDashboard},
    {id:'pipeline',       label:'Pipeline',         icon:GitBranch},
    {id:'leads',          label:'Leads',            icon:Users},
    {id:'calendar',       label:'Calendário',       icon:Calendar},
    {id:'colaboradores',  label:'Colaboradores',    icon:Shield},
    ...(canManageEli?[
      {id:'eli_config',     label:'Configurar Eli',  icon:Zap},
      {id:'fornecedores',   label:'Fornecedores',    icon:Briefcase},
    ]:[]),
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
      {active===id&&<div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400"/>}
    </button>
  )

  const inner=(
    <div className={cx('flex flex-col h-full border-r',T.sidebar(dark))}>
      <div className={cx('flex items-center gap-2.5 px-4 h-14 border-b shrink-0',dark?'border-white/[0.06]':'border-slate-200')}>
        {company.company_logo_url
          ?<img src={company.company_logo_url} className="w-8 h-8 rounded-lg object-contain" alt="logo"/>
          :<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shrink-0"><Zap size={14} className="text-white"/></div>
        }
        <div className="min-w-0 flex-1">
          <p className={cx('text-xs font-bold truncate',T.text(dark))}>{company.company_name}</p>
          <p className={cx('text-[10px]',T.muted(dark))}>@{company.company_slug}</p>
        </div>
        <button onClick={()=>setOpen(false)} className={cx('sm:hidden',dark?'text-slate-500':'text-slate-400')}><X size={16}/></button>
      </div>
      {isHub&&(
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Zap size={10} className="text-sky-400"/>
            <span className="text-[10px] font-semibold text-sky-400">Hub de Controle</span>
          </div>
        </div>
      )}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {topNav.map(n=><NavBtn key={n.id} {...n}/>)}
      </nav>
      <div className={cx('px-2 py-2 border-t space-y-0.5',dark?'border-white/[0.06]':'border-slate-200')}>
        {bottomNav.map(n=><NavBtn key={n.id} {...n}/>)}
      </div>
      <div className={cx('p-2 border-t',dark?'border-white/[0.06]':'border-slate-200')}>
        <button onClick={()=>setDark((d:boolean)=>!d)}
          className={cx('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm mb-1',T.nav(dark))}>
          <span className="text-base">{dark?'☀️':'🌙'}</span>
          <span className={cx('font-medium text-sm',dark?'text-slate-400':'text-slate-600')}>{dark?'Modo Claro':'Modo Escuro'}</span>
        </button>
        <div className={cx('flex items-center gap-2.5 px-3 py-2 rounded-xl',dark?'bg-white/[0.02]':'bg-slate-50')}>
          <Av name={user.display_name||user.full_name} size="sm" url={user.avatar_url}/>
          <div className="flex-1 min-w-0">
            <p className={cx('text-xs font-semibold truncate',T.text(dark))}>{user.display_name||user.full_name}</p>
            {user._superadmin
              ? <p className="text-[10px] font-medium text-sky-400">⚡ Superadmin</p>
              : <p className={cx('text-[10px] font-medium',RC[user.role])}>{RL[user.role]}</p>
            }
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
function Dashboard({leads,company,addToast,dark,onMenu}:any){
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setTimeout(()=>setLoading(false),400)},[])

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

  const stats=[
    {label:'Total Leads',val:String(total),icon:Users,       iconBg:dark?'bg-blue-500/20':'bg-blue-100',   iconCl:dark?'text-blue-400':'text-blue-700',   valCl:dark?'text-white':'text-slate-900', border:dark?'border-white/[0.07]':'border-blue-200'},
    {label:'Conversão',  val:`${conv}%`,   icon:Target,      iconBg:dark?'bg-sky-500/20':'bg-sky-100', iconCl:dark?'text-sky-400':'text-sky-700', valCl:dark?'text-white':'text-slate-900', border:dark?'border-white/[0.07]':'border-sky-200'},
    {label:'Ticket Médio',val:`R$${ticket.toLocaleString()}`,icon:DollarSign,iconBg:dark?'bg-violet-500/20':'bg-violet-100',iconCl:dark?'text-violet-400':'text-violet-700',valCl:dark?'text-white':'text-slate-900',border:dark?'border-white/[0.07]':'border-violet-200'},
    {label:'Negociação', val:`R$${(negoc/1000).toFixed(0)}k`,icon:TrendingUp,iconBg:dark?'bg-amber-500/20':'bg-amber-100', iconCl:dark?'text-amber-400':'text-amber-700', valCl:dark?'text-white':'text-slate-900', border:dark?'border-white/[0.07]':'border-amber-200'},
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} onMenu={onMenu} title="Dashboard" subtitle={company.company_name} actions={
        <button onClick={exportCSV} className={cx('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs',dark?'border-white/10 text-slate-400 hover:text-white':'border-slate-300 text-slate-600 hover:text-slate-900')}><Download size={12}/>CSV</button>
      }/>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({label,val,icon:Icon,iconBg,iconCl,valCl,border})=>(
            <div key={label} className={cx('p-4 rounded-2xl border',dark?'bg-white/[0.03]':'bg-white shadow-sm',border)}>
              <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center mb-3',iconBg)}><Icon size={16} className={iconCl}/></div>
              {loading?<Sk className="h-7 w-20 mb-1"/>:<p className={cx('text-xl font-bold mb-0.5',valCl)}>{val}</p>}
              <p className={cx('text-xs font-medium',dark?'text-slate-400':'text-slate-600')}>{label}</p>
            </div>
          ))}
        </div>

        <div className={cx('p-4 rounded-2xl border overflow-hidden',T.card(dark))}>
          <p className={cx('text-sm font-semibold mb-1',T.text(dark))}>Evolução de Leads</p>
          <p className={cx('text-[11px] mb-3',T.muted(dark))}>Últimos 6 meses — dados reais</p>
          {loading?<Sk className="h-36"/>:(
            <div style={{height:140}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/><stop offset="95%" stopColor="#34D399" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.08)"}/>
                  <XAxis dataKey="month" tick={{fill:dark?'#64748B':'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:dark?'#64748B':'#64748b',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="#34D399" strokeWidth={2} fill="url(#g1)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {stageData.length>0&&(
          <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
            <p className={cx('text-sm font-semibold mb-3',T.text(dark))}>Pipeline por Etapa</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart><Pie data={stageData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">{stageData.map((e:any,i:number)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {stageData.map((s:any,i:number)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/><span className={cx('text-[11px] truncate',T.sub(dark))}>{s.name}</span></div>
                    <span className={cx('font-bold',T.text(dark))}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-sm font-semibold mb-3',T.text(dark))}>Leads Recentes</p>
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
// HUB DASHBOARD (somente Flüxa founder) — Design Premium
// ══════════════════════════════════════════════════════════════════
function HubDashboard({dark,addToast,onMenu}:any){
  const [companies,setCompanies]=useState<any[]>([])
  const [users,setUsers]=useState<any[]>([])
  const [prospects,setProspects]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [now]=useState(new Date())

  useEffect(()=>{
    Promise.all([
      sb.from('companies').select('*').order('created_at',{ascending:false}),
      sb.from('users').select('*').eq('active',true),
      sb.from('fluxa_prospects').select('*').order('created_at',{ascending:false}),
    ]).then(([cr,ur,pr])=>{
      if(cr.data) setCompanies(cr.data)
      if(ur.data) setUsers(ur.data)
      if(pr.data) setProspects(pr.data)
      setLoading(false)
    })
  },[])

  const fluxaId=companies.find((c:any)=>c.company_slug===FLUXA_SLUG)?.id
  const active=companies.filter(c=>c.crm_active&&c.company_slug!==FLUXA_SLUG)
  const total=companies.filter(c=>c.company_slug!==FLUXA_SLUG)
  const totalUsers=users.filter(u=>u.company_id!==fluxaId).length

  // Métricas funil
  const mrrFechado=prospects.filter(p=>p.stage==='bofu_fechado').reduce((a:number,p:any)=>a+Number(p.mrr_estimado||0),0)
  const mrrPipeline=prospects.filter(p=>!['perdido','bofu_fechado'].includes(p.stage)).reduce((a:number,p:any)=>a+Number(p.mrr_estimado||0),0)
  const emNegoc=prospects.filter(p=>['bofu_proposta','bofu_negoc'].includes(p.stage)).length
  const perdidos=prospects.filter(p=>p.stage==='perdido').length
  const taxaConv=prospects.length>0?Math.round((prospects.filter(p=>p.stage==='bofu_fechado').length/prospects.length)*100):0

  // Dados do funil para gráfico
  const funnelData=FUNIL_STAGES.filter(s=>s.id!=='perdido').map(s=>({
    name:s.label.replace(' ✓',''),
    value:prospects.filter(p=>p.stage===s.id).length,
    fill:s.id==='bofu_fechado'?'#10B981':s.fase==='ToFu'?'#38BDF8':s.fase==='MoFu'?'#A78BFA':'#FB923C'
  }))

  // Atividade semanal (últimos 7 dias de prospects criados)
  const weekData=Array.from({length:7},(_,i)=>{
    const d=new Date(now);d.setDate(d.getDate()-6+i)
    const ds=d.toISOString().slice(0,10)
    return {
      day:['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()],
      prospects:prospects.filter(p=>p.created_at?.slice(0,10)===ds).length,
      clientes:companies.filter(c=>c.created_at?.slice(0,10)===ds&&c.company_slug!==FLUXA_SLUG).length,
    }
  })

  // Distribuição de prioridades
  const prioData=[
    {name:'Urgente',value:prospects.filter(p=>p.prioridade==='Urgente').length,fill:'#F87171'},
    {name:'Alta',   value:prospects.filter(p=>p.prioridade==='Alta').length,   fill:'#FB923C'},
    {name:'Média',  value:prospects.filter(p=>p.prioridade==='Média'||!p.prioridade).length,fill:'#60A5FA'},
    {name:'Baixa',  value:prospects.filter(p=>p.prioridade==='Baixa').length,  fill:'#94A3B8'},
  ].filter(d=>d.value>0)

  // Próximas ações vencidas ou próximas
  const hoje=now.toISOString().slice(0,10)
  const alertas=prospects.filter(p=>p.proxima_acao&&p.data_proxima_acao&&p.data_proxima_acao<=hoje&&p.stage!=='bofu_fechado'&&p.stage!=='perdido').slice(0,5)

  const Stat=({label,val,sub,icon:Icon,grad,loading:l}:any)=>(
    <div className={cx('relative p-5 rounded-2xl border overflow-hidden',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
      <div className={cx('absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6',grad)}/>
      <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center mb-4',grad)}>
        <Icon size={18} className="text-white"/>
      </div>
      {l?<Sk className="h-8 w-20 mb-1"/>:<p className={cx('text-2xl font-black mb-0.5',dark?'text-white':'text-slate-900')}>{val}</p>}
      <p className={cx('text-xs font-semibold',dark?'text-slate-400':'text-slate-500')}>{label}</p>
      {sub&&<p className={cx('text-[10px] mt-1',dark?'text-slate-600':'text-slate-400')}>{sub}</p>}
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className={cx('flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10',dark?'bg-slate-950/80 border-white/[0.06] backdrop-blur-md':'bg-white/80 border-slate-100 backdrop-blur-md')}>
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className={cx('sm:hidden p-2 rounded-xl',dark?'hover:bg-white/10':'hover:bg-slate-100')}><Menu size={16} className={dark?'text-slate-400':'text-slate-500'}/></button>
          <div>
            <h1 className={cx('text-base font-black',dark?'text-white':'text-slate-900')}>Flüxa Dashboard</h1>
            <p className={cx('text-[11px]',dark?'text-slate-500':'text-slate-400')}>{now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold',dark?'bg-sky-500/10 text-sky-400 border border-sky-500/20':'bg-sky-50 text-sky-700 border border-sky-200')}>
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"/>
            Plataforma Online
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* KPIs principais — linha 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat loading={loading} label="Clientes Ativos" val={active.length} sub={`${total.length} total`} icon={Building2} grad="bg-gradient-to-br from-sky-400 to-sky-600"/>
          <Stat loading={loading} label="MRR Fechado" val={`R$${mrrFechado.toLocaleString('pt-BR')}`} sub="contratos ativos" icon={DollarSign} grad="bg-gradient-to-br from-violet-400 to-purple-600"/>
          <Stat loading={loading} label="Pipeline" val={`R$${mrrPipeline.toLocaleString('pt-BR')}`} sub={`${prospects.filter(p=>!['perdido','bofu_fechado'].includes(p.stage)).length} prospects`} icon={TrendingUp} grad="bg-gradient-to-br from-amber-400 to-orange-500"/>
          <Stat loading={loading} label="Taxa Conversão" val={`${taxaConv}%`} sub={`${prospects.filter(p=>p.stage==='bofu_fechado').length} fechados`} icon={Target} grad="bg-gradient-to-br from-blue-400 to-indigo-600"/>
        </div>

        {/* Linha 2 — Gráfico atividade + Funil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Atividade semanal */}
          <div className={cx('lg:col-span-2 p-5 rounded-2xl border',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>Atividade Semanal</p>
                <p className={cx('text-[11px]',dark?'text-slate-500':'text-slate-400')}>Últimos 7 dias</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block"/>Prospects</span>
                <span className={cx('flex items-center gap-1',dark?'text-slate-400':'text-slate-500')}><span className="w-2 h-2 rounded-full bg-violet-400 inline-block"/>Clientes</span>
              </div>
            </div>
            {loading?<Sk className="h-40"/>:(
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weekData} barGap={4} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)'} vertical={false}/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:dark?'#64748b':'#94a3b8'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:dark?'#64748b':'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{background:dark?'#0f172a':'#fff',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,borderRadius:12,fontSize:11}}/>
                  <Bar dataKey="prospects" fill="#10B981" radius={[6,6,0,0]} name="Prospects"/>
                  <Bar dataKey="clientes" fill="#8B5CF6" radius={[6,6,0,0]} name="Clientes"/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Distribuição Funil */}
          <div className={cx('p-5 rounded-2xl border',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
            <p className={cx('text-sm font-bold mb-1',dark?'text-white':'text-slate-900')}>Funil de Vendas</p>
            <p className={cx('text-[11px] mb-4',dark?'text-slate-500':'text-slate-400')}>{prospects.filter(p=>p.stage!=='perdido').length} prospects ativos</p>
            {loading?<Sk className="h-40"/>:(
              prospects.length===0
                ?<div className={cx('flex flex-col items-center justify-center h-32',dark?'text-slate-600':'text-slate-400')}>
                  <Target size={24} className="mb-2 opacity-40"/>
                  <p className="text-xs">Nenhum prospect</p>
                </div>
                :<div className="space-y-2">
                  {funnelData.filter(d=>d.value>0).map(d=>(
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{background:d.fill}}/>
                      <p className={cx('text-[10px] flex-1 truncate',dark?'text-slate-400':'text-slate-500')}>{d.name}</p>
                      <div className={cx('flex-1 h-1.5 rounded-full overflow-hidden',dark?'bg-white/5':'bg-slate-100')}>
                        <div className="h-full rounded-full" style={{width:`${Math.max(8,(d.value/prospects.length)*100)}%`,background:d.fill}}/>
                      </div>
                      <span className={cx('text-[10px] font-bold w-4 text-right',dark?'text-slate-300':'text-slate-700')}>{d.value}</span>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </div>

        {/* Linha 3 — Alertas + Clientes recentes + Mini stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Alertas — ações vencidas */}
          <div className={cx('p-5 rounded-2xl border',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-red-500/15 flex items-center justify-center"><AlertCircle size={14} className="text-red-400"/></div>
              <div>
                <p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>Ações Vencidas</p>
                <p className={cx('text-[11px]',dark?'text-slate-500':'text-slate-400')}>{alertas.length} pendentes</p>
              </div>
            </div>
            {loading?<Sk className="h-32"/>:(
              alertas.length===0
                ?<div className={cx('flex flex-col items-center justify-center py-6',dark?'text-slate-600':'text-slate-400')}>
                  <CheckCircle size={22} className="mb-2 text-sky-500 opacity-60"/>
                  <p className="text-xs">Tudo em dia! 🎉</p>
                </div>
                :<div className="space-y-2">
                  {alertas.map(p=>(
                    <div key={p.id} className={cx('p-2.5 rounded-xl border',dark?'bg-red-500/5 border-red-500/20':'bg-red-50 border-red-100')}>
                      <p className={cx('text-xs font-semibold truncate',dark?'text-white':'text-slate-900')}>{p.nome}</p>
                      <p className={cx('text-[10px] truncate',dark?'text-red-400':'text-red-500')}>{p.proxima_acao}</p>
                      <p className={cx('text-[10px]',dark?'text-red-500':'text-red-400')}>{new Date(p.data_proxima_acao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
            )}
          </div>

          {/* Clientes recentes */}
          <div className={cx('p-5 rounded-2xl border',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
            <p className={cx('text-sm font-bold mb-1',dark?'text-white':'text-slate-900')}>Clientes Recentes</p>
            <p className={cx('text-[11px] mb-4',dark?'text-slate-500':'text-slate-400')}>{active.length} empresas ativas</p>
            {loading?<Sk className="h-40"/>:(
              <div className="space-y-2">
                {companies.filter(c=>c.company_slug!==FLUXA_SLUG).slice(0,5).map(c=>(
                  <div key={c.id} className={cx('flex items-center gap-2.5 p-2 rounded-xl',dark?'hover:bg-white/[0.03]':'hover:bg-slate-50')}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                      {c.company_name?.[0]?.toUpperCase()||'?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cx('text-xs font-semibold truncate',dark?'text-white':'text-slate-900')}>{c.company_name}</p>
                      <p className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>@{c.company_slug}</p>
                    </div>
                    <span className={cx('shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-semibold',c.crm_active?'bg-sky-500/15 text-sky-500':'bg-red-500/15 text-red-400')}>{c.crm_active?'Ativa':'Inativa'}</span>
                  </div>
                ))}
                {companies.filter(c=>c.company_slug!==FLUXA_SLUG).length===0&&(
                  <p className={cx('text-xs text-center py-4',dark?'text-slate-600':'text-slate-400')}>Nenhum cliente ainda.</p>
                )}
              </div>
            )}
          </div>

          {/* Mini stats lado direito */}
          <div className="space-y-3">
            {[
              {label:'Usuários na Plataforma',val:String(totalUsers),icon:Users,cl:'text-blue-400',bg:'bg-blue-500/10',border:dark?'border-white/[0.07]':'border-blue-100'},
              {label:'Em Negociação',val:String(emNegoc),icon:Briefcase,cl:'text-amber-400',bg:'bg-amber-500/10',border:dark?'border-white/[0.07]':'border-amber-100'},
              {label:'Perdidos',val:String(perdidos),icon:AlertCircle,cl:'text-red-400',bg:'bg-red-500/10',border:dark?'border-white/[0.07]':'border-red-100'},
              {label:'Total Prospects',val:String(prospects.length),icon:BarChart2,cl:'text-violet-400',bg:'bg-violet-500/10',border:dark?'border-white/[0.07]':'border-violet-100'},
            ].map(({label,val,icon:Icon,cl,bg,border})=>(
              <div key={label} className={cx('flex items-center gap-3 p-3.5 rounded-2xl border',dark?'bg-white/[0.03]':'bg-white shadow-sm',border)}>
                <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',bg)}><Icon size={15} className={cl}/></div>
                <div>
                  {loading?<Sk className="h-5 w-12"/>:<p className={cx('text-base font-black',dark?'text-white':'text-slate-900')}>{val}</p>}
                  <p className={cx('text-[10px] font-medium',dark?'text-slate-500':'text-slate-400')}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
// ══════════════════════════════════════════════════════════════════
// FUNIL FLÜXA — ToFu / MoFu / BoFu (exclusivo Hub)
// ══════════════════════════════════════════════════════════════════

const FUNIL_STAGES = [
  {id:'tofu_contato',    label:'Contato Inicial',  fase:'ToFu', cor:'bg-sky-500',     text:'text-sky-400',    border:'border-sky-500/30',    bg:'bg-sky-500/10'},
  {id:'tofu_qualif',     label:'Qualificando',      fase:'ToFu', cor:'bg-blue-500',    text:'text-blue-400',   border:'border-blue-500/30',   bg:'bg-blue-500/10'},
  {id:'mofu_diagnostico',label:'Diagnóstico',       fase:'MoFu', cor:'bg-violet-500',  text:'text-violet-400', border:'border-violet-500/30', bg:'bg-violet-500/10'},
  {id:'mofu_apresent',   label:'Apresentação',      fase:'MoFu', cor:'bg-purple-500',  text:'text-purple-400', border:'border-purple-500/30', bg:'bg-purple-500/10'},
  {id:'bofu_proposta',   label:'Proposta Enviada',  fase:'BoFu', cor:'bg-amber-500',   text:'text-amber-400',  border:'border-amber-500/30',  bg:'bg-amber-500/10'},
  {id:'bofu_negoc',      label:'Negociação',        fase:'BoFu', cor:'bg-orange-500',  text:'text-orange-400', border:'border-orange-500/30', bg:'bg-orange-500/10'},
  {id:'bofu_fechado',    label:'Fechado ✓',         fase:'BoFu', cor:'bg-sky-500', text:'text-sky-400',border:'border-sky-500/30',bg:'bg-sky-500/10'},
  {id:'perdido',         label:'Perdido ✗',         fase:'BoFu', cor:'bg-red-500',     text:'text-red-400',    border:'border-red-500/30',    bg:'bg-red-500/10'},
]
const FASES = ['ToFu','MoFu','BoFu']
const FASE_COLORS:any = {
  ToFu:{bg:'bg-sky-500/10',border:'border-sky-500/20',text:'text-sky-400'},
  MoFu:{bg:'bg-violet-500/10',border:'border-violet-500/20',text:'text-violet-400'},
  BoFu:{bg:'bg-amber-500/10',border:'border-amber-500/20',text:'text-amber-400'},
}
const ORIGENS = ['Instagram','Facebook','Indicação','Site','LinkedIn','WhatsApp Direto','Ligação Fria','Outro']
const PRIORIDADES = ['Baixa','Média','Alta','Urgente']
const PRIO_STYLE:any = {
  'Baixa':   'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Média':   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Alta':    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Urgente': 'bg-red-500/15 text-red-400 border-red-500/30',
}

// Modal de lead do funil Flüxa
// Atalhos de data rápidos para próxima ação
const DATE_SHORTCUTS=[
  {label:'Hoje',days:0},{label:'Amanhã',days:1},{label:'Em 2 dias',days:2},
  {label:'Em 1 semana',days:7},{label:'Em 15 dias',days:15},{label:'Em 30 dias',days:30},
]
function addDays(d:number){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10)}
function fmtDateBR(iso:string){if(!iso)return '';const[y,m,d]=iso.split('-');return `${d}/${m}/${y}`}
function diasAte(iso:string){
  if(!iso) return null
  const diff=Math.round((new Date(iso+'T12:00:00').getTime()-new Date(new Date().toDateString()).getTime())/86400000)
  if(diff<0) return {txt:`${Math.abs(diff)}d atrás`,cl:'text-red-400'}
  if(diff===0) return {txt:'Hoje',cl:'text-amber-400'}
  if(diff===1) return {txt:'Amanhã',cl:'text-sky-400'}
  return {txt:`Em ${diff} dias`,cl:'text-blue-400'}
}

function FluxaLeadModal({lead,open,onClose,onSave,onDelete,dark,addToast}:any){
  const empty={nome:'',empresa:'',telefone:'',email:'',cargo:'',origem:'',prioridade:'Média',stage:'tofu_contato',mrr_estimado:0,observacoes:'',proxima_acao:'',data_proxima_acao:''}
  const [form,setForm]=useState<any>(empty)
  const [saving,setSaving]=useState(false)
  const [notas,setNotas]=useState<any[]>([])
  const [novaNota,setNovaNota]=useState('')
  const [sendingNota,setSendingNota]=useState(false)
  const [delConfirm,setDelConfirm]=useState(false)
  const [activeTab,setActiveTab]=useState<'info'|'acao'|'timeline'>('info')
  const [showDatePicker,setShowDatePicker]=useState(false)
  const [calDate,setCalDate]=useState(new Date())
  const dateRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const handler=(e:MouseEvent)=>{if(dateRef.current&&!dateRef.current.contains(e.target as Node))setShowDatePicker(false)}
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
  },[])

  useEffect(()=>{
    if(open){
      if(lead){setForm({...empty,...lead});setNotas([]);setActiveTab('info');sb.from('fluxa_prospect_notas').select('*').eq('prospect_id',lead.id).order('created_at',{ascending:false}).then(({data})=>{if(data)setNotas(data)})}
      else{setForm(empty);setNotas([]);setActiveTab('info')}
    }
  },[open,lead])

  const set=(k:string,v:any)=>setForm((f:any)=>({...f,[k]:v}))

  const MLONG=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const calY=calDate.getFullYear(),calMo=calDate.getMonth()
  const fd2=new Date(calY,calMo,1).getDay(),dim2=new Date(calY,calMo+1,0).getDate()
  const calCells=[...Array(fd2).fill(null),...Array.from({length:dim2},(_:any,i:number)=>i+1)]

  const save=async()=>{
    if(!form.nome?.trim()){addToast('Nome é obrigatório.','error');return}
    setSaving(true)
    const payload={nome:form.nome,empresa:form.empresa,telefone:form.telefone,email:form.email,cargo:form.cargo,origem:form.origem,prioridade:form.prioridade,stage:form.stage,mrr_estimado:Number(form.mrr_estimado)||0,observacoes:form.observacoes,proxima_acao:form.proxima_acao,data_proxima_acao:form.data_proxima_acao||null,updated_at:new Date().toISOString()}
    if(lead?.id){
      const{error}=await sb.from('fluxa_prospects').update(payload).eq('id',lead.id)
      setSaving(false);if(error){addToast('Erro ao salvar: '+error.message,'error');return}
      onSave({...lead,...form,...payload});addToast('Prospect salvo!','success');onClose()
    } else {
      const{data,error}=await sb.from('fluxa_prospects').insert({...payload,created_at:new Date().toISOString()}).select().single()
      setSaving(false);if(error){addToast('Erro ao criar: '+error.message,'error');return}
      onSave(data);addToast('Prospect criado! 🎉','success');onClose()
    }
  }

  const addNota=async()=>{
    if(!novaNota.trim()||!lead?.id) return
    setSendingNota(true)
    const{data,error}=await sb.from('fluxa_prospect_notas').insert({prospect_id:lead.id,nota:novaNota.trim(),created_at:new Date().toISOString()}).select().single()
    setSendingNota(false);if(error){addToast('Erro.','error');return}
    setNotas((n:any)=>[data,...n]);setNovaNota('')
  }

  const del=async()=>{
    if(!lead?.id) return
    const{error}=await sb.from('fluxa_prospects').delete().eq('id',lead.id)
    if(error){addToast('Erro ao excluir.','error');return}
    onDelete(lead.id);addToast('Removido.','success');setDelConfirm(false);onClose()
  }

  const stageInfo=FUNIL_STAGES.find(s=>s.id===form.stage)||FUNIL_STAGES[0]
  const dataInfo=diasAte(form.data_proxima_acao)

  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{background:'rgba(0,0,0,0.75)'}}>
      <div className={cx('w-full max-w-2xl rounded-2xl border flex flex-col shadow-2xl',dark?'bg-slate-900 border-white/10':'bg-white border-slate-200','max-h-[94vh]')}>

        {/* Header */}
        <div className={cx('px-5 pt-5 pb-0 border-b shrink-0',dark?'border-white/10':'border-slate-100')}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',stageInfo.bg)}>
                <div className={cx('w-3 h-3 rounded-full',stageInfo.cor)}/>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={cx('font-black text-base truncate',dark?'text-white':'text-slate-900')}>{lead?.id?(form.nome||'Prospect'):'✨ Novo Prospect'}</h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={cx('text-[10px] font-semibold px-2 py-0.5 rounded-md border',stageInfo.bg,stageInfo.text,stageInfo.border)}>{stageInfo.fase} · {stageInfo.label}</span>
                  {form.prioridade&&form.prioridade!=='Média'&&<span className={cx('text-[10px] font-semibold px-2 py-0.5 rounded-md border',PRIO_STYLE[form.prioridade])}>{form.prioridade}</span>}
                  {Number(form.mrr_estimado)>0&&<span className={cx('text-[10px] font-bold',dark?'text-sky-400':'text-sky-600')}>R${Number(form.mrr_estimado).toLocaleString('pt-BR')}/mês</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className={cx('p-1.5 rounded-lg shrink-0',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-500')}><X size={16}/></button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {([{id:'info',label:'📋 Info'},{id:'acao',label:'⚡ Próxima Ação'},{id:'timeline',label:'🕐 Timeline'}] as const).map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                className={cx('px-3 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2',
                  activeTab===t.id?(dark?'text-sky-400 border-sky-400':'text-sky-700 border-sky-500'):(dark?'text-slate-500 border-transparent hover:text-slate-300':'text-slate-500 border-transparent hover:text-slate-700'))}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {activeTab==='info'&&(<>
            <div>
              <p className={cx('text-[10px] font-bold uppercase tracking-wider mb-2',dark?'text-slate-500':'text-slate-400')}>Etapa do Funil</p>
              <div className="grid grid-cols-4 gap-1.5">
                {FUNIL_STAGES.map(s=>(
                  <button key={s.id} onClick={()=>set('stage',s.id)}
                    className={cx('p-2 rounded-xl border text-[10px] font-semibold text-center transition-all leading-tight',
                      form.stage===s.id?cx(s.bg,s.text,s.border,'shadow-sm'):(dark?'border-white/8 text-slate-600 hover:border-white/20':'border-slate-200 text-slate-400 hover:border-slate-300'))}>
                    <div className={cx('w-1.5 h-1.5 rounded-full mx-auto mb-1',s.cor)}/>{s.label.replace(' ✓','').replace(' ✗','')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={cx('text-[10px] font-bold uppercase tracking-wider mb-2',dark?'text-slate-500':'text-slate-400')}>Dados de Contato</p>
              <div className="grid grid-cols-2 gap-3">
                <Field dark={dark} label="Nome *" value={form.nome} onChange={(v:string)=>set('nome',v)} placeholder="Nome completo"/>
                <Field dark={dark} label="Empresa" value={form.empresa} onChange={(v:string)=>set('empresa',v)} placeholder="Vidraçaria XYZ"/>
                <Field dark={dark} label="Telefone / WhatsApp" value={form.telefone} onChange={(v:string)=>set('telefone',v)} placeholder="(00) 00000-0000" icon={Phone}/>
                <Field dark={dark} label="E-mail" value={form.email} onChange={(v:string)=>set('email',v)} placeholder="email@empresa.com" icon={Mail}/>
                <Field dark={dark} label="Cargo" value={form.cargo} onChange={(v:string)=>set('cargo',v)} placeholder="Dono, Gerente..."/>
                <Sel dark={dark} label="Origem" value={form.origem} onChange={(v:string)=>set('origem',v)} options={[{value:'',label:'Selecione...'},...ORIGENS.map(o=>({value:o,label:o}))]}/>
              </div>
            </div>
            <div>
              <p className={cx('text-[10px] font-bold uppercase tracking-wider mb-2',dark?'text-slate-500':'text-slate-400')}>Qualificação</p>
              <div className="grid grid-cols-2 gap-3">
                <Field dark={dark} label="MRR Estimado (R$)" value={String(form.mrr_estimado||'')} onChange={(v:string)=>set('mrr_estimado',v)} placeholder="2500" icon={DollarSign}/>
                <div>
                  <p className={cx('text-xs font-semibold mb-1.5',dark?'text-slate-400':'text-slate-500')}>Prioridade</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRIORIDADES.map(p=>(
                      <button key={p} onClick={()=>set('prioridade',p)}
                        className={cx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',form.prioridade===p?PRIO_STYLE[p]:(dark?'border-white/10 text-slate-500':'border-slate-200 text-slate-500'))}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Textarea dark={dark} label="Observações" value={form.observacoes} onChange={(v:string)=>set('observacoes',v)} placeholder="Informações relevantes sobre o prospect..." rows={3}/>
          </>)}

          {activeTab==='acao'&&(
            <div className="space-y-5">
              <div>
                <p className={cx('text-[10px] font-bold uppercase tracking-wider mb-2',dark?'text-slate-500':'text-slate-400')}>O que fazer?</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['Ligar','Enviar proposta','Agendar call','Follow-up','Reunião presencial','Enviar contrato','Aguardar retorno'].map(a=>(
                    <button key={a} onClick={()=>set('proxima_acao',a)}
                      className={cx('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                        form.proxima_acao===a?(dark?'bg-sky-500/20 text-sky-400 border-sky-500/40':'bg-sky-50 text-sky-700 border-sky-300'):(dark?'border-white/10 text-slate-500 hover:border-white/20':'border-slate-200 text-slate-600 hover:border-slate-300'))}>
                      {a}
                    </button>
                  ))}
                </div>
                <Field dark={dark} label="Ou descreva a ação" value={form.proxima_acao} onChange={(v:string)=>set('proxima_acao',v)} placeholder="Ex: Ligar às 14h para apresentar proposta..."/>
              </div>

              <div>
                <p className={cx('text-[10px] font-bold uppercase tracking-wider mb-2',dark?'text-slate-500':'text-slate-400')}>Quando?</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {DATE_SHORTCUTS.map((s:any)=>{
                    const iso=addDays(s.days)
                    const active=form.data_proxima_acao===iso
                    return (
                      <button key={s.label} onClick={()=>set('data_proxima_acao',iso)}
                        className={cx('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                          active?(dark?'bg-violet-500/20 text-violet-300 border-violet-500/40':'bg-violet-50 text-violet-700 border-violet-300'):(dark?'border-white/10 text-slate-500 hover:border-white/20':'border-slate-200 text-slate-600 hover:border-slate-300'))}>
                        {s.label}
                      </button>
                    )
                  })}
                </div>

                {/* Botão data + popup calendário */}
                <div ref={dateRef} className="relative">
                  <button onClick={()=>{setShowDatePicker(v=>!v);if(form.data_proxima_acao)setCalDate(new Date(form.data_proxima_acao+'T12:00:00'))}}
                    className={cx('w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                      dark?'border-white/10 bg-white/[0.03] hover:border-white/20':'border-slate-200 bg-white hover:border-slate-300',
                      showDatePicker&&(dark?'border-sky-500/50':'border-sky-400'))}>
                    <Calendar size={15} className={dark?'text-slate-500':'text-slate-400'}/>
                    <div className="flex-1">
                      {form.data_proxima_acao
                        ?<><p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>{fmtDateBR(form.data_proxima_acao)}</p>
                          {dataInfo&&<p className={cx('text-[10px] font-semibold',dataInfo.cl)}>{dataInfo.txt}</p>}</>
                        :<p className={cx('text-sm',dark?'text-slate-500':'text-slate-400')}>Clique para escolher a data…</p>
                      }
                    </div>
                    {form.data_proxima_acao&&<button onClick={e=>{e.stopPropagation();set('data_proxima_acao','')}} className={cx('p-1 rounded-lg',dark?'hover:bg-white/10 text-slate-500':'hover:bg-slate-100 text-slate-400')}><X size={12}/></button>}
                    <ChevronDown size={13} className={cx('transition-transform shrink-0',showDatePicker&&'rotate-180',dark?'text-slate-500':'text-slate-400')}/>
                  </button>

                  {showDatePicker&&(
                    <div className={cx('absolute top-full mt-2 left-0 z-50 rounded-2xl border shadow-2xl p-4 w-72',dark?'bg-slate-900 border-white/10':'bg-white border-slate-200')}>
                      <div className="flex items-center justify-between mb-3">
                        <button onClick={()=>setCalDate(new Date(calY,calMo-1))} className={cx('w-7 h-7 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-500')}><ChevronLeft size={13}/></button>
                        <p className={cx('text-xs font-bold',dark?'text-white':'text-slate-900')}>{MLONG[calMo]} {calY}</p>
                        <button onClick={()=>setCalDate(new Date(calY,calMo+1))} className={cx('w-7 h-7 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-500')}><ChevronRight size={13}/></button>
                      </div>
                      <div className="grid grid-cols-7 mb-1">
                        {['D','S','T','Q','Q','S','S'].map((d,i)=><div key={i} className={cx('text-center text-[10px] font-semibold py-1',dark?'text-slate-600':'text-slate-400')}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5">
                        {calCells.map((day:any,i:number)=>{
                          if(!day) return <div key={i}/>
                          const iso=`${calY}-${String(calMo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                          const isSelected=form.data_proxima_acao===iso
                          const isToday=iso===new Date().toISOString().slice(0,10)
                          const isPast=new Date(iso+'T12:00:00')<new Date(new Date().toDateString())
                          return (
                            <button key={i} onClick={()=>{if(!isPast){set('data_proxima_acao',iso);setShowDatePicker(false)}}} disabled={isPast}
                              className={cx('w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all',
                                isSelected?'bg-sky-500 text-white':isToday?(dark?'border border-sky-500/40 text-sky-400':'border border-sky-400 text-sky-700'):isPast?(dark?'text-slate-700 cursor-not-allowed':'text-slate-300 cursor-not-allowed'):(dark?'text-slate-300 hover:bg-white/10':'text-slate-700 hover:bg-slate-100'))}>
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(form.proxima_acao||form.data_proxima_acao)&&(
                <div className={cx('p-4 rounded-xl border',dark?'bg-sky-500/5 border-sky-500/20':'bg-sky-50 border-sky-200')}>
                  <p className={cx('text-[10px] font-bold uppercase mb-1',dark?'text-sky-500':'text-sky-600')}>Resumo da Ação</p>
                  <p className={cx('text-sm font-semibold',dark?'text-white':'text-slate-900')}>
                    {form.proxima_acao||'Ação a definir'}
                    {form.data_proxima_acao&&<span className={cx('ml-2 font-normal text-xs',dark?'text-sky-400':'text-sky-600')}>→ {fmtDateBR(form.data_proxima_acao)}{dataInfo&&` (${dataInfo.txt})`}</span>}
                  </p>
                  {form.nome&&<p className={cx('text-xs mt-1',dark?'text-slate-500':'text-slate-400')}>{form.nome}{form.empresa&&` · ${form.empresa}`}</p>}
                </div>
              )}
            </div>
          )}

          {activeTab==='timeline'&&(
            <div className="space-y-3">
              {lead?.id?(
                <>
                  <div className={cx('flex gap-2 p-3 rounded-xl border',dark?'bg-white/[0.03] border-white/10':'bg-slate-50 border-slate-200')}>
                    <input value={novaNota} onChange={e=>setNovaNota(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),addNota())}
                      placeholder="Registrar contato, observação, atualização..."
                      className={cx('flex-1 bg-transparent text-sm outline-none',dark?'text-white placeholder-slate-500':'text-slate-900 placeholder-slate-400')}/>
                    <button onClick={addNota} disabled={sendingNota||!novaNota.trim()}
                      className={cx('p-2 rounded-lg transition-all shrink-0',novaNota.trim()?'bg-sky-500 text-white hover:bg-sky-400':'text-slate-500 cursor-not-allowed')}><Send size={14}/></button>
                  </div>
                  {notas.length===0&&<div className={cx('flex flex-col items-center py-8',dark?'text-slate-600':'text-slate-400')}><MessageCircle size={24} className="mb-2 opacity-40"/><p className="text-xs">Nenhuma nota ainda.</p></div>}
                  <div className="space-y-2">
                    {notas.map((n:any,i:number)=>(
                      <div key={n.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cx('w-2 h-2 rounded-full mt-2 shrink-0',dark?'bg-sky-500':'bg-sky-400')}/>
                          {i<notas.length-1&&<div className={cx('flex-1 w-px mt-1',dark?'bg-white/10':'bg-slate-200')}/>}
                        </div>
                        <div className={cx('flex-1 p-3 rounded-xl border mb-2',dark?'bg-white/[0.02] border-white/[0.06]':'bg-white border-slate-200')}>
                          <p className={cx('text-sm',dark?'text-slate-200':'text-slate-700')}>{n.nota}</p>
                          <p className={cx('text-[10px] mt-1.5',dark?'text-slate-500':'text-slate-400')}>{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ):(
                <div className={cx('flex flex-col items-center py-8',dark?'text-slate-600':'text-slate-400')}>
                  <Clock size={24} className="mb-2 opacity-40"/>
                  <p className="text-xs">Salve o prospect primeiro para adicionar notas.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cx('flex items-center justify-between px-5 py-4 border-t shrink-0',dark?'border-white/10':'border-slate-100')}>
          <div>
            {lead?.id&&(delConfirm
              ?<div className="flex items-center gap-2">
                <span className={cx('text-xs',dark?'text-red-400':'text-red-500')}>Confirmar exclusão?</span>
                <button onClick={del} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg">Sim</button>
                <button onClick={()=>setDelConfirm(false)} className={cx('text-xs px-2 py-1 rounded-lg',dark?'bg-white/10 text-slate-300':'bg-slate-100 text-slate-600')}>Não</button>
              </div>
              :<button onClick={()=>setDelConfirm(true)} className={cx('flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg',dark?'text-red-400 hover:bg-red-500/10':'text-red-500 hover:bg-red-50')}><Trash2 size={13}/> Excluir</button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className={cx('px-4 py-2 rounded-xl text-sm font-semibold',dark?'bg-white/10 text-slate-300 hover:bg-white/15':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>Cancelar</button>
            <button onClick={save} disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-400 hover:to-sky-500 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20">
              {saving?'Salvando...':lead?.id?'Salvar Alterações':'Criar Prospect ✨'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Kanban do Funil Flüxa
function FluxaFunil({dark,addToast,onMenu}:any){
  const [prospects,setProspects]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState<any>(null)
  const [showNew,setShowNew]=useState(false)
  const [search,setSearch]=useState('')
  const [dragId,setDragId]=useState<string|null>(null)
  const [overStage,setOverStage]=useState<string|null>(null)
  const [faseFilter,setFaseFilter]=useState<string>('Todos')

  const load=useCallback(async()=>{
    setLoading(true)
    const{data}=await sb.from('fluxa_prospects').select('*').order('updated_at',{ascending:false})
    if(data) setProspects(data)
    setLoading(false)
  },[])

  useEffect(()=>{
    load()
    const ch=sb.channel('realtime_fluxa_funil')
      .on('postgres_changes',{event:'*',schema:'public',table:'fluxa_prospects'},()=>load())
      .subscribe()
    return ()=>{ sb.removeChannel(ch) }
  },[load])

  const filtered=prospects.filter(p=>{
    const q=search.toLowerCase()
    const matchSearch=!q||p.nome?.toLowerCase().includes(q)||p.empresa?.toLowerCase().includes(q)||p.telefone?.includes(q)
    const stageInfo=FUNIL_STAGES.find(s=>s.id===p.stage)
    const matchFase=faseFilter==='Todos'||stageInfo?.fase===faseFilter||faseFilter==='Fechados'&&p.stage==='bofu_fechado'||faseFilter==='Perdidos'&&p.stage==='perdido'
    return matchSearch&&matchFase
  })

  const getByStage=(sid:string)=>filtered.filter(p=>p.stage===sid)

  const moveStage=async(id:string,stage:string)=>{
    setProspects(ps=>ps.map(p=>p.id===id?{...p,stage,updated_at:new Date().toISOString()}:p))
    await sb.from('fluxa_prospects').update({stage,updated_at:new Date().toISOString()}).eq('id',id)
  }

  const onDragStart=(e:any,id:string)=>{setDragId(id);e.dataTransfer.effectAllowed='move'}
  const onDragOver=(e:any,sid:string)=>{e.preventDefault();setOverStage(sid)}
  const onDrop=async(e:any,sid:string)=>{
    e.preventDefault()
    if(dragId&&dragId!==sid){await moveStage(dragId,sid)}
    setDragId(null);setOverStage(null)
  }

  const onSave=(saved:any)=>{
    setProspects(ps=>{
      const idx=ps.findIndex(p=>p.id===saved.id)
      if(idx>=0){const n=[...ps];n[idx]=saved;return n}
      return [saved,...ps]
    })
  }
  const onDelete=(id:string)=>setProspects(ps=>ps.filter(p=>p.id!==id))

  // Métricas rápidas
  const totalMRR=prospects.filter(p=>p.stage==='bofu_fechado').reduce((a:number,p:any)=>a+Number(p.mrr_estimado||0),0)
  const emNegoc=prospects.filter(p=>['bofu_proposta','bofu_negoc'].includes(p.stage)).length
  const totalAtivos=prospects.filter(p=>p.stage!=='perdido').length

  const stagesToShow=faseFilter==='Todos'
    ?FUNIL_STAGES
    :faseFilter==='ToFu'?FUNIL_STAGES.filter(s=>s.fase==='ToFu')
    :faseFilter==='MoFu'?FUNIL_STAGES.filter(s=>s.fase==='MoFu')
    :FUNIL_STAGES.filter(s=>s.fase==='BoFu')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header dark={dark} onMenu={onMenu} title="Funil de Vendas" subtitle="Prospecção Flüxa · ToFu → MoFu → BoFu"
        actions={
          <button onClick={()=>setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-400 transition-colors">
            <Plus size={13}/> Novo Prospect
          </button>
        }
      />

      {/* Métricas */}
      <div className={cx('px-4 pt-3 pb-2 grid grid-cols-3 gap-2 shrink-0')}>
        {[
          {label:'Ativos no Funil',val:String(totalAtivos),icon:Target,cl:'text-sky-400',bg:'bg-sky-500/10'},
          {label:'Em Negociação',val:String(emNegoc),icon:TrendingUp,cl:'text-amber-400',bg:'bg-amber-500/10'},
          {label:'MRR Fechado',val:`R$${totalMRR.toLocaleString('pt-BR')}`,icon:DollarSign,cl:'text-violet-400',bg:'bg-violet-500/10'},
        ].map(({label,val,icon:Icon,cl,bg})=>(
          <div key={label} className={cx('p-3 rounded-xl border flex items-center gap-2.5',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-200 shadow-sm')}>
            <div className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',bg)}><Icon size={15} className={cl}/></div>
            <div><p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>{val}</p><p className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>{label}</p></div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="px-4 pb-2 flex items-center gap-2 shrink-0 flex-wrap">
        <div className={cx('flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm',dark?'bg-white/[0.04] border-white/10':'bg-white border-slate-200')}>
          <Search size={13} className={dark?'text-slate-500':'text-slate-400'}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar prospect..." className={cx('bg-transparent flex-1 outline-none text-xs',dark?'text-white placeholder-slate-500':'text-slate-900 placeholder-slate-400')}/>
        </div>
        <div className="flex gap-1">
          {['Todos','ToFu','MoFu','BoFu'].map(f=>(
            <button key={f} onClick={()=>setFaseFilter(f)}
              className={cx('px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                faseFilter===f
                  ?f==='ToFu'?'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  :f==='MoFu'?'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  :f==='BoFu'?'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  :'bg-sky-500/20 text-sky-400 border-sky-500/30'
                :(dark?'border-white/10 text-slate-500 hover:border-white/20':'border-slate-200 text-slate-500 hover:border-slate-300'))}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
        <div className="flex gap-3 h-full" style={{minWidth:`${stagesToShow.length*240}px`}}>
          {stagesToShow.map(stage=>{
            const cards=getByStage(stage.id)
            const isOver=overStage===stage.id
            return (
              <div key={stage.id}
                onDragOver={e=>onDragOver(e,stage.id)}
                onDrop={e=>onDrop(e,stage.id)}
                className="flex flex-col"
                style={{width:'232px',minWidth:'232px'}}>
                {/* Coluna header */}
                <div className={cx('flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-2',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-200')}>
                  <div className={cx('w-2 h-2 rounded-full',stage.cor)}/>
                  <span className={cx('text-xs font-bold flex-1',dark?'text-white':'text-slate-700')}>{stage.label}</span>
                  <span className={cx('text-[10px] font-semibold px-1.5 py-0.5 rounded-md',stage.bg,stage.text)}>{cards.length}</span>
                </div>
                {/* Cards */}
                <div className={cx('flex-1 overflow-y-auto space-y-2 rounded-xl p-2 border-2 border-dashed transition-all',
                  isOver?(dark?'border-sky-500/50 bg-sky-500/5':'border-sky-400/50 bg-sky-50/50'):(dark?'border-white/5':'border-slate-200/50'))}>
                  {loading&&<div className="space-y-2"><Sk className="h-24"/><Sk className="h-20"/></div>}
                  {cards.map(p=>{
                    const prio=p.prioridade||'Média'
                    const vencida=p.data_proxima_acao&&new Date(p.data_proxima_acao)<new Date()
                    return (
                      <div key={p.id}
                        draggable
                        onDragStart={e=>onDragStart(e,p.id)}
                        onClick={()=>setSelected(p)}
                        className={cx('p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01]',
                          dark?'bg-slate-800/80 border-white/[0.09] hover:border-white/20':'bg-white border-slate-200 hover:border-slate-300 shadow-sm')}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className={cx('text-xs font-bold leading-tight flex-1',dark?'text-white':'text-slate-900')}>{p.nome}</p>
                          <span className={cx('text-[9px] px-1.5 py-0.5 rounded-md border font-semibold shrink-0',PRIO_STYLE[prio])}>{prio}</span>
                        </div>
                        {p.empresa&&<p className={cx('text-[10px] mb-1.5',dark?'text-slate-400':'text-slate-500')}>{p.empresa}</p>}
                        {p.mrr_estimado>0&&<p className={cx('text-[10px] font-semibold mb-1.5',dark?'text-sky-400':'text-sky-600')}>R${Number(p.mrr_estimado).toLocaleString('pt-BR')}/mês</p>}
                        {p.proxima_acao&&(
                          <div className={cx('flex items-center gap-1 mt-2 pt-2 border-t',dark?'border-white/[0.07]':'border-slate-100')}>
                            <CheckCircle size={10} className={vencida?'text-red-400':'text-slate-500'}/>
                            <p className={cx('text-[10px] truncate',vencida?(dark?'text-red-400':'text-red-500'):(dark?'text-slate-500':'text-slate-400'))}>{p.proxima_acao}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {!loading&&cards.length===0&&(
                    <div className={cx('flex flex-col items-center justify-center py-6 rounded-xl',dark?'text-slate-600':'text-slate-400')}>
                      <Plus size={20} className="mb-1 opacity-50"/>
                      <p className="text-[10px]">Arraste aqui</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal editar */}
      <FluxaLeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={onSave} onDelete={onDelete} addToast={addToast}/>

      {/* Modal novo */}
      <FluxaLeadModal dark={dark} lead={null} open={showNew} onClose={()=>setShowNew(false)}
        onSave={(saved:any)=>{setProspects(ps=>[saved,...ps]);setShowNew(false)}} onDelete={()=>{}} addToast={addToast}/>
    </div>
  )
}

// Lista de Prospects com filtros avançados
function FluxaProspects({dark,addToast,onMenu}:any){
  const [prospects,setProspects]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState<any>(null)
  const [showNew,setShowNew]=useState(false)
  const [search,setSearch]=useState('')
  const [stageFilter,setStageFilter]=useState('')
  const [prioFilter,setPrioFilter]=useState('')
  const [page,setPage]=useState(0)
  const PER=10

  useEffect(()=>{
    const loadP=()=>sb.from('fluxa_prospects').select('*').order('updated_at',{ascending:false}).then(({data})=>{
      if(data) setProspects(data)
      setLoading(false)
    })
    loadP()
    const ch=sb.channel('realtime_fluxa_prospects')
      .on('postgres_changes',{event:'*',schema:'public',table:'fluxa_prospects'},()=>loadP())
      .on('postgres_changes',{event:'*',schema:'public',table:'fluxa_prospect_notas'},()=>loadP())
      .subscribe()
    return ()=>{ sb.removeChannel(ch) }
  },[])

  const filtered=prospects.filter(p=>{
    const q=search.toLowerCase()
    const ms=!q||p.nome?.toLowerCase().includes(q)||p.empresa?.toLowerCase().includes(q)||p.email?.toLowerCase().includes(q)||p.telefone?.includes(q)
    const mst=!stageFilter||p.stage===stageFilter
    const mp=!prioFilter||p.prioridade===prioFilter
    return ms&&mst&&mp
  })

  const paged=filtered.slice(page*PER,(page+1)*PER)
  const totalPages=Math.ceil(filtered.length/PER)

  const onSave=(saved:any)=>{
    setProspects(ps=>{
      const idx=ps.findIndex(p=>p.id===saved.id)
      if(idx>=0){const n=[...ps];n[idx]=saved;return n}
      return [saved,...ps]
    })
  }
  const onDelete=(id:string)=>setProspects(ps=>ps.filter(p=>p.id!==id))

  const exportCSV=()=>{
    const h=['Nome','Empresa','Telefone','Email','Cargo','Origem','Etapa','Prioridade','MRR','Próx. Ação','Data']
    const rows=filtered.map(p=>[p.nome,p.empresa,p.telefone,p.email,p.cargo,p.origem,
      FUNIL_STAGES.find(s=>s.id===p.stage)?.label||p.stage,p.prioridade,p.mrr_estimado,p.proxima_acao,p.data_proxima_acao])
    const csv=[h,...rows].map(r=>r.map((c:any)=>`"${c||''}"`).join(',')).join('\n')
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download='fluxa-prospects.csv';a.click()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header dark={dark} onMenu={onMenu} title="Prospects" subtitle={`${filtered.length} registros`}
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV} className={cx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border',dark?'border-white/10 text-slate-300 hover:bg-white/10':'border-slate-200 text-slate-600 hover:bg-slate-50')}><Download size={13}/> CSV</button>
            <button onClick={()=>setShowNew(true)} className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-400"><Plus size={13}/> Novo</button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="px-4 py-3 flex flex-wrap gap-2 shrink-0">
        <div className={cx('flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm',dark?'bg-white/[0.04] border-white/10':'bg-white border-slate-200')}>
          <Search size={13} className={dark?'text-slate-500':'text-slate-400'}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Buscar..." className={cx('bg-transparent flex-1 outline-none text-xs',dark?'text-white placeholder-slate-500':'text-slate-900 placeholder-slate-400')}/>
        </div>
        <select value={stageFilter} onChange={e=>{setStageFilter(e.target.value);setPage(0)}}
          className={cx('px-3 py-2 rounded-xl border text-xs font-medium',dark?'bg-slate-800 border-white/10 text-slate-300':'bg-white border-slate-200 text-slate-700')}>
          <option value="">Todas Etapas</option>
          {FUNIL_STAGES.map(s=><option key={s.id} value={s.id}>{s.fase} · {s.label}</option>)}
        </select>
        <select value={prioFilter} onChange={e=>{setPrioFilter(e.target.value);setPage(0)}}
          className={cx('px-3 py-2 rounded-xl border text-xs font-medium',dark?'bg-slate-800 border-white/10 text-slate-300':'bg-white border-slate-200 text-slate-700')}>
          <option value="">Prioridade</option>
          {PRIORIDADES.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className={cx('rounded-2xl border overflow-hidden',dark?'border-white/[0.07]':'border-slate-200')}>
          <table className="w-full text-xs">
            <thead className={cx(dark?'bg-white/[0.04]':'bg-slate-50')}>
              <tr>{['Nome','Empresa','Etapa','Prioridade','MRR','Próxima Ação',''].map(h=>(
                <th key={h} className={cx('px-4 py-3 text-left font-semibold',dark?'text-slate-400':'text-slate-500')}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading&&<tr><td colSpan={7} className="px-4 py-8 text-center"><Sk className="h-8 mx-auto w-48"/></td></tr>}
              {!loading&&paged.length===0&&<tr><td colSpan={7} className={cx('px-4 py-8 text-center',dark?'text-slate-500':'text-slate-400')}>Nenhum prospect encontrado.</td></tr>}
              {paged.map(p=>{
                const stg=FUNIL_STAGES.find(s=>s.id===p.stage)
                const vencida=p.data_proxima_acao&&new Date(p.data_proxima_acao)<new Date()
                return (
                  <tr key={p.id} onClick={()=>setSelected(p)}
                    className={cx('border-t cursor-pointer transition-colors',
                      dark?'border-white/[0.05] hover:bg-white/[0.03]':'border-slate-100 hover:bg-slate-50')}>
                    <td className="px-4 py-3">
                      <p className={cx('font-semibold',dark?'text-white':'text-slate-900')}>{p.nome}</p>
                      {p.telefone&&<p className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>{p.telefone}</p>}
                    </td>
                    <td className={cx('px-4 py-3',dark?'text-slate-300':'text-slate-600')}>{p.empresa||'—'}</td>
                    <td className="px-4 py-3">
                      {stg&&<span className={cx('px-2 py-1 rounded-lg text-[10px] font-semibold border',stg.bg,stg.text,stg.border)}>{stg.label}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cx('px-2 py-1 rounded-lg text-[10px] font-semibold border',PRIO_STYLE[p.prioridade||'Média'])}>{p.prioridade||'Média'}</span>
                    </td>
                    <td className={cx('px-4 py-3 font-semibold',dark?'text-sky-400':'text-sky-600')}>
                      {p.mrr_estimado?`R$${Number(p.mrr_estimado).toLocaleString('pt-BR')}`:'—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.proxima_acao
                        ?<div><p className={cx('text-[10px]',vencida?'text-red-400':dark?'text-slate-300':'text-slate-600')}>{p.proxima_acao}</p>
                          {p.data_proxima_acao&&<p className={cx('text-[10px]',vencida?'text-red-400':dark?'text-slate-500':'text-slate-400')}>{new Date(p.data_proxima_acao).toLocaleDateString('pt-BR')}</p>}
                        </div>
                        :<span className={dark?'text-slate-600':'text-slate-400'}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button className={cx('p-1.5 rounded-lg',dark?'hover:bg-white/10 text-slate-500':'hover:bg-slate-100 text-slate-400')}><Edit2 size={13}/></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(
          <div className="flex items-center justify-between mt-3">
            <p className={cx('text-xs',dark?'text-slate-500':'text-slate-400')}>{filtered.length} registros · Página {page+1} de {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className={cx('px-3 py-1.5 rounded-lg text-xs border',dark?'border-white/10 text-slate-400 disabled:opacity-30':'border-slate-200 text-slate-500 disabled:opacity-30')}><ChevronLeft size={13}/></button>
              <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className={cx('px-3 py-1.5 rounded-lg text-xs border',dark?'border-white/10 text-slate-400 disabled:opacity-30':'border-slate-200 text-slate-500 disabled:opacity-30')}><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>

      <FluxaLeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)} onSave={onSave} onDelete={onDelete} addToast={addToast}/>
      <FluxaLeadModal dark={dark} lead={null} open={showNew} onClose={()=>setShowNew(false)} onSave={(s:any)=>{setProspects(ps=>[s,...ps]);setShowNew(false)}} onDelete={()=>{}} addToast={addToast}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// FLÜXA CALENDÁRIO — com vinculação a prospects
// ══════════════════════════════════════════════════════════════════
function FluxaCalendario({dark,addToast,onMenu}:any){
  const [meetings,setMeetings]=useState<any[]>([])
  const [prospects,setProspects]=useState<any[]>([])
  const [date,setDate]=useState(new Date())
  const [showNew,setShowNew]=useState(false)
  const [sel,setSel]=useState<any>(null)
  const [delConfirm,setDelConfirm]=useState(false)
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState<any>({event_type:'call',status:'pendente',date:'',time:'09:00',title:'',description:'',prospect_id:''})
  const [creating,setCreating]=useState(false)
  const [prospectSearch,setProspectSearch]=useState('')
  const [showProspectDrop,setShowProspectDrop]=useState(false)
  const dropRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    Promise.all([
      sb.from('fluxa_meetings').select('*').order('start_at'),
      sb.from('fluxa_prospects').select('id,nome,empresa,stage').order('nome'),
    ]).then(([mr,pr])=>{
      if(mr.data) setMeetings(mr.data)
      if(pr.data) setProspects(pr.data)
      setLoading(false)
    })
    const handler=(e:MouseEvent)=>{if(dropRef.current&&!dropRef.current.contains(e.target as Node))setShowProspectDrop(false)}
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
  },[])

  const y=date.getFullYear(),mo=date.getMonth()
  const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const fd=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate()
  const cells=[...Array(fd).fill(null),...Array.from({length:dim},(_:any,i:number)=>i+1)]
  while(cells.length%7!==0) cells.push(null)
  const weeks=Array.from({length:cells.length/7},(_:any,i:number)=>cells.slice(i*7,(i+1)*7))
  const today=new Date()

  const getMeetings=(day:number)=>{
    const ds=`${y}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return meetings.filter(mt=>mt.start_at?.startsWith(ds))
  }

  const openNew=(day?:number)=>{
    const dateStr=day?`${y}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`:new Date().toISOString().split('T')[0]
    setForm({event_type:'call',status:'pendente',date:dateStr,time:'09:00',title:'',description:'',prospect_id:''})
    setProspectSearch('');setShowProspectDrop(false);setShowNew(true)
  }

  const create=async()=>{
    if(!form.title?.trim()){addToast('Título obrigatório.','error');return}
    if(!form.date){addToast('Selecione a data.','error');return}
    setCreating(true)
    const prospect=form.prospect_id?prospects.find((p:any)=>p.id===form.prospect_id):null
    const start_at=`${form.date}T${form.time||'09:00'}:00`
    const{data,error}=await sb.from('fluxa_meetings').insert({
      title:form.title.trim(),event_type:form.event_type,status:form.status,
      start_at,description:form.description||null,
      prospect_id:form.prospect_id||null,
      prospect_name:prospect?.nome||null,
      prospect_empresa:prospect?.empresa||null,
      created_at:new Date().toISOString()
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro: '+error.message,'error');return}
    if(data) setMeetings(ms=>[...ms,data])
    setShowNew(false);addToast('Evento agendado! 📅','success')
  }

  const deleteMeeting=async()=>{
    if(!sel) return
    await sb.from('fluxa_meetings').delete().eq('id',sel.id)
    setMeetings(ms=>ms.filter(m=>m.id!==sel.id))
    setSel(null);setDelConfirm(false);addToast('Evento apagado.','success')
  }

  const updateStatus=async(id:string,status:string)=>{
    await sb.from('fluxa_meetings').update({status,updated_at:new Date().toISOString()}).eq('id',id)
    setMeetings(ms=>ms.map(mt=>mt.id===id?{...mt,status}:mt))
    setSel((s:any)=>s?{...s,status}:s)
    addToast(status==='confirmado'?'Confirmado! ✅':'Cancelado.','success')
  }

  // Tipos de evento para o calendário Flüxa
  const ET:any={
    call:    {label:'Call',    dot:'#34D399',cl:dark?'bg-sky-500/20 text-sky-300 border-sky-500/30':'bg-sky-100 text-sky-700 border-sky-300'},
    reuniao: {label:'Reunião', dot:'#A78BFA',cl:dark?'bg-violet-500/20 text-violet-300 border-violet-500/30':'bg-violet-100 text-violet-700 border-violet-300'},
    followup:{label:'Follow-up',dot:'#60A5FA',cl:dark?'bg-blue-500/20 text-blue-300 border-blue-500/30':'bg-blue-100 text-blue-700 border-blue-300'},
    demo:    {label:'Demo',    dot:'#FB923C',cl:dark?'bg-orange-500/20 text-orange-300 border-orange-500/30':'bg-orange-100 text-orange-700 border-orange-300'},
  }
  const SC:any={confirmado:'text-sky-400',pendente:'text-amber-400',cancelado:'text-red-400'}
  const SB:any={confirmado:'bg-sky-500/15 border-sky-500/30',pendente:'bg-amber-500/15 border-amber-500/30',cancelado:'bg-red-500/15 border-red-500/30'}

  const filteredProspects=prospects.filter((p:any)=>
    !prospectSearch||p.nome?.toLowerCase().includes(prospectSearch.toLowerCase())||p.empresa?.toLowerCase().includes(prospectSearch.toLowerCase())
  ).slice(0,6)

  const upcoming=[...meetings]
    .filter(m=>new Date(m.start_at)>=new Date(today.toDateString()))
    .sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime())
    .slice(0,8)

  const selProspect=sel?.prospect_id?prospects.find((p:any)=>p.id===sel.prospect_id):null
  const stageOfSel=selProspect?FUNIL_STAGES.find(s=>s.id===selProspect.stage):null

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className={cx('flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10',dark?'bg-slate-950/80 border-white/[0.06] backdrop-blur-md':'bg-white/80 border-slate-100 backdrop-blur-md')}>
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className={cx('sm:hidden p-2 rounded-xl',dark?'hover:bg-white/10':'hover:bg-slate-100')}><Menu size={16} className={dark?'text-slate-400':'text-slate-500'}/></button>
          <div>
            <h1 className={cx('text-base font-black',dark?'text-white':'text-slate-900')}>Calendário</h1>
            <p className={cx('text-[11px]',dark?'text-slate-500':'text-slate-400')}>{meetings.length} evento{meetings.length!==1?'s':''} agendados</p>
          </div>
        </div>
        <button onClick={()=>openNew()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-600 transition-all active:scale-95">
          <Plus size={13}/>Agendar Call
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Grade do calendário */}
        <div className={cx('rounded-2xl border overflow-hidden',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
          <div className={cx('flex items-center justify-between px-5 py-3 border-b',dark?'border-white/[0.06]':'border-slate-100')}>
            <button onClick={()=>setDate(new Date(y,mo-1))} className={cx('w-8 h-8 rounded-xl flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronLeft size={15}/></button>
            <p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>{MONTHS[mo]} {y}</p>
            <button onClick={()=>setDate(new Date(y,mo+1))} className={cx('w-8 h-8 rounded-xl flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronRight size={15}/></button>
          </div>
          <div className={cx('grid grid-cols-7 border-b',dark?'border-white/[0.05]':'border-slate-100')}>
            {DAYS.map((d,i)=><div key={i} className={cx('py-2 text-center text-[10px] font-semibold',dark?'text-slate-500':'text-slate-400')}>{d}</div>)}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} className={cx('grid grid-cols-7 border-b last:border-0',dark?'border-white/[0.04]':'border-slate-100')}>
              {week.map((day:any,di:number)=>{
                const dm=day?getMeetings(day):[]
                const isToday=day&&today.getDate()===day&&today.getMonth()===mo&&today.getFullYear()===y
                const isPast=day&&new Date(y,mo,day)<new Date(today.toDateString())
                return (
                  <div key={di} onClick={()=>day&&!isPast&&openNew(day)}
                    className={cx('min-h-[64px] p-1.5 border-r last:border-0 transition-colors',
                      dark?'border-white/[0.04]':'border-slate-100',
                      !day?'opacity-0 pointer-events-none':'',
                      day&&!isPast?(dark?'cursor-pointer hover:bg-white/[0.03]':'cursor-pointer hover:bg-slate-50'):'',
                      isPast&&(dark?'opacity-40':'opacity-50'))}>
                    {day&&<>
                      <span className={cx('text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 mx-auto',isToday?'bg-sky-500 text-white':(dark?'text-slate-500':'text-slate-400'))}>{day}</span>
                      {dm.slice(0,2).map((mt:any)=>(
                        <button key={mt.id} onClick={e=>{e.stopPropagation();setSel(mt);setDelConfirm(false)}}
                          className={cx('w-full text-left text-[8px] font-semibold px-1.5 py-0.5 rounded-md border truncate mb-0.5 flex items-center gap-1',ET[mt.event_type]?.cl||ET.call.cl)}>
                          <div className="w-1 h-1 rounded-full shrink-0" style={{background:ET[mt.event_type]?.dot||'#34D399'}}/>
                          <span className="truncate">{mt.prospect_name||mt.title}</span>
                        </button>
                      ))}
                      {dm.length>2&&<p className={cx('text-[8px] px-1 font-medium',dark?'text-slate-500':'text-slate-400')}>+{dm.length-2}</p>}
                    </>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Próximos eventos */}
        <div className={cx('p-5 rounded-2xl border',dark?'bg-white/[0.03] border-white/[0.07]':'bg-white border-slate-100 shadow-sm')}>
          <div className="flex items-center justify-between mb-4">
            <p className={cx('text-sm font-bold',dark?'text-white':'text-slate-900')}>Próximas Calls & Eventos</p>
            <span className={cx('text-[10px] font-semibold px-2 py-1 rounded-lg',dark?'bg-white/5 text-slate-500':'bg-slate-100 text-slate-500')}>{upcoming.length} próximos</span>
          </div>
          {loading?<Sk className="h-32"/>:(
            <div className="space-y-2">
              {upcoming.map(mt=>{
                const et=ET[mt.event_type]||ET.call
                const dtStr=mt.start_at?.replace('T',' ').slice(0,16)
                return (
                  <button key={mt.id} onClick={()=>{setSel(mt);setDelConfirm(false)}}
                    className={cx('w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99]',dark?'border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03]':'border-slate-100 hover:border-slate-200 hover:bg-slate-50')}>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 self-stretch rounded-full shrink-0" style={{background:et.dot}}/>
                      <div className="flex-1 min-w-0">
                        <p className={cx('text-xs font-bold truncate',dark?'text-white':'text-slate-900')}>{mt.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>{et.label} · {dtStr}</span>
                          {mt.prospect_name&&(
                            <span className={cx('text-[10px] font-semibold flex items-center gap-1',dark?'text-sky-400':'text-sky-600')}>
                              <User size={9}/>{mt.prospect_name}{mt.prospect_empresa&&` · ${mt.prospect_empresa}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={cx('text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0',SC[mt.status],SB[mt.status])}>{mt.status}</span>
                    </div>
                  </button>
                )
              })}
              {upcoming.length===0&&<p className={cx('text-xs text-center py-6',dark?'text-slate-600':'text-slate-400')}>Nenhum evento próximo 🎉</p>}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Criar Evento ── */}
      <Modal dark={dark} open={showNew} onClose={()=>setShowNew(false)} title="Agendar Evento" size="md">
        <div className="space-y-4">
          {/* Tipo de evento */}
          <div>
            <label className={cx('text-xs font-semibold mb-2 block',dark?'text-slate-400':'text-slate-500')}>Tipo de Evento</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ET).map(([v,et]:any)=>(
                <button key={v} onClick={()=>setForm((f:any)=>({...f,event_type:v}))}
                  className={cx('py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 flex flex-col items-center gap-1',
                    form.event_type===v?et.cl:(dark?'border-white/10 text-slate-500 hover:border-white/20':'border-slate-200 text-slate-500 hover:border-slate-300'))}>
                  <div className="w-2 h-2 rounded-full" style={{background:et.dot}}/>
                  {et.label}
                </button>
              ))}
            </div>
          </div>

          <Field dark={dark} label="Título *" value={form.title} onChange={(v:string)=>setForm((f:any)=>({...f,title:v}))} placeholder="Ex: Call de diagnóstico" required/>

          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Data *" value={form.date} onChange={(v:string)=>setForm((f:any)=>({...f,date:v}))} type="date" required icon={Calendar}/>
            <Field dark={dark} label="Horário" value={form.time} onChange={(v:string)=>setForm((f:any)=>({...f,time:v}))} type="time" icon={Bell}/>
          </div>

          {/* Status */}
          <div>
            <label className={cx('text-xs font-semibold mb-2 block',dark?'text-slate-400':'text-slate-500')}>Status</label>
            <div className="flex gap-2">
              {[{v:'pendente',l:'Pendente'},{v:'confirmado',l:'Confirmado'},{v:'cancelado',l:'Cancelado'}].map(({v,l})=>(
                <button key={v} onClick={()=>setForm((f:any)=>({...f,status:v}))}
                  className={cx('flex-1 py-2 rounded-xl border text-xs font-semibold transition-all',
                    form.status===v?(v==='confirmado'?'bg-sky-500/20 border-sky-500/40 text-sky-400':v==='cancelado'?'bg-red-500/20 border-red-500/40 text-red-400':'bg-amber-500/20 border-amber-500/40 text-amber-400'):(dark?'border-white/10 text-slate-500':'border-slate-200 text-slate-500'))}>{l}</button>
              ))}
            </div>
          </div>

          {/* Vincular prospect */}
          <div ref={dropRef} className="relative">
            <label className={cx('text-xs font-semibold mb-1.5 block',dark?'text-slate-400':'text-slate-500')}>
              Vincular Lead / Prospect <span className={cx('font-normal',dark?'text-slate-600':'text-slate-400')}>(opcional)</span>
            </label>
            {form.prospect_id?(
              <div className={cx('flex items-center gap-3 px-3 py-2.5 rounded-xl border',dark?'bg-sky-500/5 border-sky-500/30':'bg-sky-50 border-sky-200')}>
                <div className={cx('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',dark?'bg-sky-500/20 text-sky-400':'bg-sky-200 text-sky-700')}>
                  {prospects.find((p:any)=>p.id===form.prospect_id)?.nome?.[0]?.toUpperCase()||'?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cx('text-xs font-bold',dark?'text-white':'text-slate-900')}>{prospects.find((p:any)=>p.id===form.prospect_id)?.nome}</p>
                  <p className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>{prospects.find((p:any)=>p.id===form.prospect_id)?.empresa}</p>
                </div>
                <button onClick={()=>setForm((f:any)=>({...f,prospect_id:''}))} className={cx('p-1 rounded-lg',dark?'hover:bg-white/10 text-slate-500':'hover:bg-slate-100 text-slate-400')}><X size={12}/></button>
              </div>
            ):(
              <div className="relative">
                <Search size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',dark?'text-slate-500':'text-slate-400')}/>
                <input value={prospectSearch} onChange={e=>{setProspectSearch(e.target.value);setShowProspectDrop(true)}} onFocus={()=>setShowProspectDrop(true)}
                  placeholder="Buscar prospect por nome ou empresa..."
                  className={cx('w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none',dark?'bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-sky-500/50':'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-400')}/>
                {showProspectDrop&&filteredProspects.length>0&&(
                  <div className={cx('absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden',dark?'bg-slate-900 border-white/10':'bg-white border-slate-200')}>
                    {filteredProspects.map((p:any)=>{
                      const stg=FUNIL_STAGES.find(s=>s.id===p.stage)
                      return (
                        <button key={p.id} onClick={()=>{setForm((f:any)=>({...f,prospect_id:p.id,title:form.title||`Call com ${p.nome}`}));setProspectSearch('');setShowProspectDrop(false)}}
                          className={cx('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',dark?'hover:bg-white/5':'hover:bg-slate-50')}>
                          <div className={cx('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',stg?.bg||'bg-slate-100',stg?.text||'text-slate-700')}>
                            {p.nome?.[0]?.toUpperCase()||'?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cx('text-xs font-semibold truncate',dark?'text-white':'text-slate-900')}>{p.nome}</p>
                            <p className={cx('text-[10px]',dark?'text-slate-500':'text-slate-400')}>{p.empresa||'—'} · {stg?.label||p.stage}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <Textarea dark={dark} label="Observações" value={form.description} onChange={(v:string)=>setForm((f:any)=>({...f,description:v}))} placeholder="Pauta, objetivos da call..." rows={2}/>

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={()=>setShowNew(false)} className={cx('px-4 py-2.5 rounded-xl border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-600 text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-sky-500/20">
              {creating?'Agendando...':'Agendar ✓'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Detalhes ── */}
      <Modal dark={dark} open={!!sel} onClose={()=>{setSel(null);setDelConfirm(false)}} title="Detalhes do Evento" size="sm">
        {sel&&(()=>{
          const et=ET[sel.event_type]||ET.call
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cx('px-2.5 py-1 rounded-lg border text-xs font-semibold',et.cl)}>{et.label}</span>
                <span className={cx('px-2.5 py-1 rounded-lg border text-xs font-semibold',SC[sel.status],SB[sel.status])}>{sel.status}</span>
              </div>

              <div>
                <p className={cx('text-base font-black',dark?'text-white':'text-slate-900')}>{sel.title}</p>
                <p className={cx('text-xs mt-0.5 flex items-center gap-1.5',dark?'text-slate-400':'text-slate-500')}>
                  <Calendar size={11}/>{sel.start_at?.replace('T',' ').slice(0,16)}
                </p>
              </div>

              {(sel.prospect_id||sel.prospect_name)&&(
                <div className={cx('flex items-center gap-3 p-3 rounded-xl border',dark?'bg-sky-500/5 border-sky-500/20':'bg-sky-50 border-sky-200')}>
                  <div className={cx('w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0',dark?'bg-sky-500/20 text-sky-300':'bg-sky-200 text-sky-700')}>
                    {sel.prospect_name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cx('text-sm font-bold',dark?'text-sky-300':'text-sky-700')}>{sel.prospect_name}</p>
                    {sel.prospect_empresa&&<p className={cx('text-xs',dark?'text-slate-500':'text-slate-400')}>{sel.prospect_empresa}</p>}
                    {stageOfSel&&<span className={cx('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border',stageOfSel.bg,stageOfSel.text,stageOfSel.border)}>{stageOfSel.label}</span>}
                  </div>
                </div>
              )}

              {sel.description&&(
                <p className={cx('text-xs leading-relaxed p-3 rounded-xl border',dark?'bg-white/[0.02] border-white/[0.06] text-slate-400':'bg-slate-50 border-slate-200 text-slate-600')}>{sel.description}</p>
              )}

              {sel.status!=='confirmado'&&<button onClick={()=>updateStatus(sel.id,'confirmado')} className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-bold transition-all">✓ Confirmar evento</button>}
              {sel.status!=='cancelado'&&<button onClick={()=>updateStatus(sel.id,'cancelado')} className={cx('w-full py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95',dark?'border-slate-700 text-slate-400 hover:bg-white/5':'border-slate-200 text-slate-600 hover:bg-slate-50')}>Marcar como cancelado</button>}

              {!delConfirm
                ?<button onClick={()=>setDelConfirm(true)} className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"><Trash2 size={13}/>Apagar evento</button>
                :<div className={cx('p-3 rounded-xl border',dark?'border-red-500/20 bg-red-500/5':'border-red-200 bg-red-50')}>
                  <p className={cx('text-xs mb-3 text-center',dark?'text-red-300':'text-red-600')}>Tem certeza?</p>
                  <div className="flex gap-2">
                    <button onClick={()=>setDelConfirm(false)} className={cx('flex-1 py-2 rounded-lg border text-xs',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Não</button>
                    <button onClick={deleteMeeting} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold active:scale-95">Apagar</button>
                  </div>
                </div>
              }
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// HUB EMPRESAS (lista)
// ══════════════════════════════════════════════════════════════════
function HubEmpresas({dark,addToast,onMenu}:any){
  const [companies,setCompanies]=useState<any[]>([])
  const [eliConfigs,setEliConfigs]=useState<Record<string,any>>({})
  const [loading,setLoading]=useState(true)
  const [delConfirm,setDelConfirm]=useState<any>(null)
  const [editItem,setEditItem]=useState<any>(null)
  const [editForm,setEditForm]=useState({company_name:'',instancia_evolution:'',apikey_evolution:'',numero_gestor:'',crm_active:true})
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    Promise.all([
      sb.from('companies').select('*').order('created_at',{ascending:false}),
      sb.from('fluxa_empresas_config').select('company_id,instancia_evolution,apikey_evolution,numero_gestor')
    ]).then(([{data:cs},{data:ec}])=>{
      if(cs) setCompanies(cs)
      if(ec){
        const m:Record<string,any>={}
        ec.forEach((r:any)=>{m[r.company_id]=r})
        setEliConfigs(m)
      }
      setLoading(false)
    })
  },[])

  const deleteCompany=async()=>{
    if(!delConfirm) return
    await sb.from('users').delete().eq('company_id',delConfirm.id)
    await sb.from('leads').delete().eq('company_id',delConfirm.id)
    await sb.from('funnels').delete().eq('company_id',delConfirm.id)
    await sb.from('meetings').delete().eq('company_id',delConfirm.id)
    await sb.from('support_tickets').delete().eq('company_id',delConfirm.id)
    await sb.from('company_auth').delete().eq('company_id',delConfirm.id)
    await sb.from('fluxa_empresas_config').delete().eq('company_id',delConfirm.id)
    const {error}=await sb.from('companies').delete().eq('id',delConfirm.id)
    if(error){addToast('Erro ao apagar: '+error.message,'error');setDelConfirm(null);return}
    setCompanies(cs=>cs.filter(c=>c.id!==delConfirm.id))
    setDelConfirm(null);addToast('Empresa apagada.','success')
  }

  const openEdit=(c:any)=>{
    const cfg=eliConfigs[c.id]||{}
    setEditForm({
      company_name:c.company_name||'',
      instancia_evolution:cfg.instancia_evolution||'',
      apikey_evolution:cfg.apikey_evolution||'',
      numero_gestor:cfg.numero_gestor||'',
      crm_active:c.crm_active!==false
    })
    setEditItem(c)
  }

  const saveEdit=async()=>{
    if(!editItem) return
    setSaving(true)
    await sb.from('companies').update({
      company_name:editForm.company_name.trim(),
      crm_active:editForm.crm_active,
      updated_at:new Date().toISOString()
    }).eq('id',editItem.id)
    await sb.from('fluxa_empresas_config').update({
      nome_empresa:editForm.company_name.trim(),
      instancia_evolution:editForm.instancia_evolution.trim(),
      apikey_evolution:editForm.apikey_evolution.trim(),
      numero_gestor:editForm.numero_gestor.trim()
    }).eq('company_id',editItem.id)
    setCompanies(cs=>cs.map(c=>c.id===editItem.id?{...c,company_name:editForm.company_name.trim(),crm_active:editForm.crm_active}:c))
    setEliConfigs(ec=>({...ec,[editItem.id]:{...ec[editItem.id],instancia_evolution:editForm.instancia_evolution.trim(),apikey_evolution:editForm.apikey_evolution.trim(),numero_gestor:editForm.numero_gestor.trim()}}))
    setSaving(false)
    setEditItem(null)
    addToast('Empresa atualizada!','success')
  }

  const filtered=companies.filter(c=>c.company_slug!==FLUXA_SLUG)

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title="Empresas Cadastradas" subtitle={`${filtered.length} parceiros`}/>
      <div className="flex-1 overflow-y-auto p-4">
        {loading?<div className="space-y-2">{[1,2,3].map(i=><Sk key={i} className="h-16 rounded-2xl"/>)}</div>:(
          <div className="space-y-2">
            {filtered.map((c,i)=>{
              const cfg=eliConfigs[c.id]||{}
              return (
                <div key={c.id} className={cx('flex items-center gap-4 p-4 rounded-2xl border',T.card(dark))}>
                  <span className={cx('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',dark?'bg-white/10 text-slate-400':'bg-slate-100 text-slate-600')}>{i+1}</span>
                  <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',dark?'bg-sky-500/15':'bg-sky-100')}>
                    {c.company_logo_url?<img src={c.company_logo_url} className="w-8 h-8 object-contain rounded-lg" alt=""/>:<Zap size={16} className={dark?'text-sky-400':'text-sky-600'}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cx('text-sm font-semibold',T.text(dark))}>{c.company_name}</p>
                    <p className={cx('text-[10px] font-mono',T.muted(dark))}>@{c.company_slug}</p>
                    <div className="flex gap-2 mt-0.5">
                      {cfg.instancia_evolution
                        ?<span className={cx('text-[10px]',dark?'text-sky-400':'text-sky-600')}>⚡ {cfg.instancia_evolution}</span>
                        :<span className={cx('text-[10px] text-amber-400')}>⚠️ Sem instância</span>
                      }
                      {cfg.numero_gestor
                        ?<span className={cx('text-[10px]',T.muted(dark))}>📲 {cfg.numero_gestor}</span>
                        :<span className={cx('text-[10px] text-amber-400')}>⚠️ Sem gestor</span>
                      }
                    </div>
                  </div>
                  <span className={cx('text-xs px-2.5 py-1 rounded-full border font-medium shrink-0',c.crm_active?'bg-sky-500/15 text-sky-600 border-sky-400/30':'bg-red-500/15 text-red-500 border-red-400/30')}>{c.crm_active?'Ativa':'Inativa'}</span>
                  <button onClick={()=>openEdit(c)} className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',dark?'hover:bg-white/10 text-slate-500 hover:text-white':'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}><Edit2 size={14}/></button>
                  <button onClick={()=>setDelConfirm(c)} className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',dark?'hover:bg-red-500/10 text-slate-500 hover:text-red-400':'hover:bg-red-50 text-slate-400 hover:text-red-500')}><Trash2 size={14}/></button>
                </div>
              )
            })}
            {filtered.length===0&&<p className={cx('text-center text-sm py-8',T.muted(dark))}>Nenhuma empresa cadastrada.</p>}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {editItem&&(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setEditItem(null)}/>
          <div className={cx('relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border p-5',T.modal(dark))}>
            <div className="flex items-center justify-between mb-4">
              <p className={cx('text-sm font-bold',T.text(dark))}>Editar — {editItem.company_name}</p>
              <button onClick={()=>setEditItem(null)} className={cx('p-1.5 rounded-lg',T.muted(dark))}><X size={14}/></button>
            </div>
            <div className="space-y-3">
              <Field dark={dark} label="Nome da empresa" value={editForm.company_name} onChange={(v:string)=>setEditForm(f=>({...f,company_name:v}))} icon={Building2} required/>
              <Field dark={dark} label="WhatsApp do gestor" value={editForm.numero_gestor} onChange={(v:string)=>setEditForm(f=>({...f,numero_gestor:v}))} icon={Phone} placeholder="5547999999999"/>
              <Field dark={dark} label="Instância Evolution API" value={editForm.instancia_evolution} onChange={(v:string)=>setEditForm(f=>({...f,instancia_evolution:v}))} icon={Globe} placeholder="Ex: Vidramax"/>
              <Field dark={dark} label="API Key Evolution" value={editForm.apikey_evolution} onChange={(v:string)=>setEditForm(f=>({...f,apikey_evolution:v}))} icon={Lock} placeholder="Ex: ABC123..."/>
              <div className="flex items-center justify-between p-3 rounded-xl border" style={{borderColor:dark?'rgba(255,255,255,0.08)':'#e2e8f0'}}>
                <p className={cx('text-sm font-medium',T.text(dark))}>CRM Ativo</p>
                <button onClick={()=>setEditForm(f=>({...f,crm_active:!f.crm_active}))}
                  className={cx('relative w-11 h-6 rounded-full transition-colors duration-300',editForm.crm_active?'bg-sky-500':'bg-slate-600')}>
                  <div className={cx('absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',editForm.crm_active?'left-6':'left-1')}/>
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setEditItem(null)} className={cx('flex-1 py-2.5 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold disabled:opacity-60 transition-all active:scale-95">
                {saving?'Salvando...':'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Confirm dark={dark} open={!!delConfirm} onClose={()=>setDelConfirm(null)} onOk={deleteCompany} title="Apagar Empresa" msg={`Apagar "${delConfirm?.company_name}"? Todos os dados serão permanentemente excluídos.`}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// HUB CRIAR EMPRESA
// ══════════════════════════════════════════════════════════════════
function HubCriarEmpresa({dark,addToast,setTab,onMenu}:any){
  const [form,setForm]=useState({company_name:'',company_slug:'',gestor_nome:'',gestor_usuario:'',gestor_senha:'',funil_nome:'Funil Geral',numero_gestor:'',instancia_evolution:'',apikey_evolution:''})
  const [creating,setCreating]=useState(false)
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}))

  const create=async()=>{
    const {company_name,company_slug,gestor_nome,gestor_usuario,gestor_senha}=form
    if(!company_name.trim()||!company_slug.trim()||!gestor_nome.trim()||!gestor_usuario.trim()||!gestor_senha.trim()){
      addToast('Preencha todos os campos obrigatórios.','error');return
    }
    const slug=company_slug.trim().toLowerCase().replace(/\s+/g,'-')
    setCreating(true)
    try{
      const companyId=crypto.randomUUID()
      const senhaHash=await bcrypt.hash(gestor_senha.trim(),10)
      const {error:ce}=await sb.from('companies').insert({id:companyId,company_name:company_name.trim(),company_slug:slug,crm_active:true})
      if(ce) throw new Error('Erro ao criar empresa: '+ce.message)
      await sb.from('company_auth').insert({company_id:companyId,company_slug:slug,password_hash:senhaHash,active:true})
      const {error:ue}=await sb.from('users').insert({
        company_id:companyId,full_name:gestor_nome.trim(),display_name:gestor_nome.trim(),
        username:gestor_usuario.trim().toLowerCase(),password_hash:senhaHash,
        role:'gestor',active:true,email:null,
      })
      if(ue) throw new Error('Erro ao criar usuário: '+ue.message)
      await sb.from('funnels').insert({company_id:companyId,name:form.funil_nome.trim()||'Funil Geral'})
      await sb.from('fluxa_empresas_config').insert({
        company_id:companyId,company_slug:slug,nome_empresa:company_name.trim(),
        numero_gestor:form.numero_gestor.trim()||'',
        apikey_evolution:form.apikey_evolution.trim()||'',
        instancia_evolution:form.instancia_evolution.trim()||'',
        ativo:true
      })
      addToast(`Empresa "${company_name.trim()}" criada com sucesso! 🎉`,'success')
      setForm({company_name:'',company_slug:'',gestor_nome:'',gestor_usuario:'',gestor_senha:'',funil_nome:'Funil Geral',numero_gestor:'',instancia_evolution:'',apikey_evolution:''})
      setTab('hub_empresas')
    }catch(e:any){addToast(e.message||'Erro ao criar empresa.','error')}
    setCreating(false)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} onMenu={onMenu} title="Criar Empresa" subtitle="Cadastrar novo parceiro no hub"/>
      <div className="p-4 max-w-lg space-y-4">
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-4 flex items-center gap-2',T.text(dark))}><Building2 size={13}/>Dados da Empresa</p>
          <div className="space-y-3">
            <Field dark={dark} label="Nome da empresa" value={form.company_name} onChange={(v:string)=>set('company_name',v)} required icon={Building2} placeholder="Ex: Vidramax"/>
            <Field dark={dark} label="Slug (login)" value={form.company_slug} onChange={(v:string)=>set('company_slug',v.toLowerCase().replace(/\s+/g,'-'))} required icon={Hash} placeholder="ex: vidramax"/>
            <Field dark={dark} label="Nome do funil padrão" value={form.funil_nome} onChange={(v:string)=>set('funil_nome',v)} placeholder="Funil Geral"/>
          </div>
        </div>
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-4 flex items-center gap-2',T.text(dark))}><User size={13}/>Gestor Principal</p>
          <div className="space-y-3">
            <Field dark={dark} label="Nome completo" value={form.gestor_nome} onChange={(v:string)=>set('gestor_nome',v)} required icon={User} placeholder="Ex: João Silva"/>
            <div className="grid grid-cols-2 gap-3">
              <Field dark={dark} label="Usuário (login)" value={form.gestor_usuario} onChange={(v:string)=>set('gestor_usuario',v)} required icon={Hash} placeholder="joaosilva"/>
              <Field dark={dark} label="Senha" value={form.gestor_senha} onChange={(v:string)=>set('gestor_senha',v)} required type="password" icon={Lock}/>
            </div>
          </div>
        </div>
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-4 flex items-center gap-2',T.text(dark))}><Zap size={13}/>Configuração do Eli (WhatsApp)</p>
          <div className="space-y-3">
            <Field dark={dark} label="WhatsApp do gestor" value={form.numero_gestor} onChange={(v:string)=>set('numero_gestor',v)} icon={Phone} placeholder="5547999999999"/>
            <Field dark={dark} label="Instância Evolution API" value={form.instancia_evolution} onChange={(v:string)=>set('instancia_evolution',v)} icon={Globe} placeholder="Ex: Vidramax"/>
            <Field dark={dark} label="API Key Evolution" value={form.apikey_evolution} onChange={(v:string)=>set('apikey_evolution',v)} icon={Lock} placeholder="Ex: ABC123..."/>
          </div>
          <div className={cx('mt-3 flex items-start gap-2 p-2.5 rounded-lg',dark?'bg-sky-500/5 border border-sky-500/20':'bg-sky-50 border border-sky-200')}>
            <Zap size={11} className="text-sky-400 shrink-0 mt-0.5"/>
            <p className={cx('text-[11px]',dark?'text-sky-300/70':'text-sky-700')}>Esses dados podem ser editados depois pelo gestor na aba <span className="font-semibold">Configurar Eli</span> do CRM.</p>
          </div>
        </div>
        <div className={cx('p-4 rounded-2xl border',dark?'border-blue-500/20 bg-blue-500/5':'border-blue-200 bg-blue-50')}>
          <p className={cx('text-xs font-medium flex items-center gap-2',dark?'text-blue-300':'text-blue-700')}><AlertCircle size={13}/>O gestor receberá acesso completo ao CRM da empresa.</p>
        </div>
        <button onClick={create} disabled={creating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2">
          {creating?<><RefreshCw size={14} className="animate-spin"/>Criando...</>:<><Plus size={14}/>Criar Empresa</>}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEAD MODAL
// ══════════════════════════════════════════════════════════════════
function LeadModal({lead,open,onClose,onSave,onDelete,role,addToast,funnels,companyId,users,dark=true}:any){
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
    // Salva campos principais sem funnel_id (evita erro de schema cache)
    const payload:any={
      nome:form.nome,telefone:form.telefone,email:form.email,
      servico:form.servico,valor_estimado:Number(form.valor_estimado)||0,
      pipeline_stage:form.pipeline_stage,status:form.status,
      nivel_interesse:form.nivel_interesse,resumo_gestor:form.resumo_gestor,
      assigned_to:form.assigned_to||null,
      updated_at:new Date().toISOString()
    }
    // Tenta incluir funnel_id; se a coluna não existir, ignora silenciosamente
    try { payload.funnel_id=form.funnel_id||null } catch(_){}
    const {error}=await sb.from('leads').update(payload).eq('id',lead.id)
    if(error){
      // Se o erro for de funnel_id, tenta salvar sem ele
      if(error.message?.includes('funnel_id')){
        const {funnel_id:_removed,...payloadSemFunil}=payload
        const {error:error2}=await sb.from('leads').update(payloadSemFunil).eq('id',lead.id)
        setSaving(false)
        if(error2){addToast('Erro ao salvar: '+error2.message,'error');return}
        onSave({...lead,...form});addToast('Lead salvo!','success');onClose();return
      }
      setSaving(false)
      addToast('Erro ao salvar: '+error.message,'error');return
    }
    setSaving(false)
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
          {/* Responsável */}
          <div className="flex flex-col gap-1.5">
            <label className={cx('text-xs font-medium',T.sub(dark))}>Responsável</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>set('assigned_to',null)}
                className={cx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                  !form.assigned_to?(dark?'bg-white/10 border-white/20 text-white':'bg-slate-200 border-slate-400 text-slate-800'):(dark?'border-white/10 text-slate-500':'border-slate-300 text-slate-400'))}>
                <User size={11}/>Nenhum
              </button>
              {(users||[]).map((u:any)=>(
                <button key={u.id} onClick={()=>set('assigned_to',u.id)}
                  className={cx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all active:scale-95',
                    form.assigned_to===u.id?(dark?'bg-sky-500/20 border-sky-500/40 text-sky-300':'bg-sky-100 border-sky-400 text-sky-700'):(dark?'border-white/10 text-slate-400 hover:border-white/20':'border-slate-300 text-slate-500 hover:border-slate-400'))}>
                  <Av name={u.display_name||u.full_name} size="xs" url={u.avatar_url}/>
                  {u.display_name||u.full_name}
                </button>
              ))}
            </div>
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
                className={cx('flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
              <button onClick={addNote} className="px-3 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25"><Send size={13}/></button>
            </div>
          </div>
        </div>
        <div className={cx('flex justify-between mt-5 pt-4 border-t',dark?'border-white/[0.06]':'border-slate-200')}>
          {canDel?<button onClick={()=>setDelConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm"><Trash2 size={13}/>Excluir</button>:<div/>}
          <div className="flex gap-2">
            <button onClick={onClose} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600 hover:bg-slate-50')}>Cancelar</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium disabled:opacity-60">{saving?'Salvando...':'Salvar'}</button>
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
function Pipeline({leads,setLeads,role,addToast,company,funnels,users,dark,onMenu}:any){
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
  const [eliPausados,setEliPausados]=useState<Set<string>>(new Set())
  const canEdit=['founder','gestor'].includes(role)

  useEffect(()=>{
    sb.from('eli_bloqueados').select('telefone').eq('company_id',company.id)
      .then(({data})=>{if(data) setEliPausados(new Set(data.map((r:any)=>r.telefone)))})
  },[company.id])

  const toggleEli=async(lead:any,e:any)=>{
    e.stopPropagation()
    const tel=lead.telefone
    if(!tel){addToast('Lead sem telefone.','error');return}
    const pausado=eliPausados.has(tel)
    if(pausado){
      await sb.from('eli_bloqueados').delete().eq('company_id',company.id).eq('telefone',tel)
      setEliPausados(s=>{const n=new Set(s);n.delete(tel);return n})
      addToast('Eli retomado para '+lead.nome,'success')
    } else {
      await sb.from('eli_bloqueados').insert({company_id:company.id,telefone:tel,motivo:'Pausado manualmente'})
      setEliPausados(s=>new Set(s).add(tel))
      addToast('Eli pausado para '+lead.nome,'success')
    }
  }

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
  const cardBg=dark?'bg-slate-900/80 border-white/[0.07] hover:border-white/[0.15]':'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
  const colBg=(over:boolean)=>dark?(over?'border-white/20 bg-white/[0.05]':'border-white/[0.06] bg-white/[0.015]'):(over?'border-sky-300 bg-sky-50/30':'border-slate-300 bg-slate-50')

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title="Pipeline" subtitle={`${filtered.length} leads`} actions={
        <div className="flex gap-2 items-center">
          <select value={filterColab} onChange={e=>setFilterColab(e.target.value)}
            className={cx('text-xs rounded-lg px-2 py-1.5 border focus:outline-none max-w-[130px]',T.input(dark))}>
            <option value="all" className={T.sel(dark)}>Todos</option>
            <option value="none" className={T.sel(dark)}>Sem responsável</option>
            {users?.map((u:any)=><option key={u.id} value={u.id} className={T.sel(dark)}>{u.display_name||u.full_name}</option>)}
          </select>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold shadow-md transition-all"><Plus size={13}/>Lead</button>
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
                        className={cx('flex-1 bg-transparent text-xs font-semibold focus:outline-none border-b border-sky-500/60 min-w-0',T.text(dark))}/>
                    ):(
                      <span className={cx('text-xs font-semibold truncate flex-1',T.text(dark))}>{lbl(stage)}</span>
                    )}
                    {canEdit&&<button onClick={()=>{setEditCol(stage);setEditVal(lbl(stage))}} className={T.muted(dark)}><PenLine size={10}/></button>}
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
                        {canEdit&&lead.telefone&&(
                          <div className={cx('flex items-center justify-between mt-2 pt-2 border-t',dark?'border-white/[0.06]':'border-slate-100')}>
                            <span className={cx('text-[10px]',T.muted(dark))}>Eli</span>
                            <button onClick={e=>toggleEli(lead,e)}
                              className={cx('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all',
                                eliPausados.has(lead.telefone)
                                  ?'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                  :'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25'
                              )}>
                              {eliPausados.has(lead.telefone)?<><X size={9}/>Pausado</>:<><Zap size={9}/>Ativo</>}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {sl.length===0&&(
                    <div className={cx('flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed',isOver?'border-sky-400/40':'border-white/[0.04]')}>
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
            <button onClick={()=>setShowNew(false)} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">{creating?'Criando...':'Criar Lead'}</button>
          </div>
        </div>
      </Modal>
      <LeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id} users={users}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LEADS TABLE
// ══════════════════════════════════════════════════════════════════
function LeadsTable({leads,setLeads,role,addToast,company,funnels,users,dark,onMenu}:any){
  const [search,setSearch]=useState('')
  const [filterStage,setFilterStage]=useState('all')
  const [sortBy,setSortBy]=useState('created_at')
  const [sortDir,setSortDir]=useState('desc')
  const [page,setPage]=useState(1)
  const [selected,setSelected]=useState<any>(null)
  const [eliPausados,setEliPausados]=useState<Set<string>>(new Set())
  const canEdit=['founder','gestor'].includes(role)
  const PER=8

  useEffect(()=>{
    sb.from('eli_bloqueados').select('telefone').eq('company_id',company.id)
      .then(({data})=>{if(data) setEliPausados(new Set(data.map((r:any)=>r.telefone)))})
  },[company.id])

  const toggleEli=async(lead:any,e:any)=>{
    e.stopPropagation()
    const tel=lead.telefone
    if(!tel){addToast('Lead sem telefone.','error');return}
    const pausado=eliPausados.has(tel)
    if(pausado){
      await sb.from('eli_bloqueados').delete().eq('company_id',company.id).eq('telefone',tel)
      setEliPausados(s=>{const n=new Set(s);n.delete(tel);return n})
      addToast('Eli retomado para '+lead.nome,'success')
    } else {
      await sb.from('eli_bloqueados').insert({company_id:company.id,telefone:tel,motivo:'Pausado manualmente'})
      setEliPausados(s=>new Set(s).add(tel))
      addToast('Eli pausado para '+lead.nome,'success')
    }
  }

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
      <Header dark={dark} onMenu={onMenu} title="Leads" subtitle={`${filtered.length} registros`} actions={
        <button onClick={exportCSV} className={cx('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs',dark?'border-white/10 text-slate-400 hover:text-white':'border-slate-300 text-slate-600 hover:text-slate-900')}><Download size={12}/>CSV</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar leads..."
              className={cx('w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-sky-500/40',T.input(dark))}/>
          </div>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            className={cx('px-3 py-2 rounded-xl border text-sm focus:outline-none',T.input(dark))}>
            <option value="all" className={T.sel(dark)}>Todas etapas</option>
            {STAGES.map(s=><option key={s} value={s} className={T.sel(dark)}>{s}</option>)}
          </select>
        </div>

        <div className={cx('hidden sm:block rounded-2xl border overflow-hidden',T.tbl(dark))}>
          <table className="w-full">
            <thead>
              <tr className={cx('border-b',T.tblH(dark))}>
                {[{k:'nome',l:'Nome'},{k:'servico',l:'Serviço'},{k:'pipeline_stage',l:'Etapa'},{k:'valor_estimado',l:'Valor'},{k:'status',l:'Status'},{k:'created_at',l:'Criado'}].map(c=>(
                  <th key={c.k} onClick={()=>ts(c.k)} className={cx('text-left px-4 py-3 text-xs font-medium cursor-pointer select-none',T.muted(dark))}>
                    <span className="flex items-center gap-1">{c.l}<Si col={c.k}/></span>
                  </th>
                ))}
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {paged.map((l:any)=>{
                const m=SM[l.pipeline_stage]||SM['Novo Lead']
                return (
                  <tr key={l.id} className={cx('border-b transition-colors',T.tblB(dark),T.row(dark))}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Av name={l.nome} size="sm"/><div><p className={cx('text-xs font-medium',T.text(dark))}>{l.nome}</p><p className={cx('text-[10px]',T.muted(dark))}>{l.telefone}</p></div></div></td>
                    <td className={cx('px-4 py-3 text-xs',T.sub(dark))}>{l.servico}</td>
                    <td className="px-4 py-3"><span className={cx('text-[10px] font-medium px-2 py-0.5 rounded-full border',m.bg,m.text,m.border)}>{l.pipeline_stage}</span></td>
                    <td className={cx('px-4 py-3 text-xs font-bold',T.text(dark))}>R${(l.valor_estimado||0).toLocaleString()}</td>
                    <td className="px-4 py-3"><Bdg v={sv[l.status]}>{l.status}</Bdg></td>
                    <td className={cx('px-4 py-3 text-[10px]',T.muted(dark))}>{l.created_at?.split('T')[0]}</td>
                    <td className="px-4 py-3"><button onClick={()=>setSelected(l)} className={cx('w-7 h-7 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-500 hover:text-white':'hover:bg-slate-100 text-slate-400 hover:text-slate-900')}><Edit2 size={13}/></button></td>
                    {canEdit&&<td className="px-4 py-3">
                      {l.telefone&&<button onClick={e=>toggleEli(l,e)}
                        className={cx('flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-all',
                          eliPausados.has(l.telefone)
                            ?'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            :'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25'
                        )}>
                        {eliPausados.has(l.telefone)?<><X size={9}/>Pausado</>:<><Zap size={9}/>Ativo</>}
                      </button>}
                    </td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paged.length===0&&<div className="py-12 text-center"><p className={cx('text-sm',T.muted(dark))}>Nenhum lead encontrado</p></div>}
        </div>

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
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className={cx('w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-30',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}><ChevronLeft size={13}/></button>
              {Array.from({length:Math.min(pages,5)},(_,i)=>(
                <button key={i} onClick={()=>setPage(i+1)} className={cx('w-8 h-8 rounded-lg text-xs font-medium',page===i+1?'bg-sky-500 text-white':dark?'text-slate-500 hover:bg-white/10':'text-slate-600 hover:bg-slate-100')}>{i+1}</button>
              ))}
              <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className={cx('w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-30',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>
      <LeadModal dark={dark} lead={selected} open={!!selected} onClose={()=>setSelected(null)}
        onSave={u=>setLeads((ls:any)=>ls.map((l:any)=>l.id===u.id?u:l))}
        onDelete={id=>setLeads((ls:any)=>ls.filter((l:any)=>l.id!==id))}
        role={role} addToast={addToast} funnels={funnels} companyId={company.id} users={users}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════
function CalendarView({company,addToast,user,leads,dark,onMenu}:any){
  const [meetings,setMeetings]=useState<any[]>([])
  const [date,setDate]=useState(new Date())
  const [showNew,setShowNew]=useState(false)
  const [sel,setSel]=useState<any>(null)
  const [delConfirm,setDelConfirm]=useState(false)
  const [form,setForm]=useState<any>({event_type:'reuniao',status:'pendente',date:'',time:'',lead_id:''})
  const [creating,setCreating]=useState(false)
  const [loading,setLoading]=useState(true)
  const [leadSearch,setLeadSearch]=useState('')
  const [showLeadDrop,setShowLeadDrop]=useState(false)

  useEffect(()=>{
    load()
    const ch=sb.channel(`realtime_meetings_${company.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'meetings',filter:`company_id=eq.${company.id}`},()=>load())
      .subscribe()
    return ()=>{ sb.removeChannel(ch) }
  },[company.id])
  const load=async()=>{
    setLoading(true)
    const {data}=await sb.from('meetings').select('*').eq('company_id',company.id).order('start_at')
    if(data) setMeetings(data);setLoading(false)
  }

  const y=date.getFullYear(),mo=date.getMonth()
  const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const fd=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate()
  const cells=[...Array(fd).fill(null),...Array.from({length:dim},(_,i)=>i+1)]
  while(cells.length%7!==0) cells.push(null)
  const weeks=Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,(i+1)*7))
  const today=new Date()
  const getMeetings=(day:number)=>{
    const ds=`${y}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return meetings.filter(mt=>mt.start_at?.startsWith(ds))
  }

  const openNew=(day?:number)=>{
    const dateStr=day
      ?`${y}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      :new Date().toISOString().split('T')[0]
    setForm({event_type:'reuniao',status:'pendente',date:dateStr,time:'09:00',lead_id:''})
    setLeadSearch('');setShowLeadDrop(false)
    setShowNew(true)
  }

  const create=async()=>{
    if(!form.title?.trim()){addToast('Título obrigatório.','error');return}
    if(!form.date){addToast('Selecione a data.','error');return}
    setCreating(true)
    const start_at=form.time?`${form.date}T${form.time}:00`:`${form.date}T09:00:00`
    const lead=form.lead_id?leads?.find((l:any)=>l.id===form.lead_id):null
    const {data,error}=await sb.from('meetings').insert({
      company_id:company.id,
      title:form.title.trim(),
      event_type:form.event_type,
      status:form.status,
      start_at,
      description:form.description||null,
      lead_id:form.lead_id||null,
      lead_name:lead?.nome||null,
      created_by:user.id
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro ao criar: '+error.message,'error');return}
    if(data) setMeetings(ms=>[...ms,data])
    setShowNew(false);addToast('Evento criado! 📅','success')
  }

  const deleteMeeting=async()=>{
    if(!sel) return
    await sb.from('meetings').delete().eq('id',sel.id)
    setMeetings(ms=>ms.filter(m=>m.id!==sel.id))
    setSel(null);setDelConfirm(false);addToast('Evento apagado.','success')
  }

  const updateStatus=async(id:string,status:string)=>{
    await sb.from('meetings').update({status,updated_at:new Date().toISOString()}).eq('id',id)
    setMeetings(ms=>ms.map(mt=>mt.id===id?{...mt,status}:mt))
    setSel((s:any)=>s?{...s,status}:s)
    addToast(status==='confirmado'?'Confirmado! ✅':'Cancelado.','success')
  }

  const TC:any={
    reuniao:dark?'bg-violet-500/20 text-violet-300 border-violet-500/30':'bg-violet-100 text-violet-700 border-violet-300',
    visita:dark?'bg-blue-500/20 text-blue-300 border-blue-500/30':'bg-blue-100 text-blue-700 border-blue-300',
    instalacao:dark?'bg-sky-500/20 text-sky-300 border-sky-500/30':'bg-sky-100 text-sky-700 border-sky-300'
  }
  const TCdot:any={reuniao:'#A78BFA',visita:'#60A5FA',instalacao:'#34D399'}
  const TL:any={reuniao:'Reunião',visita:'Visita',instalacao:'Instalação'}
  const SC:any={confirmado:dark?'text-sky-400':'text-sky-600',pendente:dark?'text-amber-400':'text-amber-600',cancelado:dark?'text-red-400':'text-red-600'}
  const SB:any={confirmado:'bg-sky-500/15 border-sky-500/30',pendente:'bg-amber-500/15 border-amber-500/30',cancelado:'bg-red-500/15 border-red-500/30'}

  const filteredLeads=(leads||[]).filter((l:any)=>
    !leadSearch||l.nome?.toLowerCase().includes(leadSearch.toLowerCase())||l.servico?.toLowerCase().includes(leadSearch.toLowerCase())
  ).slice(0,6)

  const selLead=sel?.lead_id?leads?.find((l:any)=>l.id===sel.lead_id):null
  const upcoming=[...meetings]
    .filter(m=>new Date(m.start_at)>=new Date(today.toDateString()))
    .sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime())
    .slice(0,6)

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title="Calendário" subtitle={`${meetings.length} evento${meetings.length!==1?'s':''}`} actions={
        <button onClick={()=>openNew()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold transition-all shadow-md shadow-sky-500/20">
          <Plus size={13}/>Agendar
        </button>
      }/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Calendar grid */}
        <div className={cx('rounded-2xl border overflow-hidden',T.card(dark))}>
          <div className={cx('flex items-center justify-between px-4 py-3 border-b',dark?'border-white/[0.06]':'border-slate-200')}>
            <button onClick={()=>setDate(new Date(y,mo-1))} className={cx('w-8 h-8 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronLeft size={15}/></button>
            <p className={cx('text-sm font-semibold',T.text(dark))}>{MONTHS[mo]} {y}</p>
            <button onClick={()=>setDate(new Date(y,mo+1))} className={cx('w-8 h-8 rounded-lg flex items-center justify-center',dark?'hover:bg-white/10 text-slate-400':'hover:bg-slate-100 text-slate-600')}><ChevronRight size={15}/></button>
          </div>
          <div className={cx('grid grid-cols-7 border-b',dark?'border-white/[0.05]':'border-slate-200')}>
            {DAYS.map((d,i)=><div key={i} className={cx('py-2 text-center text-[10px] font-semibold',T.muted(dark))}>{d}</div>)}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} className={cx('grid grid-cols-7 border-b last:border-0',dark?'border-white/[0.04]':'border-slate-100')}>
              {week.map((day:any,di:number)=>{
                const dm=day?getMeetings(day):[]
                const isToday=day&&today.getDate()===day&&today.getMonth()===mo&&today.getFullYear()===y
                const isPast=day&&new Date(y,mo,day)<new Date(today.toDateString())
                return (
                  <div key={di}
                    onClick={()=>day&&openNew(day)}
                    className={cx('min-h-[58px] p-1 border-r last:border-0 transition-colors',
                      dark?'border-white/[0.04]':'border-slate-100',
                      !day?'opacity-0 pointer-events-none':'cursor-pointer',
                      day&&!isPast&&(dark?'hover:bg-white/[0.03]':'hover:bg-slate-50'),
                      isPast&&(dark?'opacity-40':'opacity-50')
                    )}>
                    {day&&<>
                      <span className={cx('text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-0.5 mx-auto',
                        isToday?'bg-sky-500 text-white':T.muted(dark))}>{day}</span>
                      {dm.slice(0,2).map((mt:any)=>(
                        <button key={mt.id} onClick={e=>{e.stopPropagation();setSel(mt)}}
                          className={cx('w-full text-left text-[8px] font-semibold px-1.5 py-0.5 rounded-md border truncate mb-0.5 flex items-center gap-1',TC[mt.event_type])}>
                          <div className="w-1 h-1 rounded-full shrink-0" style={{background:TCdot[mt.event_type]}}/>
                          {mt.title}
                        </button>
                      ))}
                      {dm.length>2&&<p className={cx('text-[8px] px-1 font-medium',T.muted(dark))}>+{dm.length-2} mais</p>}
                    </>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Próximos eventos */}
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-3',T.text(dark))}>Próximos Eventos</p>
          {loading?<Sk className="h-24 rounded-xl"/>:(
            <div className="space-y-2">
              {upcoming.map(mt=>{
                const leadNm=mt.lead_name||(mt.lead_id?leads?.find((l:any)=>l.id===mt.lead_id)?.nome:null)
                return (
                  <button key={mt.id} onClick={()=>setSel(mt)} className={cx('w-full text-left p-3 rounded-xl border transition-all active:scale-95',T.card(dark))}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 self-stretch rounded-full shrink-0" style={{background:TCdot[mt.event_type]}}/>
                      <div className="flex-1 min-w-0">
                        <p className={cx('text-xs font-semibold truncate',T.text(dark))}>{mt.title}</p>
                        <p className={cx('text-[10px]',T.muted(dark))}>
                          {TL[mt.event_type]} · {mt.start_at?.replace('T',' ').slice(0,16)}
                          {leadNm&&<span className="text-sky-400"> · {leadNm}</span>}
                        </p>
                      </div>
                      <span className={cx('text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0',SC[mt.status],SB[mt.status])}>{mt.status}</span>
                    </div>
                  </button>
                )
              })}
              {upcoming.length===0&&<p className={cx('text-xs text-center py-4',T.muted(dark))}>Nenhum evento próximo 🎉</p>}
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Evento */}
      <Modal dark={dark} open={showNew} onClose={()=>setShowNew(false)} title="Agendar Evento" size="md">
        <div className="space-y-3">
          {/* Tipo — botões visuais */}
          <div>
            <label className={cx('text-xs font-medium mb-2 block',T.sub(dark))}>Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {[{v:'reuniao',l:'Reunião',color:'violet'},{v:'visita',l:'Visita',color:'blue'},{v:'instalacao',l:'Instalação',color:'sky'}].map(({v,l,color})=>(
                <button key={v} onClick={()=>setForm((f:any)=>({...f,event_type:v}))}
                  className={cx('py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95',
                    form.event_type===v
                      ?color==='violet'?'bg-violet-500/20 border-violet-500/50 text-violet-400'
                        :color==='blue'?'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        :'bg-sky-500/20 border-sky-500/50 text-sky-400'
                      :dark?'border-white/10 text-slate-500 hover:border-white/20':'border-slate-300 text-slate-500 hover:border-slate-400'
                  )}>{l}</button>
              ))}
            </div>
          </div>

          <Field dark={dark} label="Título do evento" value={form.title} onChange={(v:string)=>setForm((f:any)=>({...f,title:v}))} required placeholder="Ex: Reunião com cliente"/>

          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} label="Data" value={form.date} onChange={(v:string)=>setForm((f:any)=>({...f,date:v}))} type="date" required icon={Calendar}/>
            <Field dark={dark} label="Horário" value={form.time} onChange={(v:string)=>setForm((f:any)=>({...f,time:v}))} type="time" icon={Bell}/>
          </div>

          {/* Status — botões */}
          <div>
            <label className={cx('text-xs font-medium mb-2 block',T.sub(dark))}>Status</label>
            <div className="flex gap-2">
              {[{v:'pendente',l:'Pendente'},{v:'confirmado',l:'Confirmado'},{v:'cancelado',l:'Cancelado'}].map(({v,l})=>(
                <button key={v} onClick={()=>setForm((f:any)=>({...f,status:v}))}
                  className={cx('flex-1 py-2 rounded-xl border text-xs font-semibold transition-all',
                    form.status===v
                      ?v==='confirmado'?'bg-sky-500/20 border-sky-500/40 text-sky-400'
                        :v==='cancelado'?'bg-red-500/20 border-red-500/40 text-red-400'
                        :'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      :dark?'border-white/10 text-slate-500':'border-slate-300 text-slate-500'
                  )}>{l}</button>
              ))}
            </div>
          </div>

          {/* Vincular lead */}
          <div className="relative">
            <label className={cx('text-xs font-medium mb-1.5 block',T.sub(dark))}>Vincular lead <span className={T.muted(dark)}>(opcional)</span></label>
            {form.lead_id?(
              <div className={cx('flex items-center gap-2 px-3 py-2.5 rounded-lg border',T.input(dark))}>
                <Av name={leads?.find((l:any)=>l.id===form.lead_id)?.nome||'?'} size="xs"/>
                <span className={cx('flex-1 text-sm',T.text(dark))}>{leads?.find((l:any)=>l.id===form.lead_id)?.nome}</span>
                <button onClick={()=>setForm((f:any)=>({...f,lead_id:''}))} className="text-red-400 hover:text-red-300"><X size={13}/></button>
              </div>
            ):(
              <div className="relative">
                <Search size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
                <input value={leadSearch} onChange={e=>{setLeadSearch(e.target.value);setShowLeadDrop(true)}}
                  onFocus={()=>setShowLeadDrop(true)}
                  placeholder="Buscar lead..."
                  className={cx('w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                {showLeadDrop&&filteredLeads.length>0&&(
                  <div className={cx('absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden',T.modal(dark))}>
                    {filteredLeads.map((l:any)=>(
                      <button key={l.id} onClick={()=>{setForm((f:any)=>({...f,lead_id:l.id}));setLeadSearch('');setShowLeadDrop(false)}}
                        className={cx('w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors',dark?'hover:bg-white/5':'hover:bg-slate-50')}>
                        <Av name={l.nome} size="xs"/>
                        <div className="flex-1 min-w-0">
                          <p className={cx('text-xs font-medium truncate',T.text(dark))}>{l.nome}</p>
                          <p className={cx('text-[10px]',T.muted(dark))}>{l.servico||l.pipeline_stage}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Textarea dark={dark} label="Observação" value={form.description} onChange={(v:string)=>setForm((f:any)=>({...f,description:v}))} placeholder="Detalhes do evento..." rows={2}/>

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={()=>setShowNew(false)} className={cx('px-4 py-2.5 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating} className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-semibold disabled:opacity-60 transition-all">
              {creating?'Agendando...':'Agendar ✓'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalhes */}
      <Modal dark={dark} open={!!sel} onClose={()=>{setSel(null);setDelConfirm(false)}} title="Detalhes do Evento" size="sm">
        {sel&&(
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={cx('px-2.5 py-1 rounded-lg border text-xs font-semibold',TC[sel.event_type])}>{TL[sel.event_type]}</div>
              <span className={cx('px-2.5 py-1 rounded-lg border text-xs font-semibold',SC[sel.status],SB[sel.status])}>{sel.status}</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <p className={cx('text-base font-bold',T.text(dark))}>{sel.title}</p>
                <p className={cx('text-xs mt-0.5',T.muted(dark))}>{sel.start_at?.replace('T',' ').slice(0,16)}</p>
              </div>

              {selLead&&(
                <div className={cx('flex items-center gap-2.5 p-2.5 rounded-xl border',dark?'bg-sky-500/5 border-sky-500/20':'bg-sky-50 border-sky-200')}>
                  <Av name={selLead.nome} size="xs"/>
                  <div className="min-w-0">
                    <p className={cx('text-xs font-semibold',dark?'text-sky-300':'text-sky-700')}>{selLead.nome}</p>
                    <p className={cx('text-[10px]',T.muted(dark))}>{selLead.servico||selLead.pipeline_stage}</p>
                  </div>
                </div>
              )}

              {sel.description&&(
                <p className={cx('text-xs leading-relaxed p-3 rounded-xl border',dark?'bg-white/[0.02] border-white/[0.06] text-slate-400':'bg-slate-50 border-slate-200 text-slate-600')}>{sel.description}</p>
              )}
            </div>

            {/* Status actions */}
            {sel.status!=='confirmado'&&(
              <button onClick={()=>updateStatus(sel.id,'confirmado')}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-semibold transition-all">
                ✓ Confirmar evento
              </button>
            )}
            {sel.status!=='cancelado'&&(
              <button onClick={()=>updateStatus(sel.id,'cancelado')}
                className={cx('w-full py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95',dark?'border-slate-700 text-slate-400 hover:bg-white/5':'border-slate-300 text-slate-600 hover:bg-slate-50')}>
                Marcar como cancelado
              </button>
            )}

            {/* Delete */}
            {!delConfirm?(
              <button onClick={()=>setDelConfirm(true)}
                className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Trash2 size={13}/>Apagar evento
              </button>
            ):(
              <div className={cx('p-3 rounded-xl border',dark?'border-red-500/20 bg-red-500/5':'border-red-200 bg-red-50')}>
                <p className={cx('text-xs mb-3 text-center',dark?'text-red-300':'text-red-600')}>Tem certeza? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-2">
                  <button onClick={()=>setDelConfirm(false)} className={cx('flex-1 py-2 rounded-lg border text-xs',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}>Cancelar</button>
                  <button onClick={deleteMeeting} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold active:scale-95 transition-all">Apagar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// COLABORADORES
// ══════════════════════════════════════════════════════════════════
function Colaboradores({company,user,addToast,dark,onMenu}:any){
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
    // Buscar founders da Flüxa para excluí-los da lista (são superadmins invisíveis)
    const {data:fluxaCo}=await sb.from('companies').select('id').eq('company_slug','fluxa').single()
    const fluxaFounderIds:string[]=[]
    if(fluxaCo){
      const {data:fluxaUsers}=await sb.from('users').select('id').eq('company_id',fluxaCo.id).eq('role','founder')
      if(fluxaUsers) fluxaUsers.forEach((u:any)=>fluxaFounderIds.push(u.id))
    }
    const {data}=await sb.from('users').select('*').eq('company_id',company.id).eq('active',true).order('created_at')
    // Filtrar superadmins: remover founders da Flüxa que não pertencem de fato a esta empresa
    if(data) setColabs(data.filter((u:any)=>!fluxaFounderIds.includes(u.id)||u.company_id===company.id))
    setLoading(false)
  }

  const create=async()=>{
    if(!form.full_name?.trim()||!form.username?.trim()||!form.password_hash?.trim()){addToast('Nome, usuário e senha são obrigatórios.','error');return}
    setCreating(true)
    const senhaHash=await bcrypt.hash(form.password_hash,10)
    const {data,error}=await sb.from('users').insert({
      company_id:company.id,full_name:form.full_name.trim(),
      display_name:form.display_name?.trim()||form.full_name.trim(),
      email:form.email?.trim()||null,username:form.username.trim().toLowerCase(),
      password_hash:senhaHash,role:form.role||'colaborador',active:true,
    }).select().single()
    setCreating(false)
    if(error){addToast('Erro: '+error.message,'error');return}
    setColabs(c=>[...c,data]);setForm({role:'colaborador'});setShowNew(false);addToast('Colaborador cadastrado!','success')
  }

  const updateRole=async()=>{
    if(!editRole) return
    if(user.role==='gestor'&&editRole.originalRole==='founder'){addToast('Sem permissão.','error');return}
    const {error}=await sb.from('users').update({role:editRole.role,updated_at:new Date().toISOString()}).eq('id',editRole.id)
    if(error){addToast('Erro ao atualizar.','error');return}
    setColabs(cs=>cs.map(c=>c.id===editRole.id?{...c,role:editRole.role}:c));setEditRole(null);addToast('Cargo atualizado!','success')
  }

  const remove=async()=>{
    if(!delConfirm) return
    if(user.role==='gestor'&&delConfirm.role==='founder'){addToast('Sem permissão.','error');setDelConfirm(null);return}
    const {error}=await sb.from('users').update({active:false,updated_at:new Date().toISOString()}).eq('id',delConfirm.id)
    if(error){addToast('Erro ao remover.','error');return}
    setColabs(cs=>cs.filter(c=>c.id!==delConfirm.id));setDelConfirm(null);addToast('Removido.','success')
  }

  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RV:any={founder:'violet',gestor:'info',colaborador:'default'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title="Colaboradores" subtitle={`${colabs.length} membros`} actions={
        canManage&&<button onClick={()=>setShowNew(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold transition-all"><UserPlus size={13}/>Cadastrar</button>
      }/>
      <div className="flex-1 overflow-y-auto p-4">
        {loading
          ?<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3].map(i=><Sk key={i} className="h-24 rounded-2xl"/>)}</div>
          :<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colabs.map(c=>{
              const isMe=c.id===user.id
              const canEditThis=canManage&&!isMe&&!(user.role==='gestor'&&c.role==='founder')
              return (
                <div key={c.id} className={cx('p-4 rounded-2xl border',T.card(dark))}>
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Av name={c.display_name||c.full_name} size="lg" url={c.avatar_url}/>
                      {isMe&&<div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border border-slate-900 flex items-center justify-center"><User size={8} className="text-white"/></div>}
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
            <button onClick={()=>{setShowNew(false);setForm({role:'colaborador'})}} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}>Cancelar</button>
            <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">{creating?'Cadastrando...':'Cadastrar'}</button>
          </div>
        </div>
      </Modal>
      <Modal dark={dark} open={!!editRole} onClose={()=>setEditRole(null)} title={`Cargo — ${editRole?.full_name}`} size="sm">
        {editRole&&<div className="space-y-4">
          <Sel dark={dark} label="Novo cargo" value={editRole.role} onChange={(v:string)=>setEditRole((e:any)=>({...e,role:v}))} options={[{value:'colaborador',label:'Colaborador'},{value:'gestor',label:'Gestor'},...(user.role==='founder'?[{value:'founder',label:'Founder'}]:[])]}/>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setEditRole(null)} className={cx('px-4 py-2 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-300 text-slate-600')}>Cancelar</button>
            <button onClick={updateRole} className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium active:scale-95 transition-all">Salvar</button>
          </div>
        </div>}
      </Modal>
      <Confirm dark={dark} open={!!delConfirm} onClose={()=>setDelConfirm(null)} onOk={remove} title="Remover Colaborador" msg={`Remover "${delConfirm?.full_name}"?`}/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SETTINGS — com troca de senha
// ══════════════════════════════════════════════════════════════════
function SettingsPage({user,company,dark,setDark,onLogout,addToast,setUser,setCompany,onMenu}:any){
  const [uForm,setUForm]=useState({display_name:user.display_name||'',email:user.email||''})
  const [cForm,setCForm]=useState({company_name:company.company_name||''})
  const [pwForm,setPwForm]=useState({current:'',novo:'',confirm:''})
  const [saving,setSaving]=useState(false)
  const [savingC,setSavingC]=useState(false)
  const [savingPw,setSavingPw]=useState(false)
  const [upAvatar,setUpAvatar]=useState(false)
  const [upLogo,setUpLogo]=useState(false)
  const [showPw,setShowPw]=useState({c:false,n:false,cf:false})
  const [settingsTab,setSettingsTab]=useState<'perfil'|'eli'|'fornecedores'>('perfil')
  const canEditCompany=['founder','gestor'].includes(user.role)
  const RL:any={founder:'Founder',gestor:'Gestor',colaborador:'Colaborador'}
  const RC:any={founder:'bg-amber-500/15 text-amber-500 border-amber-500/30',gestor:'bg-violet-500/15 text-violet-500 border-violet-500/30',colaborador:'bg-blue-500/15 text-blue-500 border-blue-500/30'}

  // Eli config state
  const [eliForm,setEliForm]=useState({
    eli_apresentacao:'',eli_servicos:'',eli_faq:'',
    eli_pagamento:'',eli_prazo:'',eli_area_atendimento:'',eli_observacoes:''
  })
  const [eliLoaded,setEliLoaded]=useState(false)
  const [savingEli,setSavingEli]=useState(false)

  // Fornecedores state
  const [fornecedores,setFornecedores]=useState<any[]>([])
  const [fornLoaded,setFornLoaded]=useState(false)
  const [showFornModal,setShowFornModal]=useState(false)
  const [editForn,setEditForn]=useState<any>(null)
  const [fornForm,setFornForm]=useState({nome:'',contato:'',telefone:'',email:'',servicos:'',observacoes:''})
  const [savingForn,setSavingForn]=useState(false)
  const [importingForn,setImportingForn]=useState(false)

  useEffect(()=>{
    if(settingsTab==='eli'&&!eliLoaded) loadEli()
    if(settingsTab==='fornecedores'&&!fornLoaded) loadFornecedores()
  },[settingsTab])

  const loadEli=async()=>{
    const {data}=await sb.from('companies').select('eli_apresentacao,eli_servicos,eli_faq,eli_pagamento,eli_prazo,eli_area_atendimento,eli_observacoes').eq('id',company.id).single()
    if(data) setEliForm({
      eli_apresentacao:data.eli_apresentacao||'',
      eli_servicos:data.eli_servicos||'',
      eli_faq:data.eli_faq||'',
      eli_pagamento:data.eli_pagamento||'',
      eli_prazo:data.eli_prazo||'',
      eli_area_atendimento:data.eli_area_atendimento||'',
      eli_observacoes:data.eli_observacoes||''
    })
    setEliLoaded(true)
  }

  const saveEli=async()=>{
    setSavingEli(true)
    const {error}=await sb.from('companies').update({...eliForm,updated_at:new Date().toISOString()}).eq('id',company.id)
    setSavingEli(false)
    if(error){addToast('Erro ao salvar: '+error.message,'error');return}
    addToast('Configurações do Eli salvas!','success')
  }

  const loadFornecedores=async()=>{
    const {data}=await sb.from('fornecedores').select('*').eq('company_id',company.id).order('created_at',{ascending:false})
    if(data) setFornecedores(data)
    setFornLoaded(true)
  }

  const openNewForn=()=>{
    setEditForn(null)
    setFornForm({nome:'',contato:'',telefone:'',email:'',servicos:'',observacoes:''})
    setShowFornModal(true)
  }

  const openEditForn=(f:any)=>{
    setEditForn(f)
    setFornForm({nome:f.nome||'',contato:f.contato||'',telefone:f.telefone||'',email:f.email||'',servicos:f.servicos||'',observacoes:f.observacoes||''})
    setShowFornModal(true)
  }

  const saveForn=async()=>{
    if(!fornForm.nome.trim()){addToast('Nome obrigatório.','error');return}
    setSavingForn(true)
    if(editForn){
      const {error}=await sb.from('fornecedores').update({...fornForm,updated_at:new Date().toISOString()}).eq('id',editForn.id)
      if(error){addToast('Erro: '+error.message,'error')}
      else{addToast('Fornecedor atualizado!','success');setShowFornModal(false);loadFornecedores()}
    } else {
      const {error}=await sb.from('fornecedores').insert({...fornForm,company_id:company.id,created_at:new Date().toISOString(),updated_at:new Date().toISOString()})
      if(error){addToast('Erro: '+error.message,'error')}
      else{addToast('Fornecedor adicionado!','success');setShowFornModal(false);loadFornecedores()}
    }
    setSavingForn(false)
  }

  const deleteForn=async(id:string)=>{
    const {error}=await sb.from('fornecedores').delete().eq('id',id)
    if(error){addToast('Erro ao apagar.','error');return}
    addToast('Fornecedor removido.','success')
    setFornecedores(f=>f.filter(x=>x.id!==id))
  }

  const importFornCSV=async(e:any)=>{
    const file=e.target.files?.[0];if(!file) return
    setImportingForn(true)
    const text=await file.text()
    const lines=text.split('\n').filter(Boolean)
    const headers=lines[0].split(',').map((h:string)=>h.trim().toLowerCase())
    let count=0
    for(let i=1;i<lines.length;i++){
      const vals=lines[i].split(',').map((v:string)=>v.trim().replace(/^"|"$/g,''))
      const row:any={company_id:company.id,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}
      headers.forEach((h:string,idx:number)=>{if(vals[idx]) row[h]=vals[idx]})
      if(row.nome){
        await sb.from('fornecedores').insert(row)
        count++
      }
    }
    setImportingForn(false)
    addToast(`${count} fornecedores importados!`,'success')
    loadFornecedores()
    e.target.value=''
  }

  const saveUser=async()=>{
    const dn=uForm.display_name.trim()
    if(!dn){addToast('Nome obrigatório.','error');return}
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

  const changePassword=async()=>{
    if(!pwForm.current||!pwForm.novo||!pwForm.confirm){addToast('Preencha todos os campos.','error');return}
    if(pwForm.novo!==pwForm.confirm){addToast('Nova senha e confirmação não coincidem.','error');return}
    if(pwForm.novo.length<4){addToast('Senha muito curta (mínimo 4 caracteres).','error');return}
    // Verificar senha atual
    const {data:userCheck}=await sb.from('users').select('password_hash').eq('id',user.id).single()
    if(!userCheck){addToast('Erro ao verificar senha.','error');return}
    const senhaAtualOk=userCheck.password_hash?.startsWith('$2')
      ?await bcrypt.compare(pwForm.current,userCheck.password_hash)
      :userCheck.password_hash===pwForm.current
    if(!senhaAtualOk){addToast('Senha atual incorreta.','error');return}
    setSavingPw(true)
    const novaHash=await bcrypt.hash(pwForm.novo,10)
    const {error}=await sb.from('users').update({password_hash:novaHash,updated_at:new Date().toISOString()}).eq('id',user.id)
    setSavingPw(false)
    if(error){addToast('Erro ao alterar senha.','error');return}
    setPwForm({current:'',novo:'',confirm:''});addToast('Senha alterada com sucesso!','success')
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

  const deleteLogo=async()=>{
    await sb.from('companies').update({company_logo_url:null}).eq('id',company.id)
    setCompany((c:any)=>({...c,company_logo_url:null}));addToast('Logo removida.','success')
  }

  const cardCls=cx('p-4 rounded-2xl border',T.card(dark))

  const EliField=({label,field,placeholder,rows=3}:any)=>(
    <div className="flex flex-col gap-1.5">
      <label className={cx('text-xs font-medium',T.sub(dark))}>{label}</label>
      <textarea rows={rows} value={eliForm[field as keyof typeof eliForm]}
        onChange={e=>setEliForm(f=>({...f,[field]:e.target.value}))}
        placeholder={placeholder}
        className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 resize-none',T.input(dark))}/>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} onMenu={onMenu} title="Configurações"/>
      <div className="p-4 max-w-lg">
        {/* Abas */}
        <div className={cx('flex gap-1 p-1 rounded-xl mb-4 border',T.card(dark))}>
          {[{id:'perfil',label:'Perfil & Conta'}].map((t:any)=>(
            <button key={t.id} onClick={()=>setSettingsTab(t.id)}
              className={cx('flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
                settingsTab===t.id
                  ?(dark?'bg-sky-500/20 text-sky-400':'bg-sky-100 text-sky-700')
                  :(dark?'text-slate-500 hover:text-slate-300':'text-slate-500 hover:text-slate-700')
              )}>{t.label}</button>
          ))}
        </div>

        {/* ── ABA PERFIL ── */}
        {settingsTab==='perfil'&&<div className="space-y-4">
        {/* Perfil */}
        <div className={cardCls}>
          <p className={cx('text-xs font-semibold mb-4',T.text(dark))}>Meu Perfil</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Av name={user.display_name||user.full_name} size="xl" url={user.avatar_url}/>
              <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center cursor-pointer shadow-md',upAvatar&&'opacity-50')}>
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
            className="mt-4 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">
            {saving?'Salvando...':'Salvar perfil'}
          </button>
        </div>

        {/* Alterar Senha */}
        <div className={cardCls}>
          <p className={cx('text-xs font-semibold mb-4 flex items-center gap-2',T.text(dark))}><Lock size={13}/>Alterar Senha</p>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className={cx('text-xs font-medium',T.sub(dark))}>Senha atual</label>
              <div className="relative">
                <Lock size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
                <input type={showPw.c?'text':'password'} value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}
                  className={cx('w-full pl-9 pr-9 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                <button type="button" onClick={()=>setShowPw(s=>({...s,c:!s.c}))} className={cx('absolute right-3 top-1/2 -translate-y-1/2',T.muted(dark))}>{showPw.c?<EyeOff size={13}/>:<Eye size={13}/>}</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={cx('text-xs font-medium',T.sub(dark))}>Nova senha</label>
              <div className="relative">
                <Lock size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
                <input type={showPw.n?'text':'password'} value={pwForm.novo} onChange={e=>setPwForm(f=>({...f,novo:e.target.value}))}
                  className={cx('w-full pl-9 pr-9 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                <button type="button" onClick={()=>setShowPw(s=>({...s,n:!s.n}))} className={cx('absolute right-3 top-1/2 -translate-y-1/2',T.muted(dark))}>{showPw.n?<EyeOff size={13}/>:<Eye size={13}/>}</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={cx('text-xs font-medium',T.sub(dark))}>Confirmar nova senha</label>
              <div className="relative">
                <Lock size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
                <input type={showPw.cf?'text':'password'} value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}
                  className={cx('w-full pl-9 pr-9 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                <button type="button" onClick={()=>setShowPw(s=>({...s,cf:!s.cf}))} className={cx('absolute right-3 top-1/2 -translate-y-1/2',T.muted(dark))}>{showPw.cf?<EyeOff size={13}/>:<Eye size={13}/>}</button>
              </div>
            </div>
          </div>
          <button onClick={changePassword} disabled={savingPw}
            className="mt-4 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">
            {savingPw?'Alterando...':'Alterar senha'}
          </button>
        </div>

        {/* Empresa */}
        {canEditCompany&&(
          <div className={cardCls}>
            <p className={cx('text-xs font-semibold mb-4',T.text(dark))}>Empresa</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {company.company_logo_url
                  ?<img src={company.company_logo_url} className={cx('w-14 h-14 rounded-xl object-contain p-1 border',dark?'bg-white/5 border-white/10':'bg-slate-50 border-slate-300')} alt="logo"/>
                  :<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center"><Zap size={22} className="text-white"/></div>
                }
                <label className={cx('absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center cursor-pointer shadow-md',upLogo&&'opacity-50')}>
                  {upLogo?<RefreshCw size={10} className="text-white animate-spin"/>:<Upload size={10} className="text-white"/>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} disabled={upLogo}/>
                </label>
              </div>
              <div>
                <p className={cx('text-sm font-semibold',T.text(dark))}>{company.company_name}</p>
                <p className={cx('text-xs font-mono',T.muted(dark))}>@{company.company_slug}</p>
                {company.company_logo_url&&(
                  <button onClick={deleteLogo} className="mt-1 text-xs text-red-400 hover:text-red-500 underline">Remover logo</button>
                )}
              </div>
            </div>
            <Field dark={dark} label="Nome da empresa" value={cForm.company_name} onChange={(v:string)=>setCForm(f=>({...f,company_name:v}))} icon={Building2}/>
            <button onClick={saveCompany} disabled={savingC}
              className="mt-3 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 transition-all">
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
              className={cx('relative w-12 h-6 rounded-full transition-colors duration-300',dark?'bg-sky-500':'bg-slate-300')}>
              <div className={cx('absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',dark?'left-7':'left-1')}/>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className={cx('p-4 rounded-2xl border',dark?'border-red-500/10 bg-red-500/[0.02]':'border-red-200 bg-red-50')}>
          <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm transition-all w-full active:scale-95">
            <LogOut size={14}/>Sair da conta
          </button>
        </div>
        </div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ELI CONFIG PAGE
// ══════════════════════════════════════════════════════════════════
function EliConfigPage({company,user,dark,addToast,onMenu}:any){
  const canEdit=['founder','gestor'].includes(user.role)
  const [form,setForm]=useState({
    eli_apresentacao:'',eli_servicos:'',eli_faq:'',
    eli_pagamento:'',eli_prazo:'',eli_area_atendimento:'',eli_observacoes:''
  })
  const [loaded,setLoaded]=useState(false)
  const [saving,setSaving]=useState(false)
  const [activeField,setActiveField]=useState<string|null>(null)
  const [numeroGestor,setNumeroGestor]=useState('')
  const [savingNumero,setSavingNumero]=useState(false)

  useEffect(()=>{
    sb.from('companies')
      .select('eli_apresentacao,eli_servicos,eli_faq,eli_pagamento,eli_prazo,eli_area_atendimento,eli_observacoes')
      .eq('id',company.id).single()
      .then(({data})=>{
        if(data) setForm({
          eli_apresentacao:data.eli_apresentacao||'',
          eli_servicos:data.eli_servicos||'',
          eli_faq:data.eli_faq||'',
          eli_pagamento:data.eli_pagamento||'',
          eli_prazo:data.eli_prazo||'',
          eli_area_atendimento:data.eli_area_atendimento||'',
          eli_observacoes:data.eli_observacoes||''
        })
        setLoaded(true)
      })
    sb.from('fluxa_empresas_config').select('numero_gestor').eq('company_id',company.id).single()
      .then(({data})=>{
        if(data?.numero_gestor) setNumeroGestor(data.numero_gestor)
      })
  },[company.id])

  const save=async()=>{
    setSaving(true)
    const {error}=await sb.from('companies').update({...form,updated_at:new Date().toISOString()}).eq('id',company.id)
    setSaving(false)
    if(error){addToast('Erro ao salvar: '+error.message,'error');return}
    addToast('Configurações do Eli salvas!','success')
  }

  const saveNumero=async()=>{
    setSavingNumero(true)
    await sb.from('fluxa_empresas_config').update({
      numero_gestor:numeroGestor.trim()
    }).eq('company_id',company.id)
    setSavingNumero(false)
    addToast('WhatsApp do gestor salvo!','success')
  }

  const fields=[
    {key:'eli_apresentacao',label:'Apresentação',icon:'🏢',rows:4},
    {key:'eli_servicos',label:'Serviços',icon:'🔧',rows:6},
    {key:'eli_pagamento',label:'Pagamento',icon:'💳',rows:4},
    {key:'eli_prazo',label:'Prazo',icon:'⏱️',rows:3},
    {key:'eli_area_atendimento',label:'Área de Atendimento',icon:'📍',rows:3},
    {key:'eli_faq',label:'FAQ',icon:'❓',rows:6},
    {key:'eli_observacoes',label:'Observações',icon:'📝',rows:4},
  ]

  const filledCount=fields.filter(f=>form[f.key as keyof typeof form]?.trim()).length
  const numGestorFilled=!!numeroGestor.trim()
  const pct=Math.round(((filledCount+(numGestorFilled?1:0))/(fields.length+1))*100)

  return (
    <div className="flex-1 overflow-y-auto">
      <Header dark={dark} onMenu={onMenu} title="Configurar Eli"/>
      <div className="p-4 space-y-4">

        {/* Header */}
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cx('w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0',dark?'bg-sky-500/15':'bg-sky-100')}>🤖</div>
            <div className="flex-1">
              <p className={cx('text-sm font-bold',T.text(dark))}>Base de conhecimento do Eli</p>
              <p className={cx('text-xs',T.muted(dark))}>Quanto mais completo, melhor o Eli atende no WhatsApp</p>
            </div>
            <p className={cx('text-3xl font-black shrink-0',pct===100?'text-sky-400':dark?'text-[#f1f1f1]':'text-slate-900')}>{pct}%</p>
          </div>
          <div className={cx('h-1.5 rounded-full overflow-hidden',dark?'bg-white/5':'bg-slate-100')}>
            <div className="h-1.5 bg-sky-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
          </div>
        </div>

        {/* Grid de quadradinhos */}
        {!loaded?(
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i=><Sk key={i} className="h-28"/>)}
          </div>
        ):(
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {fields.map(f=>{
                const val=form[f.key as keyof typeof form]
                const isFilled=!!val?.trim()
                const isActive=activeField===f.key
                return (
                  <div key={f.key} className={cx('rounded-2xl border overflow-hidden transition-colors duration-200',
                    isActive
                      ?(dark?'border-sky-500/50 bg-sky-500/[0.05]':'border-sky-400 bg-sky-50/50')
                      :T.card(dark)
                  )}>
                    {/* Header clicável */}
                    <button className="w-full p-4 text-left" onClick={()=>setActiveField(isActive?null:f.key)}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{f.icon}</span>
                        {isFilled
                          ?<CheckCircle size={16} className="text-sky-400 shrink-0"/>
                          :<X size={16} className={cx('shrink-0',dark?'text-slate-600':'text-slate-300')}/>
                        }
                      </div>
                      <p className={cx('text-sm font-semibold',T.text(dark))}>{f.label}</p>
                    </button>
                    {/* Textarea expandida — sem mudar tamanho do card no grid */}
                    {isActive&&(
                      <div className="px-4 pb-4">
                        <textarea
                          rows={f.rows}
                          autoFocus
                          disabled={!canEdit}
                          value={val}
                          onChange={e=>setForm(fm=>({...fm,[f.key]:e.target.value}))}
                          className={cx('w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-500/50 resize-none',T.input(dark),!canEdit&&'opacity-60 cursor-not-allowed')}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Quadradinho número do gestor — dentro do grid */}
              {canEdit&&(()=>{
                const isActive=activeField==='numero_gestor'
                const isFilled=!!numeroGestor.trim()
                return (
                  <div className={cx('rounded-2xl border overflow-hidden transition-colors duration-200',
                    isActive
                      ?(dark?'border-sky-500/40 bg-sky-500/[0.04]':'border-sky-300 bg-sky-50/40')
                      :T.card(dark)
                  )}>
                    <button className="w-full p-4 text-left" onClick={()=>setActiveField(isActive?null:'numero_gestor')}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">📲</span>
                        {isFilled
                          ?<CheckCircle size={16} className="text-sky-400 shrink-0"/>
                          :<X size={16} className={cx('shrink-0',dark?'text-slate-600':'text-slate-300')}/>
                        }
                      </div>
                      <p className={cx('text-sm font-semibold',T.text(dark))}>WhatsApp Gestor</p>
                    </button>
                    {isActive&&(
                      <div className="px-4 pb-4 space-y-2">
                        <p className={cx('text-xs',T.muted(dark))}>Número do gestor que receberá notificações. Formato: <span className="font-mono">5547999999999</span></p>
                        <input type="tel" autoFocus disabled={!canEdit} value={numeroGestor}
                          onChange={e=>setNumeroGestor(e.target.value)} placeholder="5547999999999"
                          className={cx('w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                        <button onClick={saveNumero} disabled={savingNumero}
                          className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold disabled:opacity-60 transition-all active:scale-95">
                          {savingNumero?'Salvando...':'Salvar'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {canEdit&&(
              <button onClick={save} disabled={saving}
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2">
                {saving?<><RefreshCw size={14} className="animate-spin"/>Salvando...</>:<>💾 Salvar configurações do Eli</>}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FornecedoresPage({company,user,dark,addToast,onMenu}:any){
  const canEdit=['founder','gestor'].includes(user.role)
  const [fornecedores,setFornecedores]=useState<any[]>([])
  const [loaded,setLoaded]=useState(false)
  const [search,setSearch]=useState('')
  const [selForn,setSelForn]=useState<any>(null)
  const [produtos,setProdutos]=useState<any[]>([])
  const [prodLoaded,setProdLoaded]=useState(false)
  const [showFornModal,setShowFornModal]=useState(false)
  const [showProdModal,setShowProdModal]=useState(false)
  const [editForn,setEditForn]=useState<any>(null)
  const [editProd,setEditProd]=useState<any>(null)
  const [fornForm,setFornForm]=useState({nome:'',contato:'',telefone:'',email:'',observacoes:''})
  const [prodForm,setProdForm]=useState({servico:'',tipo_vidro:'',espessura:'',unidade:'m²',custo:'',margem:'30',observacoes:''})
  const [savingForn,setSavingForn]=useState(false)
  const [savingProd,setSavingProd]=useState(false)
  const [importing,setImporting]=useState(false)

  const SERVICOS=['Box','Espelho','Janela','Guarda-corpo','Porta','Vidro Comum','Vidro Temperado','Vidro Laminado','Perfil Alumínio','Acessório','Outro']
  const TIPOS=['Incolor','Fumê','Refletemp','Laminado','Aramado','Comum','Temperado','N/A']
  const ESPESSURAS=['3mm','4mm','5mm','6mm','8mm','10mm','12mm','N/A']

  const loadForn=async()=>{
    const {data}=await sb.from('fornecedores').select('*').eq('company_id',company.id).order('nome')
    if(data) setFornecedores(data)
    setLoaded(true)
  }

  const loadProd=async(fornId:string)=>{
    setProdLoaded(false)
    const {data}=await sb.from('fornecedor_produtos').select('*').eq('fornecedor_id',fornId).order('servico')
    if(data) setProdutos(data)
    setProdLoaded(true)
  }

  useEffect(()=>{loadForn()},[company.id])

  const selectForn=(f:any)=>{
    setSelForn(f)
    loadProd(f.id)
  }

  // Fornecedor CRUD
  const openNewForn=()=>{
    setEditForn(null)
    setFornForm({nome:'',contato:'',telefone:'',email:'',observacoes:''})
    setShowFornModal(true)
  }
  const openEditForn=(f:any,e:any)=>{
    e.stopPropagation()
    setEditForn(f)
    setFornForm({nome:f.nome||'',contato:f.contato||'',telefone:f.telefone||'',email:f.email||'',observacoes:f.observacoes||''})
    setShowFornModal(true)
  }
  const saveForn=async()=>{
    if(!fornForm.nome.trim()){addToast('Nome obrigatório.','error');return}
    setSavingForn(true)
    if(editForn){
      await sb.from('fornecedores').update({...fornForm,updated_at:new Date().toISOString()}).eq('id',editForn.id)
      addToast('Fornecedor atualizado!','success')
    } else {
      await sb.from('fornecedores').insert({...fornForm,company_id:company.id,created_at:new Date().toISOString(),updated_at:new Date().toISOString()})
      addToast('Fornecedor adicionado!','success')
    }
    setSavingForn(false)
    setShowFornModal(false)
    loadForn()
  }
  const delForn=async(id:string,e:any)=>{
    e.stopPropagation()
    await sb.from('fornecedores').delete().eq('id',id)
    addToast('Fornecedor removido.','success')
    if(selForn?.id===id) setSelForn(null)
    setFornecedores(f=>f.filter(x=>x.id!==id))
  }

  // Produto CRUD
  const openNewProd=()=>{
    setEditProd(null)
    setProdForm({servico:'',tipo_vidro:'',espessura:'',unidade:'m²',custo:'',margem:'30',observacoes:''})
    setShowProdModal(true)
  }
  const openEditProd=(p:any)=>{
    setEditProd(p)
    setProdForm({servico:p.servico||'',tipo_vidro:p.tipo_vidro||'',espessura:p.espessura||'',unidade:p.unidade||'m²',custo:String(p.custo||''),margem:String(p.margem||'30'),observacoes:p.observacoes||''})
    setShowProdModal(true)
  }
  const saveProd=async()=>{
    if(!prodForm.servico.trim()){addToast('Serviço obrigatório.','error');return}
    if(!prodForm.custo||isNaN(Number(prodForm.custo))){addToast('Custo inválido.','error');return}
    setSavingProd(true)
    const payload={
      servico:prodForm.servico,tipo_vidro:prodForm.tipo_vidro,espessura:prodForm.espessura,
      unidade:prodForm.unidade,custo:Number(prodForm.custo),margem:Number(prodForm.margem),
      observacoes:prodForm.observacoes,updated_at:new Date().toISOString()
    }
    if(editProd){
      await sb.from('fornecedor_produtos').update(payload).eq('id',editProd.id)
      addToast('Produto atualizado!','success')
    } else {
      await sb.from('fornecedor_produtos').insert({...payload,fornecedor_id:selForn.id,company_id:company.id,created_at:new Date().toISOString()})
      addToast('Produto adicionado!','success')
    }
    setSavingProd(false)
    setShowProdModal(false)
    loadProd(selForn.id)
  }
  const delProd=async(id:string)=>{
    await sb.from('fornecedor_produtos').delete().eq('id',id)
    addToast('Produto removido.','success')
    setProdutos(p=>p.filter(x=>x.id!==id))
  }

  const importCSV=async(e:any)=>{
    const file=e.target.files?.[0];if(!file||!selForn) return
    setImporting(true)
    const text=await file.text()
    const lines=text.split('\n').filter(Boolean)
    const headers=lines[0].split(',').map((h:string)=>h.trim().toLowerCase())
    let count=0
    for(let i=1;i<lines.length;i++){
      const vals=lines[i].split(',').map((v:string)=>v.trim().replace(/^"|"$/g,''))
      const row:any={fornecedor_id:selForn.id,company_id:company.id,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),margem:30}
      headers.forEach((h:string,idx:number)=>{if(vals[idx]) row[h]=vals[idx]})
      if(row.servico&&row.custo){
        await sb.from('fornecedor_produtos').insert({...row,custo:Number(row.custo),margem:Number(row.margem||30)})
        count++
      }
    }
    setImporting(false)
    addToast(`${count} produtos importados!`,'success')
    loadProd(selForn.id)
    e.target.value=''
  }

  const valorVenda=(custo:number,margem:number)=>custo*(1+margem/100)
  const fmt=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

  const filtered=fornecedores.filter(f=>!search||(f.nome||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title={selForn?selForn.nome:'Fornecedores'} subtitle={selForn?`${produtos.length} produto(s) cadastrado(s)`:undefined}/>

      {!selForn?(
        // ── Lista de fornecedores ──
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className={cx('absolute left-3 top-1/2 -translate-y-1/2',T.muted(dark))}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar fornecedor..."
                className={cx('w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
            </div>
            {canEdit&&<button onClick={openNewForn} className="flex items-center gap-1.5 px-3 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/20 shrink-0">
              <Plus size={12}/>Novo
            </button>}
          </div>

          {!loaded?(
            <div className="space-y-2">{[1,2,3].map(i=><Sk key={i} className="h-20"/>)}</div>
          ):filtered.length===0?(
            <div className={cx('flex flex-col items-center justify-center py-16 rounded-2xl border',T.card(dark))}>
              <p className="text-4xl mb-3">📦</p>
              <p className={cx('text-sm font-semibold',T.text(dark))}>{search?'Nenhum resultado':'Nenhum fornecedor'}</p>
              <p className={cx('text-xs mt-1',T.muted(dark))}>Adicione fornecedores para cadastrar seus preços</p>
            </div>
          ):(
            <div className="space-y-2">
              {filtered.map((f:any)=>(
                <button key={f.id} onClick={()=>selectForn(f)} className={cx('w-full p-4 rounded-2xl border text-left transition-all hover:border-sky-500/40',T.card(dark))}>
                  <div className="flex items-center gap-3">
                    <div className={cx('w-11 h-11 rounded-xl flex items-center justify-center text-base font-black shrink-0',dark?'bg-sky-500/15 text-sky-400':'bg-sky-100 text-sky-700')}>
                      {(f.nome||'?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cx('text-sm font-bold',T.text(dark))}>{f.nome}</p>
                      <div className="flex gap-3 mt-0.5">
                        {f.telefone&&<span className={cx('text-xs flex items-center gap-1',T.muted(dark))}><Phone size={10}/>{f.telefone}</span>}
                        {f.email&&<span className={cx('text-xs flex items-center gap-1',T.muted(dark))}><Mail size={10}/>{f.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit&&<>
                        <button onClick={e=>openEditForn(f,e)} className={cx('p-1.5 rounded-lg',dark?'text-slate-500 hover:text-white hover:bg-white/5':'text-slate-400 hover:text-slate-700 hover:bg-slate-100')}><Edit2 size={12}/></button>
                        <button onClick={e=>delForn(f.id,e)} className="p-1.5 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={12}/></button>
                      </>}
                      <ChevronRight size={14} className={T.muted(dark)}/>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ):(
        // ── Tabela de produtos do fornecedor ──
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Voltar */}
          <button onClick={()=>setSelForn(null)} className={cx('flex items-center gap-1.5 text-xs font-medium',dark?'text-slate-400 hover:text-white':'text-slate-500 hover:text-slate-900')}>
            <ChevronLeft size={14}/>Voltar para fornecedores
          </button>

          {/* Info do fornecedor */}
          <div className={cx('p-3 rounded-xl border flex items-center gap-3',T.card(dark))}>
            <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0',dark?'bg-sky-500/15 text-sky-400':'bg-sky-100 text-sky-700')}>
              {(selForn.nome||'?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cx('text-sm font-bold',T.text(dark))}>{selForn.nome}</p>
              {selForn.contato&&<p className={cx('text-xs',T.muted(dark))}>{selForn.contato}</p>}
            </div>
            {canEdit&&<div className="flex gap-2 shrink-0">
              <label className={cx('flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all',dark?'border-white/10 text-slate-400 hover:text-white':'border-slate-200 text-slate-500 hover:text-slate-700',importing&&'opacity-50')}>
                {importing?<RefreshCw size={11} className="animate-spin"/>:<Upload size={11}/>}CSV
                <input type="file" accept=".csv" className="hidden" onChange={importCSV} disabled={importing}/>
              </label>
              <button onClick={openNewProd} className="flex items-center gap-1.5 px-2.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-sky-500/20">
                <Plus size={11}/>Produto
              </button>
            </div>}
          </div>

          {/* Tabela de produtos */}
          {!prodLoaded?(
            <div className="space-y-1">{[1,2,3,4].map(i=><Sk key={i} className="h-10"/>)}</div>
          ):produtos.length===0?(
            <div className={cx('flex flex-col items-center justify-center py-12 rounded-2xl border',T.card(dark))}>
              <p className="text-3xl mb-2">📋</p>
              <p className={cx('text-sm font-semibold',T.text(dark))}>Nenhum produto</p>
              <p className={cx('text-xs mt-1',T.muted(dark))}>Adicione produtos e preços deste fornecedor</p>
            </div>
          ):(
            <div className={cx('rounded-2xl border overflow-hidden',T.tbl(dark))}>
              {/* Header tabela */}
              <div className={cx('grid text-[11px] font-bold uppercase tracking-wide px-3 py-2.5 border-b',T.tblH(dark))}
                style={{gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 1fr 1fr 0.8fr auto'}}>
                <span>Serviço</span>
                <span>Tipo</span>
                <span>Esp.</span>
                <span>Unid.</span>
                <span>Custo</span>
                <span>Margem</span>
                <span>Venda</span>
                <span></span>
              </div>
              {/* Rows */}
              <div className="divide-y divide-white/[0.03]">
                {produtos.map((p:any)=>(
                  <div key={p.id} className={cx('grid items-center px-3 py-2.5 text-xs',T.row(dark))}
                    style={{gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 1fr 1fr 0.8fr auto'}}>
                    <span className={cx('font-semibold truncate',T.text(dark))}>{p.servico}</span>
                    <span className={T.muted(dark)}>{p.tipo_vidro||'—'}</span>
                    <span className={T.muted(dark)}>{p.espessura||'—'}</span>
                    <span className={T.muted(dark)}>{p.unidade||'m²'}</span>
                    <span className={cx('font-medium',dark?'text-[#f1f1f1]':'text-slate-700')}>{fmt(p.custo||0)}</span>
                    <span className={cx('font-medium',dark?'text-amber-400':'text-amber-600')}>{p.margem||0}%</span>
                    <span className={cx('font-bold',dark?'text-sky-400':'text-sky-600')}>{fmt(valorVenda(p.custo||0,p.margem||0))}</span>
                    {canEdit&&(
                      <div className="flex gap-0.5">
                        <button onClick={()=>openEditProd(p)} className={cx('p-1 rounded transition-all',dark?'text-slate-600 hover:text-white hover:bg-white/5':'text-slate-400 hover:text-slate-700 hover:bg-slate-100')}><Edit2 size={11}/></button>
                        <button onClick={()=>delProd(p.id)} className="p-1 rounded text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={11}/></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Footer resumo */}
              <div className={cx('grid px-3 py-2.5 border-t text-xs font-bold',T.tblH(dark))}
                style={{gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 1fr 1fr 0.8fr auto'}}>
                <span>{produtos.length} item(s)</span>
                <span></span><span></span><span></span>
                <span>{fmt(produtos.reduce((s,p)=>s+(p.custo||0),0))}</span>
                <span></span>
                <span className="text-sky-400">{fmt(produtos.reduce((s,p)=>s+valorVenda(p.custo||0,p.margem||0),0))}</span>
                <span></span>
              </div>
            </div>
          )}

          {/* CSV hint */}
          {canEdit&&<div className={cx('p-3 rounded-xl border',dark?'border-sky-500/20 bg-sky-500/5':'border-sky-200 bg-sky-50')}>
            <p className={cx('text-xs font-semibold mb-1',dark?'text-sky-400':'text-sky-700')}>📋 Formato CSV para importação</p>
            <p className={cx('text-xs font-mono',T.muted(dark))}>servico,tipo_vidro,espessura,unidade,custo,margem,observacoes</p>
          </div>}
        </div>
      )}

      {/* Modal Fornecedor */}
      {showFornModal&&(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowFornModal(false)}/>
          <div className={cx('relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border p-5',T.modal(dark))}>
            <div className="flex items-center justify-between mb-4">
              <p className={cx('text-sm font-bold',T.text(dark))}>{editForn?'Editar':'Novo'} Fornecedor</p>
              <button onClick={()=>setShowFornModal(false)} className={cx('p-1.5 rounded-lg',T.muted(dark),'hover:opacity-70')}><X size={14}/></button>
            </div>
            <div className="space-y-3">
              <Field dark={dark} label="Nome *" value={fornForm.nome} onChange={(v:string)=>setFornForm(f=>({...f,nome:v}))} icon={Building2} required/>
              <Field dark={dark} label="Contato" value={fornForm.contato} onChange={(v:string)=>setFornForm(f=>({...f,contato:v}))} icon={User}/>
              <Field dark={dark} label="Telefone" value={fornForm.telefone} onChange={(v:string)=>setFornForm(f=>({...f,telefone:v}))} icon={Phone}/>
              <Field dark={dark} label="Email" value={fornForm.email} onChange={(v:string)=>setFornForm(f=>({...f,email:v}))} icon={Mail} type="email"/>
              <div className="flex flex-col gap-1.5">
                <label className={cx('text-xs font-semibold',T.sub(dark))}>Observações</label>
                <textarea rows={2} value={fornForm.observacoes} onChange={e=>setFornForm(f=>({...f,observacoes:e.target.value}))}
                  className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 resize-none',T.input(dark))}/>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowFornModal(false)} className={cx('flex-1 py-2.5 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
              <button onClick={saveForn} disabled={savingForn} className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold disabled:opacity-60 transition-all active:scale-95">
                {savingForn?'Salvando...':editForn?'Salvar':'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {showProdModal&&(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowProdModal(false)}/>
          <div className={cx('relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border p-5 max-h-[90vh] overflow-y-auto',T.modal(dark))}>
            <div className="flex items-center justify-between mb-4">
              <p className={cx('text-sm font-bold',T.text(dark))}>{editProd?'Editar':'Novo'} Produto</p>
              <button onClick={()=>setShowProdModal(false)} className={cx('p-1.5 rounded-lg',T.muted(dark),'hover:opacity-70')}><X size={14}/></button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className={cx('text-xs font-semibold',T.sub(dark))}>Serviço *</label>
                <select value={prodForm.servico} onChange={e=>setProdForm(f=>({...f,servico:e.target.value}))}
                  className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}>
                  <option value="">Selecione...</option>
                  {SERVICOS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={cx('text-xs font-semibold',T.sub(dark))}>Tipo de vidro</label>
                  <select value={prodForm.tipo_vidro} onChange={e=>setProdForm(f=>({...f,tipo_vidro:e.target.value}))}
                    className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}>
                    <option value="">—</option>
                    {TIPOS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={cx('text-xs font-semibold',T.sub(dark))}>Espessura</label>
                  <select value={prodForm.espessura} onChange={e=>setProdForm(f=>({...f,espessura:e.target.value}))}
                    className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}>
                    <option value="">—</option>
                    {ESPESSURAS.map(e=><option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={cx('text-xs font-semibold',T.sub(dark))}>Unidade</label>
                  <select value={prodForm.unidade} onChange={e=>setProdForm(f=>({...f,unidade:e.target.value}))}
                    className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}>
                    {['m²','m','un','kit'].map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={cx('text-xs font-semibold',T.sub(dark))}>Custo (R$) *</label>
                  <input type="number" step="0.01" min="0" value={prodForm.custo} onChange={e=>setProdForm(f=>({...f,custo:e.target.value}))}
                    placeholder="0,00" className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={cx('text-xs font-semibold',T.sub(dark))}>Margem (%)</label>
                  <input type="number" step="1" min="0" value={prodForm.margem} onChange={e=>setProdForm(f=>({...f,margem:e.target.value}))}
                    placeholder="30" className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50',T.input(dark))}/>
                </div>
              </div>
              {/* Preview preço */}
              {prodForm.custo&&Number(prodForm.custo)>0&&(
                <div className={cx('p-3 rounded-xl border flex items-center justify-between',dark?'border-sky-500/20 bg-sky-500/5':'border-sky-200 bg-sky-50')}>
                  <div>
                    <p className={cx('text-[10px] font-semibold uppercase',dark?'text-sky-400':'text-sky-600')}>Valor de venda</p>
                    <p className={cx('text-xl font-black',dark?'text-sky-400':'text-sky-600')}>{fmt(valorVenda(Number(prodForm.custo),Number(prodForm.margem||0)))}</p>
                  </div>
                  <div className="text-right">
                    <p className={cx('text-[10px]',T.muted(dark))}>Custo: {fmt(Number(prodForm.custo))}</p>
                    <p className={cx('text-[10px]',T.muted(dark))}>Margem: {prodForm.margem||0}%</p>
                    <p className={cx('text-[10px] font-semibold',dark?'text-sky-400':'text-sky-600')}>Lucro: {fmt(valorVenda(Number(prodForm.custo),Number(prodForm.margem||0))-Number(prodForm.custo))}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className={cx('text-xs font-semibold',T.sub(dark))}>Observações</label>
                <textarea rows={2} value={prodForm.observacoes} onChange={e=>setProdForm(f=>({...f,observacoes:e.target.value}))}
                  className={cx('w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-sky-500/50 resize-none',T.input(dark))}/>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowProdModal(false)} className={cx('flex-1 py-2.5 rounded-lg border text-sm',dark?'border-white/10 text-slate-400':'border-slate-200 text-slate-600')}>Cancelar</button>
              <button onClick={saveProd} disabled={savingProd} className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold disabled:opacity-60 transition-all active:scale-95">
                {savingProd?'Salvando...':editProd?'Salvar':'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




// ══════════════════════════════════════════════════════════════════
// SUPORTE
// ══════════════════════════════════════════════════════════════════
function Suporte({company,user,addToast,dark,onMenu}:any){
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
    try{await fetch('/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'suporte',empresa:company.company_name,empresa_slug:company.company_slug,usuario:user.display_name||user.full_name,cargo:user.role,mensagem:msg.trim(),timestamp:new Date().toISOString()})})}catch{}
    if(data) setTickets(t=>[data,...t])
    setMsg('');setSending(false);addToast('Mensagem enviada!','success')
  }

  const SC:any={aberto:'warning',respondido:'success',fechado:'default'}

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header dark={dark} onMenu={onMenu} title="Suporte" subtitle="Fale com a equipe Flüxa"/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
          <p className={cx('text-xs font-semibold mb-3 flex items-center gap-2',T.text(dark))}><HeadphonesIcon size={13}/>Nova mensagem</p>
          <Textarea dark={dark} value={msg} onChange={setMsg} placeholder="Descreva sua dúvida ou problema..." rows={4}/>
          <button onClick={send} disabled={sending}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-medium disabled:opacity-60 w-full justify-center transition-all">
            {sending?<><RefreshCw size={13} className="animate-spin"/>Enviando...</>:<><Send size={13}/>Enviar ao Suporte</>}
          </button>
        </div>
        <p className={cx('text-xs text-center',T.muted(dark))}>Respondemos em até 24h úteis via WhatsApp.</p>
        {tickets.length>0&&(
          <div className={cx('p-4 rounded-2xl border',T.card(dark))}>
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
// TUTORIAL
// ══════════════════════════════════════════════════════════════════
const TUTORIAL_STEPS_CRM = [
  {
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    title: 'Dashboard',
    desc: 'Aqui você vê um resumo completo: total de leads, taxa de conversão, ticket médio e evolução ao longo dos meses. Tudo em tempo real.',
  },
  {
    icon: GitBranch,
    color: 'from-violet-500 to-violet-600',
    title: 'Pipeline',
    desc: 'Arraste os leads entre as colunas para avançar nas etapas de venda. Renomeie as colunas clicando no lápis. Filtre por responsável no topo.',
  },
  {
    icon: Users,
    color: 'from-sky-500 to-sky-600',
    title: 'Leads',
    desc: 'Lista completa de todos os seus leads com busca, filtros e ordenação. Clique em qualquer lead para editar, adicionar anotações e acompanhar o status.',
  },
  {
    icon: Calendar,
    color: 'from-amber-500 to-orange-500',
    title: 'Calendário',
    desc: 'Agende reuniões, visitas e instalações. Visualize os eventos no calendário e confirme ou cancele diretamente por aqui.',
  },
  {
    icon: Shield,
    color: 'from-pink-500 to-rose-500',
    title: 'Colaboradores',
    desc: 'Cadastre sua equipe, defina cargos (Colaborador, Gestor ou Founder) e gerencie quem tem acesso ao quê dentro do CRM.',
  },
  {
    icon: Settings,
    color: 'from-slate-500 to-slate-600',
    title: 'Configurações',
    desc: 'Personalize seu perfil, foto, nome e altere sua senha. Gestores também podem editar o nome e logo da empresa.',
  },
]

const TUTORIAL_STEPS_HUB = [
  {
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    title: 'Hub Dashboard',
    desc: 'Visão geral de todas as empresas cadastradas na plataforma: quantas estão ativas, total de usuários e empresas recentes.',
  },
  {
    icon: Globe,
    color: 'from-sky-500 to-sky-600',
    title: 'Empresas Cadastradas',
    desc: 'Lista completa de todos os parceiros. Você pode visualizar o status de cada empresa e apagá-la com todos os dados quando necessário.',
  },
  {
    icon: Plus,
    color: 'from-violet-500 to-violet-600',
    title: 'Criar Empresa',
    desc: 'Cadastre um novo parceiro diretamente pelo Hub, sem precisar de SQL. Informe o nome, slug de acesso e crie o gestor principal da empresa.',
  },
  {
    icon: Shield,
    color: 'from-amber-500 to-orange-500',
    title: 'Colaboradores do Hub',
    desc: 'Gerencie os membros da equipe Flüxa com acesso ao Hub de controle.',
  },
]

function Tutorial({isHub,dark,onFinish}:{isHub:boolean,dark:boolean,onFinish:()=>void}){
  const [step,setStep]=useState(0)
  const steps=isHub?TUTORIAL_STEPS_HUB:TUTORIAL_STEPS_CRM
  const current=steps[step]
  const Icon=current.icon
  const isLast=step===steps.length-1

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
      <div className={cx('relative w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border shadow-2xl',T.modal(dark))}>
        {/* Progress bar */}
        <div className={cx('h-1 w-full',dark?'bg-white/10':'bg-slate-200')}>
          <div className="h-1 bg-sky-500 transition-all duration-500 rounded-full"
            style={{width:`${((step+1)/steps.length)*100}%`}}/>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className={cx('w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-xl',current.color)}>
            <Icon size={36} className="text-white"/>
          </div>

          {/* Step counter */}
          <p className={cx('text-xs font-semibold mb-2 tracking-widest uppercase',T.muted(dark))}>
            {step+1} de {steps.length}
          </p>

          {/* Title */}
          <h2 className={cx('text-2xl font-bold mb-3',T.text(dark))}>{current.title}</h2>

          {/* Description */}
          <p className={cx('text-sm leading-relaxed mb-8',T.sub(dark))}>{current.desc}</p>

          {/* Dots */}
          <div className="flex gap-2 mb-8">
            {steps.map((_,i)=>(
              <button key={i} onClick={()=>setStep(i)}
                className={cx('rounded-full transition-all duration-300',
                  i===step?'w-6 h-2.5 bg-sky-500':'w-2.5 h-2.5',
                  i<step?(dark?'bg-sky-500/40':'bg-sky-400'):(dark?'bg-white/20':'bg-slate-300')
                )}/>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            {step>0&&(
              <button onClick={()=>setStep(s=>s-1)}
                className={cx('flex-1 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95',
                  dark?'border-white/10 text-slate-400 hover:bg-white/5':'border-slate-300 text-slate-600 hover:bg-slate-50')}>
                Anterior
              </button>
            )}
            <button onClick={isLast?onFinish:()=>setStep(s=>s+1)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 active:scale-95 transition-all">
              {isLast?'Começar a usar! 🚀':'Próximo'}
            </button>
          </div>

          {/* Skip */}
          {!isLast&&(
            <button onClick={onFinish} className={cx('mt-4 text-xs transition-colors',T.muted(dark),'hover:text-slate-300')}>
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [session,setSession]=useState<any>(null)
  const [sessionLoaded,setSessionLoaded]=useState(false)
  const [tab,setTab]=useState('dashboard')
  const [dark,setDark]=useState(true)
  const [sideOpen,setSideOpen]=useState(false)
  const [leads,setLeads]=useState<any[]>([])
  const [funnels,setFunnels]=useState<any[]>([])
  const [users,setUsers]=useState<any[]>([])
  const [logoutConfirm,setLogoutConfirm]=useState(false)
  const [showTutorial,setShowTutorial]=useState(false)
  const {toasts,add:addToast,rm:rmToast}=useToast()

  // Restore session from localStorage on mount
  useEffect(()=>{
    try{
      const saved=localStorage.getItem('fluxa_session')
      const savedTab=localStorage.getItem('fluxa_tab')
      const savedDark=localStorage.getItem('fluxa_dark')
      if(savedDark!==null) setDark(savedDark==='true')
      if(saved){
        const s=JSON.parse(saved)
        setSession(s)
        if(savedTab) setTab(savedTab)
        loadData(s.company.id)
      }
    }catch{}
    setSessionLoaded(true)
  },[])

  // Save session to localStorage on change
  useEffect(()=>{
    if(!sessionLoaded) return
    if(session) localStorage.setItem('fluxa_session',JSON.stringify(session))
    else localStorage.removeItem('fluxa_session')
  },[session,sessionLoaded])

  useEffect(()=>{
    if(sessionLoaded) localStorage.setItem('fluxa_tab',tab)
  },[tab,sessionLoaded])

  useEffect(()=>{
    if(sessionLoaded) localStorage.setItem('fluxa_dark',String(dark))
  },[dark,sessionLoaded])

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

  // Realtime — atualiza todo o CRM automaticamente sem precisar de F5
  useEffect(()=>{
    if(!session) return
    const companyId=session.company.id
    const reloadLeads=()=>sb.from('leads').select('*').eq('company_id',companyId).order('created_at',{ascending:false}).then(({data})=>{if(data) setLeads(data)})
    const reloadFunnels=()=>sb.from('funnels').select('*').eq('company_id',companyId).order('created_at').then(({data})=>{if(data) setFunnels(data)})
    const reloadUsers=()=>sb.from('users').select('*').eq('company_id',companyId).eq('active',true).order('created_at').then(({data})=>{if(data) setUsers(data)})
    const channel=sb.channel(`realtime_crm_${companyId}`)
      // Leads & notas
      .on('postgres_changes',{event:'*',schema:'public',table:'leads',filter:`company_id=eq.${companyId}`},()=>reloadLeads())
      .on('postgres_changes',{event:'*',schema:'public',table:'lead_notes',filter:`company_id=eq.${companyId}`},()=>reloadLeads())
      // Reuniões
      .on('postgres_changes',{event:'*',schema:'public',table:'meetings',filter:`company_id=eq.${companyId}`},()=>reloadLeads())
      // Funis e colunas do pipeline
      .on('postgres_changes',{event:'*',schema:'public',table:'funnels',filter:`company_id=eq.${companyId}`},()=>reloadFunnels())
      .on('postgres_changes',{event:'*',schema:'public',table:'pipeline_columns',filter:`company_id=eq.${companyId}`},()=>reloadLeads())
      // Usuários e colaboradores
      .on('postgres_changes',{event:'*',schema:'public',table:'users',filter:`company_id=eq.${companyId}`},()=>reloadUsers())
      // Mensagens do chat ao vivo
      .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`company_id=eq.${companyId}`},()=>reloadLeads())
      .subscribe()
    return ()=>{ sb.removeChannel(channel) }
  },[session?.company?.id])

  const login=({company,user}:any)=>{
    const isHub=company.company_slug===FLUXA_SLUG&&user.role==='founder'
    setSession({company,user})
    loadData(company.id)
    setTab(isHub?'hub_dashboard':'dashboard')
    // Show tutorial only on first login ever
    const tutorialKey=`fluxa_tutorial_${user.id}`
    if(!localStorage.getItem(tutorialKey)) setShowTutorial(true)
    addToast(`Bem-vindo, ${user.display_name||user.full_name}! 👋`,'success')
  }

  const finishTutorial=()=>{
    if(session) localStorage.setItem(`fluxa_tutorial_${session.user.id}`,'done')
    setShowTutorial(false)
  }
  const doLogout=()=>{
    setSession(null);setLeads([]);setFunnels([]);setUsers([]);setTab('dashboard')
    localStorage.removeItem('fluxa_session');localStorage.removeItem('fluxa_tab')
    setLogoutConfirm(false)
  }
  const logout=()=>setLogoutConfirm(true)
  const setUser=(fn:any)=>setSession((s:any)=>({...s,user:typeof fn==='function'?fn(s.user):fn}))
  const setCompany=(fn:any)=>setSession((s:any)=>({...s,company:typeof fn==='function'?fn(s.company):fn}))

  if(!sessionLoaded) return <div className="min-h-screen bg-[#050812] flex items-center justify-center"><RefreshCw size={20} className="text-sky-400 animate-spin"/></div>
  if(!session) return <Login onLogin={login}/>

  const {company,user}=session
  const isHub=company.company_slug===FLUXA_SLUG&&user.role==='founder'
  const p={company,user,addToast,leads,setLeads,funnels,users,role:user.role,dark,onMenu:()=>setSideOpen(true)}

  const pages:any={
    // Hub pages
    hub_dashboard:    <HubDashboard dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    fluxa_funil:      <FluxaFunil dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    fluxa_prospects:  <FluxaProspects dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    fluxa_calendario: <FluxaCalendario dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    hub_empresas:     <HubEmpresas dark={dark} onMenu={()=>setSideOpen(true)}/>,
    hub_criar:        <HubCriarEmpresa dark={dark} addToast={addToast} setTab={setTab} onMenu={()=>setSideOpen(true)}/>,
    // Normal CRM pages
    dashboard:     <Dashboard {...p}/>,
    pipeline:      <Pipeline {...p}/>,
    leads:         <LeadsTable {...p}/>,
    calendar:      <CalendarView company={company} user={user} addToast={addToast} leads={leads} dark={dark} onMenu={()=>setSideOpen(true)}/>,
    colaboradores: <Colaboradores company={company} user={user} addToast={addToast} dark={dark} onMenu={()=>setSideOpen(true)}/>,
    eli_config:    <EliConfigPage company={company} user={user} dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    fornecedores:  <FornecedoresPage company={company} user={user} dark={dark} addToast={addToast} onMenu={()=>setSideOpen(true)}/>,
    settings:      <SettingsPage user={user} company={company} dark={dark} setDark={setDark} onLogout={logout} addToast={addToast} setUser={setUser} setCompany={setCompany} onMenu={()=>setSideOpen(true)}/>,
    suporte:       <Suporte company={company} user={user} addToast={addToast} dark={dark} onMenu={()=>setSideOpen(true)}/>,
  }

  return (
    <div className={cx('flex h-screen w-screen overflow-hidden',T.bg(dark))} style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <Sidebar active={tab} setActive={setTab} company={company} user={user} onLogout={logout} open={sideOpen} setOpen={setSideOpen} dark={dark} setDark={setDark}/>
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {pages[tab]||pages[isHub?'hub_dashboard':'dashboard']}
      </main>
      <Toast toasts={toasts} rm={rmToast}/>
      <Confirm dark={dark} open={logoutConfirm} onClose={()=>setLogoutConfirm(false)} onOk={doLogout} title="Sair da conta" msg="Tem certeza que deseja sair? Você precisará fazer login novamente."/>
      {showTutorial&&<Tutorial isHub={isHub} dark={dark} onFinish={finishTutorial}/>}
    </div>
  )
}
