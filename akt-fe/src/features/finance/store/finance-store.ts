import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import {
  CASH_ACCOUNT_BY_METHOD,
  CATEGORY_ACCOUNT,
} from "../data/ledger";
import {
  seedAccounts,
  seedCashEntries,
  seedFinanceTransactions,
  seedJournals,
} from "../data/seed";
import type {
  CashEntry,
  ChartOfAccount,
  FinanceTransaction,
  JournalEntry,
  JournalLine,
  JournalSourceType,
} from "../data/types";

export type JournalLineInput = {
  accountId: string;
  debit: number;
  credit: number;
};

type JournalInput = {
  date: string;
  description: string;
  reference?: string;
  lines: JournalLineInput[];
  sourceType: JournalSourceType;
  sourceId?: string;
  reversalOfId?: string;
};

type FinanceState = {
  accounts: ChartOfAccount[];
  journals: JournalEntry[];
  cashEntries: CashEntry[];
  transactions: FinanceTransaction[];
  addManualJournal: (input: {
    date: string;
    description: string;
    reference?: string;
    lines: JournalLineInput[];
  }) => JournalEntry | null;
  addSystemJournal: (input: {
    date: string;
    description: string;
    reference?: string;
    lines: JournalLineInput[];
    sourceType: JournalSourceType;
    sourceId: string;
  }) => JournalEntry | null;
  voidJournal: (id: string) => void;
  addTransaction: (
    input: Omit<FinanceTransaction, "id" | "number" | "createdAt">
  ) => FinanceTransaction;
  resetFinance: () => void;
};

function id() {
  return generateUUID();
}

function jakartaDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function audit(action: string, entityId: string, description: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "finance",
    entityId,
    actor: "Administrator",
    branch: "JKT-01",
    description,
  });
}

function buildJournal(
  accounts: ChartOfAccount[],
  count: number,
  input: JournalInput
): JournalEntry | null {
  const cleaned = input.lines.filter(
    (line) => line.debit > 0 || line.credit > 0
  );
  if (cleaned.length < 2) {
    return null;
  }
  if (cleaned.some((line) => line.debit > 0 && line.credit > 0)) {
    return null;
  }

  const lines: JournalLine[] = [];
  for (const line of cleaned) {
    const account = accounts.find((item) => item.id === line.accountId);
    if (!account || !account.isActive) {
      return null;
    }
    lines.push({
      id: id(),
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      debit: line.debit,
      credit: line.credit,
    });
  }

  const totalDebit = lines.reduce((total, line) => total + line.debit, 0);
  const totalCredit = lines.reduce((total, line) => total + line.credit, 0);
  if (totalDebit <= 0 || totalDebit !== totalCredit) {
    return null;
  }

  return {
    id: id(),
    number: `JE-2026-${String(1000 + count).padStart(6, "0")}`,
    date: input.date,
    description: input.description,
    status: "posted",
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    reference: input.reference,
    createdAt: new Date().toISOString(),
    reversalOfId: input.reversalOfId,
    lines,
  };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: seedAccounts,
      journals: seedJournals,
      cashEntries: seedCashEntries,
      transactions: seedFinanceTransactions,

      addManualJournal: (input) => {
        const entry = buildJournal(get().accounts, get().journals.length, {
          ...input,
          sourceType: "manual",
        });
        if (!entry) {
          return null;
        }
        set((state) => ({ journals: [entry, ...state.journals] }));
        audit(
          "journal.posted",
          entry.number,
          `Jurnal ${entry.number} diposting.`
        );
        return entry;
      },

      addSystemJournal: (input) => {
        const entry = buildJournal(get().accounts, get().journals.length, input);
        if (!entry) {
          return null;
        }
        set((state) => ({ journals: [entry, ...state.journals] }));
        audit(
          "journal.system_posted",
          entry.number,
          `Jurnal sistem ${entry.number} diposting.`
        );
        return entry;
      },

      voidJournal: (journalId) => {
        const journal = get().journals.find((item) => item.id === journalId);
        if (!journal || journal.status !== "posted") {
          return;
        }
        const reversal = buildJournal(
          get().accounts,
          get().journals.length,
          {
            date: jakartaDate(new Date().toISOString()),
            description: `Pembalik: ${journal.description}`,
            reference: journal.reference ?? journal.number,
            sourceType: journal.sourceType ?? "manual",
            sourceId: journal.id,
            reversalOfId: journal.id,
            lines: journal.lines.map((line) => ({
              accountId: line.accountId,
              debit: line.credit,
              credit: line.debit,
            })),
          }
        );

        set((state) => ({
          journals: [
            ...(reversal ? [reversal] : []),
            ...state.journals.map((item) =>
              item.id === journalId
                ? {
                    ...item,
                    status: "void" as const,
                    voidedAt: new Date().toISOString(),
                  }
                : item
            ),
          ],
        }));
        audit(
          "journal.voided",
          journal.number,
          reversal
            ? `Jurnal ${journal.number} dibatalkan dengan jurnal balik ${reversal.number}.`
            : `Jurnal ${journal.number} dibatalkan.`
        );
      },

      addTransaction: (input) => {
        const transactionId = id();
        const number = `TRX-2026-${String(
          1000 + get().transactions.length
        ).padStart(6, "0")}`;
        const cashAccountId = CASH_ACCOUNT_BY_METHOD[input.method];
        const category = CATEGORY_ACCOUNT[input.category];
        const lines: JournalLineInput[] =
          input.direction === "income"
            ? [
                { accountId: cashAccountId, debit: input.amount, credit: 0 },
                { accountId: category.accountId, debit: 0, credit: input.amount },
              ]
            : [
                { accountId: category.accountId, debit: input.amount, credit: 0 },
                { accountId: cashAccountId, debit: 0, credit: input.amount },
              ];

        const journal = buildJournal(get().accounts, get().journals.length, {
          date: jakartaDate(input.paidAt),
          description: input.description,
          reference: number,
          sourceType: input.kind,
          sourceId: transactionId,
          lines,
        });

        const transaction: FinanceTransaction = {
          ...input,
          id: transactionId,
          number,
          createdAt: new Date().toISOString(),
          journalEntryId: journal?.id,
        };

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          journals: journal ? [journal, ...state.journals] : state.journals,
        }));
        audit(
          transaction.kind === "deposit"
            ? "finance.deposit_created"
            : "finance.withdraw_created",
          transaction.number,
          `${transaction.kind === "deposit" ? "Deposit" : "Withdraw"} ${transaction.amount} dicatat.`
        );
        return transaction;
      },

      resetFinance: () =>
        set({
          accounts: seedAccounts,
          journals: seedJournals,
          cashEntries: seedCashEntries,
          transactions: seedFinanceTransactions,
        }),
    }),
    {
      name: "muranet-finance",
      skipHydration: true,
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<FinanceState>;
        const existingAccounts = Array.isArray(state.accounts)
          ? state.accounts
          : [];
        const existingIds = new Set(
          existingAccounts.map((account) => account.id)
        );
        const missingAccounts = seedAccounts.filter(
          (account) => !existingIds.has(account.id)
        );
        const accounts = [...existingAccounts, ...missingAccounts];
        const journals = Array.isArray(state.journals)
          ? [...state.journals]
          : [...seedJournals];
        const transactions = Array.isArray(state.transactions)
          ? state.transactions
          : seedFinanceTransactions;
        const normalizedTransactions = transactions.map((transaction) => {
          if (transaction.journalEntryId) {
            return transaction;
          }
          const cashAccountId = CASH_ACCOUNT_BY_METHOD[transaction.method];
          const category = CATEGORY_ACCOUNT[transaction.category];
          const lines: JournalLineInput[] =
            transaction.direction === "income"
              ? [
                  { accountId: cashAccountId, debit: transaction.amount, credit: 0 },
                  {
                    accountId: category.accountId,
                    debit: 0,
                    credit: transaction.amount,
                  },
                ]
              : [
                  {
                    accountId: category.accountId,
                    debit: transaction.amount,
                    credit: 0,
                  },
                  { accountId: cashAccountId, debit: 0, credit: transaction.amount },
                ];
          const journal = buildJournal(accounts, journals.length, {
            date: jakartaDate(transaction.paidAt),
            description: transaction.description,
            reference: transaction.number,
            sourceType: transaction.kind,
            sourceId: transaction.id,
            lines,
          });
          if (journal) {
            journals.push(journal);
            return { ...transaction, journalEntryId: journal.id };
          }
          return transaction;
        });

        return {
          ...state,
          accounts,
          journals,
          cashEntries: Array.isArray(state.cashEntries)
            ? state.cashEntries
            : seedCashEntries,
          transactions: normalizedTransactions,
        } as FinanceState;
      },
    }
  )
);
