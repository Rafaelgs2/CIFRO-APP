'use client';

import {useMemo} from 'react';
import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid} from 'recharts';
import {type State,addMonth,dateInMonth,totals,accountBalance,money,monthLabel} from '@/lib/finance';

export default function FinancialFlowChart({state,month,hidden=false}:{state:State,month:string,hidden?:boolean}) {
  const series=useMemo(()=>Array.from({length:6},(_,i)=>{
    const m=addMonth(month,i-5),period=totals(state,`${m}-01`,dateInMonth(m,31));
    return {month:m,label:new Date(m+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'short'}),income:period.income/100,expense:period.expense/100,balance:state.accounts.reduce((sum,a)=>sum+accountBalance(state,a,dateInMonth(m,31)),0)/100};
  }),[state,month]);
  if(hidden)return <div className="chart-private">Valores ocultos</div>;
  if(!state.accounts.length)return <div className="chart-private"><p>Seu fluxo financeiro começa com uma conta.</p><span>Receitas, despesas e saldos aparecerão aqui.</span></div>;
  return <div className="financial-flow">
    <div className="chart-key"><span><i className="balance-dot"/>Saldo nas contas</span><span><i className="income-dot"/>Receitas</span><span><i className="expense-dot"/>Despesas</span></div>
    <div className="flow-canvas" aria-label="Evolução do saldo, receitas e despesas nos últimos seis meses">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} initialDimension={{width:480,height:240}}>
        <LineChart data={series} margin={{top:12,right:12,left:0,bottom:4}} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 6"/>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={14} tick={{fill:'var(--text-muted)',fontSize:12}}/>
          <YAxis width={52} axisLine={false} tickLine={false} tickCount={4} tick={{fill:'var(--text-muted)',fontSize:12}} tickFormatter={n=>Math.abs(n)>=1000?`${Math.round(n/1000)} mil`:String(n)}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tooltip"><b>{series.find(x=>x.label===label)?.month?monthLabel(series.find(x=>x.label===label)!.month):label}</b>{payload.map(item=><div key={String(item.dataKey)}><span>{item.name}</span><strong>{money(Math.round(Number(item.value)*100))}</strong></div>)}</div>:null}/>
          <Line type="monotone" dataKey="balance" name="Saldo" stroke="var(--chart-primary)" strokeWidth={2.5} dot={false} activeDot={{r:4}} isAnimationActive={false}/>
          <Line type="monotone" dataKey="income" name="Receitas" stroke="var(--chart-secondary)" strokeWidth={1.8} dot={false} isAnimationActive={false}/>
          <Line type="monotone" dataKey="expense" name="Despesas" stroke="var(--chart-tertiary)" strokeDasharray="4 4" strokeWidth={1.8} dot={false} isAnimationActive={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
    <details className="chart-details"><summary>Ver valores por mês</summary><div className="chart-table"><div className="chart-table-heading"><span>Mês</span><span>Receitas</span><span>Despesas</span><span>Saldo</span></div>{series.map(row=><div key={row.month}><span>{monthLabel(row.month)}</span><span>{money(Math.round(row.income*100))}</span><span>{money(Math.round(row.expense*100))}</span><span>{money(Math.round(row.balance*100))}</span></div>)}</div></details>
  </div>;
}
