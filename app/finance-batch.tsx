'use client';
import {useMemo,useState} from 'react';
import {TriangleAlert,CircleX} from '@/components/icons';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Picker,categoryOptions} from './finance-ui';
import {type State,money} from '@/lib/finance';
import {type BatchSource,BATCH_LIMIT,parseBatch,batchTransactions} from '@/lib/batch';

const example='28/10\nalmoço 32,50\nuber 18,90\n29/10 mercado 214,37';
const shortDate=(d:string)=>new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace(' de ',' ').replace('.','');

/** Many expenses at once: the text is the source of truth, and the review step only lets you fix categories. */
export function BatchForm({state,onClose,onSave,busy}:{state:State,onClose:()=>void,onSave:(s:State)=>Promise<void>,busy:boolean}){
 const sources=[...state.accounts.filter(a=>!a.archived).map(a=>({value:`account:${a.id}`,label:a.name})),...state.cards.map(c=>({value:`card:${c.id}`,label:`Cartão ${c.name}`}))];
 const [step,setStep]=useState<'write'|'review'>('write');const [text,setText]=useState('');const [sourceKey,setSourceKey]=useState(sources[0]?.value??'');const [error,setError]=useState('');
 // Keyed by line number and text, so a category fixed in review survives going back to edit other lines.
 const [overrides,setOverrides]=useState<Record<string,string>>({});
 const source=useMemo<BatchSource>(()=>{const [kind,...id]=sourceKey.split(':');return {kind:kind==='card'?'card':'account',id:id.join(':')}},[sourceKey]);
 const rows=useMemo(()=>parseBatch(text,state,source).map(r=>{const key=`${r.line}:${r.text}`;return overrides[key]?{...r,categoryId:overrides[key],key}:{...r,key}}),[text,state,source,overrides]);
 const invalid=rows.filter(r=>r.error),valid=rows.filter(r=>!r.error),total=valid.reduce((n,r)=>n+r.amount,0);
 const expenseCategories=categoryOptions(state.categories.filter(c=>c.type==='expense'));
 function review(e:React.FormEvent){e.preventDefault();setError('');if(!rows.length)return setError('Escreva pelo menos uma despesa.');if(rows.length>BATCH_LIMIT)return setError(`Lance até ${BATCH_LIMIT} despesas por vez.`);if(!sourceKey)return setError('Cadastre uma conta ou um cartão antes de lançar.');setStep('review')}
 async function submit(){setError('');try{if(invalid.length)throw Error('Volte e corrija as linhas marcadas para lançar.');await onSave({...state,transactions:[...state.transactions,...batchTransactions(valid,source)]});onClose()}catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar. Tente novamente.')}}
 const count=(n:number)=>`${n} ${n===1?'despesa':'despesas'}`;
 return <Dialog open onOpenChange={open=>!open&&!busy&&onClose()}><DialogContent className="finance-dialog batch-dialog"><DialogHeader><DialogTitle>{step==='write'?'Lançar várias despesas':'Confira antes de lançar'}</DialogTitle><DialogDescription>{step==='write'?'Uma despesa por linha, com data, descrição e valor. Você confere tudo antes de salvar.':`${count(valid.length)} somando ${money(total)} em ${sources.find(s=>s.value===sourceKey)?.label}.`}</DialogDescription></DialogHeader>
  {step==='write'?<form onSubmit={review} className="finance-form">
   <Picker label="Pago com" value={sourceKey} onChange={setSourceKey} options={sources}/>
   <label className="field"><span>Despesas</span><textarea className="batch-text" value={text} onChange={e=>setText(e.target.value)} rows={9} placeholder={example} spellCheck={false} autoFocus/></label>
   <p className="form-hint batch-hint">A data vai no começo (<b>28/10</b>, <b>ontem</b>) e vale para as linhas sem data logo abaixo. O valor fica no fim: <b>32,50</b> ou <b>1.200</b>.</p>
   {error&&<p role="alert" className="form-error">{error}</p>}
   <div className="form-footer"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit">{rows.length?`Revisar ${count(rows.length)}`:'Revisar'}</button></div>
  </form>:<div className="finance-form">
   {invalid.length>0&&<p role="alert" className="form-error">{invalid.length===1?'1 linha precisa':`${invalid.length} linhas precisam`} de ajuste. Volte e corrija para lançar.</p>}
   <ul className="batch-list">{rows.map(r=><li key={r.key} className={`batch-row${r.error?' batch-row-error':''}`}>
    {r.error?<><CircleX size={18} className="batch-row-icon"/><div className="batch-row-info"><b>Linha {r.line}: {r.text}</b><span>{r.error}</span></div></>:<>
     <span className="batch-row-date">{shortDate(r.date)}</span>
     <div className="batch-row-info"><b>{r.description}</b>{r.duplicate&&<span className="batch-row-warning"><TriangleAlert size={14}/>Já existe uma despesa igual neste dia</span>}<Picker id={`batch-category-${r.key}`} placeholder={`Categoria de ${r.description}`} value={r.categoryId} onChange={v=>setOverrides(o=>({...o,[r.key]:v}))} options={expenseCategories}/></div>
     <strong className="batch-row-amount">{money(r.amount)}</strong></>}
   </li>)}</ul>
   {error&&<p role="alert" className="form-error">{error}</p>}
   <div className="form-footer"><button type="button" className="secondary" onClick={()=>{setError('');setStep('write')}} disabled={busy}>Voltar e editar</button><button className="primary" type="button" onClick={()=>void submit()} disabled={busy||!!invalid.length||!valid.length}>{busy?'Salvando…':`Lançar ${count(valid.length)}`}</button></div>
  </div>}
 </DialogContent></Dialog>;
}
