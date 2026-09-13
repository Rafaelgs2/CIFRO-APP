import {chromium,webkit} from '../.sites-runtime/qa/node_modules/playwright/index.mjs';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const engines=[['Chromium',chromium,{channel:'msedge'}]];
if(existsSync(webkit.executablePath()))engines.push(['WebKit',webkit,{}]);
for(const [name,engine,options] of engines){
 const browser=await engine.launch({...options,headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'dark'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fits=async()=>{await page.waitForTimeout(250);const bounds=await page.getByRole('dialog').boundingBox();assert.ok(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=page.viewportSize().width+1&&bounds.y+bounds.height<=page.viewportSize().height+1,JSON.stringify(bounds));assert.equal(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);};
 try{
  await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Conhecer com dados de exemplo'}).click();
  for(const width of [320,390,430]){
   await page.setViewportSize({width,height:844});
   await page.getByRole('button',{name:'Nova despesa',exact:true}).click();await fits();
   assert.equal(await page.getByLabel('Descrição',{exact:true}).evaluate(el=>getComputedStyle(el).fontSize),'16px');
   await page.getByLabel('Descrição',{exact:true}).fill('Responsividade');
   await page.setViewportSize({width,height:360});await fits();
   await page.getByLabel('Observações (opcional)').fill('Campo acessível com teclado aberto');
   await page.getByRole('button',{name:'Salvar',exact:true}).scrollIntoViewIfNeeded();
   const save=await page.getByRole('button',{name:'Salvar',exact:true}).boundingBox();assert.ok(save.y>=0&&save.y+save.height<=360);
   await page.getByRole('button',{name:'Cancelar',exact:true}).click();
   await page.setViewportSize({width,height:844});
  }
  await page.setViewportSize({width:390,height:844});
  for(const [view,button] of [['accounts','Nova conta'],['cards','Novo cartão'],['planning','Novo compromisso'],['categories','Nova categoria'],['profile','Editar nome']]){
   await page.evaluate(v=>location.hash=v,view);await page.getByRole('button',{name:button,exact:true}).click();await fits();
   await page.getByRole('button',{name:'Fechar',exact:true}).click();
  }
  await page.evaluate(()=>location.hash='home');await page.getByRole('button',{name:'Nova despesa',exact:true}).click();await fits();
  await page.screenshot({path:`outputs/mobile-dialog-${name}.png`});
  await page.setViewportSize({width:844,height:390});await fits();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  assert.deepEqual(errors,[]);console.log(`PASS ${name}: modal positioning, 320/390/430px, reduced keyboard height, landscape, scrolling, six forms and close controls.`);
 }finally{await browser.close();}
}
