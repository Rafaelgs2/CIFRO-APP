import {ArrowRight,ShieldCheck} from 'lucide-react';
import {Brand} from './brand';
import {Skeleton} from '@/components/ui/skeleton';

export function FinanceEntry({onDemo}:{onDemo:()=>void}) {
  return <section className="entry-layout"><div className="entry-branding"><Brand/><p className="entry-slogan">SUAS FINANÇAS<br/>MAIS CONECTADAS</p><h1>O seu dinheiro.<br/>Tudo no mesmo lugar.</h1><p>Contas, despesas e objetivos organizados para você acompanhar o que entra, o que sai e o que fica.</p><div className="entry-topics"><span>Contas</span><span>Movimentações</span><span>Metas</span></div></div><div className="entry-signin"><p className="section-kicker">SEU ESPAÇO PESSOAL</p><h2>Acesse suas finanças</h2><p>Entre com sua conta para consultar e salvar seus registros.</p><a className="primary" href="/signin-with-chatgpt?return_to=/" target="_top">Entrar com ChatGPT <ArrowRight size={18}/></a><div className="entry-divider"><span>ou conheça o CIFRO</span></div><button className="secondary" onClick={onDemo}>Conhecer com dados de exemplo</button><p className="form-hint">A demonstração é temporária e usa dados fictícios.</p><p className="entry-security"><ShieldCheck size={17}/>Seus registros ficam no seu espaço privado.</p></div></section>;
}

export function FinanceLoading() {
  return <div className="finance-loading" role="status" aria-label="Carregando seus dados"><span className="sr-only">Carregando seus dados…</span><Skeleton className="skeleton-heading"/><Skeleton className="skeleton-caption"/><div className="skeleton-balance"><Skeleton/><Skeleton/></div><Skeleton className="skeleton-chart"/></div>;
}
