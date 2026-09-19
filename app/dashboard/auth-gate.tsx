'use client';

import {useEffect,useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {getSupabaseBrowserClient,isSupabaseConfigured} from '@/lib/supabase/browser';

export function AuthGate({children}:{children:ReactNode}){
  const router=useRouter();
  const [ready,setReady]=useState(false);
  const configured=isSupabaseConfigured();

  useEffect(()=>{
    if(!configured)return;
    const supabase=getSupabaseBrowserClient();
    let active=true;
    void supabase.auth.getSession().then(({data})=>{
      if(!active)return;
      if(!data.session){router.replace('/');return;}
      setReady(true);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!session){setReady(false);router.replace('/');return;}
      setReady(true);
    });
    return()=>{active=false;subscription.unsubscribe();};
  },[configured,router]);

  if(!configured)return <main className="login-page"><section className="login-auth"><h1>Configure o Supabase</h1><p>Copie <code>.env.example</code> para <code>.env.local</code> e informe a Project URL e a Publishable key.</p></section></main>;
  if(!ready)return <main className="login-page"><section className="login-auth"><p>Verificando sua sessão…</p></section></main>;
  return <>{children}</>;
}
