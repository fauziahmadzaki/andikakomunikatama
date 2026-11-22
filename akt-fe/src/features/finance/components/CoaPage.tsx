"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { accountTypeLabel } from "@/features/finance/data/status";
import type { ChartOfAccount } from "@/features/finance/data/types";
import { useFinanceOverview } from "@/features/finance/hooks/useFinance";

export function CoaPage() {
  const { accounts } = useFinanceOverview();

  const columns: DataTableColumn<ChartOfAccount>[] = [
    {
      key: "code",
      header: "Kode",
      cell: (account) => (
        <span className="font-mono text-xs">{account.code}</span>
      ),
    },
    {
      key: "name",
      header: "Nama akun",
      cell: (account) => <span className="font-medium">{account.name}</span>,
    },
    {
      key: "type",
      header: "Tipe",
      cell: (account) => (
        <StatusBadge tone="primary">
          {accountTypeLabel[account.type]}
        </StatusBadge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (account) => (
        <StatusBadge tone={account.isActive ? "success" : "neutral"}>
          {account.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="Bagan akun untuk jurnal dan laporan keuangan."
      />
      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={accounts}
            columns={columns}
            getRowKey={(account) => account.id}
            ariaLabel="Chart of accounts"
            emptyMessage="Belum ada akun."
          />
        </CardContent>
      </Card>
    </div>
  );
}
