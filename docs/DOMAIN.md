# Manager API Domain

This document describes the **business concepts and rules** of the Manager API. Technical structure lives in [ARCHITECTURE.md](ARCHITECTURE.md); rules for new code live in [CONVENTIONS.md](CONVENTIONS.md).

It grows by **one section per business module**. Today only the financial module exists.

Each rule is marked with one of three statuses:

| Status | Meaning |
|---|---|
| **Enforced** | Guaranteed today by validation, use cases or database constraints. |
| **Stored only** | Data is kept, but no rule depends on it. |
| **Open** | Not decided. Do not assume an answer; see [Section 2.10](#210-open-questions). |

---

## 1. Business Modules

| Module | Status | Section |
|---|---|---|
| Financial | Implemented | [Section 2](#2-financial) |
| Other business modules | Planned | Not documented yet |

---

## 2. Financial

### 2.1 Overview

The **ledger** is the unit of separation: an independent set of finances. Most financial records belong to exactly one ledger. A few catalogs are **shared** by all ledgers.

**Ownership (decided):** the system is **single-user for now** ([issue #19](https://github.com/HenriqueVon/manager-api/issues/19)). All ledgers belong to the same user, and any authenticated caller can access every ledger. Ledgers separate finances; they do not separate users. Multi-user support would require a new decision.

| Concept | Term (pt-BR) | Scope | API path (`/v1/api/...`) |
|---|---|---|---|
| Currency | Moeda | Shared | `financial/currencies` |
| Description | Descrição do lançamento | Shared | `financial/descriptions` |
| Payment method | Meio de pagamento | Shared | `financial/payment-methods` |
| Ledger | Ledger | — | `ledgers` |
| Bank account | Conta bancária | Ledger | `financial/bank-accounts` |
| Fund | Caixa | Ledger | `financial/funds` |
| Category | Plano de contas | Ledger | `financial/categories` |
| Entry | Contas a pagar e receber | Ledger | `financial/entries` |
| Fund transaction | Lançamento de caixa | Ledger | `financial/funds/transactions` |

### 2.2 Shared Catalogs

**Currency**: e.g. Euro, Dollar, Real.
- *Enforced:* `name` is unique (normalized to trimmed upper case).
- *Stored only:* `symbol`.
- Referenced by bank accounts and funds.

**Description**: the "what" of a movement, e.g. supermarket, electricity, water.
- *Enforced:* `description` is unique (normalized).
- Referenced by entries and fund transactions.

**Payment method**: e.g. Credit Card, Debit Card, MB Way, Cash.
- *Enforced:* `name` is unique (normalized).
- Not referenced by any other record yet (Open).

### 2.3 Ledger

- *Enforced:* `name` is unique (normalized, at least 5 characters). `type` is one of `FIAT`, `CRYPTO`, `MIXED`.
- *Stored only:* the meaning of `type`. Nothing restricts currencies or records by ledger type.
- *Enforced:* a ledger cannot be deleted while records belong to it.

### 2.4 Bank Account (Conta bancária)

A real account where money is held, e.g. Nubank, Itaú, Revolut, Binance.

- Belongs to a ledger; has a currency.
- *Enforced:* `name` is unique **across all ledgers** (normalized). See [Open questions](#210-open-questions).
- *Enforced:* `type` is `PERSONAL` or `BUSINESS`.
- *Stored only:* `balance` (optional decimal).

### 2.5 Fund (Caixa)

A pool of money with a purpose, e.g. basic expenses, emergency fund, vacation fund.

- Belongs to a ledger; has a currency.
- *Enforced:* `name` is unique **within the ledger** (normalized).
- *Stored only:* `balance` (optional decimal).

### 2.6 Category (Plano de contas)

A node of the chart of accounts, used to classify movements, e.g. Supermarket under Expenses.

- Belongs to a ledger. *Enforced:* `type` is `INCOME` or `EXPENSE`.
- Categories form a **hierarchy** through an optional parent. A category without a parent is a root category.
- *Enforced:* the parent belongs to the same ledger. A category that has subcategories cannot be deleted.
- *Enforced:* `name` is unique among siblings (same ledger and parent).
  - Known gaps, listed in [ARCHITECTURE.md §15](ARCHITECTURE.md#15-known-architectural-inconsistencies): duplicate root names are not blocked by the database, and create stores the non-normalized name.
- *Stored only:* `balance` (decimal, default 0).
- *Enforced:* a category cannot be its own parent (database `CHECK`) or be moved under one of its descendants (cycle). A subcategory has the same `type` as its parent: creating, moving or changing the `type` of a category that would break this is rejected (`409`).
  - The cycle and `type` checks are not atomic with the write. Rows created before this rule may already break the `type` rule; no data migration was done.

### 2.7 Entry (Contas a pagar e receber)

An amount to pay or to receive, with a due date.

- *Enforced:* `type` is `PAYABLE` or `RECEIVABLE`.
- *Enforced:* `amount` ≥ 0 and `amountPaid` ≥ 0, on create and update (`400` otherwise).
- Belongs to a ledger and references a description, a fund and a category. *Enforced:* the fund and the category belong to the entry's ledger.
- *Stored only:* `dueDate`, `paymentDate` (optional), `amountPaid` (default 0), `isMonthly`, `additionalDescription`. No rule links payment date, paid amount and amount, and `isMonthly` on its own triggers no recurrence: the entries of a repeating series are created by the monthly route below.
- *Installments:* `POST /financial/entries/installments` splits a total in 2 to 480 monthly entries, saved together (all or none). The first due date is the one sent, the others follow month by month and keep the day, or the last day of a shorter month (31/01, 28/02, 31/03). The amount is split in cents and the last installment takes the cents left over (4000 in 3: 1333.33, 1333.33, 1333.34). Each `additionalDescription` ends with its number: "<complement> 1/3", or just "1/3" without a complement. They are created unpaid and not monthly. There is no link between the installments afterwards: each one is a plain entry.
- *Monthly repetition:* `POST /financial/entries/monthly` repeats the same entry every month, `repeatCount` times (2 to 60, the first one included), saved together (all or none). Due dates follow the installment rule. Unlike installments, each entry keeps the full amount and the same `additionalDescription` (no number). They are created unpaid with `isMonthly` true. There is no link between them afterwards: each one is a plain entry.
- *Summary:* `GET /financial/entries/summary` sums `amount` and `amountPaid` of the entries that match `ledgerId`, `type` and the due-date range, with one group per type and currency (the currency of the entry fund), so currencies are never added together. With `ids` (1 to 100, comma separated) it sums only those entries, among the ones that match the other filters. The sums come from the database, not from a page of the list. `paid=true` or `paid=false` keeps only the entries with or without a payment date (the payment date is what marks an entry as paid).
- *Summary breakdowns:* `GET /financial/entries/summary/by-month` and `/by-category` give the same sums with one group per due-date month (YYYY-MM) or per category (the category of the entry, never a parent), type and currency; they take the same filters, except `ids`. `GET /financial/entries/summary/aging` gives what is still to pay or receive (`amount` minus `amountPaid`) of the entries without a payment date, by distance from today (the current UTC date) to the due date: overdue, 0 to 7, 8 to 30, 31 to 90 and more than 90 days; it takes only `ledgerId` and `type`.

### 2.8 Fund Transaction (Lançamento de caixa)

A movement of money in a fund, on a date, through a bank account.

- *Enforced:* exactly one of `amountCredit` / `amountDebit` is greater than 0 on create. Both are ≥ 0.
  - Known gap: on update, the rule is checked only when both amounts are sent ([ARCHITECTURE.md §15](ARCHITECTURE.md#15-known-architectural-inconsistencies)).
- Belongs to a ledger and references a description, a fund, a category and a bank account. *Enforced:* the fund, the category and the bank account belong to the transaction's ledger.
- *Stored only:* `transactionDate` (date only), `additionalDescription`.

### 2.9 Cross-Entity Rules

- **Same ledger.** A ledger-scoped record only references funds, categories and bank accounts of its own ledger (database constraints).
  - Violations return `409 CONFLICT`.
  - A referenced fund, category or bank account cannot be moved to another ledger.
- **No orphan deletes.** A record that is still referenced (ledger, currency, description, bank account, fund, category) cannot be deleted (`409`).
- **Bulk delete.** Every record has `POST <path>/bulk-delete` (`{ "ids": [...] }`, from 1 to 100 ids, a repeated id is deleted once; `204`). All or none, and the error lists the ids that stopped it in `ids`: `404` when some id does not exist (checked first), `409` when some record is still referenced (same rule as *No orphan deletes*). Entries, fund transactions and payment methods are not referenced by anything, so only `404` applies. A category with subcategories counts as referenced even when its subcategories are in the same call: delete them first. If a record becomes used between the check and the delete, the database refuses the whole delete: the API answers a `409` without `ids`, and nothing is deleted.
- **Normalized names.** Unique names are compared and stored trimmed and in upper case, e.g. `" europe "` → `EUROPE`. Known gap: category create, see [Section 2.6](#26-category-plano-de-contas).
- **Balances are not computed.** `balance` fields are stored as sent by the client. Entries and fund transactions do not update them (Open).

### 2.10 Open Questions

Decisions not taken yet. Do not implement an answer without a decision.

| Question | Current behavior |
|---|---|
| Should balances be derived from entries and fund transactions? | Balances are plain writable fields |
| Should bank account names be unique per ledger, like funds? | Unique across all ledgers |
| Where is the payment method used (e.g. on entries)? | Not referenced by any record |
| Must `amountPaid` ≤ `amount` on entries? | Not checked |
| What does `isMonthly` imply (recurrence)? | Stored only |
| Is `additionalDescription` required? | Optional on entries (missing or null, nullable in the database). Still required on fund transactions, undecided |
| Does the ledger `type` restrict currencies? | No restriction |

---

## 3. Adding a Business Module

When a new business module is added, add a section with the same shape:

1. **Overview:** what the module manages and its unit of separation, if any.
2. **Concepts:** one subsection per entity, with its rules marked Enforced / Stored only / Open.
3. **Cross-entity rules:** rules that span entities of the module, or other modules.
4. **Open questions:** decisions not taken yet.
