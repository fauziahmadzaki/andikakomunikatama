export function currentPeriod(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(period: string, offset: number) {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export type BillingRunPeriodMode =
  | "unbilled"
  | "single"
  | "next"
  | "6months"
  | "1year";

export function periodsBetween(start: string, end: string) {
  if (!start || !end || start > end) {
    return [];
  }

  const periods: string[] = [];
  let current = start;

  while (current <= end && periods.length < 120) {
    periods.push(current);
    current = addMonths(current, 1);
  }

  return periods;
}

export function listPeriods(start: string, count: number) {
  const total = Math.max(1, Math.min(count, 60));
  return Array.from({ length: total }, (_, index) =>
    addMonths(start, index)
  );
}

export function periodEndDate(period: string) {
  const [year, month] = period.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${period}-${String(lastDay).padStart(2, "0")}`;
}

export function periodDueDate(period: string, dueDay: number) {
  const [year, month] = period.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(Math.max(1, dueDay), lastDay);
  return `${period}-${String(day).padStart(2, "0")}`;
}

export function formatPeriodLabel(period: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${period}-01`));
}

export function resolvePeriods({
  mode,
  startPeriod,
  count,
  subscriptionStart,
}: {
  mode: BillingRunPeriodMode;
  startPeriod: string;
  count: number;
  subscriptionStart: string;
}) {
  if (mode === "unbilled") {
    const start = subscriptionStart.slice(0, 7);
    const end = currentPeriod();
    return start <= end ? periodsBetween(start, end) : [start];
  }
  if (mode === "single") {
    return startPeriod ? [startPeriod] : [];
  }
  if (mode === "next") {
    return startPeriod
      ? listPeriods(startPeriod, Number.isFinite(count) && count > 0 ? count : 1)
      : [];
  }
  if (mode === "6months") {
    return startPeriod ? listPeriods(startPeriod, 6) : [];
  }
  return startPeriod ? listPeriods(startPeriod, 12) : [];
}
