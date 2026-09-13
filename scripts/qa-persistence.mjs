import {chromium} from '../.sites-runtime/qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {totals,accountBalance,invoice} from '../.sites-runtime/finance-test-module.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage();let original;const errors=[];page.on('pageerror',e=>errors.push(e.message));
const get=()=>page.evaluate(()=>fetch('/api/finance').then(r=>r.json()));
const put=(state,revision)=>page.evaluate(async({state,revision})=>{const r=await fetch('/api/finance',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state,revision})});return {status:r.status,data:await r.json()}},{state,revision});
const picker=async(label,option)=>{await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click()};
const fill=async(label,value)=>page.getByLabel(label,{exact:true}).fill(value);
const save=async()=>{await page.getByRole('button',{name:'Salvar',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});};
try{
const anonymous=await context.request.get('http://localhost:5173/api/finance');assert.equal(anonymous.status(),401);
await page.goto('http://localhost:5173/signin-with-chatgpt?return_to=/',{waitUntil:'networkidle'});
original=await get();assert.ok(original.state,'authenticated database GET');
if(original.state.accounts.length)throw Error('Local account contains data; isolated UI test requires empty local data.');
await page.getByRole('button',{name:'Adicionar minha primeira conta',exact:true}).click();
await fill('Nome da conta','Salário QA');await fill('Saldo inicial','100.00');await fill('Data de referência do saldo','2026-01-01');await save();
await page.locator('.mobile-nav').getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Minhas contas Salário, VR, investimentos e reserva'}).click();
for(const [name,kind] of [['VR QA','Vale-refeição'],['Investimentos QA','Investimentos'],['Reserva QA','Reserva de emergência']]){await page.getByRole('button',{name:'Nova conta',exact:true}).click();await fill('Nome da conta',name);await picker('Finalidade',kind);await fill('Data de referência do saldo','2026-01-01');await save();}
await page.locator('.mobile-nav').getByRole('button',{name:'Início',exact:true}).click();
for(const [description,amount,account,category] of [['Salário recebido QA','6500.00','Salário QA','Salário'],['VR recebido QA','850.00','VR QA','Vale-refeição']]){await page.getByRole('button',{name:'Nova receita',exact:true}).click();await fill('Descrição',description);await fill('Valor',amount);await fill('Data','2026-09-05');await picker('Conta de entrada',account);await picker('Categoria',category);await save();}
for(const [description,amount,account] of [['Aluguel QA','1800.00','Salário QA'],['Almoço QA','200.00','VR QA']]){await page.getByRole('button',{name:'Nova despesa',exact:true}).click();await fill('Descrição',description);await fill('Valor',amount);await fill('Data','2026-09-05');await picker('Conta usada',account);await save();}
for(const [dest,amount] of [['Investimentos QA','1000.00'],['Reserva QA','500.00']]){await page.getByRole('button',{name:'Transferir',exact:true}).click();await fill('Descrição',`Transferência para ${dest}`);await fill('Valor',amount);await fill('Data','2026-09-05');await picker('Conta de origem','Salário QA');await picker('Conta de destino',dest);await save();}
await page.getByRole('button',{name:'Meus cartões',exact:true}).click();
for(const name of ['Nubank QA','Inter QA','Mercado Pago QA']){await page.getByRole('button',{name: name==='Nubank QA'?'Cadastrar cartão':'Novo cartão',exact:true}).click();await fill('Nome do cartão',name);await fill('Instituição',name);await fill('Limite total','8000.00');await picker('Dia de fechamento','10');await picker('Dia de vencimento','17');await save();}
await page.getByRole('button',{name:'Registrar compra no cartão',exact:true}).click();await fill('Descrição','Compra QA');await fill('Valor','300.00');await fill('Data','2026-09-05');await picker('Parcelamento','3 parcelas');await save();
await page.getByRole('button',{name:'Ver fatura',exact:true}).first().click();await page.getByRole('button',{name:'Registrar pagamento',exact:true}).click();await fill('Data','2026-09-12');await save();
await page.reload({waitUntil:'networkidle'});let stored=await get();const total=totals(stored.state,'2026-09-01','2026-09-30');assert.equal(total.income,735000);assert.equal(total.expense,230000);assert.equal(stored.state.accounts.length,4);assert.equal(stored.state.cards.length,3);assert.equal(invoice(stored.state,stored.state.cards[0],'2026-09').status,'Paga');assert.equal(accountBalance(stored.state,stored.state.accounts[0]),320000);
const stale=await put(stored.state,stored.revision-1);assert.equal(stale.status,409);const invalid=structuredClone(stored.state);invalid.transactions.find(t=>t.type==='transfer').destinationId=invalid.transactions.find(t=>t.type==='transfer').accountId;assert.equal((await put(invalid,stored.revision)).status,400);
const csrf=await context.request.put('http://localhost:5173/api/finance',{data:{state:stored.state,revision:stored.revision},headers:{Origin:'https://untrusted.invalid'}});assert.equal(csrf.status(),403);
await page.screenshot({path:'outputs/mobile-persisted.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS: mobile creation of 4 accounts, salary/VR, 2 expenses, 2 transfers, 3 cards, installment purchase/payment, reload persistence, authentication, stale-write protection, invalid transfer and CSRF.');
}finally{if(original?.state){const current=await get();await put(original.state,current.revision);}await browser.close()}
