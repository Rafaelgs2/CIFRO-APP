import {chromium} from '../.sites-runtime/qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},colorScheme:'light'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Conhecer com dados de exemplo'}).click();
 await page.locator('[data-sonner-toast]').waitFor({state:'hidden'});
 for(const width of [390,320]) {
  await page.setViewportSize({width,height:844});
  for(const name of ['Início','Lançamentos','Planejamento','Relatórios','Perfil']) {
   const nav=page.locator('.mobile-nav');await nav.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(400);
   assert.equal(await nav.locator('.active').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const labels=await nav.locator('button').evaluateAll(items=>items.map(el=>{const s=el.querySelector('span'),r=el.getBoundingClientRect();return {active:el.classList.contains('active'),opacity:getComputedStyle(s).opacity,label:s.getBoundingClientRect().width,clipped:s.scrollWidth>s.clientWidth+1,width:r.width,height:r.height};}));
   assert.ok(labels.every(l=>l.width>=44&&l.height>=44),'touch targets');
   assert.ok(labels.every(l=>l.active?l.opacity==='1'&&!l.clipped:l.opacity==='0'&&l.label===0),JSON.stringify({width,name,labels}));
   assert.match(await nav.evaluate(el=>getComputedStyle(el).backdropFilter),/blur/);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('.mobile-nav').getByRole('button',{name:'Início',exact:true}).click();
 await page.waitForTimeout(400);
 await page.screenshot({path:'outputs/glass-mobile-light.png'});
 await page.getByRole('switch',{name:'Modo escuro'}).click();await page.waitForTimeout(400);
 await page.screenshot({path:'outputs/glass-mobile-dark.png'});
 await page.getByRole('button',{name:'Nova despesa',exact:true}).click();
 await page.getByRole('dialog').waitFor();assert.match(await page.getByRole('dialog').evaluate(el=>getComputedStyle(el).backdropFilter),/blur/);
 await page.screenshot({path:'outputs/glass-form.png'});await page.keyboard.press('Escape');
 await page.locator('.mobile-nav').getByRole('button',{name:'Relatórios',exact:true}).focus();
 await page.keyboard.press('Enter');await page.waitForTimeout(400);
 assert.equal(await page.locator('.mobile-nav .active').getAttribute('aria-label'),'Relatórios');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.mobile-nav .active').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>location.hash='home');await page.waitForTimeout(400);
 await page.screenshot({path:'outputs/glass-desktop-dark.png'});
 await page.getByRole('switch',{name:'Modo escuro'}).click();await page.waitForTimeout(200);await page.screenshot({path:'outputs/glass-desktop-light.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: compact floating glass nav, five active states at 320/390px, labels, touch targets, both themes, glass dialog, keyboard, reduced motion, desktop.');
}finally{await browser.close();}
