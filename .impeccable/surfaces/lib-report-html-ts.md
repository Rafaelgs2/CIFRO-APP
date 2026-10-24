---
version: 1
slug: "lib-report-html-ts"
primary_target: "lib/report-html.ts"
related_targets: ["lib/report.ts","app/report-open.ts"]
---

# Relatórios HTML (mensal e completo)

Scope: the standalone HTML documents generated from the Relatórios tab (`lib/report-html.ts`, data in `lib/report.ts`, opened by `app/report-open.ts`). Visitor mode: **Read**.

Audience and job: the account owner reads it on the phone right after generating it, saves it as PDF (A4) to archive, and sometimes shares it with a partner, family member or accountant. First question it must answer: how did I close the period, and why.

Content that must stay: monthly: result, comparison with previous month, six-month history, categories (income and expense), accounts, card invoices with items, bills, goals, investments/reserve, full statement by day. Full: accumulated result, averages, best/worst month, month-by-month table, patrimony by account kind, accounts, categories, top expenses, cards, goals, bills summary, full statement by month. Demo label, generation date, escaping of user text, empty states.

Constraints: the app's visual system (DESIGN.md) — stone paper, glass panels, one blue, Manrope, the app's own icon set copied as SVG symbols. Financial rules from PRODUCT.md. No JavaScript beyond the print button. Self-contained file: inline CSS, Manrope from the app origin.

Rejected in exploration (2026-10-24): own-world directions (sticker album, banknote, concrete poetry) strayed from the app; calendar and money-flow structures lost to the balance line.

## Direction contract

THESIS: Linha do saldo. The report is told through the sum of all accounts over time: a step chart of the balance day by day (monthly) or a line of month-end balances (full), with numbered marks on the biggest moves. Refuses the hero-metric strip and a stack of same-size cards.

OWN-WORLD: CIFRO app tokens only. Stone-paper ground with faint ambient glows, translucent glass panels (20px), category icon badges in a wash of the category color, status pills with a drawn mark, Manrope 500 tabular numbers. Blue draws the balance; green and red only on money in and out.

STORY: The reader sees where the balance started and ended and the period's result, sees which moves shaped the line, reads a plain answer to why the balance moved differently from the result (card purchases, invoice payments, starting balances), then walks categories, history, accounts, cards, goals and a statement that carries the balance after every row.

FIRST VIEWPORT: Logo and demo tag, period meta, title, one sentence with start and end balance, the result with its leftover sentence, then the balance panel: chart beside a numbered list of the three biggest moves (stacked on phones). Generation date marked on the chart with the rest hatched as "ainda por vir".

FORM: Linha do saldo, structure 6 on the ordered list (dealt), seed:67bd6ac9adcda104. Signature: the running balance, from the chart to every statement row ("saldo igual" for transfers and card purchases). Motion grammar: none; the page is paper.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
