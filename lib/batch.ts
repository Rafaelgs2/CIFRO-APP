import {type State,type Category,type Transaction,baseTransaction,today,searchKey} from './finance.ts';

/** Where every expense of the batch is paid from: an account (expense) or a card (purchase). */
export type BatchSource={kind:'account'|'card',id:string};
export type BatchRow={line:number,text:string,date:string,description:string,amount:number,categoryId:string,error:string,duplicate:boolean};
export const BATCH_LIMIT=200;

// Same hints as capture_telegram_expense, so the app and the bot guess the same category for the same words.
const hints:[Category['icon'],RegExp][]=[
 ['food',/\b(almoco|janta|jantar|lanche|cafe|hotdog|pizza|hamburguer|restaurante|ifood|padaria|marmita|salgado|sorvete)\b/],
 ['market',/\b(mercado|supermercado|feira|hortifruti|acougue)\b/],
 ['car',/\b(uber|99|onibus|metro|gasolina|combustivel|estacionamento|pedagio|passagem)\b/],
 ['health',/\b(farmacia|remedio|medico|consulta|exame|dentista)\b/],
 ['fun',/\b(cinema|show|bar|netflix|spotify|jogo)\b/],
 ['home',/\b(aluguel|condominio|luz|energia|agua|internet)\b/],
];
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const byOrder=(a:Category,b:Category)=>a.order-b.order;

/** The user's own category names win (longest first), then the word hints, then "Outros". */
export function guessCategory(description:string,categories:Category[]){
 const expense=categories.filter(c=>c.type==='expense'),text=searchKey(description);
 const named=[...expense].sort((a,b)=>b.name.trim().length-a.name.trim().length||byOrder(a,b)).find(c=>new RegExp(`(^|[^\\p{L}\\p{N}])${escape(searchKey(c.name.trim()))}($|[^\\p{L}\\p{N}])`,'u').test(text));
 if(named)return named.id;
 for(const [icon,pattern] of hints){if(!pattern.test(text))continue;const hit=expense.filter(c=>c.icon===icon).sort(byOrder)[0];if(hit)return hit.id}
 return ([...expense].sort((a,b)=>Number(b.icon==='other')-Number(a.icon==='other')||byOrder(a,b))[0]?.id)??'';
}

const iso=(y:number,m:number,d:number)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const realDate=(s:string)=>{const d=new Date(`${s}T12:00:00Z`);return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
const shift=(s:string,days:number)=>{const d=new Date(`${s}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)};
const relative:Record<string,number>={hoje:0,ontem:-1,anteontem:-2};
const dateToken=/^(?:(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}|\d{2}))?|(hoje|ontem|anteontem))(?=\s|$|[:–-])/i;
const amountAtEnd=/^(.*?)\s*(?:[–:-]\s*)?(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)$/i;

/**
 * Reads `dd/mm`, `dd/mm/aa`, `dd/mm/aaaa`, hoje, ontem or anteontem. Without a year, a date more than a month
 * ahead means last year (28/12 typed in January); one just ahead stays this year and is flagged as future,
 * instead of silently becoming a date a year ago.
 */
function readDate(match:RegExpMatchArray,asOf:string):string{
 if(match[4])return shift(asOf,relative[match[4].toLowerCase()]);
 const day=Number(match[1]),month=Number(match[2]),year=match[3]?Number(match[3].length===2?`20${match[3]}`:match[3]):Number(asOf.slice(0,4));
 const date=iso(year,month,day);
 return !match[3]&&date>shift(asOf,31)?iso(year-1,month,day):date;
}
const fullDate=(d:string)=>new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR');

/**
 * One expense per line: `28/10 almoço 32,50`. A line without a date takes the last date written above it,
 * so a day can be written once, alone or on its first expense. Lines that cannot be read come back with `error` set.
 */
export function parseBatch(text:string,state:State,source:BatchSource,asOf=today()):BatchRow[]{
 const account=source.kind==='account'?state.accounts.find(a=>a.id===source.id):undefined;
 const rows:BatchRow[]=[];let current='';
 text.split(/\r?\n/).forEach((raw,index)=>{
  const line=raw.trim().replace(/^[-•*]\s+/,'');if(!line)return;
  const row:BatchRow={line:index+1,text:line,date:current,description:'',amount:0,categoryId:'',error:'',duplicate:false};
  let rest=line;const found=line.match(dateToken);
  if(found){
   const date=readDate(found,asOf);rest=line.slice(found[0].length).replace(/^\s*[:–-]?\s*/,'');
   // A bad date must not let the lines below fall back to an older one.
   if(!realDate(date)){current='';rows.push({...row,error:'Data inválida.'});return}
   current=date;if(!rest)return;
   row.date=date;
  }
  const parts=rest.match(amountAtEnd);
  if(!parts||!parts[1].trim())return void rows.push({...row,error:parts?'Falta a descrição antes do valor.':'Não achei o valor no fim da linha.'});
  row.description=parts[1].trim();
  row.amount=Math.round(Number(parts[2].replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.'))*100);
  if(!row.date)row.error='Comece com a data, como 28/10, aqui ou numa linha acima.';
  else if(row.date>asOf)row.error=`${fullDate(row.date)} ainda não chegou. Lance despesas futuras pelo Novo lançamento.`;
  else if(account&&row.date<account.date)row.error=`${fullDate(row.date)} é antes do saldo inicial de ${account.name} (${fullDate(account.date)}).`;
  else if(row.description.length>100)row.error='A descrição passa de 100 caracteres.';
  else if(row.amount<1||row.amount>99999999999)row.error='Informe um valor maior que zero.';
  row.categoryId=guessCategory(row.description,state.categories);
  const key=searchKey(row.description);
  row.duplicate=state.transactions.some(t=>['expense','purchase'].includes(t.type)&&t.date===row.date&&t.amount===row.amount&&searchKey(t.description.trim())===key);
  rows.push(row);
 });
 return rows;
}

export function batchTransactions(rows:BatchRow[],source:BatchSource):Transaction[]{
 return rows.map(r=>({...baseTransaction(),type:source.kind==='card'?'purchase':'expense',description:r.description,amount:r.amount,date:r.date,categoryId:r.categoryId,accountId:source.kind==='account'?source.id:'',cardId:source.kind==='card'?source.id:''}));
}
