"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { isCashAccount } from "@/features/finance/data/ledger";
import type {
  FinanceCategory,
  FinanceMethod,
  FinanceTransactionKind,
  JournalEntry,
  JournalSourceType,
} from "@/features/finance/data/types";
import type { JournalLineInput } from "@/features/finance/store/finance-store";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import type { PaymentMethod } from "@/features/payments/data/types";
import { recordServicePayment } from "@/features/payments/services/recordServicePayment";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

function jakartaDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function useFinanceOverview() {
  const accounts = useFinanceStore((state) => state.accounts);
  const journals = useFinanceStore((state) => state.journals);
  const cashEntries = useFinanceStore((state) => state.cashEntries);
  const transactions = useFinanceStore((state) => state.transactions);
  const branches = useBranchStore((state) => state.branches).filter(
    (branch) => branch.isActive
  );
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | FinanceTransactionKind>(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<"all" | FinanceCategory>(
    "all"
  );
  const [branchFilter, setBranchFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState<"all" | FinanceMethod>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const haystack = `${transaction.number} ${
          transaction.description
        } ${transaction.customerName ?? ""} ${
          transaction.payerName ?? ""
        } ${transaction.invoiceNumber ?? ""}`.toLowerCase();
        const matchesQuery =
          !query || haystack.includes(query.toLowerCase());
        const matchesKind =
          kindFilter === "all" || transaction.kind === kindFilter;
        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;
        const matchesBranch =
          branchFilter === "all" || transaction.branchId === branchFilter;
        const matchesMethod =
          methodFilter === "all" || transaction.method === methodFilter;
        const date = jakartaDate(transaction.paidAt);
        const matchesFrom = !dateFrom || date >= dateFrom;
        const matchesTo = !dateTo || date <= dateTo;
        return (
          matchesQuery &&
          matchesKind &&
          matchesCategory &&
          matchesBranch &&
          matchesMethod &&
          matchesFrom &&
          matchesTo
        );
      }),
    [
      branchFilter,
      categoryFilter,
      dateFrom,
      dateTo,
      kindFilter,
      methodFilter,
      query,
      transactions,
    ]
  );

  const revenue = filtered
    .filter((entry) => entry.direction === "income")
    .reduce((total, entry) => total + entry.amount, 0);
  const expense = filtered
    .filter((entry) => entry.direction === "outcome")
    .reduce((total, entry) => total + entry.amount, 0);

  function resetFilters() {
    setQuery("");
    setKindFilter("all");
    setCategoryFilter("all");
    setBranchFilter("all");
    setMethodFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  return {
    accounts,
    journals,
    cashEntries,
    transactions: filtered,
    allTransactions: transactions,
    branches,
    query,
    setQuery,
    kindFilter,
    setKindFilter,
    categoryFilter,
    setCategoryFilter,
    branchFilter,
    setBranchFilter,
    methodFilter,
    setMethodFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    stats: {
      revenue,
      expense,
      profit: revenue - expense,
      count: filtered.length,
      depositCount: filtered.filter((entry) => entry.kind === "deposit").length,
      withdrawCount: filtered.filter((entry) => entry.kind === "withdraw").length,
    },
  };
}

export type JournalLineForm = {
  accountId: string;
  debit: string;
  credit: string;
};

export function useJournalPage() {
  const journals = useFinanceStore((state) => state.journals);
  const accounts = useFinanceStore((state) => state.accounts);
  const addManualJournal = useFinanceStore(
    (state) => state.addManualJournal
  );
  const voidJournal = useFinanceStore((state) => state.voidJournal);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<JournalEntry | null>(null);
  const [confirmVoid, setConfirmVoid] = useState<JournalEntry | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JournalEntry["status"]>(
    "all"
  );
  const [accountFilter, setAccountFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | JournalSourceType>(
    "all"
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState<{
    date: string;
    description: string;
    reference: string;
    lines: JournalLineForm[];
  }>({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    reference: "",
    lines: [
      { accountId: "acc-1002", debit: "", credit: "" },
      { accountId: "acc-4001", debit: "", credit: "" },
    ],
  });

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map((account) => [account.id, account])),
    [accounts]
  );
  const activeAccounts = accounts.filter((account) => account.isActive);

  const filtered = useMemo(
    () =>
      journals.filter((journal) => {
        const haystack = `${journal.number} ${journal.description} ${
          journal.reference ?? ""
        }`.toLowerCase();
        const matchesQuery =
          !query || haystack.includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || journal.status === statusFilter;
        const matchesAccount =
          accountFilter === "all" ||
          journal.lines.some((line) => line.accountId === accountFilter);
        const matchesSource =
          sourceFilter === "all" || journal.sourceType === sourceFilter;
        const matchesFrom = !dateFrom || journal.date >= dateFrom;
        const matchesTo = !dateTo || journal.date <= dateTo;
        return (
          matchesQuery &&
          matchesStatus &&
          matchesAccount &&
          matchesSource &&
          matchesFrom &&
          matchesTo
        );
      }),
    [
      accountFilter,
      dateFrom,
      dateTo,
      journals,
      query,
      sourceFilter,
      statusFilter,
    ]
  );

  const stats = useMemo(() => {
    const totalDebit = filtered.reduce(
      (total, journal) =>
        total +
        journal.lines.reduce((sum, line) => sum + line.debit, 0),
      0
    );
    const totalCredit = filtered.reduce(
      (total, journal) =>
        total +
        journal.lines.reduce((sum, line) => sum + line.credit, 0),
      0
    );
    return {
      totalDebit,
      totalCredit,
      posted: filtered.filter((journal) => journal.status === "posted").length,
      voided: filtered.filter((journal) => journal.status === "void").length,
    };
  }, [filtered]);

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setAccountFilter("all");
    setSourceFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function setField<K extends "date" | "description" | "reference">(
    key: K,
    value: string
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setLine(index: number, key: keyof JournalLineForm, value: string) {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [key]: value } : line
      ),
    }));
  }

  function addLine() {
    setForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        { accountId: activeAccounts[0]?.id ?? "", debit: "", credit: "" },
      ],
    }));
  }

  function removeLine(index: number) {
    setForm((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  }

  function resetForm() {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      description: "",
      reference: "",
      lines: [
        { accountId: "acc-1002", debit: "", credit: "" },
        { accountId: "acc-4001", debit: "", credit: "" },
      ],
    });
  }

  function save() {
    if (!form.description.trim()) {
      toast.error("Deskripsi jurnal wajib diisi.");
      return;
    }
    const lines: JournalLineInput[] = form.lines
      .map((line) => ({
        accountId: line.accountId,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
      }))
      .filter((line) => line.accountId && (line.debit > 0 || line.credit > 0));

    if (lines.length < 2) {
      toast.error("Jurnal minimal memiliki dua baris.");
      return;
    }
    const totalDebit = lines.reduce((total, line) => total + line.debit, 0);
    const totalCredit = lines.reduce((total, line) => total + line.credit, 0);
    if (totalDebit <= 0 || totalDebit !== totalCredit) {
      toast.error("Total debit dan kredit harus sama.");
      return;
    }

    const entry = addManualJournal({
      date: form.date,
      description: form.description.trim(),
      reference: form.reference.trim() || undefined,
      lines,
    });
    if (!entry) {
      toast.error("Jurnal gagal disimpan. Periksa akun dan nominal.");
      return;
    }
    toast.success("Jurnal diposting.");
    setOpen(false);
    resetForm();
  }

  function confirmVoidJournal() {
    if (!confirmVoid) {
      return;
    }
    voidJournal(confirmVoid.id);
    toast.success("Jurnal dibatalkan dan jurnal balik dibuat.");
    setConfirmVoid(null);
  }

  return {
    journals: filtered,
    accounts,
    activeAccounts,
    accountsById,
    open,
    setOpen,
    form,
    setField,
    setLine,
    addLine,
    removeLine,
    save,
    detail,
    setDetail,
    confirmVoid,
    setConfirmVoid,
    confirmVoidJournal,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    accountFilter,
    setAccountFilter,
    sourceFilter,
    setSourceFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    stats,
  };
}

export type CashMovement = {
  id: string;
  journalId: string;
  journalNumber: string;
  date: string;
  description: string;
  reference?: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  direction: "in" | "out";
  amount: number;
  balance: number;
};

export function useCashLedger() {
  const journals = useFinanceStore((state) => state.journals);
  const accounts = useFinanceStore((state) => state.accounts);
  const cashAccounts = accounts.filter((account) =>
    isCashAccount(account.id)
  );
  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">(
    "all"
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detail, setDetail] = useState<CashMovement | null>(null);

  const movements = useMemo(() => {
    const balances = new Map<string, number>();
    const rows: CashMovement[] = [];
    const ordered = [...journals]
      .filter((journal) => journal.status === "posted")
      .sort((a, b) =>
        `${a.date}-${a.number}`.localeCompare(`${b.date}-${b.number}`)
      );

    for (const journal of ordered) {
      for (const line of journal.lines) {
        if (!isCashAccount(line.accountId)) {
          continue;
        }
        const signed = line.debit - line.credit;
        const balance = (balances.get(line.accountId) ?? 0) + signed;
        balances.set(line.accountId, balance);
        rows.push({
          id: line.id,
          journalId: journal.id,
          journalNumber: journal.number,
          date: journal.date,
          description: journal.description,
          reference: journal.reference,
          accountId: line.accountId,
          accountCode: line.accountCode,
          accountName: line.accountName,
          direction: signed >= 0 ? "in" : "out",
          amount: Math.abs(signed),
          balance,
        });
      }
    }

    return rows.sort((a, b) =>
      `${b.date}-${b.journalNumber}`.localeCompare(
        `${a.date}-${a.journalNumber}`
      )
    );
  }, [journals]);

  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    const ordered = [...journals]
      .filter((journal) => journal.status === "posted")
      .sort((a, b) =>
        `${a.date}-${a.number}`.localeCompare(`${b.date}-${b.number}`)
      );
    for (const journal of ordered) {
      for (const line of journal.lines) {
        if (!isCashAccount(line.accountId)) {
          continue;
        }
        balances.set(
          line.accountId,
          (balances.get(line.accountId) ?? 0) + line.debit - line.credit
        );
      }
    }
    return cashAccounts.map((account) => ({
      account,
      balance: balances.get(account.id) ?? 0,
    }));
  }, [cashAccounts, journals]);

  const filtered = useMemo(
    () =>
      movements.filter((movement) => {
        const matchesQuery =
          !query ||
          `${movement.journalNumber} ${movement.description} ${
            movement.reference ?? ""
          }`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesAccount =
          accountFilter === "all" || movement.accountId === accountFilter;
        const matchesDirection =
          directionFilter === "all" || movement.direction === directionFilter;
        const matchesFrom = !dateFrom || movement.date >= dateFrom;
        const matchesTo = !dateTo || movement.date <= dateTo;
        return (
          matchesQuery &&
          matchesAccount &&
          matchesDirection &&
          matchesFrom &&
          matchesTo
        );
      }),
    [
      accountFilter,
      dateFrom,
      dateTo,
      directionFilter,
      movements,
      query,
    ]
  );

  const totalIn = filtered
    .filter((movement) => movement.direction === "in")
    .reduce((total, movement) => total + movement.amount, 0);
  const totalOut = filtered
    .filter((movement) => movement.direction === "out")
    .reduce((total, movement) => total + movement.amount, 0);

  function resetFilters() {
    setQuery("");
    setAccountFilter("all");
    setDirectionFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  return {
    movements: filtered,
    journals,
    cashAccounts,
    accountBalances,
    query,
    setQuery,
    accountFilter,
    setAccountFilter,
    directionFilter,
    setDirectionFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    detail,
    setDetail,
    stats: { totalIn, totalOut },
  };
}

function nowLocalInput() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
}

export function useDepositDialog({ onClose }: { onClose: () => void }) {
  const allCustomers = useCustomerStore((state) => state.customers);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const packages = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches).filter(
    (branch) => branch.isActive
  );
  const invoices = useBillingStore((state) => state.invoices);
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const [type, setType] = useState<"service" | "general">("service");
  const [branchId, setBranchId] = useState("all");
  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [paidAt, setPaidAt] = useState(nowLocalInput);
  const [proofFileName, setProofFileName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [markPending, setMarkPending] = useState(false);

  const customers = allCustomers.filter(
    (customer) => branchId === "all" || customer.branchId === branchId
  );
  const customer = allCustomers.find((item) => item.id === customerId);
  const subscription = subscriptions.find(
    (item) => item.customerId === customerId && item.status !== "terminated"
  );
  const plan = packages.find((item) => item.id === subscription?.planId);
  const outstandingInvoices = invoices
    .filter(
      (invoice) =>
        invoice.customerId === customerId &&
        invoice.status !== "void" &&
        invoice.total > invoice.paidAmount
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const invoice =
    outstandingInvoices.find((item) => item.id === invoiceId) ??
    outstandingInvoices[0];
  const outstanding = invoice ? invoice.total - invoice.paidAmount : 0;
  const effectiveAmount = mode === "full" ? outstanding : Number(amount) || 0;

  function selectCustomer(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    setInvoiceId("");
    setMode("full");
    setAmount("");
  }

  function save() {
    if (type === "service") {
      if (!customer || !subscription) {
        toast.error("Pilih pelanggan yang memiliki langganan aktif.");
        return;
      }
      if (!paidAt) {
        toast.error("Waktu pembayaran wajib diisi.");
        return;
      }
      const result = recordServicePayment({
        customerId: customer.id,
        invoiceId: invoice?.id,
        mode,
        amount: effectiveAmount,
        method,
        paidAt,
        proofFileName: proofFileName || undefined,
        reference,
        notes,
        markPending,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.invoice.status === "paid"
          ? "Pembayaran lunas dicatat."
          : markPending
            ? "Pembayaran pending dicatat. Verifikasi di menu Pembayaran layanan."
            : "Pembayaran sebagian dicatat. Tagihan masih belum lunas."
      );
      onClose();
      return;
    }

    const value = Number(amount);
    if (!payerName.trim()) {
      toast.error("Nama penyetor wajib diisi.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Nominal deposit tidak valid.");
      return;
    }
    if (!paidAt) {
      toast.error("Waktu deposit wajib diisi.");
      return;
    }

    const parsedPaidAt = new Date(paidAt);
    if (Number.isNaN(parsedPaidAt.getTime())) {
      toast.error("Waktu deposit tidak valid.");
      return;
    }

    addTransaction({
      kind: "deposit",
      category: "general_income",
      direction: "income",
      amount: value,
      paidAt: parsedPaidAt.toISOString(),
      method,
      branchId: branchId === "all" ? undefined : branchId,
      branchName:
        branchId === "all"
          ? undefined
          : branches.find((branch) => branch.id === branchId)?.name,
      payerName: payerName.trim(),
      description: notes.trim() || "Deposit umum",
      proofFileName: proofFileName || undefined,
    });
    toast.success("Deposit umum dicatat.");
    onClose();
  }

  return {
    type,
    setType,
    branches,
    branchId,
    setBranchId,
    customers,
    customerId,
    selectCustomer,
    customer,
    subscription,
    plan,
    outstandingInvoices,
    invoice,
    invoiceId,
    setInvoiceId,
    outstanding,
    mode,
    setMode,
    amount,
    setAmount,
    effectiveAmount,
    method,
    setMethod,
    paidAt,
    setPaidAt,
    proofFileName,
    setProofFileName,
    payerName,
    setPayerName,
    reference,
    setReference,
    notes,
    setNotes,
    markPending,
    setMarkPending,
    save,
  };
}

export function useWithdrawDialog({ onClose }: { onClose: () => void }) {
  const branches = useBranchStore((state) => state.branches).filter(
    (branch) => branch.isActive
  );
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const [category, setCategory] = useState<FinanceCategory>("salary");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [paidAt, setPaidAt] = useState(nowLocalInput);
  const [proofFileName, setProofFileName] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [notes, setNotes] = useState("");

  function save() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Nominal pengeluaran tidak valid.");
      return;
    }
    if (!notes.trim()) {
      toast.error("Catatan pengeluaran wajib diisi.");
      return;
    }
    if (!paidAt) {
      toast.error("Waktu pengeluaran wajib diisi.");
      return;
    }

    const parsedPaidAt = new Date(paidAt);
    if (Number.isNaN(parsedPaidAt.getTime())) {
      toast.error("Waktu pengeluaran tidak valid.");
      return;
    }

    addTransaction({
      kind: "withdraw",
      category,
      direction: "outcome",
      amount: value,
      paidAt: parsedPaidAt.toISOString(),
      method,
      branchId: branchId === "all" ? undefined : branchId,
      branchName:
        branchId === "all"
          ? undefined
          : branches.find((branch) => branch.id === branchId)?.name,
      description: notes.trim(),
      proofFileName: proofFileName || undefined,
    });
    toast.success("Withdraw dicatat.");
    onClose();
  }

  return {
    branches,
    category,
    setCategory,
    amount,
    setAmount,
    method,
    setMethod,
    paidAt,
    setPaidAt,
    proofFileName,
    setProofFileName,
    branchId,
    setBranchId,
    notes,
    setNotes,
    save,
  };
}
