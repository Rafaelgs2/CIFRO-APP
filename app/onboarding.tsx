'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,CheckCircle2,Circle,CreditCard,Landmark,LayoutDashboard,ReceiptText,Target} from 'lucide-react';
import {AccountFormFields,type AccountFormValue} from './account-form-fields';
import {Brand} from './brand';
import {today,type State} from '@/lib/finance';

type Stage='welcome'|'setup'|'complete';
type ResourceId='transactions'|'cards'|'planning';

const resources:[ResourceId,string,string,typeof ReceiptText][]=[
  ['transactions','Lançamentos','Registre receitas e despesas e mantenha seus saldos sempre atualizados.',ReceiptText],
  ['cards','Cartões','Acompanhe limites, ciclos, parcelas e pagamentos de fatura.',CreditCard],
  ['planning','Planejamento','Organize compromissos e acompanhe metas no mesmo lugar.',Target],
];

const resourceDetails:Record<ResourceId,{eyebrow:string;title:string;description:string;points:string[]}>= {
  transactions:{eyebrow:'DIA A DIA',title:'Seu dinheiro, sempre explicado',description:'Cada movimentação atualiza automaticamente a conta escolhida e alimenta sua visão mensal.',points:['Receitas, despesas e transferências','Categorias prontas para começar','Busca e filtros para revisar depois']},
  cards:{eyebrow:'CARTÕES',title:'Faturas sem planilhas paralelas',description:'Cadastre seus cartões quando quiser e acompanhe cada compra no ciclo correto.',points:['Limite disponível e valor usado','Fechamento e vencimento da fatura','Compras parceladas nos próximos meses']},
  planning:{eyebrow:'PRÓXIMOS PASSOS',title:'Planeje sem complicar o presente',description:'Compromissos e metas são opcionais. Use quando fizer sentido para sua rotina.',points:['Contas a pagar e a receber','Confirmação manual de pagamentos','Metas vinculadas ao saldo de uma conta']},
};

export function Onboarding({state,onSaveAccount,onComplete}:{state:State;onSaveAccount:(account:AccountFormValue)=>Promise<void>;onComplete:()=>Promise<void>}){
  const hasAccount=state.accounts.length>0;
  const [stage,setStage]=useState<Stage>(()=>hasAccount?'setup':'welcome');
  const [selectedResource,setSelectedResource]=useState<ResourceId>('transactions');
  const [viewedResources,setViewedResources]=useState<ResourceId[]>([]);
  const [account,setAccount]=useState<AccountFormValue>({name:'Conta principal',kind:'salary',initial:0,date:today()});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const headingRef=useRef<HTMLHeadingElement>(null);

  const activeStep=stage==='welcome'?0:stage==='complete'?3:hasAccount?2:1;
  const progress=(activeStep+1)*25;
  const detail=resourceDetails[selectedResource];

  useEffect(()=>{headingRef.current?.focus();},[stage]);

  function updateAccount<Key extends keyof AccountFormValue>(key:Key,value:AccountFormValue[Key]){
    setAccount(current=>({...current,[key]:value}));
  }

  async function saveAccount(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!account.name.trim()){setError('Dê um nome para a sua conta.');return;}
    setBusy(true);setError('');
    try{await onSaveAccount({...account,name:account.name.trim()});}
    catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível criar a conta. Tente novamente.');}
    finally{setBusy(false);}
  }

  async function finish(){
    setBusy(true);setError('');
    try{await onComplete();}
    catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível concluir a configuração. Tente novamente.');setBusy(false);}
  }

  function selectResource(id:ResourceId){
    setSelectedResource(id);
    setViewedResources(current=>current.includes(id)?current:[...current,id]);
  }

  const configured:Record<ResourceId,boolean>={transactions:state.transactions.length>0,cards:state.cards.length>0,planning:state.bills.length>0||state.goals.length>0};
  const steps=['Boas-vindas','Sua primeira conta','Conheça o Cifro','Tudo pronto'];

  return <section className="onboarding" aria-label="Configuração inicial do Cifro">
    <div className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <Brand className="onboarding-brand"/>
        <div className="onboarding-progress-copy"><span>Configuração inicial</span><b>{progress}% concluído</b></div>
        <div className="onboarding-progress-track" role="progressbar" aria-label="Progresso da configuração" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:`${progress}%`}}/></div>
        <ol className="onboarding-steps">
          {steps.map((label,index)=>{
            const done=index<activeStep;
            const current=index===activeStep;
            return <li key={label} className={done?'done':current?'current':''} aria-current={current?'step':undefined}>{done?<CheckCircle2 aria-hidden="true"/>:<Circle aria-hidden="true"/>}<span><small>0{index+1}</small>{label}</span></li>;
          })}
        </ol>
        <p className="onboarding-sidebar-note">Você pode configurar os recursos opcionais mais tarde.</p>
      </aside>

      <main className="onboarding-main">
        {stage==='welcome'&&<div className="onboarding-welcome">
          <span className="onboarding-icon"><LayoutDashboard aria-hidden="true"/></span>
          <p className="onboarding-eyebrow">BEM-VINDO AO CIFRO</p>
          <h1 ref={headingRef} tabIndex={-1}>Clareza para cuidar melhor do seu dinheiro.</h1>
          <p className="onboarding-copy">Organize contas, lançamentos, cartões e planos em uma visão simples da sua vida financeira.</p>
          <div className="onboarding-welcome-points" aria-label="O que você vai configurar"><span><Check aria-hidden="true"/>Crie sua primeira conta</span><span><Check aria-hidden="true"/>Conheça os recursos essenciais</span></div>
          <button className="primary onboarding-primary" type="button" onClick={()=>setStage('setup')}>Começar configuração <ArrowRight aria-hidden="true" size={18}/></button>
        </div>}

        {stage==='setup'&&<div className="onboarding-setup">
          <header className="onboarding-heading">
            <div><p className="onboarding-eyebrow">PRIMEIROS PASSOS</p><h1 ref={headingRef} tabIndex={-1}>{hasAccount?'Sua base está pronta.':'Vamos preparar sua base.'}</h1><p>{hasAccount?'Conheça o que o Cifro pode organizar para você.':'Comece pela conta que você mais usa. Leva menos de um minuto.'}</p></div>
            <span className={`onboarding-status ${hasAccount?'complete':''}`}>{hasAccount?<><CheckCircle2 aria-hidden="true"/>Conta criada</>:<>1 etapa essencial</>}</span>
          </header>

          {!hasAccount?<section className="onboarding-account" aria-labelledby="account-setup-title">
            <div className="onboarding-section-title"><span className="onboarding-feature-icon"><Landmark aria-hidden="true"/></span><div><p>ETAPA ESSENCIAL</p><h2 id="account-setup-title">Crie sua primeira conta</h2><span>Ela será o ponto de partida dos seus saldos e lançamentos.</span></div></div>
            <form className="onboarding-form" onSubmit={saveAccount}>
              <AccountFormFields value={account} onChange={updateAccount}/>
              {error&&<p className="form-error" role="alert">{error}</p>}
              <button className="primary onboarding-submit" type="submit" disabled={busy}>{busy?'Criando conta…':<>Criar minha conta <ArrowRight aria-hidden="true" size={18}/></>}</button>
            </form>
          </section>:<>
            <section className="onboarding-account-summary" aria-label="Primeira conta configurada"><span className="onboarding-feature-icon success"><Check aria-hidden="true"/></span><div><p>CONTA CONFIGURADA</p><h2>{state.accounts[0].name}</h2><span>Seu saldo inicial já está protegido no Cifro.</span></div><CheckCircle2 aria-hidden="true"/></section>

            <section className="onboarding-resources" aria-labelledby="resources-title">
              <div className="onboarding-resources-heading"><div><p className="onboarding-eyebrow">RECURSOS ESSENCIAIS</p><h2 id="resources-title">Veja o que você pode fazer agora</h2></div><span>Opcional</span></div>
              <div className="onboarding-resource-layout">
                <div className="onboarding-resource-menu">
                  {resources.map(([id,title,description,Icon])=>{
                    const seen=viewedResources.includes(id);
                    return <button type="button" key={id} className={selectedResource===id?'active':''} aria-pressed={selectedResource===id} onClick={()=>selectResource(id)}><span className="onboarding-feature-icon"><Icon aria-hidden="true"/></span><span><b>{title}</b><small>{description}</small></span><em className={configured[id]||seen?'done':''}>{configured[id]?'Configurado':seen?'Visto':'Conhecer'}</em></button>;
                  })}
                </div>
                <article className="onboarding-resource-detail" aria-live="polite">
                  <p>{detail.eyebrow}</p><h3>{detail.title}</h3><span>{detail.description}</span>
                  <ul>{detail.points.map(point=><li key={point}><Check aria-hidden="true"/>{point}</li>)}</ul>
                </article>
              </div>
            </section>
            {error&&<p className="form-error" role="alert">{error}</p>}
            <footer className="onboarding-actions"><button className="secondary" type="button" onClick={()=>setStage('welcome')}>Voltar</button><button className="primary" type="button" onClick={()=>setStage('complete')}>Concluir configuração <ArrowRight aria-hidden="true" size={18}/></button></footer>
          </>}
        </div>}

        {stage==='complete'&&<div className="onboarding-complete">
          <span className="onboarding-complete-icon"><Check aria-hidden="true"/></span>
          <p className="onboarding-eyebrow">CONFIGURAÇÃO CONCLUÍDA</p>
          <h1 ref={headingRef} tabIndex={-1}>Tudo pronto para começar.</h1>
          <p className="onboarding-copy">Sua conta está configurada. Agora você pode registrar movimentações e adaptar o Cifro ao seu ritmo.</p>
          <div className="onboarding-ready-card"><Landmark aria-hidden="true"/><span><small>SUA PRIMEIRA CONTA</small><b>{state.accounts[0]?.name}</b></span><CheckCircle2 aria-label="Configurada"/></div>
          {error&&<p className="form-error" role="alert">{error}</p>}
          <div className="onboarding-complete-actions"><button className="secondary" type="button" disabled={busy} onClick={()=>setStage('setup')}>Revisar</button><button className="primary" type="button" disabled={busy} onClick={()=>void finish()}>{busy?'Abrindo seu painel…':<>Entrar no Cifro <ArrowRight aria-hidden="true" size={18}/></>}</button></div>
        </div>}
      </main>
    </div>
  </section>;
}
