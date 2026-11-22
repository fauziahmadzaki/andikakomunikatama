import type { SelectOption } from "@/components/shared/SelectField";

export const dashboardRangeOptions: SelectOption[] = [
  { value: "today", label: "Hari ini" },
  { value: "2-days", label: "2 hari ini" },
  { value: "week", label: "Seminggu ini" },
  { value: "month", label: "1 bulan ini" },
];

export const defaultDashboardRange = "today";
