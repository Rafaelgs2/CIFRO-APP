'use client';
import {lazy,Suspense} from 'react';
import type {State} from '@/lib/finance';

// Keep charting code out of the initial sign-in and non-chart routes.
const FinancialFlowChart=lazy(()=>import('./finance-flow-chart'));
export function FinancialFlow(props:{state:State,month:string,hidden?:boolean}) {
  return <Suspense fallback={<div className="chart-private" role="status">Carregando gráfico…</div>}><FinancialFlowChart {...props}/></Suspense>;
}
