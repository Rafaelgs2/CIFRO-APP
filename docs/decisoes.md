# CIFRO — decisões da primeira versão

Os arquivos fornecidos pelo usuário orientaram os requisitos do produto. Suas instruções de processo foram tratadas separadamente do pedido de criar o site.

- Nome definido pelo usuário em 13/09/2026: CIFRO. Interface em português do Brasil, com azul como cor principal, navegação inferior no celular e formulários em painéis acessíveis.
- Tema claro/escuro em todas as telas e componentes sobrepostos. O controle no topo usa a preferência do sistema na primeira visita; uma escolha manual fica salva neste navegador, sem alterar os registros financeiros.
- Identidade visual revisada a partir da referência fornecida: símbolo conectado da CIFRO, wordmark próprio, favicon e slogan “SUAS FINANÇAS MAIS CONECTADAS”. Inter é servida pelo próprio site; cores, tipografia, espaçamentos, raios, bordas, sombras e movimento usam tokens semânticos compartilhados nos temas claro e escuro.
- O resumo principal agrupa saldo, receitas e despesas em uma única superfície para estabelecer hierarquia entre os valores. Textos de interface são objetivos, cards comuns usam bordas sutis sem sombra e cores de estado ficam reservadas à semântica financeira.
- Uso individual. A versão local usa um único perfil de dados e não inclui autenticação. Uma futura publicação deverá definir sua própria estratégia de acesso antes de expor registros financeiros.
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
- Sem integração bancária, importação automática, orçamentos por categoria ou uso familiar.
- A exportação JSON permite guardar uma cópia dos registros. Importação e restauração automática não fazem parte desta versão.

## Verificação

Testes de cálculo incluem saldos por conta, salário/VR, transferências, parcelas com restos de centavos, fechamento no fim do ano, anos bissextos, pagamento parcial/integral, atraso, referências inválidas e pagamentos excedentes.

Os testes de interface devem verificar criação, edição, exclusão/cancelamento, filtros, metas, faturas, persistência e o layout em celular e desktop.

O teste de tema cobre as nove telas, formulários, seletores, confirmação, faturas e notificações, com larguras de 320/390 e 1440 pixels. Verifica operação pelo teclado, preferência do sistema, escolha salva após recarregar e retorno ao tema claro. Os dados usados ficam na demonstração temporária.
