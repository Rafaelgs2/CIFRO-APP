import {chromium} from '../.sites-runtime/qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const base=process.argv[2]||'http://localhost:5173';
await mkdir('outputs',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
const page=await context.newPage();
const errors=[],warnings=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});
const toggle=page.getByRole('switch',{name:'Modo escuro'});
const fits=async(label)=>{
 await page.waitForTimeout(400);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(overflow)console.log('Overflow',label,await page.locator('body *').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1;}).map(el=>({tag:el.tagName,class:el.getAttribute('class'),right:el.getBoundingClientRect().right})).slice(-12)));
 assert.equal(overflow,false,label+' fits viewport');
};
async function geometry(checked){
 await toggle.setChecked(checked);
 await page.waitForTimeout(350);
 assert.equal(await toggle.getAttribute('aria-checked'),String(checked));
 const value=await toggle.evaluate(el=>{const r=el.getBoundingClientRect(),t=el.querySelector('.theme-thumb').getBoundingClientRect();return {left:t.left-r.left,right:t.right-r.left,top:t.top-r.top,bottom:t.bottom-r.top};});
 assert.equal(value.left,checked?22:6);
 assert.equal(value.top,12);assert.equal(value.bottom,32);
 assert.ok(value.right<=44);
}
async function capture(name){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`outputs/editorial-${name}.png`});}
try {
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/api/finance',async route=>{await gate;await route.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.getByRole('status',{name:'Carregando seus dados'}).waitFor();
 await capture('loading');
 release();
 await page.getByRole('button',{name:'Conhecer com dados de exemplo'}).waitFor();
 await page.unroute('**/api/finance');
 assert.equal(await page.getByRole('link',{name:'Entrar com ChatGPT'}).getAttribute('href'),'/signin-with-chatgpt?return_to=/');
 await capture('entry');
 await page.getByRole('button',{name:'Conhecer com dados de exemplo'}).click();
 await page.locator('.balance-number').waitFor();
 await page.locator('[data-sonner-toast]').waitFor({state:'hidden'});
 await page.evaluate(()=>document.fonts.ready);
 assert.match(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily),/Manrope/);
 assert.ok(await page.locator('.balance-number').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=48));
 assert.equal(await page.locator('.hero-balance').evaluate(el=>getComputedStyle(el).backgroundImage),'none');
 await geometry(true);await capture('desktop-dark');await geometry(false);await capture('desktop-light');
 const chart=page.locator('.flow-canvas').first();const box=await chart.boundingBox();
 await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);
 await page.locator('.chart-tooltip').first().waitFor();
 await page.getByText('Ver valores por mês',{exact:true}).first().click();
 assert.equal(await page.locator('.chart-table>div').count(),7);
 await page.getByText('Ver valores por mês',{exact:true}).first().click();
 await page.getByRole('button',{name:'Ocultar valores'}).click();
 assert.equal(await page.locator('.balance-number').innerText(),'••••');
 assert.equal(await page.locator('.flow-canvas').count(),0);
 await page.getByRole('button',{name:'Mostrar valores'}).click();
 await page.setViewportSize({width:1024,height:900});
 assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),84);
 await fits('tablet');await capture('tablet');
 await page.getByRole('button',{name:'Alternar navegação lateral'}).click();
 assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),240);
 await fits('expanded tablet');
 await page.getByRole('button',{name:'Alternar navegação lateral'}).click();
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await fits(`${width}px home`);
  await geometry(true);await capture(`mobile-${width}-dark`);await geometry(false);await capture(`mobile-${width}-light`);
 }
 await page.setViewportSize({width:390,height:844});
 for(const view of ['transactions','planning','reports','profile','accounts','cards','categories','closing']) {
  await page.evaluate(v=>{location.hash=v;},view);
  await page.locator(`[data-view=${view}]`).waitFor();
  await page.waitForTimeout(320);await fits(view);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.page-content').evaluate(el=>getComputedStyle(el).animationName),'none');
 await toggle.focus();await page.keyboard.press('Space');
 assert.equal(await toggle.evaluate(el=>el.matches(':focus-visible')),true);
 assert.deepEqual(errors,[],'No client errors');assert.deepEqual(warnings,[],'No browser warnings');
 console.log('PASS: editorial hierarchy, loading/entry, chart tooltip/table/privacy, tablet collapse/expand, 320/390px, all routes, normal-motion toggle geometry, keyboard and reduced motion.');
}finally{await browser.close();}
