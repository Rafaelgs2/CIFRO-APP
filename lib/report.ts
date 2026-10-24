import {type State,type Transaction,type Account,type Category,today,monthOf,addMonth,dateInMonth,monthLabel,totals,accountBalance,accountActivity,invoice,cardUsed,purchaseInstallments,accountKinds,typeLabels} from './finance.ts';

export type Slice={id:string,name:string,color:string,icon:Category['icon'],value:number,pct:number};
/** `effect` is what the row did to the sum of all accounts; `after` is that sum right after it. */
export type Row={id:string,date:string,description:string,type:Transaction['type'],typeLabel:string,amount:number,flow:'in'|'out'|'move',category:string,color:string,icon:Category['icon']|null,origin:string,notes:string,installments:number,effect:number,after:number};
export type MonthPoint={month:string,label:string,income:number,expense:number,result:number,balance:number};
export type AccountLine={name:string,kind:string,type:Account['kind'],archived:boolean,opening:number,closing:number,received:number,spent:number,transferred:number,transferIn:number};
export type GoalLine={name:string,account:string,target:number,current:number,pct:number,date:string};
export type BillLine={name:string,date:string,amount:number,type:'income'|'expense',status:string};
/** How the period's result turns into the change in account balances. */
export type Bridge={opening:number,closing:number,result:number,payments:number,purchases:number,initials:number,other:number};
type Base={generatedAt:string,start:string,end:string,label:string,income:number,expense:number,result:number,balance:number,bridge:Bridge,expenseCategories:Slice[],incomeCategories:Slice[],future:{investment:number,reserve:number},goals:GoalLine[],topExpenses:Row[],series:MonthPoint[]};
export type MonthlyReport=Base&{kind:'monthly',month:string,previous:{income:number,expense:number,result:number},daily:{date:string,balance:number}[],accounts:AccountLine[],cards:{name:string,institution:string,limit:number,used:number,total:number,paid:number,remaining:number,status:string,due:string,closing:string,items:{description:string,date:string,number:number,installments:number,amount:number}[]}[],bills:BillLine[],days:{date:string,items:Row[]}[]};
export type FullReport=Base&{kind:'full',months:number,count:number,avgIncome:number,avgExpense:number,best:MonthPoint|null,worst:MonthPoint|null,accounts:AccountLine[],byKind:{label:string,value:number}[],cards:{name:string,institution:string,limit:number,used:number,purchased:number,paid:number,future:number}[],bills:{total:number,settled:number,pending:number,overdue:number,amount:number},appendix:{month:string,label:string,items:Row[]}[]};
export type Report=MonthlyReport|FullReport;

const isExpense=(t:Transaction)=>t.type==='expense'||t.type==='purchase';
const dayBefore=(d:string)=>new Date(Date.parse(`${d}T12:00:00Z`)-864e5).toISOString().slice(0,10);
const dayAfter=(d:string)=>new Date(Date.parse(`${d}T12:00:00Z`)+864e5).toISOString().slice(0,10);
export const capitalize=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);

export function firstRecordDate(s:State){const dates=[...s.accounts.map(a=>a.date),...s.transactions.map(t=>t.date),...s.bills.map(b=>b.date),...s.cards.map(c=>`${c.initialMonth}-01`)];return dates.length?dates.reduce((a,b)=>a<b?a:b):today()}
export function monthsBetween(start:string,end:string){const out:string[]=[];for(let m=monthOf(start);m<=monthOf(end);m=addMonth(m,1))out.push(m);return out}

export function categoryBreakdown(s:State,txs:Transaction[],type:'income'|'expense'):Slice[]{
 const sums=new Map<string,number>();
 for(const t of txs)if(type==='income'?t.type==='income':isExpense(t))sums.set(t.categoryId,(sums.get(t.categoryId)??0)+t.amount);
 const total=[...sums.values()].reduce((a,b)=>a+b,0);
 return [...sums].map(([id,value])=>{const c=s.categories.find(c=>c.id===id);return {id:id||'none',name:c?.name??'Sem categoria',color:c?.color??'#93a0b5',icon:c?.icon??'other',value,pct:total?value/total*100:0}}).sort((a,b)=>b.value-a.value);
}

/** Mirrors accountBalance: a movement only counts for an account from the day that account starts. */
export function balanceEffect(s:State,t:Transaction){
 const live=(id:string)=>{const a=s.accounts.find(a=>a.id===id);return !!a&&t.date>=a.date};
 const own=live(t.accountId)?(t.type==='income'?t.amount:['expense','transfer','payment'].includes(t.type)?-t.amount:0):0;
 return own+(t.type==='transfer'&&live(t.destinationId)?t.amount:0);
}

export function toRow(s:State,t:Transaction):Row{
 const c=s.categories.find(c=>c.id===t.categoryId),account=s.accounts.find(a=>a.id===t.accountId),card=s.cards.find(c=>c.id===t.cardId),dest=s.accounts.find(a=>a.id===t.destinationId);
 const origin=t.type==='purchase'?card?.name??'Cartão':t.type==='transfer'?`${account?.name??'Conta'} → ${dest?.name??'Conta'}`:t.type==='payment'?`${account?.name??'Conta'} → ${card?.name??'Cartão'}`:account?.name??'';
 return {id:t.id,date:t.date,description:t.description,type:t.type,typeLabel:typeLabels[t.type],amount:t.amount,flow:t.type==='income'?'in':isExpense(t)?'out':'move',category:c?.name??(t.type==='transfer'?'Transferência':t.type==='payment'?'Fatura':''),color:c?.color??'#93a0b5',icon:c?.icon??null,origin,notes:t.notes,installments:t.installments,effect:balanceEffect(s,t),after:0};
}

const consolidated=(s:State,until:string)=>s.accounts.reduce((n,a)=>n+accountBalance(s,a,until),0);
/** Starting balances of accounts opened on that exact day: they enter the sum without being income. */
const opened=(s:State,day:string)=>s.accounts.filter(a=>a.date===day).reduce((n,a)=>n+a.initial,0);
/** Each day restarts from the real balance of the day before, so rounding or edge cases never drift. */
function withBalance(s:State,rows:Row[]){let run=0,day='';for(const r of rows){if(r.date!==day){day=r.date;run=consolidated(s,dayBefore(day))+opened(s,day)}run+=r.effect;r.after=run}return rows}
function bridge(s:State,start:string,end:string,txs:Transaction[],result:number):Bridge{
 const opening=consolidated(s,dayBefore(start)),closing=consolidated(s,end);
 const payments=txs.filter(t=>t.type==='payment').reduce((n,t)=>n+balanceEffect(s,t),0);
 const purchases=txs.filter(t=>t.type==='purchase').reduce((n,t)=>n+t.amount,0);
 const initials=s.accounts.filter(a=>a.date>=start&&a.date<=end).reduce((n,a)=>n+a.initial,0);
 return {opening,closing,result,payments,purchases,initials,other:closing-opening-(result+payments+purchases+initials)};
}

function point(s:State,month:string):MonthPoint{const end=dateInMonth(month,31);const x=totals(s,`${month}-01`,end);return {month,label:capitalize(monthLabel(month)),income:x.income,expense:x.expense,result:x.result,balance:consolidated(s,end)}}
function future(s:State,txs:Transaction[]){const sum=(kind:Account['kind'])=>txs.filter(t=>t.type==='transfer'&&s.accounts.find(a=>a.id===t.destinationId)?.kind===kind).reduce((n,t)=>n+t.amount,0);return {investment:sum('investment'),reserve:sum('reserve')}}
function goals(s:State,asOf:string):GoalLine[]{return s.goals.map(g=>{const a=s.accounts.find(a=>a.id===g.accountId);const current=a?accountBalance(s,a,asOf):0;return {name:g.name,account:a?.name??'',target:g.target,current,pct:Math.max(0,Math.min(100,current/g.target*100)),date:g.date}})}
function accountLines(s:State,start:string,end:string):AccountLine[]{return [...s.accounts].sort((a,b)=>a.order-b.order).map(a=>{const x=accountActivity(s,a,start,end);return {name:a.name,kind:accountKinds[a.kind],type:a.kind,archived:a.archived,opening:accountBalance(s,a,dayBefore(start)),closing:x.balance,received:x.received,spent:x.spent,transferred:x.transferred,transferIn:x.transferIn}})}
function billStatus(b:State['bills'][number],asOf:string){return b.transactionId?(b.type==='income'?'Recebida':'Paga'):b.date<asOf?'Em atraso':b.type==='income'?'A receber':'A pagar'}
const byDate=(a:Row,b:Row)=>a.date.localeCompare(b.date)||a.description.localeCompare(b.description,'pt-BR');

export function buildMonthlyReport(s:State,month:string,asOf=today()):MonthlyReport{
 const start=`${month}-01`,end=dateInMonth(month,31);const p=totals(s,start,end),prev=totals(s,`${addMonth(month,-1)}-01`,dateInMonth(addMonth(month,-1),31));
 const rows=withBalance(s,p.transactions.map(t=>toRow(s,t)).sort(byDate));const days=new Map<string,Row[]>();for(const r of rows)days.set(r.date,[...(days.get(r.date)??[]),r]);
 const daily:{date:string,balance:number}[]=[];for(let d=dayBefore(start);d<=end;d=dayAfter(d))daily.push({date:d,balance:consolidated(s,d)});
 return {kind:'monthly',month,generatedAt:asOf,start,end,label:capitalize(monthLabel(month)),income:p.income,expense:p.expense,result:p.result,balance:consolidated(s,end),bridge:bridge(s,start,end,p.transactions,p.result),daily,previous:{income:prev.income,expense:prev.expense,result:prev.result},
  accounts:accountLines(s,start,end),expenseCategories:categoryBreakdown(s,p.transactions,'expense'),incomeCategories:categoryBreakdown(s,p.transactions,'income'),future:future(s,p.transactions),
  cards:s.cards.map(c=>{const inv=invoice(s,c,month,asOf);const used=cardUsed(s,c);return {name:c.name,institution:c.institution,limit:c.limit,used,total:inv.total,paid:inv.paid,remaining:inv.remaining,status:inv.status,due:inv.due,closing:inv.closing,items:inv.items.map(i=>({description:i.transaction.description,date:i.transaction.date,number:i.number,installments:i.transaction.installments,amount:i.amount}))}}),
  bills:s.bills.filter(b=>monthOf(b.date)===month).sort((a,b)=>a.date.localeCompare(b.date)).map(b=>({name:b.name,date:b.date,amount:b.amount,type:b.type,status:billStatus(b,asOf)})),
  goals:goals(s,asOf),topExpenses:rows.filter(r=>r.flow==='out').sort((a,b)=>b.amount-a.amount).slice(0,5),series:Array.from({length:6},(_,i)=>point(s,addMonth(month,i-5))),days:[...days].map(([date,items])=>({date,items}))};
}

export function buildFullReport(s:State,asOf=today()):FullReport{
 const start=firstRecordDate(s),end=asOf<start?start:asOf;const all=totals(s,start,end);const series=monthsBetween(start,end).map(m=>point(s,m));
 const active=series.filter(m=>m.income||m.expense);const rows=withBalance(s,all.transactions.map(t=>toRow(s,t)).sort(byDate));
 const appendix=new Map<string,Row[]>();for(const r of rows)appendix.set(monthOf(r.date),[...(appendix.get(monthOf(r.date))??[]),r]);
 const accounts=accountLines(s,start,end);const kinds=new Map<string,number>();for(const a of accounts)kinds.set(a.kind,(kinds.get(a.kind)??0)+a.closing);
 const current=monthOf(asOf);
 return {kind:'full',generatedAt:asOf,start,end,label:'Desde o início',months:series.length,count:rows.length,income:all.income,expense:all.expense,result:all.result,balance:consolidated(s,end),bridge:bridge(s,start,end,all.transactions,all.result),
  avgIncome:series.length?Math.round(all.income/series.length):0,avgExpense:series.length?Math.round(all.expense/series.length):0,
  best:active.length?active.reduce((a,b)=>b.result>a.result?b:a):null,worst:active.length?active.reduce((a,b)=>b.result<a.result?b:a):null,
  series,accounts,byKind:[...kinds].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value),
  expenseCategories:categoryBreakdown(s,all.transactions,'expense'),incomeCategories:categoryBreakdown(s,all.transactions,'income'),future:future(s,all.transactions),
  cards:s.cards.map(c=>{const mine=s.transactions.filter(t=>t.cardId===c.id);return {name:c.name,institution:c.institution,limit:c.limit,used:cardUsed(s,c),purchased:mine.filter(t=>t.type==='purchase').reduce((n,t)=>n+t.amount,0),paid:mine.filter(t=>t.type==='payment').reduce((n,t)=>n+t.amount,0),future:mine.filter(t=>t.type==='purchase').flatMap(t=>purchaseInstallments(c,t)).filter(i=>i.month>current).reduce((n,i)=>n+i.amount,0)}}),
  bills:{total:s.bills.length,settled:s.bills.filter(b=>b.transactionId).length,pending:s.bills.filter(b=>!b.transactionId&&b.date>=asOf).length,overdue:s.bills.filter(b=>!b.transactionId&&b.date<asOf).length,amount:s.bills.filter(b=>!b.transactionId).reduce((n,b)=>n+(b.type==='expense'?b.amount:0),0)},
  goals:goals(s,asOf),topExpenses:rows.filter(r=>r.flow==='out').sort((a,b)=>b.amount-a.amount).slice(0,10),appendix:[...appendix].map(([month,items])=>({month,label:capitalize(monthLabel(month)),items}))};
}
