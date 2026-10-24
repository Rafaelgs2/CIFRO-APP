'use client';

import {Fragment,useEffect,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type ReactNode} from 'react';
import {House,ReceiptText,CalendarDays,ChartNoAxesCombined,UserRound,Landmark,CreditCard,PanelLeftClose,PanelLeftOpen,ChevronRight,Plus,ArrowUpRight,ArrowDownLeft,ArrowLeftRight,ShoppingBag,WalletCards} from 'lucide-react';
import {SidebarProvider,Sidebar,SidebarContent,SidebarMenu,SidebarMenuItem,SidebarMenuButton} from '@/components/ui/sidebar';
import {Brand} from './brand';
import {ThemeToggle} from './theme-controls';
import type {View} from './finance-main';

export const mainNavigation=[
  {id:'home',name:'Início',mobile:'Início',icon:House},
  {id:'transactions',name:'Lançamentos',mobile:'Lançamentos',icon:ReceiptText},
  {id:'planning',name:'Planejamento',mobile:'Planos',icon:CalendarDays},
  {id:'reports',name:'Relatórios',mobile:'Relatórios',icon:ChartNoAxesCombined},
  {id:'profile',name:'Perfil',mobile:'Perfil',icon:UserRound},
] as const;
const quickActions=[
  {id:'expense',label:'Nova despesa',icon:ArrowUpRight},
  {id:'income',label:'Nova receita',icon:ArrowDownLeft},
  {id:'transfer',label:'Transferir',icon:ArrowLeftRight},
  {id:'purchase',label:'Compra no cartão',icon:ShoppingBag},
  {id:'account',label:'Nova conta',icon:Landmark},
  {id:'card',label:'Novo cartão',icon:WalletCards},
] as const;
export type QuickAction=(typeof quickActions)[number]['id'];
const moneyNavigation=[{id:'accounts',name:'Contas',icon:Landmark},{id:'cards',name:'Cartões',icon:CreditCard}] as const;

export function FinanceShell({children,view,navigate,name,title,onCreate}:{children:ReactNode,view:View,navigate:(v:View)=>void,name:string,title:string,onCreate:(action:QuickAction)=>void}) {
  const [navigationMode,setNavigationMode]=useState<'auto'|'expanded'|'collapsed'>('auto');
  const [addOpen,setAddOpen]=useState(false);
  const addRef=useRef<HTMLButtonElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!addOpen)return;
    const placeTail=()=>{
      const menu=menuRef.current,button=addRef.current,dock=menu?.offsetParent;
      if(!menu||!button||!dock)return;
      const center=button.getBoundingClientRect().left+button.offsetWidth/2-dock.getBoundingClientRect().left;
      menu.style.setProperty('--tail-x',`${Math.min(Math.max(center,40),dock.clientWidth-40)}px`);
    };
    placeTail();
    window.addEventListener('resize',placeTail);
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setAddOpen(false);addRef.current?.focus();}};
    document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('keydown',onKey);window.removeEventListener('resize',placeTail);};
  },[addOpen]);
  function moveFocus(event:ReactKeyboardEvent<HTMLDivElement>){
    const keys=['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'];
    if(!keys.includes(event.key))return;
    event.preventDefault();
    const items=Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);
    const index=items.indexOf(document.activeElement as HTMLButtonElement);
    const step=event.key==='ArrowDown'||event.key==='ArrowRight'?1:-1;
    items[(index+step+items.length)%items.length]?.focus();
  }
  const toggleNavigation=()=>setNavigationMode(mode=>mode==='auto'?(window.matchMedia('(max-width:1180px)').matches?'expanded':'collapsed'):mode==='collapsed'?'expanded':'collapsed');
  return <div className="app-shell" data-navigation={navigationMode}>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <SidebarProvider className="sidebar-provider">
      <Sidebar collapsible="none" className="sidebar" id="desktop-navigation">
        <SidebarContent>
          <a className="sidebar-brand" href="#home" onClick={()=>navigate('home')} aria-label="CIFRO — Início"><Brand/></a>
          <p className="sidebar-caption">SUAS FINANÇAS<br/>MAIS CONECTADAS</p>
          <SidebarMenu aria-label="Navegação principal">
            {mainNavigation.map(item=><SidebarMenuItem key={item.id}><SidebarMenuButton aria-label={item.name} title={item.name} className={`nav-item ${view===item.id?'active':''}`} isActive={view===item.id} onClick={()=>navigate(item.id)}><item.icon/><span>{item.name}</span></SidebarMenuButton></SidebarMenuItem>)}
          </SidebarMenu>
          <span className="sidebar-section-label">MEU DINHEIRO</span>
          <SidebarMenu>{moneyNavigation.map(item=><SidebarMenuItem key={item.id}><SidebarMenuButton aria-label={item.name} title={item.name} className={`nav-item ${view===item.id?'active':''}`} isActive={view===item.id} onClick={()=>navigate(item.id)}><item.icon/><span>{item.name}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>
          <button className="sidebar-collapse" aria-label="Alternar navegação lateral" aria-controls="desktop-navigation" onClick={toggleNavigation}><PanelLeftClose className="collapse-icon" size={19}/><PanelLeftOpen className="expand-icon" size={19}/><span>Recolher menu</span></button>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
    <div className="workspace">
      <header className="topbar">
        <a className="mobile-brand" href="#home" onClick={()=>navigate('home')} aria-label="CIFRO — Início"><Brand/></a>
        <div className="page-location"><span>Meu espaço</span><ChevronRight size={14}/><b>{title}</b></div>
        <div className="top-actions"><ThemeToggle/><button className="avatar" aria-label="Abrir perfil" onClick={()=>navigate('profile')}>{name?name.slice(0,2).toUpperCase():<UserRound size={19}/>}</button></div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
    </div>
    <div className="dock-scrim" data-open={addOpen} onClick={()=>setAddOpen(false)} aria-hidden="true"/>
    <div className="mobile-dock">
      <div id="dock-add-menu" ref={menuRef} className="dock-menu" role="menu" aria-label="Adicionar" data-open={addOpen} onKeyDown={moveFocus}>
        {quickActions.map((action,index)=><button key={action.id} type="button" role="menuitem" style={{'--i':index} as CSSProperties} onClick={()=>{setAddOpen(false);onCreate(action.id);}}><span className="dock-menu-icon" aria-hidden="true"><action.icon size={19}/></span>{action.label}</button>)}
      </div>
      <nav className="mobile-nav" aria-label="Navegação principal">{mainNavigation.map((item,index)=>{
        const active=view===item.id||item.id==='profile'&&['accounts','cards','categories'].includes(view)||item.id==='reports'&&view==='closing';
        return <Fragment key={item.id}>
          <button aria-label={item.name} title={item.name} onClick={()=>{setAddOpen(false);navigate(item.id);}} className={active?'active':''} aria-current={active?'page':undefined}><item.icon size={21}/><span aria-hidden="true">{item.mobile}</span></button>
          {index===1&&<button ref={addRef} type="button" className="dock-add" aria-label="Adicionar" title="Adicionar" aria-haspopup="menu" aria-expanded={addOpen} aria-controls="dock-add-menu" onClick={()=>setAddOpen(open=>!open)}><Plus size={24}/></button>}
        </Fragment>;
      })}</nav>
    </div>
  </div>;
}
