'use client';

import {useEffect,useState} from 'react';
import {toast} from 'sonner';
import {Check,CircleHelp,Send} from '@/components/icons';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Skeleton} from '@/components/ui/skeleton';
import {BrandSymbol} from './brand';
import {Picker} from './finance-ui';
import type {Confirmation} from './finance-main';
import type {Account} from '@/lib/finance';

type Status={linked:boolean;chatId?:string;accountId?:string};
type Fetcher=(input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;

const ENDPOINT='/api/telegram/link';
const POLL_MS=3000;
// Matches the link lifetime in start_telegram_link.
const LINK_LIFETIME_MS=15*60*1000;

function TelegramHelp({account,onClose}:{account:string;onClose:()=>void}){
  return <Dialog open onOpenChange={open=>!open&&onClose()}>
    <DialogContent className="finance-dialog telegram-help">
      <DialogHeader>
        <DialogTitle>Como funciona</DialogTitle>
        <DialogDescription>Registre um gasto em uma mensagem, sem abrir o app.</DialogDescription>
      </DialogHeader>
      <div className="telegram-help-body">
        <ol className="telegram-steps">
          <li><span>1</span><div><b>Mande o gasto</b><p>Escreva a descrição e o valor, como <strong>almoço 32,50</strong>. Os centavos são opcionais.</p></div></li>
          <li><span>2</span><div><b>O CIFRO registra</b><p>A despesa entra em {account} com a data de hoje. A categoria é escolhida pela descrição.</p></div></li>
          <li><span>3</span><div><b>Confira a resposta</b><p>O bot confirma a conta e a categoria. Se precisar, ajuste em Lançamentos. Sem resposta, a despesa não foi registrada.</p></div></li>
        </ol>
        <figure className="telegram-phone" role="img" aria-label={`Exemplo de conversa: você envia almoço 32,50 e o bot confirma o registro em ${account}, na categoria Alimentação.`}>
          <div className="telegram-phone-screen">
            <span className="telegram-phone-notch"/>
            <div className="telegram-phone-header"><span className="telegram-phone-avatar"><BrandSymbol/></span><span><b>CIFRO</b><small>bot</small></span></div>
            <div className="telegram-phone-chat">
              <p className="telegram-bubble telegram-sent">almoço 32,50</p>
              <p className="telegram-bubble">✅ Registrado: almoço - R$ 32,50 em {account} (Alimentação)</p>
              <p className="telegram-bubble telegram-sent">uber 18,90</p>
              <p className="telegram-bubble">✅ Registrado: uber - R$ 18,90 em {account} (Transporte)</p>
            </div>
            <div className="telegram-phone-input"><span>Mensagem</span><span className="telegram-phone-send"><Send size={13}/></span></div>
          </div>
        </figure>
      </div>
    </DialogContent>
  </Dialog>;
}

export function TelegramLink({accounts,authorizedFetch,setConfirm}:{accounts:Account[];authorizedFetch:Fetcher;setConfirm:(confirmation:Confirmation)=>void}){
  const active=accounts.filter(account=>!account.archived);
  const [status,setStatus]=useState<Status|null>(null);
  const [failed,setFailed]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const [editing,setEditing]=useState(false);
  const [accountId,setAccountId]=useState('');
  const [linkUrl,setLinkUrl]=useState('');
  const [linkExpired,setLinkExpired]=useState(false);
  const [busy,setBusy]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);

  useEffect(()=>{
    let current=true;
    authorizedFetch(ENDPOINT,{cache:'no-store'})
      .then(async response=>{if(!response.ok)throw Error();return await response.json() as Status})
      .then(data=>{if(current){setStatus(data);setAccountId(data.accountId??'')}})
      .catch(()=>{if(current)setFailed(true)});
    return ()=>{current=false};
  },[authorizedFetch,attempt]);

  // The confirmation happens in Telegram, so the app waits for the link to appear.
  useEffect(()=>{
    if(!linkUrl)return;
    const startedAt=Date.now();
    const timer=setInterval(()=>{
      if(Date.now()-startedAt>LINK_LIFETIME_MS){setLinkUrl('');setLinkExpired(true);return;}
      authorizedFetch(ENDPOINT,{cache:'no-store'})
        .then(async response=>{
          if(!response.ok)return;
          const data=await response.json() as Status;
          if(!data.linked)return;
          setStatus(data);setAccountId(data.accountId??'');setLinkUrl('');
          toast.success('Telegram conectado.');
        })
        .catch(()=>{});
    },POLL_MS);
    return ()=>clearInterval(timer);
  },[linkUrl,authorizedFetch]);

  async function request(init:RequestInit){
    const response=await authorizedFetch(ENDPOINT,init);
    const data=await response.json() as Status&{url?:string;error?:string};
    if(!response.ok)throw Error(data.error??'Não foi possível atualizar a conexão.');
    return data;
  }

  async function connect(event:React.FormEvent){
    event.preventDefault();
    setBusy(true);setLinkExpired(false);
    try{
      const data=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:accountId||active[0]?.id})});
      if(!data.url)throw Error('Não foi possível gerar o link.');
      setLinkUrl(data.url);
    }catch(error){
      toast.error(error instanceof Error?error.message:'Não foi possível gerar o link.');
    }finally{setBusy(false)}
  }

  async function saveAccount(event:React.FormEvent){
    event.preventDefault();
    const chosen=accountId||active[0]?.id;
    setBusy(true);
    try{
      await request({method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:chosen})});
      setStatus({linked:true,chatId:status?.chatId,accountId:chosen});
      setEditing(false);
      toast.success('Conta das despesas atualizada.');
    }catch(error){
      toast.error(error instanceof Error?error.message:'Não foi possível alterar a conta.');
    }finally{setBusy(false)}
  }

  function disconnect(){
    setConfirm({
      title:'Desconectar o Telegram?',
      description:'As mensagens enviadas ao bot deixam de virar lançamentos. Os lançamentos já registrados continuam.',
      action:async()=>{
        await request({method:'DELETE'});
        setStatus({linked:false});setEditing(false);
        toast.success('Telegram desconectado.');
      },
    });
  }

  function cancelEditing(){setAccountId(status?.accountId??'');setEditing(false)}
  function retry(){setFailed(false);setAttempt(value=>value+1)}

  const linked=Boolean(status?.linked);
  const linkedAccount=active.find(account=>account.id===status?.accountId);
  const exampleAccount=linkedAccount?.name??active.find(account=>account.id===accountId)?.name??active[0]?.name??'sua conta';
  const accountPicker=active.length>0&&<Picker id="telegram-account" label="Conta das despesas" value={active.some(account=>account.id===accountId)?accountId:active[0].id} onChange={setAccountId} options={active.map(account=>({value:account.id,label:account.name}))}/>;

  function body(){
    if(failed)return <div className="telegram-state"><p className="form-error" role="alert">Não foi possível consultar a conexão.</p><button type="button" className="secondary" onClick={retry}>Tentar de novo</button></div>;
    if(!status)return <div className="telegram-state" aria-label="Consultando a conexão"><Skeleton className="h-11 w-full"/><Skeleton className="h-11 w-full"/></div>;
    if(linked&&editing)return <form className="telegram-form" onSubmit={event=>void saveAccount(event)}>
      {accountPicker}
      <div className="telegram-actions">
        <button className="primary" disabled={busy}>{busy?'Salvando…':'Salvar'}</button>
        <button type="button" className="text-button" disabled={busy} onClick={cancelEditing}>Cancelar</button>
      </div>
    </form>;
    if(linked)return <div className="telegram-summary">
      <dl className="telegram-details">
        <div><dt>Chat</dt><dd>{status.chatId}</dd></div>
        <div><dt>Conta das despesas</dt><dd>{linkedAccount?.name??'Primeira conta ativa'}</dd></div>
      </dl>
      <div className="telegram-actions">
        <button type="button" className="secondary" disabled={!active.length} onClick={()=>setEditing(true)}>Trocar conta</button>
        <button type="button" className="text-button" onClick={disconnect}>Desconectar</button>
      </div>
    </div>;
    if(linkUrl)return <div className="telegram-pending" role="status">
      <span className="telegram-kicker">FALTA UM PASSO</span>
      <p>Abra o bot e toque em <strong>Iniciar</strong>. Esta tela atualiza sozinha quando a conexão ficar pronta.</p>
      <p className="form-hint">O link vale por 15 minutos e só funciona uma vez. Não compartilhe.</p>
      <div className="telegram-actions">
        <a className="primary" href={linkUrl} target="_blank" rel="noreferrer">Abrir no Telegram</a>
        <button type="button" className="text-button" onClick={()=>setLinkUrl('')}>Cancelar</button>
      </div>
    </div>;
    if(!active.length)return <p className="form-hint">Adicione uma conta para conectar o Telegram.</p>;
    return <form className="telegram-form" onSubmit={event=>void connect(event)}>
      {accountPicker}
      {linkExpired&&<p className="form-hint">O link anterior expirou. Gere outro para continuar.</p>}
      <div className="telegram-actions">
        <button className="primary" disabled={busy}>{busy?'Gerando link…':'Conectar Telegram'}</button>
      </div>
    </form>;
  }

  return <section className="panel telegram-panel" aria-labelledby="telegram-title">
    <header className="telegram-heading">
      <span className="icon-badge blue-soft"><Send size={20}/></span>
      <div>
        <div className="telegram-title"><h2 id="telegram-title">Registrar pelo Telegram</h2>{linked&&<span className="status-pill telegram-status"><Check size={12} aria-hidden="true"/>Conectado</span>}</div>
        <p>Mande o gasto em uma mensagem e ele vira um lançamento na conta escolhida, com a data de hoje.</p>
      </div>
      <button type="button" className="icon-button telegram-help-button" aria-label="Como funciona o registro pelo Telegram" onClick={()=>setHelpOpen(true)}><CircleHelp size={20}/></button>
    </header>
    <div className="telegram-main">{body()}</div>
    {helpOpen&&<TelegramHelp account={exampleAccount} onClose={()=>setHelpOpen(false)}/>}
  </section>;
}
