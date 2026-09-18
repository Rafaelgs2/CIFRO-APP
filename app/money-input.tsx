'use client';

import {useRef} from 'react';

const formatter=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const maxCents=99999999999;
const clamp=(value:number)=>Math.min(maxCents,Math.max(0,Math.trunc(value)));

/** Converts typed or pasted currency text to the integer cents used by the domain. */
export function currencyTextToCents(value:string,allowNegative=false){
 const cents=clamp(Number(value.replace(/\D/g,'')||0));
 return allowNegative&&value.includes('-')?-cents:cents;
}

export function MoneyInput({label,value,onChange,allowNegative=false}:{label:string,value:number,onChange:(cents:number)=>void,allowNegative?:boolean}){
 const inputRef=useRef<HTMLInputElement>(null);
 const currentValue=useRef(value);
 const selectionIsAll=useRef(false);
 const negative=allowNegative&&value<0;
 const display=formatter.format(Math.abs(value)/100);
 const commit=(next:number)=>{currentValue.current=next;onChange(next);};
 const allSelected=()=>selectionIsAll.current;
 return <div className="money-input"><span aria-hidden="true">R$</span><input ref={inputRef} aria-label={label} required type="text" inputMode="numeric" autoComplete="off" value={`${negative?'-':''}${display}`} onSelect={event=>{selectionIsAll.current=event.currentTarget.selectionStart===0&&event.currentTarget.selectionEnd===event.currentTarget.value.length;}} onKeyDown={event=>{
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  const current=currentValue.current;
  const isNegative=allowNegative&&current<0;
  if(/^\d$/.test(event.key)){event.preventDefault();const cents=allSelected()?Number(event.key):clamp(Math.abs(current)*10+Number(event.key));selectionIsAll.current=false;commit((isNegative?-1:1)*cents);return;}
  if(event.key==='Backspace'||event.key==='Delete'){event.preventDefault();const selected=allSelected();selectionIsAll.current=false;commit(selected?0:(isNegative?-1:1)*Math.trunc(Math.abs(current)/10));return;}
  if(allowNegative&&event.key==='-'){event.preventDefault();commit(-current);return;}
  if(event.key.length===1)event.preventDefault();
 }} onPaste={event=>{event.preventDefault();commit(currencyTextToCents(event.clipboardData.getData('text'),allowNegative));}} onChange={event=>commit(currencyTextToCents(event.target.value,allowNegative))}/></div>;
}
