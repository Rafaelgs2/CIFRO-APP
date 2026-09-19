# CIFRO — levantamento do modelo de dados atual

> Documento de contexto para reutilização em prompts futuros.
>
> Estado analisado em 18/09/2026. Este documento descreve o comportamento existente no código; não é uma proposta de banco de dados, schema futuro ou plano de implementação.

## Como usar este documento em outros prompts

Anexe ou cole este arquivo e informe qual tarefa deve ser executada a partir do estado atual aqui documentado. Para evitar que fatos existentes sejam confundidos com propostas, use uma instrução como:

```text
Use o levantamento anexado como fonte do estado atual do CIFRO.
Diferencie comportamento já implementado, inferências e decisões ainda abertas.
Não trate as decisões pendentes como se já estivessem aprovadas.
```

## Convenções do levantamento

- **Explícito:** definido ou validado diretamente pelo código.
- **Inferido:** conclusão baseada no uso feito pela interface.
- **Não encontrado:** não há implementação identificável no projeto analisado.
- Valores monetários são descritos em centavos quando se referem ao armazenamento.
- Caminhos de arquivo são relativos à raiz do repositório.

## Arquivos centrais

- `lib/finance.ts`: schemas, tipos, validação, cálculos e demonstração.
- `app/finance-main.tsx`: estado principal, carregamento, salvamento e filtros.
- `app/finance-form.tsx`: criação e edição das entidades financeiras.
- `app/finance-views.tsx`: contas, cartões, planejamento, relatórios, perfil e exclusões.
- `app/finance-dashboard.tsx`: resumo financeiro e valores derivados.
- `app/finance-ui.tsx`: apresentação de contas, transações e categorias.
- `app/money-input.tsx`: entrada de valores monetários.
- `app/api/finance/route.ts`: leitura e gravação do documento financeiro.
- `db/schema.ts` e `drizzle/0000_eminent_eddie_brock.sql`: persistência atual.
- `scripts/test-finance.mjs`: testes dos cálculos e validações principais.

# 1. Entidades encontradas

## 1.1 Documento financeiro agregado (`State`)

Toda a informação financeira persistida é representada por um único objeto.

| Campo | Tipo aparente | Obrigatório | Limite/observação |
|---|---|---:|---|
| `accounts` | `Account[]` | Sim | Máximo de 100 |
| `cards` | `Card[]` | Sim | Máximo de 100 |
| `transactions` | `Transaction[]` | Sim | Máximo de 20.000 |
| `categories` | `Category[]` | Sim | Máximo de 200 |
| `bills` | `Bill[]` | Sim | Máximo de 2.000 |
| `goals` | `Goal[]` | Sim | Máximo de 100 |
| `profile` | `{ name: string }` | Sim | Perfil sem ID |

Nenhum campo de entidade possui `default` no schema Zod. Os valores iniciais são aplicados por `emptyState()`, `baseTransaction()` ou pelos formulários.

## 1.2 Usuário e perfil

Não existe uma entidade de usuário persistida. O documento possui somente:

| Campo | Tipo aparente | Obrigatório | Observação |
|---|---|---:|---|
| `name` | `string`, até 60 caracteres | Sim estruturalmente | Pode ser vazio; o formulário aplica `trim()` |

A tela de login mantém `email` e `password` apenas em estado React. Ela valida formato/presença e navega para `/dashboard` depois de 850 ms. Não existe consulta à API, autenticação, sessão ou associação entre credenciais, perfil e dados financeiros.

Também não há efeito funcional para “Lembrar de mim”, recuperação de senha ou criação de conta.

Arquivos: `app/login-screen.tsx`, `app/finance-form.tsx`, `lib/finance.ts`.

## 1.3 Conta (`Account`)

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string`, 1–100 | Sim | Relações | UUID em novas contas |
| `name` | `string`, 1–100 | Sim | Exibição | Trimado pelo schema |
| `kind` | enum | Sim | Finalidade | `salary`, `vr`, `investment`, `reserve`, `other` |
| `initial` | inteiro em centavos | Sim | Saldo inicial | Aceita valor negativo |
| `date` | data `YYYY-MM-DD` válida | Sim | Referência do saldo | Movimentos anteriores são rejeitados |
| `archived` | `boolean` | Sim | Estado da conta | Arquivada continua nos cálculos |
| `order` | inteiro | Sim | Ordenação visual | Sem limite ou unicidade formal |

Padrão de criação: finalidade `salary`, saldo zero, data atual de São Paulo, `archived=false` e ordem igual à quantidade de contas.

Não existe exclusão de conta na interface. Existem edição, reordenação, arquivamento e reativação.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`, `app/finance-views.tsx`.

## 1.4 Cartão (`Card`)

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string`, 1–100 | Sim | Relações | UUID em novos cartões |
| `name` | `string`, 1–100 | Sim | Exibição | Trimado |
| `institution` | `string`, 1–100 | Sim | Emissor | Usa a mesma validação de nome |
| `limit` | inteiro positivo em centavos | Sim | Limite total | Não aceita zero |
| `closing` | inteiro de 1 a 31 | Sim | Dia de fechamento | Dia inexistente é ajustado ao fim do mês |
| `due` | inteiro de 1 a 31 | Sim | Dia de vencimento | Dia inexistente é ajustado ao fim do mês |
| `initial` | inteiro não negativo em centavos | Sim | Valor inicial utilizado | Não pode superar o limite |
| `initialMonth` | mês `YYYY-MM` | Sim | Fatura inicial | Representa apenas um mês inicial |

Padrões: fechamento no dia 3, vencimento no dia 10, valor inicial zero e mês corrente.

Não há relação direta entre cartão e conta. A conta aparece somente no lançamento de pagamento da fatura. Não existe exclusão ou arquivamento de cartão na interface.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`, `app/finance-views.tsx`.

## 1.5 Lançamento/transação (`Transaction`)

Receitas, despesas, transferências, compras e pagamentos de fatura compartilham a mesma estrutura.

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string` | Sim | Identidade | Ao contrário dos demais IDs, não tem tamanho mínimo/máximo |
| `type` | enum | Sim | Discriminador | `income`, `expense`, `transfer`, `purchase`, `payment` |
| `description` | `string`, 1–100 | Sim | Exibição e pesquisa | Pagamento pode receber descrição automática |
| `amount` | inteiro positivo em centavos | Sim | Valor | 1 a 99.999.999.999 centavos |
| `date` | data `YYYY-MM-DD` válida | Sim | Data efetiva | Comparada como string |
| `accountId` | `string` | Sim estruturalmente | Conta ou origem | Fica vazio em compras |
| `destinationId` | `string` | Sim estruturalmente | Destino | Fica vazio fora de transferências |
| `cardId` | `string` | Sim estruturalmente | Cartão | Fica vazio fora de compra/pagamento |
| `categoryId` | `string` | Sim estruturalmente | Categoria | Fica vazio em transferência/pagamento |
| `notes` | `string`, até 1.000 | Sim | Observações | Padrão vazio |
| `recurring` | `boolean` | Sim | Indicador | Não gera registros automaticamente |
| `installments` | inteiro de 1 a 48 | Sim | Parcelamento | Fica em 1 nos demais tipos |
| `invoiceMonth` | `string` | Sim estruturalmente | Fatura paga | Validado como `YYYY-MM` apenas em pagamentos |

### Regras por tipo

- `income`: conta e categoria de receita.
- `expense`: conta e categoria de despesa.
- `transfer`: conta de origem e destino diferentes.
- `purchase`: cartão e categoria de despesa; não possui conta.
- `payment`: conta, cartão e mês da fatura; não possui categoria.

O tipo não pode ser trocado pela interface durante a edição.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`.

## 1.6 Categoria (`Category`)

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string`, 1–100 | Sim | Relações | UUID em novas categorias |
| `name` | `string`, 1–100 | Sim | Exibição/filtros | Trimado |
| `type` | `income \| expense` | Sim | Compatibilidade | Compra usa categoria de despesa |
| `color` | hexadecimal `#RRGGBB` | Sim | Apresentação | Não participa de cálculos |
| `icon` | enum | Sim | Apresentação | Oito opções |
| `order` | inteiro | Sim | Ordenação | Gerenciado pelo frontend |

Ao excluir uma categoria, o usuário deve escolher outra categoria do mesmo tipo. Transações e compromissos são migrados para a categoria substituta antes da exclusão.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`, `app/finance-views.tsx`.

## 1.7 Compromisso (`Bill`)

No código chama-se `bill`; na interface representa conta a pagar ou a receber.

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string`, 1–100 | Sim | Identidade | UUID em novos compromissos |
| `name` | `string`, 1–100 | Sim | Descrição | Trimado |
| `amount` | inteiro positivo em centavos | Sim | Valor previsto | Não altera saldo enquanto pendente |
| `date` | data `YYYY-MM-DD` válida | Sim | Vencimento | Não vira a data da transação automaticamente |
| `type` | `income \| expense` | Sim | A receber/pagar | Define a categoria compatível |
| `accountId` | ID de conta | Sim | Conta prevista | Deve existir |
| `categoryId` | ID de categoria | Sim | Categoria prevista | Deve ter o mesmo tipo |
| `transactionId` | `string` | Sim estruturalmente | Quitação | String vazia significa pendente |

Ao confirmar pagamento ou recebimento, é criada uma transação com os mesmos valor, tipo, conta e categoria, mas com a data atual. O ID criado é gravado em `transactionId`.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`, `app/finance-views.tsx`.

## 1.8 Meta (`Goal`)

| Campo | Tipo aparente | Obrigatório | Origem/uso | Observações |
|---|---|---:|---|---|
| `id` | `string`, 1–100 | Sim | Identidade | UUID em novas metas |
| `name` | `string`, 1–100 | Sim | Exibição | Trimado |
| `target` | inteiro positivo em centavos | Sim | Valor-alvo | Não possui contribuições próprias |
| `accountId` | ID de conta | Sim | Fonte do progresso | Deve existir |
| `date` | data `YYYY-MM-DD` válida | Sim | Data desejada | Não dispara comportamento automático |

O progresso é calculado a partir do saldo completo e atual da conta escolhida, não apenas a partir de transferências posteriores à criação da meta.

Arquivos: `lib/finance.ts`, `app/finance-form.tsx`, `app/finance-views.tsx`.

## 1.9 Fatura e parcela

Faturas e parcelas são estruturas derivadas, não entidades persistidas.

Uma fatura calculada contém:

- `total`;
- `paid`;
- `remaining`;
- `due`;
- `closing`;
- `status`;
- `items`.

Cada parcela calculada contém:

- `month`;
- `amount`;
- `number`;
- referência à transação original.

## 1.10 Funcionalidades não encontradas

- Entidade de usuário e autenticação real.
- Orçamentos ou limites por categoria.
- Entidade de investimento; investimento é apenas `Account.kind = "investment"`.
- Entidade persistida de fatura ou parcela.
- Relação permanente entre cartão e conta.
- Configurações financeiras independentes.
- Moedas diferentes de BRL.
- Geração automática de recorrências.
- Patrimônio com ativos, passivos e dívidas.
- Integração bancária ou importação de dados.

# 2. Relações atuais

- `Transaction.accountId → Account.id`: receita, despesa, transferência de saída e pagamento.
- `Transaction.destinationId → Account.id`: destino da transferência.
- `Transaction.categoryId → Category.id`: receita, despesa e compra.
- `Transaction.cardId → Card.id`: compra e pagamento.
- `Transaction.invoiceMonth + cardId`: identificação da fatura paga.
- `Bill.accountId → Account.id`.
- `Bill.categoryId → Category.id`.
- `Bill.transactionId → Transaction.id`: marca compromisso quitado.
- `Goal.accountId → Account.id`.
- Fatura → compras do cartão cujas parcelas calculadas caem no mês.
- Fatura → pagamentos do mesmo cartão e `invoiceMonth`.
- Investimento/meta → conta; não há registro financeiro próprio.

Não existe relação direta entre:

- perfil/usuário e documento financeiro; o proprietário é fixo como `local`;
- cartão e conta de pagamento;
- compra e conta;
- parcela e registro persistido;
- categoria e proprietário;
- meta e transações específicas.

As relações são strings dentro do JSON. Não há chaves estrangeiras entre entidades financeiras no banco.

# 3. Regras financeiras atuais

## 3.1 Dinheiro

- Valores são inteiros em centavos.
- A exibição usa BRL e locale `pt-BR`, dividindo o inteiro por 100.
- O valor máximo geral é 99.999.999.999 centavos.
- Saldo inicial de conta pode ser negativo.
- O input monetário limita a entrada ao mesmo máximo.
- Valores negativos são habilitados no formulário somente para saldo inicial da conta.

## 3.2 Datas

- Datas são strings sem horário no formato `YYYY-MM-DD`.
- `today()` usa o timezone `America/Sao_Paulo`.
- Meses usam `YYYY-MM`.
- Dias inexistentes são reduzidos ao último dia do mês.
- Os filtros e cálculos comparam as strings de data lexicograficamente.

## 3.3 Saldo da conta

Regra explícita:

```text
saldo da conta =
  saldo inicial
  + receitas na conta
  - despesas na conta
  - transferências de saída
  - pagamentos de fatura
  + transferências recebidas
```

São considerados apenas lançamentos entre a data de referência da conta e a data final consultada. Antes da data de referência, o saldo retornado é zero.

Compras no cartão não alteram diretamente nenhuma conta. O saldo diminui quando um pagamento de fatura é registrado.

## 3.4 Saldo consolidado

```text
saldo nas contas = soma do saldo de todas as contas
```

Inclui contas arquivadas, investimentos e reserva. O código não nomeia esse valor como patrimônio.

## 3.5 Receitas, despesas e resultado

```text
receitas = soma de amount onde type = income
despesas = soma de amount onde type = expense ou purchase
resultado = receitas - despesas
```

Transferências e pagamentos de fatura não entram nos totais. A compra entra integralmente como despesa na data da compra, mesmo quando parcelada. O pagamento não cria uma segunda despesa.

Resultado mensal e variação do saldo usam bases diferentes: o resultado reconhece a compra; o saldo reconhece o pagamento.

## 3.6 Transferências

- Exigem origem e destino existentes e diferentes.
- A data deve ser igual ou posterior às datas de referência das duas contas.
- Reduzem a conta de origem e aumentam a de destino.
- Não alteram o saldo consolidado.
- Não entram como receita ou despesa.

## 3.7 Primeira fatura da compra

1. Começa no mês da compra.
2. Compra na data do fechamento ou depois avança um mês.
3. Se `due <= closing`, o vencimento pertence ao mês seguinte ao ciclo e ocorre mais um avanço.

## 3.8 Parcelamento

```text
base = floor(valor / parcelas)
resto = valor % parcelas
```

As primeiras `resto` parcelas recebem um centavo adicional. A soma das parcelas permanece exatamente igual ao valor original.

## 3.9 Fatura

```text
total = parcelas do mês + initial, se initialMonth for o mês
pago = pagamentos com o mesmo cardId e invoiceMonth
em aberto = total - pago
```

Status:

- `Paga`: restante menor ou igual a zero e total maior que zero;
- `Em atraso`: restante maior que zero e vencimento anterior à data atual;
- `Parcialmente paga`: houve pagamento;
- `Em aberto`: demais casos.

Pagamentos que superem o total recalculado da fatura são rejeitados.

## 3.10 Limite do cartão

```text
usado = initial + valor integral das compras - pagamentos
disponível = limit - usado
```

O valor integral de uma compra parcelada ocupa limite imediatamente. Pagamentos liberam limite. Exceder o limite gera apenas alerta visual; não bloqueia a compra. Apenas `initial > limit` é rejeitado.

## 3.11 Compromissos

- Compromisso pendente não altera saldo.
- Pagar/receber cria uma transação na data atual.
- O compromisso guarda o ID da transação.
- Excluir o compromisso preserva a transação.
- Excluir a transação vinculada limpa `transactionId` e torna o compromisso pendente novamente.
- Alterar compromisso já quitado não altera a transação anteriormente criada.

## 3.12 Edição e exclusão

- Edição substitui o registro de mesmo ID e recalcula os valores derivados.
- O estado completo é validado após cada alteração.
- Alterar/remover uma compra pode falhar se pagamentos existentes passarem a superar a fatura recalculada.
- Excluir receita, despesa, transferência ou pagamento desfaz seu impacto por recálculo.
- Excluir categoria exige migração para outra do mesmo tipo.
- Conta é arquivada, não excluída.
- Cartão não possui exclusão.
- Meta pode ser excluída sem afetar conta ou transações.

## 3.13 Filtros

Filtros existentes:

- mês padrão ou intervalo personalizado;
- texto em descrição, nome de categoria e observações;
- tipo;
- categoria;
- conta de origem ou destino;
- cartão;
- situação da fatura.

Os resumos usam os lançamentos filtrados. O saldo no fim do período usa todo o histórico até a data final, e não somente os registros filtrados.

## 3.14 Recorrência

`recurring` é apenas um marcador booleano exibido na interface. Não existem frequência, próxima ocorrência, data final ou criação automática.

# 4. Armazenamento atual

Já existe persistência em Cloudflare D1/SQLite, mas não há tabelas separadas por entidade financeira.

Tabela atual:

| Coluna | Tipo | Uso |
|---|---|---|
| `owner` | texto, chave primária | Sempre `local` |
| `data` | texto obrigatório | JSON do `State` completo |
| `revision` | inteiro obrigatório, padrão 1 | Concorrência otimista |

Fluxo atual:

- `GET /api/finance` lê a linha de `owner = "local"`.
- Se não houver linha, retorna `emptyState()`.
- `PUT /api/finance` recebe o estado completo e sua revisão.
- O estado é validado e serializado para JSON.
- O update só ocorre se a revisão no banco ainda corresponder à enviada.
- Conflito de revisão retorna HTTP 409.
- Corpo acima de 3 MB é rejeitado.
- Respostas usam `Cache-Control: private, no-store`.

No frontend:

- o documento permanece em estado React;
- cada alteração envia o documento inteiro;
- formulários editam uma cópia em memória;
- demonstração permanece somente em memória e nunca chama o `PUT`;
- exportação cria um arquivo JSON para download.

Não foi encontrado armazenamento financeiro em `localStorage`. A preferência de tema é separada e gerenciada pelo `next-themes`.

A API não valida o JSON durante o `GET`; a validação ocorre no `PUT`.

# 5. Dados derivados e calculados

| Dado | Lógica atual |
|---|---|
| Saldo por conta | Saldo inicial + entradas − saídas até uma data |
| Saldo consolidado | Soma dos saldos de todas as contas |
| Receitas/despesas/resultado | Totais por data e filtros |
| Atividade da conta | Recebido, gasto, transferido/pago e transferências recebidas |
| Primeira fatura | Data da compra, fechamento e vencimento |
| Parcelas | Divisão inteira exata, distribuindo o resto |
| Fatura | Parcelas do mês + abertura − pagamentos |
| Status da fatura | Restante, pagamentos, vencimento e data atual |
| Uso do cartão | Abertura + compras integrais − pagamentos |
| Limite disponível | Limite total − uso |
| Progresso da meta | Saldo atual da conta ÷ alvo |
| Compromissos do dashboard | Compromissos pendentes + faturas com saldo |
| Gastos por categoria | Despesas e compras agrupadas por categoria |
| Fluxo de seis meses | Receitas, despesas e saldo de cada mês |
| Comparação mensal | Resultado atual − resultado anterior |
| Situação do compromisso | `transactionId`, vencimento e data atual |

Faturas, parcelas, progresso, alertas de limite, status e resumos não são persistidos.

# 6. Mocks, dados iniciais e hardcodes

## 6.1 Categorias iniciais

`emptyState()` cria dez categorias fixas.

Despesas:

- Moradia;
- Alimentação;
- Transporte;
- Lazer;
- Saúde;
- Outros.

Receitas:

- Salário;
- Vale-refeição;
- Renda extra;
- Reembolso.

Os IDs são `cat-0` a `cat-9`, com ícones, cores e ordem fixos.

## 6.2 Demonstração

`demoState()` cria:

- quatro contas: salário, VR, investimentos e reserva;
- três cartões: Nubank, Inter e Mercado Pago;
- receitas, despesas, duas transferências, pagamento de fatura e compra em três parcelas;
- dois compromissos;
- duas metas;
- lançamentos resumidos nos dois meses anteriores.

Valores relevantes:

- contas iniciais: R$ 1.400, R$ 125, R$ 4.800 e R$ 3.500;
- cartões: limites de R$ 8.000, R$ 5.000 e R$ 3.000;
- faturas iniciais: R$ 1.240, R$ 325 e zero;
- metas: R$ 15.000 e R$ 10.000.

As datas são montadas em torno do mês informado. IDs principais são fixos; IDs de transação são UUIDs gerados a cada criação da demonstração.

## 6.3 Outros valores fixos

- Proprietário persistente: `local`.
- Cartão novo: fechamento 3 e vencimento 10.
- Transação nova: despesa, data atual e uma parcela.
- Conta nova: finalidade salário.
- Categoria nova: despesa, ícone `other` e cor `#6588da`.
- O teste financeiro possui fixtures próprias com datas de 2026; elas não são usadas em runtime.

# 7. Inconsistências e ambiguidades

1. **Login sem usuário real:** qualquer e-mail válido e senha não vazia levam ao mesmo documento `local`.
2. **Perfil sem identidade:** `profile` contém apenas nome e não se relaciona com proprietário, e-mail ou autenticação.
3. **Documento único:** entidades e relações vivem em JSON; o banco não conhece contas ou transações individualmente.
4. **Strings vazias como ausência:** campos irrelevantes ao subtipo continuam estruturalmente obrigatórios.
5. **Validação desigual de IDs:** `Transaction.id` não usa as restrições aplicadas aos demais IDs.
6. **Integridade condicional incompleta:** a interface limpa campos incompatíveis, mas o schema permite dados extras irrelevantes ao tipo.
7. **Duplicação entre compromisso e transação:** após quitação, valor, nome, conta e categoria podem divergir por edições posteriores.
8. **Recálculo histórico de faturas:** alterações em cartão ou compra afetam retroativamente todos os ciclos.
9. **Limite não impeditivo:** uma compra pode deixar o limite disponível negativo.
10. **Bases financeira e de caixa diferentes:** compra entra no resultado na data da compra; saldo da conta cai no pagamento.
11. **Filtro de status por cartão:** para compras, o status usa o mês selecionado, mesmo quando a compra não possui parcela naquela fatura.
12. **Fatura vazia “Em aberto”:** total zero, pago zero e restante zero resultam no status padrão `Em aberto`.
13. **Ciclos de vida diferentes:** contas arquivam, cartões não arquivam nem excluem, categorias migram referências e lançamentos são removidos.
14. **Conta arquivada permanece relacionada:** continua no consolidado, metas, compromissos e registros existentes.
15. **`initial` tem dois significados:** saldo de abertura da conta ou dívida/uso inicial do cartão.
16. **`date` tem vários significados:** data efetiva, referência de saldo, vencimento ou prazo da meta.
17. **Investimento não é entidade:** não existem ativo, quantidade, cotação, rentabilidade ou aporte identificado.
18. **Recorrência incompleta:** é apenas um rótulo booleano.
19. **Texto fixo na demonstração:** “Salário de setembro” pode ser usado mesmo quando a demonstração representa outro mês.
20. **Dois conversores monetários:** `cents()` existe em `lib/finance.ts`, mas os formulários usam `currencyTextToCents()`.
21. **Sem versão estrutural do JSON:** `revision` controla concorrência, não a versão do formato armazenado.
22. **Leitura sem validação:** um JSON persistido incompatível é retornado diretamente pelo `GET`.

# 8. Decisões de arquitetura ainda abertas

Esta seção registra perguntas pendentes; não representa decisões tomadas.

1. Qual será a entidade de usuário e como cada conjunto financeiro será associado ao proprietário?
2. O estado continuará como documento agregado ou as entidades terão persistência individual?
3. Como documentos já persistidos serão versionados e migrados?
4. “Lançamento” e “transação” continuarão sendo o mesmo conceito?
5. Como representar subtipos com conjuntos diferentes de campos?
6. Transferências serão um registro ou duas movimentações vinculadas?
7. O saldo continuará inteiramente derivado ou haverá snapshots/conciliações?
8. Como preservar histórico quando contas, cartões, compras ou regras de fechamento forem editados?
9. Compras, parcelas, faturas e pagamentos continuarão derivados ou terão identidade própria?
10. Qual será a relação entre cartão e conta de pagamento?
11. Os relatórios usarão regime de compra/competência, pagamento/caixa ou ambos?
12. Como representar recorrências e compromissos repetidos?
13. Planejamento incluirá orçamentos por categoria?
14. Como representar investimentos além de uma finalidade da conta?
15. Como distinguir saldo da conta, saldo disponível e patrimônio?
16. Qual política será aplicada a exclusão, arquivamento e referências históricas?
17. Categorias iniciais serão globais, copiadas por usuário ou categorias de sistema?
18. O sistema continuará exclusivamente em BRL e centavos inteiros?
19. Qual convenção será adotada para timezone, datas efetivas, vencimentos e fechamento?
20. Metas acompanharão todo o saldo da conta ou contribuições específicas?
21. Será necessário histórico de alterações, auditoria, importação e restauração?

# 9. Resumo para novos trabalhos

O modelo atual é um documento financeiro único, validado por Zod e persistido como JSON em uma linha do Cloudflare D1. Contas, cartões, categorias, compromissos e metas possuem IDs próprios; receitas, despesas, transferências, compras e pagamentos compartilham `Transaction`.

Saldos, faturas, parcelas, limite disponível, metas, relatórios e indicadores são calculados em tempo de execução. Dinheiro usa centavos inteiros e datas usam strings sem horário. A demonstração é separada e não é persistida.

O projeto já possui persistência, mas não possui autenticação real, propriedade por usuário, tabelas normalizadas, orçamento, investimento detalhado ou recorrência automática. Qualquer trabalho futuro deve preservar a distinção entre esse comportamento existente e as decisões ainda abertas listadas acima.
