'use client';

import {useState,type ReactNode} from 'react';
import {House,ReceiptText,CalendarDays,ChartNoAxesCombined,UserRound,Landmark,CreditCard,PanelLeftClose,PanelLeftOpen,ChevronRight} from 'lucide-react';
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
const moneyNavigation=[{id:'accounts',name:'Contas',icon:Landmark},{id:'cards',name:'Cartões',icon:CreditCard}] as const;

export function FinanceShell({children,view,navigate,name,title}:{children:ReactNode,view:View,navigate:(v:View)=>void,name:string,title:string}) {
  const [navigationMode,setNavigationMode]=useState<'auto'|'expanded'|'collapsed'>('auto');
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
    <nav className="mobile-nav" aria-label="Navegação principal">{mainNavigation.map(item=>{
      const active=view===item.id||item.id==='profile'&&['accounts','cards','categories'].includes(view)||item.id==='reports'&&view==='closing';
      return <button key={item.id} aria-label={item.name} title={item.name} onClick={()=>navigate(item.id)} className={active?'active':''} aria-current={active?'page':undefined}><item.icon size={21}/><span aria-hidden="true">{item.mobile}</span></button>;
    })}</nav>
  </div>;
}
