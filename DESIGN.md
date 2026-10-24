---
name: CIFRO
description: Suas finanças mais conectadas.
colors:
  ledger-blue: "#245cdc"
  ledger-blue-deep: "#174cb7"
  signal-blue: "#0870fa"
  brand-navy: "#07152e"
  brand-ink: "#082455"
  blue-mist: "#f3f7fe"
  blue-wash: "#e7effd"
  stone-paper: "#f6f7f5"
  graphite-ink: "#232728"
  sage-gray: "#646c68"
  hairline: "#dfe3dd"
  hairline-soft: "#e8ebe6"
  field-stroke: "#cbd1ca"
  income-green: "#177449"
  income-wash: "#eaf5ef"
  expense-red: "#b64146"
  expense-wash: "#fceef0"
  warning-amber: "#946015"
  warning-wash: "#fbf4e4"
  chart-sage: "#859e95"
  chart-pewter: "#92989a"
  chart-track: "#e4e8e1"
  night-paper: "#151819"
  night-ink: "#edf0ec"
  night-sage: "#a6afaa"
  night-hairline: "#363e3d"
  night-blue: "#246ce4"
  night-link: "#95bcff"
  lp-ink: "#0b1933"
  lp-muted: "#667188"
  lp-blue: "#0755d9"
  lp-paper: "#f8fafc"
  lp-dark: "#08101f"
typography:
  display:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "clamp(3rem, 4.3vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.06em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "clamp(2.25rem, 3vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.055em"
  title:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "0.6rem"
    fontWeight: 600
    letterSpacing: "0.13em"
  lp-display:
    fontFamily: "Manrope, 'Segoe UI', Arial, sans-serif"
    fontSize: "clamp(4rem, 7vw, 6.5rem)"
    fontWeight: 500
    letterSpacing: "-0.065em"
rounded:
  control: "8px"
  nav: "10px"
  input: "12px"
  row: "14px"
  tile: "18px"
  card: "20px"
  modal: "24px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.ledger-blue}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.input}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ledger-blue-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.input}"
    padding: "11px 17px"
    height: "44px"
  button-text:
    textColor: "{colors.sage-gray}"
    padding: "0 4px"
    height: "44px"
  icon-button:
    textColor: "{colors.sage-gray}"
    rounded: "{rounded.nav}"
    size: "44px"
  input-field:
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.input}"
    padding: "11px 13px"
    height: "46px"
  panel:
    rounded: "{rounded.card}"
    padding: "26px"
  account-tile:
    rounded: "{rounded.tile}"
    padding: "20px 16px"
  transaction-row:
    rounded: "{rounded.row}"
    padding: "14px 12px"
    height: "76px"
  icon-badge:
    backgroundColor: "{colors.hairline-soft}"
    textColor: "{colors.sage-gray}"
    rounded: "11px"
    size: "36px"
  nav-item:
    textColor: "{colors.sage-gray}"
    rounded: "{rounded.nav}"
    padding: "0 14px"
    height: "46px"
  status-pill:
    rounded: "{rounded.control}"
    padding: "6px 9px"
  lp-button:
    backgroundColor: "{colors.lp-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.input}"
    padding: "0 22px"
    height: "52px"
---

# Design System: CIFRO

## Overview

**Creative North Star: "O Livro-Caixa de Vidro"**

O CIFRO é um livro-caixa: a estrutura vem de linhas finas, colunas de números alinhados e espaço generoso, como uma página de extrato bem composta. O "vidro" é a clareza, não o material: nada fica escondido entre o usuário e o que aconteceu com o dinheiro. O efeito translúcido (desfoque, borda de luz, sombra baixa) existe, mas é acabamento discreto, nunca o que organiza a tela.

O painel autenticado é calmo e denso na medida certa. O fundo é um papel de pedra levemente quente, com dois brilhos ambientes muito fracos (azul no alto à direita, pérola embaixo à esquerda). Sobre ele, um único azul faz todo o trabalho de ação e destaque; verde, vermelho e âmbar aparecem só quando carregam significado financeiro. Os números são o conteúdo principal: grandes, de peso médio, com espaçamento negativo e algarismos tabulares.

A landing page e o login são um **segundo mundo, intencional**: mais claros e frios, com azul mais saturado, títulos enormes, animação de rolagem e uma seção escura. Eles compartilham a fonte, o símbolo e o azul da marca com o app, mas têm paleta própria (`--lp-*`, `--login-*`) e não devem ser misturados com os tokens do painel.

**Key Characteristics:**
- Estrutura por divisórias de 1px e espaço, não por caixas empilhadas.
- Um acento azul; cor semântica só para receita, despesa e alerta.
- Números como manchete: Manrope 500, tracking negativo, `tabular-nums`.
- Rótulos pequenos em caixa alta com tracking largo como sinalização.
- Vidro discreto em superfícies elevadas; tudo funciona sem ele.
- Celular primeiro: dock flutuante em pílula, folhas que sobem de baixo.
- Temas claro e escuro completos sobre os mesmos nomes de token.

## Colors

Neutros de pedra e grafite com um só azul de ação; o resto da cor é semântica financeira.

### Primary
- **Azul Livro-Caixa** (`ledger-blue`): botão primário, mês selecionado, trilho ativo do switch, indicador da navegação lateral, linha principal dos gráficos. No escuro vira `night-blue`.
- **Azul Livro-Caixa Profundo** (`ledger-blue-deep`): hover do primário e cor de link no tema claro.
- **Azul Sinal** (`signal-blue`): anel de foco (`--ring`) e o gradiente do botão "+" da dock mobile.
- **Névoa Azul / Lavado Azul** (`blue-mist`, `blue-wash`): fundos de ícones de destaque, item ativo no onboarding, ícones do menu rápido.
- **Marinho da Marca / Tinta da Marca** (`brand-navy`, `brand-ink`): a palavra CIFRO no logo e a lateral escura do onboarding. O símbolo usa seu próprio gradiente (`--brand-symbol*`), que não se aplica a outros elementos.

### Neutral
- **Papel de Pedra** (`stone-paper`): fundo de todas as telas do app. Nunca branco puro.
- **Tinta Grafite** (`graphite-ink`): texto principal e números.
- **Cinza Sálvia** (`sage-gray`): texto secundário, rótulos, ícones em repouso. Contraste 5,0:1 sobre o papel.
- **Linha / Linha Suave** (`hairline`, `hairline-soft`): divisórias entre seções e entre linhas de lista.
- **Traço de Campo** (`field-stroke`): borda de botão secundário e de inputs.
- **Superfícies**: `--surface` é branco a 62% e `--surface-subtle` cinza a 62%. São translúcidas de propósito; quando o navegador não tem `backdrop-filter` ou o usuário pede menos transparência, viram sólidas (`#f4f7fa` / `#232b31`).
- **Noite** (`night-paper`, `night-ink`, `night-sage`, `night-hairline`, `night-link`): equivalentes do tema escuro. Todos os pares texto/fundo passam AA (ex.: `night-sage` sobre `night-paper` 7,9:1).

### Semantic
- **Receita** (`income-green` sobre `income-wash`, 5,2:1): valores positivos, status concluído, checks.
- **Despesa** (`expense-red` sobre `expense-wash`, 4,9:1): valores negativos, erros de formulário, ações destrutivas.
- **Alerta** (`warning-amber` sobre `warning-wash`, 4,9:1): fatura vencida, limite próximo, etapa pendente.
- **Gráficos**: azul principal, `chart-sage` e `chart-pewter` como séries secundárias, `chart-track` para trilhos de progresso. As séries secundárias são neutras de propósito.

### Landing e login
- `lp-ink`, `lp-muted`, `lp-blue`, `lp-paper`, `lp-dark` (e equivalentes `--login-*`) pertencem apenas às superfícies públicas.

### Named Rules
**A Regra do Azul Único.** Só existe um azul de ação por tela. Não crie segundo acento (roxo, laranja, ciano) para variedade.

**A Regra da Cor com Significado.** Verde, vermelho e âmbar só aparecem quando dizem algo sobre o dinheiro (entrou, saiu, atenção). Nunca como decoração ou categoria genérica.

## Typography

**Fonte única:** Manrope (variável 200–800, auto-hospedada em `public/fonts/`), com fallback `'Segoe UI', Arial, sans-serif`.

**Character:** Uma sans geométrica e amigável, usada em peso médio com tracking apertado nos tamanhos grandes. Os números parecem impressos, não gritados.

### Hierarchy
- **Display** (500, `clamp(3rem,4.3vw,4rem)`, 1.2, −0.06em, tabular): o saldo principal da home. Só um por tela.
- **Headline** (500, `clamp(2.25rem,3vw,3rem)`, 1.15, −0.055em): `h1` das páginas. No celular fixa em 2.25rem.
- **Números de destaque** (500, 1.3–2.6rem, −0.04 a −0.05em): totais de relatório, valor do lançamento, limite do cartão, valor no campo de dinheiro (1.9rem).
- **Title** (600, 1.15rem, 1.4, −0.025em): `h2` de seção. Títulos de diálogo usam 1.5rem peso 500.
- **Body** (400–500, 0.75–0.875rem, 1.6–1.8): textos de apoio, linhas de lista (0.8rem), descrições. A base do documento é 16px, mas o conteúdo do app vive entre 12 e 14px.
- **Label** (600, 0.6rem, +0.13em, caixa alta no conteúdo): "kickers" de seção, rótulos da lateral, status do onboarding.

### Named Rules
**A Regra do Número Tabular.** Todo valor monetário que pode ser comparado com outro usa `font-variant-numeric: tabular-nums` e peso 500. Nunca negrito 700 em valores.

**A Regra do Piso de Leitura.** Os rótulos mais pequenos já estão em 0.55–0.6rem. Não desça abaixo disso, e não use esse tamanho para nada além de sinalização curta.

## Layout

- **App desktop:** grade de duas colunas, navegação lateral fixa de 240px + área de trabalho. Topbar fixa de 88px com vidro. Conteúdo com `max-width: 1440px` e padding 28px 44px 64px.
- **Tablet (801–1180px):** a lateral recolhe para 84px só com ícones (pode ser fixada recolhida pelo usuário). Padding cai para 30px.
- **Celular (≤800px):** sem lateral. Topbar de 74px com logo, conteúdo com 20–22px de margem (respeitando `safe-area`) e 112px de folga embaixo para a dock flutuante. Diálogos viram folhas que sobem de baixo. Inputs vão para 16px para o iOS não dar zoom.
- **Telas muito estreitas (≤370px):** margem de 16px, grades de contas viram uma coluna.
- **Home:** herói em duas colunas (1.45fr / 1fr) com saldo à esquerda e métricas separadas por uma linha vertical; abaixo, composição de seções (1.65fr / 1fr) divididas por linhas, não por cartões.
- **Ritmo:** escala de 4px (`--space-1` a `--space-10`). Grandes respiros entre blocos (44px abaixo do cabeçalho, 34–46px entre seções); 10–16px dentro de grupos.
- **Landing:** container `min(100% − clamp(40px,8vw,128px), 1360px)`, seções em tela cheia guiadas por rolagem.

## Elevation & Depth

Híbrido, com prioridade para o plano. A maior parte da tela é plana sobre o papel, separada por linhas de 1px. Superfícies elevadas (painéis, tiles de conta, cartões de crédito, tabs, botão secundário, avatar) recebem um vidro discreto: fundo translúcido, `backdrop-filter: blur(22px) saturate(135%)`, uma borda de luz interna no topo e sombra ambiente muito baixa. Popovers e modais usam sombras mais fortes e fundo quase opaco.

### Shadow Vocabulary
- **Vidro em repouso** (`--glass-shadow`: `0 8px 28px rgb(42 59 73 / .06)` + realces internos): superfícies elevadas paradas.
- **Vidro levantado** (`--glass-raised`: `0 12px 36px rgb(42 59 73 / .1)`): hover de tiles e botões secundários, dock mobile.
- **Vidro afundado** (`--glass-inset`): inputs, busca e face do cartão de crédito, que parecem levemente cavados.
- **Popover** (`0 8px 28px rgb(7 21 46 / .12)`): menus, selects, tooltip de gráfico, seletor de mês.
- **Modal** (`0 16px 64px rgb(7 21 46 / .18)`): diálogos e onboarding.

### Named Rules
**A Regra do Vidro Opcional.** Toda tela precisa ficar correta com `--glass-blur: none` e superfícies sólidas. O vidro só refina; se ele for necessário para separar uma coisa da outra, falta uma linha ou espaço.

**A Regra da Linha Antes da Caixa.** Para agrupar conteúdo, prefira uma divisória de 1px e espaço. Use um painel só quando o grupo é uma unidade que se toca (um cartão, uma conta, um formulário).

## Shapes

Cantos suaves e consistentes por tamanho de elemento: quanto maior o objeto, maior o raio. 8px em controles pequenos (botões do seletor de mês, itens de menu), 10px em itens de navegação e botões de ícone, 12px em inputs e botões, 14px em linhas clicáveis, 18px em tiles de conta, 20px em painéis, 22–24px em diálogos e folhas, pílula (999px) em chips e na dock. Ícones de categoria ficam em quadrados arredondados (11–12px), nunca círculos, exceto o avatar e os botões redondos do detalhe de lançamento. Ícones são Lucide com traço 1.6.

## Components

### Buttons
Confiantes, sem brilho excessivo.
- **Shape:** 12px, altura mínima 44px, texto 0.8rem peso 600.
- **Primário:** azul livro-caixa com texto branco, realce interno no topo e sombra azul curta. Hover escurece para o azul profundo.
- **Secundário:** borda de traço de campo, fundo de vidro; hover levanta com `--glass-raised`.
- **Texto:** cinza sálvia sem fundo; hover vira cor de link.
- **Ícone:** 44×44, raio 10px, hover com `--surface-subtle`.
- **Foco:** contorno de 2px em `--ring` com 3px de afastamento, em todos os elementos interativos.
- **Desabilitado:** 50% de opacidade.

### Chips e status
- **Status:** pílula de 8px de raio, 0.65rem, fundo `--surface-subtle`; vencido usa âmbar sobre lavado âmbar.
- **Chip do lançamento:** pílula em caixa alta, cor da categoria a 14% de fundo.

### Cards / Containers
- **Painel:** raio 20px (18px no celular), padding 26px (20px), borda de luz, vidro discreto.
- **Tile de conta:** raio 18px, ícone + nome + valor grande (1.35rem, 500); hover levanta.
- **Cartão de crédito:** moldura de 22px com uma "face" afundada de 16px dentro.

### Inputs / Fields
- **Estilo:** 46px de altura, raio 12px, borda de traço de campo, fundo `--surface-subtle` com sombra interna afundada.
- **Rótulo:** acima, 0.8rem peso 500, 9px de distância.
- **Dinheiro:** campo próprio com "R$" em cinza e valor em 1.9rem peso 500.
- **Erro:** bloco com fundo lavado vermelho, texto `expense-red` e borda rosada, raio 12px.

### Navigation
- **Lateral (desktop):** itens de 46px, ícone 19px + texto 0.875rem peso 500 em cinza. Ativo ganha fundo de vidro, texto grafite e um traço azul de 3×14px à esquerda.
- **Dock (celular):** pílula flutuante de vidro (raio 38px) presa embaixo com `safe-area`. Itens só com ícone; o ativo vira uma pílula escura (`--nav-active`) que revela o rótulo. No centro, um botão "+" redondo azul em gradiente abre um menu rápido em grade 2×2 com cauda apontando para ele. A dock some quando o teclado abre.

### Lista de lançamentos (signature)
Linhas de 76px: ícone em quadrado arredondado de 36px, nome e meta (categoria, conta, data) em duas linhas com reticências, valor alinhado à direita com sinal semântico. Separadas por linha suave; hover pinta a linha inteira com raio 14px.

### Detalhe do lançamento (signature)
Folha com brilho radial na cor da categoria (`--tx-color`) no topo, ícone grande de 68px, valor de 2.6rem centralizado, e um cartão de lista com os campos. Ações são botões redondos de 40px no topo.

## Do's and Don'ts

### Do:
- **Do** usar `stone-paper` como fundo do app e deixar os brilhos ambientes em 23% ou menos.
- **Do** separar seções com divisórias de 1px (`hairline`) e espaço de 28–46px antes de pensar em painel.
- **Do** escrever todo valor monetário em Manrope 500 com `tabular-nums` e tracking negativo proporcional ao tamanho.
- **Do** manter alvos de toque de pelo menos 44×44px (48px nos botões do rodapé de formulário no celular).
- **Do** definir cada cor nova nos dois temas, em `:root` e `:root.dark`, e conferir contraste AA.
- **Do** garantir que a tela funcione com `prefers-reduced-transparency` e `prefers-reduced-motion`, como o sistema já faz.
- **Do** usar as durações do sistema (140 / 200 / 300ms) com `cubic-bezier(.2,.7,.2,1)`.

### Don't:
- **Don't** usar o vidro como estrutura principal nem empilhar vidro sobre vidro.
- **Don't** introduzir um segundo acento de cor no app.
- **Don't** usar verde ou vermelho fora do sentido de receita, despesa ou erro.
- **Don't** usar peso 700 em números grandes; o sistema fala em 500.
- **Don't** misturar tokens `--lp-*` ou `--login-*` no painel, nem tokens do painel na landing.
- **Don't** usar branco puro como fundo de página no app.
- **Don't** criar texto menor que 0.55rem.
