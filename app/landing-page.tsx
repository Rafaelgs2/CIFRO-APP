'use client';

import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from '@/components/icons';
import {Brand,BrandSymbol} from './brand';

const transactions=[
  {name:'Mercado',meta:'Alimentação · Conta principal',value:'− R$ 238,90',date:'18 set',kind:'expense' as const},
  {name:'Salário',meta:'Receita · Conta principal',value:'+ R$ 4.800,00',date:'15 set',kind:'income' as const},
  {name:'Spotify',meta:'Assinaturas · Cartão',value:'− R$ 21,90',date:'12 set',kind:'expense' as const},
  {name:'Transferência',meta:'Reserva · Conta principal',value:'− R$ 450,00',date:'08 set',kind:'transfer' as const},
];

function TransactionIcon({kind}:{kind:'expense'|'income'|'transfer'}){
  const Icon=kind==='income'?ArrowDownLeft:kind==='transfer'?ArrowLeftRight:ArrowUpRight;
  return <span className={`lp-transaction-icon is-${kind}`}><Icon aria-hidden="true"/></span>;
}

function TransactionList({compact=false}:{compact?:boolean}){
  return <div className={`lp-transaction-list${compact?' is-compact':''}`}>
    {transactions.map((item,index)=><div className="lp-transaction" key={item.name} style={{'--item-index':index} as React.CSSProperties}>
      <TransactionIcon kind={item.kind}/>
      <span className="lp-transaction-copy"><b>{item.name}</b><small>{item.meta}</small></span>
      <span className="lp-transaction-value"><b className={item.kind==='income'?'is-income':undefined}>{item.value}</b><small>{item.date}</small></span>
    </div>)}
  </div>;
}

function FlowChart({large=false}:{large?:boolean}){
  return <div className={`lp-chart${large?' is-large':''}`}>
    <div className="lp-chart-legend" aria-hidden="true"><span><i className="is-balance"/>Saldo</span><span><i className="is-income"/>Receitas</span><span><i className="is-expense"/>Despesas</span></div>
    <svg viewBox="0 0 680 250" role="img" aria-label="Gráfico demonstrativo de receitas, despesas e saldo entre abril e setembro">
      <defs>
        <linearGradient id="lp-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--lp-blue)" stopOpacity=".18"/>
          <stop offset="1" stopColor="var(--lp-blue)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <g className="lp-chart-grid">
        <path d="M20 36H660M20 94H660M20 152H660M20 210H660"/>
      </g>
      <g className="lp-chart-series">
        <path className="lp-chart-area" d="M20 192C77 176 103 160 148 166C197 172 226 125 276 133C333 143 354 87 405 102C458 117 492 62 536 78C585 96 612 38 660 26V222H20Z"/>
        <path className="lp-chart-line is-balance" d="M20 192C77 176 103 160 148 166C197 172 226 125 276 133C333 143 354 87 405 102C458 117 492 62 536 78C585 96 612 38 660 26"/>
        <path className="lp-chart-line is-income" d="M20 139C80 128 104 105 148 113C201 123 226 72 276 88C334 107 357 58 405 72C461 89 490 45 536 57C588 71 615 40 660 44"/>
        <path className="lp-chart-line is-expense" d="M20 176C77 164 106 173 148 154C202 129 226 147 276 120C330 91 359 122 405 91C459 55 493 96 536 68C585 36 618 76 660 94"/>
        <g className="lp-chart-dots"><circle className="is-balance" cx="660" cy="26" r="5"/><circle className="is-balance" cx="536" cy="78" r="4"/><circle className="is-balance" cx="405" cy="102" r="4"/><circle className="is-income" cx="660" cy="44" r="4"/><circle className="is-expense" cx="660" cy="94" r="4"/></g>
      </g>
    </svg>
    <div className="lp-chart-months" aria-hidden="true"><span>ABR</span><span>MAI</span><span>JUN</span><span>JUL</span><span>AGO</span><span>SET</span></div>
  </div>;
}

function Stat({label,value,detail,accent}:{label:string,value:string,detail?:string,accent?:boolean}){
  return <div className={`lp-stat${accent?' is-accent':''}`}><span>{label}</span><strong>{value}</strong>{detail&&<small>{detail}</small>}</div>;
}

function DashboardPreview({hero=false}:{hero?:boolean}){
  return <div className={`lp-dashboard${hero?' is-hero':''}`}>
    <div className="lp-dashboard-topbar">
      <span className="lp-window-mark"><BrandSymbol/></span>
      <div><span/><span/><span/></div>
      <span className="lp-avatar">RG</span>
    </div>
    <div className="lp-dashboard-body">
      <aside aria-hidden="true">
        <span className="is-active"/><span/><span/><span/>
      </aside>
      <div className="lp-dashboard-content">
        <div className="lp-dashboard-heading"><div><small>VISÃO GERAL</small><b>Seu mês financeiro</b></div><span>Setembro 2026</span></div>
        <div className="lp-dashboard-summary">
          <div className="lp-main-balance"><span>Saldo nas contas</span><strong>R$ 8.420,00</strong><small>Atualizado em 19 de setembro</small></div>
          <Stat label="Receitas" value="R$ 6.850"/>
          <Stat label="Despesas" value="R$ 4.120"/>
          <Stat label="Resultado" value="+ R$ 2.730" accent/>
        </div>
        <div className="lp-dashboard-lower">
          <div><div className="lp-panel-heading"><b>Fluxo financeiro</b><span>6 meses</span></div><FlowChart/></div>
          <div className="lp-dashboard-recents"><div className="lp-panel-heading"><b>Movimentações recentes</b><span>Ver todas</span></div><TransactionList compact/></div>
        </div>
      </div>
    </div>
  </div>;
}

function SectionIntro({eyebrow,title,copy,light=false}:{eyebrow:string,title:ReactNode,copy?:string,light?:boolean}){
  return <div className={`lp-section-intro lp-reveal${light?' is-light':''}`}>
    <p className="lp-eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    {copy&&<p className="lp-section-copy">{copy}</p>}
  </div>;
}

export function LandingPage(){
  const pageRef=useRef<HTMLDivElement>(null);
  const [navSolid,setNavSolid]=useState(false);

  useEffect(()=>{
    pageRef.current?.classList.add('lp-motion-ready');
    const reveals=[...document.querySelectorAll<HTMLElement>('.lp-reveal')];
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -10% 0px',threshold:.08});
    reveals.forEach(element=>revealObserver.observe(element));

    const sentinel=document.querySelector('.lp-nav-sentinel');
    const navObserver=sentinel?new IntersectionObserver(([entry])=>setNavSolid(!entry.isIntersecting),{threshold:0}):null;
    if(sentinel)navObserver?.observe(sentinel);
    return()=>{revealObserver.disconnect();navObserver?.disconnect();};
  },[]);

  useEffect(()=>{
    const page=pageRef.current;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!page||reducedMotion.matches)return;

    const parallaxLayers=[...page.querySelectorAll<HTMLElement>('[data-parallax]')];
    const scrollScenes=[...page.querySelectorAll<HTMLElement>('[data-scroll-scene]')];
    let frame=0;

    const clamp=(value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));
    const update=()=>{
      frame=0;
      const viewportHeight=window.innerHeight;
      const documentHeight=Math.max(document.documentElement.scrollHeight-viewportHeight,1);
      page.style.setProperty('--page-progress',(window.scrollY/documentHeight).toFixed(4));

      const parallaxValues=parallaxLayers.map(element=>{
        const rect=element.getBoundingClientRect();
        const center=clamp((rect.top+rect.height/2-viewportHeight/2)/viewportHeight,-1.6,1.6);
        return {element,center};
      });
      const sceneValues=scrollScenes.map(element=>{
        const rect=element.getBoundingClientRect();
        const distance=Math.max(rect.height*.76,viewportHeight*.42);
        const progress=clamp((viewportHeight*.84-rect.top)/distance);
        return {element,progress};
      });

      parallaxValues.forEach(({element,center})=>{
        const speed=Number(element.dataset.parallax||0);
        const horizontal=Number(element.dataset.parallaxX||0);
        const rotation=Number(element.dataset.parallaxRotate||0);
        element.style.setProperty('--parallax-y',`${(-center*speed).toFixed(2)}px`);
        element.style.setProperty('--parallax-x',`${(-center*horizontal).toFixed(2)}px`);
        element.style.setProperty('--parallax-rotate',`${(-center*rotation).toFixed(2)}deg`);
      });
      sceneValues.forEach(({element,progress})=>{
        const eased=1-Math.pow(1-progress,3);
        element.style.setProperty('--scene-progress',progress.toFixed(4));
        element.style.setProperty('--scene-eased',eased.toFixed(4));
        element.style.setProperty('--scene-reverse',(1-progress).toFixed(4));
      });
    };
    const requestUpdate=()=>{if(!frame)frame=requestAnimationFrame(update);};

    update();
    window.addEventListener('scroll',requestUpdate,{passive:true});
    window.addEventListener('resize',requestUpdate);
    return()=>{
      if(frame)cancelAnimationFrame(frame);
      window.removeEventListener('scroll',requestUpdate);
      window.removeEventListener('resize',requestUpdate);
    };
  },[]);

  return <div className="lp-page" ref={pageRef}>
    <a className="lp-skip" href="#conteudo">Pular para o conteúdo</a>
    <span className="lp-scroll-progress" aria-hidden="true"/>
    <div className="lp-nav-sentinel" aria-hidden="true"/>
    <header className={`lp-navbar${navSolid?' is-solid':''}`}>
      <div className="lp-nav-inner">
        <Link className="lp-brand-link" href="/" aria-label="CIFRO — página inicial"><Brand/></Link>
        <nav className="lp-nav-links" aria-label="Navegação principal">
          <a href="#produto">Produto</a>
          <a href="#recursos">Recursos</a>
          <a href="#seguranca">Segurança</a>
        </nav>
        <div className="lp-nav-actions"><Link className="lp-nav-login" href="/login">Entrar</Link><Link className="lp-button lp-button-small" href="/signup">Começar agora <ArrowRight aria-hidden="true"/></Link></div>
      </div>
    </header>

    <main id="conteudo" className="landing-main">
      <section className="lp-hero" aria-labelledby="lp-hero-title">
        <div className="lp-hero-orbit lp-orbit-one" data-parallax="150" data-parallax-rotate="8" aria-hidden="true"/><div className="lp-hero-orbit lp-orbit-two" data-parallax="90" data-parallax-rotate="-5" aria-hidden="true"/>
        <div className="lp-container lp-hero-copy" data-parallax="34">
          <p className="lp-eyebrow lp-hero-eyebrow"><span/>CONTROLE FINANCEIRO EM UMA SÓ VISÃO</p>
          <h1 id="lp-hero-title">Suas finanças.<br/>Finalmente <em>conectadas.</em></h1>
          <p>Contas, gastos, cartões e patrimônio organizados em um único lugar para você entender melhor seu dinheiro.</p>
          <div className="lp-hero-actions"><Link className="lp-button" href="/signup">Começar agora <ArrowRight aria-hidden="true"/></Link><a className="lp-text-link" href="#produto">Ver como funciona <span aria-hidden="true">↓</span></a></div>
          <span className="lp-scroll-cue" aria-hidden="true"><i/><b>ROLE PARA EXPLORAR</b></span>
        </div>
        <div className="lp-container lp-product-stage" data-parallax="75" aria-label="Demonstração visual do painel CIFRO">
          <div className="lp-floating-card lp-float-wealth" data-parallax="145" data-parallax-x="-26" data-parallax-rotate="4"><span>Patrimônio</span><strong>R$ 28.450,90</strong><small><TrendingUp aria-hidden="true"/> 6,2% este mês</small></div>
          <div className="lp-floating-card lp-float-balance" data-parallax="-105" data-parallax-x="34" data-parallax-rotate="-3"><span>Saldo disponível</span><strong>R$ 8.420,00</strong><small>3 contas conectadas</small></div>
          <DashboardPreview hero/>
          <div className="lp-floating-card lp-float-card" data-parallax="190" data-parallax-x="22" data-parallax-rotate="5"><span>Fatura atual</span><strong>R$ 1.842,90</strong><small>Fecha em 8 dias</small></div>
        </div>
        <div className="lp-scroll-ribbon" aria-hidden="true">
          <div className="lp-ribbon-track">
            <div className="lp-ribbon-group"><span>CONTAS</span><i/><span>GASTOS</span><i/><span>CARTÕES</span><i/><span>PATRIMÔNIO</span><i/><span>UMA SÓ VISÃO</span><i/></div>
            <div className="lp-ribbon-group"><span>CONTAS</span><i/><span>GASTOS</span><i/><span>CARTÕES</span><i/><span>PATRIMÔNIO</span><i/><span>UMA SÓ VISÃO</span><i/></div>
            <div className="lp-ribbon-group"><span>CONTAS</span><i/><span>GASTOS</span><i/><span>CARTÕES</span><i/><span>PATRIMÔNIO</span><i/><span>UMA SÓ VISÃO</span><i/></div>
            <div className="lp-ribbon-group"><span>CONTAS</span><i/><span>GASTOS</span><i/><span>CARTÕES</span><i/><span>PATRIMÔNIO</span><i/><span>UMA SÓ VISÃO</span><i/></div>
          </div>
        </div>
      </section>

      <section id="produto" className="lp-scattered lp-section">
        <div className="lp-container">
          <SectionIntro eyebrow="O PONTO DE PARTIDA" title={<>Seu dinheiro acontece em vários lugares.<br/><span>Sua visão financeira não deveria.</span></>} copy="O CIFRO reúne as partes da sua vida financeira em uma leitura clara, contínua e feita para o seu mês."/>
          <div className="lp-convergence-scroll lp-reveal" data-scroll-scene>
            <div className="lp-convergence" aria-label="Contas, cartões e movimentações reunidos no CIFRO">
              <div className="lp-convergence-beam" aria-hidden="true"/>
              <div className="lp-source lp-source-account"><Landmark aria-hidden="true"/><span>Conta corrente</span><small>R$ 5.240,00</small></div>
              <div className="lp-source lp-source-card"><CreditCard aria-hidden="true"/><span>Cartão</span><small>R$ 1.842,90</small></div>
              <div className="lp-source lp-source-pix"><ArrowLeftRight aria-hidden="true"/><span>PIX</span><small>Hoje, 14:32</small></div>
              <div className="lp-source lp-source-subscription"><ReceiptText aria-hidden="true"/><span>Assinaturas</span><small>4 ativas</small></div>
              <div className="lp-source lp-source-expenses"><Wallet aria-hidden="true"/><span>Despesas</span><small>R$ 4.120,00</small></div>
              <div className="lp-source lp-source-reserve"><ShieldCheck aria-hidden="true"/><span>Reserva</span><small>R$ 7.180,00</small></div>
              <div className="lp-convergence-core"><BrandSymbol/><b>CIFRO</b><span>Uma única visão</span></div>
              <p className="lp-convergence-caption"><span className="lp-caption-line">Tudo conectado.</span><span className="lp-caption-line is-accent">Agora faz sentido.</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-product-section lp-section">
        <div className="lp-container">
          <SectionIntro eyebrow="VISÃO FINANCEIRA UNIFICADA" title={<>Tudo o que importa.<br/><span>Em uma única visão.</span></>} copy="Acompanhe contas, movimentações, cartões e patrimônio sem precisar montar planilhas para entender o mês."/>
          <div className="lp-dashboard-frame lp-reveal" data-scroll-scene data-parallax="55"><div className="lp-frame-label"><span>PAINEL CIFRO</span><span>DADOS DEMONSTRATIVOS</span></div><DashboardPreview/></div>
        </div>
      </section>

      <section id="recursos" className="lp-movements lp-section">
        <div className="lp-container lp-split">
          <div className="lp-sticky-copy lp-reveal"><p className="lp-eyebrow">MOVIMENTAÇÕES</p><h2>Saiba exatamente<br/>para onde seu<br/><span>dinheiro foi.</span></h2><p>Cada entrada e saída ganha contexto: categoria, conta, data e valor. Sem ruído entre você e o que aconteceu.</p></div>
          <div className="lp-ledger lp-reveal" data-scroll-scene><div className="lp-ledger-head"><div><span>SETEMBRO</span><b>Movimentações</b></div><span>4 registros</span></div><TransactionList/><div className="lp-ledger-total"><span>Resultado do período</span><strong>+ R$ 4.089,20</strong></div></div>
        </div>
      </section>

      <section className="lp-cards-section lp-section">
        <div className="lp-container">
          <SectionIntro eyebrow="CARTÕES E FATURAS" title={<>Cartão não precisa ser uma surpresa<br/><span>no fim do mês.</span></>} copy="Acompanhe o que já entrou na fatura, o limite disponível e a próxima data importante."/>
          <div className="lp-card-composition lp-reveal" data-scroll-scene>
            <div className="lp-credit-card"><div className="lp-credit-top"><BrandSymbol/><span>CIFRO · VISA</span></div><span className="lp-credit-number">•••• 4812</span><div><span>RAFAEL G.</span><span>09/30</span></div></div>
            <div className="lp-invoice-panel">
              <div className="lp-invoice-heading"><div><span>FATURA ATUAL</span><strong>R$ 1.842,90</strong></div><span className="lp-status">Em aberto</span></div>
              <div className="lp-limit"><span><b>R$ 4.157,10</b> disponíveis</span><i><span/></i><small>de R$ 6.000,00</small></div>
              <div className="lp-invoice-meta"><span><small>PRÓXIMO FECHAMENTO</small><b>28 set</b></span><span><small>VENCIMENTO</small><b>05 out</b></span></div>
              <div className="lp-invoice-items"><span><b>Mercado Central</b><em>− R$ 238,90</em></span><span><b>Curso online · 2/6</b><em>− R$ 159,00</em></span><span><b>Spotify</b><em>− R$ 21,90</em></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-insights lp-section">
        <div className="lp-container">
          <div className="lp-insights-heading"><SectionIntro eyebrow="LEITURA DO TEMPO" title={<>Pare de olhar apenas números.<br/><span>Entenda o movimento.</span></>} copy="Compare receitas, despesas e resultado para reconhecer o ritmo real das suas finanças."/><div className="lp-insight-values lp-reveal"><Stat label="Receitas" value="R$ 6.850"/><Stat label="Despesas" value="R$ 4.120"/><Stat label="Saldo" value="R$ 2.730" accent/></div></div>
          <div className="lp-insight-chart lp-reveal" data-scroll-scene><FlowChart large/><div className="lp-chart-callout" data-parallax="90" data-parallax-x="-24"><small>RESULTADO EM SETEMBRO</small><strong>+ R$ 2.730</strong><span>Receitas − despesas</span></div></div>
        </div>
      </section>

      <section className="lp-month-section lp-section">
        <div className="lp-container lp-month-grid">
          <div className="lp-month-copy lp-reveal"><p className="lp-eyebrow">CONTROLE MENSAL</p><h2>Um mês de cada vez.<br/>Sem perder a visão<br/><span>do todo.</span></h2><p>Revise o período, acompanhe o resultado e siga em frente sabendo exatamente onde você está.</p></div>
          <div className="lp-month-panel lp-reveal" data-scroll-scene data-parallax="55" data-parallax-x="-18">
            <div className="lp-month-switcher"><button aria-label="Mês anterior">←</button><strong>Setembro <span>2026</span></strong><button aria-label="Próximo mês">→</button></div>
            <div className="lp-month-line"><span>Receitas<small>Entradas no período</small></span><strong>R$ 6.850</strong></div>
            <div className="lp-month-line"><span>Despesas<small>Saídas no período</small></span><strong>R$ 4.120</strong></div>
            <div className="lp-month-line is-result"><span>Resultado<small>Receitas menos despesas</small></span><strong>+ R$ 2.730</strong></div>
            <div className="lp-month-progress"><span/><i/><b/></div>
          </div>
        </div>
      </section>

      <section className="lp-wealth-section lp-section">
        <div className="lp-container">
          <SectionIntro eyebrow="PATRIMÔNIO" title={<>Seu patrimônio não é só um número.<br/><span>É a soma das suas decisões.</span></>} copy="Acompanhe o que está distribuído entre contas e reservas sem perder a leitura do total."/>
          <div className="lp-wealth lp-reveal" data-scroll-scene><span>Patrimônio total</span><strong>R$ 28.450,90</strong><small>Posição em 19 de setembro de 2026</small><div><span><i className="is-account"/><b>Contas</b><em>R$ 21.270,90</em></span><span><i className="is-reserve"/><b>Reservas</b><em>R$ 7.180,00</em></span></div></div>
        </div>
      </section>

      <section id="seguranca" className="lp-dark-section" data-scroll-scene>
        <div className="lp-dark-orbit" data-parallax="180" data-parallax-x="-45" data-parallax-rotate="12" aria-hidden="true"/>
        <div className="lp-container">
          <div className="lp-dark-opening lp-reveal"><p className="lp-eyebrow">CLAREZA PARA DECIDIR</p><h2>Mais clareza.<br/><span>Menos ruído.</span></h2><p>O CIFRO organiza suas informações financeiras para que você consiga visualizar o que aconteceu, entender o presente e planejar melhor os próximos passos.</p></div>
          <div className="lp-dark-divider"/>
          <div className="lp-trust-grid">
            <div className="lp-trust-copy lp-reveal"><p className="lp-eyebrow">SEGURANÇA E CONTROLE</p><h2>Seus dados merecem o mesmo cuidado que <span>seu dinheiro.</span></h2><p>Acesso autenticado e informações separadas por usuário ajudam a manter sua experiência privada e sob seu controle.</p></div>
            <div className="lp-trust-points lp-reveal">
              <div style={{'--item-index':0} as React.CSSProperties}><span><ShieldCheck aria-hidden="true"/></span><b>Autenticação segura</b><p>Seu acesso é protegido por uma sessão individual.</p></div>
              <div style={{'--item-index':1} as React.CSSProperties}><span><Landmark aria-hidden="true"/></span><b>Dados por usuário</b><p>Seus registros financeiros ficam associados à sua conta.</p></div>
              <div style={{'--item-index':2} as React.CSSProperties}><span><ReceiptText aria-hidden="true"/></span><b>Controle de acesso</b><p>O painel exige autenticação antes de exibir informações.</p></div>
            </div>
          </div>
          <div className="lp-final-cta lp-reveal"><Brand className="lp-final-brand"/><h2>Suas finanças podem<br/><span>fazer mais sentido.</span></h2><p>Comece a organizar sua vida financeira com o CIFRO.</p><div><Link className="lp-button lp-button-light" href="/signup">Criar minha conta <ArrowRight aria-hidden="true"/></Link><Link className="lp-dark-link" href="/login">Já tenho uma conta</Link></div></div>
          <footer className="lp-footer"><Brand/><nav aria-label="Links do rodapé"><a href="#produto">Produto</a><a href="#seguranca">Segurança</a></nav><span>© 2026 CIFRO</span></footer>
        </div>
      </section>
    </main>
  </div>;
}
