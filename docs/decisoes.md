# CIRFRO — decisões da primeira versão

Os arquivos fornecidos pelo usuário orientaram os requisitos do produto. Suas instruções de processo foram tratadas separadamente do pedido de criar o site.

- Nome provisório: CIRFRO, seguindo o nome do projeto. Interface em português do Brasil, com azul como cor principal, navegação inferior no celular e formulários em painéis acessíveis.
- Uso individual. Publicação privada pela plataforma Sites. Cada registro é vinculado no servidor à identidade autenticada; não há compartilhamento financeiro na aplicação.
- Dados pessoais começam vazios. A demonstração é ativada explicitamente, identificada e mantida somente em memória; nunca é gravada junto aos registros pessoais.
- Armazenamento durável em Cloudflare D1. Um documento validado por usuário contém contas, cartões, lançamentos, categorias, compromissos e metas. A revisão do documento evita perda de atualizações concorrentes. Modelo simples para a primeira versão individual; um histórico muito grande poderá exigir tabelas normalizadas e paginação.
- Dinheiro calculado em centavos inteiros. Saldo inicial pertence à conta e não entra como receita. Transferências internas não entram em receitas nem despesas consolidadas.
- Uma compra no cartão é despesa integral na data da compra. Parcelas distribuem a obrigação de pagamento, com divisão exata dos centavos. Pagamentos de fatura reduzem a conta e a dívida sem duplicar despesas.
- Compras no dia do fechamento entram no ciclo seguinte. Vencimento menor ou igual ao fechamento é no mês seguinte ao fechamento. Dias inexistentes são limitados ao último dia do mês. Datas e saldos devem ser conferidos manualmente com a instituição.
- Faturas pagas, parcialmente pagas e atrasadas são calculadas a partir dos registros e da data de vencimento; não se pode marcar uma fatura paga sem informar o pagamento.
- Recorrência é apenas uma indicação editável. Nunca são criados registros automaticamente.
- Metas acompanham o saldo atual da conta selecionada. Compromissos somente movimentam o saldo ao confirmar o recebimento ou pagamento.
- Contas arquivadas mantêm o histórico e o saldo consolidado. Categorias excluídas exigem transferência dos registros para outra categoria do mesmo tipo.
- Fechamento mensal é uma revisão; não bloqueia nem modifica lançamentos.
- Sem integração bancária, importação automática, orçamentos por categoria ou uso familiar. O arquivo de prompt exclui orçamentos da primeira versão; o restante da seção de planejamento foi mantido.
- A exportação JSON permite guardar uma cópia dos registros. Importação e restauração automática não fazem parte desta versão.

## Verificação

Testes de cálculo incluem saldos por conta, salário/VR, transferências, parcelas com restos de centavos, fechamento no fim do ano, anos bissextos, pagamento parcial/integral, atraso, referências inválidas e pagamentos excedentes.

Testes no navegador a 390 × 844 verificam criação, edição, exclusão/cancelamento, filtros, metas, faturas e persistência. Também há verificação de layout no desktop a 1440 pixels. O teste de persistência usa exclusivamente o banco local de desenvolvimento e restaura seu estado anterior.

WebMCP: há uma ferramenta opcional de leitura do resumo do mês, ativada somente quando o navegador oferece `document.modelContext`. A validação nativa desse recurso depende de um navegador compatível; os fluxos comuns não dependem dele.
