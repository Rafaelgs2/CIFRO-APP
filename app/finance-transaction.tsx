'use client';
import {Pencil,Trash2,X,Wallet,CreditCard,CalendarDays,ArrowLeftRight,ReceiptText,ShoppingBag,RotateCcw,CheckCircle2,Info,Tags,type Icon as IconType} from '@/components/icons';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {type Transaction,money,monthLabel,invoice,purchaseInstallments,typeLabels} from '@/lib/finance';
import {transactionVisual,categoryIcons} from './finance-ui';
import {type AppContext} from './finance-main';
const longDate=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
type Row={icon:IconType,label:string,value:string,color?:string};
export function confirmRemoveTx({state,save,setConfirm}:AppContext,t:Transaction,after?:()=>void){setConfirm({title:'Excluir este lançamento?',description:`“${t.description}” será removido e os saldos serão recalculados. Um compromisso vinculado voltará a ficar pendente.`,action:async()=>{await save({...state,transactions:state.transactions.filter(x=>x.id!==t.id),bills:state.bills.map(b=>b.transactionId===t.id?{...b,transactionId:''}:b)});after?.()}})}
export function TransactionDetails({context:c,id,onClose}:{context:AppContext,id:string,onClose:()=>void}){
 const {state,open}=c;
 const t=state.transactions.find(x=>x.id===id);
 if(!t)return null;
 const {Icon,color,cat}=transactionVisual(state,t);
 const account=state.accounts.find(x=>x.id===t.accountId);
 const destination=state.accounts.find(x=>x.id===t.destinationId);
 const card=state.cards.find(x=>x.id===t.cardId);
 const bill=state.bills.find(b=>b.transactionId===t.id);
 const sign=t.type==='income'?'+ ':['expense','purchase','payment'].includes(t.type)?'− ':'';
 const installments=t.type==='purchase'&&card?purchaseInstallments(card,t):[];
 const rows:Row[]=[
  ...(cat?[{icon:categoryIcons[cat.icon]??Tags,label:'Categoria',value:cat.name,color:cat.color}]:[]),
  {icon:CalendarDays,label:'Data',value:longDate(t.date)},
  ...(t.type==='transfer'?[{icon:ArrowLeftRight,label:'Transferência',value:`${account?.name??'—'} → ${destination?.name??'—'}`}]:[]),
  ...(t.type==='purchase'||t.type==='payment'?[{icon:CreditCard,label:'Cartão',value:card?.name??'—'}]:[]),
  ...(t.type!=='transfer'&&t.type!=='purchase'?[{icon:Wallet,label:t.type==='payment'?'Pago com':t.type==='income'?'Recebido em':'Conta',value:account?.name??'—'}]:[]),
  ...(t.type==='payment'&&t.invoiceMonth?[{icon:ReceiptText,label:'Fatura',value:monthLabel(t.invoiceMonth)}]:[]),
  ...(t.type==='purchase'?[{icon:ShoppingBag,label:'Pagamento',value:t.installments>1?`${t.installments}× de ${money(installments[0]?.amount??t.amount)}`:'À vista'}]:[]),
  ...(t.recurring?[{icon:RotateCcw,label:'Repetição',value:'Recorrente todo mês'}]:[]),
  ...(bill?[{icon:CheckCircle2,label:'Compromisso vinculado',value:bill.name}]:[]),
 ];
 function edit(){onClose();open({kind:'transaction',id:t!.id,type:t!.type})}
 return <Dialog open onOpenChange={o=>!o&&onClose()}><DialogContent showCloseButton={false} className="finance-dialog tx-detail" style={{'--tx-color':color} as React.CSSProperties}>
  <div className="tx-detail-toolbar">
   <button className="tx-round-button" aria-label="Editar lançamento" onClick={edit}><Pencil size={18}/></button>
   <button className="tx-round-button is-danger" aria-label="Excluir lançamento" onClick={()=>confirmRemoveTx(c,t,onClose)}><Trash2 size={18}/></button>
   <DialogClose className="tx-round-button" aria-label="Fechar"><X size={18}/></DialogClose>
  </div>
  <header className="tx-detail-hero">
   <span className="tx-detail-icon"><Icon size={28}/></span>
   <span className="tx-detail-chip">{typeLabels[t.type]}</span>
   <DialogTitle>{t.description}</DialogTitle>
   <strong className="tx-detail-amount">{sign}{money(t.amount)}</strong>
   <DialogDescription className="sr-only">Detalhes do lançamento</DialogDescription>
  </header>
  <ul className="tx-detail-card">{rows.map(r=><li key={r.label}><span className="tx-row-icon" style={r.color?{color:r.color}:undefined}><r.icon size={18}/></span><span><small>{r.label}</small><b>{r.value}</b></span></li>)}</ul>
  {installments.length>1&&<section className="tx-detail-section"><h3>Parcelas</h3><ol className="tx-detail-card tx-installments">{installments.map(i=>{const status=invoice(state,card!,i.month).status;return <li key={i.number} className={status==='Paga'?'is-paid':''}><span className="tx-installment-number">{i.number}/{t.installments}</span><span><b>Fatura de {monthLabel(i.month)}</b><small>{status}</small></span><strong>{money(i.amount)}</strong></li>})}</ol></section>}
  {t.notes&&<section className="tx-detail-section"><h3><Info size={14}/> Observações</h3><p className="tx-detail-notes">{t.notes}</p></section>}
 </DialogContent></Dialog>;
}
