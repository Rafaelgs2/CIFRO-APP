'use client';

import {useEffect,useState} from 'react';
import {toast} from 'sonner';
import {Field,Picker} from './finance-ui';
import type {Account} from '@/lib/finance';

type Status={linked:boolean;chatId?:string;accountId?:string};
type Fetcher=(input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;

const ENDPOINT='/api/telegram/link';

export function TelegramLink({accounts,authorizedFetch}:{accounts:Account[];authorizedFetch:Fetcher}){
  const active=accounts.filter(account=>!account.archived);
  const [status,setStatus]=useState<Status|null>(null);
  const [failed,setFailed]=useState(false);
  const [editing,setEditing]=useState(false);
  const [chatId,setChatId]=useState('');
  const [accountId,setAccountId]=useState('');
  const [secret,setSecret]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    let current=true;
    authorizedFetch(ENDPOINT,{cache:'no-store'})
      .then(async response=>{if(!response.ok)throw Error();return await response.json() as Status})
      .then(data=>{if(current){setStatus(data);setChatId(data.chatId??'');setAccountId(data.accountId??'')}})
      .catch(()=>{if(current)setFailed(true)});
    return ()=>{current=false};
  },[authorizedFetch]);

  async function send(init:RequestInit){
    setBusy(true);
    try{
      const response=await authorizedFetch(ENDPOINT,init);
      const data=await response.json() as Status&{secret?:string;error?:string};
      if(!response.ok)throw Error(data.error??'Não foi possível atualizar a conexão.');
      return data;
    }catch(error){
      toast.error(error instanceof Error?error.message:'Não foi possível atualizar a conexão.');
      return null;
    }finally{setBusy(false)}
  }

  async function connect(event:React.FormEvent){
    event.preventDefault();
    const data=await send({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:chatId.trim(),accountId:accountId||active[0]?.id})});
    if(!data?.secret)return;
    setSecret(data.secret);
    setStatus({linked:true,chatId:chatId.trim(),accountId:accountId||active[0]?.id});
    setEditing(false);
  }

  async function disconnect(){
    if(!await send({method:'DELETE'}))return;
    setStatus({linked:false});setSecret('');setEditing(false);
    toast.success('Telegram desconectado.');
  }

  async function copy(){
    try{await navigator.clipboard.writeText(secret);toast.success('Código copiado.')}
    catch{toast.error('Não foi possível copiar. Selecione o código manualmente.')}
  }

  const accountName=accounts.find(account=>account.id===status?.accountId)?.name;

  return <section className="panel telegram-panel">
    <h2>Registrar pelo Telegram</h2>
    <p className="form-hint">Envie uma mensagem como “almoço 32,50” e a despesa entra na conta escolhida, com a data de hoje.</p>
    {failed&&<p className="form-hint">Não foi possível consultar a conexão. Recarregue a página para tentar de novo.</p>}
    {secret&&<div className="telegram-secret"><b>Guarde este código na automação do bot.</b><code>{secret}</code><span className="form-hint">Ele aparece só agora. Se perder, gere outro.</span><button type="button" className="secondary" onClick={()=>void copy()}>Copiar código</button></div>}
    {status&&(status.linked&&!editing
      ?<>
        <p className="form-hint">Conectado ao chat {status.chatId}{accountName?` · despesas em ${accountName}`:' · despesas na primeira conta ativa'}.</p>
        <div className="telegram-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setEditing(true)}>Alterar ou gerar novo código</button><button type="button" className="text-button" disabled={busy} onClick={()=>void disconnect()}>Desconectar</button></div>
      </>
      :active.length
        ?<form onSubmit={event=>void connect(event)}>
          <Field label="Chat id do Telegram"><input required inputMode="numeric" pattern="-?[0-9]{1,16}" value={chatId} onChange={event=>setChatId(event.target.value)}/></Field>
          <Picker id="telegram-account" label="Conta das despesas" value={accountId||active[0].id} onChange={setAccountId} options={active.map(account=>({value:account.id,label:account.name}))}/>
          <div className="telegram-actions"><button className="primary" disabled={busy}>{status.linked?'Gerar novo código':'Conectar'}</button>{editing&&<button type="button" className="text-button" disabled={busy} onClick={()=>setEditing(false)}>Cancelar</button>}</div>
        </form>
        :<p className="form-hint">Adicione uma conta para conectar o Telegram.</p>
    )}
  </section>;
}
