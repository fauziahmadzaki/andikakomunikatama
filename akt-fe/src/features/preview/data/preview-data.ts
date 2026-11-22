import type { StatusTone } from "@/components/shared/StatusBadge";

export type ColorToken = {
  name: string;
  className: string;
};

export type ColorGroup = {
  title: string;
  description: string;
  tokens: ColorToken[];
};

export const brandColorGroups: ColorGroup[] = [
  {
    title: "MURANET Blue",
    description: "Identitas utama, aksi, dan state aktif.",
    tokens: [
      { name: "50", className: "bg-brand-blue-50" },
      { name: "100", className: "bg-brand-blue-100" },
      { name: "200", className: "bg-brand-blue-200" },
      { name: "300", className: "bg-brand-blue-300" },
      { name: "400", className: "bg-brand-blue-400" },
      { name: "500", className: "bg-brand-blue-500" },
      { name: "600", className: "bg-brand-blue-600" },
      { name: "700", className: "bg-brand-blue-700" },
      { name: "800", className: "bg-brand-blue-800" },
      { name: "900", className: "bg-brand-blue-900" },
      { name: "950", className: "bg-brand-blue-950" },
    ],
  },
  {
    title: "MURANET Red",
    description: "Hanya untuk aksi destruktif dan penanda bahaya.",
    tokens: [
      { name: "50", className: "bg-brand-red-50" },
      { name: "100", className: "bg-brand-red-100" },
      { name: "200", className: "bg-brand-red-200" },
      { name: "300", className: "bg-brand-red-300" },
      { name: "400", className: "bg-brand-red-400" },
      { name: "500", className: "bg-brand-red-500" },
      { name: "600", className: "bg-brand-red-600" },
      { name: "700", className: "bg-brand-red-700" },
      { name: "800", className: "bg-brand-red-800" },
      { name: "900", className: "bg-brand-red-900" },
      { name: "950", className: "bg-brand-red-950" },
    ],
  },
  {
    title: "Neutral",
    description: "Permukaan, teks, border, dan muted surface.",
    tokens: [
      { name: "50", className: "bg-brand-neutral-50" },
      { name: "100", className: "bg-brand-neutral-100" },
      { name: "200", className: "bg-brand-neutral-200" },
      { name: "300", className: "bg-brand-neutral-300" },
      { name: "400", className: "bg-brand-neutral-400" },
      { name: "500", className: "bg-brand-neutral-500" },
      { name: "600", className: "bg-brand-neutral-600" },
      { name: "700", className: "bg-brand-neutral-700" },
      { name: "800", className: "bg-brand-neutral-800" },
      { name: "900", className: "bg-brand-neutral-900" },
      { name: "950", className: "bg-brand-neutral-950" },
    ],
  },
];

export const semanticColorTokens: ColorToken[] = [
  { name: "background", className: "bg-background" },
  { name: "foreground", className: "bg-foreground" },
  { name: "card", className: "bg-card" },
  { name: "popover", className: "bg-popover" },
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "destructive", className: "bg-destructive" },
  { name: "border", className: "bg-border" },
  { name: "input", className: "bg-input" },
  { name: "ring", className: "bg-ring" },
  { name: "sidebar", className: "bg-sidebar" },
];

export const chartColorTokens: ColorToken[] = [
  { name: "chart-1", className: "bg-chart-1" },
  { name: "chart-2", className: "bg-chart-2" },
  { name: "chart-3", className: "bg-chart-3" },
  { name: "chart-4", className: "bg-chart-4" },
  { name: "chart-5", className: "bg-chart-5" },
];

export const typeScaleTokens = [
  {
    token: "text-display",
    label: "Display",
    className: "text-display",
    description: "3.5rem · 700 · -0.03em",
  },
  {
    token: "text-title",
    label: "Title",
    className: "text-title",
    description: "2.25rem · 700 · -0.02em",
  },
  {
    token: "text-subtitle",
    label: "Subtitle",
    className: "text-subtitle",
    description: "1.25rem · 600 · -0.01em",
  },
];

export const headingScaleTokens = [
  { label: "Heading 2", className: "text-3xl", size: "30px" },
  { label: "Heading 3", className: "text-2xl", size: "24px" },
  { label: "Heading 4", className: "text-xl", size: "20px" },
  { label: "Heading 5", className: "text-lg", size: "18px" },
  { label: "Heading 6", className: "text-base", size: "16px" },
];

export const radiusTokens = [
  { token: "rounded-sm", className: "rounded-sm" },
  { token: "rounded-md", className: "rounded-md" },
  { token: "rounded-lg", className: "rounded-lg" },
  { token: "rounded-xl", className: "rounded-xl" },
  { token: "rounded-2xl", className: "rounded-2xl" },
  { token: "rounded-3xl", className: "rounded-3xl" },
  { token: "rounded-4xl", className: "rounded-4xl" },
];

export const planOptions = [
  { value: "home-10", label: "Home 10 Mbps" },
  { value: "home-20", label: "Home 20 Mbps" },
  { value: "home-30", label: "Home 30 Mbps" },
  { value: "bisnis-50", label: "Bisnis 50 Mbps" },
];

export const previewPaymentMethods = [
  { value: "transfer", label: "Transfer bank" },
  { value: "cash", label: "Tunai di kantor" },
  { value: "qris", label: "QRIS" },
];

export const comboboxCustomers = [
  { id: "cust-001", name: "Budi Santoso" },
  { id: "cust-002", name: "Siti Rahmawati" },
  { id: "cust-003", name: "Agus Setiawan" },
  { id: "cust-004", name: "Dewi Lestari" },
  { id: "cust-005", name: "Rudi Hartono" },
];

export type PreviewCustomer = {
  id: string;
  name: string;
  plan: string;
  status: string;
  tone: StatusTone;
};

export const previewCustomers: PreviewCustomer[] = [
  {
    id: "CUST-001",
    name: "Budi Santoso",
    plan: "Home 20 Mbps",
    status: "Aktif",
    tone: "success",
  },
  {
    id: "CUST-002",
    name: "Siti Rahmawati",
    plan: "Home 30 Mbps",
    status: "Aktif",
    tone: "success",
  },
  {
    id: "CUST-003",
    name: "Agus Setiawan",
    plan: "Bisnis 50 Mbps",
    status: "Isolir",
    tone: "warning",
  },
  {
    id: "CUST-004",
    name: "Dewi Lestari",
    plan: "Home 20 Mbps",
    status: "Nonaktif",
    tone: "neutral",
  },
  {
    id: "CUST-005",
    name: "Rudi Hartono",
    plan: "Home 50 Mbps",
    status: "Draft",
    tone: "primary",
  },
];

export const avatarUsers = [
  { name: "Budi Santoso", initials: "BS" },
  { name: "Siti Rahmawati", initials: "SR" },
  { name: "Agus Setiawan", initials: "AS" },
  { name: "Dewi Lestari", initials: "DL" },
];
