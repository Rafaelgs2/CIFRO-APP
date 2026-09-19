import type {Metadata} from 'next';
import FinanceApp from '../finance-main';
import {AuthGate} from './auth-gate';

export const metadata:Metadata={
  title:'Painel',
  robots:{index:false,follow:false,nocache:true},
};

export default function DashboardPage() {
  return <AuthGate><FinanceApp /></AuthGate>;
}
