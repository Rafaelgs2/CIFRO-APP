import type {Metadata} from 'next';
import {LandingPage} from './landing-page';

export const metadata:Metadata={
  title:{absolute:'CIFRO — Suas finanças mais conectadas'},
  description:'Organize contas, gastos, cartões e patrimônio em uma única visão com o CIFRO.',
  alternates:{canonical:'/'},
  openGraph:{
    type:'website',
    locale:'pt_BR',
    siteName:'CIFRO',
    title:'CIFRO — Suas finanças mais conectadas',
    description:'Organize contas, gastos, cartões e patrimônio em uma única visão com o CIFRO.',
  },
  twitter:{
    card:'summary',
    title:'CIFRO — Suas finanças mais conectadas',
    description:'Organize contas, gastos, cartões e patrimônio em uma única visão com o CIFRO.',
  },
};

export default function Home() {
  return <LandingPage />;
}
