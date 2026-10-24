'use client';

import {ArrowRight,Plus,Eye,EyeOff,ArrowUpRight,ArrowLeftRight,CreditCard} from '@/components/icons';
import {accountBalance,dateInMonth,money,today,totals,invoice,monthOf} from '@/lib/finance';
import {AccountTile,CategoryChart,TransactionRows,EmptyState,Bar} from './finance-ui';
import {FinancialFlow} from './finance-chart';
import type {AppContext} from './finance-main';

export function FinanceDashboard({context:c,hidden,onToggleValues}:{context:AppContext,hidden:boolean,onToggleValues:()=>void}) {
  const {state,month,navigate,transaction,selectAccount,selectCard,editTx,open}=c;
  const end=dateInMonth(month,31),period=totals(state,`${month}-01`,end);
  const balance=state.accounts.reduce((n,a)=>n+accountBalance(state,a,end),0);
  const shown=(n:number)=>hidden?'••••':money(n);
  const accounts=state.accounts.filter(a=>!a.archived).sort((a,b)=>a.order-b.order);
  const bills=state.bills.filter(b=>!b.transactionId&&monthOf(b.date)===month).map(b=>({...b,cardId:''}));
  const invoices=state.cards.map(card=>({card,inv:invoice(state,card,month)})).filter(x=>x.inv.remaining>0).map(({card,inv})=>({id:card.id,name:`Fatura ${card.name}`,amount:inv.remaining,date:inv.due,type:'expense',cardId:card.id}));
  const commitments=[...bills,...invoices].sort((a,b)=>a.date.localeCompare(b.date));
  return <div className="home-layout">
    <section className="financial-hero" aria-label="Resumo financeiro">
      <div className="hero-balance"><div className="balance-label"><span>Saldo nas contas</span><button className="icon-button" onClick={onToggleValues} aria-label={hidden?'Mostrar valores':'Ocultar valores'}>{hidden?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><strong className="balance-number">{shown(balance)}</strong><p>Até o fim do mês selecionado · inclui investimentos e reserva</p><button className="text-button" onClick={()=>navigate('accounts')}>Ver minhas contas <ArrowRight size={16}/></button></div>
      <dl className="hero-metrics"><div><dt>Receitas deste mês</dt><dd>{shown(period.income)}</dd></div><div><dt>Despesas deste mês</dt><dd>{shown(period.expense)}</dd></div><div className="metric-result"><dt>Resultado mensal</dt><dd>{shown(period.result)}</dd><span>Receitas menos despesas</span></div></dl>
    </section>
    <div className="quick-actions" aria-label="Movimentações"><button className="primary" onClick={()=>transaction('expense')}><Plus size={18}/>Nova despesa</button><button className="secondary" onClick={()=>transaction('income')}><ArrowUpRight size={18}/>Nova receita</button><button className="secondary" onClick={()=>transaction('transfer')}><ArrowLeftRight size={17}/>Transferir</button><button className="text-button" onClick={()=>navigate('cards')}><CreditCard size={17}/>Meus cartões</button></div>
    {!state.accounts.length&&<section className="welcome-card"><div><h2>Adicione sua primeira conta.</h2><p>Informe o saldo inicial para começar a acompanhar suas movimentações.</p></div><button className="primary" onClick={()=>open({kind:'account'})}>Adicionar minha primeira conta</button>{!c.demo&&<button className="demo-link" onClick={c.switchDemo}>Conhecer com dados de exemplo <ArrowRight size={16}/></button>}</section>}
    <div className="overview-composition">
      <section className="flow-section"><div className="section-heading"><div><p className="section-kicker">NOS ÚLTIMOS SEIS MESES</p><h2>Fluxo financeiro</h2></div><button className="text-button" onClick={()=>navigate('reports')}>Ver relatório <ArrowRight size={16}/></button></div><FinancialFlow state={state} month={month} hidden={hidden}/></section>
      <section className="category-section"><div className="section-heading"><div><p className="section-kicker">NESTE MÊS</p><h2>Gastos por categoria</h2></div></div>{hidden?<p className="chart-private">Valores ocultos</p>:<CategoryChart state={state} items={period.transactions}/>}</section>
      <section className="recent-section"><div className="section-heading"><h2>Últimas transações</h2><button className="text-button" onClick={()=>navigate('transactions')}>Ver todas <ArrowRight size={16}/></button></div><TransactionRows items={[...period.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)} state={state} onSelect={editTx} hidden={hidden}/></section>
      <section className="payment-section"><div className="section-heading"><h2>Próximos compromissos</h2><button className="icon-button" onClick={()=>navigate('planning')} aria-label="Ver planejamento"><ArrowRight size={18}/></button></div>{commitments.length?<div>{commitments.slice(0,4).map(item=><button key={item.id} className="commitment-row" onClick={()=>item.cardId?selectCard(item.cardId):navigate('planning')}><span className="payment-copy"><b>{item.name}</b><small>{new Date(item.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} · {item.date<today()?'Em atraso':item.type==='income'?'A receber':'A pagar'}</small></span><strong>{shown(item.amount)}</strong></button>)}</div>:<EmptyState title="Nenhum compromisso pendente" description="Cadastre pagamentos e recebimentos no planejamento."/>}<button className="closing-link" onClick={()=>navigate('closing')}>Revisar fechamento do mês <ArrowRight size={16}/></button></section>
    </div>
    {!!accounts.length&&<section className="accounts-section"><div className="section-heading"><h2>Minhas contas</h2><button className="text-button" onClick={()=>navigate('accounts')}>Gerenciar <ArrowRight size={16}/></button></div><div className="account-grid">{accounts.map(a=><AccountTile key={a.id} account={a} state={state} end={end} hidden={hidden} onClick={()=>selectAccount(a.id)}/>)}</div></section>}
    {!!state.goals.length&&<section className="dashboard-goals"><div className="section-heading"><h2>Metas</h2><button className="text-button" onClick={()=>navigate('planning')}>Ver planejamento <ArrowRight size={16}/></button></div>{state.goals.slice(0,2).map(g=>{const account=state.accounts.find(a=>a.id===g.accountId)!;const current=accountBalance(state,account,today());return <button className="goal-summary" key={g.id} onClick={()=>navigate('planning')}><span><b>{g.name}</b><small>{account.name}</small></span><span><b>{shown(current)}</b><small>de {shown(g.target)}</small></span><Bar value={current/g.target*100}/><span>{hidden?'Valores ocultos':current>=g.target?'Meta alcançada':`Faltam ${money(g.target-current)}`}</span></button>})}</section>}
  </div>;
}
