# CIFRO — plano de migração do estado JSON para o modelo relacional

> Próximo entregável após o desenho do banco. Este documento define o mapeamento de dados e os invariantes de aceitação; não contém SQL, migrations executáveis, alteração de API ou configuração de PostgreSQL.

## Objetivo

Migrar o documento financeiro atual (`State`), hoje salvo como um JSON único em `finance_state.data`, para o modelo relacional definido para PostgreSQL sem alterar a semântica financeira existente.

Fontes de referência:

- `docs/levantamento-modelo-dados-atual.md`;
- `lib/finance.ts`;
- a especificação relacional aprovada nesta conversa.

## Decisões assumidas nesta migração

1. Cada documento atual será migrado para um único `profiles.id`/`user_id` definido pelo processo de identidade futuro.
2. IDs legados de texto nunca serão reaproveitados como PKs. Todas as entidades destino recebem UUIDs.
3. Saldos, totais, limites utilizados, progresso e status não são importados como valores derivados.
4. Eventos históricos postados serão preservados; alterações posteriores usarão anulação ou reversão, não reescrita econômica.
5. Compras de cartão serão reconhecidas como despesa na data da compra; pagamento de fatura não criará uma segunda despesa.
6. O valor inicial de um cartão será importado como `opening_balance_amount_cents` de uma fatura, não como saldo no cartão.

## Preparação obrigatória

Antes de importar qualquer dado:

1. Validar o JSON de origem com a lógica equivalente a `validateState()`.
2. Definir o `user_id` de destino para o documento atualmente identificado como `owner = 'local'`.
3. Executar a importação em transação, por usuário, com rollback integral em caso de falha.
4. Criar uma estrutura transitória de rastreabilidade, por exemplo `legacy_import_map`, contendo `source_entity`, `source_id`, `target_table` e `target_id`.
5. Não iniciar migração se houver pagamentos de fatura que não possam ser associados à sua compra ou ao saldo inicial da fatura.

`legacy_import_map` é artefato operacional da importação; não pertence ao modelo financeiro definitivo.

## Mapeamento de entidades

| Origem atual | Destino relacional | Regra de transformação |
|---|---|---|
| `profile.name` | `profiles.display_name` | Copiar nome; string vazia torna-se `NULL` |
| `categories[]` | `categories` | Criar UUID, copiar nome, tipo, ícone, cor e ordem; `archived_at = NULL` |
| `accounts[]` | `financial_accounts` | Copiar nome, finalidade, saldo inicial, data de referência, ordem e arquivamento |
| `cards[]` | `credit_cards` | Copiar nome, instituição, limite, fechamento e vencimento |
| `cards[].initial` + `initialMonth` | `credit_card_invoices.opening_balance_amount_cents` | Criar ou localizar fatura de `initialMonth`; registrar a dívida inicial nessa fatura |
| transação `income` | `financial_events` + `account_entries` | Evento de receita, categoria de receita e uma entrada positiva na conta |
| transação `expense` | `financial_events` + `account_entries` | Evento de despesa, categoria de despesa e uma entrada negativa na conta |
| transação `transfer` | `financial_events` + duas `account_entries` + `transfers` | Uma perna negativa na origem, uma positiva no destino e vínculo explícito entre ambas |
| transação `purchase` | `financial_events` + `credit_card_transactions` + `credit_card_installments` | Evento de compra, parcelas exatas e faturas correspondentes |
| transação `payment` | `financial_events` + `account_entries` + `invoice_payments` | Evento de pagamento, saída negativa da conta e vínculo à fatura por cartão/mês |
| `bills[]` | `commitments` | Copiar valor, vencimento, conta e categoria; vincular `settled_event_id` quando houver transação quitadora |
| `goals[]` | `goals` | Copiar nome, alvo, conta e data desejada |
| `recurring` | — | Não importar como regra automática; pode ser preservado temporariamente em nota de migração até `recurring_transaction_rules` ser implementada |

## Ordem de importação

### 1. Perfil e mapas de ID

- Criar/associar o perfil do usuário.
- Inicializar `legacy_import_map`.
- Gerar UUIDs para todas as entidades legadas, inclusive quando o ID legado já parecer UUID.

### 2. Categorias e contas

- Importar categorias antes dos eventos, compromissos e regras futuras.
- Importar contas antes das entradas financeiras, metas e compromissos.
- Preservar `opening_balance_amount_cents` e `balance_as_of_date`; eles não são lançamentos de receita.

### 3. Cartões e faturas de abertura

- Importar cartões.
- Para cada cartão com `initial > 0`, criar a fatura correspondente a `initialMonth`.
- A data de ciclo deve ser calculada a partir de `closing` e `due`, usando a mesma regra atual: compra no dia do fechamento pertence ao ciclo seguinte e dias inexistentes são ajustados ao fim do mês.
- Registrar `initial` como saldo de abertura da fatura. Não criar compra fictícia para esse valor.

### 4. Eventos de conta e transferências

Importar `income`, `expense` e `transfer` em ordem cronológica estável:

- ordenar por `date` e, em caso de empate, pela posição original no array;
- criar o evento e suas entradas na mesma transação;
- em transferências, criar ambas as entradas e o detalhe `transfers` atomicamente.

### 5. Compras, faturas e parcelas

Para cada compra de cartão:

1. criar evento `credit_card_purchase`;
2. criar `credit_card_transactions` com valor total e quantidade de parcelas;
3. calcular a primeira fatura conforme fechamento/vencimento do cartão;
4. criar/localizar todas as faturas necessárias;
5. dividir centavos exatamente; as primeiras parcelas recebem o resto;
6. gravar cada `credit_card_installment` na fatura correspondente.

### 6. Pagamentos de fatura

Para cada transação `payment`:

1. localizar a fatura por `cardId` e `invoiceMonth`;
2. criar evento `credit_card_invoice_payment`;
3. criar entrada negativa na conta pagadora;
4. criar `invoice_payments` ligando evento, entrada e fatura;
5. validar que pagamentos não excedem o total da fatura naquele ponto da importação.

Compras devem ser importadas antes dos respectivos pagamentos, inclusive quando os arrays de origem não estiverem ordenados dessa forma.

### 7. Compromissos e metas

- Criar compromissos depois dos eventos para resolver `transactionId` em `settled_event_id`.
- Criar metas depois das contas.
- Compromisso quitado mantém sua transação real; não criar um novo evento durante a importação.

## Tratamento de casos de dados atuais

| Caso | Tratamento recomendado |
|---|---|
| Conta arquivada | Criar conta com `archived_at` preenchido; preservar movimentos e saldo |
| Categoria usada por registros | Importar normalmente; arquivamento só ocorre em ações futuras |
| Cartão sem compras, mas com `initial` | Criar fatura apenas com abertura manual |
| Compra parcelada | Persistir todas as parcelas e faturas futuras necessárias |
| Pagamento parcial | Criar um `invoice_payments`; saldo da fatura continua derivado |
| Pagamento integral | Criar um ou mais pagamentos; status futuro é derivado como pago |
| Pagamento que excede a fatura | Bloquear importação e reportar erro de origem |
| Compromisso com `transactionId` inexistente | Bloquear importação; o estado atual já deveria ser inválido |
| ID legado duplicado | Bloquear importação; o estado atual já deveria ser inválido |
| `recurring = true` | Registrar na auditoria de migração; não criar recorrência automática sem calendário |
| Demonstração | Não migrar para dados pessoais; importa-se somente o estado persistido real |

## Matriz de invariantes de aceitação

| Cenário | Resultado obrigatório |
|---|---|
| Receita de R$ 100 | Uma entrada `+10000`; saldo e patrimônio sobem R$ 100 |
| Despesa de R$ 100 | Uma entrada `-10000`; saldo e patrimônio caem R$ 100 |
| Transferência de R$ 100 | Duas entradas `-10000` e `+10000`; patrimônio e resultado não mudam |
| Compra no cartão de R$ 300 em 3x | Despesa total de R$ 300 na compra; três parcelas cuja soma é R$ 300; nenhuma saída em conta |
| Pagamento de fatura de R$ 100 | Conta cai R$ 100; passivo do cartão cai R$ 100; despesa e patrimônio não mudam |
| Saldo inicial de conta | Compõe saldo desde `balance_as_of_date`; não aparece como receita |
| Abertura de fatura | Compõe passivo inicial; não cria compra ou despesa fictícia |
| Estorno de R$ 50 | Evento compensatório vinculado; reduz despesa líquida e passivo em R$ 50 |
| Conta/cartão arquivado | Histórico e cálculos permanecem disponíveis |
| Usuários diferentes | Nenhuma FK cruzada ou leitura RLS entre usuários é possível |
| Importação repetida | Não duplica dados; falha de modo explícito ou é idempotente pelo mapa de importação |
| Falha no meio da importação | Nenhum dado parcial permanece gravado |

## Consultas de reconciliação após a importação

Para cada usuário migrado, comparar origem e destino em uma data de corte:

1. saldo de cada conta;
2. saldo consolidado das contas;
3. receitas, despesas e resultado por mês;
4. total, pago e saldo de cada fatura;
5. uso e limite disponível de cada cartão;
6. quantidade de categorias, contas, cartões, transações, compromissos e metas;
7. vínculos de compromissos quitados;
8. metas e saldo das contas observadas.

Diferenças devem interromper a migração daquele usuário. Não devem ser corrigidas por ajuste silencioso.

## Critérios para iniciar migrations reais

As migrations só devem começar depois de definidos:

1. provedor de PostgreSQL e mecanismo de autenticação;
2. origem do `profiles.id` e do `current_user_id()` para RLS;
3. estratégia de implantação paralela ao D1 atual;
4. janela de corte e política de rollback;
5. destino da tabela transitória de rastreabilidade;
6. política para documentos legados inválidos ou incompletos.

## Resultado deste passo

Com este plano, a próxima tarefa técnica pode começar pelo núcleo: `profiles`, `categories`, `financial_accounts`, `financial_events`, `account_entries` e `transfers`, acompanhados pelos testes da matriz de invariantes. Cartões entram depois desse núcleo estar reconciliado.
