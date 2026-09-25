'use client';

import {FormEvent,useState} from 'react';
import {ArrowRight,CalendarDays,Check,CreditCard,Landmark,Target} from 'lucide-react';
import {MoneyInput} from './money-input';
import {today,type State} from '@/lib/finance';

type PresentationStep='cards'|'commitments'|'goals';
const presentations:{id:PresentationStep;eyebrow:string;title:string;description:string;detail:string;icon:typeof CreditCard}[]=[
  {id:'cards',eyebrow:'CARTÕES',title:'Tudo do cartão em um só lugar',description:'Acompanhe limite, fechamento, vencimento e parcelas sem depender de anotações espalhadas.',detail:'Quando quiser, cadastre seus cartões e consulte cada fatura.',icon:CreditCard},
  {id:'commitments',eyebrow:'COMPROMISSOS',title:'Antecipe o que está por vir',description:'Organize contas a pagar e a receber para enxergar os próximos dias com mais clareza.',detail:'Você confirma pagamentos e recebimentos somente quando acontecerem.',icon:CalendarDays},
  {id:'goals',eyebrow:'METAS',title:'Dê um destino ao seu dinheiro',description:'Vincule uma meta a uma conta e acompanhe o progresso pelo saldo que você já tem.',detail:'Crie metas quando estiver pronto — não precisamos delas agora.',icon:Target},
];

export function Onboarding({state,onSaveAccount,onComplete}:{state:State;onSaveAccount:(account:{name:string;initial:number;date:string})=>Promise<void>;onComplete:()=>Promise<void>}){
  const [step,setStep]=useState<'account'|PresentationStep>(()=>state.accounts.length?'cards':'account');
  const [name,setName]=useState('Conta principal');
  const [initial,setInitial]=useState(0);
  const [date,setDate]=useState(today());
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const presentationIndex=presentations.findIndex(item=>item.id===step);

  async function saveAccount(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const trimmed=name.trim();
    if(!trimmed){setError('Dê um nome para a sua conta.');return;}
    setBusy(true);setError('');
    try{await onSaveAccount({name:trimmed,initial,date});setStep('cards');}
    catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível criar a conta. Tente novamente.');}
    finally{setBusy(false);}
  }

  async function finish(){
    setBusy(true);setError('');
    try{await onComplete();}
    catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível concluir a apresentação. Tente novamente.');setBusy(false);}
  }

  if(step==='account')return <section className="onboarding" aria-labelledby="onboarding-title">
    <div className="onboarding-card onboarding-account-card">
      <span className="onboarding-icon"><Landmark aria-hidden="true"/></span>
      <p className="onboarding-eyebrow">VAMOS COMEÇAR</p>
      <h1 id="onboarding-title">Crie sua primeira conta</h1>
      <p className="onboarding-copy">Ela é a base para acompanhar seu saldo, criar metas e organizar seus compromissos.</p>
      <form className="onboarding-form" onSubmit={saveAccount}>
        <label className="field" htmlFor="onboarding-account-name"><span>Nome da conta</span><input id="onboarding-account-name" value={name} onChange={event=>setName(event.target.value)} maxLength={100} autoFocus required/></label>
        <label className="field"><span>Saldo inicial</span><MoneyInput label="Saldo inicial" value={initial} onChange={setInitial}/><small>Informe o saldo de hoje. R$ 0,00 também é válido.</small></label>
        <label className="field" htmlFor="onboarding-account-date"><span>Data de referência</span><input id="onboarding-account-date" type="date" value={date} onChange={event=>setDate(event.target.value)} required/></label>
        {error&&<p className="form-error" role="alert">{error}</p>}
        <button className="primary onboarding-submit" type="submit" disabled={busy}>{busy?'Criando conta…':<>Criar conta <ArrowRight aria-hidden="true" size={18}/></>}</button>
      </form>
    </div>
  </section>;

  const current=presentations[presentationIndex];
  const Icon=current.icon;
  const last=presentationIndex===presentations.length-1;
  return <section className="onboarding" aria-labelledby="onboarding-title">
    <div className="onboarding-card onboarding-presentation-card">
      <button className="onboarding-skip" type="button" disabled={busy} onClick={()=>void finish()}>Pular apresentação</button>
      <div className="onboarding-progress" aria-label={`Etapa ${presentationIndex+1} de ${presentations.length}`}>{presentations.map((item,index)=><i key={item.id} className={index<=presentationIndex?'active':''}/>)}</div>
      <span className="onboarding-icon"><Icon aria-hidden="true"/></span>
      <p className="onboarding-eyebrow">{current.eyebrow}</p>
      <h1 id="onboarding-title">{current.title}</h1>
      <p className="onboarding-copy">{current.description}</p>
      <p className="onboarding-detail">{current.detail}</p>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <button className="primary onboarding-submit" type="button" disabled={busy} onClick={()=>void (last?finish():setStep(presentations[presentationIndex+1].id))}>{busy?'Finalizando…':last?<>Ir para o painel <Check aria-hidden="true" size={18}/></>:<>Continuar <ArrowRight aria-hidden="true" size={18}/></>}</button>
    </div>
  </section>;
}
