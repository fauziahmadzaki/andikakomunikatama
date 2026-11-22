"use client";

import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsPage } from "@/features/reports/hooks/useReportsPage";
import { formatRupiah } from "@/lib/format";

export function ReportsPage() {
  const {
    branches,
    branchFilter,
    setBranchFilter,
    stats,
    reports,
    exportReport,
  } = useReportsPage();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Laporan"
        description="Ringkasan operasional dan laporan per cabang."
      >
        <div className="w-48">
          <SelectField
            value={branchFilter}
            onValueChange={setBranchFilter}
            ariaLabel="Filter cabang laporan"
            options={[
              { value: "all", label: "Semua cabang" },
              ...branches.map((branch) => ({
                value: branch.name,
                label: branch.name,
              })),
            ]}
          />
        </div>
        <Button variant="outline" onPress={() => exportReport("Semua laporan")}>
          <DownloadIcon />
          Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pelanggan", value: stats.customers },
          { label: "Langganan aktif", value: stats.subscriptions },
          { label: "Pendapatan", value: formatRupiah(stats.revenue) },
          { label: "Outstanding", value: formatRupiah(stats.outstanding) },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.name} className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>{report.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {report.description}
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 p-5">
              <p className="text-sm font-medium">{report.value}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => exportReport(report.name)}
                >
                  <DownloadIcon />
                  Export
                </Button>
                <LinkButton href={report.href} size="sm">
                  Lihat
                </LinkButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
