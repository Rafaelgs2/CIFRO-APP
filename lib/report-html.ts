import {money,accountKinds} from './finance.ts';
import {type Report,type MonthlyReport,type FullReport,type Slice,type Row,type MonthPoint,type AccountLine,type GoalLine,type Bridge} from './report.ts';

export type RenderOptions={name:string,demo:boolean,origin:string};

/** Every string that came from the user goes through here: the report opens on the app's own origin. */
export const esc=(v:unknown)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]!);
const date=(d:string)=>new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR');
const dayMonth=(d:string)=>new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
const dayTitle=(d:string)=>{const s=new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});return s.charAt(0).toUpperCase()+s.slice(1)};
const shortMonth=(m:string)=>new Date(`${m}-15T12:00:00`).toLocaleDateString('pt-BR',{month:'short'}).replace('.','');
const dayBefore=(d:string)=>new Date(Date.parse(`${d}T12:00:00Z`)-864e5).toISOString().slice(0,10);
const pct=(v:number|null)=>v===null?'—':`${v.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`;
const signed=(v:number)=>`${v>0?'+':v<0?'−':''}${money(Math.abs(v))}`;
const compact=(v:number,sign=true)=>`${v<0?'−':sign&&v>0?'+':''}${new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(Math.abs(v)/100)}`;
const tone=(v:number)=>v>0?'pos':v<0?'neg':'';
const meta=(...parts:(string|false|null|undefined)[])=>parts.filter(Boolean).join(' · ');
const plural=(n:number,one:string,many:string)=>`${n.toLocaleString('pt-BR')} ${n===1?one:many}`;
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(100,v)):0;
const lower=(label:string)=>label.split(' ')[0].toLowerCase();

/** Category colors are user data: anything that is not a plain hex falls back to neutral. */
const color=(c:string)=>/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)?c:'#93a0b5';
const rgb=(c:string)=>{let h=color(c).slice(1);if(h.length===3)h=[...h].map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
/** Icon badges follow the app: a light wash of the category color behind a deeper stroke of it. */
const badge=(icon:string,c='#92989a')=>{const [r,g,b]=rgb(c);const d=[r,g,b].map((v,i)=>Math.round(v*.7+[26,31,43][i]*.3));return `<span class="badge" style="--bg:rgb(${r} ${g} ${b}/.18);--fg:rgb(${d.join(' ')})">${ico(icon)}</span>`};
const kinds:Record<AccountLine['type'],{icon:string,color:string}>={salary:{icon:'wallet',color:'#245cdc'},vr:{icon:'food',color:'#3d9b8b'},investment:{icon:'trend',color:'#a18bd5'},reserve:{icon:'shield',color:'#edab62'},other:{icon:'bank',color:'#93a0b5'}};

const logo=(id:string)=>`<span class="logo" role="img" aria-label="CIFRO"><svg class="logo-symbol" viewBox="0 0 120 88" fill="none" aria-hidden="true"><defs><linearGradient id="${id}b" x1="62" y1="0" x2="99" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="#39a6ff"/><stop offset="1" stop-color="#066bff"/></linearGradient><linearGradient id="${id}f" x1="14" y1="30" x2="76" y2="65" gradientUnits="userSpaceOnUse"><stop stop-color="#066bff"/><stop offset="1" stop-color="#003bd1"/></linearGradient></defs><path d="M34 28C41 10 55 2 72 2C98 2 118 23 118 51V78Q118 86 110 86H88Q80 86 80 78V56C80 42 69 32 55 32Z" fill="url(#${id}b)"/><path d="M2 64C2 39 22 25 43 25C61 25 74 33 79 45C55 39 42 56 42 78Q42 86 34 86H10Q2 86 2 78Z" fill="url(#${id}f)"/></svg><svg class="logo-word" viewBox="-2 -2 264 66" fill="currentColor" aria-hidden="true"><path d="M49.506 10.494A29 29 0 1 0 49.506 51.506L39.607 41.607A15 15 0 1 1 39.607 20.393Z"/><rect x="55" y="2" width="14" height="58" rx="2"/><path d="M79 60V27C79 10 89 2 104 2H125V10Q125 16 119 16H105Q94 16 94 27H119V40H94V60Z"/><path d="M132 2H157C177 2 183 12 183 24C183 35 177 40 169 43L185 60H165L147 39V60H132V30H157Q169 30 169 24Q169 16 157 16H142Q132 16 132 6Z"/><path fill-rule="evenodd" d="M224 1A30 30 0 1 1 224 61A30 30 0 1 1 224 1ZM224 15A16 16 0 1 0 224 47A16 16 0 1 0 224 15Z"/></svg></span>`;

// The app's own icon set (components/icons.tsx), copied as markup because the report is a standalone file:
// a translucent plane under a crisp stroke, plus an occasional solid dot.
const P='fill="currentColor" fill-opacity=".32" stroke="none"',D='fill="currentColor" stroke="none"';
const ICONS:Record<string,string>={
 home:`<path ${P} d="M5 20V11.5a7 7 0 0 1 14 0V20Z"/><path d="M5 20V11.5a7 7 0 0 1 14 0V20M3 20h18M10 20v-3.5a2 2 0 0 1 4 0V20"/><circle ${D} cx="12" cy="10" r="1.25"/>`,
 food:`<circle ${P} cx="14.5" cy="13.5" r="6.5"/><circle cx="14.5" cy="13.5" r="3.25"/><path d="M4 3.5V8a2 2 0 0 0 4 0V3.5M6 3.5v4M6 10v10.5"/>`,
 car:`<path ${P} d="M8.3 10.7l1.5-2.2a1.2 1.2 0 0 1 1-.5h3.9c.4 0 .7.2.9.5l1.7 2.2Z"/><path d="M5.2 17H4a1 1 0 0 1-1-1v-2.6a2 2 0 0 1 1.4-1.9L7 10.7l2-3a2 2 0 0 1 1.7-.9h4.2a2 2 0 0 1 1.6.8l2.4 3.1 1.7.5a2 2 0 0 1 1.4 1.9V16a1 1 0 0 1-1 1h-1.2M9.8 17h4.4"/><circle cx="7.5" cy="17" r="2.2"/><circle cx="16.5" cy="17" r="2.2"/>`,
 fun:`<circle ${P} cx="12" cy="12" r="8.5"/><path d="M3.5 12A8.5 8.5 0 0 1 12 3.5M10 8.6v6.8a.6.6 0 0 0 .9.5l5.6-3.4a.6.6 0 0 0 0-1L10.9 8.1a.6.6 0 0 0-.9.5Z"/><circle ${D} cx="19.6" cy="4.4" r="1.3"/>`,
 work:`<path ${P} d="M3 12.5V10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2.5Z"/><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h7M14 12.5h7"/><circle ${D} cx="12" cy="12.5" r="1.4"/>`,
 gift:`<path ${P} d="M12 9H7a2.5 2.5 0 0 0-2.5 2.5V18A2.5 2.5 0 0 0 7 20.5h5Z"/><rect x="4.5" y="9" width="15" height="11.5" rx="2.5"/><path d="M12 9v11.5M12 9C10.5 5.5 7 5.3 7 7.4 7 8.6 8.6 9 12 9c3.4 0 5-.4 5-1.6 0-2.1-3.5-1.9-5 1.6"/>`,
 health:`<path ${P} d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10ZM3 13h3.5L8 10.5l2.5 5 2-3.5H21"/>`,
 other:`<circle ${P} cx="8" cy="8" r="4.75"/><rect x="11.5" y="11.5" width="9" height="9" rx="2.5"/><circle ${D} cx="18" cy="6" r="1.6"/>`,
 card:`<rect ${P} x="7" y="4" width="14" height="10" rx="3"/><rect x="3" y="9.5" width="15" height="10.5" rx="3"/><path d="M3 13.5h15M10.5 16.8h4"/><circle ${D} cx="7" cy="16.8" r="1.1"/>`,
 wallet:`<path ${P} d="M20.5 11h-5a2.5 2.5 0 0 0 0 5h5Z"/><rect x="3.5" y="6.5" width="17" height="13.5" rx="3"/><path d="M20.5 11h-5a2.5 2.5 0 0 0 0 5h5M6.5 6.5l8.9-2.5a1.5 1.5 0 0 1 1.9 1.1l.4 1.4"/><circle ${D} cx="15.6" cy="13.5" r="1"/>`,
 trend:`<path ${P} d="M3 17l5.5-5.5 3.5 3 8-8V20H3Z"/><path d="M3 17l5.5-5.5 3.5 3 8-8M15 6.5h5v5"/>`,
 shield:`<path ${P} d="M12 3.5 5 6.3v5.2c0 4.3 2.9 7.7 7 9Z"/><path d="M12 3.5l7 2.8v5.2c0 4.3-2.9 7.7-7 9-4.1-1.3-7-4.7-7-9V6.3ZM9 12.2l2 2 4-4.2"/>`,
 bank:`<path ${P} d="M3.5 9.5 12 4l8.5 5.5Z"/><path d="M3.5 9.5 12 4l8.5 5.5ZM6.5 12.5V17M12 12.5V17M17.5 12.5V17M4 20h16"/><circle ${D} cx="12" cy="7.6" r="1"/>`,
 target:`<circle ${P} cx="11" cy="13" r="4.5"/><circle cx="11" cy="13" r="8"/><path d="M11 13l7.5-7.5M16.5 3.5v4h4"/><circle ${D} cx="11" cy="13" r="1.6"/>`,
 calendar:`<circle ${P} cx="15.5" cy="15.3" r="3.2"/><rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M8 3v4M16 3v4M3.5 10h17"/><circle ${D} cx="15.5" cy="15.3" r="1.25"/><circle ${D} cx="8.5" cy="13.6" r=".9"/><circle ${D} cx="8.5" cy="17.1" r=".9"/>`,
 income:`<path ${P} d="M3 13a8 8 0 0 1 8 8H3Z"/><path d="M8 16 19 5M11 5h8v8"/>`,
};
const sprite=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k,v])=>`<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</svg>`;
const ico=(name:string)=>`<svg class="i" aria-hidden="true"><use href="#i-${ICONS[name]?name:'other'}"/></svg>`;

/** State is a drawn mark next to its word, so it still reads when printed without color. */
const MARKS={done:'<path d="M3 8.5 6.5 12 13 4.5"/>',late:'<path d="M4 14.5V2.5"/><path d="M4 3h8.5l-2 3 2 3H4"/>',part:'<circle cx="8" cy="8" r="5.5"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11Z" fill="currentColor" stroke="none"/>',open:'<circle cx="8" cy="8" r="5.5"/>'};
const status=(s:string)=>{const k=/atraso/i.test(s)?'late':/^(paga|recebida)$/i.test(s)?'done':/parcial/i.test(s)?'part':'open';return `<span class="pill pill-${k}"><svg viewBox="0 0 16 16" aria-hidden="true">${MARKS[k]}</svg>${esc(s)}</span>`};

/** The sentence beside the result. Positive: how much of the income was left over. Negative: how much the spending used up. */
export function resultNote(result:number,income:number,expense:number){
 if(!income&&!expense)return 'Sem movimentação no período';
 if(result<0)return income?`Gastou ${pct(expense/income*100)} do que entrou`:'Sem receitas no período';
 return `Sobrou ${pct(result/income*100)} do que entrou`;
}

// Building blocks: glass panels on the stone ground, the same rows, badges and pills as the app.
const empty=(text:string)=>`<p class="empty">${text}</p>`;
const panel=(id:string,title:string,desc:string,body:string,cls='')=>`<section class="panel ${cls}" id="${id}" aria-labelledby="${id}-t"><h2 id="${id}-t">${title}</h2>${desc?`<p class="desc">${desc}</p>`:''}${body}</section>`;
const bar=(value:number,cls='')=>`<span class="meter ${cls}"><i style="width:${clamp(value).toFixed(1)}%"></i></span>`;
const facts=(items:([string,string,string?]|false|null)[])=>`<dl class="facts">${items.filter(Boolean).map(i=>{const [k,v,c]=i as [string,string,string?];return `<div><dt>${k}</dt><dd class="${c??''}">${v}</dd></div>`}).join('')}</dl>`;

/**
 * The signature of the report: the sum of all accounts drawn over time. Steps for days (a balance only
 * moves when money does), a line for months. Numbered marks tie the biggest moves to the list beside it.
 */
type Mark={i:number,v:number,n:number};
function chart(values:number[],o:{step:boolean,labels:{i:number,text:string,now?:boolean}[],marks:Mark[],cut:number|null,cutLabel:string,aria:string}){
 const L=8,R=352,T=18,B=180,n=values.length;
 const lo0=Math.min(...values),hi0=Math.max(...values);
 const raw=Math.max(hi0-lo0,Math.abs(hi0)*.2,10000)/3,mag=10**Math.floor(Math.log10(raw)),step=[1,2,5,10].map(m=>m*mag).find(s=>s>=raw)!;
 const lo=Math.floor(lo0/step)*step,hi=Math.max(Math.ceil(hi0/step)*step,lo+step);
 const x=(i:number)=>n<2?(L+R)/2:L+i/(n-1)*(R-L),y=(v:number)=>B-(v-lo)/(hi-lo)*(B-T),f=(v:number)=>v.toFixed(2);
 const path=(a:number,b:number)=>values.slice(a,b+1).map((v,k)=>{const i=a+k;return k===0?`M${f(x(i))} ${f(y(v))}`:o.step?`H${f(x(i))}V${f(y(v))}`:`L${f(x(i))} ${f(y(v))}`}).join('');
 const last=o.cut===null?n-1:Math.max(0,Math.min(n-1,o.cut));
 // The baseline keeps its rule but not its label: the starting value is written right above it.
 const grid:string[]=[];for(let v=lo;v<=hi+1;v+=step)grid.push(`<path d="M${L} ${f(y(v))}H${R}" stroke="#e8ebe6"/>${v>lo?`<text class="c-t" x="${L}" y="${f(y(v)-4)}">${compact(v,false)}</text>`:''}`);
 const cutX=o.cut===null?null:x(last);
 const ex=x(last),ey=y(values[last]),endAnchor=ex<150?'start':'end',endX=ex<150?ex+8:ex-6,endY=ey-9<T+6?ey+17:ey-9;
 const sy=y(values[0]),startY=sy+17<=B-6?sy+17:sy-9;
 const placed:{x:number,y:number}[]=[];
 const marks=o.marks.map(m=>{let mx=x(m.i);const my=y(m.v);while(placed.some(p=>Math.abs(p.x-mx)<16&&Math.abs(p.y-my)<16))mx+=16;placed.push({x:mx,y:my});return `<circle cx="${f(mx)}" cy="${f(my)}" r="7.5" fill="#232728"/><text class="c-n" x="${f(mx)}" y="${f(my+3.4)}" text-anchor="middle">${m.n}</text>`}).join('');
 const labels=o.labels.map(l=>`<text class="c-t${l.now?' now':''}" x="${f(x(l.i))}" y="${B+15}" text-anchor="${l.i===0&&n>1?'start':l.i===n-1&&n>1?'end':'middle'}">${l.text}</text>`).join('');
 const h=cutX===null?200:214;
 return `<figure class="chart"><svg viewBox="0 0 360 ${h}" role="img" aria-label="${esc(o.aria)}"><defs><pattern id="hz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" stroke="#dfe3dd" stroke-width="1.5"/></pattern></defs>
<g stroke-width="1">${grid.join('')}</g>
${cutX!==null&&cutX<R?`<rect x="${f(cutX)}" y="${T-10}" width="${f(R-cutX)}" height="${B-T+10}" fill="url(#hz)"/>${R-cutX>64?`<text class="c-t" x="${f((cutX+R)/2)}" y="${T+2}" text-anchor="middle">ainda por vir</text>`:''}`:''}
<path d="${path(0,last)}V${B}H${f(x(0))}Z" fill="#245cdc" fill-opacity=".09"/><path d="${path(0,last)}" fill="none" stroke="#245cdc" stroke-width="2.2" stroke-linejoin="round"/>
${last<n-1?`<path d="${path(last,n-1)}" fill="none" stroke="#245cdc" stroke-width="1.6" stroke-dasharray="3 4" stroke-opacity=".55"/>`:''}
${cutX!==null?`<path d="M${f(cutX)} ${T-10}V${B}" stroke="#245cdc" stroke-width="1.2" stroke-dasharray="3 3"/><text class="c-t now" x="${f(Math.min(Math.max(cutX,L+40),R-40))}" y="${B+30}" text-anchor="middle">${o.cutLabel}</text>`:''}
<path d="M${L} ${B}H${R}" stroke="#232728" stroke-width="1.2"/>
<circle cx="${f(x(0))}" cy="${f(sy)}" r="3.5" fill="#245cdc"/><circle cx="${f(ex)}" cy="${f(ey)}" r="4" fill="#245cdc" stroke="#fff" stroke-width="2"/>
${n>1?`<text class="c-v" x="${f(x(0)+6)}" y="${f(startY)}">${money(values[0])}</text>`:''}<text class="c-v" x="${f(endX)}" y="${f(endY)}" text-anchor="${endAnchor}">${money(values[last])}</text>
${marks}${labels}</svg></figure>`;
}
const stepRow=(n:number,title:string,note:string,value:string,cls:string,after:string)=>`<div class="step"><span class="num">${n}</span><p>${title}<small>${note}</small></p><b class="${cls}">${value}<small>${after}</small></b></div>`;

function monthlyChart(r:MonthlyReport){
 if(!r.accounts.length)return empty('Cadastre uma conta para acompanhar o saldo ao longo do mês.');
 const values=r.daily.map(d=>d.balance),last=values.length-1,asOf=r.generatedAt;
 const cut=asOf<r.start?0:asOf<r.end?Number(asOf.slice(8,10)):null;
 const labels=[1,5,10,15,20,25,last].filter((d,i,l)=>l.indexOf(d)===i&&(cut===null||Math.abs(d-cut)>2)).map(i=>({i,text:String(i),now:false}));
 if(cut)labels.push({i:cut,text:String(cut),now:true});
 const rows=r.days.flatMap(d=>d.items);const big=r.topExpenses[0];
 const moves=rows.filter(m=>m.effect).sort((a,b)=>Math.abs(b.effect)-Math.abs(a.effect)).slice(0,3).sort((a,b)=>rows.indexOf(a)-rows.indexOf(b));
 const marks=moves.map((m,k)=>({i:Number(m.date.slice(8,10)),v:m.after-m.effect/2,n:k+1}));
 const note=(m:Row)=>m.type==='payment'?`${dayMonth(m.date)} · pagamento de fatura, não é despesa nova`:m.flow==='move'?`${dayMonth(m.date)} · ${esc(m.origin)}`:`${dayMonth(m.date)} · ${meta(m.category&&esc(m.category),m.origin!==m.category&&m.origin&&esc(m.origin))}`;
 const steps=moves.map((m,k)=>stepRow(k+1,`${esc(m.description)}${m.id===big?.id?', a maior despesa':''}`,note(m),signed(m.effect),m.flow==='move'?'':tone(m.effect),`saldo ${money(m.after)}`)).join('');
 const chartHtml=chart(values,{step:true,labels,marks,cut,cutLabel:`gerado em ${date(asOf).slice(0,5)}`,aria:`Saldo em contas: ${money(values[0])} em ${date(r.daily[0].date)} e ${money(values[last])} em ${date(r.end)}.`});
 return `<div class="chart-grid">${chartHtml}<div class="steps">${steps||empty('Nenhum lançamento mexeu no saldo neste mês.')}</div></div>`;
}
function fullChart(r:FullReport){
 if(!r.accounts.length)return empty('Cadastre uma conta para acompanhar o saldo.');
 const s=r.series,values=s.map(p=>p.balance),n=s.length;
 if(n<2)return `<p class="desc">O gráfico aparece a partir do segundo mês acompanhado. Saldo em contas hoje: <b>${money(r.balance)}</b>.</p>`;
 const every=Math.ceil(n/7);
 const picks=[...s.keys()].filter(i=>i%every===0&&n-1-i>=Math.ceil(every/2)).concat(n-1);
 const labels=picks.map(i=>({i,text:`${shortMonth(s[i].month)}${i===0||i===n-1||s[i].month.endsWith('-01')?`/${s[i].month.slice(2,4)}`:''}`}));
 const delta=(i:number)=>values[i]-values[i-1];
 const moves=s.map((p,i)=>({p,i})).filter(({i})=>i>0&&delta(i)).sort((a,b)=>Math.abs(delta(b.i))-Math.abs(delta(a.i))).slice(0,3).sort((a,b)=>a.i-b.i);
 const marks=moves.map(({i},k)=>({i:i-.5,v:(values[i-1]+values[i])/2,n:k+1}));
 const steps=moves.map(({p,i},k)=>stepRow(k+1,esc(p.label),`o saldo ${delta(i)>0?'subiu':'caiu'} ${money(Math.abs(delta(i)))} no mês`,signed(delta(i)),tone(delta(i)),`saldo ${money(p.balance)}`)).join('');
 const chartHtml=chart(values,{step:false,labels,marks,cut:null,cutLabel:'',aria:`Saldo em contas ao fim de cada mês: ${money(values[0])} em ${s[0].label} e ${money(values[n-1])} em ${s[n-1].label}.`});
 return `<div class="chart-grid">${chartHtml}<div class="steps">${steps||empty('O saldo não mudou de um mês para o outro.')}</div></div>`;
}

/** Spells out why the balance moved differently from the result; shown only when it did. */
function why(b:Bridge,monthly:boolean,hasAccounts:boolean){
 const move=b.closing-b.opening;if(!hasAccounts||move===b.result)return '';
 const lines:[string,number][]=[[monthly?'Resultado do mês':'Resultado acumulado',b.result],['Faturas de cartão pagas',b.payments],['Compras no cartão, que só saem da conta ao pagar a fatura',b.purchases],[monthly?'Saldo inicial de contas abertas no mês':'Saldos iniciais das contas',b.initials],['Outros ajustes',b.other]];
 return `<aside class="why" aria-labelledby="why-t"><h2 id="why-t">Por que o saldo ${move>=0?'subiu':'caiu'} ${money(Math.abs(move))} e o resultado foi ${signed(b.result)}?</h2><p>O resultado conta as despesas pela data da compra. O saldo só muda quando o dinheiro entra ou sai das contas.${b.initials?' O saldo inicial de uma conta entra no saldo, mas não é receita.':''}</p><div class="eq">${lines.filter(([,v],i)=>i===0||v).map(([k,v])=>`<span>${k}</span><span>${signed(v)}</span>`).join('')}<span class="t">Quanto o saldo mudou</span><span class="t">${signed(move)}</span></div></aside>`;
}

function cats(list:Slice[],emptyText:string){
 if(!list.length)return empty(emptyText);
 return list.map(s=>`<div class="cat" style="--c:${color(s.color)}">${badge(s.icon,s.color)}<div class="cat-body"><p>${esc(s.name)} <small>${pct(s.pct)}</small></p>${bar(s.pct)}</div><b>${money(s.value)}</b></div>`).join('');
}
function categories(r:Report){
 const m=r.kind==='monthly';const big=r.topExpenses[0];
 let compare='';if(m){const prev=r.series.at(-2);const diff=r.result-r.previous.result;compare=` Comparado a ${prev?esc(lower(prev.label)):'o mês anterior'}, o resultado ${diff>0?'melhorou':diff<0?'piorou':'ficou igual'}${diff?` ${money(Math.abs(diff))}`:''}.`}
 return `<div class="cols" id="categorias">${panel('saiu','Pra onde foi',`${money(r.expense)} em despesas.${big?` Maior despesa: ${esc(big.description)}, ${money(big.amount)}.`:''}`,cats(r.expenseCategories,m?'Nenhuma despesa neste mês.':'Nenhuma despesa registrada.'))}${panel('entrou','De onde veio',`${money(r.income)} em receitas.${compare}`,cats(r.incomeCategories,m?'Nenhuma receita neste mês.':'Nenhuma receita registrada.'))}</div><p class="fine">Despesas incluem compras no cartão pela data da compra. Transferências e pagamentos de fatura não entram no resultado.</p>`;
}

/** Months mirrored on one axis: what came in rises above it, what went out hangs below. */
function mirror(series:MonthPoint[],now?:string){
 const max=Math.max(0,...series.flatMap(p=>[p.income,p.expense]));const n=series.length;const sm=Math.ceil(n/6),lg=Math.ceil(n/12);
 if(!max)return empty('Nenhuma entrada ou saída nesses meses.');
 const h=(v:number)=>`${(v/max*100).toFixed(2)}%`;
 return `<div class="hist${now?'':' solid'}">${series.map((p,i)=>{const last=i===n-1;return `<div class="hc${p.month===now?' now':''}" title="${esc(p.label)}: entrou ${money(p.income)}, saiu ${money(p.expense)}, resultado ${signed(p.result)}"><div class="hu">${p.income?`<i style="height:${h(p.income)}"></i>`:''}</div><div class="hd">${p.expense?`<i style="height:${h(p.expense)}"></i>`:''}</div><span class="hl ${i%sm&&!last?'hide-sm ':''}${i%lg&&!last?'hide-lg':''}">${shortMonth(p.month)}<b class="${tone(p.result)||'z'}">${compact(p.result)}</b></span></div>`}).join('')}</div><p class="fine">Maior valor do período: ${money(max)}.</p>`;
}

function accountTile(a:AccountLine,was:string|null){
 const k=kinds[a.type]??kinds.other;const delta=a.closing-a.opening;
 const other=a.closing-(a.opening+a.received+a.transferIn-a.spent-a.transferred);
 const lines:[string,number,string][]=[['Entradas',a.received,'pos'],['Saídas',-a.spent,'neg'],['Transferências e faturas',-a.transferred,''],['Transferências recebidas',a.transferIn,''],[a.opening?'Ajustes de saldo':'Saldo de abertura',other,'']];
 const shown=lines.filter(([,v])=>v);
 return `<article class="tile">${badge(k.icon,k.color)}<h3>${esc(a.name)}${a.archived?' <small>arquivada</small>':''}</h3>${a.kind!==a.name?`<small class="kind">${esc(a.kind)}</small>`:''}<strong>${money(a.closing)}</strong>${was?`<span class="was">era ${money(a.opening)} ${was}</span><span class="delta ${tone(delta)}">${delta?signed(delta):'sem mudança'}</span>`:''}${shown.length?`<ul>${shown.map(([l,v,c])=>`<li>${l}<b class="${c}">${signed(v)}</b></li>`).join('')}</ul>`:''}</article>`;
}
const accounts=(list:AccountLine[],was:string|null)=>list.length?`<div class="tiles">${list.map(a=>accountTile(a,was)).join('')}</div>`:empty('Nenhuma conta cadastrada.');

function goals(list:GoalLine[]){
 if(!list.length)return empty('Nenhuma meta definida.');
 return list.map(g=>{const done=g.pct>=100;return `<div class="row">${badge('target','#245cdc')}<div><p>${esc(g.name)}</p><small>${meta(g.account&&esc(g.account),`até ${date(g.date)}`)}</small></div><b class="${done?'pos':''}">${Math.round(g.pct)}%</b><div class="full">${bar(g.pct,done?'done':'')}<small>${money(g.current)} de ${money(g.target)}${done?' · meta alcançada':` · faltam ${money(Math.max(0,g.target-g.current))}`}</small></div></div>`}).join('');
}

/** The statement as a timeline: each row carries the sum of all accounts right after it. */
function event(r:Row,withDate:boolean){
 const value=r.flow==='in'?`+${money(r.amount)}`:r.flow==='out'?`−${money(r.amount)}`:money(r.amount);
 const after=r.effect?`saldo <em>${money(r.after)}</em>`:r.type==='purchase'?'no cartão · saldo igual':'saldo igual';
 return `<div class="ev ${r.flow}"><p>${esc(r.description)}<small>${meta(withDate&&dayMonth(r.date),r.category&&esc(r.category),r.origin!==r.category&&r.origin&&esc(r.origin),r.installments>1&&`${r.installments}x`)}</small>${r.notes?`<em>${esc(r.notes)}</em>`:''}</p><b class="${r.flow==='in'?'pos':r.flow==='out'?'neg':''}">${value}<small>${after}</small></b></div>`;
}
const sums=(rows:Row[])=>({in:rows.filter(r=>r.flow==='in').reduce((n,r)=>n+r.amount,0),out:rows.filter(r=>r.flow==='out').reduce((n,r)=>n+r.amount,0)});
const total=(label:string,rows:Row[])=>{const t=sums(rows);return `<div class="total"><span>Entrou ${label}</span><span class="pos">+${money(t.in)}</span><span>Saiu ${label}</span><span class="neg">−${money(t.out)}</span></div>`};
const opening=(day:string,value:number)=>`<div class="tl-day">${esc(dayTitle(day))}</div><div class="ev start"><p>Saldo inicial<small>soma de todas as contas</small></p><b>${money(value)}</b></div>`;

function monthly(r:MonthlyReport){
 const rows=r.days.flatMap(d=>d.items);const word=lower(r.label);
 const rec=r.bills.filter(b=>b.type==='income'),pay=r.bills.filter(b=>b.type==='expense');const sum=(l:typeof r.bills)=>l.reduce((n,b)=>n+b.amount,0);
 const cards=r.cards.length?r.cards.map(c=>{const carry=c.total-c.items.reduce((n,i)=>n+i.amount,0);
  const items=[...(carry?[`<li><span>Saldo inicial do cartão</span><b>${money(carry)}</b></li>`]:[]),...c.items.map(i=>`<li><span>${esc(i.description)}<small>${meta(dayMonth(i.date),i.installments>1&&`parcela ${i.number}/${i.installments}`)}</small></span><b>${money(i.amount)}</b></li>`)];
  return `<div class="row">${badge('card')}<div><p>${esc(c.name)}</p><small>${meta(c.institution!==c.name&&esc(c.institution),`fecha ${dayMonth(c.closing)}`,`vence ${dayMonth(c.due)}`)}</small>${status(c.status)}</div><b>${money(c.total)}<small>${c.paid?`pago ${money(c.paid)} · `:''}restante ${money(c.remaining)}</small></b><div class="full">${items.length?`<ul class="items">${items.join('')}</ul>`:'<small>Nenhuma compra nesta fatura.</small>'}${bar(c.limit?c.used/c.limit*100:0,c.limit&&c.used>c.limit*.85?'hot':'')}<small>Limite usado ${money(c.used)} de ${money(c.limit)}</small></div></div>`}).join(''):empty('Nenhum cartão cadastrado.');
 const bills=r.bills.length?`${r.bills.map(b=>`<div class="row">${badge(b.type==='income'?'income':'calendar',b.type==='income'?'#177449':'#92989a')}<div><p>${esc(b.name)}</p><small>${b.type==='income'?'a receber':'a pagar'} · ${dayMonth(b.date)}</small>${status(b.status)}</div><b class="${/atraso/i.test(b.status)?'neg':''}">${money(b.amount)}</b></div>`).join('')}<p class="fine">A receber ${money(sum(rec))} · a pagar ${money(sum(pay))}.</p>`:empty('Nenhum compromisso neste mês.');
 return [
  panel('saldo','O saldo ao longo do mês','Soma de todas as contas, dia a dia. Os números marcam os lançamentos que mais mexeram no saldo.',monthlyChart(r)),
  why(r.bridge,true,r.accounts.length>0),
  toc([['saldo','Saldo'],['categorias','Categorias'],['historico','Seis meses'],['contas','Contas'],['cartoes','Cartões'],['planejamento','Metas'],['lancamentos','Lançamentos']]),
  categories(r),
  panel('historico','Seis meses','Acima da linha, o que entrou; abaixo, o que saiu. Embaixo de cada mês, o resultado.',mirror(r.series,r.month)),
  `<section class="sec" id="contas" aria-labelledby="contas-t"><h2 id="contas-t">Contas</h2><p class="desc">Quanto tinha em ${date(dayBefore(r.start))} e quanto ficou em ${date(r.end)}.</p>${accounts(r.accounts,`em ${date(dayBefore(r.start)).slice(0,5)}`)}</section>`,
  `<div class="cols">${panel('cartoes','Cartões',`Faturas com vencimento em ${esc(word)}.`,cards)}${panel('planejamento','Metas e compromissos',`Guardado no mês: ${money(r.future.investment)} em investimentos e ${money(r.future.reserve)} na reserva.`,`${goals(r.goals)}<h3>Compromissos</h3>${bills}`)}</div>`,
  panel('lancamentos','Lançamentos',`${plural(rows.length,'registro','registros')}, com o saldo das contas depois de cada um. Transferências e compras no cartão não mudam o saldo.`,rows.length?`<div class="tl">${opening(dayBefore(r.start),r.daily[0].balance)}${r.days.map(d=>`<div class="tl-day">${esc(dayTitle(d.date))}</div>${d.items.map(i=>event(i,false)).join('')}`).join('')}</div>${total(`em ${esc(word)}`,rows)}`:empty('Nenhum lançamento neste mês.')),
 ].join('');
}

function full(r:FullReport){
 const patrimony=r.byKind.filter(k=>k.value>0);const kindColor=(label:string)=>{const t=(Object.keys(kinds) as AccountLine['type'][]).find(k=>accountKinds[k]===label);return (t?kinds[t]:kinds.other).color};
 const rows=r.appendix.flatMap(m=>m.items);
 const cards=r.cards.length?r.cards.map(c=>{const other=c.used-(c.purchased-c.paid);const lines:[string,number][]=[['Saldo inicial do cartão',Math.max(0,other)],['Total comprado',c.purchased],['Faturas pagas',c.paid],['Ajustes',Math.max(0,-other)],['Parcelas de faturas futuras',c.future]];
  return `<div class="row">${badge('card')}<div><p>${esc(c.name)}</p><small>${meta(c.institution!==c.name&&esc(c.institution),`limite ${money(c.limit)}`)}</small></div><b>${money(c.used)}<small>em aberto</small></b><div class="full"><ul class="items">${lines.filter(([,v])=>v).map(([k,v])=>`<li><span>${k}</span><b>${money(v)}</b></li>`).join('')}</ul>${bar(c.limit?c.used/c.limit*100:0,c.limit&&c.used>c.limit*.85?'hot':'')}<small>Limite usado ${money(c.used)} de ${money(c.limit)}</small></div></div>`}).join(''):empty('Nenhum cartão cadastrado.');
 const top=r.topExpenses.length?r.topExpenses.map(t=>`<div class="row">${badge(t.icon??'other',t.color)}<div><p>${esc(t.description)}</p><small>${meta(dayMonth(t.date),t.category&&esc(t.category),t.origin!==t.category&&t.origin&&esc(t.origin),t.installments>1&&`${t.installments}x`)}</small></div><b class="neg">−${money(t.amount)}</b></div>`).join(''):empty('Nenhuma despesa registrada.');
 const table=`<div class="table"><div class="h-row h-head"><span>Mês</span><span>Entrou</span><span>Saiu</span><span>Resultado</span><span>Saldo</span></div>${r.series.map(p=>`<div class="h-row"><b class="h-m">${esc(p.label)}</b><span class="h-i"><small>Entrou</small>${money(p.income)}</span><span class="h-e"><small>Saiu</small>${money(p.expense)}</span><span class="h-r ${tone(p.result)}">${signed(p.result)}</span><span class="h-b"><small>Saldo</small>${money(p.balance)}</span></div>`).join('')}<div class="h-row h-total"><b class="h-m">Total</b><span class="h-i"><small>Entrou</small>${money(r.income)}</span><span class="h-e"><small>Saiu</small>${money(r.expense)}</span><span class="h-r ${tone(r.result)}">${signed(r.result)}</span><span class="h-b"><small>Saldo</small>${money(r.balance)}</span></div></div>`;
 return [
  panel('saldo','O saldo mês a mês','Soma de todas as contas ao fim de cada mês. Os números marcam os meses em que o saldo mais mudou.',fullChart(r)),
  why(r.bridge,false,r.accounts.length>0),
  toc([['saldo','Saldo'],['destaques','Destaques'],['categorias','Categorias'],['historico','Mês a mês'],['patrimonio','Patrimônio'],['cartoes','Cartões'],['planejamento','Metas'],['lancamentos','Lançamentos']]),
  panel('destaques','Destaques','',facts([
   ['Média mensal de receitas',money(r.avgIncome)],['Média mensal de despesas',money(r.avgExpense)],
   r.best&&[`Melhor mês · ${esc(r.best.label)}`,signed(r.best.result),tone(r.best.result)],
   r.worst&&r.worst!==r.best&&[`Mês mais apertado · ${esc(r.worst.label)}`,signed(r.worst.result),tone(r.worst.result)],
   ['Guardado em investimentos e reserva',money(r.future.investment+r.future.reserve)],['Lançamentos registrados',r.count.toLocaleString('pt-BR')],
  ])),
  categories(r),
  panel('maiores','Maiores despesas','Os lançamentos que mais pesaram em todo o período.',top),
  panel('historico','Mês a mês','O que entrou e saiu em cada mês, o resultado e o saldo com que ele terminou.',`${mirror(r.series)}${table}`),
  `<section class="sec" id="patrimonio" aria-labelledby="patrimonio-t"><h2 id="patrimonio-t">Patrimônio</h2><p class="desc">${money(r.balance)} em contas hoje, por tipo de conta.</p>${patrimony.length?`<div class="stack" aria-hidden="true">${patrimony.map(k=>`<i style="flex:${k.value} 1 0;background:${kindColor(k.label)}"></i>`).join('')}</div><ul class="kinds">${patrimony.map(k=>`<li><span><i class="dot" style="background:${kindColor(k.label)}"></i>${esc(k.label)}</span><small>${pct(r.balance>0?k.value/r.balance*100:0)}</small><b>${money(k.value)}</b></li>`).join('')}</ul>`:empty('Nenhum saldo positivo em contas.')}${accounts(r.accounts,null)}</section>`,
  `<div class="cols">${panel('cartoes','Cartões','Tudo o que passou por cada cartão desde o início.',cards)}${panel('planejamento','Metas e compromissos',`Guardado no período: ${money(r.future.investment)} em investimentos e ${money(r.future.reserve)} na reserva.`,`${goals(r.goals)}<h3>Compromissos</h3>${facts([['Cadastrados',String(r.bills.total)],['Confirmados',String(r.bills.settled)],['Pendentes',String(r.bills.pending)],['Em atraso',String(r.bills.overdue),r.bills.overdue?'neg':''],['Ainda a pagar',money(r.bills.amount)]])}`)}</div>`,
  panel('lancamentos','Lançamentos',`${plural(r.count,'registro','registros')}, por mês, com o saldo das contas depois de cada um. O saldo inclui o saldo inicial das contas, que não é receita.`,rows.length?`<div class="tl">${opening(dayBefore(r.start),r.bridge.opening)}${r.appendix.map(m=>{const t=sums(m.items);return `<div class="tl-day tl-month"><span>${esc(m.label)}</span><span>${plural(m.items.length,'registro','registros')} · <i class="pos">+${money(t.in)}</i> · <i class="neg">−${money(t.out)}</i></span></div>${m.items.map(i=>event(i,true)).join('')}`}).join('')}</div>${total('no período',rows)}`:empty('Nenhum lançamento registrado.')),
 ].join('');
}

const toc=(items:[string,string][])=>`<nav class="toc" aria-label="Seções do relatório">${items.map(([id,t])=>`<a href="#${id}">${t}</a>`).join('')}</nav>`;

const CSS=`
:root{--bg:#f6f7f5;--surface:rgb(255 255 255/.66);--ink:#232728;--ink2:#646c68;--ink3:#6c7370;--line:#dfe3dd;--line2:#e8ebe6;--blue:#245cdc;--blue-deep:#174cb7;--blue-wash:#e7effd;--track:#e4e8e1;--in:#177449;--in-wash:#eaf5ef;--out:#b64146;--out-wash:#fceef0;--warn:#946015;--warn-wash:#fbf4e4;--shadow:0 8px 28px rgb(42 59 73/.06),inset 0 1px 0 rgb(255 255 255/.9)}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact;scroll-padding-top:76px}
body{font-family:Manrope,'Segoe UI',system-ui,-apple-system,sans-serif;font-size:14.5px;line-height:1.55;color:var(--ink);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;background:radial-gradient(70% 38% at 100% 0,rgb(36 92 220/.09),transparent 70%),radial-gradient(60% 40% at 0 100%,rgb(255 255 255/.9),transparent 70%),var(--bg);background-attachment:fixed}
::selection{background:#d5e1fa;color:var(--ink)}
:focus-visible{outline:2px solid #0870fa;outline-offset:3px;border-radius:6px}
a{color:inherit}
.pos{color:var(--in)}.neg{color:var(--out)}
svg.i{width:18px;height:18px;flex:none}
.logo{display:inline-flex;align-items:center;gap:6px;height:19px;color:#082455}.logo svg{height:100%;width:auto}.logo-word{height:58%!important}
.bar{position:sticky;top:0;z-index:5;background:rgb(246 247 245/.82);backdrop-filter:blur(18px) saturate(135%);-webkit-backdrop-filter:blur(18px) saturate(135%);border-bottom:1px solid var(--line)}
.bar>div{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:880px;min-height:60px;margin:0 auto;padding:0 16px}
.bar span{font-size:13px;font-weight:600;color:var(--ink2)}
.bar button{appearance:none;border:0;min-height:44px;padding:0 18px;border-radius:12px;background:var(--blue);color:#fff;font:600 13px/1 Manrope,'Segoe UI',system-ui,sans-serif;cursor:pointer;box-shadow:inset 0 1px 0 rgb(255 255 255/.3),0 4px 10px rgb(25 70 150/.12);transition:background-color 140ms cubic-bezier(.2,.7,.2,1)}.bar button:hover{background:var(--blue-deep)}
.doc{max-width:880px;margin:0 auto;padding:0 16px}
.open{padding:24px 0 6px}
.mast{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px}
.demo{padding:3px 9px;border-radius:8px;background:var(--warn-wash);color:var(--warn);font-size:12.5px;font-weight:600}
.meta{margin-top:18px;font-size:12.5px;font-weight:500;color:var(--ink2)}
h1{margin-top:6px;font-size:40px;line-height:1.08;font-weight:500;letter-spacing:-.05em;text-wrap:balance}
.lede{margin-top:14px;max-width:32ch;font-size:19px;line-height:1.4;font-weight:500;letter-spacing:-.025em}.lede b{font-weight:600;white-space:nowrap}
.res{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin-top:14px}
.res span{font-size:13px;color:var(--ink2)}.res strong{font-size:30px;font-weight:500;letter-spacing:-.045em;white-space:nowrap}
.panel{margin-top:14px;padding:18px 16px;border-radius:20px;background:var(--surface);border:1px solid rgb(255 255 255/.8);outline:1px solid var(--line2);outline-offset:-1px;box-shadow:var(--shadow);backdrop-filter:blur(22px) saturate(135%);-webkit-backdrop-filter:blur(22px) saturate(135%)}
.sec{margin-top:40px}
.panel>h2,.sec>h2{font-size:19px;line-height:1.25;font-weight:600;letter-spacing:-.03em}
.desc{max-width:62ch;margin-top:3px;font-size:13px;color:var(--ink2)}.desc b{font-weight:600;color:var(--ink)}
.panel h3{margin:20px 0 2px;font-size:14px;font-weight:600}
.empty{padding:14px 0;font-size:13px;color:var(--ink2)}
.fine{margin-top:10px;font-size:12.5px;color:var(--ink2)}
.toc{display:flex;gap:6px;overflow-x:auto;margin:22px -16px 0;padding:0 16px 4px;scrollbar-width:none}
.toc a{flex:none;display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-size:13px;font-weight:600;color:var(--ink2);text-decoration:none}.toc a:hover{color:var(--ink);border-color:#cbd1ca}
.chart{margin:10px 0 0}.chart svg{display:block;width:100%;height:auto;overflow:visible}
.chart text{font-family:Manrope,'Segoe UI',sans-serif;font-variant-numeric:tabular-nums}
.c-t{font-size:11px;font-weight:600;fill:#6c7370}.c-t.now{fill:#245cdc}.c-v{font-size:11.5px;font-weight:700;fill:#232728}.c-n{font-size:10px;font-weight:700;fill:#fff}
.steps{margin-top:8px}
.step{display:grid;grid-template-columns:24px minmax(0,1fr) auto;column-gap:10px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line2)}.step:last-child{border-bottom:0}
.num{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--ink);color:#fff;font-size:11.5px;font-weight:700;transform:translateY(3px)}
.step p{font-weight:600;line-height:1.35;overflow-wrap:anywhere}.step small{display:block;font-size:12.5px;font-weight:500;color:var(--ink2)}
.step>b{font-weight:600;white-space:nowrap;text-align:right}
.why{margin-top:14px;padding:16px;border-radius:18px;background:var(--blue-wash);color:#173a87}
.why h2{font-size:16px;line-height:1.35;font-weight:600;letter-spacing:-.02em;color:#10306f}
.why p{margin-top:6px;font-size:13.5px}
.why .eq{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;margin-top:10px;padding-top:10px;border-top:1px solid #c9d8f6;font-size:13.5px}
.why .eq span:nth-child(even){text-align:right;font-weight:600;white-space:nowrap}
.why .eq .t{padding-top:6px;border-top:1px solid #9fb7ea;font-weight:700}
.badge{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:var(--bg);color:var(--fg)}
.cat{display:grid;grid-template-columns:36px minmax(0,1fr) auto;column-gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line2)}.cat:last-child{border-bottom:0}
.cat-body{min-width:0}.cat p{display:flex;justify-content:space-between;gap:8px;font-weight:600;overflow-wrap:anywhere}.cat p small{font-size:12.5px;font-weight:500;color:var(--ink2)}
.cat .meter{margin-top:7px}.cat .meter i{background:var(--c)}.cat>b{font-weight:600;white-space:nowrap}
.meter{display:block;height:6px;margin-top:9px;border-radius:3px;background:var(--track);overflow:hidden}.meter i{display:block;height:100%;min-width:3px;border-radius:3px;background:var(--blue)}
.meter.done i{background:var(--in)}.meter.hot i{background:var(--out)}
.hist{display:flex;gap:6px;margin-top:16px}
.hc{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}
.hu,.hd{display:flex;justify-content:center;width:100%}.hu{height:84px;align-items:flex-end;border-bottom:1.5px solid var(--ink)}.hd{height:58px;align-items:flex-start;padding-top:2px}
.hu i,.hd i{display:block;width:min(22px,64%);min-height:2px}
.hu i{background:#a9cfb9;border-radius:5px 5px 0 0}.hd i{background:#e6b3b6;border-radius:0 0 5px 5px}
.hc.now .hu i,.solid .hu i{background:var(--in)}.hc.now .hd i,.solid .hd i{background:var(--out)}
.hl{display:grid;justify-items:center;font-size:12px;color:var(--ink2);white-space:nowrap}.hl b{font-size:12px;font-weight:600}.hl b.z{color:var(--ink3)}
.hc.now .hl{color:var(--ink);font-weight:700}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.tile{min-width:0;padding:14px 13px;border-radius:18px;background:var(--surface);border:1px solid rgb(255 255 255/.8);outline:1px solid var(--line2);outline-offset:-1px;box-shadow:var(--shadow)}
.tile .badge{width:32px;height:32px;border-radius:10px}
.tile h3{margin-top:10px;font-size:13px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}.tile h3 small{font-size:11.5px;font-weight:600;color:var(--warn)}
.tile .kind{display:block;font-size:12px;color:var(--ink2)}
.tile strong{display:block;margin-top:4px;font-size:20px;font-weight:500;letter-spacing:-.04em;white-space:nowrap}
.tile .was{display:block;margin-top:4px;font-size:12px;color:var(--ink2)}
.delta{display:inline-block;margin-top:6px;padding:2px 7px;border-radius:8px;font-size:12px;font-weight:600;background:#eef0ec;color:var(--ink2)}.delta.pos{background:var(--in-wash)}.delta.neg{background:var(--out-wash)}
.tile ul{list-style:none;margin-top:10px;padding-top:8px;border-top:1px solid var(--line2);font-size:12px;color:var(--ink2)}
.tile li{display:flex;justify-content:space-between;gap:8px;padding:2px 0}.tile li b{font-weight:600;color:var(--ink);white-space:nowrap}.tile li b.pos{color:var(--in)}.tile li b.neg{color:var(--out)}
.row{display:grid;grid-template-columns:36px minmax(0,1fr) auto;column-gap:12px;align-items:start;padding:13px 0;border-bottom:1px solid var(--line2)}.row:last-child{border-bottom:0}
.row>div{min-width:0}.row p{font-weight:600;overflow-wrap:anywhere}.row small{display:block;font-size:12.5px;color:var(--ink2)}
.row>b{font-weight:600;white-space:nowrap;text-align:right}.row .full{grid-column:2/-1}.row .full>small{margin-top:4px}
.items{list-style:none;margin-top:8px;font-size:12.5px;color:var(--ink2)}
.items li{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px dashed var(--line)}.items li span{min-width:0;overflow-wrap:anywhere}.items small{display:block;font-size:12px}.items b{font-weight:600;color:var(--ink);white-space:nowrap}
.pill{display:inline-flex;align-items:center;gap:4px;margin-top:5px;padding:3px 8px;border-radius:8px;font-size:12px;font-weight:600;background:#eef0ec;color:var(--ink2);white-space:nowrap}
.pill svg{width:13px;height:13px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pill-done{background:var(--in-wash);color:var(--in)}.pill-late{background:var(--out-wash);color:var(--out)}.pill-part{background:var(--warn-wash);color:var(--warn)}.pill-open{background:var(--blue-wash);color:var(--blue-deep)}
.facts{display:grid;grid-template-columns:1fr 1fr;margin-top:12px;border-top:1px solid var(--line)}
.facts div{padding:11px 0;border-bottom:1px solid var(--line)}.facts div:nth-child(odd){padding-right:12px;border-right:1px solid var(--line)}.facts div:nth-child(even){padding-left:14px}
.facts dt{font-size:12.5px;color:var(--ink2)}.facts dd{margin-top:1px;font-size:16px;font-weight:600;letter-spacing:-.025em;white-space:nowrap}
.stack{display:flex;gap:2px;height:12px;margin-top:14px;border-radius:4px;overflow:hidden}.stack i{min-width:3px}
.kinds{list-style:none;margin-top:6px}
.kinds li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:baseline;gap:12px;padding:10px 0;border-bottom:1px solid var(--line2)}
.kinds span{font-weight:600;overflow-wrap:anywhere}.kinds small{font-size:12.5px;color:var(--ink2)}.kinds b{font-weight:600;white-space:nowrap}
.dot{display:inline-block;width:10px;height:10px;margin-right:8px;border-radius:3px;vertical-align:-1px}
.table{margin-top:20px}
.h-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px 12px;padding:11px 0;border-bottom:1px solid var(--line2)}
.h-row>*{font-size:13px;white-space:nowrap}.h-row small{display:block;font-size:11.5px;color:var(--ink2)}
.h-m{grid-area:1/1/2/3;font-weight:600}.h-r{grid-area:1/3;text-align:right;font-weight:600}.h-i{grid-area:2/1}.h-e{grid-area:2/2}.h-b{grid-area:2/3;text-align:right}.h-i,.h-e,.h-b{margin-top:4px}
.h-head{display:none}.h-total{border-top:2px solid var(--ink);border-bottom:0}
.tl{position:relative;margin-top:12px;padding-left:24px}
.tl::before{content:'';position:absolute;left:8px;top:6px;bottom:6px;width:2px;border-radius:1px;background:var(--line)}
.tl-day{position:relative;margin-top:14px;padding-bottom:4px;font-size:12.5px;font-weight:600;color:var(--ink2)}
.tl-day::before{content:'';position:absolute;left:-20px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--bg);border:2px solid #9aa29d}
.tl-month{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;margin-top:22px;padding-bottom:6px;border-bottom:1px solid var(--line);font-size:14px;color:var(--ink)}
.tl-month span+span{font-size:12.5px;font-weight:500;color:var(--ink2)}.tl-month i{font-style:normal;font-weight:600}
.ev{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--line2)}
.ev::before{content:'';position:absolute;left:-18px;top:16px;width:6px;height:6px;border-radius:50%;background:var(--dot,#9aa29d)}
.ev.in{--dot:var(--in)}.ev.out{--dot:var(--out)}.ev.move{--dot:var(--blue)}
.ev p{min-width:0;font-weight:600;line-height:1.35;overflow-wrap:anywhere}.ev p small{display:block;font-size:12.5px;font-weight:500;color:var(--ink2)}.ev p em{display:block;margin-top:2px;font-size:12.5px;font-style:normal;font-weight:500;color:var(--ink3)}
.ev>b{font-weight:600;white-space:nowrap;text-align:right}.ev.move>b{font-weight:500;color:var(--ink2)}
.ev>b small{display:block;margin-top:1px;font-size:12px;font-weight:500;color:var(--ink2)}.ev>b small em{font-style:normal;font-weight:600;color:var(--ink)}
.ev.start p{color:var(--ink2)}
.total{display:grid;grid-template-columns:1fr auto;gap:4px 12px;margin-top:14px;padding-top:12px;border-top:2px solid var(--ink);font-weight:600}.total span:nth-child(even){text-align:right;white-space:nowrap}
footer{display:grid;gap:8px;margin-top:56px;padding:22px 0 48px;border-top:1px solid var(--line);font-size:12.5px;color:var(--ink2)}
.tagline{font-size:18px;font-weight:500;letter-spacing:-.03em;color:var(--ink)}
@media (min-width:760px),print{
 .chart-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:30px;align-items:start}
 .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
 .tiles{grid-template-columns:repeat(4,minmax(0,1fr))}
 .facts{grid-template-columns:repeat(3,minmax(0,1fr))}.facts div,.facts div:nth-child(odd),.facts div:nth-child(even){padding:10px 14px;border:0;border-bottom:1px solid var(--line);border-left:1px solid var(--line)}.facts div:nth-child(3n+1){padding-left:0;border-left:0}
 .h-row{grid-template-columns:1.4fr repeat(4,minmax(0,1fr));align-items:baseline}.h-row small{display:none}.h-row>*{margin:0;text-align:right}.h-m{grid-area:1/1;text-align:left!important}
 .h-i{grid-area:1/2}.h-e{grid-area:1/3}.h-r{grid-area:1/4}.h-b{grid-area:1/5}
 .h-head{display:grid;padding:0 0 8px;border-bottom:2px solid var(--ink)}.h-head>*{font-size:12px;font-weight:600;color:var(--ink2)}.h-head span:first-child{text-align:left}
}
@media (min-width:760px){
 body{font-size:15px}
 .bar>div,.doc{padding:0 32px}
 .open{padding-top:40px}
 h1{font-size:56px}.lede{font-size:24px}.res strong{font-size:36px}
 .toc{margin:26px 0 0;padding:0;flex-wrap:wrap}
 .panel{padding:24px 26px}
 .hu{height:110px}.hd{height:76px}
}
@media screen and (max-width:759.98px){.hl.hide-sm{visibility:hidden}}
@media (min-width:760px),print{.hl.hide-lg{visibility:hidden}}
@media (max-width:370px){.doc,.bar>div{padding:0 12px}h1{font-size:34px}.tiles{grid-template-columns:1fr}}
@media (prefers-reduced-transparency:reduce){.panel,.tile,.toc a{background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none}}
@page{size:A4;margin:12mm}
@media print{
 body{background:#fff;font-size:12px}.bar,.toc{display:none}.doc{max-width:none;padding:0}
 .open{padding-top:0}h1{font-size:40px}
 .panel,.tile{background:#fff;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none}
 .panel,.why,.tile,.row,.cat,.ev,.h-row,.step{break-inside:avoid}.panel>h2,.sec>h2,.tl-day{break-after:avoid}
 #lancamentos{break-before:page}
}
`;

export function renderReportHtml(r:Report,o:RenderOptions){
 const isMonthly=r.kind==='monthly';
 const generated=date(r.generatedAt);
 const kind=isMonthly?'Relatório mensal':'Relatório completo';
 const title=isMonthly?`CIFRO · Relatório de ${r.label.toLowerCase()}`:'CIFRO · Relatório completo';
 const heading=isMonthly?esc(r.label):`Desde ${lower(r.series[0].label)} de ${r.start.slice(0,4)}`;
 const who=meta(kind,`${date(r.start)} a ${date(r.end)}`,o.name.trim()&&esc(o.name.trim()));
 const {opening:open,closing}=r.bridge;
 const lede=isMonthly?(open||closing?`Você começou o mês com <b>${money(open)}</b> nas contas e chegou a <b>${money(closing)}</b>.`:'Nenhum saldo em contas neste mês.'):`Em ${plural(r.months,'mês','meses')} de acompanhamento, você chegou a <b>${money(r.balance)}</b> nas contas.`;
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f7f5"><title>${title}</title><style>@font-face{font-family:Manrope;src:url('${esc(o.origin)}/fonts/Manrope.ttf') format('truetype');font-weight:200 800;font-display:swap}${CSS}</style></head><body>${sprite}<div class="bar"><div><span>${kind}</span><button type="button" onclick="window.print()">Salvar PDF</button></div></div><main class="doc"><header class="open"><div class="mast">${logo('m')}${o.demo?'<span class="demo">Demonstração · dados fictícios</span>':''}</div><p class="meta">${who}</p><h1>${heading}</h1><p class="lede">${lede}</p><div class="res"><span>${isMonthly?'Resultado do mês':'Resultado acumulado'}</span><strong class="${tone(r.result)}">${signed(r.result)}</strong><span>${resultNote(r.result,r.income,r.expense).toLowerCase()}</span></div></header>${isMonthly?monthly(r):full(r as FullReport)}<footer>${logo('f')}<p class="tagline">Suas finanças mais conectadas.</p><span>Gerado em ${generated}. Valores registrados manualmente${o.demo?' · dados fictícios de demonstração':''}.</span></footer></main></body></html>`;
}
