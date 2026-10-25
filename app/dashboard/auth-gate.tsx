'use client';

import {useEffect,useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {isAuthRetryableFetchError} from '@supabase/supabase-js';
import {getSupabaseBrowserClient,isSupabaseConfigured} from '@/lib/supabase/browser';

type Status='checking'|'offline'|'ready';

export function AuthGate({children}:{children:ReactNode}){
  const router=useRouter();
  const [status,setStatus]=useState<Status>('checking');
  const configured=isSupabaseConfigured();

  useEffect(()=>{
    if(!configured)return;
    const supabase=getSupabaseBrowserClient();
    let active=true;
    const offline=()=>setStatus(current=>current==='ready'?current:'offline');
    // Installed apps get persistent storage without a prompt, so a phone low on space won't evict the saved session.
    if(matchMedia('(display-mode: standalone)').matches)void navigator.storage?.persist?.();
    // The API validates the token on every request, so the gate only reads the session saved on this device. A phone
    // waking up often has no network yet to renew an expired token: the client keeps the session and renews it on its
    // own (TOKEN_REFRESHED below), so only a session the server rejected — which the client removes — leads to the login.
    void supabase.auth.getSession().then(({data:{session},error})=>{
      if(!active)return;
      if(session)setStatus('ready');
      else if(error&&isAuthRetryableFetchError(error))offline();
      else router.replace('/login');
    },()=>{if(active)offline();});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(session){setStatus('ready');return;}
      if(event==='SIGNED_OUT'){setStatus('checking');router.replace('/login');}
    });
    return()=>{active=false;subscription.unsubscribe();};
  },[configured,router]);

  if(!configured)return <main className="login-page"><section className="login-auth"><h1>Configure o Supabase</h1><p>Copie <code>.env.example</code> para <code>.env.local</code> e informe a Project URL e a Publishable key.</p></section></main>;
  // Reloading starts a fresh client: the current one waits a minute before retrying a renewal that just failed.
  if(status==='offline')return <main className="login-page"><section className="login-auth"><h1>Sem conexão</h1><p>Sua sessão continua salva neste aparelho. Quando a internet voltar, o CIFRO abre sozinho.</p><button type="button" className="login-submit" onClick={()=>location.reload()}>Tentar de novo</button></section></main>;
  if(status!=='ready')return <main className="login-page"><section className="login-auth"><p>Verificando sua sessão…</p></section></main>;
  return <>{children}</>;
}
