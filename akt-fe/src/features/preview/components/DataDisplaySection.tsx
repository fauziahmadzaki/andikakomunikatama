import {
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
  WifiIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { avatarUsers } from "@/features/preview/data/preview-data";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

const stats = [
  {
    label: "Pelanggan aktif",
    value: "1.284",
    helper: "+3,2% dari bulan lalu",
    icon: UsersIcon,
    tone: "bg-primary/10 text-primary",
  },
  {
    label: "Perangkat online",
    value: "96,4%",
    helper: "12 perangkat bermasalah",
    icon: WifiIcon,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    label: "Pendapatan bulan ini",
    value: "Rp 412 jt",
    helper: "+8,1% dari target",
    icon: WalletIcon,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
];

export function DataDisplaySection() {
  return (
    <PreviewSection
      id="data"
      title="Data"
      description="Kartu, avatar, dan pemisah untuk menyusun informasi ringkas dan mudah dipindai."
    >
      <PreviewSpecimen
        title="Card"
        description="CardHeader · CardContent · CardFooter"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>Ringkasan tagihan</CardTitle>
              <CardDescription>Periode November 2026</CardDescription>
              <CardAction>
                <Badge variant="secondary">Draft</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total tagihan</span>
                <span className="font-semibold">Rp 1.245.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sudah dibayar</span>
                <span className="font-semibold">Rp 980.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sisa</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  Rp 265.000
                </span>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Lihat detail</Button>
              <Button>Kirim tagihan</Button>
            </CardFooter>
          </Card>

          <Card size="sm" className="gap-0 py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle>Informasi jaringan</CardTitle>
              <CardDescription>Ringkasan singkat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Router aktif</span>
                <span className="font-medium">24</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">OLT terhubung</span>
                <span className="font-medium">6</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gangguan terbuka</span>
                <span className="font-medium">3</span>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost" size="sm">
                Buka jaringan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Kartu KPI"
        description="Statistik ringkas untuk dashboard"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="gap-0 py-0">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}
                  >
                    <stat.icon className="size-4" />
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUpIcon className="size-3 text-emerald-600 dark:text-emerald-400" />
                    {stat.helper}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Avatar"
        description="Ukuran · grup · badge · fallback"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>BS</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>DL</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <AvatarGroup>
              {avatarUsers.map((user) => (
                <Avatar key={user.name}>
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
            <p className="text-xs text-muted-foreground">
              AvatarGroup dan AvatarGroupCount untuk kolaborator.
            </p>
          </div>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Separator"
        description="Horizontal dan vertikal"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Bagian atas</p>
            <Separator />
            <p className="text-sm font-medium">Bagian bawah</p>
          </div>
          <div className="flex h-12 items-center gap-4 text-sm">
            <span>Ringkasan</span>
            <Separator orientation="vertical" />
            <span>Tagihan</span>
            <Separator orientation="vertical" />
            <span>Pembayaran</span>
          </div>
        </div>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
