'use client';
import {useEffect,useState,useRef,useCallback,useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {ChevronLeft,ChevronRight,Search,SlidersHorizontal,Info,ArrowRight,X} from '@/components/icons';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {AppToaster} from './theme-controls';
import {toast} from 'sonner';
import {type Account,type State,type Transaction,emptyState,demoState,validateState,today,monthOf,monthLabel,addMonth,dateInMonth,invoice,purchaseInstallments,typeLabels,searchKey} from '@/lib/finance';
import {getSupabaseBrowserClient} from '@/lib/supabase/browser';
import {Picker,Field,categoryOptions} from './finance-ui';
import FinanceForm,{type Modal} from './finance-form';
import FinanceViews,{Details} from './finance-views';
import {TransactionDetails} from './finance-transaction';
import {FinanceShell,type QuickAction} from './finance-shell';
import {FinanceDashboard} from './finance-dashboard';
import {FinanceLoading} from './finance-loading';
import {Onboarding} from './onboarding';
export type View='home'|'transactions'|'planning'|'reports'|'profile'|'accounts'|'cards'|'categories'|'closing';
export type Confirmation={title:string,description:string,action:()=>Promise<void>};
export type AppContext={state:State,view:View,month:string,demo:boolean,filtered:Transaction[],start:string,end:string,open:(m:Modal)=>void,save:(s:State)=>Promise<void>,navigate:(v:View)=>void,transaction:(t?:Transaction['type'])=>void,viewTx:(t:Transaction)=>void,setConfirm:(c:Confirmation)=>void,selectAccount:(id:string)=>void,selectCard:(id:string,month?:string)=>void,switchDemo:()=>void,exitDemo:()=>void,signOut:()=>Promise<void>,filters:()=>React.ReactNode};
const titles:Record<View,string>={home:'Visão geral',transactions:'Lançamentos',planning:'Planejamento',reports:'Relatórios',profile:'Perfil',accounts:'Contas',cards:'Cartões',categories:'Categorias',closing:'Fechamento mensal'};
const monthNames=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const periodLabel=(month:string)=>monthLabel(month).replace(' de ',' ');
export default function FinanceApp(){
 const router=useRouter();
 const [state,setState]=useState<State>(emptyState);const [revision,setRevision]=useState(0);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [demo,setDemo]=useState(false);const [busy,setBusy]=useState(false);const [onboardingCompleted,setOnboardingCompleted]=useState(true);const lock=useRef(false);const [view,setView]=useState<View>('home');const [month,setMonth]=useState(monthOf(today()));const [hide,setHide]=useState(false);const [modal,setModal]=useState<Modal|null>(null);const [accountId,setAccountId]=useState<string|null>(null);const [cardId,setCardId]=useState<string|null>(null);const [detailMonth,setDetailMonth]=useState<string|null>(null);const [txId,setTxId]=useState<string|null>(null);const [confirm,setConfirm]=useState<Confirmation|null>(null);const [search,setSearch]=useState('');const [filtersOpen,setFiltersOpen]=useState(false);const [typeFilter,setTypeFilter]=useState('all');const [categoryFilter,setCategoryFilter]=useState('all');const [accountFilter,setAccountFilter]=useState('all');const [cardFilter,setCardFilter]=useState('all');const [statusFilter,setStatusFilter]=useState('all');const [startDate,setStartDate]=useState('');const [endDate,setEndDate]=useState('');
 const [monthPickerOpen,setMonthPickerOpen]=useState(false);const [pickerYear,setPickerYear]=useState(Number(month.slice(0,4)));const monthPickerRef=useRef<HTMLDivElement>(null);
 const start=startDate||`${month}-01`,end=endDate||dateInMonth(month,31);
 function setPeriod(next:string){setMonth(next);setStartDate('');setEndDate('')}
 const authorizedFetch=useCallback(async(input:RequestInfo|URL,init?:RequestInit)=>{const supabase=getSupabaseBrowserClient();const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sua sessão expirou. Entre novamente.');const headers=new Headers(init?.headers);headers.set('Authorization',`Bearer ${session.access_token}`);const response=await fetch(input,{...init,headers});if(response.status===401){await supabase.auth.signOut({scope:'local'});router.replace('/login');throw Error('Sua sessão expirou. Entre novamente.');}return response;},[router]);
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await authorizedFetch('/api/finance',{cache:'no-store'});const data=await r.json() as {state:State,revision:number,onboardingCompleted?:boolean,error:string};if(!r.ok)throw Error(data.error);setState(data.state);setRevision(data.revision);setOnboardingCompleted(data.onboardingCompleted??true);}catch(e){setError(e instanceof Error?e.message:'Não foi possível carregar.');}finally{setLoading(false)}},[authorizedFetch]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 useEffect(()=>{const handler=()=>{const hash=location.hash.slice(1);if(hash in titles)setView(hash as View)};handler();window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
 useEffect(()=>{if(!monthPickerOpen)return;const close=(event:MouseEvent)=>{if(!monthPickerRef.current?.contains(event.target as Node))setMonthPickerOpen(false)};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMonthPickerOpen(false)};document.addEventListener('mousedown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',escape)}},[monthPickerOpen]);
 function navigate(v:View){setView(v);location.hash=v;window.scrollTo({top:0,behavior:'instant'});}
 async function save(next:State){if(lock.current)throw Error('Aguarde o salvamento em andamento.');next=validateState(next);lock.current=true;setBusy(true);try{if(demo){setState(next);toast.success('Alteração feita na demonstração');return;}const r=await authorizedFetch('/api/finance',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:next,revision})});const data=await r.json() as {state:State,revision:number,error:string};
  // Another session saved first. The open form reads state from props, so after the reload it saves on top of the newer data; a pending confirmation captured the stale state and would overwrite it, so it closes instead.
  if(r.status===409){setConfirm(null);await load();throw Error('Seus dados mudaram em outra aba e esta tela foi atualizada. Confira e salve de novo.');}
  if(!r.ok)throw Error(data.error);setState(data.state);setRevision(data.revision);toast.success('Salvo com sucesso');}finally{setBusy(false);lock.current=false}}
 function open(m:Modal){if(!demo&&(loading||error)){toast.error('Carregue seus dados antes de fazer alterações.');return;}setModal(m)}
 function transaction(type:Transaction['type']='expense'){if(!state.accounts.length&&type!=='purchase'){toast('Primeiro, adicione uma conta para registrar a movimentação.');open({kind:'account'});return;}if(type==='purchase'&&!state.cards.length){open({kind:'card'});return;}open({kind:'transaction',type})}
 function createQuick(action:QuickAction){if(action==='account')open({kind:'account'});else if(action==='card')open({kind:'card'});else transaction(action)}
 function switchDemo(){setDemo(true);setState(demoState(monthOf(today())));setMonth(monthOf(today()));setError('');setLoading(false);navigate('home');toast('Dados fictícios. As alterações na demonstração não são salvas.');}
 async function exitDemo(){setDemo(false);setState(emptyState());await load();navigate('home')}
 async function signOut(){try{await getSupabaseBrowserClient().auth.signOut({scope:'local'});setState(emptyState());router.replace('/login');}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível sair da conta.');}}
 async function createOnboardingAccount(account:Pick<Account,'name'|'kind'|'initial'|'date'>){await save({...state,accounts:[...state.accounts,{id:crypto.randomUUID(),...account,archived:false,order:state.accounts.length}]});}
 async function completeOnboarding(){const response=await authorizedFetch('/api/onboarding',{method:'POST'});const data=await response.json() as {error?:string};if(!response.ok)throw Error(data.error??'Não foi possível concluir a apresentação.');setOnboardingCompleted(true);}
 function viewTx(t:Transaction){setTxId(t.id)}
 function resetFilters(){setSearch('');setTypeFilter('all');setCategoryFilter('all');setAccountFilter('all');setCardFilter('all');setStatusFilter('all');setStartDate('');setEndDate('')}
 const filtered=useMemo(()=>{
  const query=searchKey(search.trim());
  const invoiceStatuses=new Map<string,string>();
  const statusFor=(cardId:string,invoiceMonth:string)=>{
   const key=`${cardId}:${invoiceMonth}`;
   const cached=invoiceStatuses.get(key);
   if(cached)return cached;
   const card=state.cards.find(item=>item.id===cardId);
   if(!card)return null;
   const status=invoice(state,card,invoiceMonth).status;
   invoiceStatuses.set(key,status);
   return status;
  };
  return state.transactions.filter(transaction=>{
   const category=state.categories.find(item=>item.id===transaction.categoryId);
   const text=searchKey(`${transaction.description} ${category?.name??''} ${transaction.notes}`);
   if(transaction.date<start||transaction.date>end||!text.includes(query))return false;
   if(typeFilter!=='all'&&transaction.type!==typeFilter)return false;
   if(categoryFilter!=='all'&&transaction.categoryId!==categoryFilter)return false;
   if(accountFilter!=='all'&&transaction.accountId!==accountFilter&&transaction.destinationId!==accountFilter)return false;
   if(cardFilter!=='all'&&transaction.cardId!==cardFilter)return false;
   if(statusFilter==='all')return true;
   if(!transaction.cardId)return false;
   if(transaction.type==='payment')return statusFor(transaction.cardId,transaction.invoiceMonth)===statusFilter;
   if(transaction.type!=='purchase')return false;
   const card=state.cards.find(item=>item.id===transaction.cardId);
   if(!card||!purchaseInstallments(card,transaction).some(part=>part.month===month))return false;
   return statusFor(transaction.cardId,month)===statusFilter;
  });
 },[state,start,end,search,typeFilter,categoryFilter,accountFilter,cardFilter,statusFilter,month]);
 function filters(){return <><div className="filter-bar"><div className="search-box"><Search size={18}/><input aria-label="Pesquisar lançamentos" placeholder="Buscar" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Limpar pesquisa" onClick={()=>setSearch('')}><X size={16}/></button>}</div><button className={`secondary ${filtersOpen?'selected':''}`} onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> Filtros</button></div>{filtersOpen&&<div className="filters-panel"><Picker label="Tipo" value={typeFilter} onChange={setTypeFilter} options={[{value:'all',label:'Todos os tipos'},...Object.entries(typeLabels).map(([value,label])=>({value,label}))]}/><Picker label="Categoria" value={categoryFilter} onChange={setCategoryFilter} options={[{value:'all',label:'Todas as categorias'},...categoryOptions(state.categories)]}/><Picker label="Conta" value={accountFilter} onChange={setAccountFilter} options={[{value:'all',label:'Todas as contas'},...state.accounts.map(a=>({value:a.id,label:a.name}))]}/><Picker label="Cartão" value={cardFilter} onChange={setCardFilter} options={[{value:'all',label:'Todos os cartões'},...state.cards.map(c=>({value:c.id,label:c.name}))]}/><Picker label="Situação da fatura no mês" value={statusFilter} onChange={setStatusFilter} options={['all','Em aberto','Paga','Parcialmente paga','Em atraso'].map(v=>({value:v,label:v==='all'?'Todas as situações':v}))}/><Field label="De"><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></Field><Field label="Até"><input type="date" min={startDate} value={endDate} onChange={e=>setEndDate(e.target.value)}/></Field><button className="text-button" onClick={resetFilters}>Limpar filtros</button></div>}{start>end&&<p role="alert" className="form-error">A data inicial deve ser anterior à data final.</p>}</>}
 const context:AppContext={state,view,month,demo,filtered,start,end,open,save,navigate,transaction,viewTx,setConfirm,selectAccount:setAccountId,selectCard:(id,m)=>{setCardId(id);setDetailMonth(m??null)},switchDemo,exitDemo:()=>void exitDemo(),signOut,filters};
 return <><AppToaster/><FinanceShell view={view} navigate={navigate} name={state.profile.name} title={titles[view]} onCreate={createQuick}>
 {demo&&<div className="demo-banner"><span><Info size={16}/><b>Demonstração</b><span>Dados fictícios. Alterações temporárias.</span></span><button onClick={()=>void exitDemo()}>Usar meus dados <ArrowRight size={15}/></button></div>}
 {error&&!demo&&<div className="error-banner" role="alert"><span>{error}</span><button onClick={()=>void load()}>Tentar novamente</button></div>}
 {loading&&!demo?<FinanceLoading/>:<div className="page-content" key={view} data-view={view}>
  <div className="page-heading"><div><h1>{view==='home'&&state.profile.name?`Olá, ${state.profile.name}.`:titles[view]}</h1><p className="muted">{view==='home'?'Acompanhe saldos, despesas e compromissos do mês.':view==='transactions'?'Registre, pesquise e revise suas movimentações.':view==='planning'?'Acompanhe compromissos e metas.':view==='reports'?'Compare receitas, despesas e resultados do período.':view==='closing'?'Confira os números do período antes de encerrar o mês.':'Gerencie suas informações financeiras.'}</p></div>{!['profile','categories','accounts'].includes(view)&&<div className="month-picker" ref={monthPickerRef}><button aria-label="Mês anterior" onClick={()=>setPeriod(addMonth(month,-1))}><ChevronLeft size={18}/></button><button className="month-picker-current" aria-expanded={monthPickerOpen} aria-haspopup="dialog" onClick={()=>{setPickerYear(Number(month.slice(0,4)));setMonthPickerOpen(!monthPickerOpen)}}>{periodLabel(month)}</button><button aria-label="Próximo mês" onClick={()=>setPeriod(addMonth(month,1))}><ChevronRight size={18}/></button>{monthPickerOpen&&<div className="month-picker-popover" role="dialog" aria-label="Selecionar mês"><div className="month-picker-year"><button aria-label="Ano anterior" onClick={()=>setPickerYear(year=>year-1)}><ChevronLeft size={17}/></button><strong>{pickerYear}</strong><button aria-label="Próximo ano" onClick={()=>setPickerYear(year=>year+1)}><ChevronRight size={17}/></button></div><div className="month-picker-grid">{monthNames.map((name,index)=>{const value=`${pickerYear}-${String(index+1).padStart(2,'0')}`;return <button key={name} className={value===month?'selected':''} aria-pressed={value===month} onClick={()=>{setPeriod(value);setMonthPickerOpen(false)}}>{name}</button>})}</div></div>}</div>}</div>

 {view==='home'?<FinanceDashboard context={context} hidden={hide} onToggleValues={()=>setHide(!hide)}/>:<FinanceViews context={context}/>}
 </div>}
 </FinanceShell>
 {!loading&&!error&&!demo&&!onboardingCompleted&&<Onboarding state={state} onSaveAccount={createOnboardingAccount} onComplete={completeOnboarding}/>}
 {modal&&<FinanceForm key={`${modal.kind}-${modal.id??modal.type??'new'}`} modal={modal} state={state} onClose={()=>setModal(null)} onSave={save} busy={busy}/>}
 <AlertDialog open={!!confirm} onOpenChange={o=>!o&&!busy&&setConfirm(null)}><AlertDialogContent><AlertDialogTitle>{confirm?.title}</AlertDialogTitle><AlertDialogDescription>{confirm?.description}</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={async e=>{e.preventDefault();try{await confirm?.action();setConfirm(null)}catch(err){toast.error(err instanceof Error?err.message:'Não foi possível concluir.')}}}>{busy?'Salvando…':'Confirmar'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 {(accountId||cardId)&&<Details context={context} accountId={accountId} cardId={cardId} initialMonth={detailMonth??month} onClose={()=>{setAccountId(null);setCardId(null);setDetailMonth(null)}}/>}
 {txId&&<TransactionDetails context={context} id={txId} onClose={()=>setTxId(null)}/>}
 </>
}
